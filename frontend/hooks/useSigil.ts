'use client';

import { useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import idl from '@/lib/idl.json';

export function useSigil() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (typeof window === 'undefined') return null;

    try {
      const mockWallet = {
        publicKey: PublicKey.default,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };

      const provider = new AnchorProvider(connection, wallet || (mockWallet as any), {
        preflightCommitment: 'confirmed',
      });

      // Clone IDL to prevent in-place modification issues in Anchor 0.30+
      const idlData = JSON.parse(JSON.stringify(idl));
      
      // In Anchor 0.30+, the constructor is (idl, provider).
      // The programId is automatically pulled from idlData.address
      return new Program(idlData as any, provider);
    } catch (e) {
      console.error('Failed to initialize Anchor Program:', e);
      return null;
    }
  }, [connection, wallet]);

  return {
    program,
    wallet,
    connection,
  };
}
