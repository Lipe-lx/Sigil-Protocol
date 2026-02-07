import { Program, AnchorProvider, Idl, web3 } from '@coral-xyz/anchor';
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
      })
      .rpc();
  }
}
