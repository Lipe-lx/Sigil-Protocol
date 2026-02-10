import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress 
} from '@solana/spl-token';
import { SigilRegistry } from './types';
import idl from './idl/sigil_registry.json';

export class SigilClient {
  program: Program<SigilRegistry>;
  provider: AnchorProvider;
  connection: Connection;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(idl as any, this.provider);
  }

  /**
   * High-level method to execute a skill and handle payments atomically.
   */
  async executeSkill(skillPda: PublicKey, success: boolean, latencyMs: number): Promise<string> {
    const skillData = await this.program.account.skill.fetch(skillPda);
    const creator = skillData.creator;
    const protocolTreasury = new PublicKey('3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo');
    const usdcMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

    const executorUsdc = await getAssociatedTokenAddress(usdcMint, this.provider.wallet.publicKey);
    const creatorUsdc = await getAssociatedTokenAddress(usdcMint, creator);
    const protocolUsdc = await getAssociatedTokenAddress(usdcMint, protocolTreasury);

    const executionLog = Keypair.generate();

    return await this.program.methods
      .logExecution(success, latencyMs)
      .accounts({
        skill: skillPda,
        executionLog: executionLog.publicKey,
        executor: this.provider.wallet.publicKey,
        usdcMint,
        executorUsdc,
        creatorUsdc,
        protocolUsdc,
      })
      .signers([executionLog])
      .rpc();
  }

  /**
   * Registers a new skill with metadata compression and integrity hashing.
   */
  async registerSkill(params: {
    name: string,
    description: string,
    priceUsdc: number,
    externalUrl?: string,
    logicContent?: string
  }): Promise<string> {
    const skillId = Array.from(crypto.getRandomValues(new Uint8Array(32)));
    const priceBN = new BN(params.priceUsdc * 1_000_000);

    // 1. Calculate Integrity Hash
    let integrityHash = "";
    if (params.logicContent) {
      const msgBuffer = new TextEncoder().encode(params.logicContent);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      integrityHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // 2. Prepare Metadata
    const metadataObj = {
      n: params.name,
      d: params.description,
      u: params.externalUrl,
      h: integrityHash
    };

    // 3. Compress using Gzip
    const metadataStr = JSON.stringify(metadataObj);
    const blob = new Blob([metadataStr]);
    const compressionStream = new (globalThis as any).CompressionStream('gzip');
    const compressedStream = blob.stream().pipeThrough(compressionStream);
    const compressedBuffer = await new Response(compressedStream).arrayBuffer();
    const finalMetadata = `gz:${Buffer.from(compressedBuffer).toString('base64')}`;

    // 4. Generate Signature
    let signature = Array(64).fill(0);
    if ((this.provider.wallet as any).signMessage) {
      const message = new TextEncoder().encode(`Minting Sigil Skill: ${params.name}`);
      const sig = await (this.provider.wallet as any).signMessage(message);
      signature = Array.from(sig);
    }

    const [skillPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('skill'), new Uint8Array(skillId)],
      this.program.programId
    );
    const [registryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry_v1')],
      this.program.programId
    );

    return await this.program.methods
      .mintSkill(skillId, priceBN, finalMetadata, signature)
      .accounts({
        skill: skillPda,
        creator: this.provider.wallet.publicKey,
        registry: registryPda,
      })
      .rpc();
  }

  /**
   * Verifies if the local logic matches the on-chain recorded integrity hash.
   */
  async verifyIntegrity(skillPda: PublicKey, localLogicContent: string): Promise<boolean> {
    const skillData = await this.program.account.skill.fetch(skillPda);
    const ipfsHash = skillData.ipfsHash;

    if (!ipfsHash.startsWith('gz:')) return false;

    // Decompress
    const base64Data = ipfsHash.slice(3);
    const binaryString = globalThis.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const decompressionStream = new (globalThis as any).DecompressionStream('gzip');
    const decompressedStream = new Blob([bytes]).stream().pipeThrough(decompressionStream);
    const metadata = JSON.parse(await new Response(decompressedStream).text());

    if (!metadata.h) return true; // No hash to verify

    // Calculate local hash
    const msgBuffer = new TextEncoder().encode(localLogicContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const localHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return localHash === metadata.h;
  }

  /**
   * Auditor Staking Management
   */
  async stake(amountUsdc: number): Promise<string> {
    const amount = new BN(amountUsdc * 1_000_000);
    const auditorPda = this.deriveAuditorPda(this.provider.wallet.publicKey);
    
    // Check if initialized
    try {
      await (this.program.account as any).auditor.fetch(auditorPda);
    } catch {
      await this.program.methods.initializeAuditor().accounts({
        auditor: auditorPda,
        authority: this.provider.wallet.publicKey,
      }).rpc();
    }

    const usdcMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
    const auditorTokenAccount = await getAssociatedTokenAddress(usdcMint, this.provider.wallet.publicKey);
    const vaultTokenAccount = this.deriveVaultPda(usdcMint, auditorPda);
    const vaultAuthority = this.deriveVaultAuthorityPda();

    return await this.program.methods
      .stakeUsdc(amount)
      .accounts({
        auditor: auditorPda,
        auditorTokenAccount,
        vaultTokenAccount,
        vaultAuthority,
        usdcMint,
        authority: this.provider.wallet.publicKey,
      } as any)
      .rpc();
  }

  // PDA Derivation Helpers
  deriveAuditorPda(authority: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from('auditor'), authority.toBuffer()], this.program.programId)[0];
  }

  deriveVaultPda(mint: PublicKey, auditor: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from('vault'), mint.toBuffer(), auditor.toBuffer()], this.program.programId)[0];
  }

  deriveVaultAuthorityPda(): PublicKey {
    return PublicKey.findProgramAddressSync([Buffer.from('vault_authority')], this.program.programId)[0];
  }
}
