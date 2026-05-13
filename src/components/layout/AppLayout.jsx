// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — AppLayout
// Main shell: Sidebar + TopNavBar + scrollable content area
// ─────────────────────────────────────────────────────────────────────────────
import { useLocation, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNavBar from './TopNavBar'
import { useApp } from '@context/AppContext'

const PAGE_TITLES = {
  '/':              'Dashboard',
  '/transactions':  'Transactions',
  '/disputes':      'Disputes',
  '/settings':      'Settings',
  '/intelligence':  'AI Intelligence',
  '/reports':       'XAI Reports',
}

export default function AppLayout({ children }) {
  const { sidebarOpen } = useApp()
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'PayChain AI'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNavBar pageTitle={pageTitle} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-6 animate-fade-in">
            {/* Support both layout-as-outlet (React Router) and layout-as-wrapper */}
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}
