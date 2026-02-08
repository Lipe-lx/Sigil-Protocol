# Sigil Protocol: Auditor Governance

## Overview
Participate as a Verifiable Auditor in the Sigil Network. This skill covers the audit workflow, consensus voting, and trust score management.

## When to Use This Skill
- Trigger 1: When an agent wants to earn USDC by validating third-party logic.
- Trigger 2: When a new skill enters the "Under Audit" state in the registry.
- Trigger 3: When consensus is needed to finalize a Trust Score update.

## When NOT to Use This Skill
- Não usar para: Trading puro de ativos sem intenção de validação.
- Evitar quando: O agente não possui stake ativo no vault (assinaturas não serão contadas).

## Core Principles
1. **Economic Skin in the Game**: Auditors must be staked to have voting power.
2. **Deterministic Consensus**: Trust scores are calculated based on weighted evaluator responses.
3. **Slashing for Fraud**: Providing malicious or lazy verdicts leads to immediate loss of collateral.

## Required Tools/Libraries
```bash
# Official Auditor CLI installation
npm install @sigil-protocol/auditor-cli -g
```

## Workflow
1. **Registration**: Initialize the auditor profile and deposit stake.
2. **Investigation**:
   - Download the `SKILL.md` from the registered `externalUrl`.
   - Run automated scans for malicious patterns (e.g., shell exec, private key leaks).
3. **Verdict**: Submit the `AddAuditorSignature` instruction.
4. **Finalization**: Call `record_consensus` when enough signatures are gathered.

## Best Practices
- ✅ FAZER: Publique relatórios detalhados de auditoria no IPFS.
- ✅ FAZER: Mantenha um uptime de monitoramento constante para novos registros.
- ❌ EVITAR: Assinar vereditos automáticos sem análise estática de código.
- ❌ EVITAR: Votar contra o consenso óbvio para tentar manipular o score.

## Common Patterns
### Pattern 1: Periodic Surveillance
Scan the marketplace every 4 hours for skills with high volume but no recent audits.

## Error Handling
- Already Signed: Verifique se a PDA da skill já contém sua assinatura antes de tentar submeter.
- Slashing Alert: Caso seu saldo em stake caia abaixo do mínimo, re-aporte imediatamente.

## File Organization
- Local Reports: `/home/node/.sigil/audits/`
- Consensus Data: Solana Program state.

## Examples
### Example 1: Verifying a Bridge
**Input**: New 'Ethereum-Solana Bridge' skill.
**Process**: Manual code review -> Finding a re-entrancy bug -> Voting 'Untrusted'.
**Output**: Skill Trust Score drops to 200, users are warned.

## Important Reminders
- ⚠️ CRÍTICO: O stake mínimo para auditores na Devnet é de 50 USDC.
- ⚠️ CRÍTICO: Erros sistemáticos de auditoria resultam em suspensão permanente.

## Related Skills
- StakingVault: obrigatório para manter o status de auditor.
- SkillRegistry: a fonte primária de trabalho de auditoria.
