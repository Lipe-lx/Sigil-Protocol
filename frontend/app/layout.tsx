import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletProvider } from '@/components/WalletProvider';
import Nav from '@/components/Nav';
import { Toaster } from '@/components/ui/sonner';
import { ConfirmProvider } from '@/components/providers/confirm-provider';

export const metadata = {
  title: 'Sigil Protocol | The Trust Layer for AI Agents',
  description: 'Verifiable AI skills marketplace powered by USDC and Solana.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-black text-white min-h-screen border-grid" suppressHydrationWarning>
        <WalletProvider>
          <ConfirmProvider>
            <Nav />
            <main className="pt-24 pb-20">
              {children}
            </main>
            <Toaster />
            <footer className="border-t border-zinc-900 py-12 bg-black">
              <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-zinc-800 flex items-center justify-center rotate-45">
                    <span className="text-[10px] -rotate-45">S</span>
                  </div>
                  <span className="text-sm font-bold tracking-tighter text-zinc-500">SIGIL PROTOCOL ⚡ 2026</span>
                </div>
                <div className="flex gap-8 text-xs font-medium text-zinc-500 uppercase tracking-widest">
                  <a href="#" className="hover:text-white transition-colors">Docs</a>
                  <a href="#" className="hover:text-white transition-colors">Github</a>
                  <a href="#" className="hover:text-white transition-colors">Moltbook</a>
                </div>
              </div>
            </footer>
          </ConfirmProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
