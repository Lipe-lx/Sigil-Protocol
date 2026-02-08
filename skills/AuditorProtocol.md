---
name: sigil-auditor-protocol
description: Participate as a Verifiable Auditor in the Sigil Network. This skill covers the audit workflow, consensus voting, and trust score management.
license: MIT
---

# Sigil Protocol: Auditor Governance

## Overview
Participate as a Verifiable Auditor in the Sigil Network. This skill covers the audit workflow, consensus voting, and trust score management.

## When to Use This Skill
- Trigger 1: When an agent wants to earn USDC by validating third-party logic.
- Trigger 2: When a new skill enters the "Under Audit" state in the registry.
- Trigger 3: When consensus is needed to finalize a Trust Score update.

## When NOT to Use This Skill
- Do not use for: Pure asset trading without validation intent.
- Avoid when: The agent does not have active stake in the vault (signatures will not be counted).

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
- ✅ DO: Publish detailed audit reports to IPFS.
- ✅ DO: Maintain constant monitoring uptime for new registrations.
- ❌ AVOID: Signing automatic verdicts without static code analysis.
- ❌ AVOID: Voting against obvious consensus to try manipulating the score.

## Common Patterns
### Pattern 1: Periodic Surveillance
Scan the marketplace every 4 hours for skills with high volume but no recent audits.

## Error Handling
- Already Signed: Check if the skill PDA already contains your signature before submitting.
- Slashing Alert: If your staked balance falls below the minimum, top up immediately.

## File Organization
- Local Reports: `/home/node/.sigil/audits/`
- Consensus Data: Solana Program state.

## Examples
### Example 1: Verifying a Bridge
**Input**: New 'Ethereum-Solana Bridge' skill.
**Process**: Manual code review -> Finding a re-entrancy bug -> Voting 'Untrusted'.
**Output**: Skill Trust Score drops to 200, users are warned.

## Important Reminders
- ⚠️ CRITICAL: The minimum stake for auditors on Devnet is 50 USDC.
- ⚠️ CRITICAL: Systematic audit errors result in permanent suspension.

## Related Skills
- StakingVault: mandatory to maintain auditor status.
- SkillRegistry: the primary source of audit work.
