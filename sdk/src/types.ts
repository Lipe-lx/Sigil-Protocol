import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type SigilRegistry = {
  "address": "BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe",
  "metadata": {
    "name": "sigil_registry",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Sigil Protocol - Trust Layer for AI Agent Skills"
  },
  "instructions": [
    {
      "name": "initializeRegistry",
      "discriminator": [189, 181, 20, 17, 174, 57, 249, 59],
      "accounts": [
        { "name": "registry", "writable": true },
        { "name": "authority", "writable": true, "signer": true },
        { "name": "systemProgram", "address": "11111111111111111111111111111111" }
      ],
      "args": []
    },
    {
      "name": "mintSkill",
      "discriminator": [189, 4, 3, 82, 182, 158, 59, 160],
      "accounts": [
        { "name": "skill", "writable": true },
        { "name": "creator", "writable": true, "signer": true },
        { "name": "registry", "writable": true },
        { "name": "systemProgram", "address": "11111111111111111111111111111111" }
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
      "discriminator": [58, 218, 50, 166, 77, 67, 230, 112],
      "accounts": [
        { "name": "skill", "writable": true },
        { "name": "auditor", "writable": false },
        { "name": "auditorSigner", "writable": true, "signer": true }
      ],
      "args": [
        { "name": "signature", "type": { "array": ["u8", 64] } },
        { "name": "auditReportHash", "type": "string" }
      ]
    },
    {
      "name": "logExecution",
      "discriminator": [138, 115, 51, 156, 87, 89, 71, 134],
      "accounts": [
        { "name": "skill", "writable": true },
        { "name": "executionLog", "writable": true, "signer": true },
        { "name": "executor", "writable": true, "signer": true },
        { "name": "executorUsdc", "writable": true },
        { "name": "creatorUsdc", "writable": true },
        { "name": "protocolUsdc", "writable": true },
        { "name": "tokenProgram", "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { "name": "systemProgram", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "success", "type": "bool" },
        { "name": "latencyMs", "type": "u32" }
      ]
    },
    {
      "name": "recordConsensus",
      "discriminator": [28, 112, 16, 180, 233, 204, 109, 19],
      "accounts": [
        { "name": "consensusRecord", "writable": true },
        { "name": "skill", "writable": true },
        { "name": "registry", "writable": true },
        { "name": "authority", "writable": true, "signer": true },
        { "name": "systemProgram", "address": "11111111111111111111111111111111" }
      ],
      "args": [
        { "name": "verdict", "type": { "defined": { "name": "ConsensusVerdict" } } },
        { "name": "confidence", "type": "u8" },
        { "name": "trustScore", "type": "u16" },
        { "name": "evaluatorCount", "type": "u8" },
        { "name": "meanScore", "type": "u16" },
        { "name": "scoreVariance", "type": "u16" },
        { "name": "criticalOverlap", "type": "u16" },
        { "name": "methodologyCount", "type": "u8" },
        { "name": "reportsIpfsHash", "type": "string" },
        { "name": "reasoningIpfsHash", "type": "string" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "SkillRegistry",
      "discriminator": [100, 187, 221, 130, 166, 188, 159, 174]
    },
    {
      "name": "Skill",
      "discriminator": [53, 13, 242, 204, 77, 249, 1, 215]
    }
  ],
  "types": [
    {
      "name": "ConsensusVerdict",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Pending" },
          { "name": "Approved" },
          { "name": "Rejected" },
          { "name": "Inconclusive" }
        ]
      }
    }
  ]
};
