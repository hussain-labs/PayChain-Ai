// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Analytics Routes
//
// Mount point: /api/v1/analytics  (registered in app.js)
//
// Route map:
//   GET /overview         → 4 KPI metric cards  (Phase 1 dashboard top row)
//   GET /sales-trend      → 12-month area/bar chart data
//   GET /weekly-revenue   → current week day-by-day bar chart
//
// All routes require a wallet address (via x-wallet-address header or query).
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import { query }  from 'express-validator'

import asyncHandler       from '../middleware/asyncHandler.js'
import { validate }       from '../middleware/validate.js'
import { optionalWallet } from '../middleware/auth.js'
import { apiRateLimiter } from '../middleware/rateLimiter.js'
import { isValidAddress } from '../utils/walletUtils.js'

import {
  overview,
  salesTrend,
  weeklyRevenue,
} from '../controllers/analyticsController.js'

// ── Shared wallet query validator ─────────────────────────────────────────────
const walletQuery = query('walletAddress')
  .optional()
  .custom(val => {
    if (val && !isValidAddress(val)) throw new Error('Invalid wallet address')
    return true
  })

const router = Router()

// ── GET /api/v1/analytics/overview ───────────────────────────────────────────
router.get(
  '/overview',
  apiRateLimiter,
  optionalWallet,
  [walletQuery],
  validate,
  asyncHandler(overview)
)

// ── GET /api/v1/analytics/sales-trend ────────────────────────────────────────
router.get(
  '/sales-trend',
  apiRateLimiter,
  optionalWallet,
  [
    walletQuery,
    query('months')
      .optional()
      .isInt({ min: 1, max: 24 }).withMessage('months must be between 1 and 24')
      .toInt(),
  ],
  validate,
  asyncHandler(salesTrend)
)

// ── GET /api/v1/analytics/weekly-revenue ─────────────────────────────────────
router.get(
  '/weekly-revenue',
  apiRateLimiter,
  optionalWallet,
  [walletQuery],
  validate,
  asyncHandler(weeklyRevenue)
)

export default router
