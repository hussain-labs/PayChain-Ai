// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Gemini 3 Intelligence Service  (Phase 2)
//
// Responsibilities (Phase 2 — live):
//   • Initialise the Gemini Flash client at boot
//   • generateStatusReport()  — POST /api/v1/ai/status-report
//   • generateWelcomeMessage() — called during merchant onboarding
//
// Responsibilities (Phase 3 — stubs with full prompt scaffolding):
//   • assessTransactionRisk()  — fraud scoring per transaction
//   • assessDisputeArbitration() — dispute verdict + XAI summary
//   • computeTrustScore()      — merchant trust computation
//   • generateXAIReport()      — explainable AI risk breakdown
//
// Safety config:
//   All requests use BLOCK_MEDIUM_AND_ABOVE harm thresholds so the model
//   refuses to generate harmful financial advice or manipulative content.
// ─────────────────────────────────────────────────────────────────────────────
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold }
  from '@google/generative-ai'
import { ENV }    from '../config/env.js'
import logger     from '../utils/logger.js'

// ── Singleton state ───────────────────────────────────────────────────────────
/** @type {GoogleGenerativeAI | null} */
let _genAI    = null

/** @type {import('@google/generative-ai').GenerativeModel | null} */
let _model    = null

let _isReady  = false

// ── Safety thresholds (applied to every request) ─────────────────────────────
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
]

// ── Generation config defaults ────────────────────────────────────────────────
const DEFAULT_GENERATION_CONFIG = {
  temperature:     0.4,   // balanced between creative and deterministic
  topP:            0.8,
  topK:            40,
  maxOutputTokens: 1024,
}

// ── System instruction applied to every request ───────────────────────────────
const SYSTEM_INSTRUCTION = `You are PayChain AI, an expert financial intelligence assistant \
embedded inside a decentralised merchant payment platform. Your role is to provide concise, \
professional, and data-driven insights to merchants about their payment activity, risk exposure, \
and blockchain transaction health. Always:
- Respond in plain English suitable for a business audience
- Be specific — reference actual figures from the data provided
- Keep responses under 200 words unless a detailed report is explicitly requested
- Never fabricate transaction data — if data is missing say so clearly
- Format currency values with two decimal places and the currency symbol/code`

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISE
// Called once at server boot from server.js
// ─────────────────────────────────────────────────────────────────────────────
export async function initialiseGemini() {
  try {
    logger.info(`[Gemini] Initialising model="${ENV.GEMINI_MODEL}"…`)

    _genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY)

    _model = _genAI.getGenerativeModel({
      model:            ENV.GEMINI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      safetySettings:    SAFETY_SETTINGS,
      generationConfig:  DEFAULT_GENERATION_CONFIG,
    })

    // ── Warm-up ping ─────────────────────────────────────────────────────────
    // Sends a trivial request to confirm the API key is valid and the model
    // is reachable before the server starts accepting traffic.
    const warmup = await _model.generateContent(
      'Respond with exactly: "PayChain AI ready."'
    )
    const warmupText = warmup.response.text().trim()
    logger.info(`[Gemini] ✓ Warm-up OK  response="${warmupText}"`)

    _isReady = true
  } catch (err) {
    // Non-fatal in Phase 2 dev — server boots, AI endpoints return 503
    logger.warn(`[Gemini] ⚠ Initialisation skipped: ${err.message}`)
    logger.warn('[Gemini]   Set GEMINI_API_KEY in .env to enable AI features.')
    _isReady = false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS
// ─────────────────────────────────────────────────────────────────────────────
export function getGeminiStatus() {
  return {
    isReady:    _isReady,
    model:      ENV.GEMINI_MODEL,
    phase2Live: ['status-report', 'welcome-message'],
    phase3Todo: ['assessTransactionRisk', 'assessDisputeArbitration', 'computeTrustScore', 'generateXAIReport'],
  }
}

// ── Guard ────────────────────────────────────────────────────────────────────
function requireGeminiReady(fnName) {
  if (!_isReady || !_model) {
    const err = new Error(`Gemini AI is not available. Check GEMINI_API_KEY.`)
    err.status = 503
    err.code   = 'AI_UNAVAILABLE'
    throw err
  }
}

// ── Raw call with error normalisation ─────────────────────────────────────────
async function callGemini(prompt, configOverrides = {}) {
  requireGeminiReady('callGemini')

  const result = await _model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { ...DEFAULT_GENERATION_CONFIG, ...configOverrides },
  })

  const response = result.response
  const text     = response.text()

  if (!text) {
    const blockReason = response.promptFeedback?.blockReason
    throw Object.assign(
      new Error(`Gemini returned empty response${blockReason ? ` (blocked: ${blockReason})` : ''}`),
      { status: 502, code: 'AI_EMPTY_RESPONSE' }
    )
  }

  return {
    text,
    usageMetadata:  response.usageMetadata ?? null,
    finishReason:   response.candidates?.[0]?.finishReason ?? null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PHASE 2 LIVE FEATURES ──────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * generateStatusReport
 * POST /api/v1/ai/status-report
 *
 * Generates a personalised natural-language system status / welcome message
 * for a merchant based on their current profile and recent activity metrics.
 *
 * @param {object} merchantProfile
 * @param {string} merchantProfile.businessName
 * @param {string} merchantProfile.walletAddress
 * @param {string} [merchantProfile.plan]
 * @param {object} [merchantProfile.metrics]
 * @param {number|null} [merchantProfile.trustScore]
 * @param {string} [merchantProfile.joinedDate]
 * @returns {Promise<{ report: string, usageMetadata: object|null }>}
 */
export async function generateStatusReport(merchantProfile) {
  const {
    businessName,
    walletAddress,
    plan           = 'Free',
    metrics        = {},
    trustScore     = null,
    joinedDate     = null,
  } = merchantProfile

  const metricsBlock = metrics ? `
- Total Revenue:      ${metrics.totalRevenue        ?? 0} USDC
- Total Transactions: ${metrics.totalTransactions   ?? 0}
- Active Escrows:     ${metrics.activeEscrows       ?? 0}
- Pending Settlements:${metrics.pendingSettlements  ?? 0} USDC
- Open Disputes:      ${metrics.disputeCount        ?? 0}`.trim() : 'No metrics available yet.'

  const trustBlock = trustScore !== null
    ? `AI Trust Score: ${trustScore}/100`
    : 'AI Trust Score: Not yet calculated (Phase 3 feature)'

  const prompt = `
Generate a concise, professional "System Status Report" for the following PayChain AI merchant.
The report should feel like a smart dashboard greeting — insightful, warm, and data-driven.
Include 2–3 specific observations about their current account state and one forward-looking suggestion.
Keep it under 150 words.

MERCHANT PROFILE:
- Business Name: ${businessName}
- Wallet: ${walletAddress}
- Plan: ${plan}
- Member Since: ${joinedDate ?? 'Unknown'}
- ${trustBlock}

CURRENT METRICS:
${metricsBlock}

INSTRUCTIONS:
- Address the merchant by their business name
- Highlight any metrics that stand out (positive or negative)
- If disputes > 0, mention it tactfully
- End with one actionable recommendation
- Do NOT use markdown headers or bullet points in the response — plain paragraph text only
`.trim()

  logger.info(`[Gemini] generateStatusReport  merchant="${businessName}"`)

  const result = await callGemini(prompt, {
    temperature:     0.5,
    maxOutputTokens: 300,
  })

  logger.debug(`[Gemini] Status report generated  tokens=${JSON.stringify(result.usageMetadata)}`)

  return {
    report:        result.text,
    usageMetadata: result.usageMetadata,
    model:         ENV.GEMINI_MODEL,
    generatedAt:   new Date().toISOString(),
  }
}

/**
 * generateWelcomeMessage
 * Called by merchantController.onboard() after a new merchant registers.
 * Returns a short personalised onboarding welcome.
 *
 * @param {object} params
 * @param {string} params.businessName
 * @param {string} params.plan
 * @param {string} params.walletAddress
 * @returns {Promise<{ message: string }>}
 */
export async function generateWelcomeMessage({ businessName, plan, walletAddress }) {
  const prompt = `
Write a short, enthusiastic onboarding welcome message (max 80 words) for a new merchant
who has just connected their wallet to PayChain AI — a decentralised payment intelligence platform.

Merchant details:
- Business: ${businessName}
- Plan:     ${plan}
- Wallet:   ${walletAddress}

Mention: wallet connected, escrow protection available, AI features coming soon.
Tone: professional, optimistic, modern fintech.
Plain text only — no markdown.
`.trim()

  logger.info(`[Gemini] generateWelcomeMessage  merchant="${businessName}"`)

  const result = await callGemini(prompt, {
    temperature:     0.7,
    maxOutputTokens: 150,
  })

  return {
    message:     result.text,
    generatedAt: new Date().toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── PHASE 3 STUBS — fully scaffolded, prompt-ready ────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * assessTransactionRisk
 * Analyses a single transaction for fraud signals and returns a structured
 * risk assessment. Phase 3: called by transactionController.create() after save.
 *
 * @param {object} transaction  - Transaction document (plain object)
 * @param {object} [context]    - Optional: similar transactions from Pinecone
 * @returns {Promise<{
 *   riskScore:   number,        // 0–100
 *   riskLevel:   string,        // 'Low' | 'Medium' | 'High' | 'Critical'
 *   fraudFlags:  string[],
 *   explanation: string,        // XAI natural language
 *   confidence:  number,        // 0–100
 * }>}
 *
 * Phase 3 TODO: uncomment the block below and call from transactionController
 */
export async function assessTransactionRisk(transaction, context = []) {
  /* ── Phase 3 implementation ─────────────────────────────────────────────
  const similarTxsBlock = context.length
    ? `Similar historical transactions:\n${context.map(c =>
        `  - ${c.metadata.txId}: ${c.metadata.amount} ${c.metadata.currency}, ` +
        `status=${c.metadata.status}, similarity=${(c.score * 100).toFixed(1)}%`
      ).join('\n')}`
    : 'No similar transactions found in vector database.'

  const prompt = `
You are a financial fraud detection AI. Analyse this blockchain transaction and return a JSON risk assessment.

TRANSACTION:
- ID:       ${transaction.txId}
- Amount:   ${transaction.amount} ${transaction.currency}
- From:     ${transaction.fromWallet}
- Merchant: ${transaction.merchantWallet}
- Status:   ${transaction.status}
- Escrow:   ${transaction.isEscrow}
- Time:     ${transaction.createdAt}

${similarTxsBlock}

Return ONLY valid JSON with this exact shape:
{
  "riskScore":   <0-100>,
  "riskLevel":   "<Low|Medium|High|Critical>",
  "fraudFlags":  ["<flag1>", "<flag2>"],
  "explanation": "<1-2 sentence XAI explanation>",
  "confidence":  <0-100>
}
`.trim()

  const result = await callGemini(prompt, { temperature: 0.2, maxOutputTokens: 512 })
  return JSON.parse(result.text)
  ── end Phase 3 ─────────────────────────────────────────────────────────── */

  logger.debug(`[Gemini] assessTransactionRisk() stub  txId="${transaction.txId}"`)
  return {
    riskScore:   null,
    riskLevel:   null,
    fraudFlags:  [],
    explanation: null,
    confidence:  null,
    stub:        true,
  }
}

/**
 * assessDisputeArbitration
 * Evaluates a dispute and recommends a resolution verdict.
 * Phase 3: called by disputeController.requestAiVerdict().
 *
 * @param {object} dispute      - Dispute document
 * @param {object} transaction  - Associated Transaction document
 * @param {object[]} [similar]  - Similar disputes from Pinecone
 * @returns {Promise<{
 *   recommendedVerdict: string,
 *   confidence:         number,
 *   riskLevel:          string,
 *   summary:            string,
 *   keyFactors:         string[],
 * }>}
 */
export async function assessDisputeArbitration(dispute, transaction, similar = []) {
  /* ── Phase 3 implementation ─────────────────────────────────────────────
  const prompt = `...` — see Phase 3 implementation guide in README
  ── end Phase 3 ─────────────────────────────────────────────────────────── */

  logger.debug(`[Gemini] assessDisputeArbitration() stub  disputeId="${dispute.disputeId}"`)
  return {
    recommendedVerdict: null,
    confidence:         null,
    riskLevel:          null,
    summary:            null,
    keyFactors:         [],
    stub:               true,
  }
}

/**
 * computeTrustScore
 * Computes an AI-driven trust score (0–100) for a merchant based on their
 * full transaction and dispute history.
 * Phase 3: called by a scheduled job (every 24 h) or on merchant profile load.
 *
 * @param {object} merchant    - Merchant document
 * @param {object[]} recentTxs - Last 90 days of transactions
 * @param {object[]} disputes  - All disputes for the merchant
 * @returns {Promise<{ score: number, label: string, reasoning: string }>}
 */
export async function computeTrustScore(merchant, recentTxs = [], disputes = []) {
  /* ── Phase 3 implementation ─────────────────────────────────────────────
  const prompt = `...` — see Phase 3 implementation guide in README
  ── end Phase 3 ─────────────────────────────────────────────────────────── */

  logger.debug(`[Gemini] computeTrustScore() stub  merchantId="${merchant.merchantId}"`)
  return {
    score:     null,
    label:     null,
    reasoning: null,
    stub:      true,
  }
}

/**
 * generateXAIReport
 * Produces a detailed, human-readable Explainable AI risk report for a
 * specific transaction — explaining every factor that influenced the risk score.
 * Phase 3: surfaced by the "View Intelligence" button in the UI.
 *
 * @param {object} transaction
 * @param {object} riskAssessment   - From assessTransactionRisk()
 * @returns {Promise<{ report: string, factors: object[] }>}
 */
export async function generateXAIReport(transaction, riskAssessment) {
  /* ── Phase 3 implementation ─────────────────────────────────────────────
  const prompt = `...` — see Phase 3 implementation guide in README
  ── end Phase 3 ─────────────────────────────────────────────────────────── */

  logger.debug(`[Gemini] generateXAIReport() stub  txId="${transaction.txId}"`)
  return {
    report:  null,
    factors: [],
    stub:    true,
  }
}
