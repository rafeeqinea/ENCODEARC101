# ArcTreasury

https://thearctreasury.onrender.com/

Your treasury doesn't sleep. Neither should your treasury manager.

ArcTreasury is an AI agent that sits on top of a Web3 vault and runs it autonomously — watching FX rates, parking idle cash in yield, swapping stablecoins when the price is right, and funding payments before they're due. Every 30 seconds, it wakes up, looks at everything, makes a call, and executes it on-chain. No human in the loop.

Built solo for the **Encode × Arc Hackathon** (Feb 2026). Five bounty tracks. One agent.

🎥 **[Demo Video](https://drive.google.com/file/d/1YFtMgRhSRcPphHwOrn3O-VAnzzWmutea/view?usp=sharing)**

---

## The Loop

Every 30 seconds the agent does this:

```
Read balances from Arc Testnet
      ↓
Pull live EURC/USDC rate from Stork oracle
      ↓
Check if any payments are coming up
      ↓
Ask the AI: "given all this, what should I do?"
      ↓
Execute the decision on-chain via ArcTreasury.sol
      ↓
Log it, sleep, repeat
```

It's not a dashboard that shows you data and waits for you to click buttons. It actually does things.

---

## What it covers

**Circle USDC + CCTP** — Cross-chain USDC transfers. Burn on one chain, wait for Circle attestation, mint on the other. The bridge page shows each step in real time.

**Circle StableFX** — Institutional USDC↔EURC swaps. The agent watches the rate and swaps when it's favorable. Fee tracking, receipts, the whole thing.

**Hashnote USYC** — When the treasury has idle USDC and no payments due for 48h+, the agent parks it in tokenized T-Bills earning ~4.5% APY. Pulls it back out before obligations hit.

**Stork Oracle** — Real-time price feeds that drive the agent's swap decisions. REST polling + WebSocket streaming.

**Arc Testnet** — Everything runs on Arc. Contracts deployed, transactions executing, balances updating on-chain.

**Bonus: the AI isn't just for show** — a local LLM (Ollama Phi-3) makes the actual decisions with confidence scores. The chatbot runs entirely on your machine — no API keys, no cloud calls, no token costs.

---

## The contract

`ArcTreasury.sol` isn't a basic vault. It has:

- Conditional escrow — lock funds until a condition is met on-chain
- Vesting schedules — linear unlock over time, beneficiary claims
- Batch payouts — pay 50 people in one tx
- Emergency pause — owner kills everything instantly
- ReentrancyGuard on every state-changing function
- On-chain receipt events for every operation

Deployed at [`0x624bfC2a364C83c42F980F878c2177F76230dd44`](https://testnet.arcscan.app/address/0x624bfC2a364C83c42F980F878c2177F76230dd44) on Arc Testnet.

---

## The dashboard

11 pages. Not placeholder screens — functional pages pulling real data:

- **Dashboard** — balances, risk score, yield chart, asset allocation pie, recent decisions
- **Agent** — watch it think in real time, trigger manual cycles, see every decision with reasoning
- **FX Monitor** — live EURC/USDC chart, get quotes, execute trades, fee + receipt on completion
- **Yield** — USYC deposit/withdraw history, APY tracking, cumulative earnings
- **Obligations** — upcoming payments the agent needs to fund
- **Cross-Chain** — CCTP bridge interface with step-by-step progress
- **Transactions** — full tx history with search, filters, CSV export
- **Contracts** — every function in the smart contract, expandable with security modifiers
- **Architecture** — how the whole system fits together
- **Settings** — strategy parameters, risk thresholds, toggles
- **Nanopayments** — CPN micropayment exploration

Dark mode with ambient glow effects, breathing borders, shimmer on values. Not a hackathon project that looks like a hackathon project.

---

## Run it

Two terminals:

```bash
# Terminal 1 — backend
cd ArcTreasure
pip install -r agent/requirements.txt
# put your keys in agent/.env (see .env.example)
python -m uvicorn agent.main:app --host 0.0.0.0 --port 8000
```

```bash
# Terminal 2 — frontend
cd ArcTreasure/frontend
npm install
npx vite --port 5173
```

Optional — local AI chatbot (no API tokens needed):
```bash
winget install Ollama.Ollama
ollama pull phi3:mini
# runs automatically in background
```

Open `localhost:5173`. Connect MetaMask to Arc Testnet (chain 5042002). Agent starts immediately.

---

## Contracts

| | Address |
|-|---------|
| ArcTreasury | `0x624bfC2a364C83c42F980F878c2177F76230dd44` |
| USDC | `0xe91eEBa8C8D3fD2Aed35319AD106Cf1bf29eAdd6` |
| EURC | `0x7B70323630E887f514A33388B99dd86CA0855E23` |
| USYC | `0x17ae4a6987d10044340AAbFB4108F77e85313E90` |

---

## Stack

Python · FastAPI · Web3.py · Ollama (Phi-3) · React 19 · Vite 7 · Tailwind v4 · Recharts · Framer Motion · Solidity 0.8.20 · OpenZeppelin · Stork Network · Circle CCTP V2 · Circle StableFX · Arc Testnet
