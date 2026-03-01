<div align="center">

# ⚡ ArcTreasury

### AI-Powered Autonomous Treasury Management Agent

**Built for the Encode × Arc Enterprise & DeFi Hackathon (Feb 2026)**

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](contracts/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](agent/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](frontend/)
[![Arc Testnet](https://img.shields.io/badge/Arc_Testnet-Live-F97316)](https://testnet.arcscan.app)

</div>

---

## 🧠 What Is This?

ArcTreasury is a **fully autonomous AI agent** that manages a Web3 treasury without human intervention. It watches market conditions, thinks through strategy, and executes real on-chain transactions — all in a 30-second loop.

```
👀 WATCH          🧠 THINK           ⚡ ACT
Stork Oracle  →   Gemini AI      →   On-chain Tx
FX Rates          Risk Engine         Smart Contracts
Obligations       ML Forecaster       CCTP Bridge
```

**No manual approvals. No multi-sig delays. Just an AI agent managing capital 24/7.**

---

## 🏆 Bounty Tracks Covered

| # | Track | Integration | Status |
|---|-------|-------------|--------|
| 1 | **Circle USDC & CCTP** | Cross-chain USDC transfers via CCTP V2 burn→attestation→mint | ✅ |
| 2 | **Circle Stablecoin FX (StableFX)** | Real-time USDC↔EURC institutional FX routing | ✅ |
| 3 | **Hashnote USYC** | Tokenized T-Bill yield optimization (4.5% APY) | ✅ |
| 4 | **Stork Oracle** | Real-time price feeds via REST + WebSocket | ✅ |
| 5 | **Arc Testnet Deployment** | Full smart contract suite deployed on Arc | ✅ |
| 🎁 | **Bonus: AI Agent** | Autonomous decision-making with Gemini + local Ollama | ✅ |

---

## ✨ Key Features

### 🤖 Autonomous AI Agent
- **30-second decision loop** — evaluates balances, FX rates, obligations, yield opportunities
- **Gemini 2.5 Flash** for strategic reasoning with confidence scoring (0.55–0.95 range)
- **ML Forecaster** predicts FX rate movements for proactive swaps
- Real on-chain execution via `ArcTreasury.sol` smart contract

### 💱 StableFX Integration
- Institutional USDC↔EURC swaps at oracle rates
- 0.015% fee tracking with trade receipts
- Live rate chart with 1H/6H/24H/7D views

### 🌉 CCTP Cross-Chain Bridge
- USDC transfers across chains via Circle's CCTP V2
- Real-time step progress: Burn → Attestation → Mint
- Transfer history with status tracking

### 📈 Yield Optimization
- Auto-parks idle USDC into USYC (tokenized T-Bills, ~4.5% APY)
- Withdraws before payment obligations are due
- Tracks cumulative yield earned over time

### 🔮 Stork Oracle
- Real-time EURC/USDC price feeds
- WebSocket streaming for live rate updates
- Powers the AI agent's swap decisions

### 🏗️ Smart Contracts
- **ConditionalEscrow** — lock funds until on-chain conditions are met
- **VestingSchedule** — linear token vesting with beneficiary claims
- **BatchPayout** — gas-efficient multi-recipient transfers
- **Pausable** — emergency circuit breaker
- **ReentrancyGuard** — flash loan protection on all state changes
- Full on-chain `TxReceipt` event log for auditability

### 🤖 ArcBot (Local AI Chat)
- Runs **phi3:mini via Ollama** — zero API tokens consumed
- Context-aware: knows live balances, risk score, recent decisions
- Falls back to Gemini cloud if Ollama unavailable

### 🎨 Premium UI
- **11 pages**: Dashboard, Agent, FX Monitor, Yield, Obligations, Contracts, Cross-Chain, Transactions, Nanopayments, Architecture, Settings
- Dark mode with deep glow effects, ambient animations, breathing borders
- Treasury value shimmer, button backglow, chart drop-shadows
- Fully responsive with Framer Motion transitions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                   │
│  Dashboard │ Agent │ FX │ Yield │ Bridge │ Contracts     │
│  Vite 7 · Tailwind v4 · Recharts · Framer Motion        │
└────────────────────────┬────────────────────────────────┘
                         │ REST + WebSocket
┌────────────────────────┴────────────────────────────────┐
│                 BACKEND (FastAPI + Python)                │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐              │
│  │ AI Agent │  │  Strategy │  │   Risk   │              │
│  │ (Gemini) │  │  Engine   │  │ Assessor │              │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘              │
│       │              │              │                    │
│  ┌────┴──────────────┴──────────────┴─────┐              │
│  │           Agent Loop (30s cycle)        │              │
│  │  Watch → Think → Act → Record → Sleep  │              │
│  └────────────────┬───────────────────────┘              │
│                   │                                      │
│  ┌────────┐  ┌────┴───┐  ┌─────────┐  ┌──────────┐      │
│  │ Stork  │  │ Web3   │  │StableFX │  │  CCTP V2 │      │
│  │ Oracle │  │  RPC   │  │  Client │  │  Bridge  │      │
│  └────────┘  └────┬───┘  └─────────┘  └──────────┘      │
└───────────────────┼──────────────────────────────────────┘
                    │
┌───────────────────┴──────────────────────────────────────┐
│              ARC TESTNET (Chain ID: 5042002)              │
│                                                          │
│  ArcTreasury.sol   │  MockUSDC  │  MockEURC  │  MockUSYC │
│  0x624bfC2a...     │  0xe91eEB  │  0x7B7032  │  0x17ae4a │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20.19+ or 22.12+
- **Python** 3.10+
- **Ollama** (optional, for local AI chatbot)
- MetaMask with Arc Testnet configured

### 1. Backend

```bash
cd ArcTreasure

# Install Python dependencies
pip install -r agent/requirements.txt

# Configure environment
cd agent
cp .env.example .env
# Edit .env with your keys (PRIVATE_KEY, STABLEFX_API_KEY, etc.)

# Start the API server
cd ..
python -m uvicorn agent.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd ArcTreasure/frontend

# Install dependencies
npm install

# Start dev server
npx vite --port 5173
```

### 3. Local AI Chatbot (Optional)

```bash
# Install Ollama (one-time)
winget install Ollama.Ollama

# Pull the model (one-time, ~2.2GB)
ollama pull phi3:mini

# Ollama auto-starts with Windows — no manual startup needed
```

### 4. Open the App

1. Go to `http://localhost:5173`
2. Connect MetaMask (Arc Testnet — Chain ID 5042002)
3. The AI agent starts its 30-second loop automatically

---

## 📁 Project Structure

```
ArcTreasure/
├── agent/                  # Python backend
│   ├── main.py             # FastAPI app — 20+ endpoints, agent state, WebSocket
│   ├── agent_loop.py       # Autonomous 30s decision cycle
│   ├── ai_agent.py         # Gemini AI integration with confidence scoring
│   ├── blockchain.py       # ArcClient — Web3 contract interactions
│   ├── strategy.py         # Rule-based + ML-enhanced strategy engine
│   ├── oracle.py           # Stork price feed (REST + WebSocket)
│   ├── stablefx.py         # Circle StableFX client
│   ├── cctp.py             # CCTP V2 cross-chain bridge service
│   ├── risk.py             # VaR, Sharpe, concentration risk
│   ├── forecaster.py       # ML time-series FX predictor
│   ├── seed_data.py        # Realistic demo data generator
│   └── .env                # API keys (not in git)
├── contracts/
│   └── ArcTreasury.sol     # Main vault — escrow, vesting, batch payout, pausable
├── frontend/
│   └── src/
│       ├── pages/          # 11 pages (Dashboard, Agent, FX, Yield, etc.)
│       ├── components/     # TopBar, Sidebar, ChatWidget, StatCard, etc.
│       ├── hooks/          # useTreasury, useApi, useCountUp
│       ├── lib/api.js      # All API calls
│       └── index.css       # Neon dark mode, glow effects, animations
├── scripts/
│   └── deploy.js           # Hardhat deployment script
└── docs/
    └── DEV_HANDOFF.md      # Full project state documentation
```

---

## 🔐 Security

- **ReentrancyGuard** on all state-changing contract functions
- **Pausable** emergency circuit breaker (owner-only)
- **Role-based access**: Owner → Agent → Beneficiary
- `.env` never committed to git — all keys loaded via `os.getenv()`
- `__pycache__` excluded from version control
- **Route guard** verifies MetaMask `eth_accounts` on every page load
- **Account change listener** auto-disconnects on wallet switch

---

## 🔑 Environment Variables

```env
PRIVATE_KEY=           # Agent wallet private key
ARC_RPC_URL=           # https://rpc.testnet.arc.network
TREASURY_CONTRACT=     # Deployed ArcTreasury address
USDC_ADDRESS=          # MockUSDC address
EURC_ADDRESS=          # MockEURC address
USYC_ADDRESS=          # MockUSYC address
STABLEFX_API_KEY=      # Circle StableFX API key
STORK_API_KEY=         # Stork oracle API key
GEMINI_API_KEY=        # Google Gemini AI key
```

---

## 📜 Deployed Contracts (Arc Testnet)

| Contract | Address |
|----------|---------|
| **ArcTreasury** | `0x624bfC2a364C83c42F980F878c2177F76230dd44` |
| MockUSDC | `0xe91eEBa8C8D3fD2Aed35319AD106Cf1bf29eAdd6` |
| MockEURC | `0x7B70323630E887f514A33388B99dd86CA0855E23` |
| MockUSYC | `0x17ae4a6987d10044340AAbFB4108F77e85313E90` |

🔍 [View on ArcScan](https://testnet.arcscan.app/address/0x624bfC2a364C83c42F980F878c2177F76230dd44)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity 0.8.20, OpenZeppelin, Hardhat |
| Backend | Python 3.12, FastAPI, Web3.py, aiohttp |
| AI / ML | Google Gemini 2.5 Flash, Ollama phi3:mini, scikit-learn |
| Frontend | React 19, Vite 7, Tailwind CSS v4, Recharts, Framer Motion |
| Blockchain | Arc Testnet (Chain ID: 5042002) |
| Oracles | Stork Network (REST + WebSocket) |
| FX | Circle StableFX API |
| Bridge | Circle CCTP V2 |

---

<div align="center">

**Built with 🧠 AI + ☕ caffeine for the Encode × Arc Hackathon**

</div>