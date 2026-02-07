"use strict";
/**
 * Sigil Protocol - Consensus Module Index
 *
 * Central export point for the consensus engine.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPUTATION_CONFIG = exports.ReputationEngine = exports.PreReviewService = exports.interpretOverlap = exports.calculateOverlap = exports.interpretVariance = exports.hasNoConsensus = exports.hasWeakConsensus = exports.hasStrongConsensus = exports.calculateVariance = exports.CONSENSUS_CONFIGS = exports.ConsensusTier = exports.EvaluationRecommendation = exports.ConsensusVerdict = exports.AuditorTier = exports.FindingCategory = exports.MethodologyType = exports.createConsensusService = exports.consensusService = exports.ConsensusService = void 0;
// Main service
var consensus_service_1 = require("./consensus.service");
Object.defineProperty(exports, "ConsensusService", { enumerable: true, get: function () { return consensus_service_1.ConsensusService; } });
Object.defineProperty(exports, "consensusService", { enumerable: true, get: function () { return consensus_service_1.consensusService; } });
Object.defineProperty(exports, "createConsensusService", { enumerable: true, get: function () { return consensus_service_1.createConsensusService; } });
// Types
var types_1 = require("./types");
// Enums
Object.defineProperty(exports, "MethodologyType", { enumerable: true, get: function () { return types_1.MethodologyType; } });
Object.defineProperty(exports, "FindingCategory", { enumerable: true, get: function () { return types_1.FindingCategory; } });
Object.defineProperty(exports, "AuditorTier", { enumerable: true, get: function () { return types_1.AuditorTier; } });
Object.defineProperty(exports, "ConsensusVerdict", { enumerable: true, get: function () { return types_1.ConsensusVerdict; } });
Object.defineProperty(exports, "EvaluationRecommendation", { enumerable: true, get: function () { return types_1.EvaluationRecommendation; } });
Object.defineProperty(exports, "ConsensusTier", { enumerable: true, get: function () { return types_1.ConsensusTier; } });
// Constants
Object.defineProperty(exports, "CONSENSUS_CONFIGS", { enumerable: true, get: function () { return types_1.CONSENSUS_CONFIGS; } });
// Calculators
var variance_calculator_1 = require("./variance.calculator");
Object.defineProperty(exports, "calculateVariance", { enumerable: true, get: function () { return variance_calculator_1.calculateVariance; } });
Object.defineProperty(exports, "hasStrongConsensus", { enumerable: true, get: function () { return variance_calculator_1.hasStrongConsensus; } });
Object.defineProperty(exports, "hasWeakConsensus", { enumerable: true, get: function () { return variance_calculator_1.hasWeakConsensus; } });
Object.defineProperty(exports, "hasNoConsensus", { enumerable: true, get: function () { return variance_calculator_1.hasNoConsensus; } });
Object.defineProperty(exports, "interpretVariance", { enumerable: true, get: function () { return variance_calculator_1.interpretVariance; } });
var overlap_calculator_1 = require("./overlap.calculator");
Object.defineProperty(exports, "calculateOverlap", { enumerable: true, get: function () { return overlap_calculator_1.calculateOverlap; } });
Object.defineProperty(exports, "interpretOverlap", { enumerable: true, get: function () { return overlap_calculator_1.interpretOverlap; } });
// Pre-review
var prereview_service_1 = require("./prereview.service");
Object.defineProperty(exports, "PreReviewService", { enumerable: true, get: function () { return prereview_service_1.PreReviewService; } });
// Reputation
var reputation_engine_1 = require("./reputation.engine");
Object.defineProperty(exports, "ReputationEngine", { enumerable: true, get: function () { return reputation_engine_1.ReputationEngine; } });
Object.defineProperty(exports, "REPUTATION_CONFIG", { enumerable: true, get: function () { return reputation_engine_1.REPUTATION_CONFIG; } });
