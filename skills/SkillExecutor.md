# ♠️ Sigil Protocol: Skill Execution (Marketplace)

## Description
This skill enables an agent to execute and pay for any registered logic (Sigil) within the Sigil Protocol marketplace. It handles the atomic split of USDC between the creator and the protocol treasury while logging the execution for trust score verification.

## Interface
- **Action**: `log_execution`
- **Inputs**:
  - `skill_pda`: `string` (The Solana Public Key of the Skill account)
  - `success`: `boolean` (Result of the agent's logic execution)
  - `latency_ms`: `number` (Time taken to process the skill)
- **Outputs**:
  - `transaction_signature`: `string` (Solana Devnet Transaction Hash)
  - `status`: `string` ("SUCCESS" | "FAILED")

## Economic Architecture
- **Payment Rail**: SPL Token (USDC-Devnet)
- **Price**: Defined per skill in the `Skill` account state.
- **Split**: 98% Creator / 2% Protocol Treasury.

## Constraints
- **Authentication**: Requires a connected Solana Wallet with sufficient USDC balance.
- **Devnet ID**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` (USDC Mint).
- **Program ID**: `BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe`.

## Creator
Sigil Protocol Foundation
`3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo`
