/**
 * Sigil Protocol - Pre-Review Service
 * 
 * Automated screening of skills before human evaluation.
 * Catches obvious issues early to save evaluator time and
 * prevent malicious skills from entering the queue.
 * 
 * This is the first line of defense in the Sigil trust layer.
 */

import {
  PreReviewResult,
  PreReviewCheck,
} from './types';

// ============================================================
// INJECTION PATTERNS
// ============================================================

/**
 * Known prompt injection patterns (regex)
 * These patterns indicate attempts to manipulate the LLM
 */
const INJECTION_PATTERNS: Array<{ pattern: RegExp; name: string; severity: 'BLOCKER' | 'WARNING' }> = [
  // Direct instruction override
  {
    pattern: /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)/i,
    name: 'instruction_override',
    severity: 'BLOCKER',
  },
  {
    pattern: /disregard\s+(all\s+)?(previous|prior|above)/i,
    name: 'disregard_instruction',
    severity: 'BLOCKER',
  },
  {
    pattern: /forget\s+(everything|all|what)\s+(you|i)\s+(said|told|mentioned)/i,
    name: 'forget_instruction',
    severity: 'BLOCKER',
  },
  
  // Role manipulation
  {
    pattern: /you\s+are\s+(now|actually)\s+(a|an)\s+/i,
    name: 'role_override',
    severity: 'BLOCKER',
  },
  {
    pattern: /pretend\s+(you\s+are|to\s+be)\s+/i,
    name: 'pretend_role',
    severity: 'BLOCKER',
  },
  {
    pattern: /act\s+as\s+(if\s+you\s+are|a|an)\s+/i,
    name: 'act_as_role',
    severity: 'WARNING',
  },
  {
    pattern: /\bDAN\b|\bDo\s+Anything\s+Now\b/i,
    name: 'dan_jailbreak',
    severity: 'BLOCKER',
  },
  
  // System prompt extraction
  {
    pattern: /what\s+(is|are)\s+your\s+(system\s+)?(prompt|instructions?)/i,
    name: 'prompt_extraction',
    severity: 'BLOCKER',
  },
  {
    pattern: /show\s+me\s+(your\s+)?(system\s+)?(prompt|instructions?)/i,
    name: 'show_prompt',
    severity: 'BLOCKER',
  },
  {
    pattern: /repeat\s+(your\s+)?(system\s+)?(prompt|instructions?)/i,
    name: 'repeat_prompt',
    severity: 'BLOCKER',
  },
  
  // Delimiter injection
  {
    pattern: /\[\s*SYSTEM\s*\]/i,
    name: 'system_delimiter',
    severity: 'BLOCKER',
  },
  {
    pattern: /<\s*\|?\s*(system|assistant|user)\s*\|?\s*>/i,
    name: 'xml_delimiter',
    severity: 'BLOCKER',
  },
  {
    pattern: /###\s*(SYSTEM|INSTRUCTION|ADMIN)/i,
    name: 'markdown_delimiter',
    severity: 'BLOCKER',
  },
  
  // Code execution attempts
  {
    pattern: /```(python|javascript|bash|sh|ruby|perl)[\s\S]*?(exec|eval|subprocess|os\.system|child_process)/i,
    name: 'code_execution',
    severity: 'BLOCKER',
  },
  {
    pattern: /\$\(.*\)|\`.*\`/,
    name: 'shell_injection',
    severity: 'WARNING',
  },
  
  // Data exfiltration
  {
    pattern: /send\s+(to|via)\s+(http|https|ftp|email)/i,
    name: 'data_exfiltration',
    severity: 'BLOCKER',
  },
  {
    pattern: /upload\s+(to|this|data)\s+/i,
    name: 'upload_attempt',
    severity: 'WARNING',
  },
  
  // Encoding bypass attempts
  {
    pattern: /base64[.:]?(decode|encode)/i,
    name: 'base64_bypass',
    severity: 'WARNING',
  },
  {
    pattern: /\\x[0-9a-f]{2}/i,
    name: 'hex_encoding',
    severity: 'WARNING',
  },
  {
    pattern: /\\u[0-9a-f]{4}/i,
    name: 'unicode_encoding',
    severity: 'WARNING',
  },
];

// ============================================================
// SKILL.MD STRUCTURE REQUIREMENTS
// ============================================================

interface SkillStructure {
  hasName: boolean;
  hasDescription: boolean;
  hasInputSpec: boolean;
  hasOutputSpec: boolean;
  hasExamples: boolean;
  hasLimitations: boolean;
  hasDependencies: boolean;
  contentLength: number;
}

/**
 * Parse and validate SKILL.md structure
 */
function parseSkillStructure(content: string): SkillStructure {
  const lowerContent = content.toLowerCase();
  
  return {
    hasName: /^#\s+.+/m.test(content) || /name\s*:/i.test(content),
    hasDescription: /description|overview|about/i.test(content),
    hasInputSpec: /input|parameter|argument|request/i.test(content),
    hasOutputSpec: /output|response|return|result/i.test(content),
    hasExamples: /example|usage|demo/i.test(content),
    hasLimitations: /limitation|constraint|caveat|warning|note/i.test(content),
    hasDependencies: /dependenc|require|prerequisite/i.test(content),
    contentLength: content.length,
  };
}

// ============================================================
// PRE-REVIEW SERVICE
// ============================================================

export class PreReviewService {
  /**
   * Run all pre-review checks on a skill
   */
  static async reviewSkill(
    skillContent: string,
    skillMetadata?: {
      ipfsHash?: string;
      priceUsdc?: number;
      declaredDependencies?: string[];
    }
  ): Promise<PreReviewResult> {
    const checks: PreReviewCheck[] = [];
    const blockers: string[] = [];
    const warnings: string[] = [];

    // 1. Check for injection patterns
    const injectionChecks = this.checkInjectionPatterns(skillContent);
    checks.push(...injectionChecks);
    
    for (const check of injectionChecks) {
      if (!check.passed) {
        if (check.severity === 'BLOCKER') {
          blockers.push(check.message);
        } else {
          warnings.push(check.message);
        }
      }
    }

    // 2. Validate structure
    const structureChecks = this.checkStructure(skillContent);
    checks.push(...structureChecks);
    
    for (const check of structureChecks) {
      if (!check.passed) {
        if (check.severity === 'BLOCKER') {
          blockers.push(check.message);
        } else {
          warnings.push(check.message);
        }
      }
    }

    // 3. Check content quality
    const qualityChecks = this.checkQuality(skillContent);
    checks.push(...qualityChecks);
    
    for (const check of qualityChecks) {
      if (!check.passed && check.severity === 'WARNING') {
        warnings.push(check.message);
      }
    }

    // 4. Check resource declarations (if metadata provided)
    if (skillMetadata) {
      const resourceChecks = this.checkResourceDeclarations(skillContent, skillMetadata);
      checks.push(...resourceChecks);
      
      for (const check of resourceChecks) {
        if (!check.passed && check.severity === 'WARNING') {
          warnings.push(check.message);
        }
      }
    }

    // Calculate score
    const passedChecks = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    const score = Math.round((passedChecks / totalChecks) * 100);

    return {
      passed: blockers.length === 0,
      checks,
      blockers,
      warnings,
      score,
    };
  }

  /**
   * Check for known injection patterns
   */
  private static checkInjectionPatterns(content: string): PreReviewCheck[] {
    const checks: PreReviewCheck[] = [];

    for (const { pattern, name, severity } of INJECTION_PATTERNS) {
      const match = pattern.test(content);
      
      checks.push({
        name: `injection_${name}`,
        passed: !match,
        message: match
          ? `Detected potential injection pattern: ${name}`
          : `No ${name} pattern detected`,
        severity: match ? severity : 'INFO',
      });
    }

    // Add summary check
    const injectionCount = checks.filter(c => !c.passed).length;
    checks.push({
      name: 'injection_summary',
      passed: injectionCount === 0,
      message: injectionCount === 0
        ? 'No injection patterns detected'
        : `Found ${injectionCount} potential injection patterns`,
      severity: injectionCount > 0 ? 'BLOCKER' : 'INFO',
    });

    return checks;
  }

  /**
   * Check SKILL.md structure requirements
   */
  private static checkStructure(content: string): PreReviewCheck[] {
    const structure = parseSkillStructure(content);
    const checks: PreReviewCheck[] = [];

    // Required fields
    checks.push({
      name: 'structure_name',
      passed: structure.hasName,
      message: structure.hasName
        ? 'Skill has a name/title'
        : 'Missing skill name or title',
      severity: structure.hasName ? 'INFO' : 'BLOCKER',
    });

    checks.push({
      name: 'structure_description',
      passed: structure.hasDescription,
      message: structure.hasDescription
        ? 'Skill has a description'
        : 'Missing skill description',
      severity: structure.hasDescription ? 'INFO' : 'BLOCKER',
    });

    checks.push({
      name: 'structure_input',
      passed: structure.hasInputSpec,
      message: structure.hasInputSpec
        ? 'Input specification found'
        : 'Missing input specification',
      severity: structure.hasInputSpec ? 'INFO' : 'WARNING',
    });

    checks.push({
      name: 'structure_output',
      passed: structure.hasOutputSpec,
      message: structure.hasOutputSpec
        ? 'Output specification found'
        : 'Missing output specification',
      severity: structure.hasOutputSpec ? 'INFO' : 'WARNING',
    });

    // Recommended fields
    checks.push({
      name: 'structure_examples',
      passed: structure.hasExamples,
      message: structure.hasExamples
        ? 'Examples provided'
        : 'Consider adding usage examples',
      severity: 'INFO',
    });

    checks.push({
      name: 'structure_limitations',
      passed: structure.hasLimitations,
      message: structure.hasLimitations
        ? 'Limitations documented'
        : 'Consider documenting limitations',
      severity: 'INFO',
    });

    // Minimum content length
    const minLength = 200;
    checks.push({
      name: 'structure_length',
      passed: structure.contentLength >= minLength,
      message: structure.contentLength >= minLength
        ? `Content length: ${structure.contentLength} chars`
        : `Content too short (${structure.contentLength} < ${minLength})`,
      severity: structure.contentLength >= minLength ? 'INFO' : 'WARNING',
    });

    return checks;
  }

  /**
   * Check content quality indicators
   */
  private static checkQuality(content: string): PreReviewCheck[] {
    const checks: PreReviewCheck[] = [];

    // Check for code blocks
    const hasCodeBlocks = /```[\s\S]*?```/.test(content);
    checks.push({
      name: 'quality_code_blocks',
      passed: hasCodeBlocks,
      message: hasCodeBlocks
        ? 'Contains code examples'
        : 'No code examples found',
      severity: 'INFO',
    });

    // Check for markdown formatting
    const hasFormatting = /#+\s|[-*]\s|\|.*\|/.test(content);
    checks.push({
      name: 'quality_formatting',
      passed: hasFormatting,
      message: hasFormatting
        ? 'Uses markdown formatting'
        : 'Consider using markdown for clarity',
      severity: 'INFO',
    });

    // Check for suspicious repetition (copy-paste attacks)
    const lines = content.split('\n');
    const uniqueLines = new Set(lines.filter(l => l.trim().length > 10));
    const repetitionRatio = uniqueLines.size / Math.max(lines.length, 1);
    
    checks.push({
      name: 'quality_repetition',
      passed: repetitionRatio > 0.5,
      message: repetitionRatio > 0.5
        ? 'Content has normal variation'
        : 'High content repetition detected',
      severity: repetitionRatio > 0.5 ? 'INFO' : 'WARNING',
    });

    return checks;
  }

  /**
   * Check resource declarations match content
   */
  private static checkResourceDeclarations(
    content: string,
    metadata: { priceUsdc?: number; declaredDependencies?: string[] }
  ): PreReviewCheck[] {
    const checks: PreReviewCheck[] = [];

    // Price sanity check
    if (metadata.priceUsdc !== undefined) {
      const priceReasonable = metadata.priceUsdc >= 0.001 && metadata.priceUsdc <= 100;
      checks.push({
        name: 'resource_price',
        passed: priceReasonable,
        message: priceReasonable
          ? `Price ${metadata.priceUsdc} USDC is within reasonable range`
          : `Price ${metadata.priceUsdc} USDC seems unusual`,
        severity: priceReasonable ? 'INFO' : 'WARNING',
      });
    }

    // Check if declared dependencies are mentioned
    if (metadata.declaredDependencies && metadata.declaredDependencies.length > 0) {
      const mentionedDeps = metadata.declaredDependencies.filter(dep =>
        content.toLowerCase().includes(dep.toLowerCase())
      );
      const allMentioned = mentionedDeps.length === metadata.declaredDependencies.length;
      
      checks.push({
        name: 'resource_dependencies',
        passed: allMentioned,
        message: allMentioned
          ? 'All declared dependencies are mentioned in content'
          : `Some dependencies not mentioned: ${metadata.declaredDependencies.filter(d => !mentionedDeps.includes(d)).join(', ')}`,
        severity: allMentioned ? 'INFO' : 'WARNING',
      });
    }

    return checks;
  }

  /**
   * Quick check for obvious blockers (fast path)
   */
  static quickCheck(content: string): { blocked: boolean; reason?: string } {
    for (const { pattern, name, severity } of INJECTION_PATTERNS) {
      if (severity === 'BLOCKER' && pattern.test(content)) {
        return {
          blocked: true,
          reason: `Blocked by injection pattern: ${name}`,
        };
      }
    }

    if (content.length < 50) {
      return {
        blocked: true,
        reason: 'Content too short (minimum 50 characters)',
      };
    }

    return { blocked: false };
  }
}
