# Submission — Track 3: Build Global Payouts and Treasury Systems

## Project: ArcTreasury — AI-Powered Autonomous Treasury Management Agent
**Builder:** Mohammed Rafeeq Faraaz Shaik (Solo Builder)
**Hackathon:** Encode x Arc Enterprise & DeFi Hackathon, February 2026

---

## ArcTreasury as a Global Payout & Treasury System

ArcTreasury is a complete **end-to-end treasury management system** that automates global payouts across currencies. It manages the full lifecycle: capital intake, yield optimization, FX routing, obligation tracking, and cross-border settlement — all orchestrated by an autonomous AI agent on Arc Testnet.

### The Global Payout Pipeline

```
Capital Intake (USDC)
    │
    ├── Idle Capital → USYC Yield Vault (4.5% APY on T-bills)
    │
    ├── FX Need Detected → StableFX Swap (USDC → EURC)
    │                       ↑
    │                  ML Forecaster (optimal timing)
    │
    └── Obligation Due → Payout Execution
                          ├── USDC payouts (direct)
                          └── EURC payouts (via StableFX → CPN settlement)
```

### Obligation Management System

The treasury system tracks payment obligations with full lifecycle management:

| Field | Purpose |
|-------|---------|
| `recipient` | Who gets paid (vendor, payroll, partner) |
| `amount` | Payment amount |
| `currency` | USDC or EURC |
| `due_date` | When payment is due |
| `status` | `pending` → `funded` → `paid` (or `overdue`) |
| `funded_by` | Which agent decision funded this obligation |
| `timeline` | Full audit trail of status changes |

**Lifecycle:**
1. **Created** — Obligation is registered (via API or dashboard)
2. **Funded** — Agent detects sufficient balance and marks as funded
3. **Paid** — Agent executes the payout transaction when due within 24h
4. **Overdue** — If unfunded past due date (triggers priority handling)

The agent auto-triggers an evaluation cycle whenever a new obligation is created, ensuring immediate response to new payment needs.

### Cross-Border FX Routing

For EURC-denominated obligations, the agent orchestrates multi-step settlement:

1. **Detect** — Agent sees EURC obligation but insufficient EURC balance
2. **Forecast** — ML forecaster checks EURC/USDC rate direction (should we swap now or wait?)
3. **Quote** — Fetch StableFX quote with 5% buffer above required EURC
4. **Swap** — Execute USDC→EURC swap via StableFX at institutional rates
5. **Fund** — Mark obligation as `funded` with EURC
6. **Pay** — Execute payout when obligation comes due

This pipeline means a US-based treasury can automatically handle EUR-denominated vendor payments, payroll, or partner distributions without any manual FX management.

### Intelligent Treasury Optimization

The AI agent continuously optimizes the treasury between payout events:

**Yield Optimization:**
- Surplus USDC (above $50K threshold + $25K buffer) is automatically deposited into USYC
- USYC provides tokenized US Treasury bill exposure at 4.5% APY
- When obligations need funding, the agent withdraws from USYC just-in-time
- Result: Capital earns yield right up until the moment it's needed for payouts

**FX Timing:**
- Linear regression ML model trained on 24 hours of EURC/USDC rate data
- Predicts rate direction with quantified confidence (R² score)
- When model predicts EURC strengthening >0.1% with >65% confidence, agent swaps preemptively
- Result: Treasury saves on FX costs by swapping before unfavorable rate moves

**Risk Management:**
- Concentration risk: Alerts if >70% in single currency
- FX volatility: Historical standard deviation of rate returns
- Value at Risk (VaR): 95th and 99th percentile loss estimates
- Idle capital risk: Flags un-optimized USDC sitting without yield exposure
- Result: Agent decisions are risk-aware, not just return-optimized

### On-Chain Settlement Layer

The `ArcTreasury.sol` vault on Arc Testnet is the settlement backbone:

```solidity
// Core treasury operations
function deposit(address token, uint256 amount) external onlyAgent
function withdraw(address token, uint256 amount, address to) external onlyAgent
function swapFX(address fromToken, address toToken, uint256 amountIn) external onlyAgent
function depositToYield(uint256 amount) external onlyAgent
function withdrawFromYield(uint256 amount) external onlyAgent
function getBalances() external view returns (uint256, uint256, uint256)
```

**Key design decisions:**
- `onlyAgent` modifier: Both owner and AI agent can execute — dual control
- `ReentrancyGuard`: All state-changing functions are protected
- Atomic FX swaps: Approve + swap in single transaction via StableFX router
- USDC gas: No ETH management needed (Arc Testnet feature)
- Event emission: Full on-chain audit trail

### Real-Time Dashboard

The React dashboard provides complete treasury visibility:

| Page | Payout System Function |
|------|----------------------|
| **Dashboard** | Overview of total treasury value, USDC/EURC/USYC positions, upcoming obligations, recent decisions |
| **Agent** | Full decision feed with AI reasoning, confidence scores, and transaction links |
| **FX Monitor** | Live EURC/USDC rates, swap history, ML forecast overlay |
| **Yield** | Cumulative yield chart, deposit/withdrawal history, APY tracking |
| **Obligations** | Payment schedule with status badges, add new obligations, funded-by tracking |
| **Architecture** | Interactive system diagram (Mermaid) |

**Real-Time Updates:** WebSocket connection pushes every agent decision to all connected dashboard clients instantly. When the agent swaps USDC→EURC or executes a payout, the dashboard updates within seconds.

### API Endpoints for Integration

The system exposes a full REST API for programmatic treasury management:

```
GET  /api/balances          → Treasury positions
GET  /api/decisions         → Decision history with snapshots
POST /api/agent/run         → Trigger manual agent cycle
GET  /api/obligations       → List all obligations
POST /api/obligations       → Create new obligation (auto-triggers agent)
GET  /api/fx                → FX rate history and swaps
GET  /api/yield             → Yield tracking and history
GET  /api/risk              → Risk metrics (VaR, concentration)
GET  /api/forecast          → ML prediction and recommendation
GET  /api/stablefx/rate     → Live StableFX rate
GET  /api/stablefx/quote    → FX swap quote
POST /api/stablefx/trade    → Execute FX swap
GET  /api/wallet            → Agent wallet and gas balance
WS   /ws                    → Real-time decision stream
```

This API surface means ArcTreasury can be integrated into existing enterprise systems — ERP, accounting software, or other agents can create obligations and the system handles everything else autonomously.

---

## Why This Is a Complete Global Payout & Treasury System

1. **End-to-End:** From capital intake to yield optimization to FX routing to payout execution — fully automated
2. **Multi-Currency:** Native USDC and EURC support with StableFX for institutional FX
3. **AI-Managed:** Gemini 2.5 Flash makes decisions with full context (balances, rates, forecasts, risk, obligations)
4. **Risk-Aware:** Every payout decision considers VaR, concentration, and volatility
5. **Yield-Optimized:** Idle capital earns 4.5% APY in USYC between payouts
6. **ML-Enhanced:** FX swaps are timed using trained linear regression forecaster
7. **Auditable:** Every decision includes a full context snapshot and on-chain transaction hash
8. **Real-Time:** WebSocket-powered dashboard shows treasury state as it evolves
9. **API-First:** REST endpoints enable integration with any existing enterprise system
10. **On-Chain:** All settlement happens on Arc Testnet with USDC gas — no ETH complexity

---

## CPN Integration Path (Conceptual)

For production deployment, the payout pipeline extends to Circle Payments Network (CPN):

```
Agent Decision: PAYOUT
    → USDC available? → Direct CPN settlement to recipient
    → EURC needed?    → StableFX swap → EURC → CPN cross-border settlement
```

CPN provides the last-mile settlement for cross-border payments, completing the treasury→FX→payout→settlement pipeline. The API-first design means CPN integration would be a thin client addition to the existing payout execution step.

---

*Built by Mohammed Rafeeq Faraaz Shaik for the Encode x Arc Enterprise & DeFi Hackathon, February 2026.*
