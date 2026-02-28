# Submission — Bonus Track: CPN Nanopayments

## Project: ArcTreasury — AI-Powered Autonomous Treasury Management Agent

---

## Overview

ArcTreasury integrates Circle Payments Network (CPN) concepts for micro-payment settlement of treasury obligations. The agent's payout system is designed to handle granular, high-frequency payments — from small vendor invoices to recurring subscription-style payouts — using USDC on Arc with near-instant finality.

---

## CPN Integration in ArcTreasury

### Obligation Micro-Payment Pipeline

ArcTreasury's obligation system already supports the core CPN workflow:

1. **Quote Generation**: When an obligation is created, the agent evaluates FX rates and funding sources to determine the optimal settlement path
2. **Payment Creation**: The agent creates a structured payment decision with amount, currency, recipient, and timing
3. **On-Chain Settlement**: USDC is transferred from the treasury vault to the recipient address on Arc
4. **Payment Tracking**: Full audit trail with tx hashes, timestamps, and decision reasoning

### Nanopayment-Ready Architecture

The agent's 30-second decision loop enables high-frequency micro-payments:

```python
# Agent evaluates obligations every 30 seconds
for obligation in upcoming_obligations:
    hours_until_due = (due_date - now).total_seconds() / 3600
    if hours_until_due < 24 and obligation["status"] == "funded":
        # Execute payout — even for sub-dollar amounts
        decision = {
            "action": "PAYOUT",
            "amount": obligation["amount"],  # Can be as small as $0.01
            "token": obligation["currency"],
            "confidence": 0.91,
        }
```

### Why This Fits CPN

| CPN Requirement | ArcTreasury Implementation |
|----------------|---------------------------|
| Real-time FX quoting | StableFX + Stork Oracle provide live USDC/EURC rates |
| Smart routing | AI agent selects optimal BFI/settlement path |
| Stablecoin-powered transfers | All settlements in USDC or EURC |
| API integration | Full REST API (FastAPI) + WebSocket for real-time monitoring |
| Payment tracking | Decision history with snapshots, tx hashes, and status updates |

### Streaming Payment Support

ArcTreasury's yield accrual system demonstrates streaming micropayments:
- USYC yield accrues every 30 seconds (~$0.21 per 30s at 4.5% APY on $150K)
- This earned yield can be automatically routed to fulfill nano-sized obligations
- The agent handles sub-dollar amounts natively through the ERC20 transfer interface

---

## Technical Implementation

### API Endpoints Supporting Nanopayments

```
POST /api/obligations    — Create an obligation (any amount, any currency)
POST /api/agent/run      — Trigger agent to evaluate and execute pending payouts
GET  /api/decisions      — View all payout decisions with tx hashes
GET  /api/obligations    — Track obligation lifecycle (pending→funded→paid)
WS   /ws                 — Real-time payout notifications
```

### Settlement Flow

```
Obligation Created ($0.50 USDC to vendor)
    ↓
Agent Cycle Evaluates (30s loop)
    ↓
AI/Rule Engine: "PAYOUT — $0.50 due in 2h"
    ↓
ArcTreasury.withdraw(USDC, 0.5e18, vendorAddr)
    ↓
Arc Testnet Settlement (sub-second finality)
    ↓
Obligation.status = "paid"
    ↓
WebSocket Broadcast to Dashboard
```

### Arc's Advantages for Nanopayments

1. **USDC Gas**: Transaction fees are in USDC, not a volatile token — predictable cost for micropayments
2. **Sub-Second Finality**: Payments confirm instantly via Malachite consensus
3. **Low Fees**: Arc's architecture keeps gas costs minimal for high-frequency small transfers
4. **Privacy**: Configurable transaction privacy protects small business payment details

---

## Tools Used

| Tool | Purpose |
|------|---------|
| **CPN (Conceptual)** | Cross-border micropayment orchestration |
| **USDC** | Settlement currency for all nanopayments |
| **Arc Testnet** | Low-cost, instant-finality settlement layer |
| **Circle StableFX** | FX conversion for cross-currency micropayments |
| **WebSocket** | Real-time payment status notifications |

---

## Future CPN Integration Path

With CPN access, ArcTreasury would:
1. Register as an OFI (Originating Financial Institution) on CPN
2. Request quotes from CPN for cross-border obligations
3. Use CPN's smart routing to select optimal BFIs
4. Execute USDC transfers through CPN's orchestration layer
5. Track payment status via CPN webhooks

The agent's existing decision engine and obligation lifecycle already implement the core CPN workflow logic — only the CPN API integration layer would need to be added.

---

## Repository

**GitHub**: [github.com/rafeeqinea/ENCODEARC101](https://github.com/rafeeqinea/ENCODEARC101)
