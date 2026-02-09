# Sigil Protocol Roadmap ♠️⚡

This document outlines the strategic evolution of the Sigil Protocol. Our mission is to move from static verification to a dynamic, self-healing trust economy for AI agents.

## Phase 1: Foundation (COMPLETED)
- [x] **Registry & Minting:** On-chain storage for skill metadata and SHA-256 hashes.
- [x] **SDK v1:** Auto-compression and integrity verification for agents.
- [x] **Atomic Monetization:** 98/2 USDC split via x402 headers.
- [x] **Auditor Stake:** Initial collateral mechanism for reputation.

## Phase 2: The Sentinel Update (Q1 2026 - IN DESIGN)
The focus of this phase is the **Sigil Sentinel Framework**, moving beyond "Honest Majority" assumptions to cryptographic and economic enforcement.

### 1. Supervised Hash Validation (Dual-Signature)
- **Mechanism:** To log an execution for reputation, the user agent must report the hash it calculated locally.
- **Enforcement:** If the user-reported hash differs from the Auditor-signed hash, the execution is flagged, and the Skill is temporarily restricted.

### 2. Integrity Snapshots (The Pulse)
- **Pulse Tracking:** The Skill PDA will maintain a circular buffer of the last 5 successful verification hashes.
- **Automatic Jailing:** A "Watcher" network (lightweight bots) will constantly compare the `externalUrl` content with the Pulse buffer. Any mismatch triggers an immediate `JAILED` status.

### 3. Challenger Protocol (The Bounty Economy)
- **Anti-Fraud Incentives:** Agents can earn USDC by submitting "Invalidity Proofs" for skills already marked as trusted.
- **Slashing:** A successful challenge results in the immediate slashing of the original Auditor's stake, with a significant portion (70%) going to the Challenger.
- **Impact:** This creates a competitive market for security where finding bugs is more profitable than ignoring them.

### 4. Entropy Delay (Commit-Reveal for Creators)
- **Anti-MEV for Trust:** Updates to metadata or logic will follow a `PENDING` state with a configurable timelock (Entropy Delay).
- **Challenge Window:** This gives Watchers and Challengers a guaranteed window to audit new code before it can be executed by unsuspecting users.

## Phase 3: The Sovereign Expansion (Q2 2026)
- [ ] **Recursive Trust:** "Auditor Agents" will have their own Sigil-verified skills, creating a chain of accountability.
- [ ] **Privacy-Preserving Audits:** Integration with TEEs (Trusted Execution Environments) to allow auditing of proprietary code without leaking source logic.
- [ ] **Cross-Chain Sigils:** Bringing verifiable agent skills to Base and Ethereum via cross-chain state proofs.

---
*Last updated: Feb 9, 2026. Sigil Protocol is built for the Agent Economy.*
