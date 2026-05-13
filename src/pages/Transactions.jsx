// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Transactions Page
// Full transaction history with filters, search, and pagination
// ─────────────────────────────────────────────────────────────────────────────
import { ArrowLeftRight, Download, RefreshCw, TrendingUp, DollarSign, Clock } from 'lucide-react'
import TransactionsTable from '@components/ui/TransactionsTable'
import SectionHeader     from '@components/ui/SectionHeader'
import MetricCard        from '@components/ui/MetricCard'
import { MOCK_METRICS }  from '@config/mockData'

export default function Transactions() {
  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Transaction History</h2>
            <p className="text-sm text-slate-500">All merchant payment activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Summary stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${MOCK_METRICS.totalRevenue.value}`}
          subtitle={MOCK_METRICS.totalRevenue.currency}
          change={MOCK_METRICS.totalRevenue.change}
          trend="up"
          icon={DollarSign}
          accent="blue"
        />
        <MetricCard
          title="Total Transactions"
          value={MOCK_METRICS.totalTransactions.value}
          subtitle="all time"
          change={MOCK_METRICS.totalTransactions.change}
          trend="up"
          icon={TrendingUp}
          accent="emerald"
        />
        <MetricCard
          title="Pending Settlements"
          value={`$${MOCK_METRICS.pendingSettlements.value}`}
          subtitle={MOCK_METRICS.pendingSettlements.currency}
          change={MOCK_METRICS.pendingSettlements.change}
          trend="down"
          icon={Clock}
          accent="amber"
        />
      </div>

      {/* ── Full transactions table ───────────────────────────────── */}
      <div>
        <SectionHeader
          title="All Transactions"
          subtitle="Search, filter and inspect every payment"
          className="mb-4"
        />
        <TransactionsTable />
      </div>

    </div>
  )
}
