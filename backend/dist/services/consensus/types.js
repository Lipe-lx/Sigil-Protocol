"use strict";
/**
 * Sigil Protocol - Consensus Engine Types
 *
 * This file defines the core data structures for the peer review
 * and consensus system. All types are designed to be:
 *
 * 1. Serializable to JSON for API transport
 * 2. Storable on IPFS for evidence preservation
 * 3. Hashable for on-chain attestation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONSENSUS_CONFIGS = exports.ConsensusTier = exports.EvaluationRecommendation = exports.ConsensusVerdict = exports.AuditorTier = exports.FindingCategory = exports.MethodologyType = void 0;
// ============================================================
// ENUMS
// ============================================================
/**
 * Methodology types for skill evaluation
 * Diversity of methodologies is required for valid consensus
 */
var MethodologyType;
(function (MethodologyType) {
    MethodologyType["STATIC_ANALYSIS"] = "STATIC_ANALYSIS";
    MethodologyType["DYNAMIC_TESTING"] = "DYNAMIC_TESTING";
    MethodologyType["FUZZING"] = "FUZZING";
    MethodologyType["MANUAL_REVIEW"] = "MANUAL_REVIEW";
    MethodologyType["FORMAL_VERIFICATION"] = "FORMAL_VERIFICATION";
    MethodologyType["PENETRATION_TESTING"] = "PENETRATION_TESTING";
})(MethodologyType || (exports.MethodologyType = MethodologyType = {}));
/**
 * Categories for security findings
 */
var FindingCategory;
(function (FindingCategory) {
    FindingCategory["INJECTION"] = "INJECTION";
    FindingCategory["JAILBREAK"] = "JAILBREAK";
    FindingCategory["DATA_LEAK"] = "DATA_LEAK";
    FindingCategory["RESOURCE_ABUSE"] = "RESOURCE_ABUSE";
    FindingCategory["PRIVACY"] = "PRIVACY";
    FindingCategory["AUTHENTICATION"] = "AUTHENTICATION";
    FindingCategory["LOGIC_ERROR"] = "LOGIC_ERROR";
    FindingCategory["OTHER"] = "OTHER";
})(FindingCategory || (exports.FindingCategory = FindingCategory = {}));
/**
 * Auditor tier levels
 * Higher tiers have more weight in consensus
 */
var AuditorTier;
(function (AuditorTier) {
    AuditorTier["TIER1"] = "TIER1";
    AuditorTier["TIER2"] = "TIER2";
    AuditorTier["TIER3"] = "TIER3";
})(AuditorTier || (exports.AuditorTier = AuditorTier = {}));
/**
 * Consensus verdict outcomes
 */
var ConsensusVerdict;
(function (ConsensusVerdict) {
    ConsensusVerdict["APPROVED"] = "APPROVED";
    ConsensusVerdict["REJECTED"] = "REJECTED";
    ConsensusVerdict["INCONCLUSIVE"] = "INCONCLUSIVE";
    ConsensusVerdict["PENDING"] = "PENDING";
    ConsensusVerdict["CONTESTED"] = "CONTESTED";
})(ConsensusVerdict || (exports.ConsensusVerdict = ConsensusVerdict = {}));
/**
 * Evaluation recommendation from individual auditor
 */
var EvaluationRecommendation;
(function (EvaluationRecommendation) {
    EvaluationRecommendation["APPROVE"] = "APPROVE";
    EvaluationRecommendation["REJECT"] = "REJECT";
    EvaluationRecommendation["CONDITIONAL"] = "CONDITIONAL";
})(EvaluationRecommendation || (exports.EvaluationRecommendation = EvaluationRecommendation = {}));
/**
 * Consensus tier (rigor level)
 */
var ConsensusTier;
(function (ConsensusTier) {
    ConsensusTier["BASIC"] = "BASIC";
    ConsensusTier["RIGOROUS"] = "RIGOROUS";
    ConsensusTier["CRITICAL"] = "CRITICAL";
})(ConsensusTier || (exports.ConsensusTier = ConsensusTier = {}));
/**
 * Default configurations for each tier
 */
exports.CONSENSUS_CONFIGS = {
    [ConsensusTier.BASIC]: {
        tier: ConsensusTier.BASIC,
        scoreVarianceMax: 0.20,
        criticalOverlapMin: 0.50,
        approvalThreshold: 700,
        rejectionThreshold: 500,
        minEvaluators: 3,
        maxEvaluators: 5,
        minMethodologies: 2,
        evaluationTimeoutHours: 72,
        disputeTimeoutHours: 48,
    },
    [ConsensusTier.RIGOROUS]: {
        tier: ConsensusTier.RIGOROUS,
        scoreVarianceMax: 0.15,
        criticalOverlapMin: 0.66,
        approvalThreshold: 700,
        rejectionThreshold: 500,
        minEvaluators: 5,
        maxEvaluators: 7,
        minMethodologies: 3,
        evaluationTimeoutHours: 120,
        disputeTimeoutHours: 72,
    },
    [ConsensusTier.CRITICAL]: {
        tier: ConsensusTier.CRITICAL,
        scoreVarianceMax: 0.10,
        criticalOverlapMin: 0.75,
        approvalThreshold: 750,
        rejectionThreshold: 450,
        minEvaluators: 7,
        maxEvaluators: 9,
        minMethodologies: 4,
        evaluationTimeoutHours: 168,
        disputeTimeoutHours: 96,
    },
};
