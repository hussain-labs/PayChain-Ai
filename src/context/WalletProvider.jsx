// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — WalletProvider.jsx
// Wraps the app with Wagmi v2 + TanStack Query context.
// Phase 2: Add WalletConnect projectId in src/config/wagmiConfig.js
// ─────────────────────────────────────────────────────────────────────────────
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '@config/wagmiConfig'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 5,   // 5 min
      gcTime:             1000 * 60 * 10,  // 10 min
      retry:              2,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * WalletProvider
 * Wrap your entire React tree with this component to enable:
 *  - Wagmi hooks (useAccount, useConnect, useBalance, etc.)
 *  - TanStack Query (used internally by Wagmi v2)
 *
 * Usage:
 *   <WalletProvider>
 *     <App />
 *   </WalletProvider>
 */
export default function WalletProvider({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
