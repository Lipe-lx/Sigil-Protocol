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
    pubkey: String!
    tier: AuditorTier!
    skillsAudited: Int!
    reputation: Int!
    totalEarned: Float!
  }

  type ExecutionLog {
    skill: String!
    executor: String!
    success: Boolean!
    latencyMs: Int!
    paymentAmount: Float!
    timestamp: String!
  }

  type Query {
    skill(id: ID!): Skill
    skills(
      minTrustScore: Int
      maxPrice: Float
      limit: Int
      offset: Int
    ): [Skill!]!
    auditor(pubkey: String!): Auditor
    topAuditors(limit: Int): [Auditor!]!
    recentExecutions(limit: Int): [ExecutionLog!]!
  }

  type Mutation {
    mintSkill(
      skillId: String!
      priceUsdc: Float!
      ipfsHash: String!
      signature: String!
    ): Skill!
  }
`;
