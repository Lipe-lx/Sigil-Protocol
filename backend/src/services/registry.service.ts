import { Connection, PublicKey } from '@solana/web3.js';
import { SigilRegistryClient } from '../../sdk/src/sigil-registry';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
// Using a dummy wallet for read-only operations if needed, or actual authority if signing
const registryClient = new SigilRegistryClient(connection, { publicKey: PublicKey.default } as any);

export class RegistryService {
  static async getSkills(filters: any) {
    try {
      const skills = await registryClient.getAllSkills();
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
        auditors: s.account.auditors.map((a: any) => ({
          auditor: a.auditor.toString(),
          tier: Object.keys(a.tier)[0].toUpperCase(),
          timestamp: new Date(a.timestamp.toNumber() * 1000).toISOString(),
        }))
      }));
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }

  static async getSkillById(id: string) {
    try {
      const pubkey = new PublicKey(id);
      const skill = await registryClient.getSkill(pubkey);
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
        auditors: skill.auditors.map((a: any) => ({
          auditor: a.auditor.toString(),
          tier: Object.keys(a.tier)[0].toUpperCase(),
          timestamp: new Date(a.timestamp.toNumber() * 1000).toISOString(),
        }))
      };
    } catch (error) {
      console.error('Error fetching skill by id:', error);
      return null;
    }
  }

  static async getAuditors() {
    try {
      const auditors = await registryClient.getAllAuditors();
      return auditors.map(a => ({
        id: a.publicKey.toString(),
        pubkey: a.account.pubkey.toString(),
        tier: Object.keys(a.account.tier)[0].toUpperCase(),
        skillsAudited: a.account.skillsAudited.toNumber(),
        reputation: a.account.reputation,
        totalEarned: a.account.totalEarned.toNumber() / 1e6,
        active: a.account.active,
      }));
    } catch (error) {
      console.error('Error fetching auditors:', error);
      return [];
    }
  }

  static async getAuditorByPubkey(pubkey: string) {
    try {
      const auditorPubkey = new PublicKey(pubkey);
      const auditorPda = registryClient.deriveAuditorPda(auditorPubkey);
      const auditor = await registryClient.getAuditor(auditorPda);
      return {
        id: auditorPda.toString(),
        pubkey: auditor.pubkey.toString(),
        tier: Object.keys(auditor.tier)[0].toUpperCase(),
        skillsAudited: auditor.skillsAudited.toNumber(),
        reputation: auditor.reputation,
        totalEarned: auditor.totalEarned.toNumber() / 1e6,
        active: auditor.active,
      };
    } catch (error) {
      console.error('Error fetching auditor by pubkey:', error);
      return null;
    }
  }

  static async getTopAuditors(limit: number = 10) {
    try {
      const auditors = await this.getAuditors();
      return auditors
        .filter(a => a.active)
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top auditors:', error);
      return [];
    }
  }

  static async getRecentExecutions(limit: number = 10) {
    try {
      const logs = await registryClient.getAllLogs();
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
    } catch (error) {
      console.error('Error fetching recent executions:', error);
      return [];
    }
  }

  static async getRegistryStats() {
    try {
      const registry = await registryClient.getRegistry();
      return {
        skillCount: registry.skillCount.toNumber(),
        totalExecutions: registry.totalExecutions.toNumber(),
        authority: registry.authority.toString(),
      };
    } catch (error) {
      console.error('Error fetching registry stats:', error);
      return null;
    }
  }
}
