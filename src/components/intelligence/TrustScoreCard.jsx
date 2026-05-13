// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — TrustScoreCard (Coming Soon)
// AI-Driven merchant trust score gauge with glassmorphism overlay
// Phase 2: Read from TrustScoreOracle smart contract + Gemini analysis
// ─────────────────────────────────────────────────────────────────────────────
import { Star, TrendingUp, Shield, Users, Package } from 'lucide-react'
import ComingSoonOverlay from '@components/ui/ComingSoonOverlay'

// Ghost gauge preview shown blurred beneath overlay
function GaugePreview() {
  return (
    <div className="glass-card p-5 min-h-[280px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">AI Trust Score</h3>
          <p className="text-xs text-slate-500 mt-0.5">Merchant reputation index</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Star className="w-4 h-4 text-amber-400" />
        </div>
      </div>

      {/* SVG Gauge */}
      <div className="flex justify-center mb-5">
        <div className="relative w-36 h-20 overflow-hidden">
          <svg viewBox="0 0 120 60" className="w-full">
            {/* Track */}
            <path d="M10 55 A 50 50 0 0 1 110 55" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="10" strokeLinecap="round" />
            {/* Fill — blurred/unknown */}
            <path d="M10 55 A 50 50 0 0 1 60 5" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="10" strokeLinecap="round" strokeDasharray="4 4" />
          </svg>
          {/* Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
            <p className="text-2xl font-bold text-slate-600">??</p>
            <p className="text-[10px] text-slate-600">/ 100</p>
          </div>
        </div>
      </div>

      {/* Factor rows */}
      <div className="space-y-2">
        {[
          { icon: TrendingUp, label: 'Payment History',   w: 'w-4/5' },
          { icon: Shield,     label: 'Dispute Rate',      w: 'w-2/3' },
          { icon: Users,      label: 'Buyer Feedback',    w: 'w-3/4' },
          { icon: Package,    label: 'Escrow Completion', w: 'w-5/6' },
        ].map(({ icon: Icon, label, w }, i) => (
          <div key={i} className="flex items-center gap-2">
            <Icon className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-[11px] text-slate-600 w-32 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800">
              <div className={`h-full rounded-full ${w} bg-slate-700`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TrustScoreCard() {
  return (
    <ComingSoonOverlay
      title="AI-Driven Trust Score"
      description="On-chain behaviour, dispute history, and buyer feedback are analysed by Gemini to produce a live trust score stored in the TrustScoreOracle contract."
      phase="Phase 2"
      icon="cpu"
    >
      <GaugePreview />
    </ComingSoonOverlay>
  )
}
