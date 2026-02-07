import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
export declare class SigilRegistryClient {
    program: Program;
    provider: AnchorProvider;
    constructor(connection: Connection, wallet: any);
    initializeRegistry(): Promise<string>;
    mintSkill(skillId: number[], priceUsdc: BN, ipfsHash: string, creatorSignature: number[]): Promise<string>;
    addAuditorSignature(skillPda: PublicKey, auditorPda: PublicKey, signature: number[], auditReportHash: string): Promise<string>;
    logExecution(skillPda: PublicKey, executionLogPda: PublicKey, executorUsdc: PublicKey, creatorUsdc: PublicKey, protocolUsdc: PublicKey, success: boolean, latencyMs: number): Promise<string>;
    getSkill(skillPda: PublicKey): Promise<any>;
    getAllSkills(): Promise<any>;
    getAllLogs(): Promise<any>;
    getAuditor(auditorPda: PublicKey): Promise<any>;
    getAllAuditors(): Promise<any>;
    getRegistry(): Promise<any>;
    deriveSkillPda(skillId: number[] | Uint8Array): PublicKey;
    deriveAuditorPda(auditorPubkey: PublicKey): PublicKey;
    deriveExecutionLogPda(skillPda: PublicKey, executor: PublicKey, timestamp: BN): PublicKey;
}
