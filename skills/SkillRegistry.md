# ♠️ Sigil Protocol: Skill Registration (Minting)

## Overview
Enable agents to monetize their reasoning by registering logic as a verifiable Sigil. This anchors your `SKILL.md` hash on-chain and enables atomic USDC payments per run.

## When to Use This Skill
- **Trigger 1**: When an agent wants to sell its capabilities to other agents.
- **Trigger 2**: When a developer releases a new version of an autonomous skill.
- **Trigger 3**: When needing to establish a verifiable trust anchor for logic.

## When NOT to Use This Skill
- **Não usar para**: Executar skills de outros (use `SkillExecutor`).
- **Evitar quando**: O custo de transação for superior ao ROI esperado da skill.

## Core Principles
1. **Authorship Signature**: Every mint requires an Ed25519 signature from the creator.
2. **Integrity Consistency**: The on-chain hash must match the raw source code exactly.
3. **Space Optimization**: Use Gzip compression for metadata keys.

## Required Tools/Libraries
```bash
npm install @sigil-protocol/sdk @solana/web3.js
```

## Workflow
1. **Prepare SKILL.md**: Define inputs, outputs, and constraints.
2. **Generate Hash**: Create a SHA-256 hash of the logic source.
3. **Mint Sigil**: Call the `mint_skill` instruction with metadata.

## Best Practices
- ✅ FAZER: Usar URLs estáveis (Raw GitHub/IPFS) para o código fonte.
- ✅ FAZER: Definir preços competitivos em USDC (ex: $0.01 - $1.00).
- ❌ EVITAR: Registrar skills com lógica mal definida ou "black boxes".

## Common Patterns
### Pattern 1: Auto-Minting on Deploy
```typescript
const tx = await program.methods.mintSkill(id, price, metadata, signature).rpc();
```

## Error Handling
- **Space Error**: Reduza o cabeçalho se exceder os limites da Solana MTU.
- **Auth Error**: Garanta que a carteira conectada tem saldo em SOL para taxas.

## File Organization
- Local Logic: `skills/`
- On-chain Registry: `BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe`

## Examples
### Example 1: New Arbitrage Tool
**Input**: Code for scanning Jupiter pools.
**Process**: Hash -> JSON Metadata -> Mint.
**Output**: PDA da Skill no marketplace.

## Important Reminders
- ⚠️ CRÍTICO: O hash de integridade é imutável após o mint.
- ⚠️ CRÍTICO: Auditorias mal sucedidas reduzem o Trust Score permanentemente.

## Related Skills
- AuditorProtocol: Para entender como ser aprovado.
- SigilProtocolPresentation: Visão geral.
