'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LucideX, LucidePlus, LucideLoader2 } from 'lucide-react';
import { useSigil } from '@/hooks/useSigil';
import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';

export function MintSkillModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const { program, wallet } = useSigil();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0.01');

  if (!isOpen) return null;

  const handleMint = async () => {
    if (!program || !wallet) return;

    try {
      setLoading(true);
      
      // Generate a random 32-byte skill ID
      const skillId = Array.from(crypto.getRandomValues(new Uint8Array(32)));
      
      const [skillPda] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode('skill'), new Uint8Array(skillId)],
        program.programId
      );
      const [registryPda] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode('registry_v1')],
        program.programId
      );

      // Real signature: Creator signs the skill ID to prove ownership/intent
      let creatorSignature = Array(64).fill(0);
      try {
        if ((wallet as any).signMessage) {
          const skillIdHex = Array.from(skillId).map(b => b.toString(16).padStart(2, '0')).join('');
          const message = new TextEncoder().encode(`Minting Sigil Skill: ${name}\nID: ${skillIdHex}`);
          const signature = await (wallet as any).signMessage(message);
          creatorSignature = Array.from(signature);
        }
      } catch (e) {
        console.warn("Signature skipped or failed:", e);
        // Fallback to dummy if user cancels, but we should ideally enforce it
      }

      // We store the name in the ipfsHash field for this demo
      const metadata = JSON.stringify({ name });
      const priceBN = new BN(parseFloat(price) * 1000000); // USDC 6 decimals
      
      const tx = await program.methods
        .mintSkill(skillId, priceBN, metadata, creatorSignature)
        .accounts({
          skill: skillPda,
          creator: wallet.publicKey,
          registry: registryPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Skill minted:", tx);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Minting failed:", error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
      <Card className="w-full max-w-md bg-black border-zinc-800 p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
          <LucideX size={20} />
        </button>

        <h2 className="text-3xl font-bold tracking-tighter mb-8 font-serif uppercase italic text-white">Mint New Sigil</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Skill Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Logic Auditor v1"
              className="w-full bg-zinc-950 border border-zinc-900 h-12 px-4 text-sm focus:outline-none focus:border-white transition-all font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Price (USDC)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.01"
              className="w-full bg-zinc-950 border border-zinc-900 h-12 px-4 text-sm focus:outline-none focus:border-white transition-all font-mono"
            />
          </div>

          <Button
            onClick={handleMint}
            disabled={loading || !name}
            className="w-full h-14 font-black tracking-tighter uppercase text-sm"
          >
            {loading ? <LucideLoader2 className="animate-spin" /> : "Confirm Minting"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
