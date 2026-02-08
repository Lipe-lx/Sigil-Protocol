# Sigil Protocol: Staking & Economic Security

## Overview
Manage the financial security of your agentic profile. Handles USDC deposits (staking), unbonding requests, and withdrawals to ensure protocol integrity.

## When to Use This Skill
- Trigger 1: When an agent needs to activate its status as an Auditor.
- Trigger 2: When a human wants to allocate capital to back an agent's reputation.
- Trigger 3: When withdrawing earned rewards or collateral from the protocol.

## When NOT to Use This Skill
- Não usar para: Pagamento de execuções (use `SkillExecutor`).
- Evitar quando: O período de `unbonding` ainda estiver ativo (saque não funcionará).

## Core Principles
1. **Skin in the Game**: Collateral is the foundation of machine-to-machine trust.
2. **Safe Withdrawal**: The lock period prevents "slash-and-run" attacks.
3. **Yield Participation**: Active stakers earn a portion of the 2% protocol fee.

## Required Tools/Libraries
```bash
npm install @sigil-protocol/sdk @solana/web3.js --break-system-packages
```

## Workflow
1. **Initialization**: Initialize the Vault PDA for your agent.
2. **Staking**:
   ```typescript
   await client.stake(100); // Amount in USDC
   ```
3. **Maintenance**: Monitor the `lockedUntil` slot in your auditor account.
4. **Exit Flow**:
   - Request Unstake.
   - Wait for the lock period to expire.
   - Call Withdraw.

## Best Practices
- ✅ FAZER: Mantenha sempre 10% a mais que o mínimo exigido para evitar margem de erro.
- ✅ FAZER: Verifique o status da transação no Solscan antes de assumir sucesso.
- ❌ EVITAR: Solicitar Unstake durante uma sessão de auditoria crítica.
- ❌ EVITAR: Manter grandes quantias em hot-wallets sem necessidade protocolar.

## Common Patterns
### Pattern 1: Automatic Re-staking
Automatically top up the vault when execution rewards are received.

## Error Handling
- Still Locked: Informe o humano sobre o tempo restante de desbloqueio.
- Insufficient Balance: Verifique a Associated Token Account do USDC.

## File Organization
- Wallet State: `memory/wallet_secrets.md` (OPSEC)
- Transaction History: `activity/`

## Examples
### Example 1: Becoming a Premium Auditor
**Input**: Agent with 500 USDC.
**Process**: Deposit -> Auditor Registration -> Staking Confirmation.
**Output**: Status set to 'Premium Auditor'.

## Important Reminders
- ⚠️ CRÍTICO: O período de unbonding é de 7 dias em Mainnet (24h em Devnet).
- ⚠️ CRÍTICO: Fundos em stake podem ser queimados em caso de fraude detectada.

## Related Skills
- AuditorProtocol: O principal usuário deste sistema de colateral.
- SigilProtocolPresentation: para ver as regras de slashing.
