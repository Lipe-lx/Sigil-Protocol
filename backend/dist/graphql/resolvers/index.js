"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
exports.resolvers = {
    Query: {
        // Skills
        skills: async (_, filters, { registryService }) => {
            const skills = await registryService.getSkills(filters);
            let filtered = skills;
            if (filters.minTrustScore) {
                filtered = filtered.filter((s) => s.trustScore >= filters.minTrustScore);
            }
            if (filters.maxPrice) {
                filtered = filtered.filter((s) => s.priceUsdc <= filters.maxPrice);
            }
            if (filters.creator) {
                filtered = filtered.filter((s) => s.creator === filters.creator);
            }
            const offset = filters.offset || 0;
            const limit = filters.limit || 50;
            return filtered.slice(offset, offset + limit);
        },
        skill: (_, { id }, { registryService }) => registryService.getSkillById(id),
        // Auditors
        auditors: async (_, filters, { registryService }) => {
            let auditors = await registryService.getAuditors();
            if (filters.tier) {
                auditors = auditors.filter((a) => a.tier === filters.tier);
            }
            if (filters.activeOnly) {
                auditors = auditors.filter((a) => a.active);
            }
            const limit = filters.limit || 50;
            return auditors.slice(0, limit);
        },
        auditor: (_, { pubkey }, { registryService }) => registryService.getAuditorByPubkey(pubkey),
        topAuditors: (_, { limit }, { registryService }) => registryService.getTopAuditors(limit || 10),
        // Executions
        recentExecutions: (_, { limit }, { registryService }) => registryService.getRecentExecutions(limit || 10),
        executionsBySkill: async (_, { skillId, limit }, { registryService }) => {
            const executions = await registryService.getRecentExecutions(1000);
            return executions
                .filter((e) => e.skill === skillId)
                .slice(0, limit || 20);
        },
        // Registry
        registryStats: (_, __, { registryService }) => registryService.getRegistryStats(),
        // Payments
        calculateSplit: (_, { totalUsdc, auditorCount }, { paymentService }) => paymentService.calculateSplit(totalUsdc, auditorCount || 1),
        getSplitRecipients: (_, { totalUsdc, creatorAddress, auditorAddresses }, { paymentService }) => paymentService.getSplitRecipients(totalUsdc, creatorAddress, auditorAddresses || []),
    },
    Mutation: {
        prepareSkillMint: async (_, { skillId, priceUsdc, ipfsHash }) => {
            const errors = [];
            if (!skillId || skillId.length !== 64) {
                errors.push('skillId must be a 64-character hex string (SHA-256)');
            }
            if (priceUsdc < 0.001) {
                errors.push('priceUsdc must be at least 0.001 USDC');
            }
            if (!ipfsHash || ipfsHash.length < 10) {
                errors.push('ipfsHash must be a valid IPFS CID');
            }
            return {
                skillPda: 'DERIVE_CLIENT_SIDE',
                registryPda: 'DERIVE_CLIENT_SIDE',
                estimatedFee: 0.005,
                ready: errors.length === 0,
                errors: errors.length > 0 ? errors : null,
            };
        },
    },
};
