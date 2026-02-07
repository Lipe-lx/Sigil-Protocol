"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigilRegistryClient = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const sigil_registry_json_1 = __importDefault(require("../../target/idl/sigil_registry.json"));
class SigilRegistryClient {
    constructor(connection, wallet) {
        this.provider = new anchor_1.AnchorProvider(connection, wallet, {
            commitment: 'confirmed',
        });
        this.program = new anchor_1.Program(sigil_registry_json_1.default, new web3_js_1.PublicKey('BWppEKBBET8EJWsi1QaudVWwhaPX7JhNLDDpfHcCjmwe'), this.provider);
    }
    async initializeRegistry() {
        const [registryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('registry_v1')], this.program.programId);
        return await this.program.methods
            .initializeRegistry()
            .accounts({
            registry: registryPda,
            authority: this.provider.wallet.publicKey,
            systemProgram: anchor_1.web3.SystemProgram.programId,
        })
            .rpc();
    }
    async mintSkill(skillId, priceUsdc, ipfsHash, creatorSignature) {
        const [skillPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('skill'), Buffer.from(skillId)], this.program.programId);
        const [registryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('registry_v1')], this.program.programId);
        return await this.program.methods
            .mintSkill(skillId, priceUsdc, ipfsHash, creatorSignature)
            .accounts({
            skill: skillPda,
            creator: this.provider.wallet.publicKey,
            registry: registryPda,
            systemProgram: anchor_1.web3.SystemProgram.programId,
        })
            .rpc();
    }
    async addAuditorSignature(skillPda, auditorPda, signature, auditReportHash) {
        return await this.program.methods
            .addAuditorSignature(signature, auditReportHash)
            .accounts({
            skill: skillPda,
            auditor: auditorPda,
            auditorSigner: this.provider.wallet.publicKey,
        })
            .rpc();
    }
    async logExecution(skillPda, executionLogPda, executorUsdc, creatorUsdc, protocolUsdc, success, latencyMs) {
        return await this.program.methods
            .logExecution(success, latencyMs)
            .accounts({
            skill: skillPda,
            executionLog: executionLogPda,
            executor: this.provider.wallet.publicKey,
            executorUsdc,
            creatorUsdc,
            protocolUsdc,
            tokenProgram: anchor_1.web3.PublicKey.default, // Needs spl-token program id
            systemProgram: anchor_1.web3.SystemProgram.programId,
        })
            .rpc();
    }
    async getSkill(skillPda) {
        return await this.program.account.Skill.fetch(skillPda);
    }
    async getAllSkills() {
        return await this.program.account.Skill.all();
    }
    async getAllLogs() {
        // ExecutionLog account may not be defined in current IDL
        // Return empty array for MVP - logs are tracked via transaction history
        try {
            // Try to fetch if account exists
            const accounts = await this.program.account.executionLog?.all();
            return accounts || [];
        }
        catch {
            console.warn('ExecutionLog account not available in current program version');
            return [];
        }
    }
    async getAuditor(auditorPda) {
        // Auditor account may not be defined in current IDL
        try {
            return await this.program.account.auditor?.fetch(auditorPda);
        }
        catch {
            console.warn('Auditor account not available in current program version');
            return null;
        }
    }
    async getAllAuditors() {
        // Auditor account may not be defined in current IDL
        try {
            const accounts = await this.program.account.auditor?.all();
            return accounts || [];
        }
        catch {
            console.warn('Auditor account not available in current program version');
            return [];
        }
    }
    async getRegistry() {
        const [registryPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('registry_v1')], this.program.programId);
        try {
            // Account names in Anchor are camelCase versions of the struct name
            return await this.program.account.skillRegistry.fetch(registryPda);
        }
        catch (e) {
            // Try PascalCase as fallback
            try {
                return await this.program.account.SkillRegistry.fetch(registryPda);
            }
            catch {
                console.warn('Registry not initialized');
                return null;
            }
        }
    }
    // Helper to derive PDAs
    deriveSkillPda(skillId) {
        const [pda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('skill'), Buffer.from(skillId)], this.program.programId);
        return pda;
    }
    deriveAuditorPda(auditorPubkey) {
        const [pda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('auditor'), auditorPubkey.toBuffer()], this.program.programId);
        return pda;
    }
    deriveExecutionLogPda(skillPda, executor, timestamp) {
        const [pda] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from('execution'),
            skillPda.toBuffer(),
            executor.toBuffer(),
            timestamp.toArrayLike(Buffer, 'le', 8)
        ], this.program.programId);
        return pda;
    }
}
exports.SigilRegistryClient = SigilRegistryClient;
