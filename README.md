# ⚡ ArcTreasury

**ArcTreasury** is an AI-powered autonomous treasury management agent built for the **Encode x Arc Enterprise & DeFi Hackathon**. 

It serves as a smart interface and execution layer for Web3 treasuries, automatically managing idle capital by monitoring market conditions, executing FX swaps via Circle's StableFX, and optimizing yield deployments via tokenized T-bills (USYC) on the Arc Testnet.

![Dashboard Preview](frontend/public/vite.svg) *(Note: Add a real screenshot here!)*

---

## ✨ Features
* **Autonomous AI Agent**: A Python AI backend that periodically evaluates treasury state, upcoming obligations, and market rates to make deterministic financial decisions.
* **Premium Liquid Glass UI**: A highly polished, cinematic React dashboard featuring "liquid glass" glassmorphism, count-up animations, and dark mode by default.
* **StableFX Integration**: Real-time institutional FX routing and execution via the Circle API, allowing dynamic switching between USDC and EURC to cover obligations.
* **Stork Oracle & Arc Testnet**: Reads real-time price feeds via Stork WebSocket and executes smart contract transactions directly on the Arc Testnet.
* **Yield Optimization**: Automatically detects idle capital above safe thresholds and parks it into yielding assets (MockUSYC).

---

## 🏗️ Architecture & Tech Stack

**Smart Contracts (Solidity 0.8.20+)**
* Deployed on **Arc Testnet** (Chain ID: `5042002`)
* Custom `ArcTreasury` Vault Contract utilizing OpenZeppelin standards.
* Mock Tokens for testing: USDC, EURC, USYC.

**Backend (Python 3.10+ / FastAPI)**
* **Web3.py**: Blockchain interaction and contract execution.
* **Circle StableFX API**: Fetching rates, quotes, and executing off-ramp/on-ramp equivalent swaps.
* **Stork Network**: Real-time websocket price oracles.
* AI loops checking thresholds and executing logic deterministically.

**Frontend (React 19 / Vite 7)**
* **Tailwind CSS v4** styling with custom variables for the neon-dark aesthetic.
* **Recharts** for real-time area charts (Yield & FX monitoring).
* **Framer Motion** for cinematic load intros and layout transitions.

---

## 🚀 Local Development Setup

### 1. Requirements
* Node.js v20+
* Python 3.10+
* An Arc Testnet wallet with test tokens.

### 2. Backend Setup
```bash
# Navigate to the root directory
cd ArcTreasure

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r agent/requirements.txt

# Configure environment variables
cd agent
cp .env.example .env
# Edit .env and supply your STABLEFX_API_KEY, PRIVATE_KEY, etc.

# Run the FastAPI server
cd ..
python -m uvicorn agent.main:app --port 8000 --reload
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd ArcTreasure/frontend

# Install node modules
npm install

# Start the Vite development server
npm run dev
```

### 4. Smart Contracts
To modify or deploy the contracts locally to Arc Testnet:
```bash
# Within the root /contracts and /scripts setup
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat run scripts/deploy.js --network arcTestnet
```

---

## 🏆 Hackathon Notes
**Encode x Arc Enterprise & DeFi Hackathon**
This project emphasizes a complete end-to-end integration focusing on **usable UI/UX** and functioning **cross-border / FX capital routing**. Prioritizing a working MVP that demonstrates how AI agents can replace manual, multi-sig treasury operations for DAOs and enterprises.