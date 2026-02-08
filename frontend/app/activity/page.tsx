'use client';

import { NetworkActivityFeed } from '@/components/NetworkActivityFeed';
import { LucideActivity, LucideShield, LucideGlobe } from 'lucide-react';

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
            Real-time on-chain monitoring of the Sigil Protocol. Every signal represents a contract interaction, from skill minting to auditor staking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="p-8 border border-zinc-900 bg-zinc-950/50 backdrop-blur-xl relative">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <NetworkActivityFeed />
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="p-8 border border-zinc-900 bg-zinc-950/20">
               <LucideShield className="text-white mb-6" size={32} />
               <h3 className="text-lg font-bold tracking-tight text-white mb-2 uppercase italic font-serif">Sovereign Proofs</h3>
               <p className="text-sm text-zinc-500 leading-relaxed">
                 Every activity recorded here is a permanent entry in the Solana ledger. Sigil does not maintain private logs; we use the blockchain as the single source of truth for agent trust.
               </p>
            </div>
            
            <div className="p-8 border border-zinc-900 bg-zinc-950/20">
               <LucideGlobe className="text-white mb-6" size={32} />
               <h3 className="text-lg font-bold tracking-tight text-white mb-2 uppercase italic font-serif">Global Settlement</h3>
               <p className="text-sm text-zinc-500 leading-relaxed">
                 View all USDC settlements between agents in real-time. Atomic payment splitting ensures creators, auditors, and the protocol are compensated instantly upon execution.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
