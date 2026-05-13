// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Disputes Page
// Active disputes management with AI arbitration placeholder
// Phase 2: Connect to DisputeArbiter.sol + Gemini mediation
// ─────────────────────────────────────────────────────────────────────────────
import { ShieldAlert, Clock, CheckCircle2, AlertTriangle, Zap, Scale } from 'lucide-react'
import SectionHeader     from '@components/ui/SectionHeader'
import ComingSoonOverlay from '@components/ui/ComingSoonOverlay'
import StatusBadge       from '@components/ui/StatusBadge'
import { MOCK_DISPUTES } from '@config/mockData'

const STATUS_STYLE = {
  'Open':          { cls: 'badge-failed',   dot: 'bg-rose-400 animate-pulse' },
  'Under Review':  { cls: 'badge-pending',  dot: 'bg-amber-400 animate-pulse' },
  'Resolved':      { cls: 'badge-success',  dot: 'bg-emerald-400' },
}

function DisputeCard({ dispute }) {
  const s = STATUS_STYLE[dispute.status] ?? STATUS_STYLE['Open']
  const daysLeft = Math.max(0,
    Math.round((new Date(dispute.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
  )

  return (
    <div className="glass-card-hover p-5 border border-slate-700/50">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-lg">
              {dispute.id}
            </span>
            <span className="text-xs text-slate-600">→</span>
            <span className="text-xs font-mono text-slate-500">{dispute.txId}</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">{dispute.reason}</p>
        </div>
        <span className={`${s.cls} shrink-0 flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {dispute.status}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/40 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Amount</p>
          <p className="text-sm font-bold text-slate-100 font-mono">${dispute.amount}</p>
          <p className="text-[10px] text-slate-500">{dispute.currency}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Time Remaining</p>
          <p className={`text-sm font-bold font-mono ${daysLeft <= 2 ? 'text-rose-400' : 'text-amber-400'}`}>
            {daysLeft}d left
          </p>
          <p className="text-[10px] text-slate-500">Due {dispute.dueDate}</p>
        </div>
      </div>

      {/* Buyer */}
      <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-slate-800/30 border border-slate-700/30">
        <p className="text-[10px] text-slate-500 shrink-0">Buyer:</p>
        <p className="text-xs font-mono text-slate-400 truncate">{dispute.buyer}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="flex-1 btn-secondary text-xs justify-center">
          <Scale className="w-3.5 h-3.5" /> Respond
        </button>
        <button
          title="AI Arbitration — Phase 2"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
            bg-blue-500/10 text-blue-400 border border-blue-500/20
            hover:bg-blue-500/15 transition-all cursor-default relative group"
        >
          <Zap className="w-3.5 h-3.5" />
          AI Arbitrate
          <span className="
            absolute bottom-full right-0 mb-2 px-2 py-1 rounded-lg whitespace-nowrap
            bg-slate-800 border border-slate-700 text-[10px] text-slate-400
            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10
          ">
            Gemini arbitration — Phase 2
          </span>
        </button>
      </div>
    </div>
  )
}

// Fake AI Arbitration panel shown behind overlay
function ArbitrationPreview() {
  return (
    <div className="glass-card p-6 min-h-[220px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <Scale className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">AI Arbitration Engine</h3>
          <p className="text-xs text-slate-500">Smart contract + Gemini mediation</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {['Evidence Analysis', 'Smart Contract Review', 'Final Verdict'].map((step, i) => (
          <div key={i} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
            <div className="w-7 h-7 rounded-full bg-slate-700/60 flex items-center justify-center mx-auto mb-2">
              <span className="text-xs font-bold text-slate-500">{i + 1}</span>
            </div>
            <p className="text-[10px] text-slate-600">{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Disputes() {
  const openCount      = MOCK_DISPUTES.filter(d => d.status === 'Open').length
  const reviewCount    = MOCK_DISPUTES.filter(d => d.status === 'Under Review').length

  return (
    <div className="space-y-6">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Disputes</h2>
            <p className="text-sm text-slate-500">Manage and resolve payment disputes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {openCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-semibold text-rose-400">{openCount} Open</span>
            </div>
          )}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">{reviewCount} In Review</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Disputes', value: MOCK_DISPUTES.length, icon: ShieldAlert, colour: 'text-rose-400',    bg: 'bg-rose-500/10'    },
          { label: 'Open',           value: openCount,            icon: AlertTriangle, colour: 'text-amber-400', bg: 'bg-amber-500/10'   },
          { label: 'Under Review',   value: reviewCount,          icon: Clock,        colour: 'text-blue-400',   bg: 'bg-blue-500/10'    },
        ].map(({ label, value, icon: Icon, colour, bg }, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${colour}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-100 font-mono">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Active disputes ──────────────────────────────────────── */}
      <div>
        <SectionHeader title="Active Disputes" subtitle="Requires your attention" className="mb-4" />
        {MOCK_DISPUTES.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No active disputes</p>
            <p className="text-xs text-slate-500 mt-1">You're all clear — keep it up!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MOCK_DISPUTES.map(d => <DisputeCard key={d.id} dispute={d} />)}
          </div>
        )}
      </div>

      {/* ── AI Arbitration (Coming Soon) ─────────────────────────── */}
      <div>
        <SectionHeader
          title="AI Arbitration Engine"
          subtitle="Automated dispute resolution powered by Gemini + smart contracts"
          badge="Phase 2"
          className="mb-4"
        />
        <ComingSoonOverlay
          title="AI-Powered Arbitration"
          description="The DisputeArbiter contract works with Gemini to analyse evidence, review on-chain history, and issue binding verdicts — cutting resolution time from days to minutes."
          phase="Phase 2"
          icon="zap"
        >
          <ArbitrationPreview />
        </ComingSoonOverlay>
      </div>

    </div>
  )
}
