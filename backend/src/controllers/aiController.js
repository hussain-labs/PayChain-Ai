// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — AI Controller
//
// Phase 2 live endpoints:
//   GET  /api/v1/ai/status        → status   (service health + feature flags)
//   POST /api/v1/ai/status-report → statusReport  (Gemini merchant report)
//
// Phase 3 stubs (return 503 with clear message until wired):
//   POST /api/v1/ai/risk/:txId         → transactionRisk
//   POST /api/v1/ai/trust/:walletAddress → trustScore
//   GET  /api/v1/ai/xai/:txId          → xaiReport
// ─────────────────────────────────────────────────────────────────────────────
import { Merchant, Transaction }   from '../models/index.js'
import { AppError }                from '../middleware/errorHandler.js'
import { sendSuccess }             from '../utils/apiResponse.js'
import { normaliseAddress }        from '../utils/walletUtils.js'
import {
  generateStatusReport,
  generateXAIReport,
  computeTrustScore,
  assessTransactionRisk,
  getGeminiStatus,
}                                  from '../services/geminiService.js'
import { getPineconeStatus }       from '../services/pineconeService.js'
import logger                      from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/ai/status
// Returns the current availability of all AI and vector services.
// Used by the Phase 1 "Intelligence Centre" panels to decide overlay state.
// ─────────────────────────────────────────────────────────────────────────────
export async function status(_req, res) {
  const gemini   = getGeminiStatus()
  const pinecone = getPineconeStatus()

  return sendSuccess(res, {
    message: 'AI service status retrieved.',
    data: {
      gemini: {
        isReady:        gemini.isReady,
        model:          gemini.model,
        liveFeatures:   gemini.phase2Live,
        phase3Features: gemini.phase3Todo,
      },
      pinecone: {
        isReady:   pinecone.isReady,
        indexName: pinecone.indexName,
        dimension: pinecone.dimension,
      },
      currentPhase: 'Phase 2',
      roadmap: {
        phase2: 'Status reports + Welcome messages ✓',
        phase3: 'Transaction risk scoring + Dispute arbitration + Trust scores',
        phase4: 'Full vector-search fraud detection + XAI reports',
      },
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/ai/status-report
// Generates a personalised natural-language merchant status report via Gemini.
//
// Body: { walletAddress: "0x…" }
//   OR   send x-wallet-address header (set by optionalWallet middleware)
// ─────────────────────────────────────────────────────────────────────────────
export async function statusReport(req, res) {
  if (!getGeminiStatus().isReady) {
    throw new AppError(
      'Gemini AI is not available. Set GEMINI_API_KEY in your .env file.',
      503,
      'AI_UNAVAILABLE'
    )
  }

  // Wallet can come from the auth middleware or the request body/query
  const rawWallet = req.walletAddress
    || req.body?.walletAddress
    || req.query?.walletAddress

  // ── Build merchant profile for the prompt ─────────────────────────────────
  let merchantProfile

  if (rawWallet) {
    const normWallet = normaliseAddress(rawWallet)
    const merchant   = await Merchant.findByWallet(normWallet)

    if (merchant) {
      merchantProfile = {
        businessName:  merchant.businessName,
        walletAddress: normWallet,
        plan:          merchant.plan,
        metrics:       merchant.metrics?.toObject?.() ?? merchant.metrics ?? {},
        trustScore:    merchant.intelligence?.trustScore ?? null,
        joinedDate:    merchant.createdAt?.toISOString().split('T')[0] ?? null,
      }
    }
  }

  // ── Fallback: anonymous profile ───────────────────────────────────────────
  if (!merchantProfile) {
    merchantProfile = {
      businessName:  req.body?.businessName || 'PayChain Merchant',
      walletAddress: rawWallet ?? '0x0000000000000000000000000000000000000000',
      plan:          req.body?.plan ?? 'Free',
      metrics:       {},
      trustScore:    null,
      joinedDate:    null,
    }
    logger.warn('[AI] statusReport called without a registered merchant wallet — using anonymous profile')
  }

  logger.info(`[AI] Generating status report  merchant="${merchantProfile.businessName}"  requestId="${req.id}"`)

  const result = await generateStatusReport(merchantProfile)

  return sendSuccess(res, {
    message: 'AI status report generated.',
    data: {
      report:        result.report,
      merchant:      merchantProfile.businessName,
      walletAddress: merchantProfile.walletAddress,
      model:         result.model,
      generatedAt:   result.generatedAt,
      usageMetadata: result.usageMetadata,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/ai/risk/:txId
// Phase 3 stub — returns 503 until Gemini risk assessment is implemented.
// ─────────────────────────────────────────────────────────────────────────────
export async function transactionRisk(req, res) {
  const tx = await Transaction.findOne({ txId: req.params.txId }).lean()
  if (!tx) {
    throw new AppError(`Transaction "${req.params.txId}" not found`, 404, 'TX_NOT_FOUND')
  }

  if (!getGeminiStatus().isReady) {
    throw new AppError('Gemini AI is unavailable.', 503, 'AI_UNAVAILABLE')
  }

  const assessment = await assessTransactionRisk(tx)

  if (assessment.stub) {
    return sendSuccess(res, {
      message: 'Transaction risk assessment is a Phase 3 feature.',
      data: {
        txId:        req.params.txId,
        phase3Ready: false,
        riskScore:   null,
        riskLevel:   null,
      },
    })
  }

  return sendSuccess(res, {
    message: 'Risk assessment complete.',
    data: {
      txId:          req.params.txId,
      phase3Ready:   true,
      ...assessment,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/ai/trust/:walletAddress
// Phase 3 stub — returns 503 until computeTrustScore() is implemented.
// ─────────────────────────────────────────────────────────────────────────────
export async function trustScore(req, res) {
  const normWallet = normaliseAddress(req.params.walletAddress)

  const merchant = await Merchant.findByWallet(normWallet)
  if (!merchant) {
    throw new AppError(`Merchant not found for wallet "${normWallet}"`, 404, 'MERCHANT_NOT_FOUND')
  }

  if (!getGeminiStatus().isReady) {
    throw new AppError('Gemini AI is unavailable.', 503, 'AI_UNAVAILABLE')
  }

  const result = await computeTrustScore(merchant.toObject(), [], [])

  if (result.stub) {
    return sendSuccess(res, {
      message: 'AI trust scoring is a Phase 3 feature.',
      data: {
        merchantId:  merchant.merchantId,
        trustScore:  null,
        phase3Ready: false,
      },
    })
  }

  // Save the score back to the merchant document
  await Merchant.findByIdAndUpdate(merchant._id, {
    $set: {
      'intelligence.trustScore':          result.score,
      'intelligence.trustScoreLabel':     result.label,
      'intelligence.trustScoreUpdatedAt': new Date(),
    },
  })

  return sendSuccess(res, {
    message: 'Trust score computed.',
    data: {
      merchantId:  merchant.merchantId,
      trustScore:  result.score,
      label:       result.label,
      reasoning:   result.reasoning,
      phase3Ready: true,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/ai/xai/:txId
// Phase 3 stub — Explainable AI report for a transaction.
// ─────────────────────────────────────────────────────────────────────────────
export async function xaiReport(req, res) {
  const tx = await Transaction.findOne({ txId: req.params.txId }).lean()
  if (!tx) {
    throw new AppError(`Transaction "${req.params.txId}" not found`, 404, 'TX_NOT_FOUND')
  }

  if (!getGeminiStatus().isReady) {
    throw new AppError('Gemini AI is unavailable.', 503, 'AI_UNAVAILABLE')
  }

  const report = await generateXAIReport(tx, tx.riskAssessment ?? {})

  if (report.stub) {
    return sendSuccess(res, {
      message: 'XAI reports are a Phase 3 feature.',
      data: {
        txId:        req.params.txId,
        report:      null,
        phase3Ready: false,
      },
    })
  }

  return sendSuccess(res, {
    message: 'XAI report generated.',
    data: {
      txId:        req.params.txId,
      report:      report.report,
      factors:     report.factors,
      phase3Ready: true,
    },
  })
}
