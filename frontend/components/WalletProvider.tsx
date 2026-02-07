'use client';
import { FC, ReactNode, useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles
require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
    
    // Empty wallets array = Standard Wallet detection only (no hardware wallet scanning)
    // This prevents the "connect to local network" browser permission prompt
    const wallets = useMemo(() => [], []);
    
    // Handle wallet errors gracefully
    const onError = useCallback((error: Error) => {
        console.error('Wallet error:', error);
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect onError={onError}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
};
