export const resolvers = {
  Query: {
    // Skills
    skills: async (_: any, filters: any, { registryService }: any) => {
      const skills = await registryService.getSkills(filters);
      
      let filtered = skills;
      if (filters.minTrustScore) {
        filtered = filtered.filter((s: any) => s.trustScore >= filters.minTrustScore);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter((s: any) => s.priceUsdc <= filters.maxPrice);
      }
      if (filters.creator) {
        filtered = filtered.filter((s: any) => s.creator === filters.creator);
      }
      
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      return filtered.slice(offset, offset + limit);
    },
    
    skill: (_: any, { id }: { id: string }, { registryService }: any) => 
      registryService.getSkillById(id),
    
    // Auditors
    auditors: async (_: any, filters: any, { registryService }: any) => {
      let auditors = await registryService.getAuditors();
      if (filters.tier) {
        auditors = auditors.filter((a: any) => a.tier === filters.tier);
      }
      if (filters.activeOnly) {
        auditors = auditors.filter((a: any) => a.active);
      }
      const limit = filters.limit || 50;
      return auditors.slice(0, limit);
    },
    
    auditor: (_: any, { pubkey }: { pubkey: string }, { registryService }: any) => 
      registryService.getAuditorByPubkey(pubkey),
    
    topAuditors: (_: any, { limit }: { limit?: number }, { registryService }: any) => 
      registryService.getTopAuditors(limit || 10),
    
    // Executions
    recentExecutions: (_: any, { limit }: { limit?: number }, { registryService }: any) => 
      registryService.getRecentExecutions(limit || 10),
    
    executionsBySkill: async (_: any, { skillId, limit }: { skillId: string; limit?: number }, { registryService }: any) => {
      const executions = await registryService.getRecentExecutions(1000);
      return executions
        .filter((e: any) => e.skill === skillId)
        .slice(0, limit || 20);
    },
    
    // Registry
    registryStats: (_: any, __: any, { registryService }: any) => 
      registryService.getRegistryStats(),
    
    // Payments
    calculateSplit: (_: any, { totalUsdc, auditorCount }: { totalUsdc: number; auditorCount?: number }, { paymentService }: any) => 
      paymentService.calculateSplit(totalUsdc, auditorCount || 1),
    
    getSplitRecipients: (_: any, { totalUsdc, creatorAddress, auditorAddresses }: { 
      totalUsdc: number; 
      creatorAddress: string; 
      auditorAddresses?: string[] 
    }, { paymentService }: any) => 
      paymentService.getSplitRecipients(totalUsdc, creatorAddress, auditorAddresses || []),
  },
  
  Mutation: {
    prepareSkillMint: async (_: any, { skillId, priceUsdc, ipfsHash }: {
      skillId: string;
      priceUsdc: number;
      ipfsHash: string;
    }) => {
      const errors: string[] = [];
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
