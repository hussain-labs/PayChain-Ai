// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — SectionHeader
// Reusable section title + optional badge + optional right-side action
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionHeader({ title, subtitle, badge, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          {badge && (
            <span className="badge-ai text-[10px]">{badge}</span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
