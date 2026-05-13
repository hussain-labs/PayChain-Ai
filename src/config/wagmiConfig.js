// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Wagmi v2 Configuration
// Supports MetaMask (injected) + WalletConnect
// ─────────────────────────────────────────────────────────────────────────────
import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon, polygonMumbai } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { WALLET_CONNECT_PROJECT_ID, RPC_URLS, SUPPORTED_CHAIN_IDS } from './constants'

// ── Connectors ────────────────────────────────────────────────────────────────
const connectors = [
  injected({ target: 'metaMask' }),
  // TODO (Phase 2): Enable WalletConnect once you have a real project ID
  // walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID }),
]

// ── Wagmi Config ──────────────────────────────────────────────────────────────
export const wagmiConfig = createConfig({
  chains:     [sepolia, mainnet, polygon, polygonMumbai],
  connectors,
  transports: {
    [mainnet.id]:        http(RPC_URLS[SUPPORTED_CHAIN_IDS.MAINNET]),
    [sepolia.id]:        http(RPC_URLS[SUPPORTED_CHAIN_IDS.SEPOLIA]),
    [polygon.id]:        http(RPC_URLS[SUPPORTED_CHAIN_IDS.POLYGON]),
    [polygonMumbai.id]:  http(RPC_URLS[SUPPORTED_CHAIN_IDS.MUMBAI]),
  },
})

// ── Chain display helpers ─────────────────────────────────────────────────────
export const CHAIN_META = {
  [mainnet.id]:       { name: 'Ethereum',      color: 'blue',    icon: '⟠' },
  [sepolia.id]:       { name: 'Sepolia',        color: 'purple',  icon: '⟠' },
  [polygon.id]:       { name: 'Polygon',        color: 'violet',  icon: '⬡' },
  [polygonMumbai.id]: { name: 'Mumbai',         color: 'violet',  icon: '⬡' },
}

export const getChainMeta = (chainId) =>
  CHAIN_META[chainId] ?? { name: 'Unknown', color: 'slate', icon: '?' }
