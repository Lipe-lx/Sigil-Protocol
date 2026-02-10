#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const sigil_client_js_1 = require("./sigil-client.js");
const RPC_URL = process.env.SIGIL_RPC_URL || "https://api.devnet.solana.com";
class SigilMcpServer {
    constructor() {
        this.client = null;
        this.server = new index_js_1.Server({
            name: "sigil-protocol-sdk",
            version: "1.1.1",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupTools();
    }
    async getClient() {
        if (this.client)
            return this.client;
        const connection = new web3_js_1.Connection(RPC_URL, "confirmed");
        // Always use a dummy wallet for MCP server - we never sign here.
        const wallet = {
            publicKey: web3_js_1.PublicKey.default,
            signTransaction: () => { throw new Error("MCP Server is read-only. Sign the returned transaction externally."); },
            signAllTransactions: () => { throw new Error("MCP Server is read-only. Sign the returned transaction externally."); }
        };
        this.client = new sigil_client_js_1.SigilClient(connection, wallet);
        return this.client;
    }
    setupTools() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "get_skill_info",
                        description: "Fetch on-chain data and metadata for a specific Sigil skill.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                skillId: { type: "string", description: "The public key of the skill account." },
                            },
                            required: ["skillId"],
                        },
                    },
                    {
                        name: "verify_integrity",
                        description: "Verify that local source code matches the on-chain integrity hash of a skill.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                skillId: { type: "string", description: "The public key of the skill account." },
                                code: { type: "string", description: "The source code to verify." },
                            },
                            required: ["skillId", "code"],
                        },
                    },
                    {
                        name: "prepare_execute_skill",
                        description: "Build an unsigned transaction to record a skill execution and trigger payment. This must be signed and sent by the client.",
                        inputSchema: {
                            type: "object",
                            properties: {
                                skillId: { type: "string", description: "The public key of the skill account." },
                                executor: { type: "string", description: "The public key of the agent/wallet executing the skill." },
                                success: { type: "boolean", description: "Whether the execution was successful." },
                                latencyMs: { type: "number", description: "Latency of the execution in milliseconds." },
                            },
                            required: ["skillId", "executor", "success", "latencyMs"],
                        },
                    },
                ],
            };
        });
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const client = await this.getClient();
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "get_skill_info": {
                        const skillPda = new web3_js_1.PublicKey(args?.skillId);
                        const data = await client.program.account.skill.fetch(skillPda);
                        return {
                            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
                        };
                    }
                    case "verify_integrity": {
                        const skillPda = new web3_js_1.PublicKey(args?.skillId);
                        const code = args?.code;
                        const isValid = await client.verifyIntegrity(skillPda, code);
                        return {
                            content: [{ type: "text", text: isValid ? "✅ Integrity Verified: Code matches on-chain hash." : "❌ SECURITY ALERT: Code does NOT match on-chain hash!" }],
                        };
                    }
                    case "prepare_execute_skill": {
                        const skillPda = new web3_js_1.PublicKey(args?.skillId);
                        const executor = new web3_js_1.PublicKey(args?.executor);
                        const success = args?.success;
                        const latencyMs = args?.latencyMs;
                        // Manual transaction building to avoid RPC call
                        const skillData = await client.program.account.skill.fetch(skillPda);
                        const creator = skillData.creator;
                        const protocolTreasury = new web3_js_1.PublicKey('3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo');
                        const usdcMint = new web3_js_1.PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
                        const executorUsdc = await (0, spl_token_1.getAssociatedTokenAddress)(usdcMint, executor);
                        const creatorUsdc = await (0, spl_token_1.getAssociatedTokenAddress)(usdcMint, creator);
                        const protocolUsdc = await (0, spl_token_1.getAssociatedTokenAddress)(usdcMint, protocolTreasury);
                        const executionLog = web3_js_1.Keypair.generate();
                        const tx = await client.program.methods
                            .logExecution(success, latencyMs)
                            .accounts({
                            skill: skillPda,
                            executionLog: executionLog.publicKey,
                            executor,
                            usdcMint,
                            executorUsdc,
                            creatorUsdc,
                            protocolUsdc,
                        })
                            .signers([executionLog])
                            .transaction();
                        tx.feePayer = executor;
                        tx.recentBlockhash = (await client.connection.getLatestBlockhash()).blockhash;
                        // Partial sign with the log account since we have its key
                        tx.partialSign(executionLog);
                        // Serialize and return
                        const serializedTx = tx.serialize({ verifySignatures: false, requireAllSignatures: false });
                        return {
                            content: [
                                { type: "text", text: "Transaction prepared and partially signed by the log account. Please sign as the 'executor' (fee payer) and send." },
                                { type: "text", text: `BASE64_TRANSACTION: ${serializedTx.toString('base64')}` }
                            ],
                        };
                    }
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [{ type: "text", text: `Error: ${error.message}` }],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error("Sigil MCP Server running on stdio");
    }
}
const server = new SigilMcpServer();
server.run().catch(console.error);
