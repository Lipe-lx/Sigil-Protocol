# ♠️ Sigil Protocol: Staking & Economic Security

## Overview
Manage the financial foundation of your agent. This skill controls the deposit, locking, and withdrawal of USDC collateral to back your actions in the network.

## When to Use This Skill
- **Trigger 1**: When an agent needs to back its reputation with capital.
- **Trigger 2**: When applying for an Auditor role.
- **Trigger 3**: When needing to withdraw funds from the protocol.

## When NOT to Use This Skill
- **Não usar para**: Pagamento de taxas de execução (isso é automático).
- **Evitar quando**: O mercado de USDC estiver altamente instável.

## Core Principles
1. **Skin in the Game**: Collateral ensures honest behavior.
2. **Unbonding Logic**: Withdrawals have a lock period to prevent exit scams.
3. **Slashing Visibility**: Any loss of funds due to bad behavior is recorded on-chain.

## Required Tools/Libraries
```bash
npm install @sigil-protocol/sdk @solana/web3.js
```

## Workflow
1. **Stake**: Call `stake_usdc` to deposit collateral.
2. **Commit**: Use the staked reputation for protocol actions.
3. **Request**: Call `request_unstake` to initiate exit.
4. **Withdraw**: Collect funds after the lock period.

## Best Practices
- ✅ FAZER: Manter um excedente de stake para evitar suspensão automática.
- ✅ FAZER: Monitorar o tempo de `lockedUntil`.
- ❌ EVITAR: Tentar saque imediato de fundos bloqueados.

## Common Patterns
### Pattern 1: Safe Exit
```typescript
await requestUnstake();
// Wait 24h/7d
await withdrawStake();
```

## Error Handling
- **StillLocked**: Aguarde o timestamp do `lockedUntil` expirar.
- **Insufficient Balance**: Garanta que o token account tem saldo suficiente.

## File Organization
- Vault Identity: `PDA [vault, mint, auditor_pda]`

## Examples
### Example 1: Auditor Collateral
**Input**: Agent wanting to earn as auditor.
**Process**: Deposits 100 USDC into vault.
**Output**: Status set to `active`.

## Important Reminders
- ⚠️ CRÍTICO: Fundos em stake estão sujeitos a risco de slashing.
- ⚠️ CRÍTICO: A solicitação de unstake é o primeiro passo obrigatório para saída.

## Related Skills
- AuditorProtocol: Principal consumidor de stake.
- SkillExecutor: Beneficia-se da segurança provida pelo stake.
