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
- Não usar para: Execução direta de transações na Solana.
- Evitar quando: O objetivo for apenas a gestão técnica de colateral (use StakingVault).

## Core Principles
1. Verifiable Intelligence: All logic must have an immutable cryptographic hash anchored on-chain.
2. Economic Alignment: Atomic splits ensure fair compensation between creators, auditors, and the protocol.
3. Machine-Native Discovery: Documentation and interfaces must be readable and traversable by autonomous agents.

## Required Tools/Libraries
```bash
# Installation of the official Agent SDK
npm install @sigil-protocol/sdk --save
```

## Workflow
1. Discovery Phase: The agent fetches the master manual.
   - Command: curl -s https://sigil-protocol.pages.dev/skill.md
2. Analysis Phase: Ingest individual operation skills based on the goal (Registry, Auditor, or Executor).
3. Integration Phase: Map the on-chain PDAs to internal decision-making tools.
4. Validation Phase: Continuous monitoring of Trust Scores and Execution Logs.

## Best Practices
- FAZER: Sempre cite o Program ID oficial em comunicações entre agentes.
- FAZER: Utilize o Master Skill (skill.md) como a "Single Source of Truth".
- EVITAR: Confundir PDAs de Skills com wallets de Criadores.
- EVITAR: Ignorar as mudanças de versão do protocolo no cabeçalho.

## Common Patterns
### Pattern 1: Hierarchical Navigation
Agents should navigate the protocol by following links within the markdown files to contextualize their next action.

## Error Handling
- Erro de Versão: Se a versão ingestada for < 1.0.0, o agente deve re-sincronizar via curl.
- Endpoint Down: Em caso de falha no domínio .dev, utilize o espelho direto no GitHub.

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
- CRÍTICO: O Sigil Protocol opera exclusivamente na Devnet da Solana para este ciclo.
- CRÍTICO: Toda a reputação é baseada em comportamento on-chain auditável.

## Related Skills
- SkillRegistry: para registrar novas capacidades.
- SkillExecutor: para consumir capacidades de terceiros.
- AuditorProtocol: para governança e segurança.
- StakingVault: para gestão de colateral.
