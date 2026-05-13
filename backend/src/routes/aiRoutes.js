// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — AI Routes
//
// Mount point: /api/v1/ai  (registered in app.js)
//
// Route map:
//   GET    /status                    → service health + feature flags
//   POST   /status-report             → Gemini merchant report  (Phase 2 ✓)
//   POST   /risk/:txId                → transaction risk score  (Phase 3 stub)
//   POST   /trust/:walletAddress      → merchant trust score    (Phase 3 stub)
//   GET    /xai/:txId                 → XAI risk report         (Phase 3 stub)
//
// All routes use the stricter aiRateLimiter (20 req/min keyed by wallet).
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import { body, param, query } from 'express-validator'

import asyncHandler         from '../middleware/asyncHandler.js'
import { validate, rules }  from '../middleware/validate.js'
import { optionalWallet }   from '../middleware/auth.js'
import { aiRateLimiter }    from '../middleware/rateLimiter.js'
import { isValidAddress }   from '../utils/walletUtils.js'

import {
  status,
  statusReport,
  transactionRisk,
  trustScore,
  xaiReport,
} from '../controllers/aiController.js'

const router = Router()

// ── GET /api/v1/ai/status ─────────────────────────────────────────────────────
// No rate limit — lightweight status check, safe to poll
router.get('/status', asyncHandler(status))

// ── POST /api/v1/ai/status-report ────────────────────────────────────────────
// Phase 2 live: Gemini generates a personalised merchant status report.
// Wallet can be sent in the body or as the x-wallet-address header.
router.post(
  '/status-report',
  aiRateLimiter,
  optionalWallet,
  [
    body('walletAddress')
      .optional()
      .custom(val => {
        if (val && !isValidAddress(val)) throw new Error('Invalid wallet address')
        return true
      }),
    body('businessName')
      .optional()
      .trim()
      .isLength({ max: 120 }).withMessage('businessName must be ≤ 120 characters'),
    body('plan')
      .optional()
      .isIn(['Free', 'Pro', 'Enterprise']).withMessage('Invalid plan'),
    ...rules.statusReport,
  ],
  validate,
  asyncHandler(statusReport)
)

// ── POST /api/v1/ai/risk/:txId ────────────────────────────────────────────────
// Phase 3 stub — returns 503 / phase3Ready: false until Gemini risk is live
router.post(
  '/risk/:txId',
  aiRateLimiter,
  [
    param('txId')
      .trim()
      .notEmpty().withMessage('txId is required'),
  ],
  validate,
  asyncHandler(transactionRisk)
)

// ── POST /api/v1/ai/trust/:walletAddress ──────────────────────────────────────
// Phase 3 stub — computes and persists an AI trust score for a merchant
router.post(
  '/trust/:walletAddress',
  aiRateLimiter,
  [
    param('walletAddress')
      .trim()
      .notEmpty().withMessage('walletAddress is required')
      .custom(val => {
        if (!isValidAddress(val)) throw new Error('Invalid EVM wallet address')
        return true
      }),
  ],
  validate,
  asyncHandler(trustScore)
)

// ── GET /api/v1/ai/xai/:txId ──────────────────────────────────────────────────
// Phase 3 stub — Explainable AI report for a transaction
router.get(
  '/xai/:txId',
  aiRateLimiter,
  [
    param('txId')
      .trim()
      .notEmpty().withMessage('txId is required'),
  ],
  validate,
  asyncHandler(xaiReport)
)

export default router
