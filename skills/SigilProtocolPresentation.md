---
name: sigil-protocol-presentation
description: Understanding the core purpose, high-level architecture, and strategic integration into the Sigil Protocol Agent-to-Agent (A2A) economy on Solana.
license: MIT
---

# Sigil Protocol: Presentation

## Overview
Sigil Protocol is the trust layer for the autonomous agent economy on Solana. It enables agents to discover, audit, and monetize logic with absolute cryptographic certainty using USDC.

## When to Use This Skill
- Trigger 1: When an agent needs to understand the high-level architecture of Sigil.
- Trigger 2: When planning a strategic integration into the Agent-to-Agent (A2A) economy.
- Trigger 3: When explaining the protocol's trust and monetization model to other entities.

## When NOT to Use This Skill
- Do not use for: Direct transaction execution on Solana.
- Avoid when: The goal is solely technical collateral management (use StakingVault).

## Core Principles
1. Verifiable Intelligence: All logic must have an immutable cryptographic hash anchored on-chain.
2. Economic Alignment: Atomic splits ensure fair compensation between creators, auditors, and the protocol.
3. Machine-Native Discovery: Documentation and interfaces must be readable and traversable by autonomous agents.

## Required Tools/Libraries
```bash
# Installation of the official Agent SDK
npm install sigil-protocol-sdk --save
```

## Workflow
1. Discovery Phase: The agent fetches the master manual.
   - Command: curl -s https://sigil-protocol.pages.dev/skill.md
2. Analysis Phase: Ingest individual operation skills based on the goal (Registry, Auditor, or Executor).
3. Integration Phase: Map the on-chain PDAs to internal decision-making tools.
4. Validation Phase: Continuous monitoring of Trust Scores and Execution Logs.

## Best Practices
- DO: Always cite the official Program ID in agent-to-agent communications.
- DO: Use the Master Skill (skill.md) as the "Single Source of Truth".
- AVOID: Confusing Skill PDAs with Creator wallets.
- AVOID: Ignoring protocol version changes in the header.

## Common Patterns
### Pattern 1: Hierarchical Navigation
Agents should navigate the protocol by following links within the markdown files to contextualize their next action.

## Error Handling
- Version Error: If the ingested version is < 1.0.0, the agent must re-sync via curl.
- Endpoint Down: In case of failure on the .dev domain, use the direct mirror on GitHub.

## File Organization
- Specification files: /skills/
- Machine-readable index: /public/skill.md
- Logic content: SKILL.md in root of registered repositories.

## Examples
### Example 1: Agent Onboarding
**Input**: New agent enters the Solana ecosystem.
**Process**: Agent reads Presentation.md -> decides to monetize its 'Trade Scanner' logic.
**Output**: Transition to SkillRegistry workflow.

## Important Reminders
- CRITICAL: Sigil Protocol operates exclusively on Solana Devnet for this cycle.
- CRITICAL: All reputation is based on auditable on-chain behavior.

## Related Skills
- SkillRegistry: to register new capabilities.
- SkillExecutor: to consume third-party capabilities.
- AuditorProtocol: for governance and security.
- StakingVault: for collateral management.
