# Submission — Track 5: Best Chain Abstracted USDC Apps Using Arc as a Liquidity Hub

## Project: ArcTreasury — AI-Powered Autonomous Treasury Management Agent

---

## Overview

ArcTreasury treats Arc as a central liquidity hub where USDC, EURC, and USYC can be managed across a unified treasury surface. The AI agent orchestrates capital routing — sourcing liquidity from yield vaults, converting between stablecoin currencies via StableFX, and settling obligations — all through a single application interface without fragmenting the user experience.

---

## Chain Abstraction Architecture

### Single Application, Multiple Asset Flows

```
User (MetaMask) → Arc Testnet
                    ├── USDC Pool     ←→ Circle StableFX ←→ EURC Pool
                    ├── USYC Vault    ←→ Teller Contract ←→ USDC (redeemed)
                    ├── Obligations   → Agent Decision   → Payout (USDC or EURC)
                    └── Gateway       → Cross-chain USDC  → Destination Chain
```

### How Capital Flows Through One Interface

1. **USDC Deposits**: Users deposit USDC into the ArcTreasury vault on Arc
2. **Yield Optimization**: Idle USDC is automatically routed to USYC (tokenized T-Bills) earning 4.5% APY
3. **FX Conversion**: When EURC is needed, the agent swaps USDC→EURC via Circle StableFX
4. **Obligation Settlement**: Payouts in USDC or EURC are executed from the unified treasury
5. **Cross-Chain Ready**: Gateway integration enables instant USDC access across chains

The user sees one dashboard. Behind the scenes, capital moves between pools, yield vaults, and currencies based on AI decisions.

---

## Key Features

### 1. Unified Treasury Balance
The dashboard shows a single Total Value Locked (TVL) combining USDC, EURC (converted at live FX rate), and USYC positions. Users don't need to manage each asset separately.

### 2. AI-Driven Capital Routing
The Gemini 2.5 Flash AI agent determines the optimal capital allocation every 30 seconds:
- Surplus USDC → deposit to USYC yield vault
- EURC obligation due → swap USDC→EURC via StableFX
- USDC shortage → withdraw from USYC vault
- All settled atomically through the ArcTreasury contract

### 3. Cross-Currency Settlement
Obligations can be denominated in USDC or EURC. The agent automatically handles FX conversion using the best available rate from StableFX, with ML-predicted timing for optimal execution.

### 4. Real-Time Oracle Feeds
Stork Oracle provides live EURC/USD pricing via WebSocket and REST API, enabling the ML forecaster to predict rate movements and time swaps optimally.

### 5. Gateway Integration (Conceptual)
Circle Gateway enables a unified USDC balance across multiple blockchains. ArcTreasury's architecture is designed to leverage Gateway for:
- Depositing USDC from any supported chain into the Arc treasury
- Instant USDC availability (<500ms) for cross-chain obligation settlement
- Non-custodial balance management with trustless withdrawal

---

## Tools Used

| Tool | Purpose |
|------|---------|
| **Arc Testnet** | Primary settlement layer (USDC gas, sub-second finality) |
| **USDC** | Base treasury currency and gas token |
| **EURC** | Secondary stablecoin for European obligations |
| **Circle StableFX** | Institutional FX engine for USDC↔EURC swaps |
| **USYC** | Tokenized T-Bill yield (4.5% APY) for idle capital |
| **Circle Gateway** | Cross-chain USDC liquidity (architectural integration) |
| **Circle Wallets** | Wallet infrastructure for agent key management |
| **Stork Oracle** | Real-time EURC/USD price feeds |

---

## Why Arc as a Liquidity Hub

1. **USDC as Native Gas**: No volatile token needed for fees — costs are predictable in USD terms
2. **Sub-Second Finality**: Agent decisions execute instantly, critical for time-sensitive FX swaps
3. **EVM Compatible**: Standard Solidity contracts, familiar tooling (Hardhat, ethers.js)
4. **Circle Ecosystem**: Direct access to StableFX, USYC, Gateway, and CCTP from day one
5. **Privacy When Needed**: Configurable transaction privacy for sensitive treasury operations

---

## Seamless User Experience

Despite the complexity of multi-asset management, FX conversion, and yield optimization:

- **One-Click Wallet Connect**: MetaMask with automatic Arc Testnet chain addition
- **Single Dashboard**: All assets, decisions, obligations, and FX data in one view
- **Real-Time Updates**: WebSocket-driven live decision feed and balance updates
- **AI Chat**: Natural language queries about treasury state via Gemini chatbot
- **No Manual Intervention**: The agent handles all routing, swapping, and settlement

---

## Repository

**GitHub**: [github.com/rafeeqinea/ENCODEARC101](https://github.com/rafeeqinea/ENCODEARC101)

**Key Files**:
- `agent/main.py` — FastAPI backend with 15+ endpoints
- `agent/oracle.py` — Stork Oracle + StableFX rate aggregation
- `agent/blockchain.py` — Arc Testnet client (Web3.py)
- `frontend/src/pages/` — React dashboard pages
- `frontend/src/lib/api.js` — API client with all integrations
