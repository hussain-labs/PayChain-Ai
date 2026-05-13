// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Dispute Routes
//
// Mount point: /api/v1/disputes  (registered in app.js)
//
// Route map:
//   POST   /                              → open a new dispute
//   GET    /                              → list merchant's disputes (paginated)
//   GET    /:disputeId                    → get single dispute with AI detail
//   PATCH  /:disputeId/status             → update dispute status
//   POST   /:disputeId/evidence           → submit evidence
//   POST   /:disputeId/ai-verdict         → request Gemini AI verdict (Phase 3)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'
import { body, param, query } from 'express-validator'

import asyncHandler         from '../middleware/asyncHandler.js'
import { validate, rules }  from '../middleware/validate.js'
import { optionalWallet }   from '../middleware/auth.js'
import { apiRateLimiter, aiRateLimiter } from '../middleware/rateLimiter.js'

import {
  create,
  list,
  getOne,
  updateStatus,
  addEvidence,
  requestAiVerdict,
} from '../controllers/disputeController.js'

const router = Router()

// ── disputeId param format validator (shared across sub-routes) ───────────────
const disputeIdParam = param('disputeId')
  .trim()
  .notEmpty().withMessage('disputeId is required')
  .matches(/^DISP-\d{3,}$/).withMessage('disputeId format must be DISP-NNN')

// ── POST /api/v1/disputes ─────────────────────────────────────────────────────
router.post(
  '/',
  apiRateLimiter,
  rules.createDispute,
  validate,
  asyncHandler(create)
)

// ── GET /api/v1/disputes ──────────────────────────────────────────────────────
router.get(
  '/',
  apiRateLimiter,
  optionalWallet,
  [
    ...rules.pagination,
    query('status')
      .optional()
      .isIn(['Open', 'Under Review', 'Awaiting AI', 'AI Assessed',
             'Resolved', 'Rejected', 'Escalated', 'Closed'])
      .withMessage('Invalid dispute status filter'),
  ],
  validate,
  asyncHandler(list)
)

// ── GET /api/v1/disputes/:disputeId ──────────────────────────────────────────
router.get(
  '/:disputeId',
  apiRateLimiter,
  [disputeIdParam],
  validate,
  asyncHandler(getOne)
)

// ── PATCH /api/v1/disputes/:disputeId/status ──────────────────────────────────
router.patch(
  '/:disputeId/status',
  apiRateLimiter,
  [
    disputeIdParam,
    body('status')
      .notEmpty().withMessage('status is required')
      .isIn(['Under Review', 'Resolved', 'Rejected', 'Escalated', 'Closed'])
      .withMessage('Invalid status value'),
    body('resolution')
      .optional()
      .isIn(['Refunded', 'Released', 'Partial', 'Dismissed'])
      .withMessage('Invalid resolution value'),
    body('note')
      .optional()
      .isString()
      .isLength({ max: 500 }).withMessage('note must be ≤ 500 characters'),
  ],
  validate,
  asyncHandler(updateStatus)
)

// ── POST /api/v1/disputes/:disputeId/evidence ─────────────────────────────────
router.post(
  '/:disputeId/evidence',
  apiRateLimiter,
  [
    disputeIdParam,
    body('submittedBy')
      .notEmpty().withMessage('submittedBy is required')
      .isIn(['buyer', 'merchant']).withMessage('submittedBy must be "buyer" or "merchant"'),
    body('description')
      .trim()
      .notEmpty().withMessage('description is required')
      .isLength({ min: 10, max: 2000 }).withMessage('description must be 10–2000 characters'),
    body('attachments')
      .optional()
      .isArray().withMessage('attachments must be an array'),
  ],
  validate,
  asyncHandler(addEvidence)
)

// ── POST /api/v1/disputes/:disputeId/ai-verdict ───────────────────────────────
// Stricter AI rate limiter (20/min) for Gemini calls
router.post(
  '/:disputeId/ai-verdict',
  aiRateLimiter,
  [disputeIdParam],
  validate,
  asyncHandler(requestAiVerdict)
)

export default router
