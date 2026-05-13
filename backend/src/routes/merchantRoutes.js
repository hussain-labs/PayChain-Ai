// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Merchant Routes
//
// Mount point: /api/v1/merchants  (registered in app.js)
//
// Route map:
//   POST   /onboard           → onboard a new merchant wallet
//   GET    /                  → list all merchants (admin)
//   GET    /:walletAddress    → fetch one merchant's dashboard profile
//   PATCH  /:walletAddress    → update mutable profile fields
//   DELETE /:walletAddress    → soft-delete a merchant account
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'

import asyncHandler         from '../middleware/asyncHandler.js'
import { validate, rules }  from '../middleware/validate.js'
import { optionalWallet }   from '../middleware/auth.js'
import { apiRateLimiter, onboardRateLimiter } from '../middleware/rateLimiter.js'

import {
  onboard,
  getByWallet,
  list,
  update,
  softDelete,
} from '../controllers/merchantController.js'

const router = Router()

// ── POST /api/v1/merchants/onboard ────────────────────────────────────────────
// Stricter rate limit (10/hr) to prevent spam registrations
router.post(
  '/onboard',
  onboardRateLimiter,
  rules.onboardMerchant,
  validate,
  asyncHandler(onboard)
)

// ── GET /api/v1/merchants  ────────────────────────────────────────────────────
// Admin / internal — returns paginated merchant list
// Phase 3: protect with requireApiKey middleware
router.get(
  '/',
  apiRateLimiter,
  rules.pagination,
  validate,
  asyncHandler(list)
)

// ── GET /api/v1/merchants/:walletAddress ──────────────────────────────────────
router.get(
  '/:walletAddress',
  apiRateLimiter,
  rules.getByWallet,
  validate,
  asyncHandler(getByWallet)
)

// ── PATCH /api/v1/merchants/:walletAddress ────────────────────────────────────
// Phase 3: swap optionalWallet → requireWallet once SIWE auth is live
router.patch(
  '/:walletAddress',
  apiRateLimiter,
  optionalWallet,
  rules.getByWallet,
  validate,
  asyncHandler(update)
)

// ── DELETE /api/v1/merchants/:walletAddress ───────────────────────────────────
router.delete(
  '/:walletAddress',
  apiRateLimiter,
  rules.getByWallet,
  validate,
  asyncHandler(softDelete)
)

export default router
