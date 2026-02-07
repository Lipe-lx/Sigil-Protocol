import { Connection } from '@solana/web3.js';
export declare class RegistryService {
    private client;
    constructor(connection: Connection);
    getSkills(filters: any): Promise<{
        id: string;
        skillId: string;
        creator: string;
        priceUsdc: number;
        ipfsHash: string;
        auditReportHash: string;
        trustScore: number;
        executionCount: any;
        successRate: number;
        totalEarned: number;
        lastUsed: string;
        createdAt: string;
        auditors: {
            auditor: any;
            tier: string;
            timestamp: string;
        }[];
    }[]>;
    getSkillById(id: string): Promise<{
        id: string;
        skillId: string;
        creator: string;
        priceUsdc: number;
        ipfsHash: string;
        auditReportHash: string;
        trustScore: number;
        executionCount: any;
        successRate: number;
        totalEarned: number;
        lastUsed: string;
        createdAt: string;
        auditors: {
            auditor: any;
            tier: string;
            timestamp: string;
        }[];
    }>;
    getAuditors(): Promise<any>;
    getAuditorByPubkey(pubkey: string): Promise<{
        id: string;
        pubkey: any;
        tier: string;
        skillsAudited: any;
        reputation: any;
        totalEarned: number;
        active: any;
    }>;
    getTopAuditors(limit?: number): Promise<any>;
    getRecentExecutions(limit?: number): Promise<any>;
    getRegistryStats(): Promise<{
        skillCount: any;
        totalExecutions: any;
        authority: any;
    }>;
}
