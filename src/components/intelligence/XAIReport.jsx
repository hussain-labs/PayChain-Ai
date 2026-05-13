// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — XAIReport (Coming Soon)
// Explainable AI Risk Report panel — shows how the model reached its decision
// Phase 2: Powered by Gemini + SHAP-style feature attribution
// ─────────────────────────────────────────────────────────────────────────────
import { BookOpen, ChevronRight, Brain } from 'lucide-react'
import ComingSoonOverlay from '@components/ui/ComingSoonOverlay'

const FAKE_FACTORS = [
  { label: 'Transaction velocity',    impact: 72, direction: 'negative' },
  { label: 'Wallet age',              impact: 58, direction: 'positive' },
  { label: 'Geographic consistency',  impact: 44, direction: 'positive' },
  { label: 'Amount deviation',        impact: 31, direction: 'negative' },
  { label: 'Escrow usage history',    impact: 20, direction: 'positive' },
]

function ReportPreview() {
  return (
    <div className="glass-card p-5 min-h-[300px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">XAI Risk Report</h3>
          <p className="text-xs text-slate-500 mt-0.5">Explainable AI feature attribution</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-violet-400" />
        </div>
      </div>

      {/* Decision summary — blurred placeholder */}
      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 mb-4">
        <div className="flex items-start gap-2">
          <Brain className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            "Model decision: <span className="blur-sm">████████████████████</span> because
            the transaction exhibits <span className="blur-sm">███████</span> patterns consistent
            with <span className="blur-sm">████████████</span>."
          </p>
        </div>
      </div>

      {/* Feature attribution bars */}
      <div className="space-y-2.5">
        {FAKE_FACTORS.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 w-36 shrink-0 truncate">{f.label}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all ${
                  f.direction === 'positive'
                    ? 'bg-emerald-500/40'
                    : 'bg-rose-500/40'
                }`}
                style={{ width: `${f.impact}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono w-8 text-right shrink-0 ${
              f.direction === 'positive' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {f.direction === 'positive' ? '+' : '-'}{f.impact}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-slate-600 border border-slate-800 cursor-default">
        View Full Report <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}

export default function XAIReport() {
  return (
    <ComingSoonOverlay
      title="Explainable AI Reports"
      description="Every risk decision comes with a human-readable explanation — powered by SHAP-style feature attribution and Gemini's reasoning capabilities."
      phase="Phase 2"
      icon="cpu"
    >
      <ReportPreview />
    </ComingSoonOverlay>
  )
}
