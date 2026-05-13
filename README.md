# ⬡ PayChain AI — Decentralized Merchant Payment Intelligence

> Phase 1 · Merchant Dashboard Frontend

A professional, pixel-perfect **React + Tailwind CSS** merchant dashboard for the PayChain AI decentralized payment system. Built for seamless Phase 2 integration with **Solidity smart contracts** and **Gemini AI** endpoints.

---

## ✨ Features

| Category | Feature |
|---|---|
| **Layout** | Collapsible sidebar, sticky top nav, responsive grid |
| **Wallet** | MetaMask connect/disconnect, balance, chain badge, address copy |
| **Dashboard** | Revenue KPIs, escrow count, analytics charts, recent transactions |
| **Transactions** | Search, filter by status, pagination, Etherscan links |
| **Disputes** | Active dispute cards, countdown timer, AI arbitration placeholder |
| **Settings** | Profile, wallet config, notifications, security, API keys |
| **AI Placeholders** | Fraud Alerts, Trust Score, XAI Reports — glassmorphism overlays |
| **Theming** | Deep slate + vibrant blue + emerald FinTech palette |

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── layout/         # AppLayout, Sidebar, TopNavBar
│   ├── ui/             # MetricCard, TransactionsTable, ComingSoonOverlay, …
│   ├── charts/         # SalesTrendChart, WeeklyRevenueChart (Recharts)
│   └── intelligence/   # FraudAlerts, TrustScoreCard, XAIReport
├── pages/              # Dashboard, Transactions, Disputes, Settings, NotFound
├── hooks/              # useWallet, useTransactions, useMerchant
├── context/            # WalletProvider (Wagmi), AppContext (UI state)
├── config/             # constants.js, wagmiConfig.js, mockData.js, abis.js
└── styles/             # globals.css (Tailwind layers)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18  
- **npm** ≥ 9  
- **MetaMask** browser extension (for wallet features)

### 1. Clone & Install

```bash
git clone https://github.com/hussain-labs/PayChain-Ai.git
cd PayChain-Ai
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local — see comments inside for each variable
```

For **Phase 1** (mock data only), no environment variables are required.

### 3. Start Development Server

```bash
npm run dev
# → http://localhost:5173
```

### 4. Build for Production

```bash
npm run build
npm run preview   # preview production build locally
```

---

## 🔗 Phase 2 Integration Guide

### A — Drop in Contract Addresses

Open `src/config/constants.js` and replace the zero addresses:

```js
export const CONTRACTS = {
  ESCROW_MANAGER: {
    address: '0xYOUR_DEPLOYED_ESCROW_MANAGER',   // ← paste here
    chainId: SUPPORTED_CHAIN_IDS.SEPOLIA,
  },
  PAYMENT_ROUTER: {
    address: '0xYOUR_DEPLOYED_PAYMENT_ROUTER',
    chainId: SUPPORTED_CHAIN_IDS.SEPOLIA,
  },
  // … etc
}
```

### B — Add Contract ABIs

Open `src/config/abis.js` and paste the ABI arrays from your Hardhat/Foundry artifacts:

```js
export const ESCROW_MANAGER_ABI = [
  // paste from artifacts/contracts/EscrowManager.sol/EscrowManager.json → abi
]
```

### C — Enable WalletConnect

1. Get a project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Add to `.env.local`: `VITE_WALLETCONNECT_PROJECT_ID=your_id`
3. Uncomment the `walletConnect` connector in `src/config/wagmiConfig.js`

### D — Connect Gemini AI

Replace mock hooks in `src/hooks/` with real `useQuery` calls:

```js
// src/hooks/useMerchant.js — Phase 2 example
import { useQuery } from '@tanstack/react-query'
import { API } from '@config/constants'

export function useMerchant() {
  return useQuery({
    queryKey: ['merchant'],
    queryFn: () => fetch(`${API.BASE_URL}${API.MERCHANT}`).then(r => r.json()),
  })
}
```

> ⚠️ **Never** call the Gemini API directly from the browser. Route all AI calls through your backend to protect your API key.

### E — Live Contract Reads

Use Wagmi's `useReadContract` hook in your hooks:

```js
import { useReadContract } from 'wagmi'
import { CONTRACTS, TRUST_SCORE_ORACLE_ABI } from '@config'

export function useTrustScore(address) {
  return useReadContract({
    address: CONTRACTS.TRUST_SCORE_ORACLE.address,
    abi:     TRUST_SCORE_ORACLE_ABI,
    functionName: 'getScore',
    args:    [address],
  })
}
```

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `brand-500` | `#3b82f6` | Primary blue — CTAs, active states |
| `emerald-400` | `#34d399` | Success, revenue up |
| `amber-400` | `#fbbf24` | Pending, warnings |
| `rose-400` | `#fb7185` | Failed, disputes, errors |
| `slate-950` | `#080d18` | Page background |
| `slate-900` | `#0f172a` | Card background |

### Key CSS Classes (defined in `globals.css`)

```
.glass-card          — dark glassmorphism card
.glass-card-hover    — card with hover elevation
.ai-glass            — blue-tinted AI panel
.gradient-text       — blue→cyan gradient text
.badge-success/pending/failed/ai — status chips
.btn-primary/secondary/ghost     — button variants
.shimmer             — loading skeleton animation
.data-table          — table base styles
```

---

## 📦 Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| Wagmi | 2 | Ethereum wallet hooks |
| Viem | 2 | Ethereum primitives |
| TanStack Query | 5 | Async state management |
| React Router | 6 | Client-side routing |
| Recharts | 2 | Charts |
| Lucide React | 0.344 | Icons |

---

## 🛣️ Roadmap

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Complete | Frontend UI, mock data, wallet connection |
| **Phase 2** | 🔜 Upcoming | Solidity contracts, Gemini AI, live data |
| **Phase 3** | 📋 Planned | Mobile app, multi-chain, DAO governance |

---

## 📄 License

MIT © [hussain-labs](https://github.com/hussain-labs)
