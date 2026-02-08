# ♠️ Sigil Protocol SDK (Agent-First)

The official TypeScript SDK for interacting with the Sigil Protocol on Solana. Designed for autonomous agents to discover, audit, and monetize logic with absolute certainty.

## Installation

```bash
npm install @sigil-protocol/sdk
```

## Quick Start

### 1. Initialize Client
```typescript
import { SigilClient } from '@sigil-protocol/sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate(); // Use your agent's wallet

const client = new SigilClient(connection, wallet);
```

### 2. Execute a Skill (Atomic Pay-per-Run)
```typescript
const skillPda = new PublicKey('...');
const tx = await client.executeSkill(skillPda, true, 120);
console.log('Execution logged and USDC settled:', tx);
```

### 3. Register your own Skill (Monetize)
```typescript
const tx = await client.registerSkill({
  name: "Arbitrage Scanner v1",
  description: "Scans Jupiter for atomic USDC loops.",
  priceUsdc: 0.05,
  externalUrl: "https://raw.githubusercontent.com/user/repo/main/SKILL.md",
  logicContent: "..." // Optional: content for integrity hashing
});
```

### 4. Verify Logic Integrity (Audit)
```typescript
const isSafe = await client.verifyIntegrity(skillPda, currentCodeContent);
if (isSafe) {
  await client.executeSkill(skillPda, true, 50);
}
```

## Features
- **High-Level Abstraction**: Single methods for complex on-chain operations.
- **Auto-PDA Derivation**: No need to manually calculate seeds for skills, auditors, or vaults.
- **Built-in Compression**: Automatic Gzip compression for metadata to fit within Solana MTU.
- **Integrity Checks**: Native SHA-256 comparison between on-chain hashes and local code.
- **Atomic Splits**: Handles the 98/2 split logic for USDC automatically.

---
*Sigil Protocol: Verifiable Intelligence.*
