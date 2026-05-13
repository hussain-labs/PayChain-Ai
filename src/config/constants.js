// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Central Constants
// Phase 2: Replace placeholder values with live contract addresses & API keys
// ─────────────────────────────────────────────────────────────────────────────

// ── App Meta ─────────────────────────────────────────────────────────────────
export const APP_NAME    = 'PayChain AI'
export const APP_VERSION = '1.0.0-phase1'
export const APP_TAGLINE = 'Decentralized Merchant Payment Intelligence'

// ── Supported Chain IDs ───────────────────────────────────────────────────────
export const SUPPORTED_CHAIN_IDS = {
  MAINNET:  1,
  SEPOLIA:  11155111,   // primary testnet for Phase 1
  POLYGON:  137,
  MUMBAI:   80001,
}

export const DEFAULT_CHAIN_ID = SUPPORTED_CHAIN_IDS.SEPOLIA

// ── Solidity Smart Contract Addresses ────────────────────────────────────────
// TODO (Phase 2): Replace with deployed contract addresses after `npx hardhat deploy`
export const CONTRACTS = {
  ESCROW_MANAGER: {
    address:  '0x0000000000000000000000000000000000000000', // ← replace
    chainId:  SUPPORTED_CHAIN_IDS.SEPOLIA,
  },
  PAYMENT_ROUTER: {
    address:  '0x0000000000000000000000000000000000000000', // ← replace
    chainId:  SUPPORTED_CHAIN_IDS.SEPOLIA,
  },
  TRUST_SCORE_ORACLE: {
    address:  '0x0000000000000000000000000000000000000000', // ← replace
    chainId:  SUPPORTED_CHAIN_IDS.SEPOLIA,
  },
  DISPUTE_ARBITER: {
    address:  '0x0000000000000000000000000000000000000000', // ← replace
    chainId:  SUPPORTED_CHAIN_IDS.SEPOLIA,
  },
}

// ── API Endpoints ─────────────────────────────────────────────────────────────
// TODO (Phase 2): Replace with live backend / Gemini API URLs
export const API = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',

  // Gemini AI endpoints
  GEMINI: {
    BASE:          import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta',
    TRUST_SCORE:   '/models/gemini-pro:generateContent',  // ← Phase 2
    FRAUD_DETECT:  '/models/gemini-pro:generateContent',  // ← Phase 2
    XAI_REPORT:    '/models/gemini-pro:generateContent',  // ← Phase 2
  },

  // Internal backend endpoints
  TRANSACTIONS: '/transactions',
  DISPUTES:     '/disputes',
  MERCHANT:     '/merchant',
  ANALYTICS:    '/analytics',
}

// ── WalletConnect Project ID ──────────────────────────────────────────────────
// TODO (Phase 2): Get from https://cloud.walletconnect.com
export const WALLET_CONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID'

// ── RPC URLs ──────────────────────────────────────────────────────────────────
export const RPC_URLS = {
  [SUPPORTED_CHAIN_IDS.MAINNET]:  import.meta.env.VITE_RPC_MAINNET  || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  [SUPPORTED_CHAIN_IDS.SEPOLIA]:  import.meta.env.VITE_RPC_SEPOLIA  || 'https://eth-sepolia.g.alchemy.com/v2/demo',
  [SUPPORTED_CHAIN_IDS.POLYGON]:  import.meta.env.VITE_RPC_POLYGON  || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
  [SUPPORTED_CHAIN_IDS.MUMBAI]:   import.meta.env.VITE_RPC_MUMBAI   || 'https://polygon-mumbai.g.alchemy.com/v2/demo',
}

// ── UI / UX Constants ─────────────────────────────────────────────────────────
export const ITEMS_PER_PAGE   = 10
export const TOAST_DURATION   = 4000   // ms
export const POLLING_INTERVAL = 12000  // ms — ~1 Ethereum block

// ── Trust Score Thresholds ────────────────────────────────────────────────────
export const TRUST_SCORE = {
  HIGH:   { min: 80, label: 'High',   color: 'emerald' },
  MEDIUM: { min: 50, label: 'Medium', color: 'amber'   },
  LOW:    { min: 0,  label: 'Low',    color: 'rose'    },
}

// ── Transaction Statuses ──────────────────────────────────────────────────────
export const TX_STATUS = {
  PENDING:   'Pending',
  SUCCESS:   'Success',
  FAILED:    'Failed',
  ESCROWED:  'Escrowed',
  DISPUTED:  'Disputed',
  REFUNDED:  'Refunded',
}
