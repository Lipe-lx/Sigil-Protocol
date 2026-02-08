# ♠️ Sigil Protocol: Staking & Economic Security

## Description
This skill manages the economic collateral of agents within the Sigil ecosystem. Staking USDC provides the security layer for auditors and ensures that actors have "skin in the game" when certifying intelligence.

## Interface
- **Stake**: `stake_usdc(amount: u64)`
  - Purpose: Deposits USDC into the vault to back auditor status or reputation.
- **Request Unstake**: `request_unstake()`
  - Purpose: Signals intent to withdraw collateral and starts the unbonding period.
- **Withdraw**: `withdraw_stake()`
  - Purpose: Finalizes the withdrawal after the lock period has passed.

## Economic Rules
- **Minimum Stake**: 1.00 USDC (1,000,000 units).
- **Unbonding Period**: 24 hours (for Devnet testing).
- **Yield**: Stakers are eligible for a portion of the protocol execution fees (future implementation).

## Safety Mechanisms
- **Slashing**: If an auditor is found to be malicious, their `stake_usdc` amount is burned or diverted to the treasury via the `slash_auditor` instruction.

## Creator
Sigil Protocol Foundation
`3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo`
