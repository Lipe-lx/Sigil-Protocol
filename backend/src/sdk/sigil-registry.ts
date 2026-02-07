import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { SigilRegistry } from './types';
import idl from './idl/sigil_registry.json';

export class SigilRegistryClient {
  program: Program<SigilRegistry>;
  provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(idl as any, new PublicKey('BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe'), this.provider);
  }

  async initializeRegistry(): Promise<string> {
    const [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('registry_v1')],
        this.program.programId
    );

    return await this.program.methods
      .initializeRegistry()
      .accounts({
        registry: registryPda,
        authority: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async mintSkill(
    skillId: number[],
    priceUsdc: BN,
    ipfsHash: string,
    creatorSignature: number[]
  ): Promise<string> {
    const [skillPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('skill'), Buffer.from(skillId)],
      this.program.programId
    );
    const [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('registry_v1')],
        this.program.programId
    );

    return await this.program.methods
      .mintSkill(skillId, priceUsdc, ipfsHash, creatorSignature)
      .accounts({
        skill: skillPda,
        creator: this.provider.wallet.publicKey,
        registry: registryPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async addAuditorSignature(
    skillPda: PublicKey,
    auditorPda: PublicKey,
    signature: number[],
    auditReportHash: string
  ): Promise<string> {
    return await this.program.methods
      .addAuditorSignature(signature, auditReportHash)
      .accounts({
        skill: skillPda,
        auditor: auditorPda,
        auditorSigner: this.provider.wallet.publicKey,
      })
      .rpc();
  }

  async logExecution(
    skillPda: PublicKey,
    executionLogPda: PublicKey,
    executorUsdc: PublicKey,
    creatorUsdc: PublicKey,
    protocolUsdc: PublicKey,
    success: boolean,
    latencyMs: number
  ): Promise<string> {
    return await this.program.methods
      .logExecution(success, latencyMs)
      .accounts({
        skill: skillPda,
        executionLog: executionLogPda,
        executor: this.provider.wallet.publicKey,
        executorUsdc,
        creatorUsdc,
        protocolUsdc,
        tokenProgram: web3.PublicKey.default, // Needs spl-token program id
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async getSkill(skillPda: PublicKey) {
    return await this.program.account.skill.fetch(skillPda);
  }

  async getAllSkills() {
    return await this.program.account.skill.all();
  }

  async getAllLogs() {
    // ExecutionLog account may not be defined in current IDL
    // Return empty array for MVP - logs are tracked via transaction history
    try {
      // Try to fetch if account exists
      const accounts = await (this.program.account as any).executionLog?.all();
      return accounts || [];
    } catch {
      console.warn('ExecutionLog account not available in current program version');
      return [];
    }
  }

  async getAuditor(auditorPda: PublicKey) {
    // Auditor account may not be defined in current IDL
    try {
      return await (this.program.account as any).auditor?.fetch(auditorPda);
    } catch {
      console.warn('Auditor account not available in current program version');
      return null;
    }
  }

  async getAllAuditors() {
    // Auditor account may not be defined in current IDL
    try {
      const accounts = await (this.program.account as any).auditor?.all();
      return accounts || [];
    } catch {
      console.warn('Auditor account not available in current program version');
      return [];
    }
  }

  async getRegistry() {
    const [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('registry_v1')],
        this.program.programId
    );
    try {
      // Account names in Anchor are camelCase versions of the struct name
      return await (this.program.account as any).skillRegistry.fetch(registryPda);
    } catch (e) {
      // Try PascalCase as fallback
      try {
      return await (this.program.account as any).skillRegistry.fetch(registryPda);
      } catch {
        console.warn('Registry not initialized');
        return null;
      }
    }
  }

  // Helper to derive PDAs
  deriveSkillPda(skillId: number[] | Uint8Array): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('skill'), Buffer.from(skillId)],
      this.program.programId
    );
    return pda;
  }

  deriveAuditorPda(auditorPubkey: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('auditor'), auditorPubkey.toBuffer()],
      this.program.programId
    );
    return pda;
  }

  deriveExecutionLogPda(skillPda: PublicKey, executor: PublicKey, timestamp: BN): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('execution'),
        skillPda.toBuffer(),
        executor.toBuffer(),
        timestamp.toArrayLike(Buffer, 'le', 8)
      ],
      this.program.programId
    );
    return pda;
  }
}
