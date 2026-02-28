# Submission — Track 4: Best Smart Contracts on Arc with Advanced Stablecoin Logic

## Project: ArcTreasury — AI-Powered Autonomous Treasury Management Agent

---

## Overview

ArcTreasury deploys a Solidity vault contract on Arc Testnet that demonstrates advanced programmable logic with USDC and EURC stablecoins. The `ArcTreasury.sol` contract implements conditional treasury operations including escrow-style deposits, multi-token withdrawals, FX swap routing, and yield vault interactions — all governed by an AI agent with on-chain settlement.

---

## Smart Contract Architecture

### ArcTreasury.sol (Deployed on Arc Testnet)

```
ArcTreasury is Ownable, ReentrancyGuard
├── deposit(token, amount)         — Agent-gated token deposits
├── withdraw(token, amount, to)    — Conditional fund release
├── swapFX(from, to, amountIn)     — StableFX router integration
├── depositToYield(amount)         — USYC vault deposit (USDC→USYC)
├── withdrawFromYield(amount)      — USYC vault redemption (USYC→USDC)
├── getBalances()                  — On-chain balance query (USDC/EURC/USYC)
└── setAgent(newAgent)             — Owner-only agent rotation
```

### Key Design Patterns

1. **Agent-Gated Execution**: The `onlyAgent` modifier restricts treasury operations to the owner or a designated AI agent address. This enables autonomous execution while maintaining owner override capability.

2. **ReentrancyGuard**: All state-changing functions use OpenZeppelin's `nonReentrant` modifier to prevent reentrancy attacks during token transfers.

3. **Immutable Token References**: USDC, EURC, and USYC token addresses are set as `immutable` in the constructor, eliminating storage reads and saving gas on every call.

4. **Event-Driven Audit Trail**: Every operation emits typed events (`FundsDeposited`, `FXSwapExecuted`, `YieldDeposited`, `AgentDecision`) enabling off-chain indexing and compliance reporting.

### Supporting Contracts

- **MockERC20.sol**: Mintable ERC20 tokens for testnet simulation (USDC, EURC, USYC)
- **IStableFX.sol**: Interface for Circle's StableFX on-chain router
- **IUSYCVault.sol**: Interface for Hashnote USYC Teller contract (deposit/redeem)

---

## Advanced Stablecoin Logic

### 1. Conditional Escrow-Style Payouts
The agent evaluates obligation due dates and automatically releases funds only when conditions are met (obligation within 24h, sufficient balance, correct currency). This is programmable conditional transfer logic — not simple transfers.

### 2. Multi-Step FX Settlement
When the agent detects an EURC obligation but insufficient EURC balance:
1. Calculate required swap amount with 5% buffer
2. Approve StableFX router for USDC spend
3. Execute atomic USDC→EURC swap via `swapFX()`
4. Verify output amount matches expectation
5. Fund the obligation from the newly received EURC

### 3. Yield Optimization Pipeline
Idle USDC above a configurable threshold triggers:
1. `depositToYield(surplus * 0.7)` — Parks 70% of surplus in USYC vault
2. USYC earns 4.5% APY from reverse repo on US Treasury bills
3. When obligations need funding: `withdrawFromYield(needed)` pulls USDC back
4. The contract handles USDC approval, deposit, and share tracking atomically

### 4. Agent Decision On-Chain Settlement
Every AI decision (from Gemini 2.5 Flash or rule-based fallback) results in a real on-chain transaction through the contract, producing verifiable tx hashes on arcscan.app.

---

## Deployment Details

| Component | Address | Network |
|-----------|---------|---------|
| ArcTreasury Vault | Deployed via Hardhat | Arc Testnet (5042002) |
| MockUSDC | Deployed via deploy.js | Arc Testnet |
| MockEURC | Deployed via deploy.js | Arc Testnet |
| MockUSYC | Deployed via deploy.js | Arc Testnet |

**Deployment Script**: `scripts/deploy.js` handles full deployment lifecycle:
- Deploy 3 mock ERC20 tokens
- Deploy ArcTreasury with token addresses and agent
- Mint initial balances (500K USDC, 200K EURC, 300K USYC)
- Approve and deposit into treasury vault
- Copy ABI to agent backend
- Update `.env` with deployed addresses

---

## Tools Used

- **Solidity 0.8.20** with optimizer (200 runs)
- **OpenZeppelin Contracts** v4.9.6 (Ownable, ReentrancyGuard, IERC20)
- **Hardhat** v2.22+ for compilation and deployment
- **Arc Testnet** (Chain ID 5042002) — EVM-compatible with USDC gas
- **USDC** as native gas token on Arc
- **EURC** for cross-currency treasury operations

---

## How to Verify

1. Visit [testnet.arcscan.app](https://testnet.arcscan.app) and search for the deployed contract addresses
2. View the contract source code and ABI
3. Check transaction history for agent-initiated operations
4. Run `npx hardhat run scripts/deploy.js --network arc_testnet` to redeploy

---

## Repository

**GitHub**: [github.com/rafeeqinea/ENCODEARC101](https://github.com/rafeeqinea/ENCODEARC101)

**Key Files**:
- `contracts/ArcTreasury.sol` — Main vault contract
- `contracts/interfaces/IStableFX.sol` — StableFX router interface
- `contracts/interfaces/IUSYCVault.sol` — USYC vault interface
- `contracts/mocks/MockERC20.sol` — Testnet token mock
- `scripts/deploy.js` — Full deployment script
- `hardhat.config.js` — Arc Testnet network configuration
