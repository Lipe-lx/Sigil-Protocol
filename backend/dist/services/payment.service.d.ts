import { Connection } from '@solana/web3.js';
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
export declare class PaymentService {
    private connection;
    private usdcMint;
    private protocolTreasury;
    constructor(connection: Connection, usdcMint?: string, protocolTreasury?: string);
    /**
     * Calculate payment split for a given total amount
     */
    calculateSplit(totalUsdc: number, auditorCount?: number): PaymentSplit;
    /**
     * Get detailed split recipients with amounts
     */
    getSplitRecipients(totalUsdc: number, creatorAddress: string, auditorAddresses?: string[]): SplitRecipient[];
    /**
     * Verify a USDC payment transaction on-chain
     */
    verifyPayment(signature: string, expectedRecipient: string, expectedAmount: number, tolerancePercent?: number): Promise<PaymentVerification>;
    getUsdcTokenAccount(walletAddress: string): Promise<string>;
    buildPaymentRequirement(amount: number, recipient: string, description?: string): string;
    parsePaymentSignature(header: string): {
        signature: string;
        sender: string;
    } | null;
    getProtocolTreasury(): string;
    getUsdcMint(): string;
}
