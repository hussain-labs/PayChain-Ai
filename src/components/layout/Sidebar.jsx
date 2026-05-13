// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Sidebar
// Responsive collapsible sidebar with animated nav links
// ─────────────────────────────────────────────────────────────────────────────
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, ShieldAlert,
  Settings, ChevronLeft, ChevronRight,
  Hexagon, Zap, BookOpen, ExternalLink,
} from 'lucide-react'
import { useApp } from '@context/AppContext'
import { APP_NAME } from '@config/constants'

const NAV_ITEMS = [
  {
    group: 'Main',
    links: [
      { to: '/',             icon: LayoutDashboard, label: 'Dashboard'    },
      { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
      { to: '/disputes',     icon: ShieldAlert,     label: 'Disputes'     },
    ],
  },
  {
    group: 'AI Intelligence',
    badge: 'Soon',
    links: [
      { to: '/intelligence', icon: Zap,      label: 'AI Insights',   comingSoon: true },
      { to: '/reports',      icon: BookOpen, label: 'XAI Reports',   comingSoon: true },
    ],
  },
  {
    group: 'Account',
    links: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useApp()
  const location = useLocation()

  return (
    <>
      {/* ── Mobile backdrop ───────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ── Sidebar panel ────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-screen flex flex-col
          bg-slate-950/95 backdrop-blur-xl
          border-r border-slate-800/60
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-16'}
          lg:relative lg:z-auto lg:translate-x-0
        `}
      >
        {/* ── Logo ───────────────────────────────────────────────── */}
        <div className={`
          flex items-center h-16 px-4 border-b border-slate-800/60
          ${sidebarOpen ? 'justify-between' : 'justify-center'}
        `}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-glow-blue">
                <Hexagon className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0 animate-fade-in">
                <p className="text-sm font-bold text-slate-100 truncate">{APP_NAME}</p>
                <p className="text-[10px] text-slate-500 truncate">Merchant Portal</p>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Expand button (collapsed state) ────────────────────── */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mt-2 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* ── Navigation ─────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-6 no-scrollbar">
          {NAV_ITEMS.map(({ group, badge, links }) => (
            <div key={group}>
              {sidebarOpen && (
                <div className="flex items-center gap-2 px-3 mb-1.5">
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                    {group}
                  </p>
                  {badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                      {badge}
                    </span>
                  )}
                </div>
              )}

              <ul className="space-y-0.5">
                {links.map(({ to, icon: Icon, label, comingSoon }) => {
                  const isActive = location.pathname === to ||
                    (to !== '/' && location.pathname.startsWith(to))

                  return (
                    <li key={to}>
                      <NavLink
                        to={comingSoon ? '#' : to}
                        onClick={comingSoon ? e => e.preventDefault() : undefined}
                        className={`
                          flex items-center rounded-xl text-sm font-medium
                          transition-all duration-200 group relative
                          ${sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'}
                          ${isActive
                            ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                            : comingSoon
                              ? 'text-slate-600 cursor-not-allowed'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'}
                        `}
                        title={!sidebarOpen ? label : undefined}
                      >
                        <Icon className={`shrink-0 w-4 h-4 transition-colors ${
                          isActive ? 'text-blue-400' :
                          comingSoon ? 'text-slate-600' :
                          'text-slate-500 group-hover:text-slate-300'
                        }`} />

                        {sidebarOpen && (
                          <span className="flex-1 truncate">{label}</span>
                        )}

                        {sidebarOpen && comingSoon && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-500 border border-slate-700">
                            Soon
                          </span>
                        )}

                        {/* Tooltip when collapsed */}
                        {!sidebarOpen && (
                          <span className="
                            absolute left-full ml-2 px-2 py-1 rounded-lg
                            bg-slate-800 border border-slate-700
                            text-xs text-slate-200 whitespace-nowrap
                            opacity-0 pointer-events-none
                            group-hover:opacity-100
                            transition-opacity duration-150 z-50
                          ">
                            {label}
                            {comingSoon && <span className="ml-1 text-blue-400">(Soon)</span>}
                          </span>
                        )}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Footer ─────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-t border-slate-800/60">
            <div className="glass-card p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-semibold text-slate-300">Phase 1 — Active</p>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                AI &amp; blockchain features coming in Phase 2.
              </p>
              <a
                href="https://github.com/hussain-labs/PayChain-Ai"
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
              >
                View on GitHub <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
