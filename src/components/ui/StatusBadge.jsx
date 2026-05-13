// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — StatusBadge
// Standalone status indicator used in tables and cards
// ─────────────────────────────────────────────────────────────────────────────
import { getStatusBadgeClass, getStatusDot } from '@hooks/useTransactions'

export default function StatusBadge({ status }) {
  return (
    <span className={getStatusBadgeClass(status)}>
      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`} />
      {status}
    </span>
  )
}
