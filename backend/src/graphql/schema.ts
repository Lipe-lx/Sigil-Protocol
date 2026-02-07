import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Skill {
    id: ID!
    skillId: String!
    creator: String!
    priceUsdc: Float!
    ipfsHash: String!
    auditReportHash: String
    trustScore: Int!
    executionCount: Int!
    successRate: Float!
    totalEarned: Float!
    lastUsed: String!
    createdAt: String!
    auditors: [AuditorSignature!]!
  }

  type AuditorSignature {
    auditor: String!
    tier: AuditorTier!
    timestamp: String!
  }

  enum AuditorTier {
    TIER1
    TIER2
    TIER3
  }

  type Auditor {
    id: ID!
    pubkey: String!
    tier: AuditorTier!
    skillsAudited: Int!
    reputation: Int!
    totalEarned: Float!
    active: Boolean!
  }

  type ExecutionLog {
    id: ID!
    skill: String!
    executor: String!
    success: Boolean!
    latencyMs: Int!
    paymentAmount: Float!
    timestamp: String!
  }

  type RegistryStats {
    skillCount: Int!
    totalExecutions: Int!
    authority: String!
  }

  type PaymentSplit {
    creator: Float!
    auditors: Float!
    protocol: Float!
    total: Float!
  }

  type SplitRecipient {
    address: String!
    amount: Float!
    role: String!
  }

  type Query {
    # Skills
    skill(id: ID!): Skill
    skills(
      minTrustScore: Int
      maxPrice: Float
      creator: String
      limit: Int
      offset: Int
    ): [Skill!]!
    
    # Auditors
    auditor(pubkey: String!): Auditor
    auditors(
      tier: AuditorTier
      activeOnly: Boolean
      limit: Int
    ): [Auditor!]!
    topAuditors(limit: Int): [Auditor!]!
    
    # Executions
    recentExecutions(limit: Int): [ExecutionLog!]!
    executionsBySkill(skillId: ID!, limit: Int): [ExecutionLog!]!
    
    # Registry
    registryStats: RegistryStats
    
    # Payments
    calculateSplit(totalUsdc: Float!, auditorCount: Int): PaymentSplit!
    getSplitRecipients(
      totalUsdc: Float!
      creatorAddress: String!
      auditorAddresses: [String!]
    ): [SplitRecipient!]!
  }

  type Mutation {
    # Note: Actual minting must be done via client-side SDK for security
    # This mutation is for server-side validation/preparation only
    prepareSkillMint(
      skillId: String!
      priceUsdc: Float!
      ipfsHash: String!
    ): SkillMintPreparation!
  }

  type SkillMintPreparation {
    skillPda: String!
    registryPda: String!
    estimatedFee: Float!
    ready: Boolean!
    errors: [String!]
  }
`;
