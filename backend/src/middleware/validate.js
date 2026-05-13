// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Request Validation Middleware
//
// Uses express-validator under the hood.
// Usage in a route file:
//
//   import { validate, rules } from '../middleware/validate.js'
//
//   router.post(
//     '/onboard',
//     rules.onboardMerchant,
//     validate,
//     merchantController.onboard
//   )
// ─────────────────────────────────────────────────────────────────────────────
import { validationResult, body, param, query } from 'express-validator'
import { isValidAddress } from '../utils/walletUtils.js'

// ── Runner — checks result, sends 422 if invalid ──────────────────────────────
export function validate(req, res, next) {
  const result = validationResult(req)
  if (result.isEmpty()) return next()

  const errors = result.array().map(e => ({
    field:   e.path ?? e.param,
    message: e.msg,
    value:   e.value,
  }))

  return res.status(422).json({
    success:   false,
    message:   'Request validation failed',
    code:      'VALIDATION_ERROR',
    errors,
    timestamp: new Date().toISOString(),
  })
}

// ── Custom validator — EVM address ────────────────────────────────────────────
const evmAddress = (fieldPath) =>
  param(fieldPath)
    .notEmpty().withMessage(`${fieldPath} is required`)
    .custom(val => {
      if (!isValidAddress(val)) {
        throw new Error(`Invalid EVM wallet address: "${val}"`)
      }
      return true
    })

// ─────────────────────────────────────────────────────────────────────────────
// Rule sets — one per route group
// ─────────────────────────────────────────────────────────────────────────────
export const rules = {

  // ── POST /api/v1/merchants/onboard ─────────────────────────────────────────
  onboardMerchant: [
    body('businessName')
      .trim()
      .notEmpty().withMessage('businessName is required')
      .isLength({ min: 2, max: 120 }).withMessage('businessName must be 2–120 characters'),

    body('walletAddress')
      .trim()
      .notEmpty().withMessage('walletAddress is required')
      .custom(val => {
        if (!isValidAddress(val)) throw new Error('Invalid EVM wallet address')
        return true
      }),

    body('did')
      .optional()
      .trim()
      .custom(val => {
        if (val && !val.startsWith('did:')) throw new Error('DID must start with "did:"')
        return true
      }),

    body('email')
      .optional()
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),

    body('plan')
      .optional()
      .isIn(['Free', 'Pro', 'Enterprise']).withMessage('plan must be Free, Pro, or Enterprise'),
  ],

  // ── GET /api/v1/merchants/:walletAddress ───────────────────────────────────
  getByWallet: [
    evmAddress('walletAddress'),
  ],

  // ── POST /api/v1/transactions ──────────────────────────────────────────────
  createTransaction: [
    body('merchantWallet')
      .trim().notEmpty().withMessage('merchantWallet is required')
      .custom(v => { if (!isValidAddress(v)) throw new Error('Invalid merchantWallet'); return true }),

    body('fromWallet')
      .trim().notEmpty().withMessage('fromWallet is required')
      .custom(v => { if (!isValidAddress(v)) throw new Error('Invalid fromWallet'); return true }),

    body('amount')
      .notEmpty().withMessage('amount is required')
      .isFloat({ min: 0.000001 }).withMessage('amount must be a positive number'),

    body('currency')
      .optional()
      .isIn(['USDC', 'USDT', 'ETH', 'MATIC']).withMessage('Unsupported currency'),

    body('txHash')
      .optional()
      .trim()
      .matches(/^0x[0-9a-fA-F]{64}$/).withMessage('Invalid transaction hash'),

    body('status')
      .optional()
      .isIn(['Pending', 'Success', 'Failed', 'Escrowed', 'Disputed', 'Refunded'])
      .withMessage('Invalid transaction status'),
  ],

  // ── POST /api/v1/disputes ──────────────────────────────────────────────────
  createDispute: [
    body('transactionId')
      .notEmpty().withMessage('transactionId is required')
      .isMongoId().withMessage('transactionId must be a valid MongoDB ObjectId'),

    body('reason')
      .trim()
      .notEmpty().withMessage('reason is required')
      .isLength({ min: 10, max: 500 }).withMessage('reason must be 10–500 characters'),

    body('buyerWallet')
      .trim().notEmpty().withMessage('buyerWallet is required')
      .custom(v => { if (!isValidAddress(v)) throw new Error('Invalid buyerWallet'); return true }),
  ],

  // ── GET /api/v1/ai/status-report ──────────────────────────────────────────
  statusReport: [
    query('walletAddress')
      .optional()
      .custom(val => {
        if (val && !isValidAddress(val)) throw new Error('Invalid wallet address')
        return true
      }),
  ],

  // ── Pagination (shared) ───────────────────────────────────────────────────
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('page must be a positive integer')
      .toInt(),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
      .toInt(),
  ],
}
