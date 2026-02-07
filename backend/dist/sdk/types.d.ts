/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sigil_registry.json`.
 */
export type SigilRegistry = {
    "version": "0.1.0";
    "name": "sigil_registry";
    "address": "BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe";
    "metadata": {
        "name": "sigilRegistry";
        "version": "0.1.0";
        "spec": "0.1.0";
        "description": "Sigil Protocol - Trust Layer for AI Agent Skills";
    };
    "instructions": [
        {
            "name": "addAuditorSignature";
            "accounts": [
                {
                    "name": "skill";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "auditor";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "auditorSigner";
                    "isMut": true;
                    "isSigner": true;
                }
            ];
            "args": [
                {
                    "name": "signature";
                    "type": {
                        "array": [
                            "u8",
                            64
                        ];
                    };
                },
                {
                    "name": "auditReportHash";
                    "type": "string";
                }
            ];
        },
        {
            "name": "initializeRegistry";
            "accounts": [
                {
                    "name": "registry";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "authority";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [];
        },
        {
            "name": "logExecution";
            "accounts": [
                {
                    "name": "skill";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "executionLog";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "executor";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "executorUsdc";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "creatorUsdc";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "protocolUsdc";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "tokenProgram";
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                    "isMut": false;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "success";
                    "type": "bool";
                },
                {
                    "name": "latencyMs";
                    "type": "u32";
                }
            ];
        },
        {
            "name": "mintSkill";
            "accounts": [
                {
                    "name": "skill";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "creator";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "registry";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "skillId";
                    "type": {
                        "array": [
                            "u8",
                            32
                        ];
                    };
                },
                {
                    "name": "priceUsdc";
                    "type": "u64";
                },
                {
                    "name": "ipfsHash";
                    "type": "string";
                },
                {
                    "name": "creatorSignature";
                    "type": {
                        "array": [
                            "u8",
                            64
                        ];
                    };
                }
            ];
        },
        {
            "name": "recordConsensus";
            "docs": [
                "Record consensus verdict on-chain",
                "This is the \"Certificate\" that makes Sigil a Certificate Authority"
            ];
            "accounts": [
                {
                    "name": "consensusRecord";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "skill";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "registry";
                    "isMut": true;
                    "isSigner": false;
                },
                {
                    "name": "authority";
                    "isMut": true;
                    "isSigner": true;
                },
                {
                    "name": "systemProgram";
                    "address": "11111111111111111111111111111111";
                    "isMut": false;
                    "isSigner": false;
                }
            ];
            "args": [
                {
                    "name": "verdict";
                    "type": {
                        "defined": "consensusVerdict";
                    };
                },
                {
                    "name": "confidence";
                    "type": "u8";
                },
                {
                    "name": "trustScore";
                    "type": "u16";
                },
                {
                    "name": "evaluatorCount";
                    "type": "u8";
                },
                {
                    "name": "meanScore";
                    "type": "u16";
                },
                {
                    "name": "scoreVariance";
                    "type": "u16";
                },
                {
                    "name": "criticalOverlap";
                    "type": "u16";
                },
                {
                    "name": "methodologyCount";
                    "type": "u8";
                },
                {
                    "name": "reportsIpfsHash";
                    "type": "string";
                },
                {
                    "name": "reasoningIpfsHash";
                    "type": "string";
                }
            ];
        }
    ];
    "accounts": [
        {
            "name": "auditor";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "pubkey";
                        "type": "publicKey";
                    },
                    {
                        "name": "tier";
                        "type": {
                            "defined": "auditorTier";
                        };
                    },
                    {
                        "name": "skillsAudited";
                        "type": "u64";
                    },
                    {
                        "name": "reputation";
                        "type": "u16";
                    },
                    {
                        "name": "totalEarned";
                        "type": "u64";
                    },
                    {
                        "name": "active";
                        "type": "bool";
                    }
                ];
            };
        },
        {
            "name": "consensusRecord";
            "docs": [
                "On-chain record of consensus verdict",
                "This is the \"Certificate\" in \"Certificate Authority\""
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "skill";
                        "type": "publicKey";
                    },
                    {
                        "name": "version";
                        "type": "u8";
                    },
                    {
                        "name": "verdict";
                        "type": {
                            "defined": "consensusVerdict";
                        };
                    },
                    {
                        "name": "confidence";
                        "type": "u8";
                    },
                    {
                        "name": "trustScore";
                        "type": "u16";
                    },
                    {
                        "name": "evaluatorCount";
                        "type": "u8";
                    },
                    {
                        "name": "meanScore";
                        "type": "u16";
                    },
                    {
                        "name": "scoreVariance";
                        "type": "u16";
                    },
                    {
                        "name": "criticalOverlap";
                        "type": "u16";
                    },
                    {
                        "name": "methodologyCount";
                        "type": "u8";
                    },
                    {
                        "name": "reportsIpfsHash";
                        "type": "string";
                    },
                    {
                        "name": "reasoningIpfsHash";
                        "type": "string";
                    },
                    {
                        "name": "evaluatedAt";
                        "type": "i64";
                    },
                    {
                        "name": "expiresAt";
                        "type": "i64";
                    },
                    {
                        "name": "recordedBy";
                        "type": "publicKey";
                    },
                    {
                        "name": "bump";
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "executionLog";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "skill";
                        "type": "publicKey";
                    },
                    {
                        "name": "executor";
                        "type": "publicKey";
                    },
                    {
                        "name": "success";
                        "type": "bool";
                    },
                    {
                        "name": "latencyMs";
                        "type": "u32";
                    },
                    {
                        "name": "paymentAmount";
                        "type": "u64";
                    },
                    {
                        "name": "timestamp";
                        "type": "i64";
                    }
                ];
            };
        },
        {
            "name": "skill";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "skillId";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "creator";
                        "type": "publicKey";
                    },
                    {
                        "name": "creatorSignature";
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    },
                    {
                        "name": "priceUsdc";
                        "type": "u64";
                    },
                    {
                        "name": "ipfsHash";
                        "type": "string";
                    },
                    {
                        "name": "auditReportHash";
                        "type": "string";
                    },
                    {
                        "name": "auditorCount";
                        "type": "u8";
                    },
                    {
                        "name": "auditors";
                        "type": {
                            "vec": {
                                "defined": "auditorSignature";
                            };
                        };
                    },
                    {
                        "name": "consensusStatus";
                        "type": {
                            "defined": "consensusStatus";
                        };
                    },
                    {
                        "name": "consensusRecord";
                        "type": {
                            "option": "publicKey";
                        };
                    },
                    {
                        "name": "trustScore";
                        "type": "u16";
                    },
                    {
                        "name": "executionCount";
                        "type": "u64";
                    },
                    {
                        "name": "successCount";
                        "type": "u64";
                    },
                    {
                        "name": "totalEarned";
                        "type": "u64";
                    },
                    {
                        "name": "lastUsed";
                        "type": "i64";
                    },
                    {
                        "name": "createdAt";
                        "type": "i64";
                    },
                    {
                        "name": "bump";
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "skillRegistry";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "authority";
                        "type": "publicKey";
                    },
                    {
                        "name": "skillCount";
                        "type": "u64";
                    },
                    {
                        "name": "totalExecutions";
                        "type": "u64";
                    },
                    {
                        "name": "totalConsensusRecords";
                        "type": "u64";
                    },
                    {
                        "name": "bump";
                        "type": "u8";
                    }
                ];
            };
        }
    ];
    "types": [
        {
            "name": "auditor";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "pubkey";
                        "type": "publicKey";
                    },
                    {
                        "name": "tier";
                        "type": {
                            "defined": "auditorTier";
                        };
                    },
                    {
                        "name": "skillsAudited";
                        "type": "u64";
                    },
                    {
                        "name": "reputation";
                        "type": "u16";
                    },
                    {
                        "name": "totalEarned";
                        "type": "u64";
                    },
                    {
                        "name": "active";
                        "type": "bool";
                    }
                ];
            };
        },
        {
            "name": "auditorSignature";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "auditor";
                        "type": "publicKey";
                    },
                    {
                        "name": "signature";
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    },
                    {
                        "name": "tier";
                        "type": {
                            "defined": "auditorTier";
                        };
                    },
                    {
                        "name": "timestamp";
                        "type": "i64";
                    }
                ];
            };
        },
        {
            "name": "auditorTier";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "tier1";
                    },
                    {
                        "name": "tier2";
                    },
                    {
                        "name": "tier3";
                    }
                ];
            };
        },
        {
            "name": "consensusRecord";
            "docs": [
                "On-chain record of consensus verdict",
                "This is the \"Certificate\" in \"Certificate Authority\""
            ];
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "skill";
                        "type": "publicKey";
                    },
                    {
                        "name": "version";
                        "type": "u8";
                    },
                    {
                        "name": "verdict";
                        "type": {
                            "defined": "consensusVerdict";
                        };
                    },
                    {
                        "name": "confidence";
                        "type": "u8";
                    },
                    {
                        "name": "trustScore";
                        "type": "u16";
                    },
                    {
                        "name": "evaluatorCount";
                        "type": "u8";
                    },
                    {
                        "name": "meanScore";
                        "type": "u16";
                    },
                    {
                        "name": "scoreVariance";
                        "type": "u16";
                    },
                    {
                        "name": "criticalOverlap";
                        "type": "u16";
                    },
                    {
                        "name": "methodologyCount";
                        "type": "u8";
                    },
                    {
                        "name": "reportsIpfsHash";
                        "type": "string";
                    },
                    {
                        "name": "reasoningIpfsHash";
                        "type": "string";
                    },
                    {
                        "name": "evaluatedAt";
                        "type": "i64";
                    },
                    {
                        "name": "expiresAt";
                        "type": "i64";
                    },
                    {
                        "name": "recordedBy";
                        "type": "publicKey";
                    },
                    {
                        "name": "bump";
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "consensusStatus";
            "docs": [
                "Consensus status for a skill"
            ];
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "pending";
                    },
                    {
                        "name": "inReview";
                    },
                    {
                        "name": "approved";
                    },
                    {
                        "name": "rejected";
                    },
                    {
                        "name": "contested";
                    }
                ];
            };
        },
        {
            "name": "consensusVerdict";
            "type": {
                "kind": "enum";
                "variants": [
                    {
                        "name": "pending";
                    },
                    {
                        "name": "approved";
                    },
                    {
                        "name": "rejected";
                    },
                    {
                        "name": "inconclusive";
                    }
                ];
            };
        },
        {
            "name": "executionLog";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "skill";
                        "type": "publicKey";
                    },
                    {
                        "name": "executor";
                        "type": "publicKey";
                    },
                    {
                        "name": "success";
                        "type": "bool";
                    },
                    {
                        "name": "latencyMs";
                        "type": "u32";
                    },
                    {
                        "name": "paymentAmount";
                        "type": "u64";
                    },
                    {
                        "name": "timestamp";
                        "type": "i64";
                    }
                ];
            };
        },
        {
            "name": "skill";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "skillId";
                        "type": {
                            "array": [
                                "u8",
                                32
                            ];
                        };
                    },
                    {
                        "name": "creator";
                        "type": "publicKey";
                    },
                    {
                        "name": "creatorSignature";
                        "type": {
                            "array": [
                                "u8",
                                64
                            ];
                        };
                    },
                    {
                        "name": "priceUsdc";
                        "type": "u64";
                    },
                    {
                        "name": "ipfsHash";
                        "type": "string";
                    },
                    {
                        "name": "auditReportHash";
                        "type": "string";
                    },
                    {
                        "name": "auditorCount";
                        "type": "u8";
                    },
                    {
                        "name": "auditors";
                        "type": {
                            "vec": {
                                "defined": "auditorSignature";
                            };
                        };
                    },
                    {
                        "name": "consensusStatus";
                        "type": {
                            "defined": "consensusStatus";
                        };
                    },
                    {
                        "name": "consensusRecord";
                        "type": {
                            "option": "publicKey";
                        };
                    },
                    {
                        "name": "trustScore";
                        "type": "u16";
                    },
                    {
                        "name": "executionCount";
                        "type": "u64";
                    },
                    {
                        "name": "successCount";
                        "type": "u64";
                    },
                    {
                        "name": "totalEarned";
                        "type": "u64";
                    },
                    {
                        "name": "lastUsed";
                        "type": "i64";
                    },
                    {
                        "name": "createdAt";
                        "type": "i64";
                    },
                    {
                        "name": "bump";
                        "type": "u8";
                    }
                ];
            };
        },
        {
            "name": "skillRegistry";
            "type": {
                "kind": "struct";
                "fields": [
                    {
                        "name": "authority";
                        "type": "publicKey";
                    },
                    {
                        "name": "skillCount";
                        "type": "u64";
                    },
                    {
                        "name": "totalExecutions";
                        "type": "u64";
                    },
                    {
                        "name": "totalConsensusRecords";
                        "type": "u64";
                    },
                    {
                        "name": "bump";
                        "type": "u8";
                    }
                ];
            };
        }
    ];
    "errors": [
        {
            "code": 6000;
            "name": "auditorNotActive";
            "msg": "Auditor is not active";
        },
        {
            "code": 6001;
            "name": "auditorAlreadySigned";
            "msg": "Auditor has already signed this skill";
        },
        {
            "code": 6002;
            "name": "invalidConsensusVerdict";
            "msg": "Invalid consensus verdict";
        },
        {
            "code": 6003;
            "name": "consensusAlreadyRecorded";
            "msg": "Skill already has a recorded consensus";
        }
    ];
};
