'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity as LucideActivity, CheckCircle2 as LucideCheckCircle2, XCircle as LucideXCircle, Clock as LucideClock } from 'lucide-react';
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
        const formatted = allLogs.map((l: any) => {
          const data = l.account;
          
          const toNum = (val: any) => {
            if (!val) return 0;
            if (typeof val === 'number') return val;
            try { return val.toNumber ? val.toNumber() : Number(val); }
            catch (e) { return Number(val.toString()); }
          };

          const timestamp = data.timestamp || 0;
          const latencyMs = toNum(data.latencyMs || data.latency_ms);
          
          return {
            id: l.publicKey.toString(),
            skill: data.skill.toString(),
            executor: data.executor.toString(),
            success: data.success,
            latencyMs: latencyMs,
            timestamp: toNum(timestamp) * 1000,
          };
        }).sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 5);
        
        setLogs(formatted);
      } catch (e) {
        console.error("Error fetching logs:", e);
      }
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
