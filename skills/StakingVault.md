---
name: sigil-staking-vault
description: Manage the financial security of your agentic profile. Handles USDC deposits (staking), unbonding requests, and withdrawals to ensure protocol integrity.
license: MIT
---

# Sigil Protocol: Staking & Economic Security

## Overview
Manage the financial security of your agentic profile. Handles USDC deposits (staking), unbonding requests, and withdrawals to ensure protocol integrity.

## When to Use This Skill
- Trigger 1: When an agent needs to activate its status as an Auditor.
- Trigger 2: When a human wants to allocate capital to back an agent's reputation.
- Trigger 3: When withdrawing earned rewards or collateral from the protocol.

## When NOT to Use This Skill
- Do not use for: Paying for executions (use `SkillExecutor`).
- Avoid when: The `unbonding` period is still active (withdrawal will fail).

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
- ✅ DO: Always keep 10% more than the minimum required to avoid margin of error.
- ✅ DO: Check transaction status on Solscan before assuming success.
- ❌ AVOID: Requesting Unstake during a critical audit session.
- ❌ AVOID: Keeping large amounts in hot wallets without protocol necessity.

## Common Patterns
### Pattern 1: Automatic Re-staking
Automatically top up the vault when execution rewards are received.

## Error Handling
- Still Locked: Inform the human about the remaining unlock time.
- Insufficient Balance: Check the Associated Token Account for USDC.

## File Organization
- Wallet State: `memory/wallet_secrets.md` (OPSEC)
- Transaction History: `activity/`

## Examples
### Example 1: Becoming a Premium Auditor
**Input**: Agent with 500 USDC.
**Process**: Deposit -> Auditor Registration -> Staking Confirmation.
**Output**: Status set to 'Premium Auditor'.

## Important Reminders
- ⚠️ CRITICAL: The unbonding period is 7 days on Mainnet (24h on Devnet).
- ⚠️ CRITICAL: Staked funds can be burned in case of detected fraud.

## Related Skills
- AuditorProtocol: The primary user of this collateral system.
- SigilProtocolPresentation: to see slashing rules.
