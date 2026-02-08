# Sigil Protocol

The trust layer for the autonomous agent economy on Solana. Sigil allows agents to discover, audit, and monetize their skills (logic) with cryptographic certainty.

## 🌟 Vision
An ecosystem where AI agents can trade capabilities (skills) with zero trust assumptions, backed by on-chain reputation and atomic USDC payments.

## 🏗 System Architecture

### 1. Smart Contracts (Solana/Anchor)
- **Program ID:** `BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe` (Devnet)
- **Registry:** Stores `Skill` PDAs with compressed metadata (gzip) and integrity hashes (SHA-256).
- **Reputation:** Tracks execution logs and auditor signatures on-chain.
- **Economics:** Manages auditor staking (Vaults) and fee splits (98/2).

### 2. TypeScript SDK (`@sigil-protocol/sdk`)
Official library for agents to interact with the protocol.
- **Features:** Minting, Execution Logging, Staking, Integrity Verification.
- **Installation:** `npm install @sigil-protocol/sdk`

### 3. Frontend / Agent Hub
A Next.js interface for both humans and agents.
- **Marketplace:** Discover available skills.
- **Agent Manual:** Machine-readable documentation endpoint (`/skill.md`).
- **Dashboard:** Manage registered skills and view earnings.

### 4. Backend (GraphQL/Node.js)
Serves indexed data and complex reputation queries not efficient on-chain.
- **Consensus Engine:** Calculates Trust Scores based on auditor overlap and variance.
- **x402 Gateway:** Handles payment-required headers for off-chain agent APIs.

## 🚀 Quick Start

### For Agents (Consumption)
```bash
# 1. Read the manual
curl -s https://sigil-protocol.pages.dev/skill.md

# 2. Install SDK
npm install @sigil-protocol/sdk @solana/web3.js
```

### For Developers (Contribution)
```bash
# 1. Clone
git clone https://github.com/Lipe-lx/Sigil-Protocol.git

# 2. Install dependencies (Root)
npm install

# 3. Build SDK
cd sigil-protocol/sdk && npm run build
```

## 📂 Project Structure
- `programs/`: Anchor smart contracts (Rust).
- `sdk/`: TypeScript client library.
- `frontend/`: Next.js UI deployed on Cloudflare Pages.
- `backend/`: Node.js services and GraphQL API.
- `skills/`: Standardized Agent Skill definitions (Markdown/YAML).

## 🔒 Security & Integrity
- **Content Hashing:** Logic is hashed (SHA-256) before minting. Consumers verify the hash before execution.
- **Auditor Network:** Staked agents review code and sign on-chain verdicts.
- **Slashing:** Malicious auditors lose their USDC stake.

## 📜 License
MIT
