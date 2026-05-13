// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — TransactionsTable
// Full-featured table: filter, search, pagination, status badges,
// "View Intelligence" button (Coming Soon overlay in Phase 2)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Search, ExternalLink, Zap, ChevronLeft, ChevronRight,
         ArrowUpRight, Filter, RefreshCw } from 'lucide-react'
import { useTransactions, getStatusBadgeClass, getStatusDot } from '@hooks/useTransactions'
import { TX_STATUS } from '@config/constants'

const STATUS_FILTERS = [
  { label: 'All',       value: 'all'                         },
  { label: 'Success',   value: TX_STATUS.SUCCESS.toLowerCase() },
  { label: 'Pending',   value: TX_STATUS.PENDING.toLowerCase() },
  { label: 'Escrowed',  value: TX_STATUS.ESCROWED.toLowerCase()},
  { label: 'Disputed',  value: TX_STATUS.DISPUTED.toLowerCase()},
  { label: 'Failed',    value: TX_STATUS.FAILED.toLowerCase()  },
]

export default function TransactionsTable({ limit }) {
  const [search, setSearch]         = useState('')
  const [statusFilter, setFilter]   = useState('all')

  const { transactions, total, page, totalPages, setPage, isLoading } =
    useTransactions({ statusFilter, search })

  // Optional row limit (for dashboard preview)
  const rows = limit ? transactions.slice(0, limit) : transactions

  return (
    <div className="glass-card overflow-hidden">
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-800/60 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID, hash, or address…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="
              w-full pl-9 pr-4 py-2 rounded-xl text-sm
              bg-slate-800/60 border border-slate-700/60
              text-slate-200 placeholder:text-slate-600
              focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
              transition-all
            "
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1) }}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                ${statusFilter === f.value
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700/50 hover:text-slate-300 hover:border-slate-600'}
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tx ID</th>
              <th>Date & Time</th>
              <th className="hidden md:table-cell">From</th>
              <th>Amount</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}><div className="h-4 rounded shimmer" /></td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-500">
                    <RefreshCw className="w-8 h-8 opacity-30" />
                    <p className="text-sm">No transactions found</p>
                    <button
                      onClick={() => { setSearch(''); setFilter('all') }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map(tx => (
                <tr key={tx.id}>
                  {/* Tx ID */}
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-lg">
                        {tx.id}
                      </span>
                      {tx.escrow && (
                        <span className="hidden lg:inline badge-ai text-[9px]">Escrow</span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td>
                    <p className="text-sm text-slate-300">{tx.date}</p>
                    <p className="text-xs text-slate-600 font-mono">{tx.time}</p>
                  </td>

                  {/* From address */}
                  <td className="hidden md:table-cell">
                    <span className="text-xs font-mono text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded-lg">
                      {tx.from}
                    </span>
                  </td>

                  {/* Amount */}
                  <td>
                    <p className="text-sm font-semibold text-slate-100 font-mono">
                      {tx.amount}
                    </p>
                    <p className="text-[10px] text-slate-500">{tx.currency}</p>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={getStatusBadgeClass(tx.status)}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(tx.status)}`} />
                      {tx.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
                        title="View on Etherscan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <ViewIntelligenceButton txId={tx.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: count + pagination ─────────────────────────────── */}
      {!limit && (
        <div className="px-5 py-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing <span className="text-slate-300 font-medium">{rows.length}</span> of{' '}
            <span className="text-slate-300 font-medium">{total}</span> transactions
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`
                    w-8 h-8 rounded-lg text-xs font-medium transition-all
                    ${page === n
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}
                  `}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── View Intelligence Button ──────────────────────────────────────────────────
function ViewIntelligenceButton({ txId }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
          bg-blue-500/10 text-blue-400 border border-blue-500/20
          hover:bg-blue-500/20 hover:border-blue-500/30
          transition-all duration-200
        "
      >
        <Zap className="w-3 h-3" />
        <span className="hidden sm:inline">Intelligence</span>
      </button>

      {/* Coming Soon tooltip */}
      {hovered && (
        <div className="
          absolute bottom-full right-0 mb-2 w-52
          bg-slate-800 border border-slate-700 rounded-xl p-3
          text-xs text-slate-300 shadow-card z-50
          animate-fade-in pointer-events-none
        ">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="font-semibold text-blue-400">AI Intelligence</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Gemini-powered risk analysis for this transaction — available in Phase 2.
          </p>
          {/* Arrow */}
          <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-slate-800 border-r border-b border-slate-700 rotate-45" />
        </div>
      )}
    </div>
  )
}
