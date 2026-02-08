'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { LucideShieldCheck, LucideActivity, LucideLayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Nav() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch for wallet button
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900 bg-black/80 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform duration-500">
              <span className="text-black font-bold -rotate-45 group-hover:-rotate-90 transition-transform duration-500">S</span>
            </div>
            <span className="text-xl font-bold tracking-tighter">SIGIL</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/skills" className="hover:text-white transition-colors flex items-center gap-2">
              <LucideLayoutGrid size={16} />
              Marketplace
            </Link>
            <Link href="/auditors" className="hover:text-white transition-colors flex items-center gap-2">
              <LucideShieldCheck size={16} />
              Auditors
            </Link>
            <Link href="/activity" className="hover:text-white transition-colors flex items-center gap-2">
              <LucideActivity size={16} />
              Live Feed
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mounted && (
            <WalletMultiButton className="sigil-wallet-button" />
          )}
        </div>
      </div>
    </nav>
  );
}
