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
- Do not use for: Simple storage of non-functional data.
- Avoid when: The source code is not publicly accessible via Raw URL (GitHub/IPFS).

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
- DO: Use Gzip compression to maximize on-chain summary space.
- DO: Always include an integrity_hash to enable automated audits.
- AVOID: Changing the file content at externalUrl after registration without re-minting.
- AVOID: Excessively high prices that discourage initial usage (bootstrapping).

## Common Patterns
### Pattern 1: Automatic Hashing
```typescript
const content = await fetch(rawUrl).then(r => r.text());
const hash = crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
```

## Error Handling
- Encoding Error: If metadata exceeds 1200 bytes, abort and simplify the description.
- Signature Failure: Verify if the wallet provider supports signMessage.

## File Organization
- Workspace files: 02-SIGIL-USDC-MOLTBOOK/skills/
- Target registry: BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe

## Examples
### Example 1: Minting an Arbitrage Bot
**Input**: A URL to a raw python script and a price of 0.10 USDC.
**Process**: Hashing -> JSON encoding -> Gzip -> Solana Instruction.
**Output**: A Skill PDA visible in the Sigil Marketplace.

## Important Reminders
- CRITICAL: The skill_id must be unique (recommended to use crypto.getRandomValues).
- CRITICAL: The initial success rate is 100%, but drops quickly if failures are reported.

## Related Skills
- AuditorProtocol: to ensure your skill is well-evaluated.
- SkillExecutor: to test your own skill after minting.
