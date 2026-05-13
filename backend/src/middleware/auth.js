// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Auth Middleware
//
// Phase 2 provides two lightweight guards:
//   requireApiKey  — validates the x-api-key header (internal services)
//   requireWallet  — validates the x-wallet-address header (Phase 3: sign-in
//                    with Ethereum will extend this to verify the signature)
//
// Phase 3+: Replace requireWallet with full SIWE (Sign-In with Ethereum)
//           signature verification using viem/ethers.
// ─────────────────────────────────────────────────────────────────────────────
import { ENV }     from '../config/env.js'
import { AppError } from './errorHandler.js'
import { isValidAddress, normaliseAddress } from '../utils/walletUtils.js'
import logger      from '../utils/logger.js'

// ─────────────────────────────────────────────────────────────────────────────
// requireApiKey — protects internal/admin routes
// Header:  x-api-key: <INTERNAL_API_KEY>
// ─────────────────────────────────────────────────────────────────────────────
export function requireApiKey(req, _res, next) {
  if (!ENV.INTERNAL_API_KEY) {
    // API key not configured — skip guard in dev mode
    if (ENV.IS_DEV) return next()
    throw new AppError('API key authentication is not configured', 500, 'AUTH_CONFIG_ERROR')
  }

  const provided = req.headers[ENV.API_KEY_HEADER]
  if (!provided) {
    throw new AppError(
      `Missing required header: "${ENV.API_KEY_HEADER}"`,
      401,
      'MISSING_API_KEY'
    )
  }

  if (provided !== ENV.INTERNAL_API_KEY) {
    logger.warn('[Auth] Invalid API key attempt', { ip: req.ip, requestId: req.id })
    throw new AppError('Invalid API key', 403, 'INVALID_API_KEY')
  }

  next()
}

// ─────────────────────────────────────────────────────────────────────────────
// requireWallet — ensures a valid wallet address is present in the request
// Header:  x-wallet-address: 0x...
//
// Phase 3 TODO: add ECDSA signature verification
//   Header: x-wallet-signature: 0x<sig>
//   Header: x-wallet-message:   <original-message>
// ─────────────────────────────────────────────────────────────────────────────
export function requireWallet(req, _res, next) {
  const rawAddress = req.headers['x-wallet-address']

  if (!rawAddress) {
    throw new AppError(
      'Wallet authentication required. Send "x-wallet-address" header.',
      401,
      'MISSING_WALLET'
    )
  }

  if (!isValidAddress(rawAddress)) {
    throw new AppError(
      `Invalid wallet address in header: "${rawAddress}"`,
      401,
      'INVALID_WALLET_ADDRESS'
    )
  }

  // Attach normalised address for downstream use
  req.walletAddress = normaliseAddress(rawAddress)
  next()
}

// ─────────────────────────────────────────────────────────────────────────────
// optionalWallet — same as requireWallet but does not reject if absent.
// Sets req.walletAddress = null when not provided.
// ─────────────────────────────────────────────────────────────────────────────
export function optionalWallet(req, _res, next) {
  const rawAddress = req.headers['x-wallet-address']
  if (rawAddress && isValidAddress(rawAddress)) {
    req.walletAddress = normaliseAddress(rawAddress)
  } else {
    req.walletAddress = null
  }
  next()
}
