import express from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { RegistryService } from '../services/registry.service';
import { paymentService } from '../services/payment.service';

const router = express.Router();
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

/**
 * POST /api/skills/:id/execute
 * 
 * Execute a skill with x402 payment flow:
 * 1. If no payment signature: Return 402 with payment requirements
 * 2. If payment signature: Verify on-chain, execute, return result
 * 
 * Headers:
 * - payment-signature: Base64 encoded payment proof { signature, sender }
 * 
 * Response 402:
 * - PAYMENT-REQUIRED header with Base64 encoded requirements
 * 
 * Response 200:
 * - Execution result with payment split details
 */
router.post('/:id/execute', async (req, res) => {
  const { id } = req.params;
  const paymentSignatureHeader = req.headers['payment-signature'] as string;

  try {
    // 1. Fetch skill from registry
    const skill = await RegistryService.getSkillById(id);
    if (!skill) {
      return res.status(404).json({ 
        error: 'Skill not found',
        code: 'SKILL_NOT_FOUND',
        skillId: id,
      });
    }

    // 2. If no payment signature, return 402 Payment Required
    if (!paymentSignatureHeader) {
      const paymentRequirement = paymentService.buildPaymentRequirement(
        skill.priceUsdc,
        skill.creator,
        `Execute Sigil skill: ${skill.id}`
      );

      // Get split breakdown for transparency
      const split = paymentService.calculateSplit(skill.priceUsdc, skill.auditors.length);
      const recipients = paymentService.getSplitRecipients(
        skill.priceUsdc,
        skill.creator,
        skill.auditors.map((a: any) => a.auditor)
      );

      return res.status(402)
        .header('PAYMENT-REQUIRED', paymentRequirement)
        .header('X-SIGIL-SPLIT', JSON.stringify(split))
        .json({
          error: 'Payment required to execute this skill',
          code: 'PAYMENT_REQUIRED',
          skill: {
            id: skill.id,
            name: skill.ipfsHash,
            priceUsdc: skill.priceUsdc,
            trustScore: skill.trustScore,
          },
          payment: {
            network: 'solana:101',
            asset: 'usdc',
            amount: skill.priceUsdc,
            recipient: skill.creator,
            split: split,
            recipients: recipients,
          },
        });
    }

    // 3. Parse and verify payment signature
    const paymentProof = paymentService.parsePaymentSignature(paymentSignatureHeader);
    if (!paymentProof) {
      return res.status(400).json({
        error: 'Invalid payment signature format',
        code: 'INVALID_PAYMENT_SIGNATURE',
      });
    }

    // 4. Verify payment on-chain
    const verification = await paymentService.verifyPayment(
      paymentProof.signature,
      skill.creator,
      skill.priceUsdc,
      5 // 5% tolerance for rounding
    );

    if (!verification.valid) {
      return res.status(403).json({
        error: 'Payment verification failed',
        code: 'PAYMENT_VERIFICATION_FAILED',
        details: verification.error,
        signature: paymentProof.signature,
      });
    }

    // 5. Execute the skill (simulated for hackathon demo)
    console.log(`[SIGIL] Executing skill ${id}...`);
    const startTime = Date.now();
    
    // Simulate skill execution
    // In production, this would call the actual skill via IPFS hash
    const executionResult = {
      success: true,
      output: `Skill ${id} executed successfully`,
      data: {
        skillId: skill.skillId,
        ipfsHash: skill.ipfsHash,
        timestamp: new Date().toISOString(),
      },
    };
    
    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 100);

    // 6. Calculate payment split
    const split = paymentService.calculateSplit(skill.priceUsdc, skill.auditors.length);
    const recipients = paymentService.getSplitRecipients(
      skill.priceUsdc,
      skill.creator,
      skill.auditors.map((a: any) => a.auditor)
    );

    // 7. Log execution (would be on-chain in production)
    console.log(`[SIGIL] Execution complete:`, {
      skillId: id,
      latencyMs,
      paymentAmount: skill.priceUsdc,
      split: recipients,
    });

    // TODO: Call logExecution on-chain via SDK
    // This requires a server-side signing wallet

    // 8. Return success response
    return res.status(200).json({
      success: true,
      execution: {
        skillId: skill.id,
        executor: paymentProof.sender,
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      result: executionResult,
      payment: {
        verified: true,
        signature: paymentProof.signature,
        amount: verification.amount,
        split: split,
        recipients: recipients,
      },
    });

  } catch (error: any) {
    console.error('[SIGIL] Execution error:', error);
    return res.status(500).json({
      error: 'Internal server error during execution',
      code: 'EXECUTION_ERROR',
      message: error.message,
    });
  }
});

/**
 * GET /api/skills/:id/price
 * 
 * Get skill price and payment split breakdown
 */
router.get('/:id/price', async (req, res) => {
  const { id } = req.params;

  try {
    const skill = await RegistryService.getSkillById(id);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    const split = paymentService.calculateSplit(skill.priceUsdc, skill.auditors.length);
    const recipients = paymentService.getSplitRecipients(
      skill.priceUsdc,
      skill.creator,
      skill.auditors.map((a: any) => a.auditor)
    );

    return res.json({
      skillId: skill.id,
      priceUsdc: skill.priceUsdc,
      split,
      recipients,
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
