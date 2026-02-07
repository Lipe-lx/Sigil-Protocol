"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// USDC Mint on Devnet
const USDC_MINT = new web3_js_1.PublicKey(process.env.USDC_MINT || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');
// Protocol treasury wallet
const PROTOCOL_TREASURY = new web3_js_1.PublicKey(process.env.PROTOCOL_TREASURY || '8AufMHSUifpUu62ivSVBn7PfHBip7f5n8dhVNVyq24ws');
// Payment split ratios (must sum to 100)
const SPLIT_CREATOR = 70; // 70% to skill creator
const SPLIT_AUDITOR = 25; // 25% to auditors (distributed equally)
const SPLIT_PROTOCOL = 5; // 5% to protocol treasury
class PaymentService {
    constructor() {
        this.connection = new web3_js_1.Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
    }
    /**
     * Calculate payment split for a given total amount
     */
    calculateSplit(totalUsdc, auditorCount = 1) {
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
    getSplitRecipients(totalUsdc, creatorAddress, auditorAddresses = []) {
        const split = this.calculateSplit(totalUsdc, auditorAddresses.length);
        const recipients = [];
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
        }
        else {
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
    async verifyPayment(signature, expectedRecipient, expectedAmount, tolerancePercent = 1) {
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
                    const pre = preBalances.find(p => p.accountIndex === post.accountIndex && p.mint === post.mint);
                    const preAmount = pre?.uiTokenAmount?.uiAmount || 0;
                    const postAmount = post.uiTokenAmount?.uiAmount || 0;
                    const diff = postAmount - preAmount;
                    if (diff > 0) {
                        // This account received tokens
                        transferAmount = diff;
                        recipient = post.owner || '';
                    }
                    else if (diff < 0) {
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
        }
        catch (error) {
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
    async getUsdcTokenAccount(walletAddress) {
        const wallet = new web3_js_1.PublicKey(walletAddress);
        const ata = await (0, spl_token_1.getAssociatedTokenAddress)(USDC_MINT, wallet);
        return ata.toString();
    }
    /**
     * Build x402 payment requirement header
     */
    buildPaymentRequirement(amount, recipient, description = 'Sigil Protocol skill execution') {
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
    parsePaymentSignature(header) {
        try {
            const decoded = Buffer.from(header, 'base64').toString('utf-8');
            const parsed = JSON.parse(decoded);
            return {
                signature: parsed.signature || parsed.txSignature,
                sender: parsed.sender || parsed.payer,
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Get protocol treasury address
     */
    getProtocolTreasury() {
        return PROTOCOL_TREASURY.toString();
    }
    /**
     * Get USDC mint address (devnet)
     */
    getUsdcMint() {
        return USDC_MINT.toString();
    }
}
exports.PaymentService = PaymentService;
// Singleton instance
exports.paymentService = new PaymentService();
