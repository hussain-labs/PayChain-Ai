# ⬡ PayChain AI — Backend  (Phase 2)

> Express.js · MongoDB · Pinecone · Gemini 3 Flash

The **nervous system** of PayChain AI. Provides the REST API consumed by the
Phase 1 React dashboard and the scaffold for Phase 3/4 AI + blockchain features.

---

## 📁 Folder Structure

```
backend/
├── sample.env                    ← copy → .env and fill in keys
├── src/
│   ├── server.js                 ← entry point: boot sequence
│   ├── app.js                    ← Express factory (pure, testable)
│   ├── config/
│   │   ├── env.js                ← validated env variable access
│   │   └── database.js           ← Mongoose connect/disconnect
│   ├── models/
│   │   ├── Merchant.js           ← identity + metrics + AI stubs
│   │   ├── Transaction.js        ← payments + risk assessment stubs
│   │   ├── Dispute.js            ← disputes + AI arbitration stubs
│   │   └── index.js              ← barrel export
│   ├── services/
│   │   ├── geminiService.js      ← Gemini 3 Flash client + all AI functions
│   │   └── pineconeService.js    ← vector DB client + embedding functions
│   ├── controllers/
│   │   ├── merchantController.js
│   │   ├── transactionController.js
│   │   ├── disputeController.js
│   │   ├── aiController.js
│   │   └── analyticsController.js
│   ├── routes/
│   │   ├── merchantRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── disputeRoutes.js
│   │   ├── aiRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   ├── errorHandler.js       ← global error normaliser + AppError class
│   │   ├── asyncHandler.js       ← promise → next(err) wrapper
│   │   ├── auth.js               ← requireApiKey / requireWallet / optionalWallet
│   │   ├── rateLimiter.js        ← 4 tiers: global / api / ai / onboard
│   │   ├── validate.js           ← express-validator rule sets + runner
│   │   └── requestId.js          ← UUID per-request tracing
│   └── utils/
│       ├── logger.js             ← Winston + daily-rotate-file
│       ├── apiResponse.js        ← sendSuccess / sendCreated / sendError
│       └── walletUtils.js        ← EVM address helpers
└── logs/                         ← auto-created in production
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** running locally (`mongod`) or a MongoDB Atlas URI
- **Pinecone** free account — [app.pinecone.io](https://app.pinecone.io)
- **Gemini API key** — [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 1 · Install dependencies

```bash
cd backend
npm install
```

### 2 · Configure environment

```bash
cp sample.env .env
# Edit .env — fill in MONGODB_URI, PINECONE_API_KEY, GEMINI_API_KEY
```

### 3 · Start the dev server

```bash
npm run dev
# Node --watch restarts on file changes (no nodemon needed on Node ≥ 18)
```

Server boots at `http://localhost:4000`.  
Verify with: `curl http://localhost:4000/health`

---

## 🗺️ API Reference

All endpoints are prefixed `/api/v1`.

### System

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness probe — DB connection state |
| `GET` | `/api/v1` | API discovery root |

### Merchants

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/merchants/onboard` | Register a new merchant wallet ★ |
| `GET` | `/merchants/:walletAddress` | Fetch merchant dashboard profile ★ |
| `GET` | `/merchants` | Paginated merchant list (admin) |
| `PATCH` | `/merchants/:walletAddress` | Update profile fields |
| `DELETE` | `/merchants/:walletAddress` | Soft-delete account |

### Transactions

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/transactions` | Record a new transaction ★ |
| `GET` | `/transactions` | Paginated list (wallet-scoped) ★ |
| `GET` | `/transactions/:txId` | Single transaction + AI detail |
| `PATCH` | `/transactions/:txId/status` | Update transaction status |

### Disputes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/disputes` | Open a dispute ★ |
| `GET` | `/disputes` | Paginated list (wallet-scoped) ★ |
| `GET` | `/disputes/:disputeId` | Single dispute + AI verdict |
| `PATCH` | `/disputes/:disputeId/status` | Update status |
| `POST` | `/disputes/:disputeId/evidence` | Submit evidence |
| `POST` | `/disputes/:disputeId/ai-verdict` | Request AI verdict (Phase 3) |

### AI Intelligence

| Method | Path | Phase | Description |
|--------|------|-------|-------------|
| `GET` | `/ai/status` | 2 ✓ | Service health + feature flags |
| `POST` | `/ai/status-report` | **2 ✓ LIVE** | Gemini merchant status report |
| `POST` | `/ai/risk/:txId` | 3 stub | Transaction fraud risk score |
| `POST` | `/ai/trust/:walletAddress` | 3 stub | Merchant trust score |
| `GET` | `/ai/xai/:txId` | 3 stub | Explainable AI risk report |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/analytics/overview` | 4 KPI metric cards |
| `GET` | `/analytics/sales-trend` | 12-month area/bar chart data |
| `GET` | `/analytics/weekly-revenue` | Current week day-by-day chart |

---

## 🔗 Connecting Phase 1 Frontend

Update `frontend/src/config/constants.js`:

```js
export const API = {
  BASE_URL: 'http://localhost:4000/api/v1',  // ← already set
  ...
}
```

Add the wallet address header to every frontend API call:

```js
fetch(`${API.BASE_URL}/merchants/${walletAddress}`, {
  headers: {
    'x-wallet-address': walletAddress,   // ← enables wallet-scoped endpoints
    'Content-Type': 'application/json',
  },
})
```

---

## 🔮 Phase 3 Implementation Checklist

### A — Wire Gemini Risk Assessment

In `services/geminiService.js`, uncomment the `assessTransactionRisk()` body:
```js
// Phase 3 TODO marker — search "Phase 3 implementation" in geminiService.js
```

### B — Enable Real Embeddings

In `services/pineconeService.js`, implement `generateEmbedding()`:
```js
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
const result = await model.embedContent(textToEmbed)
return result.embedding.values  // 768-dim float[]
```

### C — Add SIWE Authentication

In `middleware/auth.js`, replace `requireWallet` stub with real signature verification:
```js
// Phase 3 TODO: verify ECDSA signature using viem verifyMessage()
```

### D — Enable WalletConnect

Uncomment in `frontend/src/config/wagmiConfig.js`:
```js
walletConnect({ projectId: WALLET_CONNECT_PROJECT_ID })
```

### E — Scheduled Trust Score Jobs

Add a cron job (node-cron or BullMQ) that calls:
```js
import { computeTrustScore } from './services/geminiService.js'
// Run every 24 h for all active merchants
```

---

## 📦 Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| Express | 4.18 | HTTP framework |
| Mongoose | 8 | MongoDB ODM |
| `@google/generative-ai` | 0.3 | Gemini 3 Flash client |
| `@pinecone-database/pinecone` | 2.2 | Vector DB client |
| Winston | 3.12 | Structured logging |
| Helmet | 7 | Security headers |
| express-rate-limit | 7 | Rate limiting |
| express-validator | 7 | Request validation |
| dotenv | 16 | Environment management |

---

## 🛣️ Roadmap

| Phase | Status | Features |
|-------|--------|----------|
| **Phase 1** | ✅ | React dashboard, mock data, wallet connect |
| **Phase 2** | ✅ | Express API, MongoDB, Pinecone stubs, Gemini status reports |
| **Phase 3** | 🔜 | Live AI risk scoring, trust scores, dispute arbitration |
| **Phase 4** | 📋 | Solidity contracts, full vector fraud detection, XAI reports |

---

MIT © [hussain-labs](https://github.com/hussain-labs)
