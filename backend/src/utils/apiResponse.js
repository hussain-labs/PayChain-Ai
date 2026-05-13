// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Standard API Response Envelope
// Every endpoint uses these helpers so the frontend always gets
// a consistent shape:
//   { success, message, data, meta, errors, timestamp }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send a successful response
 * @param {import('express').Response} res
 * @param {object}  payload
 * @param {any}     payload.data        - response payload
 * @param {string}  [payload.message]   - human-readable description
 * @param {object}  [payload.meta]      - pagination, counts, etc.
 * @param {number}  [payload.status]    - HTTP status code (default 200)
 */
export function sendSuccess(res, {
  data    = null,
  message = 'OK',
  meta    = undefined,
  status  = 200,
} = {}) {
  const body = {
    success:   true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
  if (meta !== undefined) body.meta = meta
  return res.status(status).json(body)
}

/**
 * Send a created (201) response
 */
export function sendCreated(res, { data = null, message = 'Created' } = {}) {
  return sendSuccess(res, { data, message, status: 201 })
}

/**
 * Send an error response
 * @param {import('express').Response} res
 * @param {object}  payload
 * @param {string}  payload.message     - human-readable error
 * @param {number}  [payload.status]    - HTTP status code (default 500)
 * @param {string}  [payload.code]      - machine-readable error code
 * @param {Array}   [payload.errors]    - validation error details
 */
export function sendError(res, {
  message = 'Internal Server Error',
  status  = 500,
  code    = 'INTERNAL_ERROR',
  errors  = undefined,
} = {}) {
  const body = {
    success:   false,
    message,
    code,
    timestamp: new Date().toISOString(),
  }
  if (errors !== undefined) body.errors = errors
  return res.status(status).json(body)
}

/**
 * Build a paginated meta object for list endpoints
 */
export function paginationMeta({ page, limit, total }) {
  return {
    page:       parseInt(page, 10),
    limit:      parseInt(limit, 10),
    total,
    totalPages: Math.ceil(total / limit),
    hasNext:    page * limit < total,
    hasPrev:    page > 1,
  }
}
