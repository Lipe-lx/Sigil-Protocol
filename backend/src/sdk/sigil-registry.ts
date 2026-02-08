import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import idl from './idl/sigil_registry.json';

export class SigilRegistryClient {
  program: Program;
  provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(idl as Idl, this.provider);
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
      } as any)
      .rpc();
  }

  async initializeAuditor(): Promise<string> {
    const [auditorPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('auditor'), this.provider.wallet.publicKey.toBuffer()],
      this.program.programId
    );

    return await this.program.methods
      .initializeAuditor()
      .accounts({
        auditor: auditorPda,
        authority: this.provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      } as any)
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
      } as any)
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
      } as any)
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
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        systemProgram: web3.SystemProgram.programId,
      } as any)
      .rpc();
  }

  async stakeUsdc(amount: BN, usdcMint: PublicKey): Promise<string> {
    const auditorPda = this.deriveAuditorPda(this.provider.wallet.publicKey);
    const vaultPda = this.deriveVaultPda(usdcMint, auditorPda);
    const vaultAuthorityPda = this.deriveVaultAuthorityPda();
    
    // We need the associated token address. Since we are in the backend/node context, 
    // we can calculate it or pass it. 
    const [auditorTokenAccount] = PublicKey.findProgramAddressSync(
      [
        this.provider.wallet.publicKey.toBuffer(),
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(),
        usdcMint.toBuffer(),
      ],
      new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    );
    
    return await this.program.methods
        .stakeUsdc(amount)
        .accounts({
            auditor: auditorPda,
            auditorTokenAccount: auditorTokenAccount,
            vaultTokenAccount: vaultPda,
            vaultAuthority: vaultAuthorityPda,
            usdcMint: usdcMint,
            authority: this.provider.wallet.publicKey,
            tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            systemProgram: web3.SystemProgram.programId,
            rent: web3.SYSVAR_RENT_PUBKEY,
        } as any)
        .rpc();
  }

  async requestUnstake(): Promise<string> {
    const auditorPda = this.deriveAuditorPda(this.provider.wallet.publicKey);
    
    return await this.program.methods
        .requestUnstake()
        .accounts({
            auditor: auditorPda,
            authority: this.provider.wallet.publicKey,
        } as any)
        .rpc();
  }

  async withdrawStake(usdcMint: PublicKey): Promise<string> {
    const auditorPda = this.deriveAuditorPda(this.provider.wallet.publicKey);
    const vaultPda = this.deriveVaultPda(usdcMint, auditorPda);
    const vaultAuthorityPda = this.deriveVaultAuthorityPda();
    
    const [auditorTokenAccount] = PublicKey.findProgramAddressSync(
      [
        this.provider.wallet.publicKey.toBuffer(),
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(),
        usdcMint.toBuffer(),
      ],
      new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    );

    return await this.program.methods
        .withdrawStake()
        .accounts({
            auditor: auditorPda,
            auditorTokenAccount: auditorTokenAccount,
            vaultTokenAccount: vaultPda,
            vaultAuthority: vaultAuthorityPda,
            usdcMint: usdcMint,
            authority: this.provider.wallet.publicKey,
            tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        } as any)
        .rpc();
  }

  async getSkill(skillPda: PublicKey) {
    return await (this.program.account as any).skill.fetch(skillPda);
  }

  async getAllSkills() {
    return await (this.program.account as any).skill.all();
  }

  async getAllLogs() {
    try {
      const accounts = await (this.program.account as any).executionLog?.all();
      return accounts || [];
    } catch {
      return [];
    }
  }

  async getAuditor(auditorPda: PublicKey) {
    try {
      return await (this.program.account as any).auditor?.fetch(auditorPda);
    } catch {
      return null;
    }
  }

  async getAllAuditors() {
    try {
      const accounts = await (this.program.account as any).auditor?.all();
      return accounts || [];
    } catch {
      return [];
    }
  }

  async getRegistry() {
    const [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('registry_v1')],
        this.program.programId
    );
    try {
      return await (this.program.account as any).skillRegistry.fetch(registryPda);
    } catch (e) {
      try {
        return await (this.program.account as any).SkillRegistry.fetch(registryPda);
      } catch {
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

  deriveVaultPda(mint: PublicKey, auditor: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), mint.toBuffer(), auditor.toBuffer()],
        this.program.programId
    );
    return pda;
  }

  deriveVaultAuthorityPda(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault_authority')],
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
