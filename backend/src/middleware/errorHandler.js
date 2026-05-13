// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Global Error Handler Middleware
// Must be registered LAST in app.js: app.use(errorHandler)
//
// Normalises every thrown error (including mongoose, validation, CORS) into
// the standard PayChain API envelope: { success, message, code, errors }
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose'
import logger   from '../utils/logger.js'
import { ENV }  from '../config/env.js'

// ── Mongoose error → HTTP shape ───────────────────────────────────────────────
function handleMongooseError(err) {
  // Duplicate key  (e.g. unique walletAddress)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field'
    const value = err.keyValue?.[field]
    return {
      status:  409,
      code:    'DUPLICATE_KEY',
      message: `A record with this ${field} already exists: "${value}"`,
    }
  }

  // Validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map(e => ({
      field:   e.path,
      message: e.message,
    }))
    return {
      status:  422,
      code:    'VALIDATION_ERROR',
      message: 'Mongoose validation failed',
      errors,
    }
  }

  // Cast error  (bad ObjectId, wrong type)
  if (err instanceof mongoose.Error.CastError) {
    return {
      status:  400,
      code:    'CAST_ERROR',
      message: `Invalid value for field "${err.path}": "${err.value}"`,
    }
  }

  return null
}

// ── express-validator shape ────────────────────────────────────────────────────
function isValidationErrorArray(err) {
  return Array.isArray(err?.errors) &&
    err.errors.length > 0 &&
    'msg' in err.errors[0]
}

// ─────────────────────────────────────────────────────────────────────────────
export function errorHandler(err, req, res, _next) {
  // ── 1. Determine HTTP status ─────────────────────────────────────────────
  let status  = err.status ?? err.statusCode ?? 500
  let code    = err.code   ?? 'INTERNAL_ERROR'
  let message = err.message ?? 'An unexpected error occurred'
  let errors  = undefined

  // ── 2. Classify known error types ────────────────────────────────────────
  const mongoShape = handleMongooseError(err)
  if (mongoShape) {
    status  = mongoShape.status
    code    = mongoShape.code
    message = mongoShape.message
    errors  = mongoShape.errors
  } else if (isValidationErrorArray(err)) {
    // express-validator result passed as an Error-like object
    status  = 422
    code    = 'VALIDATION_ERROR'
    message = 'Request validation failed'
    errors  = err.errors.map(e => ({ field: e.path ?? e.param, message: e.msg }))
  } else if (err.type === 'entity.parse.failed') {
    status  = 400
    code    = 'INVALID_JSON'
    message = 'Request body contains invalid JSON'
  } else if (err.message?.startsWith('CORS:')) {
    status  = 403
    code    = 'CORS_BLOCKED'
    message = err.message
  }

  // ── 3. Log ────────────────────────────────────────────────────────────────
  const logMeta = {
    requestId: req.id,
    method:    req.method,
    path:      req.path,
    status,
    code,
  }

  if (status >= 500) {
    logger.error(`[ErrorHandler] ${message}`, { ...logMeta, stack: err.stack })
  } else {
    logger.warn(`[ErrorHandler] ${message}`, logMeta)
  }

  // ── 4. Respond ────────────────────────────────────────────────────────────
  // Hide internal details in production
  const responseMessage = (status >= 500 && ENV.IS_PROD)
    ? 'An internal server error occurred'
    : message

  const body = {
    success:   false,
    message:   responseMessage,
    code,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  }

  if (errors)              body.errors = errors
  if (!ENV.IS_PROD && err.stack) body.stack = err.stack  // expose in dev only

  return res.status(status).json(body)
}

// ─────────────────────────────────────────────────────────────────────────────
// AppError — typed error class for intentional HTTP errors thrown in controllers
// Usage:  throw new AppError('Merchant not found', 404, 'MERCHANT_NOT_FOUND')
// ─────────────────────────────────────────────────────────────────────────────
export class AppError extends Error {
  /**
   * @param {string} message   - Human-readable message
   * @param {number} status    - HTTP status code
   * @param {string} [code]    - Machine-readable code for the frontend
   */
  constructor(message, status = 500, code = 'APP_ERROR') {
    super(message)
    this.name       = 'AppError'
    this.status     = status
    this.statusCode = status   // alias used by some middleware
    this.code       = code
    Error.captureStackTrace(this, this.constructor)
  }
}
