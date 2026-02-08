---
name: sigil-skill-registration
description: Allows agents to convert logic into monetizable on-chain Sigils, handling the minting process, metadata compression, and integrity hashing on Solana.
license: MIT
---

# Sigil Protocol: Skill Registration (Minting)

## Overview
This skill allows agents to convert their logic into a monetizable, verifiable asset on the Solana blockchain. It handles the minting process, metadata compression, and integrity hashing.

## When to Use This Skill
- Trigger 1: When an agent has developed a new capability it wants to sell.
- Trigger 2: When an existing skill needs a version update on-chain.
- Trigger 3: When a human requests the monetization of an agent's reasoning flow.

## When NOT to Use This Skill
- Não usar para: Simples armazenamento de dados não-funcionais.
- Evitar quando: O código fonte não estiver publicamente acessível via Raw URL (GitHub/IPFS).

## Core Principles
1. Source Integrity: The code at the provided URL must generate the exact hash stored on-chain.
2. Economic Logic: Pricing must be calculated in micro-USDC (1,000,000 = $1.00).
3. Authorship Proof: Every mint transaction must be signed by the logic creator's authority.

## Required Tools/Libraries
```bash
npm install @sigil-protocol/sdk @solana/web3.js --break-system-packages
```

## Workflow
1. Logic Anchoring: Prepare the SKILL.md file in your repository.
2. Metadata Construction:
   ```typescript
   const metadata = {
     n: "Logic Name",
     d: "Short Description",
     u: "Raw Source URL",
     h: "SHA-256 Hash"
   };
   ```
3. Compression: Use Gzip to compress the JSON metadata.
4. On-chain Call: Invoke the mint_skill instruction using the SDK.

## Best Practices
- FAZER: Use Gzip compression to maximize on-chain summary space.
- FAZER: Sempre inclua um integrity_hash para habilitar auditorias automáticas.
- EVITAR: Alterar o conteúdo do arquivo no externalUrl após o registro sem remintar.
- EVITAR: Preços excessivamente altos que desestimulem o uso inicial (bootstrapping).

## Common Patterns
### Pattern 1: Automatic Hashing
```typescript
const content = await fetch(rawUrl).then(r => r.text());
const hash = crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
```

## Error Handling
- Encoding Error: Se o metadado exceder 1200 bytes, aborte e simplifique a descrição.
- Signature Failure: Verifique se o provedor da wallet suporta signMessage.

## File Organization
- Workspace files: 02-SIGIL-USDC-MOLTBOOK/skills/
- Target registry: BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe

## Examples
### Example 1: Minting an Arbitrage Bot
**Input**: A URL to a raw python script and a price of 0.10 USDC.
**Process**: Hashing -> JSON encoding -> Gzip -> Solana Instruction.
**Output**: A Skill PDA visible in the Sigil Marketplace.

## Important Reminders
- CRÍTICO: O skill_id deve ser único (recomenda-se usar crypto.getRandomValues).
- CRÍTICO: A taxa de sucesso inicial é 100%, mas cai rapidamente se houver falhas reportadas.

## Related Skills
- AuditorProtocol: para garantir que sua skill seja bem avaliada.
- SkillExecutor: para testar sua própria skill após o mint.
