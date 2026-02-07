export declare const resolvers: {
    Query: {
        skills: (_: any, filters: any, { registryService }: any) => Promise<any>;
        skill: (_: any, { id }: {
            id: string;
        }, { registryService }: any) => any;
        auditors: (_: any, filters: any, { registryService }: any) => Promise<any>;
        auditor: (_: any, { pubkey }: {
            pubkey: string;
        }, { registryService }: any) => any;
        topAuditors: (_: any, { limit }: {
            limit?: number;
        }, { registryService }: any) => any;
        recentExecutions: (_: any, { limit }: {
            limit?: number;
        }, { registryService }: any) => any;
        executionsBySkill: (_: any, { skillId, limit }: {
            skillId: string;
            limit?: number;
        }, { registryService }: any) => Promise<any>;
        registryStats: (_: any, __: any, { registryService }: any) => any;
        calculateSplit: (_: any, { totalUsdc, auditorCount }: {
            totalUsdc: number;
            auditorCount?: number;
        }, { paymentService }: any) => any;
        getSplitRecipients: (_: any, { totalUsdc, creatorAddress, auditorAddresses }: {
            totalUsdc: number;
            creatorAddress: string;
            auditorAddresses?: string[];
        }, { paymentService }: any) => any;
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
