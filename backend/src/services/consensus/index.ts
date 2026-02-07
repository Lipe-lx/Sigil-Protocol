/**
 * Sigil Protocol - Consensus Module Index
 * 
 * Central export point for the consensus engine.
 */

// Main service
export { ConsensusService, consensusService, createConsensusService } from './consensus.service';

// Types
export {
  // Enums
  MethodologyType,
  FindingCategory,
  AuditorTier,
  ConsensusVerdict,
  EvaluationRecommendation,
  ConsensusTier,
  
  // Interfaces
  Finding,
  EvaluationScores,
  Methodology,
  TechnicalReport,
  ConsensusResult,
  Dispute,
  PreReviewResult,
  PreReviewCheck,
  ConsensusConfig,
  
  // Constants
  CONSENSUS_CONFIGS,
} from './types';

// Calculators
export {
  calculateVariance,
  VarianceResult,
  hasStrongConsensus,
  hasWeakConsensus,
  hasNoConsensus,
  interpretVariance,
} from './variance.calculator';

export {
  calculateOverlap,
  OverlapResult,
  PairwiseOverlap,
  interpretOverlap,
} from './overlap.calculator';

// Pre-review
export { PreReviewService } from './prereview.service';

// Reputation
export {
  ReputationEngine,
  AuditorReputation,
  ReputationChange,
  SkillTrustScore,
  REPUTATION_CONFIG,
} from './reputation.engine';
