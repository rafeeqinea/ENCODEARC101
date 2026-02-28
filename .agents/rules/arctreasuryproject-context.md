---
trigger: always_on
---

You are building ArcTreasury, an AI-powered autonomous treasury management agent for the Encode x Arc Enterprise & DeFi Hackathon.

Tech stack:
- Smart contracts: Solidity 0.8.20+, deployed on Arc Testnet (Chain ID: 5042002, RPC: https://rpc.testnet.arc.network)
- Backend: Python 3.10+, FastAPI, web3.py
- Frontend: React + Vite + Tailwind CSS + Recharts
- Gas token: USDC (not ETH)
- Key integrations: StableFX (USDC<>EURC swaps), USYC (tokenized T-bill yield), Stork Oracle (price feeds), Circle Payments Network

Architecture:
- Treasury Vault (Solidity) holds USDC, EURC, USYC positions
- Python AI Agent monitors market conditions, makes decisions, executes on-chain
- React Dashboard shows real-time treasury state, agent decisions, yield earned

Priorities: Working MVP > perfect code. Hackathon demo > production quality. Keep code clean but move fast. Use OpenZeppelin where possible.