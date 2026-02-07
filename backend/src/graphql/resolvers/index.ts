import { RegistryService } from '../../services/registry.service';
import { paymentService } from '../../services/payment.service';

export const resolvers = {
  Query: {
    // Skills
    skills: async (_: any, filters: any) => {
      const skills = await RegistryService.getSkills(filters);
      
      // Apply filters if provided
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
      
      // Pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      
      return filtered.slice(offset, offset + limit);
    },
    
    skill: (_: any, { id }: { id: string }) => RegistryService.getSkillById(id),
    
    // Auditors
    auditors: async (_: any, filters: any) => {
      let auditors = await RegistryService.getAuditors();
      
      if (filters.tier) {
        auditors = auditors.filter((a: any) => a.tier === filters.tier);
      }
      
      if (filters.activeOnly) {
        auditors = auditors.filter((a: any) => a.active);
      }
      
      const limit = filters.limit || 50;
      return auditors.slice(0, limit);
    },
    
    auditor: (_: any, { pubkey }: { pubkey: string }) => 
      RegistryService.getAuditorByPubkey(pubkey),
    
    topAuditors: (_: any, { limit }: { limit?: number }) => 
      RegistryService.getTopAuditors(limit || 10),
    
    // Executions
    recentExecutions: (_: any, { limit }: { limit?: number }) => 
      RegistryService.getRecentExecutions(limit || 10),
    
    executionsBySkill: async (_: any, { skillId, limit }: { skillId: string; limit?: number }) => {
      const executions = await RegistryService.getRecentExecutions(1000);
      return executions
        .filter((e: any) => e.skill === skillId)
        .slice(0, limit || 20);
    },
    
    // Registry
    registryStats: () => RegistryService.getRegistryStats(),
    
    // Payments
    calculateSplit: (_: any, { totalUsdc, auditorCount }: { totalUsdc: number; auditorCount?: number }) => 
      paymentService.calculateSplit(totalUsdc, auditorCount || 1),
    
    getSplitRecipients: (_: any, { totalUsdc, creatorAddress, auditorAddresses }: { 
      totalUsdc: number; 
      creatorAddress: string; 
      auditorAddresses?: string[] 
    }) => paymentService.getSplitRecipients(totalUsdc, creatorAddress, auditorAddresses || []),
  },
  
  Mutation: {
    prepareSkillMint: async (_: any, { skillId, priceUsdc, ipfsHash }: {
      skillId: string;
      priceUsdc: number;
      ipfsHash: string;
    }) => {
      // This is a preparation step - actual minting happens client-side
      const errors: string[] = [];
      
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
