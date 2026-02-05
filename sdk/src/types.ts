import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type SigilRegistry = {
  "version": "0.1.0",
  "name": "sigil_registry",
  "instructions": [
    {
      "name": "mintSkill",
      "accounts": [
        { "name": "skill", "isMut": true, "isSigner": false },
        { "name": "creator", "isMut": true, "isSigner": true },
        { "name": "registry", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "skillId", "type": { "array": ["u8", 32] } },
        { "name": "priceUsdc", "type": "u64" },
        { "name": "ipfsHash", "type": "string" },
        { "name": "creatorSignature", "type": { "array": ["u8", 64] } }
      ]
    },
    {
      "name": "addAuditorSignature",
      "accounts": [
        { "name": "skill", "isMut": true, "isSigner": false },
        { "name": "auditor", "isMut": false, "isSigner": false },
        { "name": "auditorSigner", "isMut": true, "isSigner": true }
      ],
      "args": [
        { "name": "signature", "type": { "array": ["u8", 64] } },
        { "name": "auditReportHash", "type": "string" }
      ]
    },
    {
      "name": "logExecution",
      "accounts": [
        { "name": "skill", "isMut": true, "isSigner": false },
        { "name": "executionLog", "isMut": true, "isSigner": false },
        { "name": "executor", "isMut": true, "isSigner": true },
        { "name": "executorUsdc", "isMut": true, "isSigner": false },
        { "name": "creatorUsdc", "isMut": true, "isSigner": false },
        { "name": "protocolUsdc", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "success", "type": "bool" },
        { "name": "latencyMs", "type": "u32" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "SkillRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "authority", "type": "publicKey" },
          { "name": "skillCount", "type": "u64" },
          { "name": "totalExecutions", "type": "u64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "Skill",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "skillId", "type": { "array": ["u8", 32] } },
          { "name": "creator", "type": "publicKey" },
          { "name": "creatorSignature", "type": { "array": ["u8", 64] } },
          { "name": "priceUsdc", "type": "u64" },
          { "name": "ipfsHash", "type": "string" },
          { "name": "auditReportHash", "type": "string" },
          { "name": "auditorCount", "type": "u8" },
          { "name": "auditors", "type": { "vec": { "defined": "AuditorSignature" } } },
          { "name": "trustScore", "type": "u16" },
          { "name": "executionCount", "type": "u64" },
          { "name": "successCount", "type": "u64" },
          { "name": "totalEarned", "type": "u64" },
          { "name": "lastUsed", "type": "i64" },
          { "name": "createdAt", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "AuditorSignature",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "auditor", "type": "publicKey" },
          { "name": "signature", "type": { "array": ["u8", 64] } },
          { "name": "tier", "type": { "defined": "AuditorTier" } },
          { "name": "timestamp", "type": "i64" }
        ]
      }
    },
    {
      "name": "AuditorTier",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Tier1" },
          { "name": "Tier2" },
          { "name": "Tier3" }
        ]
      }
    }
  ]
};
