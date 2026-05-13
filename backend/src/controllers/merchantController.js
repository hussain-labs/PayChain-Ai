// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Merchant Controller
//
// Handles all merchant lifecycle operations.
// Every handler is wrapped in asyncHandler — no try/catch needed here.
//
// Phase 2 live endpoints:
//   POST /api/v1/merchants/onboard          → onboard
//   GET  /api/v1/merchants/:walletAddress   → getByWallet
//   GET  /api/v1/merchants                  → list  (admin)
//   PATCH /api/v1/merchants/:walletAddress  → update
//   DELETE /api/v1/merchants/:walletAddress → softDelete
//
// Phase 3 hooks already wired but gated behind isReady checks:
//   • generateWelcomeMessage after onboard
//   • upsertMerchantEmbedding after profile update
// ─────────────────────────────────────────────────────────────────────────────
import { Merchant }              from '../models/index.js'
import { AppError }              from '../middleware/errorHandler.js'
import { sendSuccess, sendCreated, sendError, paginationMeta }
                                 from '../utils/apiResponse.js'
import { normaliseAddress }      from '../utils/walletUtils.js'
import { generateWelcomeMessage, getGeminiStatus }
                                 from '../services/geminiService.js'
import { upsertMerchantEmbedding, getPineconeStatus }
                                 from '../services/pineconeService.js'
import logger                    from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/merchants/onboard
// Register a new merchant wallet. Idempotent — returns existing record if
// the wallet is already onboarded (200) vs new record (201).
// ─────────────────────────────────────────────────────────────────────────────
export async function onboard(req, res) {
  const {
    businessName,
    walletAddress,
    did    = null,
    email  = null,
    plan   = 'Free',
    chainId = 11155111,
  } = req.body

  const normWallet = normaliseAddress(walletAddress)

  // ── Idempotency check ──────────────────────────────────────────────────────
  const existing = await Merchant.findByWallet(normWallet)
  if (existing) {
    logger.info(`[Merchant] Wallet already onboarded  wallet="${normWallet}"`)
    return sendSuccess(res, {
      status:  200,
      message: 'Wallet already onboarded — returning existing profile.',
      data:    existing.toDashboardProfile(),
    })
  }

  // ── Create ─────────────────────────────────────────────────────────────────
  const merchant = await Merchant.create({
    businessName,
    email,
    plan,
    blockchain: {
      walletAddress: normWallet,
      did,
      chainId,
    },
  })

  logger.info(`[Merchant] Onboarded  merchantId="${merchant.merchantId}"  wallet="${normWallet}"`)

  // ── Gemini welcome message (non-blocking — failure doesn't break onboard) ──
  let welcomeMessage = null
  if (getGeminiStatus().isReady) {
    try {
      const result = await generateWelcomeMessage({
        businessName: merchant.businessName,
        plan:         merchant.plan,
        walletAddress: normWallet,
      })
      welcomeMessage = result.message
    } catch (geminiErr) {
      logger.warn(`[Merchant] Welcome message skipped: ${geminiErr.message}`)
    }
  }

  // ── Pinecone embedding stub (Phase 4 — non-blocking) ─────────────────────
  if (getPineconeStatus().isReady) {
    upsertMerchantEmbedding({
      merchantId:   merchant.merchantId,
      walletAddress: normWallet,
      metrics:      merchant.metrics,
    }).catch(err => logger.warn(`[Merchant] Pinecone upsert skipped: ${err.message}`))
  }

  return sendCreated(res, {
    message: 'Merchant onboarded successfully.',
    data: {
      ...merchant.toDashboardProfile(),
      welcomeMessage,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/merchants/:walletAddress
// Fetch a single merchant's full dashboard profile.
// ─────────────────────────────────────────────────────────────────────────────
export async function getByWallet(req, res) {
  const normWallet = normaliseAddress(req.params.walletAddress)

  const merchant = await Merchant.findByWallet(normWallet)
  if (!merchant) {
    throw new AppError(
      `No merchant found for wallet "${normWallet}"`,
      404,
      'MERCHANT_NOT_FOUND'
    )
  }

  return sendSuccess(res, {
    message: 'Merchant profile retrieved.',
    data:    merchant.toDashboardProfile(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/merchants
// Paginated list of all merchants (admin / internal use).
// ─────────────────────────────────────────────────────────────────────────────
export async function list(req, res) {
  const page   = parseInt(req.query.page  ?? '1',  10)
  const limit  = parseInt(req.query.limit ?? '20', 10)
  const search = req.query.search?.trim() ?? ''

  const filter = { deletedAt: null }
  if (search) {
    filter.$text = { $search: search }
  }

  const [merchants, total] = await Promise.all([
    Merchant.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Merchant.countDocuments(filter),
  ])

  return sendSuccess(res, {
    message: `${total} merchant(s) found.`,
    data:    merchants.map(m => ({
      merchantId:    m.merchantId,
      businessName:  m.businessName,
      plan:          m.plan,
      walletAddress: m.blockchain.walletAddress,
      trustScore:    m.intelligence?.trustScore ?? null,
      createdAt:     m.createdAt,
      isActive:      m.isActive,
    })),
    meta: paginationMeta({ page, limit, total }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/merchants/:walletAddress
// Update mutable merchant fields (businessName, email, plan, notifications).
// ─────────────────────────────────────────────────────────────────────────────
export async function update(req, res) {
  const normWallet = normaliseAddress(req.params.walletAddress)

  // Only these fields are user-updatable
  const ALLOWED = ['businessName', 'email', 'plan', 'notifications']
  const updates = {}
  for (const key of ALLOWED) {
    if (req.body[key] !== undefined) updates[key] = req.body[key]
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No updatable fields provided.', 400, 'EMPTY_UPDATE')
  }

  const merchant = await Merchant.findOneAndUpdate(
    { 'blockchain.walletAddress': normWallet, deletedAt: null },
    { $set: updates },
    { new: true, runValidators: true }
  )

  if (!merchant) {
    throw new AppError(
      `No merchant found for wallet "${normWallet}"`,
      404,
      'MERCHANT_NOT_FOUND'
    )
  }

  logger.info(`[Merchant] Updated  merchantId="${merchant.merchantId}"  fields=${Object.keys(updates).join(',')}`)

  return sendSuccess(res, {
    message: 'Merchant profile updated.',
    data:    merchant.toDashboardProfile(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/merchants/:walletAddress  (soft delete)
// ─────────────────────────────────────────────────────────────────────────────
export async function softDelete(req, res) {
  const normWallet = normaliseAddress(req.params.walletAddress)

  const merchant = await Merchant.softDelete(normWallet)
  if (!merchant) {
    throw new AppError(
      `No merchant found for wallet "${normWallet}"`,
      404,
      'MERCHANT_NOT_FOUND'
    )
  }

  logger.info(`[Merchant] Soft-deleted  merchantId="${merchant.merchantId}"`)

  return sendSuccess(res, {
    message: 'Merchant account deactivated.',
    data:    { merchantId: merchant.merchantId, deletedAt: merchant.deletedAt },
  })
}
