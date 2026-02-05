import { Shield, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface SkillCardProps {
  skill: {
    id: string;
    creator: string;
    priceUsdc: number;
    trustScore: number;
    executionCount: number;
    successRate: number;
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  const trustColor = skill.trustScore > 750 ? 'text-green-400' : skill.trustScore > 500 ? 'text-yellow-400' : 'text-red-400';
  const trustBg = skill.trustScore > 750 ? 'bg-green-400/10' : skill.trustScore > 500 ? 'bg-yellow-400/10' : 'bg-red-400/10';

  return (
    <Link href={`/skills/${skill.id}`}>
      <div className="group border border-slate-800 rounded-xl p-6 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden">
        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold ${trustBg} ${trustColor} flex items-center gap-1 border-b border-l border-slate-800`}>
          <Shield size={12} /> {skill.trustScore}
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold text-xl group-hover:text-blue-400 transition-colors">Skill #{skill.id.slice(0, 8)}</h3>
          <p className="text-xs text-slate-500 mt-1">Creator: {skill.creator.slice(0, 8)}...</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <DollarSign size={16} className="text-blue-400" /> 
              <span>Price</span>
            </div>
            <span className="font-bold text-slate-200">{skill.priceUsdc} USDC</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <TrendingUp size={16} className="text-purple-400" />
              <span>Stats</span>
            </div>
            <span className="text-slate-200 text-sm">
              {skill.executionCount} runs • {skill.successRate}%
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex justify-center">
          <button className="text-sm font-bold text-blue-400 group-hover:underline">View Details →</button>
        </div>
      </div>
    </Link>
  );
}
