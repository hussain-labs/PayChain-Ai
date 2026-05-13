// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Environment Configuration
// Single source of truth for all env vars. Validated at startup — missing
// required values throw immediately rather than failing silently at runtime.
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config'

// ── Helper ────────────────────────────────────────────────────────────────────
function required(key) {
  const val = process.env[key]
  if (!val || val.trim() === '') {
    throw new Error(
      `[ENV] Missing required environment variable: "${key}"\n` +
      `      Copy backend/sample.env → backend/.env and fill in all values.`
    )
  }
  return val.trim()
}

function optional(key, fallback = '') {
  return (process.env[key] ?? fallback).trim()
}

// ─────────────────────────────────────────────────────────────────────────────
export const ENV = {
  // ── Runtime ───────────────────────────────────────────────────────────────
  NODE_ENV:   optional('NODE_ENV', 'development'),
  PORT:       parseInt(optional('PORT', '4000'), 10),
  IS_PROD:    optional('NODE_ENV', 'development') === 'production',
  IS_DEV:     optional('NODE_ENV', 'development') === 'development',

  // ── MongoDB ───────────────────────────────────────────────────────────────
  MONGODB_URI:   required('MONGODB_URI'),
  DB_NAME:       optional('DB_NAME', 'paychain_ai'),

  // ── Pinecone ──────────────────────────────────────────────────────────────
  PINECONE_API_KEY:     required('PINECONE_API_KEY'),
  PINECONE_INDEX_NAME:  optional('PINECONE_INDEX_NAME', 'paychain-transactions'),
  PINECONE_DIMENSION:   parseInt(optional('PINECONE_DIMENSION', '768'), 10),

  // ── Gemini ────────────────────────────────────────────────────────────────
  GEMINI_API_KEY:   required('GEMINI_API_KEY'),
  GEMINI_MODEL:     optional('GEMINI_MODEL', 'gemini-1.5-flash'),

  // ── Security ──────────────────────────────────────────────────────────────
  JWT_SECRET:         optional('JWT_SECRET', 'CHANGE_ME_IN_PRODUCTION'),
  JWT_EXPIRES_IN:     optional('JWT_EXPIRES_IN', '7d'),
  API_KEY_HEADER:     optional('API_KEY_HEADER', 'x-api-key'),
  INTERNAL_API_KEY:   optional('INTERNAL_API_KEY', ''),

  // ── CORS ──────────────────────────────────────────────────────────────────
  // Comma-separated list of allowed origins
  CORS_ORIGINS: optional('CORS_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean),

  // ── Rate limiting ─────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS:   parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 min
  RATE_LIMIT_MAX:         parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  AI_RATE_LIMIT_MAX:      parseInt(optional('AI_RATE_LIMIT_MAX', '20'), 10),

  // ── Logging ───────────────────────────────────────────────────────────────
  LOG_LEVEL:    optional('LOG_LEVEL', 'info'),
  LOG_DIR:      optional('LOG_DIR', 'logs'),
}
