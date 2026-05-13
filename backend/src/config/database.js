// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — MongoDB Connection Manager
// Handles connect / disconnect with retry logic and connection-state events.
// Phase 3+: Add read-replica support for analytics queries.
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose'
import { ENV }  from './env.js'
import logger   from '../utils/logger.js'

// Mongoose global settings
mongoose.set('strictQuery', true)

const CONNECT_OPTIONS = {
  dbName:             ENV.DB_NAME,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS:    45000,
  maxPoolSize:        10,
  minPoolSize:        2,
  heartbeatFrequencyMS: 10000,
}

// ── Connection State ──────────────────────────────────────────────────────────
let _isConnected = false

export const dbState = () => ({
  isConnected: _isConnected,
  readyState:  mongoose.connection.readyState,
  // 0=disconnected 1=connected 2=connecting 3=disconnecting
})

// ── Connect ───────────────────────────────────────────────────────────────────
export async function connectDB() {
  if (_isConnected) {
    logger.debug('[DB] Already connected — skipping reconnect')
    return
  }

  try {
    logger.info('[DB] Connecting to MongoDB…')
    await mongoose.connect(ENV.MONGODB_URI, CONNECT_OPTIONS)
    _isConnected = true
    logger.info(`[DB] ✓ Connected  db="${ENV.DB_NAME}"`)
  } catch (err) {
    logger.error(`[DB] ✗ Connection failed: ${err.message}`)
    throw err
  }
}

// ── Disconnect ────────────────────────────────────────────────────────────────
export async function disconnectDB() {
  if (!_isConnected) return
  await mongoose.disconnect()
  _isConnected = false
  logger.info('[DB] Disconnected from MongoDB')
}

// ── Lifecycle event listeners ─────────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  _isConnected = false
  logger.warn('[DB] MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  _isConnected = true
  logger.info('[DB] MongoDB reconnected')
})

mongoose.connection.on('error', (err) => {
  logger.error(`[DB] Connection error: ${err.message}`)
})
