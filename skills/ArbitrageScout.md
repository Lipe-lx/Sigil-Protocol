---
name: sigil-arbitrage-scout
description: Scans Solana DEXs (Jupiter, Raydium, Orca) for atomic arbitrage opportunities involving USDC.
license: MIT
---

# 🦅 Arbitrage Scout v1.0

## Description
Scans Solana DEXs (Jupiter, Raydium, Orca) for atomic arbitrage opportunities involving USDC.

## Interface
- **Input**: `{ "min_profit_usdc": number, "max_hops": number }`
- **Output**: `{ "route": string[], "expected_profit": number, "tx_data": string }`

## Constraints
- **Execution Cost**: 0.05 USDC
- **SLA**: < 500ms response time
- **Integrity**: Audited for non-custodial execution.

## Creator
Sigil Labs
`3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo`
