# ArcTreasury — Developer Handoff & Session State

> Use this document to continue development in any AI coding tool (Copilot, Cursor, Claude Code, etc.)

## Project Overview

ArcTreasury is an AI-powered autonomous treasury management agent for the **Encode x Arc Enterprise & DeFi Hackathon (Feb 2026)**. Solo builder: Mohammed Rafeeq Faraaz Shaik.

**3 Bounty Tracks:**
1. Best Integration of USYC or StableFX
2. Best Agentic Commerce Powered by RWAs
3. Build Global Payouts and Treasury Systems

## Tech Stack
- **Smart Contracts:** Solidity 0.8.20+ on Arc Testnet (Chain ID: 5042002, gas = USDC)
- **Backend:** Python 3.12, FastAPI, Web3.py, Google Gemini 2.5 Flash (`google-genai` SDK)
- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Recharts, Framer Motion, Lucide icons
- **Integrations:** Circle StableFX (FX swaps), USYC (tokenized T-bills), Stork Oracle (price feeds)

## Directory Structure
```
C:\Encode\ArcTreasure\
├── agent/                  # Python FastAPI backend
│   ├── main.py             # Core API (14+ endpoints, agent loop, WebSocket)
│   ├── ai_agent.py         # Gemini 2.5 Flash decision engine
│   ├── agent_loop.py       # 30s autonomous cycle loop
│   ├── strategy.py         # Rule-based fallback strategy
│   ├── forecaster.py       # ML FX forecaster (linear regression)
│   ├── risk.py             # Risk assessor (VaR, concentration)
│   ├── blockchain.py       # Arc Testnet Web3 client
│   ├── oracle.py           # Stork Oracle client
│   ├── stablefx.py         # Circle StableFX API client
│   ├── seed_data.py        # Realistic mock data generator
│   ├── config.py           # Environment config loader
│   ├── models.py           # Pydantic models
│   ├── .env                # API keys (Gemini, StableFX, wallet key, Stork)
│   └── requirements.txt    # Python deps
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Agent, FXMonitor, Yield, Obligations, Architecture, Landing
│   │   ├── components/     # StatCard, DecisionItem, DecisionDetailModal, Sidebar, TopBar, etc.
│   │   ├── hooks/          # useApi, useTreasury, useWebSocket, useCountUp
│   │   ├── lib/            # api.js, formatters.js, mockData.js
│   │   └── index.css       # Tailwind v4 theme (dark mode liquid glass)
│   └── vite.config.js      # Proxy: /api→:8000, /ws→ws://:8000
├── contracts/              # Solidity ArcTreasury vault
├── scripts/                # Hardhat deploy script
├── docs/                   # Documentation (ARCHITECTURE.md, CIRCLE_FEEDBACK.md, this file)
└── venv/                   # Python virtual environment
```

## Running the Project
```bash
# Backend (terminal 1)
cd C:\Encode\ArcTreasure
source venv/Scripts/activate
python -m uvicorn agent.main:app --port 8000 --reload

# Frontend (terminal 2)
cd C:\Encode\ArcTreasure\frontend
npm run dev
```
Frontend: http://localhost:5173 | Backend: http://localhost:8000

## What Was Done (Bugs Fixed)
1. `main.py` — Fixed `api_agent_run()` → `run_agent_cycle()` (function didn't exist)
2. `main.py` — Removed duplicate `import logging`
3. `agent_loop.py` — Removed duplicate field assignments, added exponential backoff on RPC 429 errors
4. `stablefx.py` — Fixed source misreporting (said "stablefx" even when using mock fallback)
5. `ai_agent.py` — Migrated from deprecated `google.generativeai` to `google.genai` SDK
6. `Sidebar.jsx` — Fixed all 6 nav paths (was `/agent`, should be `/dashboard/agent`)
7. `Dashboard.jsx` — Fixed all internal `<Link>` paths
8. `Architecture.jsx` — Fixed 3 broken `<Link>` paths
9. `Yield.jsx` — Fixed agent link path

## What Was Just Built (Latest Session)

### Decision Detail Modal (NEW)
**Files created/modified:**
- `frontend/src/components/DecisionDetailModal.jsx` — **NEW** modal component
- `frontend/src/components/DecisionItem.jsx` — Updated: `onSelect` prop replaces `handleNavigate`
- `frontend/src/pages/Agent.jsx` — Added modal state, renders `DecisionDetailModal`
- `frontend/src/pages/Dashboard.jsx` — Same modal wiring for compact decision items
- `agent/main.py` — Decisions now include `snapshot` field (balances, fx_rate, forecast, risk, recommendation)
- `agent/seed_data.py` — Seed decisions also include snapshot data

**What it does:** Click any decision in Agent feed or Dashboard → blurred backdrop appears → popup modal shows:
- Action type header with icon
- Amount + token pair
- Animated confidence bar
- Full Gemini AI reasoning (untruncated)
- ML forecast badge (direction, change%, R²)
- Risk gauge (score circle + VaR)
- Treasury balances at time of decision
- FX rate at decision time
- Transaction hash with ArcScan link
- Source badge (Gemini 2.5 Flash or Agent)

**Status:** Frontend build passes cleanly. Backend needs restart for seed data snapshots.

### Phase 3 Docs (Partially Done)
- `docs/ARCHITECTURE.md` — DONE (Mermaid diagrams, full system description)
- `docs/CIRCLE_FEEDBACK.md` — DONE (USYC, StableFX, CPN feedback)
- `docs/SUBMISSION_TRACK1.md` — NOT YET CREATED
- `docs/SUBMISSION_TRACK2.md` — NOT YET CREATED
- `docs/SUBMISSION_TRACK3.md` — NOT YET CREATED

## What Was Done (Latest Continuation Session)

### Submission Track Documents (NEW)
- `docs/SUBMISSION_TRACK1.md` — **CREATED**: Best Integration of USYC or StableFX
- `docs/SUBMISSION_TRACK2.md` — **CREATED**: Best Agentic Commerce Powered by RWAs
- `docs/SUBMISSION_TRACK3.md` — **CREATED**: Build Global Payouts and Treasury Systems

### Gemini Chatbot (NEW)
- `agent/main.py` — Added `POST /api/chat` endpoint with full treasury context injection into Gemini 2.5 Flash
- `frontend/src/components/ChatWidget.jsx` — **NEW**: Floating chat widget with animated open/close, message history, typing indicator
- `frontend/src/layouts/DashboardLayout.jsx` — Wired ChatWidget into layout (appears on all dashboard pages)
- `frontend/src/lib/api.js` — Added `chat()` API method

**Chatbot features:**
- Floating orange button in bottom-right corner
- Opens to a 380×520px chat panel with header, scrollable messages, and input
- Sends user message + full treasury context (balances, FX, risk, obligations, recent decisions, yield) to Gemini
- Graceful fallback if AI key unavailable (returns treasury snapshot)
- Matches the liquid glass dark mode theme

## What Still Needs to Be Done
1. **Restart backend** — so enriched seed data with snapshots takes effect and chat endpoint is live
2. **Optional: Dashboard screenshot** in README.md
3. **StableFX API key** — returns 401, likely expired. Falls back to mock gracefully. Guide says this is fine for judges.
4. **Stork Oracle** — returns 404, falls back to mock. Guide says this is expected.

## Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/balances` | GET | Treasury USDC/EURC/USYC balances |
| `/api/agent` | GET | Agent status, total decisions, cycle interval |
| `/api/decisions` | GET | Full decision history with snapshots |
| `/api/agent/run` | POST | Trigger one manual agent cycle |
| `/api/fx` | GET | FX rate history, swaps, forecast direction |
| `/api/yield` | GET | Yield history, APY, total earned |
| `/api/obligations` | GET/POST | Payment obligations CRUD |
| `/api/risk` | GET | Risk score, VaR, factors |
| `/api/forecast` | GET | ML prediction + recommendation |
| `/api/stablefx/rate` | GET | Live StableFX rate |
| `/api/stablefx/quote` | GET | FX swap quote |
| `/api/stablefx/trade` | POST | Execute FX swap |
| `/api/wallet` | GET | Agent wallet address + USDC gas balance |
| `/api/chat` | POST | Gemini-powered treasury chatbot |
| `/ws` | WebSocket | Real-time decision broadcasts |

## Agent Run Cycle (POST /api/agent/run)
1. Fetch balances (on-chain or seed)
2. Get EURC/USDC rate (Stork oracle)
3. Get USYC yield info
4. Check pending obligations
5. ML forecast (linear regression on last 24 rates)
6. Risk assessment (VaR, concentration, volatility)
7. Send ALL above to Gemini 2.5 Flash → get JSON decision
8. Record decision with snapshot + ID + timestamp + tx hash
9. Apply effects (update balances, mark obligations)
10. Broadcast via WebSocket to dashboard

## Environment Variables (agent/.env)
```
ARC_RPC_URL=https://rpc.testnet.arc.network
PRIVATE_KEY=<wallet private key>
TREASURY_CONTRACT=0x...
USDC_ADDRESS=0x...
EURC_ADDRESS=0x...
USYC_ADDRESS=0x...
STABLEFX_API_KEY=TEST_API_KEY:<id>:<secret>
STORK_API_KEY=demo
AI_API_KEY=<Gemini API key>
```
