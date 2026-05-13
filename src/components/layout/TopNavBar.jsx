// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — TopNavBar
// Contains: hamburger, page title, chain badge, Connect Wallet button
// ─────────────────────────────────────────────────────────────────────────────
import { Menu, Bell, AlertTriangle, Wallet, ChevronDown,
         LogOut, Copy, ExternalLink, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@context/AppContext'
import { useWallet } from '@hooks/useWallet'

// ── Chain badge colours ───────────────────────────────────────────────────────
const CHAIN_COLOURS = {
  blue:   'bg-blue-500/15 text-blue-400   border-blue-500/25',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  slate:  'bg-slate-700/50   text-slate-400  border-slate-600/50',
}

export default function TopNavBar({ pageTitle = 'Dashboard' }) {
  const { toggleSidebar }  = useApp()
  const {
    address, shortAddress, isConnected, isConnecting,
    chainMeta, isWrongNetwork,
    connectMetaMask, disconnect, formattedBalance,
  } = useWallet()

  const [walletOpen, setWalletOpen]     = useState(false)
  const [copied, setCopied]             = useState(false)
  const [notifOpen, setNotifOpen]       = useState(false)

  const chainColour = CHAIN_COLOURS[chainMeta?.color] ?? CHAIN_COLOURS.slate

  // ── Copy address ──────────────────────────────────────────────────────────
  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="
      sticky top-0 z-20 h-16 flex items-center justify-between
      px-4 lg:px-6 gap-4
      bg-slate-950/80 backdrop-blur-xl
      border-b border-slate-800/60
    ">
      {/* ── Left: hamburger + page title ──────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-100 truncate">{pageTitle}</h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* ── Right: notifications + wallet ─────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Wrong network warning */}
        {isConnected && isWrongNetwork && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl
            bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Wrong Network
          </div>
        )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
          >
            <Bell className="w-5 h-5" />
            {/* Unread dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 border border-slate-950" />
          </button>

          {notifOpen && (
            <div className="
              absolute right-0 top-full mt-2 w-80
              glass-card shadow-card-hover overflow-hidden z-50 animate-fade-in
            ">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
                <p className="text-sm font-semibold text-slate-200">Notifications</p>
                <span className="badge-ai text-[10px]">3 new</span>
              </div>
              <ul className="divide-y divide-slate-800/40">
                {[
                  { title: 'New escrow created', time: '2m ago',  dot: 'bg-blue-400'    },
                  { title: 'Transaction confirmed', time: '18m ago', dot: 'bg-emerald-400' },
                  { title: 'AI features unlocking in Phase 2', time: '1h ago', dot: 'bg-amber-400' },
                ].map((n, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.dot}`} />
                    <div>
                      <p className="text-xs text-slate-200">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-slate-800/60">
                <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Wallet Button ────────────────────────────────────────── */}
        <div className="relative">
          {!isConnected ? (
            /* Not connected */
            <button
              onClick={connectMetaMask}
              disabled={isConnecting}
              className="btn-primary text-sm"
            >
              {isConnecting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
              ) : (
                <><Wallet className="w-4 h-4" /> Connect Wallet</>
              )}
            </button>
          ) : (
            /* Connected — show address dropdown */
            <>
              <button
                onClick={() => setWalletOpen(o => !o)}
                className="
                  flex items-center gap-2 px-3 py-2 rounded-xl
                  bg-slate-800/80 border border-slate-700/60
                  hover:border-slate-600 hover:bg-slate-800
                  transition-all duration-200 group
                "
              >
                {/* Chain badge */}
                <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${chainColour}`}>
                  {chainMeta?.icon} {chainMeta?.name}
                </span>

                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {address?.slice(2, 4).toUpperCase()}
                </div>

                <span className="hidden sm:block text-xs font-mono text-slate-300 group-hover:text-slate-100 transition-colors">
                  {shortAddress}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${walletOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {walletOpen && (
                <div className="
                  absolute right-0 top-full mt-2 w-72
                  glass-card shadow-card-hover overflow-hidden z-50 animate-fade-in
                ">
                  {/* Header */}
                  <div className="px-4 py-4 border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
                        {address?.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Connected</p>
                        <p className="text-xs font-mono text-slate-400">{shortAddress}</p>
                      </div>
                      <span className={`ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${chainColour}`}>
                        {chainMeta?.icon} {chainMeta?.name}
                      </span>
                    </div>
                    {formattedBalance && (
                      <div className="mt-3 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 mb-0.5">Balance</p>
                        <p className="text-sm font-semibold text-slate-200 font-mono">{formattedBalance}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <ul className="py-1">
                    <li>
                      <button
                        onClick={copyAddress}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 transition-colors"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
                        {copied ? 'Copied!' : 'Copy Address'}
                      </button>
                    </li>
                    <li>
                      <a
                        href={`https://sepolia.etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                        View on Etherscan
                      </a>
                    </li>
                    <li className="border-t border-slate-800/60 mt-1 pt-1">
                      <button
                        onClick={() => { disconnect(); setWalletOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Click-away overlay for dropdowns */}
      {(walletOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setWalletOpen(false); setNotifOpen(false) }}
        />
      )}
    </header>
  )
}
