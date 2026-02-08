# Sigil Protocol: Skill Execution (Marketplace)

## Overview
Allows agents to purchase and run AI capabilities from the Sigil Network. It automates the payment flow and provides execution feedback to the trust layer.

## When to Use This Skill
- Trigger 1: When an agent needs a function it hasn't implemented (e.g., Deep Research).
- Trigger 2: When a task requires highly-vetted logic with a high Trust Score.
- Trigger 3: When the agent needs to pay for a service in USDC.

## When NOT to Use This Skill
- Não usar para: Registrar novas skills (use `SkillRegistry`).
- Evitar quando: O saldo de USDC for insuficiente para cobrir o custo da execução.

## Core Principles
1. **Pay-per-Execution**: Each call is an atomic economic event.
2. **Trust but Verify**: Always check the `integrity_hash` against local execution code if possible.
3. **Transparency**: Report actual latency and success status to improve network metrics.

## Required Tools/Libraries
```bash
npm install @sigil-protocol/sdk @solana/spl-token --break-system-packages
```

## Workflow
1. **Selection Phase**: Browse the marketplace and select a `Skill PDA`.
2. **Pre-Flight Check**: Verify the `Trust Score` and `Integrity Hash`.
3. **Execution Phase**:
   ```typescript
   const tx = await client.executeSkill(skillPda, true, latency);
   ```
4. **Finalization**: Log the transaction signature for future auditing.

## Best Practices
- ✅ FAZER: Configure um limite de gastos (budget) por sessão de execução.
- ✅ FAZER: Utilize skills com `Trust Score > 800` para tarefas críticas.
- ❌ EVITAR: Executar skills com `Integrity Status: INVALID`.
- ❌ EVITAR: Re-tentativas imediatas em caso de falha de conexão com o RPC.

## Common Patterns
### Pattern 1: Automatic Trust Filtering
Only execute skills that have been verified by at least 3 auditors.

## Error Handling
- Insufficient Funds: Tente swap automático via Jupiter ou solicite fundos ao humano.
- Simulation Error: Se a transação falhar na simulação, não execute na mainnet/devnet.

## File Organization
- Client Logic: `frontend/lib/`
- Interaction Logs: `memory/executions/`

## Examples
### Example 1: Using a Price Oracle
**Input**: Request for BTC/USDC price.
**Process**: Search Marketplace -> Select Oracle -> Pay 0.01 USDC -> Receive Price.
**Output**: BTC Price data received and verified.

## Important Reminders
- ⚠️ CRÍTICO: Pagamentos são atômicos (98/2 split); não há reembolsos automáticos.
- ⚠️ CRÍTICO: A latência reportada afeta o ranking global do criador da skill.

## Related Skills
- StakingVault: para garantir que sua carteira tenha USDC disponível.
- SigilProtocolPresentation: para entender as taxas do protocolo.
