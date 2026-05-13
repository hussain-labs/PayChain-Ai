// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Dispute Model
//
// Mirrors Phase 1 MOCK_DISPUTES fields plus full Phase 3/4 AI-arbitration
// stubs. Every AI field is null until Gemini arbitration is wired in.
//
// Phase 3: aiRisk, aiVerdict, aiSummary populated by Gemini dispute endpoint
// Phase 4: onChainArbitrationId written by DisputeArbiter.sol event listener
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose'

const { Schema, model } = mongoose

// ── Dispute status lifecycle ──────────────────────────────────────────────────
export const DISPUTE_STATUSES = [
  'Open',           // buyer opened the dispute
  'Under Review',   // merchant or arbiter reviewing
  'Awaiting AI',    // queued for Gemini arbitration (Phase 3)
  'AI Assessed',    // Gemini has returned a verdict
  'Resolved',       // settled in favour of buyer or seller
  'Rejected',       // dismissed as invalid
  'Escalated',      // sent to human arbitration
  'Closed',         // final — no further action
]

export const DISPUTE_RESOLUTIONS = [
  'Refunded',       // buyer refunded
  'Released',       // payment released to merchant
  'Partial',        // partial refund
  'Dismissed',      // no action
  null,             // unresolved
]

// ── Evidence sub-schema ───────────────────────────────────────────────────────
const EvidenceSchema = new Schema({
  submittedBy:  { type: String, enum: ['buyer', 'merchant', 'arbiter'] },
  description:  { type: String, maxlength: 2000 },
  attachments:  { type: [String], default: [] },  // URLs / IPFS CIDs
  submittedAt:  { type: Date, default: Date.now },
}, { _id: false })

// ── AI Arbitration sub-schema (Phase 3 stubs) ────────────────────────────────
const AiArbitrationSchema = new Schema({
  /**
   * Risk level assigned by Gemini
   * Phase 3: populated by geminiService.assessDispute()
   */
  riskLevel: {
    type:    String,
    enum:    ['Low', 'Medium', 'High', 'Critical', null],
    default: null,
  },
  /** 0–100 confidence score for the AI verdict */
  confidence: {
    type:    Number,
    default: null,
    min:     0,
    max:     100,
  },
  /** Gemini's recommended verdict */
  recommendedVerdict: {
    type:    String,
    enum:    [...DISPUTE_RESOLUTIONS, 'Escalate'],
    default: null,
  },
  /** Natural-language explanation (XAI) */
  summary: {
    type:    String,
    default: null,
    maxlength: 3000,
  },
  /** Key factors that influenced the AI decision */
  keyFactors: {
    type:    [String],
    default: [],
  },
  assessedAt: {
    type:    Date,
    default: null,
  },
  /** Pinecone vector ID for the dispute embedding */
  pineconeVectorId: {
    type:    String,
    default: null,
  },
}, { _id: false })

// ── Status history sub-schema ─────────────────────────────────────────────────
const StatusEventSchema = new Schema({
  status:    { type: String, enum: DISPUTE_STATUSES },
  actor:     { type: String, default: 'system' },     // wallet or 'system'/'ai'
  note:      { type: String, default: null },
  timestamp: { type: Date,   default: Date.now },
}, { _id: false })

// ── Main Dispute Schema ───────────────────────────────────────────────────────
const DisputeSchema = new Schema(
  {
    // ── Reference ID (matches Phase 1 format: DISP-001) ──────────────────────
    disputeId: {
      type:   String,
      unique: true,
      index:  true,
    },

    // ── References ────────────────────────────────────────────────────────────
    /** MongoDB ObjectId of the disputed Transaction document */
    transaction: {
      type:     Schema.Types.ObjectId,
      ref:      'Transaction',
      required: [true, 'transaction reference is required'],
      index:    true,
    },

    /** PayChain txId string for quick display (denormalised) */
    txId: {
      type:  String,
      index: true,
    },

    // ── Parties ───────────────────────────────────────────────────────────────
    merchantWallet: {
      type:      String,
      required:  [true, 'merchantWallet is required'],
      lowercase: true,
      trim:      true,
      index:     true,
    },

    buyerWallet: {
      type:      String,
      required:  [true, 'buyerWallet is required'],
      lowercase: true,
      trim:      true,
    },

    // ── Dispute details ───────────────────────────────────────────────────────
    reason: {
      type:      String,
      required:  [true, 'reason is required'],
      trim:      true,
      minlength: [10,  'reason must be at least 10 characters'],
      maxlength: [500, 'reason cannot exceed 500 characters'],
    },

    amount: {
      type:    Number,
      default: null,
    },

    currency: {
      type:    String,
      default: 'USDC',
    },

    status: {
      type:    String,
      enum:    DISPUTE_STATUSES,
      default: 'Open',
      index:   true,
    },

    statusHistory: [StatusEventSchema],

    resolution: {
      type:    String,
      enum:    DISPUTE_RESOLUTIONS,
      default: null,
    },

    resolvedAt: {
      type:    Date,
      default: null,
    },

    /** Due date for merchant response (default: 7 days from opening) */
    dueDate: {
      type:    Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },

    // ── Evidence ──────────────────────────────────────────────────────────────
    evidence: [EvidenceSchema],

    // ── AI Arbitration (Phase 3 stubs) ────────────────────────────────────────
    aiArbitration: {
      type:    AiArbitrationSchema,
      default: () => ({}),
    },

    // ── On-chain (Phase 4 stubs) ──────────────────────────────────────────────
    /** DisputeArbiter.sol arbitration ID (uint256 as string) */
    onChainArbitrationId: {
      type:    String,
      default: null,
    },

    arbitrationContractAddress: {
      type:    String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'disputes',
    versionKey: '__v',
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────
DisputeSchema.index({ merchantWallet: 1, status: 1 })
DisputeSchema.index({ merchantWallet: 1, createdAt: -1 })
DisputeSchema.index({ buyerWallet: 1 })
DisputeSchema.index({ dueDate: 1, status: 1 })                     // overdue query
DisputeSchema.index({ 'aiArbitration.riskLevel': 1 }, { sparse: true })

// ── Pre-save: generate disputeId + append status history ─────────────────────
let _dispCounter = 1

DisputeSchema.pre('save', async function (next) {
  if (!this.disputeId) {
    const count = await mongoose.model('Dispute').countDocuments() + _dispCounter++
    this.disputeId = `DISP-${String(count).padStart(3, '0')}`
  }
  if (this.isModified('status')) {
    this.statusHistory.push({
      status:    this.status,
      timestamp: new Date(),
      actor:     'system',
    })
  }
  next()
})

// ── Instance methods ──────────────────────────────────────────────────────────

/** Returns Phase 1-compatible dispute card shape */
DisputeSchema.methods.toDashboardCard = function () {
  const daysLeft = Math.max(0,
    Math.round((this.dueDate - new Date()) / (1000 * 60 * 60 * 24))
  )
  return {
    id:          this.disputeId,
    txId:        this.txId,
    amount:      this.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) ?? '—',
    currency:    this.currency,
    buyer:       `${this.buyerWallet.slice(0, 6)}…${this.buyerWallet.slice(-4)}`,
    reason:      this.reason,
    status:      this.status,
    openedDate:  this.createdAt?.toISOString().split('T')[0],
    dueDate:     this.dueDate?.toISOString().split('T')[0],
    daysLeft,
    aiRisk:      this.aiArbitration?.riskLevel ?? null,
    resolution:  this.resolution,
  }
}

/** Check if past due */
DisputeSchema.methods.isOverdue = function () {
  return this.dueDate < new Date() &&
    !['Resolved', 'Rejected', 'Closed'].includes(this.status)
}

// ── Static methods ─────────────────────────────────────────────────────────────

/** All open disputes for a merchant, sorted by due date ascending */
DisputeSchema.statics.activeForMerchant = function (walletAddress) {
  return this.find({
    merchantWallet: walletAddress.toLowerCase(),
    status: { $nin: ['Resolved', 'Rejected', 'Closed'] },
  })
    .sort({ dueDate: 1 })
    .populate('transaction', 'txId txHash amount currency')
    .lean()
}

// ─────────────────────────────────────────────────────────────────────────────
export const Dispute = model('Dispute', DisputeSchema)
export default Dispute
