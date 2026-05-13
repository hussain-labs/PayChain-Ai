// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — FraudAlerts (Coming Soon)
// Real-time fraud detection panel with glassmorphism AI overlay
// Phase 2: Connect to Gemini API fraud-detection endpoint
// ─────────────────────────────────────────────────────────────────────────────
import { ShieldAlert, AlertTriangle, Info, Zap } from 'lucide-react'
import ComingSoonOverlay from '@components/ui/ComingSoonOverlay'
import { MOCK_FRAUD_ALERTS_PREVIEW } from '@config/mockData'

const SEVERITY_STYLE = {
  HIGH:   { bar: 'bg-rose-500',   dot: 'bg-rose-400 animate-pulse',   text: 'text-rose-400',   badge: 'bg-rose-500/15 border-rose-500/25 text-rose-400'   },
  MEDIUM: { bar: 'bg-amber-500',  dot: 'bg-amber-400 animate-pulse',  text: 'text-amber-400',  badge: 'bg-amber-500/15 border-amber-500/25 text-amber-400' },
  LOW:    { bar: 'bg-blue-500',   dot: 'bg-blue-400',                 text: 'text-blue-400',   badge: 'bg-blue-500/15 border-blue-500/25 text-blue-400'   },
}

// Ghost preview cards shown blurred beneath the overlay
function PreviewContent() {
  return (
    <div className="glass-card p-5 min-h-[280px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Real-time Fraud Alerts</h3>
          <p className="text-xs text-slate-500 mt-0.5">AI-powered anomaly detection</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        </div>
      </div>

      <div className="space-y-2.5">
        {MOCK_FRAUD_ALERTS_PREVIEW.map((alert, i) => {
          const s = SEVERITY_STYLE[alert.severity]
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${s.badge}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-slate-600">{alert.time}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{alert.message}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* fake risk meter */}
      <div className="mt-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
          <span>Overall Risk Score</span><span className="text-rose-400 font-semibold">—</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500" />
        </div>
      </div>
    </div>
  )
}

export default function FraudAlerts() {
  return (
    <ComingSoonOverlay
      title="Real-time Fraud Alerts"
      description="Gemini AI monitors every transaction for anomalies, velocity attacks, and wallet clustering patterns — flagging threats before they hit your escrow."
      phase="Phase 2"
      icon="zap"
    >
      <PreviewContent />
    </ComingSoonOverlay>
  )
}
