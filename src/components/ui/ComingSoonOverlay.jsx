// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — ComingSoonOverlay
// Glassmorphism "AI Processing" overlay for Phase 2 features.
// Renders children blurred beneath an animated lock panel.
// ─────────────────────────────────────────────────────────────────────────────
import { Lock, Zap, Cpu, ArrowRight } from 'lucide-react'

/**
 * ComingSoonOverlay
 * @param {ReactNode} children     - Content shown blurred beneath the overlay
 * @param {string}    title        - Feature name
 * @param {string}    description  - Short description of the upcoming feature
 * @param {string}    phase        - e.g. "Phase 2"
 * @param {string}    icon         - 'zap' | 'cpu' | 'lock' (default)
 * @param {boolean}   blurContent  - Whether to blur the children (default true)
 */
export default function ComingSoonOverlay({
  children,
  title = 'Coming Soon',
  description = 'This AI-powered feature will be available in the next phase.',
  phase = 'Phase 2',
  icon = 'zap',
  blurContent = true,
}) {
  const IconComponent = icon === 'zap' ? Zap : icon === 'cpu' ? Cpu : Lock

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* ── Blurred content underneath ───────────────────────────── */}
      {children && (
        <div className={blurContent ? 'blur-sm pointer-events-none select-none' : ''}>
          {children}
        </div>
      )}

      {/* ── Glassmorphism overlay ─────────────────────────────────── */}
      <div className="
        absolute inset-0 flex items-center justify-center
        bg-slate-950/60 backdrop-blur-md
        rounded-2xl
      ">
        {/* Animated gradient border */}
        <div className="
          absolute inset-0 rounded-2xl
          bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10
          animate-pulse-slow
        " />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-blue-400/40 animate-float"
              style={{
                left:              `${15 + i * 14}%`,
                top:               `${20 + (i % 3) * 25}%`,
                animationDelay:    `${i * 0.8}s`,
                animationDuration: `${4 + i * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="
          relative z-10 flex flex-col items-center gap-4 p-8 mx-4
          text-center max-w-sm
          bg-slate-900/80 backdrop-blur-xl
          border border-blue-500/20 rounded-2xl
          shadow-glow-blue
        ">
          {/* Icon ring */}
          <div className="relative">
            <div className="
              w-16 h-16 rounded-2xl
              bg-gradient-to-br from-blue-600/30 to-violet-600/30
              border border-blue-500/30
              flex items-center justify-center
              animate-glow
            ">
              <IconComponent className="w-7 h-7 text-blue-400" />
            </div>
            {/* Orbiting dot */}
            <div className="
              absolute -top-1 -right-1 w-4 h-4 rounded-full
              bg-slate-900 border-2 border-blue-500
              flex items-center justify-center
            ">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            </div>
          </div>

          {/* Text */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="badge-ai text-xs">{phase}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Feature
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
          </div>

          {/* Processing animation bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                AI Model Training
              </span>
              <span className="text-[10px] text-blue-400 font-semibold">Soon™</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="
                h-full w-2/3 rounded-full
                bg-gradient-to-r from-blue-600 to-violet-500
                shimmer
              " />
            </div>
          </div>

          {/* CTA */}
          <button
            className="
              flex items-center gap-1.5 text-xs text-blue-400
              hover:text-blue-300 transition-colors font-medium
            "
            onClick={() => window.open('https://github.com/hussain-labs/PayChain-Ai', '_blank')}
          >
            Follow development progress
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
