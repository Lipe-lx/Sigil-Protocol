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
    constructor();
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
    /**
     * Get USDC Associated Token Account for a wallet
     */
    getUsdcTokenAccount(walletAddress: string): Promise<string>;
    /**
     * Build x402 payment requirement header
     */
    buildPaymentRequirement(amount: number, recipient: string, description?: string): string;
    /**
     * Parse x402 payment signature from header
     */
    parsePaymentSignature(header: string): {
        signature: string;
        sender: string;
    } | null;
    /**
     * Get protocol treasury address
     */
    getProtocolTreasury(): string;
    /**
     * Get USDC mint address (devnet)
     */
    getUsdcMint(): string;
}
export declare const paymentService: PaymentService;
