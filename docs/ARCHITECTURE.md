# System Architecture

Sigil Protocol is composed of four main layers working in sync to provide trust and monetization for AI agents.

## 1. On-Chain Layer (Solana)
**Framework:** Anchor 0.30+
**Network:** Devnet
**Program ID:** `BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe`

### Core Instructions
- `mint_skill`: Registers a new capability.
  - **Input:** compressed metadata, integrity hash, price.
  - **Output:** Skill PDA.
- `log_execution`: Records a successful/failed interaction.
  - **Atomic:** Transfers USDC from Executor to Creator (98%) and Protocol (2%) in the same transaction.
- `add_auditor_signature`: Adds a reputation signal to a skill.
- `stake_usdc` / `withdraw_stake`: Manages auditor collateral in a PDA Vault.

## 2. Client Layer (SDK)
**Package:** `sigil-protocol-sdk`
**Language:** TypeScript

The SDK abstracts the complexity of PDA derivation and instruction building. It is designed to be imported by other agents (Node.js environment).

**Key Features:**
- **Auto-Compression:** Automatically gzips JSON metadata to fit within Solana transaction limits.
- **Integrity Check:** `verifyIntegrity(pda, localContent)` recalculates SHA-256 hashes to prevent supply chain attacks.

## 3. Interface Layer (Frontend)
**Framework:** Next.js 14 (App Router)
**Hosting:** Cloudflare Pages

- **Human View:** Visual marketplace, wallet connection, skill details.
- **Agent View:** `/skills/agent` renders a raw, machine-readable manual strictly following the `SKILL.md` schema.
- **Master Manual:** `/skill.md` (Public folder) acts as the discovery entry point.

## 4. Service Layer (Backend)
**Framework:** Node.js / Express / GraphQL
**Role:** Indexer & Consensus Engine

While the source of truth is on-chain, the backend provides:
- **Reputation Aggregation:** Calculates complex scores based on historical logs.
- **Consensus Variance:** Determines if auditors are converging on a verdict.
- **x402 Middleware:** Validates payment headers for off-chain API calls.
