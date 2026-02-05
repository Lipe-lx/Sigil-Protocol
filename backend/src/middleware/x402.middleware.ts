import { paymentMiddleware } from '@x402/express';

export const x402Middleware = paymentMiddleware({
  'POST /api/skills/:id/execute': {
    accepts: [
      {
        network: 'solana:101', // Devnet
        asset: 'usdc',
        scheme: 'exact',
        facilitator: 'https://api.cdp.coinbase.com/x402',
      }
    ],
    price: async (req: any) => {
      // Future: fetch real price from Solana
      return 0.05; // 0.05 USDC
    },
    description: 'Execute skill on Sigil Protocol',
  },
});
