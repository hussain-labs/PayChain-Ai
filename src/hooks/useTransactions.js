// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — useTransactions hook
// Phase 1: Returns mock data.
// Phase 2: Replace with useQuery() call to your backend or direct contract reads.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from 'react'
import { MOCK_TRANSACTIONS } from '@config/mockData'
import { TX_STATUS } from '@config/constants'

export function useTransactions({ statusFilter = 'all', search = '' } = {}) {
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const filtered = useMemo(() => {
    let txs = MOCK_TRANSACTIONS

    if (statusFilter !== 'all') {
      txs = txs.filter(tx => tx.status.toLowerCase() === statusFilter.toLowerCase())
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      txs = txs.filter(tx =>
        tx.id.toLowerCase().includes(q)       ||
        tx.txHash.toLowerCase().includes(q)   ||
        tx.from.toLowerCase().includes(q)     ||
        tx.amount.includes(q)
      )
    }
    return txs
  }, [statusFilter, search])

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return {
    transactions: paginated,
    allTransactions: filtered,
    total: filtered.length,
    page,
    totalPages,
    setPage,
    isLoading: false, // Phase 2: set from useQuery
    isError:   false,
  }
}

// ── Status helpers ─────────────────────────────────────────────────────────────
export function getStatusBadgeClass(status) {
  switch (status) {
    case TX_STATUS.SUCCESS:   return 'badge-success'
    case TX_STATUS.PENDING:   return 'badge-pending'
    case TX_STATUS.ESCROWED:  return 'badge-ai'
    case TX_STATUS.DISPUTED:  return 'badge-failed'
    case TX_STATUS.FAILED:    return 'badge-failed'
    case TX_STATUS.REFUNDED:  return 'badge-pending'
    default:                  return 'badge-pending'
  }
}

export function getStatusDot(status) {
  switch (status) {
    case TX_STATUS.SUCCESS:   return 'bg-emerald-400'
    case TX_STATUS.PENDING:   return 'bg-amber-400 animate-pulse'
    case TX_STATUS.ESCROWED:  return 'bg-blue-400 animate-pulse'
    case TX_STATUS.DISPUTED:  return 'bg-rose-400 animate-pulse'
    case TX_STATUS.FAILED:    return 'bg-rose-500'
    default:                  return 'bg-slate-400'
  }
}
