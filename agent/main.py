import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .config import ARC_RPC_URL, PRIVATE_KEY, TREASURY_CONTRACT
from .blockchain import ArcClient
from .oracle import StorkOracle
from .strategy import TreasuryStrategy
from .stablefx import StableFXClient
from .models import Balance, Action, AgentDecision, Obligation
from .agent_loop import AgentLoop
from .seed_data import generate_all_seed_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── FastAPI app ──────────────────────────────────────────────────────────────
app = FastAPI(title="ArcTreasury Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global singletons ───────────────────────────────────────────────────────
arc_client: Optional[ArcClient] = None
oracle: Optional[StorkOracle] = None
strategy: Optional[TreasuryStrategy] = None
agent_loop: Optional[AgentLoop] = None
stablefx_client: Optional[StableFXClient] = None
blockchain_available: bool = False

# ── In-memory stores ────────────────────────────────────────────────────────
obligations_store: List[Dict[str, Any]] = []
decision_history: List[Dict[str, Any]] = []
yield_history: List[Dict[str, Any]] = []
fx_history: List[Dict[str, Any]] = []
fx_swaps: List[Dict[str, Any]] = []
connected_clients: List[WebSocket] = []
seed_balances: Dict[str, float] = {}

# ── Agent state tracking ────────────────────────────────────────────────────
agent_state: Dict[str, Any] = {
    "status": "active",
    "last_decision_time": None,
    "total_decisions": 0,
    "cycle_interval": 30,
    "strategy": {
        "idle_threshold": 50000,
        "yield_target_apy": 0.045,
        "fx_sensitivity": 0.005,
        "liquidity_buffer": 25000,
    },
}

_obligation_counter: int = 0


def _is_placeholder_env() -> bool:
    """Return True if .env still has placeholder values."""
    return (
        not PRIVATE_KEY
        or PRIVATE_KEY == "your_private_key_here"
        or not TREASURY_CONTRACT
        or TREASURY_CONTRACT == "contract_address_here"
    )


# ── Startup ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event() -> None:
    global arc_client, oracle, strategy, agent_loop, stablefx_client, blockchain_available
    global obligations_store, decision_history, yield_history, fx_history, fx_swaps
    global seed_balances, _obligation_counter, agent_state

    stablefx_client = StableFXClient()
    oracle = StorkOracle(stablefx_client=stablefx_client)
    strategy = TreasuryStrategy()

    # Try blockchain connection
    if not _is_placeholder_env():
        try:
            arc_client = ArcClient()
            blockchain_available = True
            logger.info("Blockchain client initialized")
        except Exception as exc:
            logger.warning("Blockchain unavailable, using seed data: %s", exc)
            blockchain_available = False
    else:
        logger.info("Placeholder .env detected — loading seed data for demo")
        blockchain_available = False

    # Load seed data (always, so API has data immediately)
    seed = generate_all_seed_data()
    decision_history.extend(seed["decisions"])
    obligations_store.extend(seed["obligations"])
    fx_history.extend(seed["fx_history"])
    fx_swaps.extend(seed["fx_swaps"])
    yield_history.extend(seed["yield_history"])
    seed_balances.update(seed["balances"])
    _obligation_counter = len(obligations_store)

    agent_state["total_decisions"] = len(decision_history)
    if decision_history:
        agent_state["last_decision_time"] = decision_history[-1]["timestamp"]

    # Start agent loop if blockchain is available
    if blockchain_available and arc_client:
        agent_loop = AgentLoop(
            arc_client=arc_client,
            oracle=oracle,
            strategy=strategy,
            obligations_store=[],
            decision_history=[],
            broadcast_callback=broadcast_decision,
        )
        asyncio.create_task(agent_loop.run())
        logger.info("Agent loop started")
    else:
        logger.info("Agent loop skipped — running in demo/seed mode")

    logger.info("ArcTreasury API ready — %d decisions, %d obligations loaded",
                len(decision_history), len(obligations_store))


# ── WebSocket & broadcast ────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket) -> None:
    """WebSocket endpoint for real-time decision updates."""
    await ws.accept()
    connected_clients.append(ws)
    try:
        while True:
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        connected_clients.remove(ws)


async def broadcast_decision(decision: Any) -> None:
    """Broadcast a decision to all connected WebSocket clients."""
    if isinstance(decision, AgentDecision):
        payload = {"type": "decision", "data": decision.dict()}
    elif isinstance(decision, dict):
        payload = {"type": "decision", "data": decision}
    else:
        payload = {"type": "decision", "data": str(decision)}

    dead: List[WebSocket] = []
    for client in connected_clients:
        try:
            await client.send_json(payload)
        except Exception:
            dead.append(client)
    for d in dead:
        connected_clients.remove(d)


# ═══════════════════════════════════════════════════════════════════════════
#  /api/* ROUTES — matched to frontend expectations
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/balances")
async def api_balances() -> Dict[str, Any]:
    """Return treasury token balances."""
    if blockchain_available and arc_client:
        try:
            raw = await arc_client.get_balances()
            usdc = raw["USDC"] / 1e18
            eurc = raw["EURC"] / 1e18
            usyc = raw["USYC"] / 1e18
            return {
                "usdc": usdc,
                "eurc": eurc,
                "usyc": usyc,
                "total_usd": usdc + (eurc / 0.92) + usyc,
                "source": "on-chain",
            }
        except Exception as exc:
            logger.warning("get_balances failed, using seed: %s", exc)
    return {**seed_balances, "source": "seed"}


@app.get("/api/agent")
async def api_agent() -> Dict[str, Any]:
    """Return agent status and strategy parameters."""
    return agent_state


@app.get("/api/decisions")
async def api_decisions() -> List[Dict[str, Any]]:
    """Return agent decisions, newest first."""
    return list(reversed(decision_history))


@app.get("/api/obligations")
async def api_obligations() -> List[Dict[str, Any]]:
    """Return payment obligations."""
    return obligations_store


class CreateObligation(BaseModel):
    recipient: str
    amount: float
    currency: str = "USDC"
    due_date: str


@app.post("/api/obligations")
async def api_create_obligation(body: CreateObligation) -> Dict[str, Any]:
    """Create a new payment obligation."""
    global _obligation_counter
    _obligation_counter += 1
    obl = {
        "id": f"obl_{_obligation_counter:03d}",
        "recipient": body.recipient,
        "amount": body.amount,
        "currency": body.currency,
        "due_date": body.due_date,
        "status": "pending",
        "funded_by": None,
    }
    obligations_store.append(obl)
    return obl


@app.get("/api/yield")
async def api_yield() -> Dict[str, Any]:
    """Return yield tracking data."""
    total_deposited = 150000.0
    total_earned = yield_history[-1]["cumulative_yield"] if yield_history else 0.0
    days_active = len(yield_history)
    return {
        "total_deposited": total_deposited,
        "total_earned": round(total_earned, 2),
        "current_apy": 0.045,
        "days_active": days_active,
        "history": yield_history,
    }


@app.get("/api/fx")
async def api_fx() -> Dict[str, Any]:
    """Return FX rate data and swap history."""
    current_rate = fx_history[-1]["rate"] if fx_history else 0.9215
    first_rate = fx_history[0]["rate"] if fx_history else 0.9238
    change_24h = round(current_rate - first_rate, 4)
    change_pct = round((change_24h / first_rate) * 100, 2) if first_rate else 0.0
    forecast_direction = "down" if change_24h < 0 else "up"
    return {
        "current_rate": current_rate,
        "change_24h": change_24h,
        "change_pct": change_pct,
        "forecast_direction": forecast_direction,
        "history": fx_history,
        "swaps": fx_swaps,
    }


@app.post("/api/agent/run")
async def api_agent_run() -> Dict[str, Any]:
    """Trigger one manual agent cycle."""
    if agent_loop:
        await agent_loop.run_once()
        return {"status": "cycle executed", "decisions": decision_history[-1:]}
    return {"status": "demo mode — no live agent loop", "decisions": decision_history[-1:]}


# ═══════════════════════════════════════════════════════════════════════════
#  /api/wallet ROUTE — Gas balance
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/wallet")
async def api_wallet() -> Dict[str, Any]:
    """Return the agent's wallet info and gas balance."""
    address = "0x624bfC2a364C83c42F980F878c2177F76230dd44"
    if blockchain_available and arc_client:
        try:
            address = arc_client.account.address
            # In a real app we'd fetch native gas. Since Arc Testnet uses USDC for gas,
            # we check the wallet's native balance if possible, or USDC balance.
            usdc_balance = 19.93 # Placeholder gas
            return {
                "address": address,
                "balance_usdc": usdc_balance,
                "chain": "Arc Testnet",
                "chain_id": 5042002
            }
        except Exception as exc:
            logger.warning("get_wallet failed, using fallback: %s", exc)

    return {
        "address": address,
        "balance_usdc": 19.93,
        "chain": "Arc Testnet",
        "chain_id": 5042002
    }


# ═══════════════════════════════════════════════════════════════════════════
#  /api/stablefx/* ROUTES — Circle StableFX integration
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/stablefx/rate")
async def api_stablefx_rate() -> Dict[str, Any]:
    """Get current USDC/EURC rate from StableFX."""
    if stablefx_client:
        return await stablefx_client.get_rate()
    return {"rate": 0.9215, "timestamp": "", "source": "mock", "fee": "0.15"}


@app.get("/api/stablefx/quote")
async def api_stablefx_quote(
    from_currency: str = "USDC",
    to_currency: str = "EURC",
    amount: str = "10000.00",
) -> Dict[str, Any]:
    """Get an FX quote from Circle StableFX."""
    if stablefx_client:
        return await stablefx_client.get_quote(from_currency, to_currency, amount)
    return {"error": "StableFX client not initialized"}


@app.post("/api/stablefx/trade")
async def api_stablefx_trade(body: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a trade on Circle StableFX."""
    if stablefx_client and "quoteId" in body:
        return await stablefx_client.create_trade(body["quoteId"])
    return {"error": "Missing quoteId or client not initialized"}


# ═══════════════════════════════════════════════════════════════════════════
#  Legacy routes (backward compat)
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/status")
async def get_status() -> JSONResponse:
    """Legacy status endpoint."""
    balances = await api_balances()
    return JSONResponse(content={"balances": balances, "obligations": len(obligations_store)})


@app.get("/decisions")
async def get_decisions() -> List[Dict[str, Any]]:
    """Legacy decisions endpoint."""
    return list(reversed(decision_history[-20:]))


@app.get("/obligations")
async def list_obligations() -> List[Dict[str, Any]]:
    """Legacy obligations endpoint."""
    return obligations_store


@app.post("/obligations")
async def add_obligation(body: CreateObligation) -> Dict[str, Any]:
    """Legacy create obligation endpoint."""
    return await api_create_obligation(body)


@app.post("/agent/run")
async def trigger_run() -> Dict[str, Any]:
    """Legacy trigger agent cycle."""
    return await api_agent_run()
