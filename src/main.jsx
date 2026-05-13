// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — main.jsx
// Application entry point: providers → router → app
// ─────────────────────────────────────────────────────────────────────────────
import React       from 'react'
import ReactDOM    from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import WalletProvider  from '@context/WalletProvider'
import { AppProvider } from '@context/AppContext'
import App             from './App'

import '@styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Wagmi v2 + TanStack Query */}
    <WalletProvider>
      {/* 2. Global UI state (sidebar, notifications) */}
      <AppProvider>
        {/* 3. React Router */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </WalletProvider>
  </React.StrictMode>
)
