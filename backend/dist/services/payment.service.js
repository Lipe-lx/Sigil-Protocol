"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
// USDC Mint on Devnet
const DEFAULT_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
// Protocol treasury wallet
const DEFAULT_PROTOCOL_TREASURY = '3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo';
// Payment split ratios (must sum to 100)
const SPLIT_CREATOR = 70; // 70% to skill creator
const SPLIT_AUDITOR = 25; // 25% to auditors (distributed equally)
const SPLIT_PROTOCOL = 5; // 5% to protocol treasury
class PaymentService {
    constructor(connection, usdcMint, protocolTreasury) {
        this.connection = connection;
        this.usdcMint = new web3_js_1.PublicKey(usdcMint || DEFAULT_USDC_MINT);
        this.protocolTreasury = new web3_js_1.PublicKey(protocolTreasury || DEFAULT_PROTOCOL_TREASURY);
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
                address: this.protocolTreasury.toString(),
                amount: split.auditors,
                role: 'protocol',
            });
        }
        // Protocol gets 5%
        recipients.push({
            address: this.protocolTreasury.toString(),
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
            const preBalances = meta.preTokenBalances || [];
            const postBalances = meta.postTokenBalances || [];
            let transferAmount = 0;
            let sender = '';
            let recipient = '';
            for (const post of postBalances) {
                if (post.mint === this.usdcMint.toString()) {
                    const pre = preBalances.find(p => p.accountIndex === post.accountIndex && p.mint === post.mint);
                    const preAmount = pre?.uiTokenAmount?.uiAmount || 0;
                    const postAmount = post.uiTokenAmount?.uiAmount || 0;
                    const diff = postAmount - preAmount;
                    if (diff > 0) {
                        transferAmount = diff;
                        recipient = post.owner || '';
                    }
                    else if (diff < 0) {
                        sender = post.owner || '';
                    }
                }
            }
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
    async getUsdcTokenAccount(walletAddress) {
        const wallet = new web3_js_1.PublicKey(walletAddress);
        const ata = await (0, spl_token_1.getAssociatedTokenAddress)(this.usdcMint, wallet);
        return ata.toString();
    }
    buildPaymentRequirement(amount, recipient, description = 'Sigil Protocol skill execution') {
        const requirement = {
            network: 'solana:101',
            asset: 'usdc',
            amount: amount,
            recipient: recipient,
            scheme: 'exact',
            facilitator: 'https://api.cdp.coinbase.com/x402',
            description: description,
        };
        return Buffer.from(JSON.stringify(requirement)).toString('base64');
    }
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
    getProtocolTreasury() {
        return this.protocolTreasury.toString();
    }
    getUsdcMint() {
        return this.usdcMint.toString();
    }
}
exports.PaymentService = PaymentService;
