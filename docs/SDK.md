# Sigil Protocol SDK Documentation

The official TypeScript SDK for interacting with the Sigil Protocol on Solana.

**Package:** `@sigil-protocol/sdk`
**Version:** 1.0.0
**License:** MIT

## Installation

Since this is a pre-release hackathon version, install directly from the repository or build locally:

```bash
git clone https://github.com/Lipe-lx/Sigil-Protocol.git
cd Sigil-Protocol
npm install
cd sdk
npm run build
npm link # Makes @sigil-protocol/sdk available locally
```

## Quick Start

Initialize the client with a Solana connection and a wallet adapter (or Keypair).

```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { SigilClient } from '@sigil-protocol/sdk';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = new Wallet(Keypair.generate()); // Or use your browser wallet adapter
const client = new SigilClient(connection, wallet);
```

## Core Methods

### 1. Register a Skill (`registerSkill`)

Mints a new Skill PDA on-chain. This function automatically:
- Calculates the SHA-256 integrity hash of your logic.
- Compresses metadata using Gzip to save space.
- Signs the transaction.

```typescript
const txSignature = await client.registerSkill({
  name: "Deep Research Agent",
  description: "Performs recursive web searches and summarizes findings.",
  priceUsdc: 5.00, // Cost per execution
  externalUrl: "https://github.com/my-agent/skill.js",
  logicContent: "console.log('Doing research...');" // The actual code string
});

console.log(`Skill Minted: ${txSignature}`);
```

### 2. Execute a Skill (`executeSkill`)

Records an execution on-chain and handles the atomic payment split (98% to creator, 2% to protocol).

```typescript
import { PublicKey } from '@solana/web3.js';

const skillPda = new PublicKey("...");
const success = true;
const latencyMs = 450;

const tx = await client.executeSkill(skillPda, success, latencyMs);
console.log(`Execution Logged: ${tx}`);
```

### 3. Verify Integrity (`verifyIntegrity`)

**Critical Security Step.** Before running any code from the registry, verify that it matches the on-chain hash. This prevents "bait-and-switch" attacks where a creator changes the code after audit.

```typescript
const codeFromUrl = await fetch("https://github.com/my-agent/skill.js").then(r => r.text());
const isSafe = await client.verifyIntegrity(skillPda, codeFromUrl);

if (isSafe) {
  console.log("Hash matches! Executing code...");
  eval(codeFromUrl); // Sandbox this in production!
} else {
  console.error("SECURITY ALERT: Code does not match on-chain hash!");
}
```

### 4. Staking (`stake`)

Auditors must stake USDC to participate in the reputation network.

```typescript
const amount = 100; // 100 USDC
const tx = await client.stake(amount);
```

## Error Handling

The SDK throws standard Anchor errors. Common codes to watch for:

- `ConstraintRaw`: The integrity hash check failed (if verified on-chain).
- `AccountNotInitialized`: The Skill PDA or Token Account doesn't exist.
- `0x1`: Insufficient funds (SOL or USDC).

## Environment Support

- **Browser:** Fully supported (uses native `CompressionStream`).
- **Node.js:** Requires Node v18+ for `fetch` and `crypto` globals.

---
*For more details, see the [Architecture Overview](./ARCHITECTURE.md).*
