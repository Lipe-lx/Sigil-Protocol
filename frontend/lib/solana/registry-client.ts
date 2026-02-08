import { Program, AnchorProvider, Idl, web3, BN } from '@coral-xyz/anchor';
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

  async stakeUsdc(
    auditorPda: PublicKey,
    auditorTokenAccount: PublicKey,
    vaultTokenAccount: PublicKey,
    vaultAuthorityPda: PublicKey,
    usdcMint: PublicKey,
    amount: BN
  ): Promise<string> {
    return await this.program.methods
      .stakeUsdc(amount)
      .accounts({
        auditor: auditorPda,
        auditorTokenAccount,
        vaultTokenAccount,
        vaultAuthority: vaultAuthorityPda,
        usdcMint,
        authority: this.provider.wallet.publicKey,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      } as any)
      .rpc();
  }

  async requestUnstake(auditorPda: PublicKey): Promise<string> {
    return await this.program.methods
      .requestUnstake()
      .accounts({
        auditor: auditorPda,
        authority: this.provider.wallet.publicKey,
      } as any)
      .rpc();
  }

  async withdrawStake(
    auditorPda: PublicKey,
    auditorTokenAccount: PublicKey,
    vaultTokenAccount: PublicKey,
    vaultAuthorityPda: PublicKey,
    usdcMint: PublicKey
  ): Promise<string> {
    return await this.program.methods
      .withdrawStake()
      .accounts({
        auditor: auditorPda,
        auditorTokenAccount,
        vaultTokenAccount,
        vaultAuthority: vaultAuthorityPda,
        usdcMint,
        authority: this.provider.wallet.publicKey,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      } as any)
      .rpc();
  }

  async getAuditor(auditorPda: PublicKey) {
    try {
      return await (this.program.account as any).auditor.fetch(auditorPda);
    } catch {
      return null;
    }
  }

  async getAllAuditors() {
    try {
      return await (this.program.account as any).auditor.all();
    } catch {
      return [];
    }
  }

  // Helper to derive PDAs
  deriveAuditorPda(auditorPubkey: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('auditor'), auditorPubkey.toBuffer()],
      this.program.programId
    );
    return pda;
  }

  deriveVaultPda(usdcMint: PublicKey, auditorPda: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), usdcMint.toBuffer(), auditorPda.toBuffer()],
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
}
