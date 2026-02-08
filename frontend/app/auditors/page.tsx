'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck as LucideShieldCheck, ExternalLink as LucideExternalLink, Award as LucideAward, Search as LucideSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { BecomeAuditorModal } from '@/components/auditors/BecomeAuditorModal';
import { AuditorDetailsModal } from '@/components/auditors/AuditorDetailsModal';

interface Auditor {
  id: string;
  pubkey: string;
  tier: string;
  skillsAudited: number;
  reputation: number;
  totalEarned: number;
  stakeAmount?: number;
  lockedUntil?: number;
  active?: boolean;
}

export default function AuditorsPage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuditor, setSelectedAuditor] = useState<Auditor | null>(null);

  const getAuditors = async () => {
    setLoading(true);
    try {
      const { SigilRegistryClient } = await import('@/lib/solana/registry-client');
      
      // We don't need a full wallet for fetching data
      const client = new SigilRegistryClient(connection, {
        publicKey: publicKey || null,
        signTransaction: null,
        signAllTransactions: null,
      });

      const onChainAuditors = await client.getAllAuditors();
      console.log("On-chain auditors fetched:", onChainAuditors);

      const mappedAuditors: Auditor[] = onChainAuditors.map((a: any) => {
        const account = a.account;
        // Map Tier enum to string
        let tierLabel = 'Community';
        if (account.tier.tier1) tierLabel = 'Critical';
        if (account.tier.tier2) tierLabel = 'Premium';

        return {
          id: a.publicKey.toBase58(),
          pubkey: account.pubkey.toBase58(),
          tier: tierLabel,
          skillsAudited: account.skillsAudited.toNumber(),
          reputation: account.reputation,
          totalEarned: account.totalEarned.toNumber() / 1_000_000, // Assuming 6 decimals for USDC
          stakeAmount: account.stakeAmount.toNumber(),
          lockedUntil: account.lockedUntil.toNumber(),
          active: account.active
        };
      });

      // Filter to only show active or recently staked auditors if needed
      // For now, let's show all registered
      setAuditors(mappedAuditors.filter(a => a.active || a.stakeAmount! > 0));
    } catch (error) {
      console.error('Error fetching auditors from chain:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connection) {
      getAuditors();
    }
  }, [connection]);

  return (
    <div className="max-w-[1400px] mx-auto px-6">
      <BecomeAuditorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          getAuditors(); // Refresh list
        }} 
      />
      <AuditorDetailsModal 
        auditor={selectedAuditor} 
        isOpen={!!selectedAuditor} 
        onClose={() => setSelectedAuditor(null)} 
      />
      <div className="mb-16">
        <div className="max-w-2xl mb-20">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 font-serif uppercase italic text-white">
            Registry <br />Auditors
          </h1>
          <p className="text-xl text-zinc-500 tracking-tight leading-relaxed font-medium">
            The decentralized network of auditors responsible for verifying skill logic and maintaining the Sigil Trust Layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center">
               <div className="w-10 h-10 border-2 border-zinc-800 border-t-white rounded-full animate-spin mx-auto mb-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Retrieving Network Auditors...</span>
            </div>
          ) : auditors.map((auditor) => (
            <Card 
              key={auditor.id} 
              onClick={() => setSelectedAuditor(auditor)}
              className="group border-zinc-900 bg-black hover:border-white transition-all duration-500 cursor-pointer relative"
            >
              <CardHeader className="border-b border-zinc-900 p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-12 bg-zinc-900 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors duration-500">
                    <LucideShieldCheck size={24} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 block mb-1">Reputation</span>
                    <span className="text-2xl font-bold font-mono text-white">{auditor.reputation}</span>
                  </div>
                </div>
                <CardTitle className="text-lg font-mono text-zinc-400 group-hover:text-white transition-colors truncate">
                  {auditor.pubkey.slice(0, 8)}...{auditor.pubkey.slice(-8)}
                </CardTitle>
                <div className="mt-2">
                   <Badge variant="outline" className="text-[10px] border-zinc-800 uppercase tracking-widest">{auditor.tier}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Total Earned</span>
                  <span className="text-sm font-medium text-white font-mono">{auditor.totalEarned.toFixed(2)} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Staked</span>
                  <span className="text-sm font-medium text-green-500 font-mono">{(auditor.stakeAmount! / 1_000_000).toFixed(0)} USDC</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Audits Done</span>
                  <span className="text-sm font-medium text-white">{auditor.skillsAudited}</span>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <Button 
                    className="flex-1 bg-white text-black hover:bg-zinc-200 border-none uppercase text-[10px] font-black tracking-widest h-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300"
                  >
                    {auditor.active ? "Delegate Stake" : "Inactive"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 border-zinc-800 hover:border-white transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://solscan.io/account/${auditor.pubkey}?cluster=devnet`, '_blank');
                    }}
                  >
                    <LucideExternalLink size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card 
             onClick={() => setIsModalOpen(true)}
             className="border-dashed border-zinc-800 bg-transparent flex flex-col items-center justify-center p-12 text-center hover:border-zinc-500 transition-colors cursor-pointer group">
             <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LucideAward size={32} className="text-zinc-600 group-hover:text-white transition-colors" />
             </div>
             <h3 className="text-xl font-bold tracking-tight mb-2 text-white">Become an Auditor</h3>
             <p className="text-sm text-zinc-500 mb-6">Contribute to the security of the Sigil economy and earn USDC rewards.</p>
             <Button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent double trigger if card also has onClick
                  setIsModalOpen(true);
                }}
                variant="outline" 
                className="border-zinc-800 hover:border-white hover:bg-white hover:text-black uppercase text-[10px] font-bold tracking-[0.2em] h-10 px-8 transition-all duration-500"
             >
                Apply Now
             </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
