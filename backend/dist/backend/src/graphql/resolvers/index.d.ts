export declare const resolvers: {
    Query: {
        skills: (_: any, filters: any) => Promise<any>;
        skill: (_: any, { id }: {
            id: string;
        }) => Promise<{
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
        auditors: (_: any, filters: any) => Promise<any>;
        auditor: (_: any, { pubkey }: {
            pubkey: string;
        }) => Promise<{
            id: string;
            pubkey: any;
            tier: string;
            skillsAudited: any;
            reputation: any;
            totalEarned: number;
            active: any;
        }>;
        topAuditors: (_: any, { limit }: {
            limit?: number;
        }) => Promise<any>;
        recentExecutions: (_: any, { limit }: {
            limit?: number;
        }) => Promise<any>;
        executionsBySkill: (_: any, { skillId, limit }: {
            skillId: string;
            limit?: number;
        }) => Promise<any>;
        registryStats: () => Promise<{
            skillCount: any;
            totalExecutions: any;
            authority: any;
        }>;
        calculateSplit: (_: any, { totalUsdc, auditorCount }: {
            totalUsdc: number;
            auditorCount?: number;
        }) => import("../../services/payment.service").PaymentSplit;
        getSplitRecipients: (_: any, { totalUsdc, creatorAddress, auditorAddresses }: {
            totalUsdc: number;
            creatorAddress: string;
            auditorAddresses?: string[];
        }) => import("../../services/payment.service").SplitRecipient[];
    };
    Mutation: {
        prepareSkillMint: (_: any, { skillId, priceUsdc, ipfsHash }: {
            skillId: string;
            priceUsdc: number;
            ipfsHash: string;
        }) => Promise<{
            skillPda: string;
            registryPda: string;
            estimatedFee: number;
            ready: boolean;
            errors: string[];
        }>;
    };
};
