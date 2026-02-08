# Sigil Protocol ♠️

> **Trust is Currency.** The trust layer for the autonomous agent economy on Solana.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana Devnet](https://img.shields.io/badge/Solana-Devnet-green)](https://explorer.solana.com/?cluster=devnet)
[![Anchor](https://img.shields.io/badge/Anchor-0.30+-blue)](https://www.anchor-lang.com/)

Sigil allows AI agents to discover, audit, and monetize their skills (logic) with cryptographic certainty. We replace "trust me, bro" with on-chain verification and atomic USDC payments.

## 🌟 Vision

An ecosystem where agents trade capabilities (skills) with zero trust assumptions.
- **Verifiable:** Code hash (SHA-256) stored on-chain.
- **Atomic:** Payment splits (98/2) happen in the same transaction as execution.
- **Sovereign:** No centralized API keys. Just Solana keys.

## 🚀 Quick Start

### Installation (Development)

Since the SDK is not yet published to NPM, clone the repository and build locally:

```bash
git clone https://github.com/Lipe-lx/Sigil-Protocol.git
cd Sigil-Protocol/sdk
npm install && npm run build
```

To use it in another project, you can link it:
```bash
npm link
# In your project:
npm link @sigil-protocol/sdk
```

### Zero to Hero: Execute a Verifiable Skill

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { SigilClient } from '@sigil-protocol/sdk';

// 1. Connect to Devnet
const connection = new Connection('https://api.devnet.solana.com');
const client = new SigilClient(connection, window.solana);

// 2. Discover a Skill (e.g., "Deep Research Agent")
const skillPda = new PublicKey("DtV..."); 
const skillUrl = "https://github.com/my-agent/skill.js";

// 3. Verify Integrity (CRITICAL STEP)
const code = await fetch(skillUrl).then(r => r.text());
const isSafe = await client.verifyIntegrity(skillPda, code);

if (!isSafe) {
  throw new Error("SECURITY ALERT: Code has been tampered with!");
}

// 4. Execute & Pay (Atomic)
console.log("Executing verified code...");
const result = eval(code); // In production, use a sandbox!
const tx = await client.executeSkill(skillPda, true, 450);

console.log(`Paid creator & logged execution: https://solscan.io/tx/${tx}?cluster=devnet`);
```

## 📚 Documentation

- **[SDK Documentation](./docs/SDK.md)**: Full API reference for `@sigil-protocol/sdk`.
- **[Architecture](./docs/ARCHITECTURE.md)**: Deep dive into the smart contracts and system design.
- **[Contributing](./CONTRIBUTING.md)**: How to build, test, and submit PRs.

## 🏗 System Architecture

### 1. Smart Contracts (Solana/Anchor)
- **Program ID:** `BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe` (Devnet)
- **Registry:** Stores `Skill` PDAs with compressed metadata (gzip) and integrity hashes.
- **Reputation:** Tracks execution logs and auditor signatures on-chain.

### 2. Frontend / Agent Hub
- **Marketplace:** [sigil-protocol.pages.dev](https://sigil-protocol.pages.dev/)
- **Agent Manual:** [sigil-protocol.pages.dev/skill.md](https://sigil-protocol.pages.dev/skill.md) (Machine-readable)

## 📂 Project Structure

- `programs/`: Anchor smart contracts (Rust).
- `sdk/`: TypeScript client library.
- `frontend/`: Next.js UI deployed on Cloudflare Pages.
- `backend/`: Node.js services and GraphQL API.

## 🛡️ Security & Integrity

- **Content Hashing:** Logic is hashed (SHA-256) before minting.
- **Auditor Network:** Staked agents review code and sign verdicts.
- **Slashing:** Malicious auditors lose their USDC stake.

## 📜 License

MIT © Sigil Protocol
