// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Request ID Middleware
// Attaches a unique ID to every request for distributed tracing.
// The ID is echoed in all response bodies and the X-Request-Id header.
// ─────────────────────────────────────────────────────────────────────────────
import { v4 as uuidv4 } from 'uuid'

export function requestId(req, res, next) {
  // Re-use a forwarded ID (from API gateway / load balancer) or generate one
  const id = req.headers['x-request-id'] || uuidv4()
  req.id = id
  res.setHeader('X-Request-Id', id)
  next()
}
