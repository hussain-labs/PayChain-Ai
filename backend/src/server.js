// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — server.js  (Phase 2 Entry Point)
//
// Boot order:
//   1. Load & validate environment variables
//   2. Connect to MongoDB
//   3. Initialise Pinecone index
//   4. Warm the Gemini client
//   5. Mount Express app
//   6. Start HTTP server
//   7. Register graceful-shutdown handlers
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config'
import http          from 'http'

import { ENV }          from './config/env.js'
import { connectDB }    from './config/database.js'
import logger           from './utils/logger.js'
import createApp        from './app.js'

// ── Services (initialised once at boot) ──────────────────────────────────────
import { initialisePinecone } from './services/pineconeService.js'
import { initialiseGemini }   from './services/geminiService.js'

// ─────────────────────────────────────────────────────────────────────────────
async function boot() {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(' ⬡  PayChain AI — Backend  v2.0.0')
  logger.info(`    env="${ENV.NODE_ENV}"  port=${ENV.PORT}`)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // ── 1. MongoDB ─────────────────────────────────────────────────────────────
  await connectDB()

  // ── 2. Pinecone ────────────────────────────────────────────────────────────
  await initialisePinecone()

  // ── 3. Gemini ──────────────────────────────────────────────────────────────
  await initialiseGemini()

  // ── 4. Express app ─────────────────────────────────────────────────────────
  const app    = createApp()
  const server = http.createServer(app)

  // ── 5. Listen ──────────────────────────────────────────────────────────────
  await new Promise((resolve, reject) => {
    server.listen(ENV.PORT, '0.0.0.0', resolve)
    server.once('error', reject)
  })

  logger.info(`[Server] ✓ Listening on http://0.0.0.0:${ENV.PORT}`)
  logger.info(`[Server] ✓ API base    http://localhost:${ENV.PORT}/api/v1`)
  logger.info(`[Server] ✓ Health      http://localhost:${ENV.PORT}/health`)

  // ── 6. Graceful shutdown ───────────────────────────────────────────────────
  registerShutdown(server)
}

// ─────────────────────────────────────────────────────────────────────────────
function registerShutdown(server) {
  const shutdown = async (signal) => {
    logger.info(`[Server] ${signal} received — shutting down gracefully…`)

    server.close(async () => {
      logger.info('[Server] HTTP server closed')
      try {
        const { disconnectDB } = await import('./config/database.js')
        await disconnectDB()
      } catch (_) { /* already disconnected */ }
      logger.info('[Server] Goodbye 👋')
      process.exit(0)
    })

    // Force-kill after 10 s if connections won't drain
    setTimeout(() => {
      logger.error('[Server] Forced shutdown after timeout')
      process.exit(1)
    }, 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    logger.error('[Process] Unhandled rejection:', { reason })
  })
  process.on('uncaughtException', (err) => {
    logger.error('[Process] Uncaught exception:', { err: err.message, stack: err.stack })
    process.exit(1)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
boot().catch((err) => {
  logger.error(`[Boot] Fatal error: ${err.message}`, { stack: err.stack })
  process.exit(1)
})
