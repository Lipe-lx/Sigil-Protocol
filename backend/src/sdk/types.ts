import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export interface SigilRegistry {
  version: "0.1.0",
  name: "sigil_registry",
  instructions: [
    {
      "name": "initializeRegistry",
      "accounts": [
        { "name": "registry", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
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
        { "name": "auditor", "isMut": true, "isSigner": false },
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
  accounts: [
    {
      "name": "SkillRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "authority", "type": "publicKey" },
          { "name": "skillCount", "type": "u64" },
          { "name": "totalExecutions", "type": "u64" }
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
          { "name": "priceUsdc", "type": "u64" },
          { "name": "ipfsHash", "type": "string" },
          { "name": "creatorSignature", "type": { "array": ["u8", 64] } },
          { "name": "trustScore", "type": "u8" },
          { "name": "executionCount", "type": "u64" },
          { "name": "successCount", "type": "u64" },
          { "name": "totalEarned", "type": "u64" },
          { "name": "lastUsed", "type": "i64" },
          { "name": "createdAt", "type": "i64" },
          { "name": "auditors", "type": { "vec": { "defined": "AuditorSignature" } } },
          { "name": "auditReportHash", "type": { "option": "string" } }
        ]
      }
    },
    {
      "name": "Auditor",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "pubkey", "type": "publicKey" },
          { "name": "tier", "type": { "defined": "AuditorTier" } },
          { "name": "skillsAudited", "type": "u64" },
          { "name": "reputation", "type": "u8" },
          { "name": "totalEarned", "type": "u64" },
          { "name": "active", "type": "bool" }
        ]
      }
    },
    {
      "name": "ExecutionLog",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "skill", "type": "publicKey" },
          { "name": "executor", "type": "publicKey" },
          { "name": "success", "type": "bool" },
          { "name": "latencyMs", "type": "u32" },
          { "name": "paymentAmount", "type": "u64" },
          { "name": "timestamp", "type": "i64" }
        ]
      }
    }
  ],
  types: [
    {
      "name": "AuditorTier",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Novice" },
          { "name": "Verified" },
          { "name": "Expert" },
          { "name": "Guardian" }
        ]
      }
    },
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
    }
  ],
  errors: [
    { "code": 6000, "name": "Unauthorized", "msg": "Unauthorized access" },
    { "code": 6001, "name": "InvalidSignature", "msg": "Invalid signature" },
    { "code": 6002, "name": "SkillAlreadyExists", "msg": "Skill already exists" },
    { "code": 6003, "name": "AuditorAlreadySigned", "msg": "Auditor already signed this skill" },
    { "code": 6004, "name": "NumericOverflow", "msg": "Numeric overflow" }
  ]
}
