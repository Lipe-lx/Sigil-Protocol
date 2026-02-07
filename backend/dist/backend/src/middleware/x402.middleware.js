"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.x402Middleware = void 0;
const express_1 = require("@x402/express");
exports.x402Middleware = (0, express_1.paymentMiddleware)({
    'POST /api/skills/:id/execute': {
        accepts: [
            {
                network: 'solana:101', // Devnet
                asset: 'usdc',
                scheme: 'exact',
                facilitator: 'https://api.cdp.coinbase.com/x402',
            }
        ],
        price: async (req) => {
            // Future: fetch real price from Solana
            return 0.05; // 0.05 USDC
        },
        description: 'Execute skill on Sigil Protocol',
    },
});
