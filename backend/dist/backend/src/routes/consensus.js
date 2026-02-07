"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const consensus_1 = require("../services/consensus");
const router = express_1.default.Router();
/**
 * POST /api/consensus/prereview
 *
 * Run automated pre-review on skill content.
 * This is the first line of defense before human evaluation.
 *
 * Body:
 * - content: string (SKILL.md content)
 * - metadata?: { ipfsHash?, priceUsdc?, declaredDependencies? }
 *
 * Response:
 * - passed: boolean
 * - score: number (0-100)
 * - blockers: string[]
 * - warnings: string[]
 * - checks: PreReviewCheck[]
 */
router.post('/prereview', async (req, res) => {
    try {
        const { content, metadata } = req.body;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                error: 'Missing or invalid content field',
                code: 'INVALID_CONTENT',
            });
        }
        // Quick check first (fast path)
        const quickResult = consensus_1.PreReviewService.quickCheck(content);
        if (quickResult.blocked) {
            return res.status(200).json({
                passed: false,
                score: 0,
                blockers: [quickResult.reason],
                warnings: [],
                checks: [],
                quickBlocked: true,
            });
        }
        // Full pre-review
        const result = await consensus_1.PreReviewService.reviewSkill(content, metadata);
        return res.status(200).json({
            passed: result.passed,
            score: result.score,
            blockers: result.blockers,
            warnings: result.warnings,
            checks: result.checks,
            quickBlocked: false,
        });
    }
    catch (error) {
        console.error('[CONSENSUS] Pre-review error:', error);
        return res.status(500).json({
            error: 'Pre-review failed',
            code: 'PREREVIEW_ERROR',
            message: error.message,
        });
    }
});
/**
 * POST /api/consensus/evaluate
 *
 * Submit an evaluation report for a skill.
 * In production, this would store the report and trigger consensus calculation.
 *
 * Body: TechnicalReport
 *
 * Response:
 * - evaluationId: string
 * - status: 'ACCEPTED' | 'REJECTED'
 * - message: string
 */
router.post('/evaluate', async (req, res) => {
    try {
        const report = req.body;
        // Validate required fields
        const validationErrors = [];
        if (!report.evaluatorId)
            validationErrors.push('evaluatorId is required');
        if (!report.skillId)
            validationErrors.push('skillId is required');
        if (!report.methodology?.type)
            validationErrors.push('methodology.type is required');
        if (!report.scores?.overall)
            validationErrors.push('scores.overall is required');
        if (!report.recommendation)
            validationErrors.push('recommendation is required');
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: 'Invalid evaluation report',
                code: 'VALIDATION_ERROR',
                details: validationErrors,
            });
        }
        // Generate evaluation ID
        const evaluationId = `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // In production: Store report in database
        // For hackathon demo: Log and return success
        console.log('[CONSENSUS] Evaluation submitted:', {
            evaluationId,
            skillId: report.skillId,
            evaluatorId: report.evaluatorId,
            score: report.scores.overall,
            recommendation: report.recommendation,
        });
        return res.status(201).json({
            evaluationId,
            status: 'ACCEPTED',
            message: 'Evaluation report accepted and queued for consensus',
        });
    }
    catch (error) {
        console.error('[CONSENSUS] Evaluation error:', error);
        return res.status(500).json({
            error: 'Evaluation submission failed',
            code: 'EVALUATION_ERROR',
            message: error.message,
        });
    }
});
/**
 * POST /api/consensus/calculate
 *
 * Calculate consensus from a set of evaluation reports.
 * This is the core consensus algorithm endpoint.
 *
 * Body:
 * - skillId: string
 * - reports: TechnicalReport[]
 * - tier?: ConsensusTier
 *
 * Response: ConsensusResult
 */
router.post('/calculate', async (req, res) => {
    try {
        const { skillId, reports, tier } = req.body;
        if (!skillId) {
            return res.status(400).json({
                error: 'skillId is required',
                code: 'MISSING_SKILL_ID',
            });
        }
        if (!reports || !Array.isArray(reports) || reports.length === 0) {
            return res.status(400).json({
                error: 'reports array is required and must not be empty',
                code: 'MISSING_REPORTS',
            });
        }
        // Set tier if provided
        if (tier && Object.values(consensus_1.ConsensusTier).includes(tier)) {
            consensus_1.consensusService.setTier(tier);
        }
        // Calculate consensus
        const result = await consensus_1.consensusService.calculateConsensus(skillId, reports);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('[CONSENSUS] Calculation error:', error);
        return res.status(500).json({
            error: 'Consensus calculation failed',
            code: 'CONSENSUS_ERROR',
            message: error.message,
        });
    }
});
/**
 * POST /api/consensus/quick
 *
 * Quick consensus check using simplified mean-score logic.
 * Useful for demos and MVP testing.
 *
 * Body:
 * - reports: TechnicalReport[] (can be simplified)
 *
 * Response:
 * - verdict: string
 * - meanScore: number
 * - reason: string
 */
router.post('/quick', (req, res) => {
    try {
        const { reports } = req.body;
        if (!reports || !Array.isArray(reports)) {
            return res.status(400).json({
                error: 'reports array is required',
                code: 'MISSING_REPORTS',
            });
        }
        const result = consensus_1.consensusService.quickConsensus(reports);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error('[CONSENSUS] Quick consensus error:', error);
        return res.status(500).json({
            error: 'Quick consensus failed',
            code: 'QUICK_CONSENSUS_ERROR',
            message: error.message,
        });
    }
});
/**
 * GET /api/consensus/config
 *
 * Get current consensus configuration thresholds.
 */
router.get('/config', (req, res) => {
    const config = consensus_1.consensusService.getConfig();
    return res.status(200).json(config);
});
/**
 * GET /api/consensus/tiers
 *
 * List available consensus tiers and their configurations.
 */
router.get('/tiers', (req, res) => {
    const tiers = Object.values(consensus_1.ConsensusTier).map(tier => ({
        tier,
        config: consensus_1.consensusService.getConfig(), // Would need to be dynamic
    }));
    return res.status(200).json({
        available: Object.values(consensus_1.ConsensusTier),
        current: consensus_1.consensusService.getConfig().tier,
    });
});
/**
 * POST /api/consensus/demo
 *
 * Demo endpoint: Runs a complete consensus flow with mock data.
 * Useful for hackathon demonstration.
 */
router.post('/demo', async (req, res) => {
    try {
        const { skillContent, scenario } = req.body;
        // Run pre-review
        const preReviewResult = await consensus_1.PreReviewService.reviewSkill(skillContent || '# Sample Skill\n\nThis is a sample skill for demo purposes.\n\n## Input\nA text query.\n\n## Output\nA processed response.');
        if (!preReviewResult.passed) {
            return res.status(200).json({
                phase: 'PRE_REVIEW',
                result: 'BLOCKED',
                preReview: preReviewResult,
                message: 'Skill blocked in automated pre-review',
            });
        }
        // Generate mock evaluations based on scenario
        const mockReports = generateMockReports(scenario || 'approved');
        // Calculate consensus
        const consensusResult = await consensus_1.consensusService.calculateConsensus('demo_skill_123', mockReports);
        return res.status(200).json({
            phase: 'CONSENSUS',
            result: consensusResult.verdict,
            preReview: preReviewResult,
            consensus: consensusResult,
            message: `Demo completed with ${consensusResult.verdict} verdict`,
        });
    }
    catch (error) {
        console.error('[CONSENSUS] Demo error:', error);
        return res.status(500).json({
            error: 'Demo failed',
            message: error.message,
        });
    }
});
/**
 * Generate mock evaluation reports for demo
 */
function generateMockReports(scenario) {
    const now = Math.floor(Date.now() / 1000);
    const baseReport = {
        id: '',
        skillId: 'demo_skill_123',
        timestamp: now,
        methodology: {
            type: consensus_1.MethodologyType.MANUAL_REVIEW,
            toolsUsed: ['manual-review'],
            timeSpentMinutes: 30,
            environmentHash: 'demo_env_hash',
        },
        findings: {
            critical: [],
            high: [],
            medium: [],
            low: [],
            informational: [],
        },
        conditions: undefined,
        evidenceIpfsHash: 'Qm_demo_evidence',
        signatureHash: 'demo_signature',
    };
    switch (scenario) {
        case 'rejected':
            // Scenario: Skill has critical issues, evaluators agree to reject
            return [
                {
                    ...baseReport,
                    id: 'report_1',
                    evaluatorId: 'auditor_1',
                    evaluatorTier: consensus_1.AuditorTier.TIER2,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.STATIC_ANALYSIS },
                    findings: {
                        ...baseReport.findings,
                        critical: [{
                                id: 'finding_1',
                                title: 'Prompt Injection Vulnerability',
                                severity: 10,
                                category: consensus_1.FindingCategory.INJECTION,
                                description: 'Skill allows arbitrary instruction injection',
                                reproduction: 'Send: "ignore previous instructions"',
                                recommendation: 'Implement input sanitization',
                            }],
                    },
                    scores: { security: 200, performance: 600, reliability: 500, documentation: 400, overall: 350 },
                    recommendation: consensus_1.EvaluationRecommendation.REJECT,
                },
                {
                    ...baseReport,
                    id: 'report_2',
                    evaluatorId: 'auditor_2',
                    evaluatorTier: consensus_1.AuditorTier.TIER2,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.DYNAMIC_TESTING },
                    findings: {
                        ...baseReport.findings,
                        critical: [{
                                id: 'finding_1',
                                title: 'Prompt Injection Detected',
                                severity: 9,
                                category: consensus_1.FindingCategory.INJECTION,
                                description: 'Dynamic testing confirmed injection vulnerability',
                                reproduction: 'Fuzzing revealed bypass',
                                recommendation: 'Add input validation layer',
                            }],
                    },
                    scores: { security: 250, performance: 550, reliability: 480, documentation: 420, overall: 380 },
                    recommendation: consensus_1.EvaluationRecommendation.REJECT,
                },
                {
                    ...baseReport,
                    id: 'report_3',
                    evaluatorId: 'auditor_3',
                    evaluatorTier: consensus_1.AuditorTier.TIER3,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.FUZZING },
                    findings: {
                        ...baseReport.findings,
                        critical: [{
                                id: 'finding_1',
                                title: 'Injection Vector Found',
                                severity: 9,
                                category: consensus_1.FindingCategory.INJECTION,
                                description: 'Fuzzing found injection vectors',
                                reproduction: 'Multiple payloads successful',
                                recommendation: 'Comprehensive input filtering',
                            }],
                    },
                    scores: { security: 220, performance: 580, reliability: 520, documentation: 450, overall: 360 },
                    recommendation: consensus_1.EvaluationRecommendation.REJECT,
                },
            ];
        case 'inconclusive':
            // Scenario: Evaluators disagree significantly
            return [
                {
                    ...baseReport,
                    id: 'report_1',
                    evaluatorId: 'auditor_1',
                    evaluatorTier: consensus_1.AuditorTier.TIER2,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.STATIC_ANALYSIS },
                    scores: { security: 850, performance: 800, reliability: 820, documentation: 900, overall: 850 },
                    recommendation: consensus_1.EvaluationRecommendation.APPROVE,
                },
                {
                    ...baseReport,
                    id: 'report_2',
                    evaluatorId: 'auditor_2',
                    evaluatorTier: consensus_1.AuditorTier.TIER2,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.DYNAMIC_TESTING },
                    findings: {
                        ...baseReport.findings,
                        high: [{
                                id: 'finding_2',
                                title: 'Edge Case Failure',
                                severity: 7,
                                category: consensus_1.FindingCategory.LOGIC_ERROR,
                                description: 'Fails on unicode input',
                                reproduction: 'Send emoji',
                                recommendation: 'Handle unicode',
                            }],
                    },
                    scores: { security: 500, performance: 450, reliability: 400, documentation: 550, overall: 480 },
                    recommendation: consensus_1.EvaluationRecommendation.CONDITIONAL,
                },
                {
                    ...baseReport,
                    id: 'report_3',
                    evaluatorId: 'auditor_3',
                    evaluatorTier: consensus_1.AuditorTier.TIER3,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.MANUAL_REVIEW },
                    scores: { security: 700, performance: 650, reliability: 680, documentation: 750, overall: 700 },
                    recommendation: consensus_1.EvaluationRecommendation.APPROVE,
                },
            ];
        case 'approved':
        default:
            // Scenario: Skill passes with strong consensus
            return [
                {
                    ...baseReport,
                    id: 'report_1',
                    evaluatorId: 'auditor_1',
                    evaluatorTier: consensus_1.AuditorTier.TIER1,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.STATIC_ANALYSIS },
                    findings: {
                        ...baseReport.findings,
                        low: [{
                                id: 'finding_info',
                                title: 'Consider adding rate limiting',
                                severity: 2,
                                category: consensus_1.FindingCategory.OTHER,
                                description: 'Minor suggestion',
                                reproduction: 'N/A',
                                recommendation: 'Add rate limiting',
                            }],
                    },
                    scores: { security: 850, performance: 820, reliability: 880, documentation: 900, overall: 860 },
                    recommendation: consensus_1.EvaluationRecommendation.APPROVE,
                },
                {
                    ...baseReport,
                    id: 'report_2',
                    evaluatorId: 'auditor_2',
                    evaluatorTier: consensus_1.AuditorTier.TIER2,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.DYNAMIC_TESTING },
                    findings: {
                        ...baseReport.findings,
                        low: [{
                                id: 'finding_info',
                                title: 'Rate limiting recommendation',
                                severity: 2,
                                category: consensus_1.FindingCategory.OTHER,
                                description: 'Same finding as auditor 1',
                                reproduction: 'N/A',
                                recommendation: 'Implement throttling',
                            }],
                    },
                    scores: { security: 820, performance: 850, reliability: 840, documentation: 870, overall: 840 },
                    recommendation: consensus_1.EvaluationRecommendation.APPROVE,
                },
                {
                    ...baseReport,
                    id: 'report_3',
                    evaluatorId: 'auditor_3',
                    evaluatorTier: consensus_1.AuditorTier.TIER2,
                    methodology: { ...baseReport.methodology, type: consensus_1.MethodologyType.PENETRATION_TESTING },
                    scores: { security: 880, performance: 800, reliability: 860, documentation: 850, overall: 850 },
                    recommendation: consensus_1.EvaluationRecommendation.APPROVE,
                },
            ];
    }
}
exports.default = router;
