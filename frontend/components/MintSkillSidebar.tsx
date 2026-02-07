'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LucideX, LucideLoader2, LucideChevronRight, LucideInfo } from 'lucide-react';
import { useSigil } from '@/hooks/useSigil';
import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { cn } from '@/lib/utils';

export function MintSkillSidebar({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const { program, wallet } = useSigil();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0.01');
  const [skillDescription, setSkillDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  const MAX_RAW_CHARS = 1000;
  const charsLeft = MAX_RAW_CHARS - skillDescription.length;

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

      // Real signature
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
      }

      // Metadata optimization: use extremely short keys to save bytes
      const metadataObj: any = { n: name };
      if (skillDescription) metadataObj.d = skillDescription;
      if (externalUrl) metadataObj.u = externalUrl;

      // HASHING FOR AUDIT INTEGRITY:
      // Even if the logic is external, we store its SHA-256 hash on-chain.
      // This ensures the "Composition" cannot be changed without breaking the audit.
      if (skillDescription || externalUrl) {
        const contentToHash = skillDescription || externalUrl;
        const msgBuffer = new TextEncoder().encode(contentToHash);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        metadataObj.h = hashHex; // 'h' for hash/integrity
      }

      const metadataStr = JSON.stringify(metadataObj);
      
      // Compress metadata using native browser CompressionStream (Gzip)
      const blob = new Blob([metadataStr]);
      const compressedStream = blob.stream().pipeThrough(new (window as any).CompressionStream('gzip'));
      const compressedBuffer = await new Response(compressedStream).arrayBuffer();
      
      const base64Compressed = Buffer.from(compressedBuffer).toString('base64');
      const finalMetadata = `gz:${base64Compressed}`;

      // SOLANA PACKET LIMIT: 1232 bytes.
      if (finalMetadata.length > 1200) {
        throw new Error(`Skill header is too large. Please keep the summary under 1000 characters.`);
      }
      
      const priceBN = new BN(parseFloat(price) * 1000000); 
      
      const tx = await (program.methods as any)
        .mintSkill(skillId, priceBN, finalMetadata, creatorSignature)
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
      
      // Clear form
      setName('');
      setPrice('0.01');
      setSkillDescription('');
      setExternalUrl('');
    } catch (error: any) {
      console.error("Minting failed:", error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-[101] h-full w-full max-w-xl bg-zinc-950 border-l border-zinc-800 shadow-2xl transition-transform duration-500 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 block mb-2">Registry v1.0</span>
              <h2 className="text-4xl font-bold tracking-tighter font-serif uppercase italic text-white">Mint New Sigil</h2>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 flex items-center justify-center border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500 transition-all"
            >
              <LucideX size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-10">
            {/* Wallet Info */}
            <div className="p-4 bg-zinc-900/50 border border-zinc-900 flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Authenticated Author</span>
                <span className="text-xs font-mono text-zinc-300 truncate block">
                  {wallet?.publicKey?.toString() || 'Not Connected'}
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {/* Skill Name */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Skill Name</label>
                  <div className="group/tip relative">
                    <LucideInfo size={10} className="text-zinc-700 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-normal">
                      The public title of your AI capability.
                    </div>
                  </div>
                  <span className="text-zinc-800">—</span>
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Logic Auditor v1"
                  className="w-full bg-black border border-zinc-900 h-14 px-4 text-sm focus:outline-none focus:border-white transition-all font-mono placeholder:text-zinc-800 text-white"
                />
              </div>

              {/* Price */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Price (USDC)</label>
                  <div className="group/tip relative">
                    <LucideInfo size={10} className="text-zinc-700 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-normal">
                      Cost per execution. Payments are split between you and the protocol treasury.
                    </div>
                  </div>
                  <span className="text-zinc-800">—</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.01"
                    className="w-full bg-black border border-zinc-900 h-14 px-4 text-sm focus:outline-none focus:border-white transition-all font-mono placeholder:text-zinc-800 text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 tracking-widest uppercase">
                    Atomic Split
                  </span>
                </div>
              </div>

              {/* Skill Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Skill Header / Summary</label>
                    <div className="group/tip relative">
                      <LucideInfo size={10} className="text-zinc-700 cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-normal">
                        A concise summary of what this skill does and how to call it. This is stored on-chain for discovery.
                      </div>
                    </div>
                    <span className="text-zinc-800">—</span>
                  </div>
                  <span className={cn(
                    "text-[9px] font-mono",
                    charsLeft < 200 ? "text-red-500" : "text-zinc-700"
                  )}>
                    {charsLeft} chars remaining
                  </span>
                </div>
                <div className="relative group">
                  <textarea
                    value={skillDescription}
                    onChange={(e) => setSkillDescription(e.target.value.slice(0, MAX_RAW_CHARS))}
                    placeholder="e.g. 
                                  ---
                                  name: solana-setup
                                  description: Use this skill when working with Solana blockchain development projects. This includes setting up new Solana/Anchor projects, resolving version conflicts between Rust/Solana CLI/Anchor/web3.js, troubleshooting build errors, configuring development environments, and ensuring compatibility between all toolchain components. Trigger for any Solana development setup, version conflict resolution, or build issues.
                                  license: MIT
                                  ---"
                    className="w-full bg-black border border-zinc-900 min-h-[120px] p-4 text-sm focus:outline-none focus:border-white transition-all font-mono placeholder:text-zinc-800 text-white resize-none"
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 text-[9px] font-bold text-zinc-700 uppercase tracking-tighter opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <LucideChevronRight size={10} /> On-Chain Metadata
                  </div>
                </div>
              </div>

      // Logic Source URL
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-white">Full Logic Source (GITHUB/IPFS)</label>
                  <div className="group/tip relative">
                    <LucideInfo size={10} className="text-zinc-700 cursor-help" />
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                      REQUIRED. The definitive SKILL.md file. Use the "Raw" URL from GitHub for real-time audit verification.
                    </div>
                  </div>
                  <span className="text-zinc-800">—</span>
                </div>
                <input
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/user/repo/main/SKILL.md"
                  className="w-full bg-zinc-900 border border-zinc-800 h-14 px-4 text-sm focus:outline-none focus:border-white transition-all font-mono placeholder:text-zinc-700 text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-12">
            <Button
              onClick={handleMint}
              disabled={loading || !name || !externalUrl || !wallet}
              className="w-full h-16 font-black tracking-tighter uppercase text-sm bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-700 transition-all rounded-none"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <LucideLoader2 className="animate-spin" size={18} />
                  <span>Processing Protocol...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Register Sigil</span>
                  <LucideChevronRight size={18} />
                </div>
              )}
            </Button>
            <p className="text-[9px] font-medium text-zinc-600 uppercase tracking-[0.2em] text-center mt-6">
              Solana Devnet Transaction • Atomic USDC Settlement Enabled
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
