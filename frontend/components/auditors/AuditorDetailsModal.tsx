'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LucideShieldCheck, 
  LucideAward, 
  LucideActivity, 
  LucideHistory, 
  LucideAlertTriangle,
  LucideCheckCircle2,
  LucideExternalLink,
  LucideCopy
} from "lucide-react";
import { useState } from "react";

import { BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";

const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

// Use the same interface as the page, or import it if shared
export interface Auditor {
  id: string;
  pubkey: string;
  tier: string;
  skillsAudited: number;
  reputation: number;
  totalEarned: number;
  // On-chain fields
  stakeAmount?: number;
  lockedUntil?: number;
  active?: boolean;
  accuracy?: number;
  isVerified?: boolean;
  slashedAmount?: number;
  joinedAt?: string;
}

interface AuditorDetailsModalProps {
  auditor: Auditor | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function AuditorDetailsModal({ auditor, isOpen, onClose, onUpdate }: AuditorDetailsModalProps) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!auditor) return null;

  const isOwner = publicKey?.toBase58() === auditor.pubkey;
  const now = Math.floor(Date.now() / 1000);
  const isLocked = auditor.lockedUntil ? auditor.lockedUntil > now : false;
  const canWithdraw = auditor.lockedUntil ? (auditor.lockedUntil > 0 && now >= auditor.lockedUntil) : false;
  const isUnstaking = auditor.lockedUntil ? auditor.lockedUntil > 0 : false;

  // Mock data for reliability metrics if not present in basic object
  const accuracy = auditor.accuracy || 98.5;
  const stakedAmount = auditor.stakeAmount !== undefined ? auditor.stakeAmount / 1_000_000 : (auditor.tier === 'Critical' ? 5000 : auditor.tier === 'Premium' ? 1000 : 100);
  const isVerified = auditor.isVerified !== undefined ? auditor.isVerified : true; // Most top auditors are verified
  const slashedAmount = auditor.slashedAmount || 0;
  
  // Calculate a trust score based on reputation and history
  const trustScore = Math.min(100, (auditor.reputation / 10) + (auditor.skillsAudited / 5));
  const trustColor = trustScore > 90 ? "text-green-500" : trustScore > 70 ? "text-yellow-500" : "text-red-500";

  const handleCopy = () => {
    navigator.clipboard.writeText(auditor.pubkey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestUnstake = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return;
    setLoading(true);
    setError(null);
    try {
      const { SigilRegistryClient } = await import('@/lib/solana/registry-client');
      const client = new SigilRegistryClient(connection, { publicKey, signTransaction, signAllTransactions });
      const auditorPda = client.deriveAuditorPda(publicKey);
      await client.requestUnstake(auditorPda);
      onUpdate?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Unstake request failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return;
    setLoading(true);
    setError(null);
    try {
      const { SigilRegistryClient } = await import('@/lib/solana/registry-client');
      const client = new SigilRegistryClient(connection, { publicKey, signTransaction, signAllTransactions });
      const auditorPda = client.deriveAuditorPda(publicKey);
      const auditorTokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const vaultTokenAccount = client.deriveVaultPda(USDC_MINT, auditorPda);
      const vaultAuthority = client.deriveVaultAuthorityPda();

      await client.withdrawStake(auditorPda, auditorTokenAccount, vaultTokenAccount, vaultAuthority, USDC_MINT);
      onUpdate?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-black border-zinc-800 text-white p-0 gap-0 overflow-hidden">
        
        {/* Header Section with Identity */}
        <div className="p-6 border-b border-zinc-800 bg-zinc-950/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-inner">
                <LucideShieldCheck className={trustScore > 80 ? "text-white" : "text-zinc-500"} size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-mono tracking-tight text-white">
                    {auditor.pubkey.slice(0, 6)}...{auditor.pubkey.slice(-6)}
                  </DialogTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={handleCopy}>
                    {copied ? <LucideCheckCircle2 size={12} className="text-green-500" /> : <LucideCopy size={12} />}
                  </Button>
                  {isVerified && (
                    <Badge variant="outline" className="bg-green-950/20 text-green-500 border-green-900 text-[10px] uppercase tracking-widest gap-1 py-0.5 h-5">
                      <LucideCheckCircle2 size={10} /> Verified ID
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-[10px] uppercase tracking-widest">
                    {auditor.tier} Tier
                  </Badge>
                  {!auditor.active && (
                    <Badge variant="destructive" className="text-[10px] uppercase tracking-widest gap-1 py-0.5 h-5">
                      Inactive
                    </Badge>
                  )}
                  <span className="text-xs text-zinc-500 font-mono">Joined Feb 2026</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Trust Score</div>
              <div className={`text-4xl font-black font-mono tracking-tighter ${trustColor}`}>
                {trustScore.toFixed(0)}<span className="text-lg text-zinc-600">/100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 border-b border-zinc-800">
          {/* Reputation Stats */}
          <div className="p-6 space-y-4 bg-zinc-950/30">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <LucideAward size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Reputation</span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">{auditor.reputation}</div>
              <p className="text-xs text-zinc-500 mt-1">Global Rank: #42</p>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-[10px] uppercase tracking-widest mb-1 text-zinc-500">
                <span>Accuracy</span>
                <span>{accuracy}%</span>
              </div>
              <Progress value={accuracy} className="h-1 bg-zinc-900" />
            </div>
          </div>

          {/* Financial Stats (Skin in Game) */}
          <div className="p-6 space-y-4 bg-zinc-950/30">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <LucideActivity size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Skin in Game</span>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase text-zinc-600 block mb-0.5">Staked Amount</span>
                <div className="text-lg font-mono text-white flex items-center gap-2">
                  {stakedAmount.toLocaleString()} USDC
                  <LucideShieldCheck size={12} className="text-zinc-500" />
                </div>
                {isUnstaking && (
                  <p className="text-[9px] text-yellow-500 mt-1 uppercase font-bold">
                    {isLocked ? `Unlocking in ${Math.ceil((auditor.lockedUntil! - now) / 86400)} days` : "Ready to withdraw"}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase text-zinc-600 block mb-0.5">Total Earnings</span>
                <div className="text-lg font-mono text-white">{auditor.totalEarned.toFixed(2)} USDC</div>
              </div>
            </div>
          </div>

          {/* Risk Stats */}
          <div className="p-6 space-y-4 bg-zinc-950/30">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <LucideAlertTriangle size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Risk Profile</span>
            </div>
            <div className="space-y-3">
              <div>
                 <span className="text-[10px] uppercase text-zinc-600 block mb-0.5">Slashed Events</span>
                 <div className={`text-lg font-mono ${slashedAmount > 0 ? "text-red-500" : "text-zinc-300"}`}>
                   {slashedAmount > 0 ? `${slashedAmount} USDC` : "None"}
                 </div>
              </div>
              <div>
                 <span className="text-[10px] uppercase text-zinc-600 block mb-0.5">Disputes Lost</span>
                 <div className="text-lg font-mono text-zinc-300">0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/20 border border-red-900 rounded text-red-500 text-xs text-center">
            {error}
          </div>
        )}

        {/* Recent Activity / History */}
        <div className="p-6 bg-black">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white">
              <LucideHistory size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Recent Validations</span>
            </div>
            <Button variant="link" className="text-[10px] uppercase text-zinc-500 hover:text-white h-auto p-0">View All On-Chain</Button>
          </div>
          
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded bg-zinc-900/50 border border-zinc-900 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <div>
                    <div className="text-xs font-mono text-zinc-300">Skill #{1020 + i}: Quantum Arbitrage v{i}.0</div>
                    <div className="text-[10px] text-zinc-600">Verified • {i + 1} days ago</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-white">+ 0.25 USDC</div>
                  <div className="text-[10px] text-zinc-600">Standard Tier</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1 border-zinc-800 hover:bg-zinc-800 uppercase text-[10px] font-bold tracking-widest h-12">
            View on Solscan <LucideExternalLink size={12} className="ml-2" />
          </Button>
          
          {isOwner ? (
            <>
              {canWithdraw ? (
                <Button 
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700 uppercase text-[10px] font-bold tracking-widest h-12"
                >
                  {loading ? "Processing..." : "Withdraw Stake"}
                </Button>
              ) : isUnstaking ? (
                <Button 
                  disabled
                  className="flex-1 bg-zinc-800 text-zinc-500 uppercase text-[10px] font-bold tracking-widest h-12"
                >
                  Unbonding active
                </Button>
              ) : (
                <Button 
                  onClick={handleRequestUnstake}
                  disabled={loading}
                  className="flex-1 bg-red-950 text-red-500 hover:bg-red-900 border border-red-900 uppercase text-[10px] font-bold tracking-widest h-12"
                >
                  {loading ? "Processing..." : "Request Unstake"}
                </Button>
              )}
            </>
          ) : (
            <Button className="flex-1 bg-white text-black hover:bg-zinc-200 uppercase text-[10px] font-bold tracking-widest h-12">
              Delegate Stake
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
