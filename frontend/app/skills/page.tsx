'use client';
import { useState, useEffect } from 'react';
import { SkillCard } from '@/components/SkillCard';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface Skill {
  id: string;
  creator: string;
  priceUsdc: number;
  trustScore: number;
  executionCount: number;
  successRate: number;
}

export default function SkillsPage() {
  const { connected } = useWallet();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo/dev, we'll use some mock data if the backend is not yet ready
    setSkills([
      {
        id: '1',
        creator: 'BWpp...jmwe',
        priceUsdc: 0.05,
        trustScore: 967,
        executionCount: 1847,
        successRate: 99.8
      },
      {
        id: '2',
        creator: 'BWpp...jmwe',
        priceUsdc: 0.01,
        trustScore: 0,
        executionCount: 42,
        successRate: 10.5
      }
    ]);
    setLoading(false);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">Skill Marketplace</h1>
          <p className="text-slate-400">Discover and execute audited AI skills with USDC.</p>
        </div>
        <WalletMultiButton />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
