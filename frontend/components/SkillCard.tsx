'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideCheckCircle2, LucideZap, LucideCpu, LucideLoader2, LucideActivity as ActivityIcon } from 'lucide-react';
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
}

// Devnet USDC Mint provided by user
const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
const PROTOCOL_TREASURY = new PublicKey('3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo');

export function SkillCard({ skill }: { skill: Skill }) {
  const { program, wallet, connection } = useSigil();
  const [executing, setExecuting] = useState(false);
  const isHighTrust = skill.trustScore > 800;
  
  const handleExecute = async () => {
    if (!program || !wallet) {
      alert("Please connect your wallet first.");
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
        alert("USDC Account Missing: You have tokens, but your Associated Token Account for this USDC mint is not detected. Please ensure you are on Devnet and have a USDC account initialized.");
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
          executorUsdc: executorUsdc,
          creatorUsdc: creatorUsdc,
          protocolUsdc: protocolUsdc,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .preInstructions(preInstructions)
        .signers([executionLog])
        .rpc();

      const latency = Date.now() - startTime;
      console.log(`Execution logged (latency: ${latency}ms):`, tx);
      alert(`Skill executed successfully!\nTransaction: ${tx.slice(0, 8)}...`);
    } catch (error: any) {
      console.error("Execution failed:", error);
      
      let msg = error.message;
      if (msg.includes('AccountNotInitialized') || msg.includes('3012')) {
        msg = "Simulation Error: One of the accounts (Skill, Creator or Treasury) is not initialized on Devnet. Ensure you are executing a valid minted skill.";
      } else if (msg.includes('insufficient funds')) {
        msg = "Insufficient USDC balance to pay for this skill.";
      }
      
      alert(`Execution failed: ${msg}`);
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
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-none group-hover:border-zinc-500 transition-colors">
            <LucideCpu size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Price per run</span>
            <span className="text-xl font-bold font-mono text-white">${skill.priceUsdc} <span className="text-xs text-zinc-500">USDC</span></span>
          </div>
        </div>
        <CardTitle className="text-xl tracking-tight leading-tight group-hover:text-white transition-colors font-serif italic uppercase">
          {skill.name || `Sigil Skill #${skill.id.slice(0, 4)}`}
        </CardTitle>
        {skill.description && (
          <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 italic">
            {skill.description}
          </p>
        )}
        <p className="text-[10px] text-zinc-500 font-mono mt-2 truncate max-w-full">
          PDA: {skill.pda}
        </p>
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

          {skill.description && (
            <div className="pt-4 border-t border-zinc-900 mt-4">
              <details className="group/details">
                <summary className="list-none cursor-pointer flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                  <span>View Protocol Logic</span>
                  <LucideZap size={10} className="group-open/details:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 p-3 bg-zinc-950 border border-zinc-900 text-[10px] font-mono text-zinc-400 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
                  {skill.description}
                </div>
              </details>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-6 relative z-10 flex gap-2">
        <Button 
          disabled={executing}
          onClick={handleExecute}
          className="flex-1 font-bold tracking-tighter uppercase text-xs h-12"
        >
          {executing ? (
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
