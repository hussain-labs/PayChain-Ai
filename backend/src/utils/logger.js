// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Winston Logger
// Outputs coloured console logs in dev; structured JSON + rotating files in prod.
// Usage:  import logger from '../utils/logger.js'
//         logger.info('message', { meta: 'data' })
// ─────────────────────────────────────────────────────────────────────────────
import winston                from 'winston'
import DailyRotateFile        from 'winston-daily-rotate-file'
import path                   from 'path'
import { fileURLToPath }      from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG_DIR   = path.resolve(__dirname, '../../logs')
const IS_PROD   = process.env.NODE_ENV === 'production'
const LOG_LEVEL = process.env.LOG_LEVEL ?? (IS_PROD ? 'info' : 'debug')

// ── Custom dev format ─────────────────────────────────────────────────────────
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const extras = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} [${level}] ${message}${extras}`
  })
)

// ── Production JSON format ────────────────────────────────────────────────────
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// ── Transports ────────────────────────────────────────────────────────────────
const transports = [
  new winston.transports.Console({
    format: IS_PROD ? prodFormat : devFormat,
  }),
]

if (IS_PROD) {
  // Combined log — all levels
  transports.push(
    new DailyRotateFile({
      dirname:        LOG_DIR,
      filename:       'paychain-%DATE%.log',
      datePattern:    'YYYY-MM-DD',
      zippedArchive:  true,
      maxSize:        '20m',
      maxFiles:       '14d',
      format:         prodFormat,
    })
  )
  // Error log — errors only
  transports.push(
    new DailyRotateFile({
      dirname:        LOG_DIR,
      filename:       'paychain-error-%DATE%.log',
      datePattern:    'YYYY-MM-DD',
      level:          'error',
      zippedArchive:  true,
      maxSize:        '20m',
      maxFiles:       '30d',
      format:         prodFormat,
    })
  )
}

// ── Logger instance ───────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level:        LOG_LEVEL,
  transports,
  exitOnError:  false,
})

export default logger
