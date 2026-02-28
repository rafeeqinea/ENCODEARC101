# Submission — Track 1: Best Integration of USYC or StableFX

## Project: ArcTreasury — AI-Powered Autonomous Treasury Management Agent
**Builder:** Mohammed Rafeeq Faraaz Shaik (Solo Builder)
**Hackathon:** Encode x Arc Enterprise & DeFi Hackathon, February 2026

---

## How ArcTreasury Integrates USYC and StableFX

ArcTreasury is an autonomous AI treasury agent that deeply integrates **both USYC and Circle StableFX** as core operational instruments — not as bolted-on features, but as first-class primitives that the AI agent reasons about and acts on every 30 seconds.

### USYC Integration (Tokenized T-Bill Yield)

**The Problem:** Enterprise treasuries hold millions in idle stablecoins that earn zero yield. Manual yield management requires human intervention, is slow, and misses optimization windows.

**Our Solution:** The AI agent autonomously manages USYC positions as part of its decision loop:

1. **Automated Yield Deposits** — When idle USDC exceeds the $50,000 threshold and no payment obligations are imminent, the agent deposits surplus capital into USYC. This earns 4.5% APY from tokenized US Treasury bill exposure without leaving the on-chain ecosystem.

2. **Just-in-Time Withdrawals** — When a payment obligation approaches (within 24 hours), the agent automatically withdraws from USYC back to USDC to fund the payment. This maximizes time-in-yield while ensuring liquidity.

3. **Risk-Aware Allocation** — The risk assessor monitors the ratio of idle USDC vs yield-bearing USYC. If too much capital sits idle (>$100K USDC with <30% in USYC), it flags this as "idle capital risk" and the AI agent acts to rebalance.

4. **Dashboard Tracking** — The Yield page shows cumulative yield earned, deposit/withdrawal history, current APY, and days active. Every yield action is linked to the AI decision that triggered it.

**Smart Contract:** The `ArcTreasury.sol` vault contract has dedicated `depositToYield()` and `withdrawFromYield()` functions that interact with the USYC vault contract, using standard ERC20 approve/transfer patterns.

### StableFX Integration (Institutional FX Swaps)

**The Problem:** Multi-currency treasuries need to swap between USDC and EURC to cover obligations in different currencies. Doing this manually means watching FX rates and hoping for good timing.

**Our Solution:** The AI agent uses StableFX for intelligent, automated FX operations:

1. **Rate Monitoring** — Every agent cycle fetches the live USDC/EURC rate from Circle StableFX. This feeds into both the ML forecaster and the AI decision engine.

2. **ML-Driven Swap Timing** — A linear regression forecaster analyzes the last 24 rate observations to predict EURC/USDC direction. When the model predicts EURC strengthening with >65% confidence, the agent preemptively swaps USDC→EURC before the rate moves unfavorably.

3. **Obligation-Driven Swaps** — When EURC obligations exceed available EURC balance, the agent automatically generates a StableFX quote and executes a swap with a 5% buffer to cover the obligation.

4. **Full Pipeline:** The StableFX integration follows the complete Circle flow: `rate → quote → trade`. The FX Monitor dashboard page displays live rates, historical charts, swap history, and ML forecast overlays.

**Smart Contract:** The `swapFX()` function in `ArcTreasury.sol` executes on-chain FX swaps via the StableFX router contract, approving and swapping tokens atomically.

### How They Work Together

The real power is in the interplay between USYC and StableFX within the autonomous agent loop:

```
Agent Cycle (every 30s):
├── Fetch balances (USDC, EURC, USYC)
├── Get StableFX rate
├── ML forecast on FX direction
├── Risk assessment (concentration, VaR, idle capital)
├── Check obligations (USDC and EURC)
└── AI Decision (Gemini 2.5 Flash):
    ├── If EURC needed → StableFX swap
    ├── If surplus USDC → USYC deposit
    ├── If USDC needed → USYC withdrawal
    └── If balanced → HOLD
```

A typical scenario: The agent detects $300K idle USDC → deposits $175K into USYC (earning yield). Two days later, a €25K obligation appears → the agent withdraws from USYC, then swaps USDC→EURC via StableFX at a favorable ML-predicted rate, and finally executes the payout. All autonomous, all on-chain.

---

## Technical Details

| Component | Technology |
|-----------|-----------|
| USYC Vault | Solidity 0.8.20, ERC20 approve/transfer |
| StableFX Client | Python `httpx`, rate/quote/trade pipeline |
| AI Engine | Google Gemini 2.5 Flash (`google-genai` SDK) |
| ML Forecaster | NumPy + scikit-learn linear regression |
| Smart Contract | `ArcTreasury.sol` with `swapFX()`, `depositToYield()`, `withdrawFromYield()` |
| Dashboard | React 19 + Recharts for yield/FX visualization |
| Blockchain | Arc Testnet (Chain ID: 5042002, USDC gas) |

---

## Why This Integration Stands Out

1. **Both products used deeply** — USYC and StableFX aren't afterthoughts; they're the two primary instruments the AI agent operates
2. **Autonomous operation** — No human clicks buttons; the AI agent evaluates and executes on its own
3. **ML-enhanced** — StableFX swaps aren't random; they're timed by a trained forecaster
4. **Risk-aware** — Every decision considers VaR, concentration risk, and idle capital metrics
5. **Full-stack** — Solidity vault → Python AI agent → React dashboard, all connected in real-time via WebSocket

---

*Built by Mohammed Rafeeq Faraaz Shaik for the Encode x Arc Enterprise & DeFi Hackathon, February 2026.*
