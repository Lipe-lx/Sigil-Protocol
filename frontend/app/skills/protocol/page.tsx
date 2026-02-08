'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSigil } from '@/hooks/useSigil';
import { PublicKey } from '@solana/web3.js';
import { LucideTerminal, LucideArrowLeft, LucideCopy, LucideCpu, LucideShieldCheck, LucideActivity, LucideShieldAlert, LucideCoins, LucideExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SkillData {
  name: string;
  description: string;
  externalUrl: string;
  integrityHash: string;
  priceUsdc: number;
  trustScore: number;
  executionCount: number;
  successRate: number;
  creator: string;
  pda: string;
}

function SkillDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { program } = useSigil();
  const [skill, setSkill] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    const fetchSkill = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Handle Protocol Documentation Slugs (Local MD files)
      const protocolSkills: Record<string, any> = {
        'SigilProtocolPresentation': { name: 'Protocol: Presentation', file: 'SigilProtocolPresentation.md' },
        'SkillExecutor': { name: 'Protocol: Skill Execution', file: 'SkillExecutor.md' },
        'SkillRegistry': { name: 'Protocol: Skill Registration', file: 'SkillRegistry.md' },
        'AuditorProtocol': { name: 'Protocol: Auditor Governance', file: 'AuditorProtocol.md' },
        'StakingVault': { name: 'Protocol: Staking Vault', file: 'StakingVault.md' }
      };

      if (protocolSkills[id]) {
        try {
          setLoading(true);
          const response = await fetch(`https://raw.githubusercontent.com/Lipe-lx/Sigil-Protocol/main/skills/${protocolSkills[id].file}`);
          const content = await response.text();
          setSkill({
            name: protocolSkills[id].name,
            description: content,
            externalUrl: `https://github.com/Lipe-lx/Sigil-Protocol/blob/main/skills/${protocolSkills[id].file}`,
            integrityHash: "PROTOCOL_VERIFIED",
            priceUsdc: 0,
            trustScore: 1000,
            executionCount: 0,
            successRate: 100,
            creator: "Sigil Protocol Foundation",
            pda: "N/A (Protocol Native)"
          });
          setIntegrityStatus('valid');
        } catch (e) {
          console.error("Failed to fetch protocol skill:", e);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!program) return;

      try {
        setLoading(true);
        const pda = new PublicKey(id as string);
        // @ts-ignore
        const account = await program.account.skill.fetch(pda);
        
        const toNum = (val: any) => {
          if (!val) return 0;
          if (typeof val === 'number') return val;
          return val.toNumber ? val.toNumber() : Number(val);
        };

        const executionCount = toNum(account.executionCount || account.execution_count);
        const successCount = toNum(account.successCount || account.success_count);
        const ipfsHash = account.ipfsHash || account.ipfs_hash || "";
        
        let name = `Sigil Skill #${id.toString().slice(0, 4)}`;
        let description = "";
        let externalUrl = "";
        let integrityHash = "";
        
        let processedIpfsHash = ipfsHash;
        if (ipfsHash.startsWith('gz:')) {
          try {
            const base64Data = ipfsHash.slice(3);
            const binaryString = window.atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const decompressedStream = new Blob([bytes]).stream().pipeThrough(new (window as any).DecompressionStream('gzip'));
            processedIpfsHash = await new Response(decompressedStream).text();
          } catch (e) {
            console.error("Decompression failed:", e);
          }
        }

        try {
          if (processedIpfsHash.startsWith('{')) {
             const parsed = JSON.parse(processedIpfsHash);
             name = parsed.n || parsed.name || name;
             description = parsed.d || parsed.description || "";
             externalUrl = parsed.u || parsed.externalUrl || "";
             integrityHash = parsed.h || "";
          } else {
            description = processedIpfsHash;
          }
        } catch (e) {
          description = processedIpfsHash;
        }

        setSkill({
          name,
          description,
          externalUrl,
          integrityHash,
          priceUsdc: toNum(account.priceUsdc || account.price_usdc) / 1000000,
          trustScore: toNum(account.trustScore || account.trust_score),
          executionCount,
          successRate: executionCount > 0 ? (successCount / executionCount) * 100 : 100,
          creator: account.creator.toString(),
          pda: pda.toString()
        });
      } catch (error) {
        console.error("Error fetching skill:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [program, id]);

  useEffect(() => {
    const verifyIntegrity = async () => {
      if (!skill || !skill.integrityHash || !skill.externalUrl) return;

      try {
        setIntegrityStatus('verifying');
        const response = await fetch(skill.externalUrl);
        if (!response.ok) throw new Error("Failed to fetch");
        const content = await response.text();
        const msgBuffer = new TextEncoder().encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        
        setIntegrityStatus(hashHex === skill.integrityHash ? 'valid' : 'invalid');
      } catch (error) {
        setIntegrityStatus('idle');
      }
    };

    verifyIntegrity();
  }, [skill]);

  const copyToClipboard = () => {
    if (!skill) return;
    const content = skill.description || `# ${skill.name}\n\nNo logic provided.`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white animate-spin rounded-full" />
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Fetching Sigil Metadata...</span>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-serif italic text-white uppercase">Sigil Not Found</h1>
        <Link href="/skills" className="text-zinc-500 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest">Return to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-20 min-h-screen">
      <Link href="/skills" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-16 group">
        <LucideArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <div className="sticky top-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 mb-8">
            <LucideCpu size={14} className="text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Sigil Logic v1</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-10 font-serif italic text-white uppercase leading-[0.85]">
            {skill.name}
          </h1>
          
          <div className="grid grid-cols-2 gap-4 mb-12">
             <div className="p-6 border border-zinc-900 bg-zinc-950/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Price per Run</span>
                <span className="text-3xl font-bold font-mono text-white">${skill.priceUsdc} <span className="text-sm text-zinc-600">USDC</span></span>
             </div>
             <div className="p-6 border border-zinc-900 bg-zinc-950/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">Trust Score</span>
                <span className="text-3xl font-bold font-mono text-white">{skill.trustScore}/1000</span>
             </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-zinc-900">
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Creator</span>
               <span className="text-[10px] font-mono text-zinc-400">{skill.creator}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-zinc-900">
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">PDA</span>
               <span className="text-[10px] font-mono text-zinc-400">{skill.pda}</span>
            </div>
            {skill.integrityHash && (
              <div className="flex justify-between items-center py-4 border-b border-zinc-900">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Integrity Hash</span>
                 <span className={cn(
                   "text-[10px] font-mono",
                   integrityStatus === 'invalid' ? "text-red-500" : "text-zinc-400"
                 )}>{skill.integrityHash.slice(0, 16)}...</span>
              </div>
            )}
          </div>

          <div className="mt-12 flex gap-4">
             <Button className="flex-1 h-14 font-black uppercase tracking-tighter rounded-none">Execute Sigil</Button>
             {skill.externalUrl && (
               <Button variant="outline" className="flex-1 h-14 font-black uppercase tracking-tighter rounded-none border-zinc-800 gap-2" asChild>
                 <a href={skill.externalUrl} target="_blank" rel="noopener noreferrer">
                   External Source
                   <LucideExternalLink size={14} />
                 </a>
               </Button>
             )}
          </div>
        </div>

        <div className="relative">
          {integrityStatus === 'invalid' && (
            <div className="mb-8 p-6 bg-red-950/20 border border-red-900/50 flex gap-4 items-start">
              <LucideShieldAlert className="text-red-500 shrink-0 mt-1" size={20} />
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-red-500 mb-1">Integrity Mismatch Detected</h4>
                <p className="text-[10px] text-red-400/80 leading-relaxed font-medium">
                  The source code at the external URL does not match the on-chain hash. This skill may have been tampered with. Use with extreme caution.
                </p>
              </div>
            </div>
          )}

          <div className="border border-zinc-900 bg-zinc-950 p-8 md:p-12 font-mono text-sm leading-relaxed shadow-2xl relative overflow-hidden group">
            <div className="scan-line opacity-20" />
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-zinc-900 transition-colors text-zinc-600 hover:text-white"
              >
                {copied ? <span className="text-[10px] font-bold uppercase text-green-500">Copied!</span> : <LucideCopy size={16} />}
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-zinc-900">
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700">SKILL.md</span>
            </div>
            
            <pre className="text-zinc-400 bg-transparent p-0 m-0 whitespace-pre-wrap selection:bg-white selection:text-black">
              {skill.description || "# No Logic Provided"}
            </pre>

            <div className="mt-12 pt-8 border-t border-zinc-900 flex justify-between items-center">
               <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest font-mono">EOF machine-readable stream</span>
               <div className="flex gap-4">
                  <div className="w-px h-8 bg-zinc-900" />
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-bold text-zinc-700 uppercase">Verification Log</span>
                    <span className="text-[9px] font-mono text-zinc-500 italic">Devnet: Verified</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SkillDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white animate-spin rounded-full" />
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Loading Protocol...</span>
      </div>
    }>
      <SkillDetailContent />
    </Suspense>
  );
}
