'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { LucideShieldCheck, LucideLoader2 } from "lucide-react";
import { SigilRegistryClient } from '@/lib/sigil-registry-client'; // Needs adaptation for frontend
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

// We need a frontend-compatible version of the client or import the SDK directly
// Assuming we can use the SDK if we polyfill Buffer or if Next.js handles it.
// For now, let's create a minimal client instantiation logic in the component or a hook.

interface BecomeAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BecomeAuditorModal({ isOpen, onClose, onSuccess }: BecomeAuditorModalProps) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBecomeAuditor = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return;

    setLoading(true);
    setError(null);

    try {
      // Initialize SDK Client
      // Note: We need to import the IDL and setup the client similar to the backend SDK
      // But we can't import directly from backend/src in Next.js usually without workspace config.
      // We will assume the ABI/IDL is available or we copy the client logic here for simplicity if needed.
      // Better: Create a lib/solana/client.ts in frontend. 
      // For this step, I'll assume we can instantiate the class we just updated if we move/copy it.
      
      // Temporary: Dynamic import to avoid SSR issues with wallet adapter sometimes
      const { SigilRegistryClient } = await import('@/lib/solana/registry-client');
      
      const client = new SigilRegistryClient(connection, {
        publicKey,
        signTransaction,
        signAllTransactions,
      });

      const tx = await client.initializeAuditor();
      console.log("Auditor initialized:", tx);
      
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
            Join the Sigil Network trust layer. Stake your reputation to verify skills and earn rewards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-sm text-zinc-400">
            <p className="mb-2"><strong className="text-white">Responsibilities:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Review skill logic code</li>
              <li>Verify execution integrity</li>
              <li>Sign valid audit reports</li>
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
            disabled={loading || !publicKey}
            className="w-full bg-white text-black hover:bg-zinc-200 uppercase font-bold tracking-widest"
          >
            {loading ? <LucideLoader2 className="animate-spin mr-2" size={16} /> : null}
            {loading ? "Registering..." : "Register on Chain"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
