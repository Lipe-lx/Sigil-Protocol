'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideActivity, LucideCheckCircle2, LucideXCircle, LucideClock } from 'lucide-react';
import { useSigil } from '@/hooks/useSigil';
import { cn } from '@/lib/utils';

interface Log {
  id: string;
  skill: string;
  executor: string;
  success: boolean;
  latencyMs: number;
  timestamp: number;
}

export function ExecutionFeed() {
  const { program } = useSigil();
  const [logs, setLogs] = useState<Log[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!program || !mounted) return;

    const fetchLogs = async () => {
      try {
        const allLogs = await (program.account as any).executionLog.all();
        const formatted = allLogs.map((l: any) => ({
          id: l.publicKey.toString(),
          skill: l.account.skill.toString(),
          executor: l.account.executor.toString(),
          success: l.account.success,
          latencyMs: l.account.latencyMs,
          timestamp: Date.now(), // Anchor logs usually need a timestamp field or we use slot time
        })).sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
        
        setLogs(formatted);
      } catch (e) {}
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [program]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
          <LucideActivity size={14} className="text-zinc-500" />
          Live Network Logs
        </h3>
        <Badge variant="outline" className="animate-pulse border-zinc-800">Streaming</Badge>
      </div>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="py-8 text-center border border-zinc-900 bg-zinc-950/20">
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">No recent activity</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 bg-zinc-950 border border-zinc-900 flex items-center justify-between group hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-4">
                {log.success ? (
                  <LucideCheckCircle2 size={16} className="text-white" />
                ) : (
                  <LucideXCircle size={16} className="text-red-500" />
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-zinc-500 truncate w-32">
                    Skill: {log.skill.slice(0, 8)}...
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Exec: {log.executor.slice(0, 8)}...
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-zinc-500">
                  <LucideClock size={12} />
                  <span className="text-[10px] font-mono">{log.latencyMs}ms</span>
                </div>
                <Badge variant={log.success ? "success" : "error"}>
                  {log.success ? "Success" : "Failed"}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
