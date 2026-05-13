// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Pinecone Service  (Phase 2)
//
// Responsibilities:
//   • Initialise the Pinecone client and verify / create the target index
//   • Provide typed placeholder functions for every Phase 3/4 embedding op
//   • Keep all vector logic isolated so controllers stay thin
//
// Vector strategy (Phase 3 implementation guide):
//   - Dimension : 768  (Google text-embedding-004 output size)
//   - Metric    : cosine
//   - Namespace : "transactions" | "merchants" | "disputes"
//   - Metadata  : stored alongside each vector for filtered queries
//
// Phase 3 TODO: Replace placeholder bodies with real embedding calls:
//   const { GoogleGenerativeAI } = await import('@google/generative-ai')
//   const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
//   const { embedding } = await model.embedContent(textToEmbed)
//   → embedding.values is the float[] to upsert
// ─────────────────────────────────────────────────────────────────────────────
import { Pinecone }  from '@pinecone-database/pinecone'
import { ENV }       from '../config/env.js'
import logger        from '../utils/logger.js'

// ── Singleton state ───────────────────────────────────────────────────────────
/** @type {Pinecone | null} */
let _client    = null

/** @type {import('@pinecone-database/pinecone').Index | null} */
let _index     = null

let _isReady   = false

// ── Namespaces ────────────────────────────────────────────────────────────────
export const NAMESPACES = {
  TRANSACTIONS: 'transactions',
  MERCHANTS:    'merchants',
  DISPUTES:     'disputes',
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISE
// Called once at server boot from server.js
// ─────────────────────────────────────────────────────────────────────────────
export async function initialisePinecone() {
  try {
    logger.info('[Pinecone] Initialising client…')

    _client = new Pinecone({ apiKey: ENV.PINECONE_API_KEY })

    // ── Verify or create the index ────────────────────────────────────────────
    const existingIndexes = await _client.listIndexes()
    const indexNames = existingIndexes?.indexes?.map(i => i.name) ?? []

    if (!indexNames.includes(ENV.PINECONE_INDEX_NAME)) {
      logger.info(`[Pinecone] Index "${ENV.PINECONE_INDEX_NAME}" not found — creating…`)

      await _client.createIndex({
        name:      ENV.PINECONE_INDEX_NAME,
        dimension: ENV.PINECONE_DIMENSION,  // 768 for text-embedding-004
        metric:    'cosine',
        spec: {
          serverless: {
            cloud:  'aws',
            region: 'us-east-1',
          },
        },
      })

      logger.info(`[Pinecone] ✓ Index "${ENV.PINECONE_INDEX_NAME}" created`)
    } else {
      logger.info(`[Pinecone] ✓ Index "${ENV.PINECONE_INDEX_NAME}" already exists`)
    }

    // ── Get a reference to the index ─────────────────────────────────────────
    _index   = _client.index(ENV.PINECONE_INDEX_NAME)
    _isReady = true

    logger.info(`[Pinecone] ✓ Ready  index="${ENV.PINECONE_INDEX_NAME}"  dim=${ENV.PINECONE_DIMENSION}`)
  } catch (err) {
    // Non-fatal in Phase 2 — log and continue so the server boots without
    // a real Pinecone key during development.
    logger.warn(`[Pinecone] ⚠ Initialisation skipped: ${err.message}`)
    logger.warn('[Pinecone]   Set PINECONE_API_KEY in .env to enable vector features.')
    _isReady = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────────────────────
export function getPineconeStatus() {
  return {
    isReady:   _isReady,
    indexName: ENV.PINECONE_INDEX_NAME,
    dimension: ENV.PINECONE_DIMENSION,
  }
}

// ── Guard — throws if Pinecone is not yet ready ────────────────────────────────
function requireReady(fnName) {
  if (!_isReady || !_index) {
    throw new Error(
      `[Pinecone] ${fnName}() called before initialisation. ` +
      `Check PINECONE_API_KEY and wait for initialisePinecone() to resolve.`
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSACTION EMBEDDINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * upsertTransactionEmbedding
 * Stores a transaction's vector embedding in Pinecone for similarity search,
 * fraud pattern matching, and XAI feature attribution.
 *
 * @param {object} params
 * @param {string} params.txId            - PayChain transaction ID  (TX-2025-001)
 * @param {string} params.merchantWallet  - Merchant wallet address
 * @param {string} params.fromWallet      - Buyer wallet address
 * @param {number} params.amount          - Transaction amount
 * @param {string} params.currency        - Currency (USDC, ETH…)
 * @param {string} params.status          - Transaction status
 * @param {boolean} params.isEscrow       - Whether this is an escrow transaction
 * @param {number[]} [params.embedding]   - Pre-computed float[] (dim=768).
 *                                          Phase 3 TODO: generate via text-embedding-004
 * @returns {Promise<{ vectorId: string }>}
 *
 * Phase 3 Implementation:
 *   1. Build a rich text representation of the transaction
 *   2. Call Google text-embedding-004 to get a 768-dim vector
 *   3. Upsert the vector with metadata for filtered queries
 *   4. Save the returned vectorId to Transaction.riskAssessment.pineconeVectorId
 */
export async function upsertTransactionEmbedding({
  txId,
  merchantWallet,
  fromWallet,
  amount,
  currency = 'USDC',
  status,
  isEscrow = false,
  embedding = null,   // Phase 3: required; Phase 2: accepted but not stored
}) {
  // ── Phase 2 Stub ──────────────────────────────────────────────────────────
  // Return a deterministic placeholder ID so calling code can store it
  // without a real Pinecone connection.
  if (!_isReady) {
    const stubId = `stub_tx_${txId}`
    logger.debug(`[Pinecone] upsertTransactionEmbedding() stub → vectorId="${stubId}"`)
    return { vectorId: stubId, stub: true }
  }

  requireReady('upsertTransactionEmbedding')

  // ── Phase 3 TODO ──────────────────────────────────────────────────────────
  // Uncomment and extend when Gemini embedding model is ready:
  //
  // const text = buildTransactionText({ txId, merchantWallet, fromWallet,
  //                                     amount, currency, status, isEscrow })
  // const embeddingVector = await generateEmbedding(text)   // see helpers below
  //
  // For now, a zero-vector is upserted if a real embedding is not provided.
  const vector = embedding ?? new Array(ENV.PINECONE_DIMENSION).fill(0)
  const vectorId = `tx_${txId}`

  const namespace = _index.namespace(NAMESPACES.TRANSACTIONS)

  await namespace.upsert([{
    id:     vectorId,
    values: vector,
    metadata: {
      txId,
      merchantWallet: merchantWallet.toLowerCase(),
      fromWallet:     fromWallet.toLowerCase(),
      amount,
      currency,
      status,
      isEscrow,
      upsertedAt: new Date().toISOString(),
    },
  }])

  logger.debug(`[Pinecone] Transaction vector upserted  id="${vectorId}"  ns="${NAMESPACES.TRANSACTIONS}"`)
  return { vectorId, stub: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// MERCHANT EMBEDDINGS  (Phase 4 placeholder)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * upsertMerchantEmbedding
 * Stores a merchant's aggregate profile vector for trust-score computation
 * and peer-similarity analysis.
 *
 * Phase 4 TODO:
 *   1. Fetch last 90 days of transactions for the merchant
 *   2. Build a statistical text summary (avg amount, dispute rate, velocity…)
 *   3. Embed with text-embedding-004
 *   4. Upsert and store vectorId in Merchant.intelligence.pineconeEmbeddingId
 *
 * @param {object} params
 * @param {string} params.merchantId
 * @param {string} params.walletAddress
 * @param {object} params.metrics
 * @param {number[]} [params.embedding]
 */
export async function upsertMerchantEmbedding({
  merchantId,
  walletAddress,
  metrics = {},
  embedding = null,
}) {
  if (!_isReady) {
    const stubId = `stub_merchant_${merchantId}`
    logger.debug(`[Pinecone] upsertMerchantEmbedding() stub → vectorId="${stubId}"`)
    return { vectorId: stubId, stub: true }
  }

  requireReady('upsertMerchantEmbedding')

  const vector    = embedding ?? new Array(ENV.PINECONE_DIMENSION).fill(0)
  const vectorId  = `merchant_${merchantId}`
  const namespace = _index.namespace(NAMESPACES.MERCHANTS)

  await namespace.upsert([{
    id:     vectorId,
    values: vector,
    metadata: {
      merchantId,
      walletAddress: walletAddress.toLowerCase(),
      totalRevenue:       metrics.totalRevenue      ?? 0,
      totalTransactions:  metrics.totalTransactions ?? 0,
      disputeCount:       metrics.disputeCount      ?? 0,
      upsertedAt: new Date().toISOString(),
    },
  }])

  logger.debug(`[Pinecone] Merchant vector upserted  id="${vectorId}"`)
  return { vectorId, stub: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPUTE EMBEDDINGS  (Phase 4 placeholder)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * upsertDisputeEmbedding
 * Stores a dispute's text embedding for pattern-matching against historic cases.
 *
 * Phase 4 TODO:
 *   1. Embed the dispute reason + evidence descriptions
 *   2. Query nearest neighbours to find similar past disputes and their outcomes
 *   3. Feed the match results into the Gemini arbitration prompt
 *
 * @param {object} params
 * @param {string} params.disputeId
 * @param {string} params.reason
 * @param {string} params.merchantWallet
 * @param {string} params.buyerWallet
 * @param {number} params.amount
 * @param {number[]} [params.embedding]
 */
export async function upsertDisputeEmbedding({
  disputeId,
  reason,
  merchantWallet,
  buyerWallet,
  amount,
  embedding = null,
}) {
  if (!_isReady) {
    const stubId = `stub_dispute_${disputeId}`
    logger.debug(`[Pinecone] upsertDisputeEmbedding() stub → vectorId="${stubId}"`)
    return { vectorId: stubId, stub: true }
  }

  requireReady('upsertDisputeEmbedding')

  const vector    = embedding ?? new Array(ENV.PINECONE_DIMENSION).fill(0)
  const vectorId  = `dispute_${disputeId}`
  const namespace = _index.namespace(NAMESPACES.DISPUTES)

  await namespace.upsert([{
    id:     vectorId,
    values: vector,
    metadata: {
      disputeId,
      reason:         reason.slice(0, 512),
      merchantWallet: merchantWallet.toLowerCase(),
      buyerWallet:    buyerWallet.toLowerCase(),
      amount,
      upsertedAt: new Date().toISOString(),
    },
  }])

  logger.debug(`[Pinecone] Dispute vector upserted  id="${vectorId}"`)
  return { vectorId, stub: false }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMILARITY SEARCH  (Phase 3 placeholder)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * querySimilarTransactions
 * Find the K most similar transactions to a given vector.
 * Used by the fraud-detection engine to surface pattern matches.
 *
 * Phase 3 TODO: replace stub with real Pinecone query
 *
 * @param {number[]} queryVector  - 768-dim float array
 * @param {number}   topK         - number of results (default 10)
 * @param {object}   [filter]     - Pinecone metadata filter
 * @returns {Promise<Array<{ id, score, metadata }>>}
 */
export async function querySimilarTransactions(queryVector, topK = 10, filter = {}) {
  if (!_isReady) {
    logger.debug('[Pinecone] querySimilarTransactions() stub — returning []')
    return []
  }

  requireReady('querySimilarTransactions')

  const namespace = _index.namespace(NAMESPACES.TRANSACTIONS)
  const results   = await namespace.query({
    vector:          queryVector,
    topK,
    filter:          Object.keys(filter).length ? filter : undefined,
    includeMetadata: true,
  })

  return results.matches ?? []
}

/**
 * querySimilarDisputes
 * Find historically similar disputes — used to inform Gemini arbitration.
 * Phase 3 TODO: replace stub with real query.
 */
export async function querySimilarDisputes(queryVector, topK = 5) {
  if (!_isReady) {
    logger.debug('[Pinecone] querySimilarDisputes() stub — returning []')
    return []
  }

  requireReady('querySimilarDisputes')

  const namespace = _index.namespace(NAMESPACES.DISPUTES)
  const results   = await namespace.query({
    vector:          queryVector,
    topK,
    includeMetadata: true,
  })

  return results.matches ?? []
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Remove a transaction vector (e.g. when a transaction is hard-deleted) */
export async function deleteTransactionVector(txId) {
  if (!_isReady) return
  await _index.namespace(NAMESPACES.TRANSACTIONS).deleteOne(`tx_${txId}`)
  logger.debug(`[Pinecone] Deleted transaction vector  id="tx_${txId}"`)
}

/** Remove a merchant vector */
export async function deleteMerchantVector(merchantId) {
  if (!_isReady) return
  await _index.namespace(NAMESPACES.MERCHANTS).deleteOne(`merchant_${merchantId}`)
  logger.debug(`[Pinecone] Deleted merchant vector  id="merchant_${merchantId}"`)
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 3 HELPER STUBS  (documented for implementers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * buildTransactionText
 * Converts a transaction object into a rich natural-language string for embedding.
 * Phase 3 TODO: tune this text for best semantic coverage.
 *
 * @param {object} tx
 * @returns {string}
 */
export function buildTransactionText(tx) {
  return [
    `Transaction ${tx.txId}`,
    `Amount: ${tx.amount} ${tx.currency}`,
    `Status: ${tx.status}`,
    `Merchant wallet: ${tx.merchantWallet}`,
    `Buyer wallet: ${tx.fromWallet}`,
    `Escrow: ${tx.isEscrow ? 'yes' : 'no'}`,
    tx.note ? `Note: ${tx.note}` : '',
  ].filter(Boolean).join('. ')
}

/**
 * generateEmbedding  (Phase 3 placeholder)
 * Wraps the Google Generative AI embedding call.
 * Phase 3 TODO: call this from upsert functions above.
 *
 * @param {string} text
 * @returns {Promise<number[]>}  768-dim float array
 */
export async function generateEmbedding(text) {
  // Phase 3 TODO:
  //   import { GoogleGenerativeAI } from '@google/generative-ai'
  //   const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY)
  //   const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
  //   const result = await model.embedContent(text)
  //   return result.embedding.values

  logger.debug('[Pinecone] generateEmbedding() — Phase 3 stub, returning zero vector')
  return new Array(ENV.PINECONE_DIMENSION).fill(0)
}
