import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { SigilRegistry } from './types';

export class SigilRegistryClient {
  program: Program<SigilRegistry>;
  provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    this.provider = new AnchorProvider(connection, wallet, {});
    // Note: We'll need the actual IDL or types. The Program constructor handles the conversion.
    // For now, we cast the imported types to any to satisfy the compiler if needed,
    // but in a real setup, anchor-cli generates these.
    this.program = new Program(null as any, this.provider); 
  }

  async mintSkill(
    skillId: Buffer,
    priceUsdc: BN,
    ipfsHash: string,
    creatorSignature: Buffer
  ): Promise<string> {
    const [skillPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('skill'), skillId],
      this.program.programId
    );
    const [registryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      this.program.programId
    );

    const tx = await this.program.methods
      .mintSkill(
        Array.from(skillId),
        priceUsdc,
        ipfsHash,
        Array.from(creatorSignature)
      )
      .accounts({
        skill: skillPda,
        creator: this.provider.wallet.publicKey,
        registry: registryPda,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async getSkill(skillId: Buffer): Promise<any> {
    const [skillPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('skill'), skillId],
      this.program.programId
    );
    return await this.program.account.skill.fetch(skillPda);
  }

  async searchSkills(filters?: { minTrustScore?: number; maxPrice?: BN; }): Promise<any[]> {
    const skills = await this.program.account.skill.all();
    return skills
      .map(s => s.account)
      .filter(skill => {
        if (filters?.minTrustScore && (skill as any).trustScore < filters.minTrustScore) {
          return false;
        }
        if (filters?.maxPrice && (skill as any).priceUsdc.gt(filters.maxPrice)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (b as any).trustScore - (a as any).trustScore);
  }
}
