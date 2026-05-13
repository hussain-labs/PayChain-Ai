// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — App.jsx
// Root component: React Router v6 routes wrapped in AppLayout
// ─────────────────────────────────────────────────────────────────────────────
import { Routes, Route } from 'react-router-dom'
import AppLayout   from '@components/layout/AppLayout'
import { Dashboard, Transactions, Disputes, Settings, NotFound } from '@pages'

export default function App() {
  return (
    <Routes>
      {/* All authenticated pages share AppLayout shell */}
      <Route element={<AppLayout />}>
        <Route index          element={<Dashboard    />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="disputes"     element={<Disputes     />} />
        <Route path="settings"     element={<Settings     />} />
      </Route>

      {/* 404 — no layout */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
