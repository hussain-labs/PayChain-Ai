// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — MetricCard
// Reusable KPI card with trend indicator, icon, and optional "Coming Soon" overlay
// ─────────────────────────────────────────────────────────────────────────────
import { TrendingUp, TrendingDown, Minus, Lock } from 'lucide-react'

const ACCENT = {
  blue:    { border: 'border-blue-500/20',    icon: 'bg-blue-500/15 text-blue-400',    glow: 'shadow-glow-blue'    },
  emerald: { border: 'border-emerald-500/20', icon: 'bg-emerald-500/15 text-emerald-400', glow: 'shadow-glow-emerald' },
  amber:   { border: 'border-amber-500/20',   icon: 'bg-amber-500/15 text-amber-400',  glow: 'shadow-glow-amber'   },
  violet:  { border: 'border-violet-500/20',  icon: 'bg-violet-500/15 text-violet-400',glow: ''                    },
  rose:    { border: 'border-rose-500/20',    icon: 'bg-rose-500/15 text-rose-400',    glow: ''                    },
}

/**
 * MetricCard
 * @param {string}  title        - Card heading
 * @param {string}  value        - Main display value
 * @param {string}  subtitle     - Unit / secondary label
 * @param {string}  change       - e.g. "+12.4%"
 * @param {'up'|'down'|'flat'} trend
 * @param {ReactNode} icon       - Lucide icon element
 * @param {'blue'|'emerald'|'amber'|'violet'|'rose'} accent
 * @param {boolean} comingSoon   - Blurs value and shows lock overlay
 * @param {string}  comingLabel  - Override "Coming Soon" text
 * @param {boolean} loading      - Show shimmer skeleton
 */
export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  trend = 'flat',
  icon: Icon,
  accent = 'blue',
  comingSoon = false,
  comingLabel = 'Coming Soon',
  loading = false,
}) {
  const a = ACCENT[accent] ?? ACCENT.blue

  if (loading) {
    return (
      <div className={`glass-card p-5 border ${a.border}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-24 h-3 rounded shimmer" />
          <div className="w-10 h-10 rounded-xl shimmer" />
        </div>
        <div className="w-32 h-7 rounded shimmer mb-2" />
        <div className="w-20 h-3 rounded shimmer" />
      </div>
    )
  }

  return (
    <div className={`
      glass-card-hover p-5 border ${a.border}
      relative overflow-hidden group
    `}>
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="relative flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* ── Value ─────────────────────────────────────────────────── */}
      <div className="relative">
        {comingSoon ? (
          <div className="flex flex-col">
            {/* Blurred value placeholder */}
            <div className="relative">
              <p className="text-3xl font-bold text-slate-200 font-mono blur-sm select-none">
                ██████
              </p>
              {/* Lock badge */}
              <div className="
                absolute inset-0 flex items-center gap-2
                text-slate-400
              ">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                  bg-slate-800/80 border border-slate-700/60 backdrop-blur-sm">
                  <Lock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-400">{comingLabel}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="badge-ai text-[10px]">AI Feature</span>
              <span className="text-[11px] text-slate-500">Available in Phase 2</span>
            </div>
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-slate-100 font-mono tracking-tight">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </>
        )}
      </div>

      {/* ── Trend ─────────────────────────────────────────────────── */}
      {!comingSoon && change && (
        <div className="relative mt-4 pt-4 border-t border-slate-800/60 flex items-center gap-2">
          {trend === 'up'   && <TrendingUp   className="w-3.5 h-3.5 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400"    />}
          {trend === 'flat' && <Minus        className="w-3.5 h-3.5 text-slate-500"   />}
          <span className={`text-xs font-semibold ${
            trend === 'up'   ? 'text-emerald-400' :
            trend === 'down' ? 'text-rose-400'    : 'text-slate-500'
          }`}>
            {change}
          </span>
          <span className="text-xs text-slate-600">vs last month</span>
        </div>
      )}

      {/* Hover glow effect */}
      <div className={`
        absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100
        transition-opacity duration-500 pointer-events-none
        bg-gradient-to-br from-transparent via-transparent
        ${accent === 'blue'    ? 'to-blue-500/5'    : ''}
        ${accent === 'emerald' ? 'to-emerald-500/5' : ''}
        ${accent === 'amber'   ? 'to-amber-500/5'   : ''}
      `} />
    </div>
  )
}
