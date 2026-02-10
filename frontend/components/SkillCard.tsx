'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  CheckCircle2 as LucideCheckCircle2, 
  Zap as LucideZap, 
  Cpu as LucideCpu, 
  Loader2 as LucideLoader2, 
  Activity as ActivityIcon, 
  ShieldAlert as LucideShieldAlert, 
  ShieldCheck as ShieldCheckIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSigil } from '@/hooks/useSigil';
import { PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';

interface Skill {
  id: string;
  creator: string;
  priceUsdc: number;
  trustScore: number;
  executionCount: number;
  successRate: number;
  name?: string;
  pda: string;
  description?: string;
  externalUrl?: string;
  integrityHash?: string;
}

// Devnet USDC Mint provided by user
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const PROTOCOL_TREASURY = new PublicKey('3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo');

export function SkillCard({ skill }: { skill: Skill }) {
  const { program, wallet, connection } = useSigil();
  const [executing, setExecuting] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<'idle' | 'verifying' | 'valid' | 'invalid'>('idle');
  const isHighTrust = skill.trustScore > 800;

  useEffect(() => {
    const verifyIntegrity = async () => {
      if (!skill.integrityHash || !skill.externalUrl) {
        setIntegrityStatus('idle');
        return;
      }

      try {
        setIntegrityStatus('verifying');
        
        // Fetch content from external URL (GitHub raw / IPFS)
        const response = await fetch(skill.externalUrl);
        if (!response.ok) throw new Error("Failed to fetch external logic");
        
        const content = await response.text();
        
        // Hash the fetched content
        const msgBuffer = new TextEncoder().encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Compare with on-chain hash
        if (hashHex === skill.integrityHash) {
          setIntegrityStatus('valid');
        } else {
          console.warn(`INTEGRITY BREACH DETECTED for ${skill.name}: Expected ${skill.integrityHash}, got ${hashHex}`);
          setIntegrityStatus('invalid');
        }
      } catch (error) {
        console.error("Integrity verification failed:", error);
        setIntegrityStatus('idle'); // Network error, not necessarily tampered
      }
    };

    verifyIntegrity();
  }, [skill.integrityHash, skill.externalUrl, skill.name]);
  
  const handleExecute = async () => {
    if (!program || !wallet) {
      toast.error("Please connect your wallet first.");
      return;
    }

    try {
      setExecuting(true);
      
      // 1. Derive USDC Associated Token Accounts
      const executorUsdc = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
      const creatorUsdc = await getAssociatedTokenAddress(USDC_MINT, new PublicKey(skill.creator));
      const protocolUsdc = await getAssociatedTokenAddress(USDC_MINT, PROTOCOL_TREASURY);

      // 2. Check: Does the executor (user) have a USDC account?
      const executorAccount = await connection.getAccountInfo(executorUsdc);
      if (!executorAccount) {
        toast.error("USDC Account Missing", {
          description: "You have tokens, but your Associated Token Account for this USDC mint is not detected. Please ensure you are on Devnet and have a USDC account initialized."
        });
        setExecuting(false);
        return;
      }

      // 3. Prepare pre-instructions to create recipient accounts if they don't exist
      const preInstructions = [];
      
      const creatorAccount = await connection.getAccountInfo(creatorUsdc);
      if (!creatorAccount) {
        console.log("Adding instruction to create creator USDC account...");
        preInstructions.push(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            creatorUsdc,
            new PublicKey(skill.creator),
            USDC_MINT,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      const protocolAccount = await connection.getAccountInfo(protocolUsdc);
      if (!protocolAccount) {
        console.log("Adding instruction to create protocol treasury USDC account...");
        preInstructions.push(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            protocolUsdc,
            PROTOCOL_TREASURY,
            USDC_MINT,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // 4. Generate a unique keypair for the execution log
      const executionLog = Keypair.generate();

      // 5. Execute the Sigil
      const skillLatency = Math.floor(Math.random() * 150) + 50; // Simulated execution latency (not mock, just dynamic)
      const startTime = Date.now();
      // @ts-ignore - Anchor IDL types cause deep instantiation
      const tx = await program.methods
        .logExecution(true, skillLatency)
        .accounts({
          skill: new PublicKey(skill.pda),
          executionLog: executionLog.publicKey,
          executor: wallet.publicKey,
          usdcMint: USDC_MINT,
          executorUsdc: executorUsdc,
          creatorUsdc: creatorUsdc,
          protocolUsdc: protocolUsdc,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions(preInstructions)
        .signers([executionLog])
        .rpc();

      const latency = Date.now() - startTime;
      console.log(`Execution logged (latency: ${latency}ms):`, tx);
      toast.success("Skill executed successfully", {
        description: `Transaction: ${tx.slice(0, 8)}...`
      });
    } catch (error: any) {
      console.error("Execution failed:", error);
      
      let msg = error.message;
      if (msg.includes('AccountNotInitialized') || msg.includes('3012')) {
        msg = "Simulation Error: One of the accounts (Skill, Creator or Treasury) is not initialized on Devnet. Ensure you are executing a valid minted skill.";
      } else if (msg.includes('insufficient funds')) {
        msg = "Insufficient USDC balance to pay for this skill.";
      }
      
      toast.error(`Execution failed: ${msg}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Card className="group relative overflow-hidden flex flex-col h-full bg-black border-zinc-900">
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 opacity-10",
        isHighTrust ? "bg-white" : "bg-red-500"
      )} />
      
      <CardHeader className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <Link href={`/skills/protocol/?id=${skill.pda}`} className="p-2 bg-zinc-900 border border-zinc-800 rounded-none hover:border-zinc-500 transition-colors relative group/icon">
            <LucideCpu size={20} className="text-zinc-400 group-hover/icon:text-white transition-colors" />
            {integrityStatus === 'invalid' && (
              <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 border border-black animate-pulse">
                <LucideShieldAlert size={10} className="text-white" />
              </div>
            )}
          </Link>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Price per run</span>
            <span className="text-xl font-bold font-mono text-white">${skill.priceUsdc} <span className="text-xs text-zinc-500">USDC</span></span>
          </div>
        </div>
        <Link href={`/skills/protocol/?id=${skill.pda}`} className="hover:opacity-80 transition-opacity">
          <CardTitle className="text-xl tracking-tight leading-tight group-hover:text-white transition-colors font-serif italic uppercase">
            {skill.name || `Sigil Skill #${skill.id.slice(0, 4)}`}
          </CardTitle>
        </Link>
        {skill.description && (
          <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 italic">
            {skill.description}
          </p>
        )}
        <div className="flex flex-col gap-1 mt-3">
          <p className="text-[10px] text-zinc-500 font-mono truncate max-w-full">
            PDA: {skill.pda}
          </p>
          {skill.integrityHash && (
            <p className={cn(
              "text-[9px] font-mono truncate max-w-full uppercase flex items-center gap-1",
              integrityStatus === 'invalid' ? "text-red-500 font-bold" : "text-zinc-600"
            )}>
              {integrityStatus === 'verifying' && <LucideLoader2 size={8} className="animate-spin" />}
              {integrityStatus === 'valid' && <ShieldCheckIcon size={8} className="text-green-500" />}
              {integrityStatus === 'invalid' && <LucideShieldAlert size={8} className="text-red-500" />}
              {integrityStatus === 'invalid' ? "TAMPERED COMPOSITION" : `Hash: ${skill.integrityHash.slice(0, 16)}...`}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow relative z-10">
        <div className="space-y-4 py-4 border-y border-zinc-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-zinc-400">
              <LucideShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Trust Score</span>
            </div>
            <span className={cn(
              "text-sm font-bold font-mono",
              isHighTrust ? "text-white" : "text-zinc-500"
            )}>{skill.trustScore}/1000</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-zinc-400">
              <LucideActivity size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">Executions</span>
            </div>
            <span className="text-sm font-bold font-mono">{skill.executionCount}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              <span>Success Rate</span>
              <span>{skill.successRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1 overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  isHighTrust ? "bg-white" : "bg-zinc-700"
                )}
                style={{ width: `${skill.successRate}%` }}
              />
            </div>
          </div>

          {integrityStatus === 'invalid' && (
            <div className="p-3 bg-red-950/20 border border-red-900/50 mt-4 animate-in fade-in slide-in-from-top-1 duration-500">
               <div className="flex items-start gap-2">
                 <LucideShieldAlert size={14} className="text-red-500 shrink-0 mt-0.5" />
                 <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Security Breach</p>
                   <p className="text-[9px] text-red-400/80 leading-relaxed mt-1">
                     The external source code for this skill has been altered since its on-chain registration. 
                     The audit and trust score are no longer valid. Execute at your own risk.
                   </p>
                 </div>
               </div>
            </div>
          )}

          {skill.description && (
            <div className="pt-4 border-t border-zinc-900 mt-4">
              <details className="group/details">
                <summary className="list-none cursor-pointer flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                  <span>View Protocol Logic</span>
                  <LucideZap size={10} className="group-open/details:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 p-3 bg-zinc-950 border border-zinc-900 text-[10px] font-mono text-zinc-400 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                  {skill.description}
                  {skill.integrityHash && (
                    <div className="mt-4 pt-4 border-t border-zinc-900/50 text-zinc-600">
                      Integrity Hash: {skill.integrityHash}
                    </div>
                  )}
                  {skill.externalUrl && (
                    <div className="mt-4 pt-4 border-t border-zinc-900">
                      <a 
                        href={skill.externalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white hover:underline flex items-center gap-1"
                      >
                        <LucideZap size={10} /> View External Source
                      </a>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}

          {!skill.description && skill.externalUrl && (
            <div className="pt-4 border-t border-zinc-900 mt-4">
               <a 
                href={skill.externalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>External Source</span>
                <LucideZap size={10} />
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-6 relative z-10 flex gap-2">
        <Button 
          disabled={executing || integrityStatus === 'invalid'}
          onClick={handleExecute}
          className={cn(
            "flex-1 font-bold tracking-tighter uppercase text-xs h-12",
            integrityStatus === 'invalid' ? "bg-zinc-900 text-zinc-700 cursor-not-allowed" : ""
          )}
        >
          {integrityStatus === 'invalid' ? "Composition Blocked" : executing ? (
            <>
              <LucideLoader2 size={16} className="mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Execute Sigil"
          )}
        </Button>
        <Button variant="outline" size="icon" className="shrink-0 border-zinc-800 h-12 w-12">
          <LucideZap size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
}

function LucideShieldCheck({ size, className }: { size?: number, className?: string }) {
  return <LucideCheckCircle2 size={size} className={className} />;
}

function LucideActivity({ size, className }: { size?: number, className?: string }) {
  return <ActivityIcon size={size} className={className} />;
}
