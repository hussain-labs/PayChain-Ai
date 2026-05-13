// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Transaction Model
//
// Mirrors every field from Phase 1 MOCK_TRANSACTIONS plus live blockchain
// and AI fields that are null-stubbed for Phase 3/4.
//
// Phase 3: riskScore + fraudFlags populated by Gemini fraud-detection
// Phase 4: escrowContractAddress populated by EscrowManager.sol
// ─────────────────────────────────────────────────────────────────────────────
import mongoose from 'mongoose'

const { Schema, model } = mongoose

// ── Valid status values — mirrors frontend TX_STATUS constants ─────────────────
export const TX_STATUSES = ['Pending', 'Success', 'Failed', 'Escrowed', 'Disputed', 'Refunded']
export const CURRENCIES   = ['USDC', 'USDT', 'ETH', 'MATIC']

// ── AI Risk Assessment sub-schema ─────────────────────────────────────────────
const RiskAssessmentSchema = new Schema({
  /**
   * 0–100 risk score (higher = riskier)
   * Phase 3: calculated by Gemini fraud-detection endpoint
   */
  score: {
    type:    Number,
    default: null,
    min:     0,
    max:     100,
  },
  level: {
    type:    String,
    enum:    ['Low', 'Medium', 'High', 'Critical', null],
    default: null,
  },
  /** Specific fraud signals identified by the AI */
  fraudFlags: {
    type:    [String],
    default: [],
  },
  /** Gemini natural-language explanation of the risk (XAI) */
  explanation: {
    type:    String,
    default: null,
    maxlength: 2000,
  },
  assessedAt: {
    type:    Date,
    default: null,
  },
  /** ID of the Pinecone vector for this transaction's embedding */
  pineconeVectorId: {
    type:    String,
    default: null,
  },
}, { _id: false })

// ── Escrow details sub-schema ─────────────────────────────────────────────────
const EscrowDetailsSchema = new Schema({
  /** Address of the deployed EscrowManager.sol instance */
  contractAddress: {
    type:    String,
    default: null,
    lowercase: true,
    match:   [/^0x[0-9a-f]{40}$|^null$/, 'contractAddress must be a valid EVM address'],
  },
  /** On-chain escrow ID (uint256 as string to avoid JS BigInt issues) */
  escrowId: {
    type:    String,
    default: null,
  },
  releaseDate: {
    type:    Date,
    default: null,
  },
  releasedAt: {
    type:    Date,
    default: null,
  },
}, { _id: false })

// ── Main Transaction Schema ───────────────────────────────────────────────────
const TransactionSchema = new Schema(
  {
    // ── PayChain reference ID (matches Phase 1 mock format: TX-2024-001) ──────
    txId: {
      type:    String,
      unique:  true,
      index:   true,
    },

    // ── Blockchain data ───────────────────────────────────────────────────────
    /** On-chain transaction hash (0x + 64 hex chars) */
    txHash: {
      type:    String,
      default: null,
      trim:    true,
      match:   [/^0x[0-9a-fA-F]{64}$|^$/, 'Invalid transaction hash'],
      index:   true,
      sparse:  true,
    },

    chainId: {
      type:    Number,
      default: 11155111,
    },

    blockNumber: {
      type:    Number,
      default: null,
    },

    // ── Wallets ───────────────────────────────────────────────────────────────
    /** Merchant receiving the payment (FK: Merchant.blockchain.walletAddress) */
    merchantWallet: {
      type:      String,
      required:  [true, 'merchantWallet is required'],
      lowercase: true,
      trim:      true,
      match:     [/^0x[0-9a-f]{40}$/, 'Invalid merchantWallet address'],
      index:     true,
    },

    /** Buyer / sender wallet */
    fromWallet: {
      type:      String,
      required:  [true, 'fromWallet is required'],
      lowercase: true,
      trim:      true,
      match:     [/^0x[0-9a-f]{40}$/, 'Invalid fromWallet address'],
    },

    // ── Payment details ───────────────────────────────────────────────────────
    amount: {
      type:     Number,
      required: [true, 'amount is required'],
      min:      [0.000001, 'amount must be positive'],
    },

    currency: {
      type:    String,
      enum:    CURRENCIES,
      default: 'USDC',
    },

    status: {
      type:    String,
      enum:    TX_STATUSES,
      default: 'Pending',
      index:   true,
    },

    statusHistory: [{
      status:    { type: String, enum: TX_STATUSES },
      timestamp: { type: Date,   default: Date.now },
      note:      { type: String, default: null },
      _id:       false,
    }],

    // ── Escrow ────────────────────────────────────────────────────────────────
    isEscrow: {
      type:    Boolean,
      default: false,
      index:   true,
    },

    escrow: {
      type:    EscrowDetailsSchema,
      default: () => ({}),
    },

    // ── AI Intelligence (Phase 3 stubs) ───────────────────────────────────────
    riskAssessment: {
      type:    RiskAssessmentSchema,
      default: () => ({}),
    },

    // ── Metadata ──────────────────────────────────────────────────────────────
    note: {
      type:      String,
      default:   null,
      maxlength: 500,
    },

    /** IP address of the request that created this transaction */
    ipAddress: {
      type:    String,
      default: null,
    },

    processedAt: {
      type:    Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'transactions',
    versionKey: '__v',
  }
)

// ── Compound indexes ───────────────────────────────────────────────────────────
TransactionSchema.index({ merchantWallet: 1, createdAt: -1 })
TransactionSchema.index({ merchantWallet: 1, status: 1 })
TransactionSchema.index({ fromWallet: 1,     createdAt: -1 })
TransactionSchema.index({ isEscrow: 1,       status: 1 })
TransactionSchema.index({ createdAt: -1 })
TransactionSchema.index({ 'riskAssessment.level': 1 }, { sparse: true })

// ── Pre-save: auto-generate txId ──────────────────────────────────────────────
let _txCounter = 1

TransactionSchema.pre('save', async function (next) {
  if (!this.txId) {
    const year  = new Date().getFullYear()
    const count = await mongoose.model('Transaction').countDocuments() + _txCounter++
    this.txId = `TX-${year}-${String(count).padStart(3, '0')}`
  }
  // Append to status history on status change
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() })
  }
  next()
})

// ── Instance methods ──────────────────────────────────────────────────────────

/** Returns Phase 1-compatible dashboard row shape */
TransactionSchema.methods.toDashboardRow = function () {
  const d = new Date(this.createdAt)
  return {
    id:        this.txId,
    txHash:    this.txHash ?? '—',
    date:      d.toISOString().split('T')[0],
    time:      d.toTimeString().split(' ')[0],
    from:      `${this.fromWallet.slice(0, 6)}…${this.fromWallet.slice(-4)}`,
    amount:    this.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    currency:  this.currency,
    status:    this.status,
    escrow:    this.isEscrow,
    riskScore: this.riskAssessment?.score ?? null,
  }
}

// ── Static methods ─────────────────────────────────────────────────────────────

/** Paginated list for a merchant wallet */
TransactionSchema.statics.forMerchant = function (walletAddress, { page = 1, limit = 10, status } = {}) {
  const filter = { merchantWallet: walletAddress.toLowerCase() }
  if (status && status !== 'all') filter.status = status
  return this.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
}

// ─────────────────────────────────────────────────────────────────────────────
export const Transaction = model('Transaction', TransactionSchema)
export default Transaction
