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
      "name": "addAuditorSignature",
      "discriminator": [58, 218, 50, 166, 77, 67, 230, 112],
      "accounts": [
        {
          "name": "skill",
          "writable": true
        },
        {
          "name": "auditor",
          "writable": false
        },
        {
          "name": "auditorSigner",
          "writable": true,
          "signer": true
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
      "name": "initializeAuditor",
      "discriminator": [253, 44, 177, 126, 156, 23, 211, 44],
      "accounts": [
        {
          "name": "auditor",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeRegistry",
      "discriminator": [189, 181, 20, 17, 174, 57, 249, 59],
      "accounts": [
        {
          "name": "registry",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
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
      "discriminator": [138, 115, 51, 156, 87, 89, 71, 134],
      "accounts": [
        {
          "name": "skill",
          "writable": true
        },
        {
          "name": "executionLog",
          "writable": true,
          "signer": true
        },
        {
          "name": "executor",
          "writable": true,
          "signer": true
        },
        {
          "name": "executorUsdc",
          "writable": true
        },
        {
          "name": "creatorUsdc",
          "writable": true
        },
        {
          "name": "protocolUsdc",
          "writable": true
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
      "discriminator": [189, 4, 3, 82, 182, 158, 59, 160],
      "accounts": [
        {
          "name": "skill",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "registry",
          "writable": true
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
      "discriminator": [28, 112, 16, 180, 233, 204, 109, 19],
      "accounts": [
        {
          "name": "consensusRecord",
          "writable": true
        },
        {
          "name": "skill",
          "writable": true
        },
        {
          "name": "registry",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
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
              "name": "ConsensusVerdict"
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
    },
    {
      "name": "requestUnstake",
      "discriminator": [44, 154, 110, 253, 160, 202, 54, 34],
      "accounts": [
        {
          "name": "auditor",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "slashAuditor",
      "discriminator": [44, 197, 46, 254, 187, 176, 51, 65],
      "accounts": [
        {
          "name": "registry",
          "writable": false
        },
        {
          "name": "auditor",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "rewardFundTokenAccount",
          "writable": true
        },
        {
          "name": "vaultAuthority",
          "writable": false
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "stakeUsdc",
      "discriminator": [251, 129, 45, 51, 186, 215, 88, 181],
      "accounts": [
        {
          "name": "auditor",
          "writable": true
        },
        {
          "name": "auditorTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "vaultAuthority",
          "writable": false
        },
        {
          "name": "usdcMint",
          "writable": false
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawStake",
      "discriminator": [153, 8, 22, 138, 105, 176, 87, 66],
      "accounts": [
        {
          "name": "auditor",
          "writable": true
        },
        {
          "name": "auditorTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "vaultAuthority",
          "writable": false
        },
        {
          "name": "usdcMint",
          "writable": false
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
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
                "name": "AuditorTier"
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
            "name": "stakeAmount",
            "type": "u64"
          },
          {
            "name": "lockedUntil",
            "type": "i64"
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
                "name": "AuditorTier"
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
            "name": "Tier1"
          },
          {
            "name": "Tier2"
          },
          {
            "name": "Tier3"
          }
        ]
      }
    },
    {
      "name": "consensusRecord",
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
                "name": "ConsensusVerdict"
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
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Pending"
          },
          {
            "name": "InReview"
          },
          {
            "name": "Approved"
          },
          {
            "name": "Rejected"
          },
          {
            "name": "Contested"
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
            "name": "Pending"
          },
          {
            "name": "Approved"
          },
          {
            "name": "Rejected"
          },
          {
            "name": "Inconclusive"
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
                  "name": "AuditorSignature"
                }
              }
            }
          },
          {
            "name": "consensusStatus",
            "type": {
              "defined": {
                "name": "ConsensusStatus"
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
