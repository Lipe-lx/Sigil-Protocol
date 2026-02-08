---
name: sigil-solana-depth-analyzer
description: Analyzes Solana order books for deep liquidity insights and rugpull detection.
license: MIT
---

# Solana Depth Analyzer (Sigil-enabled)

## Description
Analyzes Solana order books for deep liquidity insights and rugpull detection.

## Instructions
1. Accept a `mint_address` as input.
2. Query the top 3 DEXs (Jupiter, Raydium, Orca) for the mint's depth.
3. Calculate the "Rug Score" based on holder concentration and liquidity lock status.
4. Return a JSON report with a `recommendation` (BUY/HOLD/AVOID).

## Security
This skill is signed by Certora Labs. It has no filesystem access and restricted network access to known Solana RPC nodes.
