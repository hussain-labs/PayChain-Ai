// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Mock Data (Phase 1)
// TODO (Phase 2): Replace with live blockchain + API data
// ─────────────────────────────────────────────────────────────────────────────
import { TX_STATUS } from './constants'

// ── Merchant Profile ──────────────────────────────────────────────────────────
export const MOCK_MERCHANT = {
  id:          'merchant_0x8f3a',
  name:        'Nexus Commerce Ltd.',
  wallet:      '0x8f3a...c21b',
  joinedDate:  '2024-01-15',
  plan:        'Pro',
  trustScore:  null, // AI feature — Phase 2
}

// ── Revenue Metrics ───────────────────────────────────────────────────────────
export const MOCK_METRICS = {
  totalRevenue: {
    value:    '142,830.50',
    currency: 'USDC',
    change:   '+12.4%',
    trend:    'up',
  },
  activeEscrows: {
    value:  '24',
    unit:   'contracts',
    change: '+3',
    trend:  'up',
  },
  pendingSettlements: {
    value:    '8,240.00',
    currency: 'USDC',
    change:   '-2.1%',
    trend:    'down',
  },
  totalTransactions: {
    value:  '1,347',
    change: '+89',
    trend:  'up',
  },
}

// ── Sales Trend Chart Data (last 12 months) ───────────────────────────────────
export const MOCK_SALES_TREND = [
  { month: 'Jun',  revenue: 8200,  escrows: 12, transactions: 89  },
  { month: 'Jul',  revenue: 11400, escrows: 18, transactions: 124 },
  { month: 'Aug',  revenue: 9800,  escrows: 14, transactions: 107 },
  { month: 'Sep',  revenue: 13600, escrows: 22, transactions: 148 },
  { month: 'Oct',  revenue: 15200, escrows: 28, transactions: 165 },
  { month: 'Nov',  revenue: 18900, escrows: 31, transactions: 202 },
  { month: 'Dec',  revenue: 22400, escrows: 38, transactions: 241 },
  { month: 'Jan',  revenue: 19600, escrows: 34, transactions: 213 },
  { month: 'Feb',  revenue: 21800, escrows: 36, transactions: 230 },
  { month: 'Mar',  revenue: 24100, escrows: 41, transactions: 258 },
  { month: 'Apr',  revenue: 26700, escrows: 45, transactions: 287 },
  { month: 'May',  revenue: 28300, escrows: 48, transactions: 310 },
]

// ── Weekly Revenue Breakdown ──────────────────────────────────────────────────
export const MOCK_WEEKLY_REVENUE = [
  { day: 'Mon', revenue: 3200, refunds: 120 },
  { day: 'Tue', revenue: 4100, refunds: 80  },
  { day: 'Wed', revenue: 3800, refunds: 200 },
  { day: 'Thu', revenue: 5200, refunds: 150 },
  { day: 'Fri', revenue: 6100, refunds: 90  },
  { day: 'Sat', revenue: 4800, refunds: 60  },
  { day: 'Sun', revenue: 2600, refunds: 40  },
]

// ── Recent Transactions ───────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS = [
  {
    id:       'TX-2024-001',
    txHash:   '0xa3f2...8d91',
    date:     '2025-05-13',
    time:     '14:32:07',
    from:     '0x742d...35Cc',
    amount:   '1,250.00',
    currency: 'USDC',
    status:   TX_STATUS.SUCCESS,
    escrow:   false,
    riskScore: null,
  },
  {
    id:       'TX-2024-002',
    txHash:   '0xb8c4...2e44',
    date:     '2025-05-13',
    time:     '12:18:33',
    from:     '0x9a1f...7bD2',
    amount:   '8,400.00',
    currency: 'USDC',
    status:   TX_STATUS.ESCROWED,
    escrow:   true,
    riskScore: null,
  },
  {
    id:       'TX-2024-003',
    txHash:   '0xc7d5...9f12',
    date:     '2025-05-12',
    time:     '09:45:21',
    from:     '0x3b8e...c4F8',
    amount:   '320.50',
    currency: 'USDC',
    status:   TX_STATUS.PENDING,
    escrow:   false,
    riskScore: null,
  },
  {
    id:       'TX-2024-004',
    txHash:   '0xd9e1...4a77',
    date:     '2025-05-12',
    time:     '16:02:45',
    from:     '0x5c2a...e1B9',
    amount:   '2,100.00',
    currency: 'USDC',
    status:   TX_STATUS.SUCCESS,
    escrow:   false,
    riskScore: null,
  },
  {
    id:       'TX-2024-005',
    txHash:   '0xe4f2...6b33',
    date:     '2025-05-11',
    time:     '11:28:16',
    from:     '0x1d7c...93A4',
    amount:   '15,600.00',
    currency: 'USDC',
    status:   TX_STATUS.DISPUTED,
    escrow:   true,
    riskScore: null,
  },
  {
    id:       'TX-2024-006',
    txHash:   '0xf6a8...1c99',
    date:     '2025-05-11',
    time:     '08:14:52',
    from:     '0x7e4b...28C1',
    amount:   '480.00',
    currency: 'USDC',
    status:   TX_STATUS.FAILED,
    escrow:   false,
    riskScore: null,
  },
  {
    id:       'TX-2024-007',
    txHash:   '0x12b3...d4f6',
    date:     '2025-05-10',
    time:     '17:55:39',
    from:     '0x2f9d...56E7',
    amount:   '3,780.00',
    currency: 'USDC',
    status:   TX_STATUS.SUCCESS,
    escrow:   false,
    riskScore: null,
  },
  {
    id:       'TX-2024-008',
    txHash:   '0x34c7...e8a2',
    date:     '2025-05-10',
    time:     '13:40:28',
    from:     '0x8b3e...79F3',
    amount:   '920.25',
    currency: 'USDC',
    status:   TX_STATUS.SUCCESS,
    escrow:   false,
    riskScore: null,
  },
]

// ── Active Disputes ───────────────────────────────────────────────────────────
export const MOCK_DISPUTES = [
  {
    id:          'DISP-001',
    txId:        'TX-2024-005',
    amount:      '15,600.00',
    currency:    'USDC',
    buyer:       '0x1d7c...93A4',
    reason:      'Item not received',
    status:      'Open',
    openedDate:  '2025-05-11',
    dueDate:     '2025-05-18',
    aiRisk:      null,
  },
  {
    id:          'DISP-002',
    txId:        'TX-2023-891',
    amount:      '4,200.00',
    currency:    'USDC',
    buyer:       '0x6k2m...12P9',
    reason:      'Unauthorized transaction',
    status:      'Under Review',
    openedDate:  '2025-05-09',
    dueDate:     '2025-05-16',
    aiRisk:      null,
  },
]

// ── Fraud Alert Samples (Coming Soon — Phase 2) ───────────────────────────────
export const MOCK_FRAUD_ALERTS_PREVIEW = [
  { severity: 'HIGH',   message: 'Unusual transaction pattern detected',  time: '2 min ago' },
  { severity: 'MEDIUM', message: 'Multiple wallets from same IP subnet',   time: '18 min ago' },
  { severity: 'LOW',    message: 'First-time high-value buyer',            time: '1 hr ago' },
]
