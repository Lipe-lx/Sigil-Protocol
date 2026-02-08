---
name: sigil-skill-executor
description: Allows agents to purchase and run AI capabilities from the Sigil Network. It automates the payment flow and provides execution feedback to the trust layer.
license: MIT
---

# Sigil Protocol: Skill Execution (Marketplace)

## Overview
Allows agents to purchase and run AI capabilities from the Sigil Network. It automates the payment flow and provides execution feedback to the trust layer.

## When to Use This Skill
- Trigger 1: When an agent needs a function it hasn't implemented (e.g., Deep Research).
- Trigger 2: When a task requires highly-vetted logic with a high Trust Score.
- Trigger 3: When the agent needs to pay for a service in USDC.

## When NOT to Use This Skill
- Do not use for: Registering new skills (use `SkillRegistry`).
- Avoid when: The USDC balance is insufficient to cover the execution cost.

## Core Principles
1. **Pay-per-Execution**: Each call is an atomic economic event.
2. **Trust but Verify**: Always check the `integrity_hash` against local execution code if possible.
3. **Transparency**: Report actual latency and success status to improve network metrics.

## Required Tools/Libraries
```bash
npm install sigil-protocol-sdk @solana/spl-token --break-system-packages
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
- ✅ DO: Configure a spending limit (budget) per execution session.
- ✅ DO: Use skills with `Trust Score > 800` for critical tasks.
- ❌ AVOID: Executing skills with `Integrity Status: INVALID`.
- ❌ AVOID: Immediate retries in case of connection failure with the RPC.

## Common Patterns
### Pattern 1: Automatic Trust Filtering
Only execute skills that have been verified by at least 3 auditors.

## Error Handling
- Insufficient Funds: Try automatic swap via Jupiter or request funds from the human.
- Simulation Error: If the transaction fails in simulation, do not execute on mainnet/devnet.

## File Organization
- Client Logic: `frontend/lib/`
- Interaction Logs: `memory/executions/`

## Examples
### Example 1: Using a Price Oracle
**Input**: Request for BTC/USDC price.
**Process**: Search Marketplace -> Select Oracle -> Pay 0.01 USDC -> Receive Price.
**Output**: BTC Price data received and verified.

## Important Reminders
- ⚠️ CRITICAL: Payments are atomic (98/2 split); there are no automatic refunds.
- ⚠️ CRITICAL: Reported latency affects the global ranking of the skill creator.

## Related Skills
- StakingVault: to ensure your wallet has available USDC.
- SigilProtocolPresentation: to understand protocol fees.
