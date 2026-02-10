#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Wallet } from "@coral-xyz/anchor";
import { SigilClient } from "./sigil-client.js";

const RPC_URL = process.env.SIGIL_RPC_URL || "https://api.devnet.solana.com";

class SigilMcpServer {
  private server: Server;
  private client: SigilClient | null = null;

  constructor() {
    this.server = new Server(
      {
        name: "sigil-protocol-sdk",
        version: "1.1.1",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  private async getClient(): Promise<SigilClient> {
    if (this.client) return this.client;

    const connection = new Connection(RPC_URL, "confirmed");
    // Always use a dummy wallet for MCP server - we never sign here.
    const wallet = { 
      publicKey: PublicKey.default,
      signTransaction: () => { throw new Error("MCP Server is read-only. Sign the returned transaction externally."); },
      signAllTransactions: () => { throw new Error("MCP Server is read-only. Sign the returned transaction externally."); }
    };

    this.client = new SigilClient(connection, wallet);
    return this.client;
  }

  private setupTools() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
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

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const client = await this.getClient();
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_skill_info": {
            const skillPda = new PublicKey(args?.skillId as string);
            const data = await client.program.account.skill.fetch(skillPda);
            return {
              content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
            };
          }

          case "verify_integrity": {
            const skillPda = new PublicKey(args?.skillId as string);
            const code = args?.code as string;
            const isValid = await client.verifyIntegrity(skillPda, code);
            return {
              content: [{ type: "text", text: isValid ? "✅ Integrity Verified: Code matches on-chain hash." : "❌ SECURITY ALERT: Code does NOT match on-chain hash!" }],
            };
          }

          case "prepare_execute_skill": {
            const skillPda = new PublicKey(args?.skillId as string);
            const executor = new PublicKey(args?.executor as string);
            const success = args?.success as boolean;
            const latencyMs = args?.latencyMs as number;

            // Manual transaction building to avoid RPC call
            const skillData = await client.program.account.skill.fetch(skillPda);
            const creator = skillData.creator;
            const protocolTreasury = new PublicKey('3adsGFsaGUDePR61ZtvkwkkpCeLne6immQbp2gR5jbfo');
            const usdcMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

            const executorUsdc = await getAssociatedTokenAddress(usdcMint, executor);
            const creatorUsdc = await getAssociatedTokenAddress(usdcMint, creator);
            const protocolUsdc = await getAssociatedTokenAddress(usdcMint, protocolTreasury);

            const executionLog = Keypair.generate();

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
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Sigil MCP Server running on stdio");
  }
}

const server = new SigilMcpServer();
server.run().catch(console.error);
