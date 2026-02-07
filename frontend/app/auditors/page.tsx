'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LucideShieldCheck, LucideExternalLink, LucideAward, LucideSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchGraphQL } from '@/lib/graphql';

interface Auditor {
  id: string;
  pubkey: string;
  tier: string;
  skillsAudited: number;
  reputation: number;
  totalEarned: number;
}

export default function AuditorsPage() {
  const [auditors, setAuditors] = useState<Auditor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAuditors = async () => {
      try {
        const data = await fetchGraphQL<{ auditors: Auditor[] }>(`
          query GetAuditors {
            auditors(activeOnly: true) {
              id
              pubkey
              tier
              skillsAudited
              reputation
              totalEarned
            }
          }
        `);
        setAuditors(data?.auditors || []);
      } catch (error) {
        console.error('Error fetching auditors:', error);
      } finally {
        setLoading(false);
      }
    };

    getAuditors();
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto px-6">
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
            <Card key={auditor.id} className="group border-zinc-900 bg-black hover:border-white transition-all duration-500">
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
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Audits Done</span>
                  <span className="text-sm font-medium text-white">{auditor.skillsAudited}</span>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <Button className="flex-1 uppercase text-[10px] font-black tracking-widest h-10">
                    Stake to Vote
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 border-zinc-900">
                    <LucideExternalLink size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed border-zinc-800 bg-transparent flex flex-col items-center justify-center p-12 text-center hover:border-zinc-500 transition-colors cursor-pointer group">
             <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LucideAward size={32} className="text-zinc-600 group-hover:text-white transition-colors" />
             </div>
             <h3 className="text-xl font-bold tracking-tight mb-2 text-white">Become an Auditor</h3>
             <p className="text-sm text-zinc-500 mb-6">Contribute to the security of the Sigil economy and earn USDC rewards.</p>
             <Button variant="outline" className="border-zinc-800 uppercase text-[10px] font-bold tracking-[0.2em]">Apply Now</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
