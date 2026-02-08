import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { SigilRegistry } from './types';
export declare class SigilClient {
    program: Program<SigilRegistry>;
    provider: AnchorProvider;
    connection: Connection;
    constructor(connection: Connection, wallet: any);
    /**
     * High-level method to execute a skill and handle payments atomically.
     */
    executeSkill(skillPda: PublicKey, success: boolean, latencyMs: number): Promise<string>;
    /**
     * Registers a new skill with metadata compression and integrity hashing.
     */
    registerSkill(params: {
        name: string;
        description: string;
        priceUsdc: number;
        externalUrl?: string;
        logicContent?: string;
    }): Promise<string>;
    /**
     * Verifies if the local logic matches the on-chain recorded integrity hash.
     */
    verifyIntegrity(skillPda: PublicKey, localLogicContent: string): Promise<boolean>;
    /**
     * Auditor Staking Management
     */
    stake(amountUsdc: number): Promise<string>;
    deriveAuditorPda(authority: PublicKey): PublicKey;
    deriveVaultPda(mint: PublicKey, auditor: PublicKey): PublicKey;
    deriveVaultAuthorityPda(): PublicKey;
}
