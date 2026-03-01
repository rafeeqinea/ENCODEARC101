# ArcTreasury

An autonomous AI agent that manages a Web3 treasury on Arc Testnet. It monitors FX rates, executes swaps, optimizes yield, and handles cross-chain transfers — all without human intervention.

Built for the **Encode × Arc Enterprise & DeFi Hackathon** (Feb 2026).

---

## How It Works

The agent runs a 30-second loop:

1. **Reads** on-chain balances + Stork oracle prices
2. **Decides** what to do (swap USDC↔EURC? park idle funds in yield? fund an upcoming payment?)
3. **Executes** the transaction on-chain through the ArcTreasury smart contract
4. **Logs** the decision with confidence score, reasoning, and tx hash

No manual approvals. The AI evaluates risk, checks upcoming obligations, and acts.

---

## What's Inside

**Backend** — Python/FastAPI running the AI agent loop, strategy engine, risk assessor, and 20+ REST endpoints.

**Frontend** — React dashboard with 11 pages: live balances, agent decisions, FX trading, yield tracking, cross-chain bridge, transaction history, contract explorer, and more.

**Smart Contracts** — `ArcTreasury.sol` on Arc Testnet with conditional escrow, vesting schedules, batch payouts, and emergency pause. All behind ReentrancyGuard + role-based access.

**AI** — Gemini 2.5 Flash for strategic decisions + local Ollama (phi3:mini) for the chatbot so it doesn't burn API tokens.

---

## Bounty Tracks

| Track | What We Built |
|-------|--------------|
| Circle USDC & CCTP | Cross-chain USDC transfers via CCTP V2 (burn → attest → mint) |
| Circle StableFX | USDC↔EURC institutional FX swaps with fee tracking and receipts |
| Hashnote USYC | Auto-deposit idle USDC into tokenized T-Bills (~4.5% APY), auto-withdraw before payments |
| Stork Oracle | Real-time price feeds driving the agent's swap decisions |
| Arc Testnet | Full contract suite deployed and executing real transactions |
| Bonus: AI Agent | Autonomous decision loop with ML forecasting and confidence scoring |

---

## Running It

**Backend:**
```bash
cd ArcTreasure
pip install -r agent/requirements.txt
# set up agent/.env with your keys (see .env.example)
python -m uvicorn agent.main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd ArcTreasure/frontend
npm install
npx vite --port 5173
```

**Local chatbot (optional, saves API tokens):**
```bash
winget install Ollama.Ollama
ollama pull phi3:mini
# auto-starts with Windows, no manual launch needed
```

Open `localhost:5173`, connect MetaMask to Arc Testnet (chain 5042002), and the agent starts running.

---

## Contracts on Arc Testnet

| Contract | Address |
|----------|---------|
| ArcTreasury | `0x624bfC2a364C83c42F980F878c2177F76230dd44` |
| MockUSDC | `0xe91eEBa8C8D3fD2Aed35319AD106Cf1bf29eAdd6` |
| MockEURC | `0x7B70323630E887f514A33388B99dd86CA0855E23` |
| MockUSYC | `0x17ae4a6987d10044340AAbFB4108F77e85313E90` |

[View on ArcScan →](https://testnet.arcscan.app/address/0x624bfC2a364C83c42F980F878c2177F76230dd44)

---

## Project Structure

```
agent/           Python backend — AI loop, strategy, risk, oracle, FX, bridge
├── main.py      FastAPI app with all endpoints
├── agent_loop.py   30s autonomous cycle
├── ai_agent.py     Gemini integration
├── blockchain.py   Web3 contract calls
├── strategy.py     Rule-based + ML strategy
├── oracle.py       Stork price feeds
├── stablefx.py     Circle FX client
├── cctp.py         CCTP V2 bridge
└── risk.py         VaR, Sharpe, concentration

contracts/       Solidity — escrow, vesting, batch payout, pausable
frontend/src/    React — 11 pages, dark mode, glow effects, recharts
```

---

## Env Vars

```
PRIVATE_KEY          Agent wallet key
ARC_RPC_URL          https://rpc.testnet.arc.network
TREASURY_CONTRACT    Deployed vault address
USDC_ADDRESS         MockUSDC on Arc
EURC_ADDRESS         MockEURC on Arc
USYC_ADDRESS         MockUSYC on Arc
STABLEFX_API_KEY     Circle StableFX
STORK_API_KEY        Stork oracle
GEMINI_API_KEY       Google Gemini
```

---

## Stack

Solidity 0.8.20 · Python 3.12 · FastAPI · Web3.py · React 19 · Vite 7 · Tailwind v4 · Recharts · Framer Motion · Gemini 2.5 Flash · Ollama · Stork Network · Circle CCTP V2 · Circle StableFX · Arc Testnet