// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Transaction Routes
//
// Mount point: /api/v1/transactions  (registered in app.js)
//
// Route map:
//   POST   /                     → record a new transaction
//   GET    /                     → list merchant's transactions (paginated)
//   GET    /:txId                → get single transaction with full AI detail
//   PATCH  /:txId/status         → update status (webhook / manual)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import { body, param } from 'express-validator'

import asyncHandler         from '../middleware/asyncHandler.js'
import { validate, rules }  from '../middleware/validate.js'
import { optionalWallet }   from '../middleware/auth.js'
import { apiRateLimiter }   from '../middleware/rateLimiter.js'

import {
  create,
  list,
  getOne,
  updateStatus,
} from '../controllers/transactionController.js'

const router = Router()

// ── POST /api/v1/transactions ─────────────────────────────────────────────────
router.post(
  '/',
  apiRateLimiter,
  rules.createTransaction,
  validate,
  asyncHandler(create)
)

// ── GET /api/v1/transactions ──────────────────────────────────────────────────
// Requires wallet in header (x-wallet-address) or query param
router.get(
  '/',
  apiRateLimiter,
  optionalWallet,
  rules.pagination,
  validate,
  asyncHandler(list)
)

// ── GET /api/v1/transactions/:txId ────────────────────────────────────────────
router.get(
  '/:txId',
  apiRateLimiter,
  [
    param('txId')
      .trim()
      .notEmpty().withMessage('txId is required')
      .matches(/^TX-\d{4}-\d{3,}$/).withMessage('txId format must be TX-YYYY-NNN'),
  ],
  validate,
  asyncHandler(getOne)
)

// ── PATCH /api/v1/transactions/:txId/status ───────────────────────────────────
router.patch(
  '/:txId/status',
  apiRateLimiter,
  [
    param('txId').trim().notEmpty().withMessage('txId is required'),
    body('status')
      .notEmpty().withMessage('status is required')
      .isIn(['Pending', 'Success', 'Failed', 'Escrowed', 'Disputed', 'Refunded'])
      .withMessage('Invalid status value'),
    body('note')
      .optional()
      .isString()
      .isLength({ max: 500 }).withMessage('note must be ≤ 500 characters'),
  ],
  validate,
  asyncHandler(updateStatus)
)

export default router
