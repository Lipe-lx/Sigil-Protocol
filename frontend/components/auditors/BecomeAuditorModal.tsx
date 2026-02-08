'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { ShieldCheck as LucideShieldCheck, Loader2 as LucideLoader2, Info as LucideInfo } from "lucide-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // Devnet USDC
const MIN_STAKE = 50;

interface BecomeAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BecomeAuditorModal({ isOpen, onClose, onSuccess }: BecomeAuditorModalProps) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(MIN_STAKE.toString());
  const [error, setError] = useState<string | null>(null);

  const handleBecomeAuditor = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return;

    setLoading(true);
    setError(null);

    try {
      const { SigilRegistryClient } = await import('@/lib/solana/registry-client');
      
      const client = new SigilRegistryClient(connection, {
        publicKey,
        signTransaction,
        signAllTransactions,
      });

      // 1. Check if Auditor already exists to avoid "already in use" error
      console.log("Checking auditor status...");
      const auditorPda = client.deriveAuditorPda(publicKey);
      const auditorAccount = await client.getAuditor(auditorPda);
      
      if (!auditorAccount) {
        console.log("Initializing auditor...");
        await client.initializeAuditor();
      } else {
        console.log("Auditor already initialized, skipping to stake...");
      }
      
      // 2. Stake USDC
      const amount = new BN(parseFloat(stakeAmount) * 1_000_000); // 6 decimals
      const auditorTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const vaultTokenAccount = client.deriveVaultPda(USDC_MINT, auditorPda);
      const vaultAuthority = client.deriveVaultAuthorityPda();

      console.log("Staking USDC...");
      const tx = await client.stakeUsdc(
        auditorPda,
        auditorTokenAccount,
        vaultTokenAccount,
        vaultAuthority,
        USDC_MINT,
        amount
      );
      
      console.log("Auditor registered and staked:", tx);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to initialize auditor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black border-zinc-800 text-white">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <LucideShieldCheck className="text-white" size={24} />
          </div>
          <DialogTitle className="text-center text-xl font-bold uppercase tracking-widest">Become an Auditor</DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Join the Sigil Network trust layer. Stake USDC to verify skills and earn rewards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Stake Amount (USDC)</label>
            <div className="relative">
              <input 
                type="number" 
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min={MIN_STAKE}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-white focus:outline-none focus:border-white transition-colors"
                placeholder="50"
              />
              <div className="absolute right-3 top-3 text-zinc-500 text-sm font-bold">USDC</div>
            </div>
            <p className="text-[10px] text-zinc-500 flex items-center gap-1">
              <LucideInfo size={12} /> Minimum required: {MIN_STAKE} USDC
            </p>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-sm text-zinc-400">
            <p className="mb-2"><strong className="text-white">Security Protocol:</strong></p>
            <ul className="list-disc pl-4 space-y-1 text-xs">
              <li>Stake is locked while active</li>
              <li>Unbonding period: 7 days</li>
              <li>Negligence/Fraud results in <span className="text-red-500">Slashing</span></li>
            </ul>
          </div>
          
          {error && (
            <div className="text-red-500 text-xs text-center bg-red-950/20 p-2 rounded border border-red-900">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            onClick={handleBecomeAuditor} 
            disabled={loading || !publicKey || parseFloat(stakeAmount) < MIN_STAKE}
            className="w-full bg-white text-black hover:bg-zinc-200 uppercase font-bold tracking-widest h-12"
          >
            {loading ? <LucideLoader2 className="animate-spin mr-2" size={16} /> : null}
            {loading ? "Processing..." : "Stake & Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
