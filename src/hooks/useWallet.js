// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — useWallet hook
// Convenience wrapper around Wagmi v2 hooks for connect/disconnect/balance.
// Phase 2: Add contract-read hooks here using useReadContract / useWriteContract
// ─────────────────────────────────────────────────────────────────────────────
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { DEFAULT_CHAIN_ID } from '@config/constants'
import { getChainMeta } from '@config/wagmiConfig'

export function useWallet() {
  const { address, isConnected, isConnecting, isDisconnected, status } = useAccount()
  const { connect, isPending: isConnectPending }  = useConnect()
  const { disconnect }                             = useDisconnect()
  const chainId                                    = useChainId()
  const { switchChain, isPending: isSwitching }   = useSwitchChain()

  const { data: balanceData } = useBalance({
    address,
    enabled: isConnected,
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  const connectMetaMask = () => connect({ connector: injected({ target: 'metaMask' }) })

  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : null

  const formattedBalance = balanceData
    ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
    : null

  const isWrongNetwork = isConnected && chainId !== DEFAULT_CHAIN_ID
  const chainMeta      = getChainMeta(chainId)

  const switchToDefault = () => switchChain({ chainId: DEFAULT_CHAIN_ID })

  return {
    // State
    address,
    shortAddress,
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    isDisconnected,
    status,
    chainId,
    chainMeta,
    isWrongNetwork,
    isSwitching,
    balance: balanceData,
    formattedBalance,
    // Actions
    connectMetaMask,
    disconnect,
    switchToDefault,
  }
}
