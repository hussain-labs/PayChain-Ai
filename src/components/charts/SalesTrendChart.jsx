// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — SalesTrendChart
// 12-month Area + Bar combo chart using Recharts + mock data
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { TrendingUp, BarChart2 } from 'lucide-react'
import { MOCK_SALES_TREND } from '@config/mockData'
import SectionHeader from '@components/ui/SectionHeader'

const VIEWS = [
  { id: 'revenue',      label: 'Revenue',      color: '#3b82f6' },
  { id: 'escrows',      label: 'Escrows',      color: '#10b981' },
  { id: 'transactions', label: 'Transactions', color: '#8b5cf6' },
]

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900/95 border border-slate-700/60 rounded-xl p-3 shadow-card backdrop-blur-md min-w-[160px]">
      <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-slate-400 capitalize">{p.name}</span>
          </div>
          <span className="text-xs font-semibold text-slate-200 font-mono">
            {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Custom Legend ─────────────────────────────────────────────────────────────
function CustomLegend({ payload }) {
  if (!payload) return null
  return (
    <div className="flex items-center justify-center gap-4 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-[11px] text-slate-500 capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function SalesTrendChart() {
  const [activeView, setActiveView] = useState('revenue')

  return (
    <div className="glass-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <SectionHeader
          title="Sales Analytics"
          subtitle="12-month performance overview"
          className="flex-1"
        />

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/50 self-start">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                ${activeView === v.id
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Revenue',   value: '$219.7K', change: '+18.2%', up: true  },
          { label: 'Avg / Month',     value: '$18.3K',  change: '+8.4%',  up: true  },
          { label: 'Peak Month',      value: 'May',     change: '$28.3K', up: null  },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-sm font-bold text-slate-100 font-mono">{s.value}</p>
            <p className={`text-[10px] font-medium mt-0.5 ${
              s.up === true  ? 'text-emerald-400' :
              s.up === false ? 'text-rose-400'    : 'text-blue-400'
            }`}>
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={MOCK_SALES_TREND} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="escrowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.07)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v =>
                activeView === 'revenue'
                  ? v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  : v
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148,163,184,0.1)', strokeWidth: 1 }} />
            <Legend content={<CustomLegend />} />

            {activeView === 'revenue' && (
              <>
                <Area
                  type="monotone" dataKey="revenue" name="revenue"
                  stroke="#3b82f6" strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false} activeDot={{ r: 4, fill: '#3b82f6', stroke: '#1e3a8a', strokeWidth: 2 }}
                />
                <Bar dataKey="escrows" name="escrows" fill="#10b981" fillOpacity={0.5} radius={[3,3,0,0]} barSize={8} />
              </>
            )}
            {activeView === 'escrows' && (
              <Area
                type="monotone" dataKey="escrows" name="escrows"
                stroke="#10b981" strokeWidth={2}
                fill="url(#escrowGrad)"
                dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
              />
            )}
            {activeView === 'transactions' && (
              <Bar
                dataKey="transactions" name="transactions"
                radius={[4,4,0,0]} barSize={18}
                fill="#8b5cf6" fillOpacity={0.75}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
