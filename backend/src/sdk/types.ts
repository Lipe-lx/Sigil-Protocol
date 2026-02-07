/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sigil_registry.json`.
 */
export type SigilRegistry = {
  "version": "0.1.0",
  "name": "sigil_registry",
  "address": "BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe",
  "metadata": {
    "name": "sigilRegistry",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Sigil Protocol - Trust Layer for AI Agent Skills"
  },
  "instructions": [
    {
      "name": "addAuditorSignature",
      "discriminator": [
        58,
        218,
        50,
        166,
        77,
        67,
        230,
        112
      ],
      "accounts": [
        {
          "name": "skill",
          "isMut": true
        },
        {
          "name": "auditor"
        },
        {
          "name": "auditorSigner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "signature",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        },
        {
          "name": "auditReportHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeRegistry",
      "discriminator": [
        189,
        181,
        63,
        20,
        17,
        174,
        57,
        249,
        59
      ],
      "accounts": [
        {
          "name": "registry",
          "isMut": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  118,
                  49
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "logExecution",
      "discriminator": [
        138,
        115,
        51,
        156,
        87,
        89,
        71,
        134
      ],
      "accounts": [
        {
          "name": "skill",
          "isMut": true
        },
        {
          "name": "executionLog",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "executor",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "executorUsdc",
          "isMut": true
        },
        {
          "name": "creatorUsdc",
          "isMut": true
        },
        {
          "name": "protocolUsdc",
          "isMut": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "success",
          "type": "bool"
        },
        {
          "name": "latencyMs",
          "type": "u32"
        }
      ]
    },
    {
      "name": "mintSkill",
      "discriminator": [
        189,
        4,
        3,
        82,
        182,
        158,
        59,
        160
      ],
      "accounts": [
        {
          "name": "skill",
          "isMut": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  107,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "skillId"
              }
            ]
          }
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "registry",
          "isMut": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  118,
                  49
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "skillId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "priceUsdc",
          "type": "u64"
        },
        {
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "name": "creatorSignature",
          "type": {
            "array": [
              "u8",
              64
            ]
          }
        }
      ]
    },
    {
      "name": "recordConsensus",
      "docs": [
        "Record consensus verdict on-chain",
        "This is the \"Certificate\" that makes Sigil a Certificate Authority"
      ],
      "discriminator": [
        28,
        112,
        16,
        180,
        233,
        204,
        109,
        19
      ],
      "accounts": [
        {
          "name": "consensusRecord",
          "isMut": true
        },
        {
          "name": "skill",
          "isMut": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  107,
                  105,
                  108,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "skill.skill_id",
                "account": "skill"
              }
            ]
          }
        },
        {
          "name": "registry",
          "isMut": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121,
                  95,
                  118,
                  49
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true,
          "relations": [
            "registry"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "verdict",
          "type": {
            "defined": {
              "name": "consensusVerdict"
            }
          }
        },
        {
          "name": "confidence",
          "type": "u8"
        },
        {
          "name": "trustScore",
          "type": "u16"
        },
        {
          "name": "evaluatorCount",
          "type": "u8"
        },
        {
          "name": "meanScore",
          "type": "u16"
        },
        {
          "name": "scoreVariance",
          "type": "u16"
        },
        {
          "name": "criticalOverlap",
          "type": "u16"
        },
        {
          "name": "methodologyCount",
          "type": "u8"
        },
        {
          "name": "reportsIpfsHash",
          "type": "string"
        },
        {
          "name": "reasoningIpfsHash",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "auditor",
      "discriminator": [
        163,
        185,
        74,
        35,
        129,
        30,
        235,
        28
      ]
    },
    {
      "name": "consensusRecord",
      "discriminator": [
        53,
        224,
        3,
        75,
        221,
        134,
        185,
        42
      ]
    },
    {
      "name": "executionLog",
      "discriminator": [
        115,
        151,
        52,
        213,
        99,
        171,
        200,
        240
      ]
    },
    {
      "name": "skill",
      "discriminator": [
        53,
        13,
        242,
        204,
        77,
        249,
        1,
        215
      ]
    },
    {
      "name": "skillRegistry",
      "discriminator": [
        100,
        187,
        221,
        130,
        166,
        188,
        159,
        174
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "auditorNotActive",
      "msg": "Auditor is not active"
    },
    {
      "code": 6001,
      "name": "auditorAlreadySigned",
      "msg": "Auditor has already signed this skill"
    },
    {
      "code": 6002,
      "name": "invalidConsensusVerdict",
      "msg": "Invalid consensus verdict"
    },
    {
      "code": 6003,
      "name": "consensusAlreadyRecorded",
      "msg": "Skill already has a recorded consensus"
    }
  ],
  "types": [
    {
      "name": "auditor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "tier",
            "type": {
              "defined": {
                "name": "auditorTier"
              }
            }
          },
          {
            "name": "skillsAudited",
            "type": "u64"
          },
          {
            "name": "reputation",
            "type": "u16"
          },
          {
            "name": "totalEarned",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "auditorSignature",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "auditor",
            "type": "pubkey"
          },
          {
            "name": "signature",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "tier",
            "type": {
              "defined": {
                "name": "auditorTier"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "auditorTier",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "tier1"
          },
          {
            "name": "tier2"
          },
          {
            "name": "tier3"
          }
        ]
      }
    },
    {
      "name": "consensusRecord",
      "docs": [
        "On-chain record of consensus verdict",
        "This is the \"Certificate\" in \"Certificate Authority\""
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "skill",
            "type": "pubkey"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "verdict",
            "type": {
              "defined": {
                "name": "consensusVerdict"
              }
            }
          },
          {
            "name": "confidence",
            "type": "u8"
          },
          {
            "name": "trustScore",
            "type": "u16"
          },
          {
            "name": "evaluatorCount",
            "type": "u8"
          },
          {
            "name": "meanScore",
            "type": "u16"
          },
          {
            "name": "scoreVariance",
            "type": "u16"
          },
          {
            "name": "criticalOverlap",
            "type": "u16"
          },
          {
            "name": "methodologyCount",
            "type": "u8"
          },
          {
            "name": "reportsIpfsHash",
            "type": "string"
          },
          {
            "name": "reasoningIpfsHash",
            "type": "string"
          },
          {
            "name": "evaluatedAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "recordedBy",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "consensusStatus",
      "docs": [
        "Consensus status for a skill"
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "inReview"
          },
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          },
          {
            "name": "contested"
          }
        ]
      }
    },
    {
      "name": "consensusVerdict",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          },
          {
            "name": "inconclusive"
          }
        ]
      }
    },
    {
      "name": "executionLog",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "skill",
            "type": "pubkey"
          },
          {
            "name": "executor",
            "type": "pubkey"
          },
          {
            "name": "success",
            "type": "bool"
          },
          {
            "name": "latencyMs",
            "type": "u32"
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "skill",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "skillId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "creatorSignature",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "priceUsdc",
            "type": "u64"
          },
          {
            "name": "ipfsHash",
            "type": "string"
          },
          {
            "name": "auditReportHash",
            "type": "string"
          },
          {
            "name": "auditorCount",
            "type": "u8"
          },
          {
            "name": "auditors",
            "type": {
              "vec": {
                "defined": {
                  "name": "auditorSignature"
                }
              }
            }
          },
          {
            "name": "consensusStatus",
            "type": {
              "defined": {
                "name": "consensusStatus"
              }
            }
          },
          {
            "name": "consensusRecord",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "trustScore",
            "type": "u16"
          },
          {
            "name": "executionCount",
            "type": "u64"
          },
          {
            "name": "successCount",
            "type": "u64"
          },
          {
            "name": "totalEarned",
            "type": "u64"
          },
          {
            "name": "lastUsed",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "skillRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "skillCount",
            "type": "u64"
          },
          {
            "name": "totalExecutions",
            "type": "u64"
          },
          {
            "name": "totalConsensusRecords",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
