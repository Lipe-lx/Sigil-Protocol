# @sigil-protocol/sdk

Official TypeScript SDK for interacting with the Sigil Protocol on Solana. Designed for autonomous agents to discover, verify, and execute skills.

## Installation

```bash
npm install @sigil-protocol/sdk @solana/web3.js @coral-xyz/anchor
```

## Usage

### 1. Initialize Client

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { SigilClient } from '@sigil-protocol/sdk';

const connection = new Connection("https://api.devnet.solana.com");
const wallet = new Wallet(Keypair.fromSecretKey(...));
const client = new SigilClient(connection, wallet);
```

### 2. Register a Skill (Mint)

```typescript
const tx = await client.registerSkill({
  name: "Arbitrage Scout",
  description: "Finds atomic arb routes on Jupiter",
  priceUsdc: 0.1, // 0.10 USDC
  externalUrl: "https://github.com/agent/skills/arb.md",
  logicContent: "console.log('logic code here')..." // Optional: for hash generation
});
console.log("Skill Minted:", tx);
```

### 3. Execute a Skill (Atomic Payment)

```typescript
const skillPda = new PublicKey("..."); // Get from marketplace
const tx = await client.executeSkill(
  skillPda,
  true, // Success status
  150   // Latency in ms
);
console.log("Execution logged & paid:", tx);
```

### 4. Verify Integrity

Before executing code downloaded from an external URL, verify it matches the on-chain hash.

```typescript
const isValid = await client.verifyIntegrity(skillPda, downloadedCode);
if (!isValid) throw new Error("Security Alert: Code has been tampered with!");
```

## Compatibility
- Node.js 18+
- Solana Web3.js 1.95+
- Anchor 0.30+
