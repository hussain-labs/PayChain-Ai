// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — WeeklyRevenueChart
// Bar chart: weekly revenue vs refunds
// ─────────────────────────────────────────────────────────────────────────────
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { MOCK_WEEKLY_REVENUE } from '@config/mockData'
import SectionHeader from '@components/ui/SectionHeader'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900/95 border border-slate-700/60 rounded-xl p-3 shadow-card backdrop-blur-md">
      <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-xs text-slate-400 capitalize">{p.name}</span>
          </div>
          <span className="text-xs font-semibold text-slate-200 font-mono">
            ${p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)

export default function WeeklyRevenueChart() {
  return (
    <div className="glass-card p-5">
      <SectionHeader
        title="This Week"
        subtitle="Daily revenue breakdown"
        className="mb-6"
      />

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_WEEKLY_REVENUE} margin={{ top: 5, right: 5, bottom: 0, left: -15 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />

            <Bar dataKey="revenue" name="Revenue" radius={[4,4,0,0]} barSize={22}>
              {MOCK_WEEKLY_REVENUE.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.day === today ? '#3b82f6' : 'rgba(59,130,246,0.35)'}
                />
              ))}
            </Bar>
            <Bar dataKey="refunds" name="Refunds" fill="rgba(244,63,94,0.4)" radius={[4,4,0,0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-blue-500" />
          <span className="text-[11px] text-slate-500">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-rose-500/60" />
          <span className="text-[11px] text-slate-500">Refunds</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-[11px] text-slate-500">Today</span>
        </div>
      </div>
    </div>
  )
}
