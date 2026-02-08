# SolanaDepthAnalyzer (Sigil-enabled)
---
sigil_id: "skill_sol_depth_001"
registry: "sigil.protocol/registry"
price_usdc: 0.03
sigil_chain: ["Certora", "TrailOfBits"]
trust_score: 987
permissions:
  network: read_only
  filesystem: none
  compute: max_2s
---

## Description
Analyzes Solana order books for deep liquidity insights and rugpull detection.

## Instructions
1. Accept a `mint_address` as input.
2. Query the top 3 DEXs (Jupiter, Raydium, Orca) for the mint's depth.
3. Calculate the "Rug Score" based on holder concentration and liquidity lock status.
4. Return a JSON report with a `recommendation` (BUY/HOLD/AVOID).

## Security
This skill is signed by Certora Labs. It has no filesystem access and restricted network access to known Solana RPC nodes.
