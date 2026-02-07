"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const registry_service_1 = require("../../services/registry.service");
const payment_service_1 = require("../../services/payment.service");
exports.resolvers = {
    Query: {
        // Skills
        skills: async (_, filters) => {
            const skills = await registry_service_1.RegistryService.getSkills(filters);
            // Apply filters if provided
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
            // Pagination
            const offset = filters.offset || 0;
            const limit = filters.limit || 50;
            return filtered.slice(offset, offset + limit);
        },
        skill: (_, { id }) => registry_service_1.RegistryService.getSkillById(id),
        // Auditors
        auditors: async (_, filters) => {
            let auditors = await registry_service_1.RegistryService.getAuditors();
            if (filters.tier) {
                auditors = auditors.filter((a) => a.tier === filters.tier);
            }
            if (filters.activeOnly) {
                auditors = auditors.filter((a) => a.active);
            }
            const limit = filters.limit || 50;
            return auditors.slice(0, limit);
        },
        auditor: (_, { pubkey }) => registry_service_1.RegistryService.getAuditorByPubkey(pubkey),
        topAuditors: (_, { limit }) => registry_service_1.RegistryService.getTopAuditors(limit || 10),
        // Executions
        recentExecutions: (_, { limit }) => registry_service_1.RegistryService.getRecentExecutions(limit || 10),
        executionsBySkill: async (_, { skillId, limit }) => {
            const executions = await registry_service_1.RegistryService.getRecentExecutions(1000);
            return executions
                .filter((e) => e.skill === skillId)
                .slice(0, limit || 20);
        },
        // Registry
        registryStats: () => registry_service_1.RegistryService.getRegistryStats(),
        // Payments
        calculateSplit: (_, { totalUsdc, auditorCount }) => payment_service_1.paymentService.calculateSplit(totalUsdc, auditorCount || 1),
        getSplitRecipients: (_, { totalUsdc, creatorAddress, auditorAddresses }) => payment_service_1.paymentService.getSplitRecipients(totalUsdc, creatorAddress, auditorAddresses || []),
    },
    Mutation: {
        prepareSkillMint: async (_, { skillId, priceUsdc, ipfsHash }) => {
            // This is a preparation step - actual minting happens client-side
            const errors = [];
            // Validate inputs
            if (!skillId || skillId.length !== 64) {
                errors.push('skillId must be a 64-character hex string (SHA-256)');
            }
            if (priceUsdc < 0.001) {
                errors.push('priceUsdc must be at least 0.001 USDC');
            }
            if (!ipfsHash || ipfsHash.length < 10) {
                errors.push('ipfsHash must be a valid IPFS CID');
            }
            // TODO: Derive actual PDAs using SDK
            const skillPda = 'DERIVE_CLIENT_SIDE';
            const registryPda = 'DERIVE_CLIENT_SIDE';
            return {
                skillPda,
                registryPda,
                estimatedFee: 0.005, // ~0.005 SOL for account creation
                ready: errors.length === 0,
                errors: errors.length > 0 ? errors : null,
            };
        },
    },
};
