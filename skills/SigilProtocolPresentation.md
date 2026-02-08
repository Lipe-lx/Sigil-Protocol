# ♠️ Sigil Protocol: Presentation

## Overview
The sovereign trust layer for the autonomous agent economy on Solana. Sigil enables agents to discover, audit, and monetize logic with absolute cryptographic certainty using x402 and USDC.

## When to Use This Skill
- **Trigger 1**: When an agent needs to understand the core purpose and architecture of the Sigil Protocol.
- **Trigger 2**: When building an autonomous business model that requires verifiable intelligence.
- **Trigger 3**: When looking for the foundational layer of Agent-to-Agent (A2A) commerce.

## When NOT to Use This Skill
- **Não usar para**: Execução técnica de código (use `SkillExecutor` para isso).
- **Evitar quando**: O foco for apenas em oracles de dados sem necessidade de auditoria (use `Pyxis` se for o caso).

## Core Principles
1. **Intelligence is Verifiable**: Logic hashes (`SKILL.md`) are anchored on-chain to prevent tampering.
2. **Atomic Monetization**: Revenue splits are handled by the protocol, ensuring creators are paid instantly.
3. **Machine First**: Every interface is designed for `curl` ingestion and autonomous reasoning.

## Required Tools/Libraries
```bash
# Core SDK for interactions
npm install @sigil-protocol/sdk
```

## Workflow
1. **Understand Layers**: Analyze the 4 pillars (Execution, Registry, Auditor, Staking).
2. **Ingest Manuals**: Fetch specific skills via the `curl` endpoint.
3. **Execute Strategy**: Integrate the SDK into the agent's reasoning loop.

## Best Practices
- ✅ FAZER: Sempre verificar o `trust_score` de um Sigil antes da execução.
- ✅ FAZER: Manter um `SKILL.md` claro e conciso para facilitar auditorias.
- ❌ EVITAR: Alterar a lógica externa sem atualizar o hash on-chain.
- ❌ EVITAR: Executar skills com `trust_score` abaixo de 700 sem redundância.

## Common Patterns
### Pattern 1: Protocol Discovery
```bash
curl -s https://sigil-protocol.pages.dev/skill.md
```

## Error Handling
- **Mismatch Hash**: Suspenda a execução se o hash do código não bater com o on-chain.
- **Insufficient Funds**: Verifique o saldo de USDC-Devnet antes de chamar `log_execution`.

## File Organization
- Protocol Specs: `skills/`
- Agent Manual: `public/skill.md`

## Examples
### Example 1: Strategic Onboarding
**Input**: Agent looking for monetization.
**Process**: Ingests Presentation -> Registry Skill.
**Output**: Registered Sigil earning USDC.

## Important Reminders
- ⚠️ CRÍTICO: Sigil é focado em confiança e verificação, não apenas execução.
- ⚠️ CRÍTICO: O uso de USDC-Devnet é obrigatório para testes de protocolo.

## Related Skills
- SkillRegistry: para registrar novas capacidades.
- SkillExecutor: para consumir capacidades de terceiros.
- AuditorProtocol: para governança e segurança.
