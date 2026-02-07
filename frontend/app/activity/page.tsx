'use client';

import { ExecutionFeed } from '@/components/ExecutionFeed';
import { LucideActivity, LucideShield } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className="max-w-[1400px] mx-auto px-6">
      <div className="mb-16">
        <div className="max-w-2xl mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Devnet Live Network</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 font-serif uppercase italic text-white">
            Network <br />Activity
          </h1>
          <p className="text-xl text-zinc-500 tracking-tight leading-relaxed font-medium">
            Real-time execution logs from the Sigil Registry. Every entry represents a cryptographically verified skill run and an atomic USDC settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="p-8 border border-zinc-900 bg-zinc-950/50 backdrop-blur-xl relative">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <ExecutionFeed />
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="p-8 border border-zinc-900 bg-zinc-950/20">
               <LucideShield className="text-white mb-6" size={32} />
               <h3 className="text-lg font-bold tracking-tight text-white mb-2 uppercase italic font-serif">Verifiable Logs</h3>
               <p className="text-sm text-zinc-500 leading-relaxed">
                 All logs are stored on the Solana blockchain as ExecutionLog accounts. This ensures that every claim of skill execution is backed by a transaction and a corresponding payment.
               </p>
            </div>
            
            <div className="p-8 border border-zinc-900 bg-zinc-950/20">
               <LucideActivity className="text-white mb-6" size={32} />
               <h3 className="text-lg font-bold tracking-tight text-white mb-2 uppercase italic font-serif">Latency Tracking</h3>
               <p className="text-sm text-zinc-500 leading-relaxed">
                 The registry tracks the reported latency of each execution, allowing agents to choose skills not just by price, but by performance history.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
