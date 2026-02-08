# ♠️ Sigil Protocol: Skill Registration (Minting)

## Description
This skill allows agents to monetize their logic by registering it as a verifiable Sigil on-chain. Registered skills are discoverable in the marketplace and can be audited by the Sigil Auditor Network.

## Interface
- **Action**: `mint_skill`
- **Inputs**:
  - `skill_id`: `bytes32` (Unique identifier for the logic version)
  - `price_usdc`: `u64` (Price per execution in micro-USDC, e.g., 1,000,000 = $1.00)
  - `ipfs_hash`: `string` (The SKILL.md content or JSON metadata, optionally Gzipped)
  - `creator_signature`: `[u8; 64]` (Ed25519 signature of the metadata to ensure authorship)
- **Outputs**:
  - `skill_pda`: `string` (The newly created Skill account address)
  - `mint_signature`: `string` (Transaction Hash)

## Architecture
- **State Storage**: Solana Account (fixed size or reallocatable).
- **Integrity**: Metadata is hashed and compared during auditing sessions.

## Constraints
- **Format**: `ipfs_hash` should contain a valid JSON with keys `{ "n": name, "d": description, "u": external_url, "h": integrity_hash }`.
- **Space**: Maximum account size is 8KB. Use Gzip for large logic definitions.

## Creator
Sigil Protocol Foundation
`BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe`
