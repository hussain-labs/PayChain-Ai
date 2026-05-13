// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — EmptyState
// Generic empty / zero-data placeholder
// ─────────────────────────────────────────────────────────────────────────────
import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-sm font-semibold text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
