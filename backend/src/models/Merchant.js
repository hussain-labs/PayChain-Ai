// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Merchant Model
//
// Core merchant identity document. Stores everything the Phase 1 UI needs
// (businessName, walletAddress, plan, joinedDate) plus all Phase 3/4 fields
// that are seeded as null stubs so the schema never needs a migration.
//
// Phase 3: trustScore populated by TrustScoreOracle contract read
// Phase 4: did verified via DID resolver, pineconeEmbeddingId linked
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose'

const { Schema, model } = mongoose

// ── Sub-schemas ───────────────────────────────────────────────────────────────

/** Blockchain-related identifiers for a merchant */
const BlockchainIdentitySchema = new Schema({
  /** Primary EVM wallet  (normalised to lowercase) */
  walletAddress: {
    type:      String,
    required:  [true, 'walletAddress is required'],
    unique:    true,
    lowercase: true,
    trim:      true,
    match:     [/^0x[0-9a-f]{40}$/, 'walletAddress must be a valid EVM address'],
    index:     true,
  },
  /** Decentralised Identity — e.g. did:ethr:0x… or did:pkh:eip155:1:0x… */
  did: {
    type:    String,
    default: null,
    trim:    true,
    validate: {
      validator: v => v === null || v.startsWith('did:'),
      message:   'DID must start with "did:"',
    },
  },
  /** Chain ID where the merchant is primarily registered */
  chainId: {
    type:    Number,
    default: 11155111,   // Sepolia — matches Phase 1 DEFAULT_CHAIN_ID
  },
}, { _id: false })

/** AI-generated intelligence fields — all null until Phase 3/4 */
const IntelligenceSchema = new Schema({
  /**
   * AI Trust Score  0–100
   * HIGH ≥ 80 | MEDIUM ≥ 50 | LOW < 50
   * Phase 3: written by the Gemini trust-scoring job
   */
  trustScore: {
    type:    Number,
    default: null,
    min:     [0,   'trustScore cannot be negative'],
    max:     [100, 'trustScore cannot exceed 100'],
  },
  trustScoreLabel: {
    type:    String,
    enum:    ['High', 'Medium', 'Low', null],
    default: null,
  },
  trustScoreUpdatedAt: {
    type:    Date,
    default: null,
  },
  /**
   * Pinecone vector ID for this merchant's aggregate embedding
   * Phase 4: populated by pineconeService.upsertMerchantEmbedding()
   */
  pineconeEmbeddingId: {
    type:    String,
    default: null,
  },
  /**
   * Fraud risk level from the last AI scan
   * Phase 3: written by the Gemini fraud-detection job
   */
  fraudRiskLevel: {
    type:    String,
    enum:    ['Low', 'Medium', 'High', 'Critical', null],
    default: null,
  },
  lastAiScanAt: {
    type:    Date,
    default: null,
  },
}, { _id: false })

/** Aggregated payment statistics — updated by transactionController on write */
const MetricsSchema = new Schema({
  totalRevenue:        { type: Number, default: 0 },
  totalTransactions:   { type: Number, default: 0 },
  activeEscrows:       { type: Number, default: 0 },
  pendingSettlements:  { type: Number, default: 0 },
  disputeCount:        { type: Number, default: 0 },
  currency:            { type: String, default: 'USDC' },
  lastActivityAt:      { type: Date,   default: null },
}, { _id: false })

// ── Main Merchant Schema ──────────────────────────────────────────────────────
const MerchantSchema = new Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────────────
    /** Short deterministic ID matching Phase 1 mock: "merchant_0x8f3a" */
    merchantId: {
      type:    String,
      unique:  true,
      index:   true,
    },

    businessName: {
      type:      String,
      required:  [true, 'businessName is required'],
      trim:      true,
      minlength: [2,   'businessName must be at least 2 characters'],
      maxlength: [120, 'businessName cannot exceed 120 characters'],
    },

    email: {
      type:      String,
      default:   null,
      lowercase: true,
      trim:      true,
      match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },

    plan: {
      type:    String,
      enum:    ['Free', 'Pro', 'Enterprise'],
      default: 'Free',
    },

    isActive: {
      type:    Boolean,
      default: true,
    },

    // ── Blockchain ────────────────────────────────────────────────────────────
    blockchain: {
      type:    BlockchainIdentitySchema,
      required: true,
    },

    // ── AI Intelligence (Phase 3/4 stubs) ────────────────────────────────────
    intelligence: {
      type:    IntelligenceSchema,
      default: () => ({}),
    },

    // ── Metrics (denormalised for fast dashboard reads) ───────────────────────
    metrics: {
      type:    MetricsSchema,
      default: () => ({}),
    },

    // ── Notification settings ─────────────────────────────────────────────────
    notifications: {
      transactions: { type: Boolean, default: true  },
      escrows:      { type: Boolean, default: true  },
      disputes:     { type: Boolean, default: true  },
      fraudAlerts:  { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: false },
    },

    // ── Soft delete ───────────────────────────────────────────────────────────
    deletedAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps:  true,              // createdAt + updatedAt auto-managed
    collection:  'merchants',
    versionKey:  '__v',
  }
)

// ── Indexes ───────────────────────────────────────────────────────────────────
MerchantSchema.index({ 'blockchain.walletAddress': 1 }, { unique: true })
MerchantSchema.index({ 'blockchain.did': 1 },           { sparse: true })
MerchantSchema.index({ businessName: 'text' })          // full-text search
MerchantSchema.index({ createdAt: -1 })
MerchantSchema.index({ 'intelligence.trustScore': -1 })

// ── Pre-save hook: auto-generate merchantId ───────────────────────────────────
MerchantSchema.pre('save', function (next) {
  if (!this.merchantId && this.blockchain?.walletAddress) {
    const addr = this.blockchain.walletAddress.toLowerCase()
    this.merchantId = `merchant_${addr.slice(0, 6)}`
  }
  next()
})

// ── Instance methods ──────────────────────────────────────────────────────────

/** Returns the Phase 1-compatible dashboard profile shape */
MerchantSchema.methods.toDashboardProfile = function () {
  return {
    id:           this.merchantId,
    name:         this.businessName,
    wallet:       this.blockchain.walletAddress,
    did:          this.blockchain.did,
    joinedDate:   this.createdAt?.toISOString().split('T')[0],
    plan:         this.plan,
    trustScore:   this.intelligence.trustScore,       // null in Phase 2
    trustScoreLabel: this.intelligence.trustScoreLabel,
    metrics:      this.metrics,
    isActive:     this.isActive,
  }
}

/** Returns the trust score tier string, consistent with frontend TRUST_SCORE constants */
MerchantSchema.methods.getTrustTier = function () {
  const score = this.intelligence.trustScore
  if (score === null) return null
  if (score >= 80) return 'High'
  if (score >= 50) return 'Medium'
  return 'Low'
}

// ── Static methods ────────────────────────────────────────────────────────────

/** Find by wallet address (case-insensitive) */
MerchantSchema.statics.findByWallet = function (address) {
  return this.findOne({
    'blockchain.walletAddress': address.toLowerCase(),
    deletedAt: null,
  })
}

/** Soft-delete a merchant */
MerchantSchema.statics.softDelete = function (walletAddress) {
  return this.findOneAndUpdate(
    { 'blockchain.walletAddress': walletAddress.toLowerCase() },
    { deletedAt: new Date(), isActive: false },
    { new: true }
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export const Merchant = model('Merchant', MerchantSchema)
export default Merchant
