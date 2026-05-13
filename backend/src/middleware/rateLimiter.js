// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Rate Limiters
//
// Three tiers:
//   globalRateLimiter  — 100 req / 15 min  (all routes)
//   apiRateLimiter     — 60  req / 1 min   (general API routes)
//   aiRateLimiter      — 20  req / 1 min   (Gemini endpoints — costly)
//
// Phase 3+: Replace MemoryStore with Redis store for multi-instance deployments.
// ─────────────────────────────────────────────────────────────────────────────
import rateLimit from 'express-rate-limit'
import { ENV }   from '../config/env.js'
import logger    from '../utils/logger.js'

// ── Shared skip function ──────────────────────────────────────────────────────
// Skip rate limiting in test environment
const skipInTest = () => process.env.NODE_ENV === 'test'

// ── Shared rate-limit exceeded handler ───────────────────────────────────────
function onLimitReached(req, res, _options) {
  logger.warn('[RateLimit] Limit exceeded', {
    ip:      req.ip,
    path:    req.path,
    method:  req.method,
    requestId: req.id,
  })
}

// ── Standard handler for all exceeded limits ──────────────────────────────────
function limitHandler(req, res) {
  return res.status(429).json({
    success:   false,
    message:   'Too many requests — please slow down and try again shortly.',
    code:      'RATE_LIMIT_EXCEEDED',
    retryAfter: res.getHeader('Retry-After'),
    timestamp: new Date().toISOString(),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Global — entire API
// ─────────────────────────────────────────────────────────────────────────────
export const globalRateLimiter = rateLimit({
  windowMs:         ENV.RATE_LIMIT_WINDOW_MS,   // 15 min
  max:              ENV.RATE_LIMIT_MAX,          // 100
  standardHeaders:  true,    // Return rate limit info in `RateLimit-*` headers
  legacyHeaders:    false,
  skip:             skipInTest,
  handler:          limitHandler,
  // keyGenerator defaults to req.ip
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. API — general merchant / transaction routes
// ─────────────────────────────────────────────────────────────────────────────
export const apiRateLimiter = rateLimit({
  windowMs:         60 * 1000,   // 1 min
  max:              60,
  standardHeaders:  true,
  legacyHeaders:    false,
  skip:             skipInTest,
  handler:          limitHandler,
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. AI — Gemini routes (expensive — stricter limit)
// ─────────────────────────────────────────────────────────────────────────────
export const aiRateLimiter = rateLimit({
  windowMs:         60 * 1000,   // 1 min
  max:              ENV.AI_RATE_LIMIT_MAX,  // 20 default
  standardHeaders:  true,
  legacyHeaders:    false,
  skip:             skipInTest,
  handler:          limitHandler,
  keyGenerator: (req) => {
    // Key by wallet address if present (more granular than IP for Web3 apps)
    return req.headers['x-wallet-address'] || req.ip
  },
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Onboarding — stricter limit to prevent spam registrations
// ─────────────────────────────────────────────────────────────────────────────
export const onboardRateLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,  // 1 hour
  max:              10,              // max 10 onboard attempts per IP/hour
  standardHeaders:  true,
  legacyHeaders:    false,
  skip:             skipInTest,
  handler:          limitHandler,
  message: {
    success:   false,
    message:   'Too many onboarding attempts. Please try again in an hour.',
    code:      'ONBOARD_RATE_LIMIT',
    timestamp: new Date().toISOString(),
  },
})
