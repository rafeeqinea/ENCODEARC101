# Submission — Track 2: Best Agentic Commerce Powered by RWAs

## Project: ArcTreasury — AI-Powered Autonomous Treasury Management Agent
**Builder:** Mohammed Rafeeq Faraaz Shaik (Solo Builder)
**Hackathon:** Encode x Arc Enterprise & DeFi Hackathon, February 2026

---

## What Makes ArcTreasury "Agentic Commerce"

ArcTreasury is a fully autonomous AI agent that manages enterprise treasury operations — making financial decisions, executing on-chain transactions, and optimizing capital allocation — **without any human intervention**. It combines real-world asset exposure (USYC/tokenized T-bills) with agentic decision-making (Google Gemini 2.5 Flash) to create a self-operating financial system.

### The Agent Architecture

The ArcTreasury agent runs a continuous 30-second decision loop:

```
┌─────────────────────────────────────────────────────┐
│                  AGENT LOOP (30s)                    │
│                                                     │
│  1. Sense    → Fetch on-chain balances              │
│  2. Observe  → Get FX rates (Stork Oracle)          │
│  3. Forecast → ML prediction (linear regression)    │
│  4. Assess   → Risk scoring (VaR, concentration)    │
│  5. Reason   → AI decision (Gemini 2.5 Flash)       │
│  6. Act      → Execute on-chain transaction         │
│  7. Report   → Broadcast via WebSocket              │
└─────────────────────────────────────────────────────┘
```

This is true **agentic** behavior — the system senses its environment, reasons about state, and takes autonomous action. It's not a chatbot that waits for instructions; it's a continuously operating financial agent.

### RWA Integration: USYC (Tokenized US Treasury Bills)

USYC represents the **real-world asset** layer. When the agent identifies idle capital:

- **Deposit:** Surplus USDC is automatically parked in USYC, gaining exposure to US Treasury bill yields (4.5% APY)
- **Withdraw:** When liquidity is needed for obligations, the agent withdraws from USYC just-in-time
- **Risk Balance:** The risk assessor continuously monitors the idle-vs-yielding ratio to maximize RWA exposure while maintaining operational liquidity

This means the agent is actively managing **real-world financial instruments** (US Treasuries via tokenization) as part of its autonomous commerce operations.

### Decision Intelligence: Gemini 2.5 Flash

Every agent cycle sends a comprehensive state package to Google Gemini 2.5 Flash:

- Current balances (USDC, EURC, USYC)
- Live FX rate from Stork Oracle
- ML forecast (direction, confidence, R²)
- Risk metrics (VaR, concentration score, volatility)
- Upcoming payment obligations

The model returns a structured JSON decision with action, reasoning, amount, and confidence. The full reasoning is stored and displayed in the Decision Detail Modal, making the agent's thought process transparent.

**Fallback Safety:** If the AI model is unavailable, the system falls back to a deterministic rule-based strategy (`TreasuryStrategy`) using threshold logic — ensuring the agent never stops operating.

### Commerce Operations

The agent executes four categories of financial commerce:

| Operation | Trigger | RWA Connection |
|-----------|---------|----------------|
| **YIELD_DEPOSIT** | Idle USDC > $50K, no imminent payments | Parks capital in USYC (tokenized T-bills) |
| **YIELD_WITHDRAW** | USDC needed for payment, locked in USYC | Exits RWA position for liquidity |
| **FX_SWAP** | EURC obligation or ML forecast signal | StableFX institutional FX routing |
| **PAYOUT** | Obligation due within 24h | Executes cross-border payment |

Each operation is:
- **Autonomous** — no human approval needed
- **On-chain** — settled via the ArcTreasury Solidity vault
- **Traceable** — linked to a transaction hash and decision ID
- **Broadcast** — pushed to connected dashboards via WebSocket in real-time

### Agentic Chat Interface

The dashboard includes a floating AI chat widget powered by Gemini 2.5 Flash. Users can ask natural language questions about the treasury state:

- "Why did you swap USDC to EURC?"
- "What's my current yield position?"
- "Are there any high-risk factors?"

The chatbot has full context of the treasury state (balances, FX rates, obligations, risk) and responds with actionable insights. This creates a **conversational commerce** layer on top of the autonomous agent.

### Smart Contract Layer

The `ArcTreasury.sol` vault contract on Arc Testnet provides the on-chain settlement:

- **Access Control:** `onlyAgent` modifier allows both owner and AI agent wallet
- **Atomic Operations:** FX swaps, yield deposits/withdrawals are atomic on-chain transactions
- **Event Emission:** Every action emits events (`FXSwapExecuted`, `YieldDeposited`, `AgentDecision`) for auditability
- **Gas in USDC:** Arc Testnet's USDC gas model means the agent only thinks in stablecoin terms — no ETH management

---

## Why This Is Best-in-Class Agentic Commerce

1. **True Autonomy** — The agent runs 24/7 with zero human input. It senses, reasons, and acts independently.
2. **RWA-Native** — USYC (tokenized T-bills) isn't a demo feature; it's the primary yield vehicle the agent manages.
3. **Multi-Modal Intelligence** — Combines ML forecasting (statistical), AI reasoning (Gemini), and rule-based fallbacks.
4. **Full Observability** — Every decision includes a snapshot (balances, FX rate, forecast, risk) so you can audit exactly why the agent acted.
5. **Real-Time Dashboard** — WebSocket-powered React UI shows agent decisions as they happen, with animated confidence bars and detailed reasoning modals.
6. **Conversational Layer** — Natural language chat lets humans query the agent's state and reasoning without disrupting autonomous operation.

---

## Architecture Summary

```
Stork Oracle ──→ ML Forecaster ──→ Risk Assessor ──→ Gemini 2.5 Flash
     │                                                      │
     └── FX Rates                                    Decision JSON
                                                           │
                                              ┌────────────┼────────────┐
                                              ▼            ▼            ▼
                                         USYC Vault   StableFX     Payouts
                                         (RWA Yield)  (FX Swap)   (Settlement)
                                              │            │            │
                                              └────────────┼────────────┘
                                                           ▼
                                                    Arc Testnet
                                                  (On-Chain Settlement)
                                                           │
                                                    WebSocket Broadcast
                                                           │
                                                    React Dashboard
```

---

*Built by Mohammed Rafeeq Faraaz Shaik for the Encode x Arc Enterprise & DeFi Hackathon, February 2026.*
