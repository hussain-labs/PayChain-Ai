// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Analytics Controller
//
// Powers the Phase 1 chart data: SalesTrendChart + WeeklyRevenueChart.
// All queries run pure MongoDB aggregations — no Gemini calls.
//
// Phase 2 live:
//   GET /api/v1/analytics/overview        → overview  (metrics summary)
//   GET /api/v1/analytics/sales-trend     → salesTrend (12-month area chart)
//   GET /api/v1/analytics/weekly-revenue  → weeklyRevenue (bar chart)
// ─────────────────────────────────────────────────────────────────────────────
import { Transaction, Dispute } from '../models/index.js'
import { AppError }             from '../middleware/errorHandler.js'
import { sendSuccess }          from '../utils/apiResponse.js'
import { normaliseAddress }     from '../utils/walletUtils.js'

// ── Shared wallet resolver ─────────────────────────────────────────────────────
function resolveWallet(req) {
  const raw = req.walletAddress || req.query.walletAddress
  if (!raw) {
    throw new AppError(
      'Provide "x-wallet-address" header or "walletAddress" query param.',
      400,
      'MISSING_WALLET_FILTER'
    )
  }
  return normaliseAddress(raw)
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/overview
// Returns the 4 KPI cards shown at the top of the Phase 1 dashboard.
// ─────────────────────────────────────────────────────────────────────────────
export async function overview(req, res) {
  const wallet = resolveWallet(req)

  const [revenueAgg, escrowCount, pendingAgg, disputeCount, totalCount] = await Promise.all([
    // Total revenue (Success + Escrowed)
    Transaction.aggregate([
      { $match: { merchantWallet: wallet, status: { $in: ['Success', 'Escrowed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    // Active escrows
    Transaction.countDocuments({ merchantWallet: wallet, isEscrow: true, status: 'Escrowed' }),
    // Pending settlements
    Transaction.aggregate([
      { $match: { merchantWallet: wallet, status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Open disputes
    Dispute.countDocuments({
      merchantWallet: wallet,
      status: { $nin: ['Resolved', 'Rejected', 'Closed'] },
    }),
    // All-time transaction count
    Transaction.countDocuments({ merchantWallet: wallet }),
  ])

  const totalRevenue       = revenueAgg[0]?.total ?? 0
  const settledCount       = revenueAgg[0]?.count ?? 0
  const pendingSettlements = pendingAgg[0]?.total ?? 0

  return sendSuccess(res, {
    message: 'Analytics overview retrieved.',
    data: {
      totalRevenue: {
        value:    totalRevenue.toFixed(2),
        currency: 'USDC',
        // Month-over-month change is a Phase 3 feature (requires historical snapshots)
        change:   null,
        trend:    null,
      },
      activeEscrows: {
        value:  escrowCount,
        unit:   'contracts',
        change: null,
        trend:  null,
      },
      pendingSettlements: {
        value:    pendingSettlements.toFixed(2),
        currency: 'USDC',
        change:   null,
        trend:    null,
      },
      totalTransactions: {
        value:  totalCount,
        change: null,
        trend:  null,
      },
      openDisputes: disputeCount,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/sales-trend
// 12-month monthly aggregation feeding SalesTrendChart.
// Returns the same shape as MOCK_SALES_TREND from Phase 1.
// ─────────────────────────────────────────────────────────────────────────────
export async function salesTrend(req, res) {
  const wallet = resolveWallet(req)
  const months = parseInt(req.query.months ?? '12', 10)

  const since = new Date()
  since.setMonth(since.getMonth() - months)
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const agg = await Transaction.aggregate([
    {
      $match: {
        merchantWallet: wallet,
        createdAt:      { $gte: since },
        status:         { $in: ['Success', 'Escrowed', 'Pending'] },
      },
    },
    {
      $group: {
        _id: {
          year:  { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue:      { $sum: { $cond: [{ $in: ['$status', ['Success', 'Escrowed']] }, '$amount', 0] } },
        escrows:      { $sum: { $cond: ['$isEscrow', 1, 0] } },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ])

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const data = agg.map(row => ({
    month:        MONTH_NAMES[row._id.month - 1],
    year:         row._id.year,
    revenue:      Math.round(row.revenue),
    escrows:      row.escrows,
    transactions: row.transactions,
  }))

  return sendSuccess(res, {
    message: `${months}-month sales trend retrieved.`,
    data: {
      period:  `${months} months`,
      rows:    data,
      summary: {
        totalRevenue:      data.reduce((s, r) => s + r.revenue, 0),
        totalTransactions: data.reduce((s, r) => s + r.transactions, 0),
        peakMonth:         data.reduce((a, b) => b.revenue > a.revenue ? b : a, data[0] ?? {}),
      },
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/analytics/weekly-revenue
// Current week day-by-day breakdown feeding WeeklyRevenueChart.
// Returns the same shape as MOCK_WEEKLY_REVENUE from Phase 1.
// ─────────────────────────────────────────────────────────────────────────────
export async function weeklyRevenue(req, res) {
  const wallet = resolveWallet(req)

  // Start of current week (Sunday 00:00:00)
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const agg = await Transaction.aggregate([
    {
      $match: {
        merchantWallet: wallet,
        createdAt:      { $gte: weekStart },
      },
    },
    {
      $group: {
        _id:     { $dayOfWeek: '$createdAt' },  // 1=Sun … 7=Sat
        revenue: { $sum: { $cond: [{ $in: ['$status', ['Success', 'Escrowed']] }, '$amount', 0] } },
        refunds: { $sum: { $cond: [{ $eq: ['$status', 'Refunded'] }, '$amount', 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Fill all 7 days so the chart always has a full week
  const dayMap = {}
  for (const row of agg) {
    dayMap[row._id] = { revenue: Math.round(row.revenue), refunds: Math.round(row.refunds) }
  }

  const data = DAY_NAMES.map((day, i) => ({
    day,
    revenue: dayMap[i + 1]?.revenue ?? 0,
    refunds: dayMap[i + 1]?.refunds ?? 0,
  }))

  return sendSuccess(res, {
    message: 'Weekly revenue retrieved.',
    data: {
      weekStarting: weekStart.toISOString().split('T')[0],
      rows:         data,
      totals: {
        revenue: data.reduce((s, r) => s + r.revenue, 0),
        refunds: data.reduce((s, r) => s + r.refunds, 0),
      },
    },
  })
}
