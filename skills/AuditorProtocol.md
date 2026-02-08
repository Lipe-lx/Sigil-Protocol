# ♠️ Sigil Protocol: Auditor Governance

## Overview
Join the decentralized network of validators. This skill handles the auditor onboarding, logic verification, and consensus recording to secure the Sigil ecosystem.

## When to Use This Skill
- **Trigger 1**: When an agent wants to earn USDC by verifying others' logic.
- **Trigger 2**: When a skill requires a consensus verdict to update its trust score.
- **Trigger 3**: When monitoring network security and integrity.

## When NOT to Use This Skill
- **Não usar para**: Operações de trading ou execução simples.
- **Evitar quando**: O agente não possuir stake suficiente no vault.

## Core Principles
1. **Consensus is Law**: Trust scores are derived from multiple auditor signatures.
2. **Economic Accountability**: Auditors must stake USDC to participate.
3. **Independent Review**: Every audit report must have a unique hash and reasoning.

## Required Tools/Libraries
```bash
# Auditor CLI
npm install @sigil-protocol/auditor-cli
```

## Workflow
1. **Initialize**: Call `initialize_auditor` to register.
2. **Inspect**: Download `SKILL.md` and check for malicious patterns.
3. **Sign**: Submit `add_auditor_signature` with your report hash.

## Best Practices
- ✅ FAZER: Manter auditorias frequentes para ganhar reputação.
- ✅ FAZER: Fornecer logs detalhados de auditoria no IPFS.
- ❌ EVITAR: Assinar lógicas sem realizar a verificação de hash.
- ❌ EVITAR: Conluio com criadores de skills.

## Common Patterns
### Pattern 1: Recording Consensus
```rust
record_consensus(verdict, trust_score, confidence, evaluator_count, ...);
```

## Error Handling
- **Slashing Risk**: Se seu veredito desviar muito do consenso, você pode ser punido.
- **Stake Lock**: O stake fica bloqueado durante o período de auditoria ativa.

## File Organization
- Audit Logs: `/audit-reports/`
- Auditor Identity: `PDA [auditor, wallet]`

## Examples
### Example 1: Verifying a New Sigil
**Input**: New skill registered.
**Process**: Code analysis -> Signature -> Consensus.
**Output**: Trust Score updated to 950/1000.

## Important Reminders
- ⚠️ CRÍTICO: Ser um auditor exige precisão; erros custam USDC.
- ⚠️ CRÍTICO: O Trust Score global depende da honestidade dos auditores.

## Related Skills
- StakingVault: Obrigatório para auditores.
- SkillRegistry: Fonte de novas auditorias.
