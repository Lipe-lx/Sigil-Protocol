'use client';

import { useState, useEffect, useCallback } from 'react';
import { SkillCard } from '@/components/SkillCard';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSigil } from '@/hooks/useSigil';
import { LucideSearch, LucideArrowUpDown, LucideFilter, LucidePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BN } from '@coral-xyz/anchor';
import { MintSkillModal } from '@/components/MintSkillModal';

interface Skill {
  id: string;
  creator: string;
  priceUsdc: number;
  trustScore: number;
  executionCount: number;
  successRate: number;
  name: string;
  pda: string;
}

const TREASURY = '8AufMHSUifpUu62ivSVBn7PfHBip7f5n8dhVNVyq24ws';

export default function SkillsPage() {
  const { connected, publicKey } = useWallet();
  const { program } = useSigil();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  const fetchSkills = useCallback(async () => {
    if (!program) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // @ts-ignore - Anchor IDL types need generation
      const accounts = await program.account.skill.all();
      
      const formattedSkills: Skill[] = accounts.map((acc: any) => {
        const data = acc.account;
        
        // Robust BN to Number conversion
        const toNum = (val: any) => {
          if (!val) return 0;
          if (typeof val === 'number') return val;
          try {
            return val.toNumber ? val.toNumber() : Number(val);
          } catch (e) {
            // Fallback for > 53 bits
            return Number(val.toString());
          }
        };

        const executionCount = toNum(data.executionCount || data.execution_count);
        const successCount = toNum(data.successCount || data.success_count);
        const priceUsdc = toNum(data.priceUsdc || data.price_usdc);
        const trustScore = toNum(data.trustScore || data.trust_score);
        const ipfsHash = data.ipfsHash || data.ipfs_hash || "";
        
        const calculatedSuccessRate = executionCount > 0 ? (successCount / executionCount) * 100 : 100;
        
        let name = `Sigil Skill #${acc.publicKey.toString().slice(0, 4)}`;
        
        // Handle reference skills mapping
        const refSkills: Record<string, string> = {
          'QmSecurityScannerHash': 'Security Scanner',
          'QmCodeReviewerHash': 'Code Reviewer',
          'QmDeFiAnalyzerHash': 'DeFi Analyzer',
          'QmTestHash1770416406741': 'Sigil Test Skill'
        };

        if (refSkills[ipfsHash]) {
          name = refSkills[ipfsHash];
        } else {
          try {
            if (ipfsHash.startsWith('{')) {
               const parsed = JSON.parse(ipfsHash);
               name = parsed.name || name;
            }
          } catch (e) {}
        }

        return {
          id: acc.publicKey.toString(),
          pda: acc.publicKey.toString(),
          creator: data.creator.toString(),
          priceUsdc: priceUsdc / 1000000, 
          trustScore: trustScore,
          executionCount: executionCount,
          successRate: calculatedSuccessRate,
          name: name
        };
      });

      setSkills(formattedSkills);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  return (
    <div className="max-w-[1400px] mx-auto px-6">
      <div className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Devnet Live Registry</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 leading-[0.8] font-serif italic text-white">
              Skill <br />Marketplace
            </h1>
            <p className="text-xl text-zinc-500 tracking-tight leading-relaxed font-medium">
              A decentralized repository of verifiable AI capabilities. <br />
              Pay per execution, audited by the Sigil Trust Layer.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 min-w-[300px]">
            <div className="relative group">
              <LucideSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search skills..."
                className="w-full bg-zinc-950 border border-zinc-900 h-12 pl-12 pr-4 text-sm focus:outline-none focus:border-zinc-500 transition-all font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2 border-zinc-900 text-xs font-bold uppercase tracking-wider">
                <LucideArrowUpDown size={14} />
                Sort
              </Button>
              <Button variant="outline" className="flex-1 gap-2 border-zinc-900 text-xs font-bold uppercase tracking-wider">
                <LucideFilter size={14} />
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-900 w-full mb-12" />

        {!program ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white animate-spin rounded-full" />
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Synchronizing Sigil Registry...</span>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white animate-spin rounded-full" />
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Synchronizing Sigil Registry...</span>
          </div>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 border border-dashed border-zinc-800 bg-zinc-950/20">
            <h3 className="text-2xl font-bold tracking-tighter text-zinc-400 mb-4 uppercase italic font-serif">No Skills Found</h3>
            <p className="text-zinc-600 mb-8 max-w-sm text-center">The registry is currently empty on Devnet. Be the first to mint a new skill sigil.</p>
            <Button 
              className="font-bold tracking-tighter uppercase gap-2"
              onClick={() => setIsMintModalOpen(true)}
            >
               <LucidePlus size={16} />
               Mint First Skill
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {skills.map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-32 p-12 bg-zinc-950 border border-zinc-900 relative overflow-hidden group hover:border-zinc-500 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/10 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-bold tracking-tighter mb-4 text-white uppercase italic font-serif">Want to monetize your skills?</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Register your AI agent's capabilities on Sigil and earn USDC every time it's called. 
            Verifiable, atomic, and secure.
          </p>
          <Button 
            size="lg" 
            className="font-bold tracking-tighter uppercase px-12 group"
            onClick={() => setIsMintModalOpen(true)}
          >
            Mint New Sigil
            <LucideArrowUpDown className="ml-2 group-hover:rotate-180 transition-transform duration-500" size={16} />
          </Button>
        </div>
      </div>

      <MintSkillModal 
        isOpen={isMintModalOpen} 
        onClose={() => setIsMintModalOpen(false)} 
        onSuccess={fetchSkills}
      />
    </div>
  );
}
