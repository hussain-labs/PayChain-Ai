// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Transaction Controller
//
// Phase 2 live endpoints:
//   POST  /api/v1/transactions              → create
//   GET   /api/v1/transactions              → list   (merchant-scoped via header)
//   GET   /api/v1/transactions/:txId        → getOne
//   PATCH /api/v1/transactions/:txId/status → updateStatus
//
// Phase 3 hooks already wired (gated by isReady):
//   • assessTransactionRisk after create
//   • upsertTransactionEmbedding after create
// ─────────────────────────────────────────────────────────────────────────────
import { Transaction, Merchant }   from '../models/index.js'
import { AppError }                from '../middleware/errorHandler.js'
import { sendSuccess, sendCreated, paginationMeta }
                                   from '../utils/apiResponse.js'
import { normaliseAddress }        from '../utils/walletUtils.js'
import { assessTransactionRisk, getGeminiStatus }
                                   from '../services/geminiService.js'
import { upsertTransactionEmbedding, getPineconeStatus }
                                   from '../services/pineconeService.js'
import logger                      from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/transactions
// Record a new payment transaction and kick off async AI assessment.
// ─────────────────────────────────────────────────────────────────────────────
export async function create(req, res) {
  const {
    merchantWallet,
    fromWallet,
    amount,
    currency   = 'USDC',
    txHash     = null,
    status     = 'Pending',
    isEscrow   = false,
    chainId    = 11155111,
    blockNumber = null,
    note       = null,
  } = req.body

  const normMerchant = normaliseAddress(merchantWallet)
  const normFrom     = normaliseAddress(fromWallet)

  // ── Duplicate txHash guard ────────────────────────────────────────────────
  if (txHash) {
    const duplicate = await Transaction.findOne({ txHash })
    if (duplicate) {
      throw new AppError(
        `Transaction hash already recorded: ${txHash}`,
        409,
        'DUPLICATE_TX_HASH'
      )
    }
  }

  // ── Save transaction ──────────────────────────────────────────────────────
  const tx = await Transaction.create({
    merchantWallet: normMerchant,
    fromWallet:     normFrom,
    amount:         parseFloat(amount),
    currency,
    txHash,
    status,
    isEscrow,
    chainId,
    blockNumber,
    note,
    ipAddress: req.ip,
  })

  logger.info(`[Transaction] Created  txId="${tx.txId}"  amount=${amount} ${currency}  status="${status}"`)

  // ── Denormalise metrics on the Merchant document ──────────────────────────
  _updateMerchantMetrics(normMerchant, tx).catch(err =>
    logger.warn(`[Transaction] Merchant metrics update failed: ${err.message}`)
  )

  // ── Phase 3: AI risk assessment (async, non-blocking) ────────────────────
  if (getGeminiStatus().isReady) {
    _runRiskAssessment(tx).catch(err =>
      logger.warn(`[Transaction] Risk assessment failed: ${err.message}`)
    )
  }

  // ── Phase 3: Pinecone embedding (async, non-blocking) ────────────────────
  if (getPineconeStatus().isReady) {
    upsertTransactionEmbedding({
      txId:          tx.txId,
      merchantWallet: normMerchant,
      fromWallet:    normFrom,
      amount:        tx.amount,
      currency:      tx.currency,
      status:        tx.status,
      isEscrow:      tx.isEscrow,
    }).catch(err =>
      logger.warn(`[Transaction] Pinecone upsert failed: ${err.message}`)
    )
  }

  return sendCreated(res, {
    message: 'Transaction recorded.',
    data:    tx.toDashboardRow(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/transactions
// Paginated list, optionally scoped to a merchant wallet (via header or query).
// ─────────────────────────────────────────────────────────────────────────────
export async function list(req, res) {
  const page   = parseInt(req.query.page   ?? '1',  10)
  const limit  = parseInt(req.query.limit  ?? '10', 10)
  const status = req.query.status ?? 'all'

  // Wallet can come from the auth header (set by optionalWallet middleware)
  // or explicitly from the query string for admin use
  const rawWallet = req.walletAddress || req.query.walletAddress
  if (!rawWallet) {
    throw new AppError(
      'Provide "x-wallet-address" header or "walletAddress" query param.',
      400,
      'MISSING_WALLET_FILTER'
    )
  }

  const normWallet = normaliseAddress(rawWallet)
  const filter     = { merchantWallet: normWallet }
  if (status && status !== 'all') filter.status = status

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ])

  return sendSuccess(res, {
    message: `${total} transaction(s) found.`,
    data:    transactions.map(tx => _toLeanRow(tx)),
    meta:    paginationMeta({ page, limit, total }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/transactions/:txId
// Single transaction detail with full AI risk assessment.
// ─────────────────────────────────────────────────────────────────────────────
export async function getOne(req, res) {
  const tx = await Transaction.findOne({ txId: req.params.txId }).lean()
  if (!tx) {
    throw new AppError(
      `Transaction "${req.params.txId}" not found`,
      404,
      'TX_NOT_FOUND'
    )
  }

  return sendSuccess(res, {
    message: 'Transaction retrieved.',
    data: {
      ..._toLeanRow(tx),
      // Include full AI assessment for the "View Intelligence" button
      riskAssessment: tx.riskAssessment ?? null,
      escrow:         tx.escrow ?? null,
      statusHistory:  tx.statusHistory ?? [],
      chainId:        tx.chainId,
      blockNumber:    tx.blockNumber,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/transactions/:txId/status
// Update transaction status (e.g. blockchain confirmation webhook).
// ─────────────────────────────────────────────────────────────────────────────
export async function updateStatus(req, res) {
  const { status, note = null } = req.body

  const VALID_STATUSES = ['Pending', 'Success', 'Failed', 'Escrowed', 'Disputed', 'Refunded']
  if (!VALID_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status "${status}". Valid: ${VALID_STATUSES.join(', ')}`,
      400,
      'INVALID_STATUS'
    )
  }

  const tx = await Transaction.findOne({ txId: req.params.txId })
  if (!tx) {
    throw new AppError(`Transaction "${req.params.txId}" not found`, 404, 'TX_NOT_FOUND')
  }

  const prevStatus = tx.status
  tx.status = status
  if (note) {
    tx.statusHistory[tx.statusHistory.length - 1].note = note
  }
  if (status === 'Success') tx.processedAt = new Date()
  await tx.save()

  logger.info(`[Transaction] Status updated  txId="${tx.txId}"  ${prevStatus} → ${status}`)

  // Re-sync merchant metrics if status changed meaningfully
  _updateMerchantMetrics(tx.merchantWallet, tx).catch(() => {})

  return sendSuccess(res, {
    message: `Transaction status updated to "${status}".`,
    data:    tx.toDashboardRow(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a lean Mongoose TX document to the Phase 1-compatible row shape */
function _toLeanRow(tx) {
  const d = new Date(tx.createdAt)
  return {
    id:        tx.txId,
    txHash:    tx.txHash ?? '—',
    date:      d.toISOString().split('T')[0],
    time:      d.toTimeString().split(' ')[0],
    from:      `${tx.fromWallet.slice(0, 6)}…${tx.fromWallet.slice(-4)}`,
    amount:    tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    currency:  tx.currency,
    status:    tx.status,
    escrow:    tx.isEscrow,
    riskScore: tx.riskAssessment?.score ?? null,
  }
}

/** Recalculate and persist a merchant's denormalised metrics after a TX change */
async function _updateMerchantMetrics(walletAddress, latestTx) {
  const [revenueAgg, escrowCount, disputeCount] = await Promise.all([
    Transaction.aggregate([
      { $match: { merchantWallet: walletAddress, status: { $in: ['Success', 'Escrowed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Transaction.countDocuments({ merchantWallet: walletAddress, isEscrow: true, status: 'Escrowed' }),
    Transaction.countDocuments({ merchantWallet: walletAddress, status: 'Disputed' }),
  ])

  const totalRevenue      = revenueAgg[0]?.total       ?? 0
  const totalTransactions = revenueAgg[0]?.count       ?? 0

  await Merchant.findOneAndUpdate(
    { 'blockchain.walletAddress': walletAddress },
    {
      $set: {
        'metrics.totalRevenue':      totalRevenue,
        'metrics.totalTransactions': totalTransactions,
        'metrics.activeEscrows':     escrowCount,
        'metrics.disputeCount':      disputeCount,
        'metrics.lastActivityAt':    new Date(),
      },
    }
  )
}

/** Phase 3: run Gemini risk assessment and save results back to the TX */
async function _runRiskAssessment(tx) {
  const assessment = await assessTransactionRisk(tx.toObject())
  if (assessment.stub) return  // Phase 2 — skip

  await Transaction.findByIdAndUpdate(tx._id, {
    $set: {
      'riskAssessment.score':      assessment.riskScore,
      'riskAssessment.level':      assessment.riskLevel,
      'riskAssessment.fraudFlags': assessment.fraudFlags,
      'riskAssessment.explanation': assessment.explanation,
      'riskAssessment.assessedAt': new Date(),
    },
  })

  logger.info(`[Transaction] Risk assessed  txId="${tx.txId}"  score=${assessment.riskScore}  level="${assessment.riskLevel}"`)
}
