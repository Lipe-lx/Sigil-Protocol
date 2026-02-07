import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SigilRegistryClient } from '../sdk/src/sigil-registry';
import { BN } from '@coral-xyz/anchor';
import * as fs from 'fs';
import crypto from 'crypto';

async function mintReferenceSkills() {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Use the generated authority keypair
  const secretKey = JSON.parse(fs.readFileSync('./id.json', 'utf8'));
  const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
  
  const client = new SigilRegistryClient(connection, {
    publicKey: wallet.publicKey,
    signTransaction: async (tx: any) => {
      tx.partialSign(wallet);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      txs.forEach(tx => tx.partialSign(wallet));
      return txs;
    }
  });

  console.log('🚀 Initializing registry and minting reference skills...');

  try {
    const initTx = await client.initializeRegistry();
    console.log(`✅ Registry initialized: ${initTx}`);
  } catch (e: any) {
    if (e.logs && e.logs.some((l: string) => l.includes('already in use'))) {
      console.log('ℹ️ Registry already initialized.');
    } else {
      throw e;
    }
  }

  /*
  // 1. DeFi Analyzer
  const skillId = Array.from(crypto.createHash('sha256').update('defi-analyzer-v1').digest());
  const tx = await client.mintSkill(
    skillId,
    new BN(50000), // 0.05 USDC
    'QmDeFiAnalyzerHash',
    Array.from(Buffer.alloc(64)) // Mock signature
  );

  console.log(`✅ DeFi Analyzer minted: ${tx}`);
  
  const [skillPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('skill'), Buffer.from(skillId)],
    new PublicKey('BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe')
  );
  
  console.log(`📍 Skill PDA: ${skillPda.toString()}`);
  */

  // 2. Code Reviewer
  const skillId2 = Array.from(crypto.createHash('sha256').update('code-reviewer-v1').digest());
  const tx2 = await client.mintSkill(
    skillId2,
    new BN(30000), // 0.03 USDC
    'QmCodeReviewerHash',
    Array.from(Buffer.alloc(64))
  );
  console.log(`✅ Code Reviewer minted: ${tx2}`);

  // 3. Security Scanner
  const skillId3 = Array.from(crypto.createHash('sha256').update('security-scanner-v1').digest());
  const tx3 = await client.mintSkill(
    skillId3,
    new BN(100000), // 0.10 USDC
    'QmSecurityScannerHash',
    Array.from(Buffer.alloc(64))
  );
  console.log(`✅ Security Scanner minted: ${tx3}`);
}

mintReferenceSkills().catch(console.error);
