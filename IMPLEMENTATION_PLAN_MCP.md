# Implementation Plan: Sigil MCP Server ♠️⚡

## Objective
Transform the Sigil SDK from a developer library into a native toolset for AI agents by implementing a Model Context Protocol (MCP) server. This allows agents to discover, verify, and execute payments on the Sigil Protocol without human intervention.

## 1. Technical Architecture
- **Host:** Integrated into `sigil-protocol-sdk`.
- **Protocol:** MCP (JSON-RPC over stdio).
- **Security:**
    - Private key managed via environment variables (`SIGIL_PRIVATE_KEY`).
    - Explicit confirmation prompts for high-value transactions (optional/agent-side).
    - Read-only tools (discovery) vs. Write tools (execution).

## 2. Tool Definition (Phase 1)
| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_skill_info` | Fetch on-chain data for a specific skill. | `skillId` (string) |
| `verify_integrity` | Verify local code against on-chain hash. | `skillId`, `code` (string) |
| `list_recent_skills`| Discover newly registered skills on-chain. | `limit` (number) |
| `execute_skill` | Log execution and trigger payment. | `skillId`, `success`, `latency` |
| `register_skill` | Mint a new skill (Requires `SIGIL_PRIVATE_KEY`). | `name`, `desc`, `price`, `url` |

## 3. Implementation Steps

### Step 1: Infrastructure (SDK Prep)
- Install `@modelcontextprotocol/sdk`.
- Create `src/mcp/` directory.
- Define the `SigilMcpServer` class.

### Step 2: Tool Implementation
- Map `SigilClient` methods to MCP tool handlers.
- Implement error handling (e.g., "Insufficient SOL", "Invalid Hash").
- Add descriptive JSDoc for agent discovery.

### Step 3: Distribution
- Add `bin` entry point to `package.json` mapping `sigil-protocol-sdk` to the MCP server.
- This ensures `npx sigil-protocol-sdk` starts the MCP server directly, maintaining consistency with submission docs.
- Configure `tsconfig.json` to include the MCP entry point in the build.

## 4. Risks & Mitigations
- **RPC Spams:** Rate-limiting at the MCP server level.
- **Key Exposure:** Documentation must explicitly warn against hardcoding keys; use `.env` or secure vault only.
- **Gas Costs:** Tools should return estimated SOL costs before execution when possible.

## 5. Timeline
- **Setup & Discovery Tools:** Today.
- **Write/Execution Tools:** Tomorrow.
- **Testing & NPM Update:** Feb 12.

---
*Created on 2026-02-10 by Ace.*
