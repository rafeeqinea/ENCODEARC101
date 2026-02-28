# Circle Product Feedback — ArcTreasury

## Project: ArcTreasury — AI-Powered Autonomous Treasury Management Agent
**Builder:** Mohammed Rafeeq Faraaz Shaik (Solo Builder)
**Hackathon:** Encode x Arc Enterprise & DeFi Hackathon, February 2026

---

## Products Used

### 1. USYC (Tokenized T-Bill Yield)

**Why we chose USYC:**
USYC is the perfect instrument for an autonomous treasury agent. Enterprises holding idle stablecoin capital in a treasury need a low-risk, yield-bearing alternative to simply holding USDC. USYC provides exactly this — tokenized US Treasury bill exposure that lets the agent park idle capital while earning real-world yield, without exiting the blockchain ecosystem.

**How we integrated it:**
- The AI agent monitors USDC balances and automatically deposits excess into USYC when no payments are imminent
- When an obligation approaches, the agent withdraws from USYC just-in-time, converting back to USDC for the payment
- The dashboard tracks cumulative yield earned, current APY, and full deposit/withdrawal history
- Risk assessment considers the ratio of idle USDC vs yield-bearing USYC — flagging it when capital isn't being optimized

**What worked well:**
- The concept of USYC as an ERC20 token makes integration straightforward — standard approve/transfer patterns work perfectly
- Having yield on idle capital is a strong narrative for enterprise treasury use cases
- USDC as gas on Arc Testnet simplifies the agent's operations — no need to manage a separate ETH balance

**What could improve:**
- More testnet documentation and example integrations for USYC specifically
- A sandbox/testnet USYC contract with simulated yield accrual would help builders test more realistically
- SDK helpers for calculating real-time APY and yield projections

### 2. StableFX (Institutional FX Swaps)

**Why we chose StableFX:**
Multi-currency treasury management requires efficient FX routing. StableFX provides institutional-grade USDC to EURC swaps, which is exactly what an enterprise treasury needs when managing obligations in different currencies. The AI agent uses StableFX rates to decide when to swap — buying EURC when the ML forecaster predicts favorable rates.

**How we integrated it:**
- Real-time rate fetching via the StableFX API
- Quote generation before executing swaps
- The ML forecaster considers FX rate trends when recommending swaps
- The AI agent (Gemini) receives StableFX rates as part of its decision context
- The FX Monitor dashboard page displays live rates and forecast overlays

**What worked well:**
- The API design (rate → quote → trade) is clean and intuitive
- Having real FX rates gives the AI agent meaningful data to work with
- The concept integrates naturally into the treasury management narrative

**What could improve:**
- Testnet API key provisioning could be faster — we experienced authentication issues
- More comprehensive API documentation with request/response examples
- A webhook for rate change notifications would enable event-driven agent architectures
- SDK for Python (currently we built a custom HTTP client)

### 3. Circle Payments Network (CPN) — Conceptual Integration

**How it fits:**
CPN represents the settlement layer for cross-border payouts. In ArcTreasury, when the agent executes a PAYOUT action for an obligation denominated in EUR, the path is: USDC → StableFX swap → EURC → CPN settlement to recipient. This enables automated cross-border treasury operations.

**Recommendation:**
An SDK specifically designed for AI agent integration would be valuable — something that lets agents query settlement status, estimate fees, and initiate transfers programmatically with structured JSON responses optimized for LLM consumption.

---

## Overall Feedback

### What Arc + Circle Got Right
1. **USDC as gas** — This is brilliant for agent operations. No more managing ETH alongside stablecoins. The agent only needs to think in USD terms.
2. **EVM compatibility** — Standard Solidity patterns, standard Web3.py — zero learning curve for the smart contract layer.
3. **The product suite tells a story** — USDC (base), EURC (multi-currency), USYC (yield), StableFX (FX), CPN (settlement). An autonomous agent can navigate this entire stack.

### Recommendations for Circle
1. **AI Agent SDK** — As autonomous agents become more common, a Circle SDK optimized for agent consumption (structured JSON, clear error codes, streaming updates) would be a significant differentiator.
2. **Oracle partnerships** — Tighter integration between Stork price feeds and StableFX rates would enable more sophisticated trading strategies. We used Stork's REST API (`rest.jp.stork-oracle.network`) and WebSocket for real-time EURC/USD data — a first-party Circle price feed alongside Stork would be powerful.
3. **Testnet sandbox** — A complete sandbox environment with USDC, EURC, USYC, StableFX, and CPN all working together on testnet would accelerate builder onboarding significantly. Currently USYC is only on Ethereum Sepolia (Teller at `0x96424C885951ceb4B79fecb934eD857999e6f82B`), StableFX requires institutional access, and CPN requires OFI status.
4. **Webhook/event system** — Real-time notifications for rate changes, settlement completions, and yield events would enable event-driven architectures instead of polling.
5. **Gateway docs clarity** — The Circle Gateway integration would benefit from testnet-accessible APIs and clearer examples for programmatic USDC bridging scenarios.
6. **Bridge Kit for Arc** — The Arc Bridge Kit documentation could include more detailed examples for cross-chain USDC settlement patterns, especially for agent-driven use cases.

---

*Thank you for building these products. The future of treasury management is autonomous, and Circle's infrastructure makes it possible today.*
