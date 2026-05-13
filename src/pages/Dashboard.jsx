// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Dashboard.jsx  (Home Page)
// Full merchant dashboard: metrics, charts, recent txns, intelligence panels
// ─────────────────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
import {
  DollarSign, Lock, BarChart2, ArrowRight,
  Hexagon, Zap, TrendingUp,
} from 'lucide-react'
import MetricCard        from '@components/ui/MetricCard'
import SectionHeader     from '@components/ui/SectionHeader'
import TransactionsTable from '@components/ui/TransactionsTable'
import SalesTrendChart   from '@components/charts/SalesTrendChart'
import WeeklyRevenueChart from '@components/charts/WeeklyRevenueChart'
import FraudAlerts       from '@components/intelligence/FraudAlerts'
import TrustScoreCard    from '@components/intelligence/TrustScoreCard'
import XAIReport         from '@components/intelligence/XAIReport'
import { useMerchant }   from '@hooks/useMerchant'
import { useWallet }     from '@hooks/useWallet'
import { MOCK_MERCHANT } from '@config/mockData'

export default function Dashboard() {
  const { metrics }                      = useMerchant()
  const { isConnected, shortAddress }    = useWallet()

  return (
    <div className="space-y-8">

      {/* ── Hero welcome banner ──────────────────────────────────── */}
      <div className="relative overflow-hidden glass-card p-6 border border-blue-500/15">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-glow-blue shrink-0">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Welcome back, <span className="gradient-text">{MOCK_MERCHANT.name}</span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {isConnected
                  ? <>Wallet connected: <span className="font-mono text-blue-400">{shortAddress}</span></>
                  : 'Connect your wallet to access full merchant features.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge-success">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Phase 1 Live
            </span>
            <span className="badge-ai">
              <Zap className="w-2.5 h-2.5" />
              AI Ready Phase 2
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Cards ─────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Revenue Overview"
          subtitle="Real-time metrics from your payment activity"
          className="mb-4"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue.value}`}
            subtitle={metrics.totalRevenue.currency}
            change={metrics.totalRevenue.change}
            trend={metrics.totalRevenue.trend}
            icon={DollarSign}
            accent="blue"
          />
          <MetricCard
            title="Active Escrows"
            value={metrics.activeEscrows.value}
            subtitle={metrics.activeEscrows.unit}
            change={`${metrics.activeEscrows.change} this week`}
            trend={metrics.activeEscrows.trend}
            icon={Lock}
            accent="emerald"
          />
          <MetricCard
            title="Total Transactions"
            value={metrics.totalTransactions.value}
            subtitle="all time"
            change={`${metrics.totalTransactions.change} this month`}
            trend="up"
            icon={BarChart2}
            accent="violet"
          />
          {/* Trust Score — Coming Soon AI Feature */}
          <MetricCard
            title="Trust Score"
            icon={TrendingUp}
            accent="amber"
            comingSoon
            comingLabel="AI Feature"
          />
        </div>
      </section>

      {/* ── Analytics Charts ─────────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Analytics"
          subtitle="Sales trends and performance insights"
          className="mb-4"
        />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <SalesTrendChart />
          </div>
          <div>
            <WeeklyRevenueChart />
          </div>
        </div>
      </section>

      {/* ── Recent Transactions ──────────────────────────────────── */}
      <section>
        <SectionHeader
          title="Recent Transactions"
          subtitle="Latest payment activity"
          className="mb-4"
          action={
            <Link to="/transactions" className="btn-ghost text-xs">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <TransactionsTable limit={5} />
      </section>

      {/* ── AI Intelligence Panels ───────────────────────────────── */}
      <section>
        <SectionHeader
          title="AI Intelligence Centre"
          subtitle="Powered by Gemini — launching in Phase 2"
          badge="Coming Soon"
          className="mb-4"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FraudAlerts />
          <TrustScoreCard />
          <XAIReport />
        </div>
      </section>

    </div>
  )
}
