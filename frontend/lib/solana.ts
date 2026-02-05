import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { SigilRegistry } from '../sdk/src/types';

export const SOLANA_NETWORK = 'devnet';
export const SOLANA_RPC_URL = 'https://api.devnet.solana.com';

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export const PROGRAM_ID = new PublicKey('BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe');

export function getProgram(wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });
  // In production, we'd import the real IDL
  return new Program(null as any, provider);
}
