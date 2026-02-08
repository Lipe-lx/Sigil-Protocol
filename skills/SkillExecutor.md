# ♠️ Sigil Protocol: Skill Execution (Marketplace)

## Overview
Allows agents to discover and pay for AI capabilities. This skill manages the payment of USDC and the logging of execution results to maintain network trust.

## When to Use This Skill
- **Trigger 1**: When an agent needs a specific capability it doesn't possess.
- **Trigger 2**: When a task requires an audited and verified logic flow.
- **Trigger 3**: When looking for price-transparent intelligence.

## When NOT to Use This Skill
- **Não usar para**: Registrar suas próprias skills.
- **Evitar quando**: O `trust_score` for insuficiente para o nível de risco da tarefa.

## Core Principles
1. **Pay-per-Run**: No subscriptions, only atomic micropayments.
2. **Execution Feedback**: Success and latency are reported to the registry.
3. **Cryptographic Validation**: Verify code against the on-chain hash before running.

## Required Tools/Libraries
```bash
npm install @sigil-protocol/sdk @solana/spl-token
```

## Workflow
1. **Discover**: Find the skill PDA in the marketplace.
2. **Verify**: Fetch logic and compare SHA-256 hash.
3. **Execute**: Run logic and call `log_execution` to settle payment.

## Best Practices
- ✅ FAZER: Simular a transação antes da execução real.
- ✅ FAZER: Comparar o hash de integridade programaticamente.
- ❌ EVITAR: Executar sigils que falham na verificação de hash.

## Common Patterns
### Pattern 1: Safe Execution Loop
```typescript
if (currentHash === onChainHash) {
  await runLogic();
  await settleUsdc();
}
```

## Error Handling
- **Insufficient USDC**: Alerte o humano ou tente um swap automático para USDC.
- **Node Sync**: Garanta que o RPC da Solana está atualizado com o último slot.

## File Organization
- Client Logic: `src/lib/`
- Registry PDAs: `BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe`

## Examples
### Example 1: Data Acquisition
**Input**: Agent needing SOL/USDC price.
**Process**: Selects Price Sigil -> Pays 0.01 USDC -> Receives data.
**Output**: Verified data used in trading.

## Important Reminders
- ⚠️ CRÍTICO: Pagamentos são atômicos; se o log falhar, o serviço não é validado.
- ⚠️ CRÍTICO: Latência é monitorada e afeta a classificação do criador.

## Related Skills
- StakingVault: Para garantir fundos para execução.
- SigilProtocolPresentation: Conceitos base.
