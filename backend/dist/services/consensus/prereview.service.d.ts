/**
 * Sigil Protocol - Pre-Review Service
 *
 * Automated screening of skills before human evaluation.
 * Catches obvious issues early to save evaluator time and
 * prevent malicious skills from entering the queue.
 *
 * This is the first line of defense in the Sigil trust layer.
 */
import { PreReviewResult, PreReviewCheck } from './types';
export { PreReviewResult, PreReviewCheck };
export declare class PreReviewService {
    /**
     * Run all pre-review checks on a skill
     */
    static reviewSkill(skillContent: string, skillMetadata?: {
        ipfsHash?: string;
        priceUsdc?: number;
        declaredDependencies?: string[];
    }): Promise<PreReviewResult>;
    /**
     * Check for known injection patterns
     */
    private static checkInjectionPatterns;
    /**
     * Check SKILL.md structure requirements
     */
    private static checkStructure;
    /**
     * Check content quality indicators
     */
    private static checkQuality;
    /**
     * Check resource declarations match content
     */
    private static checkResourceDeclarations;
    /**
     * Quick check for obvious blockers (fast path)
     */
    static quickCheck(content: string): {
        blocked: boolean;
        reason?: string;
    };
}
