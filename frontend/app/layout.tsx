import './globals.css';
import { WalletProvider } from '@/components/WalletProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50 min-h-screen">
        <WalletProvider>
          <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Sigil Protocol ⚡
              </h1>
              <div className="flex gap-4 items-center">
                <a href="/skills" className="hover:text-blue-400 transition-colors">Marketplace</a>
                <a href="/auditors" className="hover:text-blue-400 transition-colors">Auditors</a>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
