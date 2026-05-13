// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — app.js
// Pure Express factory — no side-effects, fully testable.
// All routes, middleware, and error handling are registered here.
// server.js creates the HTTP server and calls boot-time I/O.
// ─────────────────────────────────────────────────────────────────────────────
import express      from 'express'
import helmet       from 'helmet'
import cors         from 'cors'
import compression  from 'compression'
import morgan       from 'morgan'

import { ENV }              from './config/env.js'
import logger               from './utils/logger.js'
import { sendSuccess, sendError } from './utils/apiResponse.js'
import { dbState }          from './config/database.js'

// ── Middleware ─────────────────────────────────────────────────────────────────
import { globalRateLimiter }  from './middleware/rateLimiter.js'
import { errorHandler }       from './middleware/errorHandler.js'
import { requestId }          from './middleware/requestId.js'

// ── Route modules ─────────────────────────────────────────────────────────────
import merchantRoutes    from './routes/merchantRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import disputeRoutes     from './routes/disputeRoutes.js'
import aiRoutes          from './routes/aiRoutes.js'
import analyticsRoutes   from './routes/analyticsRoutes.js'

// ─────────────────────────────────────────────────────────────────────────────
export default function createApp() {
  const app = express()

  // ── Trust proxy (needed behind Nginx / AWS ALB) ───────────────────────────
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy:  { policy: 'cross-origin' },
    contentSecurityPolicy:      ENV.IS_PROD,          // only enforce in prod
  }))

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return cb(null, true)
      if (ENV.CORS_ORIGINS.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS: origin "${origin}" not allowed`))
    },
    methods:            ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders:     ['Content-Type', 'Authorization', ENV.API_KEY_HEADER],
    exposedHeaders:     ['X-Request-Id', 'X-RateLimit-Remaining'],
    credentials:        true,
    optionsSuccessStatus: 200,
  }))

  // ── Compression ───────────────────────────────────────────────────────────
  app.use(compression())

  // ── Body parsers ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))

  // ── Request ID ────────────────────────────────────────────────────────────
  app.use(requestId)

  // ── HTTP request logging ─────────────────────────────────────────────────
  app.use(morgan(ENV.IS_PROD ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip:   (req) => req.path === '/health',          // don't log health pings
  }))

  // ── Global rate limiter ───────────────────────────────────────────────────
  app.use(globalRateLimiter)

  // ────────────────────────────────────────────────────────────────────────────
  // ── Health & System endpoints ──────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────────────

  /** GET /health — used by Docker / k8s liveness probes */
  app.get('/health', (_req, res) => {
    const db = dbState()
    const ok = db.readyState === 1
    return res.status(ok ? 200 : 503).json({
      status:    ok ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version:   '2.0.0',
      services: {
        database: ok ? 'connected' : 'disconnected',
      },
    })
  })

  /** GET /api/v1 — API discovery root */
  app.get('/api/v1', (_req, res) => {
    sendSuccess(res, {
      message: 'PayChain AI API v1',
      data: {
        version:   '2.0.0',
        phase:     'Phase 2',
        endpoints: {
          merchants:    '/api/v1/merchants',
          transactions: '/api/v1/transactions',
          disputes:     '/api/v1/disputes',
          ai:           '/api/v1/ai',
          analytics:    '/api/v1/analytics',
        },
      },
    })
  })

  // ────────────────────────────────────────────────────────────────────────────
  // ── Versioned API Routes ───────────────────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────────────
  app.use('/api/v1/merchants',    merchantRoutes)
  app.use('/api/v1/transactions', transactionRoutes)
  app.use('/api/v1/disputes',     disputeRoutes)
  app.use('/api/v1/ai',           aiRoutes)
  app.use('/api/v1/analytics',    analyticsRoutes)

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((req, res) => {
    sendError(res, {
      status:  404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code:    'ROUTE_NOT_FOUND',
    })
  })

  // ── Global error handler (must be last) ───────────────────────────────────
  app.use(errorHandler)

  return app
}
