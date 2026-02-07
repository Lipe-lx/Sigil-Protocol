import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import * as dotenv from 'dotenv';

dotenv.config();

// USDC Mint on Devnet
const USDC_MINT = new PublicKey(process.env.USDC_MINT || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

// Protocol treasury wallet
const PROTOCOL_TREASURY = new PublicKey(process.env.PROTOCOL_TREASURY || '8AufMHSUifpUu62ivSVBn7PfHBip7f5n8dhVNVyq24ws');

// Payment split ratios (must sum to 100)
const SPLIT_CREATOR = 70;   // 70% to skill creator
const SPLIT_AUDITOR = 25;   // 25% to auditors (distributed equally)
const SPLIT_PROTOCOL = 5;   // 5% to protocol treasury

export interface PaymentSplit {
  creator: number;
  auditors: number;
  protocol: number;
  total: number;
}

export interface PaymentVerification {
  valid: boolean;
  signature: string;
  amount: number;
  sender: string;
  recipient: string;
  timestamp: number;
  error?: string;
}

export interface SplitRecipient {
  address: string;
  amount: number;
  role: 'creator' | 'auditor' | 'protocol';
}

export class PaymentService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 
      'confirmed'
    );
  }

  /**
   * Calculate payment split for a given total amount
   */
  calculateSplit(totalUsdc: number, auditorCount: number = 1): PaymentSplit {
    const creatorAmount = (totalUsdc * SPLIT_CREATOR) / 100;
    const auditorAmount = (totalUsdc * SPLIT_AUDITOR) / 100;
    const protocolAmount = (totalUsdc * SPLIT_PROTOCOL) / 100;

    return {
      creator: creatorAmount,
      auditors: auditorAmount,
      protocol: protocolAmount,
      total: totalUsdc,
    };
  }

  /**
   * Get detailed split recipients with amounts
   */
  getSplitRecipients(
    totalUsdc: number, 
    creatorAddress: string, 
    auditorAddresses: string[] = []
  ): SplitRecipient[] {
    const split = this.calculateSplit(totalUsdc, auditorAddresses.length);
    const recipients: SplitRecipient[] = [];

    // Creator gets 70%
    recipients.push({
      address: creatorAddress,
      amount: split.creator,
      role: 'creator',
    });

    // Auditors split 25% equally
    if (auditorAddresses.length > 0) {
      const perAuditor = split.auditors / auditorAddresses.length;
      auditorAddresses.forEach(addr => {
        recipients.push({
          address: addr,
          amount: perAuditor,
          role: 'auditor',
        });
      });
    } else {
      // If no auditors, protocol gets the auditor share
      recipients.push({
        address: PROTOCOL_TREASURY.toString(),
        amount: split.auditors,
        role: 'protocol',
      });
    }

    // Protocol gets 5%
    recipients.push({
      address: PROTOCOL_TREASURY.toString(),
      amount: split.protocol,
      role: 'protocol',
    });

    return recipients;
  }

  /**
   * Verify a USDC payment transaction on-chain
   */
  async verifyPayment(
    signature: string,
    expectedRecipient: string,
    expectedAmount: number,
    tolerancePercent: number = 1
  ): Promise<PaymentVerification> {
    try {
      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) {
        return {
          valid: false,
          signature,
          amount: 0,
          sender: '',
          recipient: '',
          timestamp: 0,
          error: 'Transaction not found or not confirmed',
        };
      }

      // Get transaction metadata
      const timestamp = tx.blockTime || 0;
      
      // Parse token transfers from transaction
      // For SPL token transfers, we need to look at the inner instructions
      const meta = tx.meta;
      if (!meta) {
        return {
          valid: false,
          signature,
          amount: 0,
          sender: '',
          recipient: '',
          timestamp,
          error: 'Transaction metadata not available',
        };
      }

      // Check pre and post token balances to determine transfer
      const preBalances = meta.preTokenBalances || [];
      const postBalances = meta.postTokenBalances || [];

      // Find USDC transfers
      let transferAmount = 0;
      let sender = '';
      let recipient = '';

      for (const post of postBalances) {
        if (post.mint === USDC_MINT.toString()) {
          const pre = preBalances.find(
            p => p.accountIndex === post.accountIndex && p.mint === post.mint
          );
          
          const preAmount = pre?.uiTokenAmount?.uiAmount || 0;
          const postAmount = post.uiTokenAmount?.uiAmount || 0;
          const diff = postAmount - preAmount;

          if (diff > 0) {
            // This account received tokens
            transferAmount = diff;
            recipient = post.owner || '';
          } else if (diff < 0) {
            sender = post.owner || '';
          }
        }
      }

      // Validate recipient and amount
      const recipientMatch = recipient.toLowerCase() === expectedRecipient.toLowerCase();
      const minAmount = expectedAmount * (1 - tolerancePercent / 100);
      const maxAmount = expectedAmount * (1 + tolerancePercent / 100);
      const amountMatch = transferAmount >= minAmount && transferAmount <= maxAmount;

      if (!recipientMatch) {
        return {
          valid: false,
          signature,
          amount: transferAmount,
          sender,
          recipient,
          timestamp,
          error: `Recipient mismatch: expected ${expectedRecipient}, got ${recipient}`,
        };
      }

      if (!amountMatch) {
        return {
          valid: false,
          signature,
          amount: transferAmount,
          sender,
          recipient,
          timestamp,
          error: `Amount mismatch: expected ${expectedAmount} (+/- ${tolerancePercent}%), got ${transferAmount}`,
        };
      }

      return {
        valid: true,
        signature,
        amount: transferAmount,
        sender,
        recipient,
        timestamp,
      };

    } catch (error: any) {
      return {
        valid: false,
        signature,
        amount: 0,
        sender: '',
        recipient: '',
        timestamp: 0,
        error: error.message || 'Unknown error verifying payment',
      };
    }
  }

  /**
   * Get USDC Associated Token Account for a wallet
   */
  async getUsdcTokenAccount(walletAddress: string): Promise<string> {
    const wallet = new PublicKey(walletAddress);
    const ata = await getAssociatedTokenAddress(USDC_MINT, wallet);
    return ata.toString();
  }

  /**
   * Build x402 payment requirement header
   */
  buildPaymentRequirement(
    amount: number,
    recipient: string,
    description: string = 'Sigil Protocol skill execution'
  ): string {
    const requirement = {
      network: 'solana:101', // Devnet chain ID
      asset: 'usdc',
      amount: amount,
      recipient: recipient,
      scheme: 'exact',
      facilitator: 'https://api.cdp.coinbase.com/x402',
      description: description,
    };

    return Buffer.from(JSON.stringify(requirement)).toString('base64');
  }

  /**
   * Parse x402 payment signature from header
   */
  parsePaymentSignature(header: string): { signature: string; sender: string } | null {
    try {
      const decoded = Buffer.from(header, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      return {
        signature: parsed.signature || parsed.txSignature,
        sender: parsed.sender || parsed.payer,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get protocol treasury address
   */
  getProtocolTreasury(): string {
    return PROTOCOL_TREASURY.toString();
  }

  /**
   * Get USDC mint address (devnet)
   */
  getUsdcMint(): string {
    return USDC_MINT.toString();
  }
}

// Singleton instance
export const paymentService = new PaymentService();
