import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import idl from './idl.json';

export const SOLANA_NETWORK = 'devnet';
export const SOLANA_RPC_URL = 'https://api.devnet.solana.com';

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export const PROGRAM_ID = new PublicKey('BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe');

export function getProgram(wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });
  
  // Clone IDL to prevent in-place modification issues
  const idlData = JSON.parse(JSON.stringify(idl));
  
  // In Anchor 0.30+, the constructor is (idl, provider).
  // The programId is automatically pulled from idlData.address
  return new Program(idlData as any, provider);
}
