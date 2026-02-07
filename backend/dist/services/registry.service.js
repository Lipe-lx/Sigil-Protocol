"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistryService = void 0;
const web3_js_1 = require("@solana/web3.js");
// Use direct import instead of require for ESM compatibility in Workers
const sigil_registry_1 = require("../../../sdk/src/sigil-registry");
// We'll pass connection and config in constructor for better testing and worker usage
class RegistryService {
    constructor(connection) {
        this.client = new sigil_registry_1.SigilRegistryClient(connection, { publicKey: web3_js_1.PublicKey.default });
    }
    async getSkills(filters) {
        try {
            const skills = await this.client.getAllSkills();
            return skills.map(s => ({
                id: s.publicKey.toString(),
                skillId: Buffer.from(s.account.skillId).toString('hex'),
                creator: s.account.creator.toString(),
                priceUsdc: s.account.priceUsdc.toNumber() / 1e6,
                ipfsHash: s.account.ipfsHash,
                auditReportHash: s.account.auditReportHash,
                trustScore: s.account.trustScore,
                executionCount: s.account.executionCount.toNumber(),
                successRate: s.account.executionCount.gt(0)
                    ? (s.account.successCount.toNumber() / s.account.executionCount.toNumber()) * 100
                    : 0,
                totalEarned: s.account.totalEarned.toNumber() / 1e6,
                lastUsed: new Date(s.account.lastUsed.toNumber() * 1000).toISOString(),
                createdAt: new Date(s.account.createdAt.toNumber() * 1000).toISOString(),
                auditors: s.account.auditors.map((a) => ({
                    auditor: a.auditor.toString(),
                    tier: Object.keys(a.tier)[0].toUpperCase(),
                    timestamp: new Date(a.timestamp.toNumber() * 1000).toISOString(),
                }))
            }));
        }
        catch (error) {
            console.error('Error fetching skills:', error);
            return [];
        }
    }
    async getSkillById(id) {
        try {
            const pubkey = new web3_js_1.PublicKey(id);
            const skill = await this.client.getSkill(pubkey);
            return {
                id: pubkey.toString(),
                skillId: Buffer.from(skill.skillId).toString('hex'),
                creator: skill.creator.toString(),
                priceUsdc: skill.priceUsdc.toNumber() / 1e6,
                ipfsHash: skill.ipfsHash,
                auditReportHash: skill.auditReportHash,
                trustScore: skill.trustScore,
                executionCount: skill.executionCount.toNumber(),
                successRate: skill.executionCount.gt(0)
                    ? (skill.successCount.toNumber() / skill.executionCount.toNumber()) * 100
                    : 0,
                totalEarned: skill.totalEarned.toNumber() / 1e6,
                lastUsed: new Date(skill.lastUsed.toNumber() * 1000).toISOString(),
                createdAt: new Date(skill.createdAt.toNumber() * 1000).toISOString(),
                auditors: skill.auditors.map((a) => ({
                    auditor: a.auditor.toString(),
                    tier: Object.keys(a.tier)[0].toUpperCase(),
                    timestamp: new Date(a.timestamp.toNumber() * 1000).toISOString(),
                }))
            };
        }
        catch (error) {
            console.error('Error fetching skill by id:', error);
            return null;
        }
    }
    async getAuditors() {
        try {
            const auditors = await this.client.getAllAuditors();
            return auditors.map(a => ({
                id: a.publicKey.toString(),
                pubkey: a.account.pubkey.toString(),
                tier: Object.keys(a.account.tier)[0].toUpperCase(),
                skillsAudited: a.account.skillsAudited.toNumber(),
                reputation: a.account.reputation,
                totalEarned: a.account.totalEarned.toNumber() / 1e6,
                active: a.account.active,
            }));
        }
        catch (error) {
            console.error('Error fetching auditors:', error);
            return [];
        }
    }
    async getAuditorByPubkey(pubkey) {
        try {
            const auditorPubkey = new web3_js_1.PublicKey(pubkey);
            const auditorPda = this.client.deriveAuditorPda(auditorPubkey);
            const auditor = await this.client.getAuditor(auditorPda);
            return {
                id: auditorPda.toString(),
                pubkey: auditor.pubkey.toString(),
                tier: Object.keys(auditor.tier)[0].toUpperCase(),
                skillsAudited: auditor.skillsAudited.toNumber(),
                reputation: auditor.reputation,
                totalEarned: auditor.totalEarned.toNumber() / 1e6,
                active: auditor.active,
            };
        }
        catch (error) {
            console.error('Error fetching auditor by pubkey:', error);
            return null;
        }
    }
    async getTopAuditors(limit = 10) {
        try {
            const auditors = await this.getAuditors();
            return auditors
                .filter(a => a.active)
                .sort((a, b) => b.reputation - a.reputation)
                .slice(0, limit);
        }
        catch (error) {
            console.error('Error fetching top auditors:', error);
            return [];
        }
    }
    async getRecentExecutions(limit = 10) {
        try {
            const logs = await this.client.getAllLogs();
            return logs
                .map(l => ({
                id: l.publicKey.toString(),
                skill: l.account.skill.toString(),
                executor: l.account.executor.toString(),
                success: l.account.success,
                latencyMs: l.account.latencyMs,
                paymentAmount: l.account.paymentAmount.toNumber() / 1e6,
                timestamp: new Date(l.account.timestamp.toNumber() * 1000).toISOString(),
            }))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, limit);
        }
        catch (error) {
            console.error('Error fetching recent executions:', error);
            return [];
        }
    }
    async getRegistryStats() {
        try {
            const registry = await this.client.getRegistry();
            if (!registry)
                return null;
            return {
                skillCount: registry.skillCount.toNumber(),
                totalExecutions: registry.totalExecutions.toNumber(),
                authority: registry.authority.toString(),
            };
        }
        catch (error) {
            console.error('Error fetching registry stats:', error);
            return null;
        }
    }
}
exports.RegistryService = RegistryService;
