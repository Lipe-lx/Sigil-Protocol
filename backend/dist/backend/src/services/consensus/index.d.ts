/**
 * Sigil Protocol - Consensus Module Index
 *
 * Central export point for the consensus engine.
 */
export { ConsensusService, consensusService, createConsensusService } from './consensus.service';
export { MethodologyType, FindingCategory, AuditorTier, ConsensusVerdict, EvaluationRecommendation, ConsensusTier, Finding, EvaluationScores, Methodology, TechnicalReport, ConsensusResult, Dispute, PreReviewResult, PreReviewCheck, ConsensusConfig, CONSENSUS_CONFIGS, } from './types';
export { calculateVariance, VarianceResult, hasStrongConsensus, hasWeakConsensus, hasNoConsensus, interpretVariance, } from './variance.calculator';
export { calculateOverlap, OverlapResult, PairwiseOverlap, interpretOverlap, } from './overlap.calculator';
export { PreReviewService } from './prereview.service';
export { ReputationEngine, AuditorReputation, ReputationChange, SkillTrustScore, REPUTATION_CONFIG, } from './reputation.engine';
