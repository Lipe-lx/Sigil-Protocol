export declare class RegistryService {
    static getSkills(filters: any): Promise<any>;
    static getSkillById(id: string): Promise<{
        id: string;
        skillId: string;
        creator: any;
        priceUsdc: number;
        ipfsHash: any;
        auditReportHash: any;
        trustScore: any;
        executionCount: any;
        successRate: number;
        totalEarned: number;
        lastUsed: string;
        createdAt: string;
        auditors: any;
    }>;
    static getAuditors(): Promise<any>;
    static getAuditorByPubkey(pubkey: string): Promise<{
        id: string;
        pubkey: any;
        tier: string;
        skillsAudited: any;
        reputation: any;
        totalEarned: number;
        active: any;
    }>;
    static getTopAuditors(limit?: number): Promise<any>;
    static getRecentExecutions(limit?: number): Promise<any>;
    static getRegistryStats(): Promise<{
        skillCount: any;
        totalExecutions: any;
        authority: any;
    }>;
}
