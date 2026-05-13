// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Dispute Controller
//
// Phase 2 live endpoints:
//   POST  /api/v1/disputes              → create
//   GET   /api/v1/disputes              → list  (merchant-scoped)
//   GET   /api/v1/disputes/:disputeId   → getOne
//   PATCH /api/v1/disputes/:disputeId/status  → updateStatus
//   POST  /api/v1/disputes/:disputeId/evidence → addEvidence
//
// Phase 3 hook (gated by isReady):
//   POST  /api/v1/disputes/:disputeId/ai-verdict → requestAiVerdict
// ─────────────────────────────────────────────────────────────────────────────
import { Dispute, Transaction }    from '../models/index.js'
import { AppError }                from '../middleware/errorHandler.js'
import { sendSuccess, sendCreated, paginationMeta }
                                   from '../utils/apiResponse.js'
import { normaliseAddress }        from '../utils/walletUtils.js'
import { assessDisputeArbitration, getGeminiStatus }
                                   from '../services/geminiService.js'
import { upsertDisputeEmbedding, getPineconeStatus }
                                   from '../services/pineconeService.js'
import logger                      from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/disputes
// Open a new dispute against a transaction.
// ─────────────────────────────────────────────────────────────────────────────
export async function create(req, res) {
  const {
    transactionId,
    reason,
    buyerWallet,
    evidence = null,
  } = req.body

  const normBuyer = normaliseAddress(buyerWallet)

  // ── Verify the transaction exists ─────────────────────────────────────────
  const tx = await Transaction.findById(transactionId)
  if (!tx) {
    throw new AppError(`Transaction "${transactionId}" not found`, 404, 'TX_NOT_FOUND')
  }

  // ── Guard against duplicate disputes on the same transaction ──────────────
  const existing = await Dispute.findOne({
    transaction: transactionId,
    status: { $nin: ['Resolved', 'Rejected', 'Closed'] },
  })
  if (existing) {
    throw new AppError(
      `An active dispute already exists for this transaction: ${existing.disputeId}`,
      409,
      'DUPLICATE_DISPUTE'
    )
  }

  // ── Create dispute ────────────────────────────────────────────────────────
  const dispute = await Dispute.create({
    transaction:    transactionId,
    txId:           tx.txId,
    merchantWallet: tx.merchantWallet,
    buyerWallet:    normBuyer,
    reason,
    amount:         tx.amount,
    currency:       tx.currency,
    evidence: evidence ? [{
      submittedBy:  'buyer',
      description:  evidence,
      submittedAt:  new Date(),
    }] : [],
  })

  // ── Mark the transaction as Disputed ──────────────────────────────────────
  tx.status = 'Disputed'
  await tx.save()

  logger.info(`[Dispute] Created  disputeId="${dispute.disputeId}"  txId="${tx.txId}"`)

  // ── Phase 3: Pinecone embedding (async, non-blocking) ────────────────────
  if (getPineconeStatus().isReady) {
    upsertDisputeEmbedding({
      disputeId:     dispute.disputeId,
      reason,
      merchantWallet: tx.merchantWallet,
      buyerWallet:   normBuyer,
      amount:        tx.amount,
    }).catch(err => logger.warn(`[Dispute] Pinecone upsert failed: ${err.message}`))
  }

  return sendCreated(res, {
    message: 'Dispute opened.',
    data:    dispute.toDashboardCard(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/disputes
// Paginated list scoped to a merchant wallet.
// ─────────────────────────────────────────────────────────────────────────────
export async function list(req, res) {
  const page   = parseInt(req.query.page  ?? '1',  10)
  const limit  = parseInt(req.query.limit ?? '10', 10)
  const status = req.query.status

  const rawWallet = req.walletAddress || req.query.walletAddress
  if (!rawWallet) {
    throw new AppError(
      'Provide "x-wallet-address" header or "walletAddress" query param.',
      400,
      'MISSING_WALLET_FILTER'
    )
  }
  const normWallet = normaliseAddress(rawWallet)

  const filter = { merchantWallet: normWallet }
  if (status) filter.status = status

  const [disputes, total] = await Promise.all([
    Dispute.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Dispute.countDocuments(filter),
  ])

  return sendSuccess(res, {
    message: `${total} dispute(s) found.`,
    data:    disputes.map(d => _toLeanCard(d)),
    meta:    paginationMeta({ page, limit, total }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/disputes/:disputeId
// Single dispute with full AI arbitration detail.
// ─────────────────────────────────────────────────────────────────────────────
export async function getOne(req, res) {
  const dispute = await Dispute.findOne({ disputeId: req.params.disputeId })
    .populate('transaction', 'txId txHash amount currency status')
    .lean()

  if (!dispute) {
    throw new AppError(
      `Dispute "${req.params.disputeId}" not found`,
      404,
      'DISPUTE_NOT_FOUND'
    )
  }

  return sendSuccess(res, {
    message: 'Dispute retrieved.',
    data: {
      ..._toLeanCard(dispute),
      evidence:      dispute.evidence      ?? [],
      statusHistory: dispute.statusHistory ?? [],
      aiArbitration: dispute.aiArbitration ?? null,
      transaction:   dispute.transaction   ?? null,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/disputes/:disputeId/status
// Manually advance dispute status (merchant response / human arbiter).
// ─────────────────────────────────────────────────────────────────────────────
export async function updateStatus(req, res) {
  const { status, resolution = null, note = null } = req.body

  const VALID = ['Under Review', 'Resolved', 'Rejected', 'Escalated', 'Closed']
  if (!VALID.includes(status)) {
    throw new AppError(
      `Invalid status "${status}". Valid: ${VALID.join(', ')}`,
      400,
      'INVALID_DISPUTE_STATUS'
    )
  }

  const dispute = await Dispute.findOne({ disputeId: req.params.disputeId })
  if (!dispute) {
    throw new AppError(
      `Dispute "${req.params.disputeId}" not found`,
      404,
      'DISPUTE_NOT_FOUND'
    )
  }

  const prevStatus = dispute.status
  dispute.status = status
  if (resolution) dispute.resolution = resolution
  if (status === 'Resolved' || status === 'Rejected' || status === 'Closed') {
    dispute.resolvedAt = new Date()
  }
  await dispute.save()

  logger.info(`[Dispute] Status updated  disputeId="${dispute.disputeId}"  ${prevStatus} → ${status}`)

  return sendSuccess(res, {
    message: `Dispute status updated to "${status}".`,
    data:    dispute.toDashboardCard(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/disputes/:disputeId/evidence
// Add evidence submission from buyer or merchant.
// ─────────────────────────────────────────────────────────────────────────────
export async function addEvidence(req, res) {
  const { submittedBy, description, attachments = [] } = req.body

  if (!['buyer', 'merchant'].includes(submittedBy)) {
    throw new AppError('submittedBy must be "buyer" or "merchant"', 400, 'INVALID_SUBMITTER')
  }
  if (!description?.trim()) {
    throw new AppError('description is required', 400, 'MISSING_EVIDENCE_DESCRIPTION')
  }

  const dispute = await Dispute.findOne({ disputeId: req.params.disputeId })
  if (!dispute) {
    throw new AppError(`Dispute "${req.params.disputeId}" not found`, 404, 'DISPUTE_NOT_FOUND')
  }

  if (['Resolved', 'Rejected', 'Closed'].includes(dispute.status)) {
    throw new AppError(
      `Cannot add evidence to a ${dispute.status} dispute`,
      400,
      'DISPUTE_CLOSED'
    )
  }

  dispute.evidence.push({ submittedBy, description, attachments, submittedAt: new Date() })
  if (dispute.status === 'Open') dispute.status = 'Under Review'
  await dispute.save()

  logger.info(`[Dispute] Evidence added  disputeId="${dispute.disputeId}"  by="${submittedBy}"`)

  return sendSuccess(res, {
    message: 'Evidence submitted.',
    data:    { disputeId: dispute.disputeId, evidenceCount: dispute.evidence.length },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/disputes/:disputeId/ai-verdict
// Request a Gemini AI arbitration verdict.
// Phase 3 TODO: uncomment when geminiService.assessDisputeArbitration() is live.
// ─────────────────────────────────────────────────────────────────────────────
export async function requestAiVerdict(req, res) {
  if (!getGeminiStatus().isReady) {
    throw new AppError(
      'AI arbitration is not available. Check GEMINI_API_KEY.',
      503,
      'AI_UNAVAILABLE'
    )
  }

  const dispute = await Dispute.findOne({ disputeId: req.params.disputeId })
    .populate('transaction')
  if (!dispute) {
    throw new AppError(`Dispute "${req.params.disputeId}" not found`, 404, 'DISPUTE_NOT_FOUND')
  }

  // Mark as awaiting AI
  dispute.status = 'Awaiting AI'
  await dispute.save()

  // Phase 3 TODO: real assessment
  const verdict = await assessDisputeArbitration(
    dispute.toObject(),
    dispute.transaction?.toObject() ?? {},
    []  // Phase 3: pass Pinecone similar disputes here
  )

  if (!verdict.stub) {
    // Save AI results back to the dispute
    dispute.aiArbitration = {
      riskLevel:          verdict.riskLevel,
      confidence:         verdict.confidence,
      recommendedVerdict: verdict.recommendedVerdict,
      summary:            verdict.summary,
      keyFactors:         verdict.keyFactors,
      assessedAt:         new Date(),
    }
    dispute.status = 'AI Assessed'
    await dispute.save()
    logger.info(`[Dispute] AI verdict  disputeId="${dispute.disputeId}"  verdict="${verdict.recommendedVerdict}"`)
  }

  return sendSuccess(res, {
    message: verdict.stub
      ? 'AI arbitration is a Phase 3 feature — verdict is pending.'
      : 'AI verdict generated.',
    data: {
      disputeId:    dispute.disputeId,
      aiVerdict:    verdict.stub ? null : verdict,
      phase3Ready:  !verdict.stub,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function _toLeanCard(d) {
  const daysLeft = Math.max(0,
    Math.round((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
  )
  return {
    id:          d.disputeId,
    txId:        d.txId,
    amount:      d.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '—',
    currency:    d.currency,
    buyer:       `${d.buyerWallet.slice(0, 6)}…${d.buyerWallet.slice(-4)}`,
    reason:      d.reason,
    status:      d.status,
    openedDate:  new Date(d.createdAt).toISOString().split('T')[0],
    dueDate:     new Date(d.dueDate).toISOString().split('T')[0],
    daysLeft,
    aiRisk:      d.aiArbitration?.riskLevel ?? null,
    resolution:  d.resolution ?? null,
  }
}
