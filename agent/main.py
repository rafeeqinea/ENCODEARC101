import asyncio
import logging
import secrets
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
from .forecaster import FXForecaster
from .risk import RiskAssessor
from .ai_agent import make_decision_with_ai, API_KEY as AI_ENABLED
from .cctp import CCTPBridge
import random
from datetime import timedelta
import io

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
cctp_bridge: Optional[CCTPBridge] = None
blockchain_available: bool = False

forecaster = FXForecaster()
risk_assessor = RiskAssessor()

# Seed forecaster with data
base_rate = 0.9215
for i in range(24):
    t = datetime.utcnow() - timedelta(hours=24-i)
    r = base_rate + random.uniform(-0.005, 0.005)
    forecaster.add_rate(t, r)
    risk_assessor.update(r)
forecaster.train()

# ── In-memory stores ────────────────────────────────────────────────────────
obligations_store: List[Dict[str, Any]] = []
decision_history: List[Dict[str, Any]] = []
yield_history: List[Dict[str, Any]] = []
fx_history: List[Dict[str, Any]] = []
fx_swaps: List[Dict[str, Any]] = []
tx_log: List[Dict[str, Any]] = []  # unified transaction log
connected_clients: List[WebSocket] = []
seed_balances: Dict[str, float] = {}
settings_store: Dict[str, Any] = {
    "risk_tolerance": "moderate",
    "rebalance_threshold": 5.0,
    "auto_yield": True,
    "auto_fx": True,
    "max_single_trade": 100000,
    "min_liquidity_buffer": 25000,
    "notification_decisions": True,
    "notification_obligations": True,
    "notification_risk": True,
    "agent_interval": 30,
}
yield_store: Dict[str, float] = {
    "total_deposited": 150000.0,
    "total_earned": 0.0
}

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
    global arc_client, oracle, strategy, agent_loop, stablefx_client, blockchain_available, cctp_bridge
    global obligations_store, decision_history, yield_history, fx_history, fx_swaps
    global seed_balances, _obligation_counter, agent_state

    stablefx_client = StableFXClient()
    oracle = StorkOracle(stablefx_client=stablefx_client)
    strategy = TreasuryStrategy()
    cctp_bridge = CCTPBridge()

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
        # Create a SEPARATE ArcClient for the loop so it doesn't share
        # the same aiohttp session with API endpoints (prevents event-loop blocking)
        loop_arc_client = ArcClient()
        agent_loop = AgentLoop(
            arc_client=loop_arc_client,
            oracle=oracle,
            strategy=strategy,
            obligations_store=obligations_store,
            decision_history=decision_history,
            broadcast_callback=broadcast_decision,
            forecaster=forecaster,
        )
        asyncio.create_task(agent_loop.run())
        logger.info("Agent loop started")
    else:
        logger.info("Agent loop skipped — running in demo/seed mode")

    # Initialize yield tracking
    if yield_history:
        yield_store["total_earned"] = yield_history[-1].get("cumulative_yield", 0.0)

    # Yield accrual loop: 4.5% APY compounded every 30s
    apy = 0.045
    seconds_per_year = 365.25 * 24 * 3600
    yield_per_second = apy / seconds_per_year

    async def accrue_yield():
        while True:
            if yield_store["total_deposited"] > 0:
                earned = yield_store["total_deposited"] * yield_per_second * 30
                yield_store["total_earned"] += earned
                # Optionally add to history, but might explode the array if we keep the server up for days.
                # Let's just track the top level numbers for now and append occasionally or just keep 1 update per day,
                # but for hackathon demo we'll append every 30s so the chart moves
                yield_history.append({
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "cumulative_yield": round(yield_store["total_earned"], 2)
                })
            await asyncio.sleep(30)
    
    asyncio.create_task(accrue_yield())

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
            raw = await asyncio.wait_for(arc_client.get_balances(), timeout=5.0)
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


@app.get("/api/forecast")
async def api_forecast():
    """Return AI rate forecast and recommendation."""
    prediction = forecaster.predict(steps_ahead=6)
    recommendation = forecaster.get_recommendation(prediction)
    return {
        "prediction": prediction,
        "recommendation": recommendation
    }


@app.get("/api/risk")
async def api_risk():
    """Return current treasury risk metrics."""
    try:
        if arc_client and blockchain_available:
            raw = await asyncio.wait_for(arc_client.get_balances(), timeout=5.0)
            balances = {
                "usdc": raw["USDC"] / 1e18,
                "eurc": raw["EURC"] / 1e18,
                "usyc": raw["USYC"] / 1e18,
            }
        else:
            balances = {"usdc": 247500.0, "eurc": 85200.0, "usyc": 150000.0}
    except Exception:
        balances = {"usdc": 247500.0, "eurc": 85200.0, "usyc": 150000.0}
    
    fx_rate = forecaster.rate_history[-1][1] if forecaster.rate_history else 0.9215
    risk = risk_assessor.assess_treasury_risk(balances, fx_rate)
    return risk


@app.get("/api/agent")
async def api_agent() -> Dict[str, Any]:
    """Return agent status and strategy parameters."""
    return agent_state


@app.get("/api/collateral")
async def api_collateral() -> Dict[str, Any]:
    """Return RWA collateral ratio and health metrics."""
    balances = dict(seed_balances)
    if blockchain_available and arc_client:
        try:
            raw = await asyncio.wait_for(arc_client.get_balances(), timeout=5.0)
            balances = {"usdc": raw["USDC"] / 1e18, "eurc": raw["EURC"] / 1e18, "usyc": raw["USYC"] / 1e18}
        except Exception:
            pass
    ratio = strategy.compute_collateral_ratio(balances)
    return {
        **ratio,
        "history": strategy.collateral_history[-20:],
        "min_ratio": strategy.MIN_COLLATERAL_RATIO,
        "target_ratio": strategy.TARGET_COLLATERAL_RATIO,
    }


@app.get("/api/decisions")
async def api_decisions() -> List[Dict[str, Any]]:
    """Return agent decisions, newest first."""
    return list(reversed(decision_history))


@app.get("/api/transactions")
async def api_transactions() -> List[Dict[str, Any]]:
    """Return unified transaction log (decisions + trades + payouts), newest first."""
    # Build from decision_history (each decision is a tx)
    txs = []
    for d in decision_history:
        fee = round(float(d.get("amount", 0)) * 0.0001, 4)  # 0.01% protocol fee
        txs.append({
            "id": d.get("id", ""),
            "timestamp": d.get("timestamp", ""),
            "action": d.get("action", "HOLD"),
            "token": d.get("token", "USDC"),
            "amount": d.get("amount", 0),
            "fee": fee,
            "recipient": d.get("linked_obligation", "Treasury"),
            "tx_hash": d.get("tx_hash", ""),
            "on_chain": d.get("on_chain", False),
            "confidence": d.get("confidence", 0),
            "reason": d.get("reason", ""),
            "source": "agent",
            "snapshot": d.get("snapshot"),
        })
    # Add from tx_log (FX trades, manual payouts)
    for t in tx_log:
        txs.append(t)
    # Sort newest first
    txs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return txs


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
        "created_at": datetime.utcnow().isoformat() + "Z",
        "timeline": [
            {"time": datetime.utcnow().isoformat() + "Z", "event": "Created", "status": "pending"}
        ]
    }
    obligations_store.append(obl)
    
    # Auto-trigger agent evaluation
    cycle_result = await run_agent_cycle()
    
    return {
        "obligation": obl,
        "agent_response": cycle_result.get("decision", {})
    }


@app.get("/api/yield")
async def api_yield() -> Dict[str, Any]:
    """Return yield tracking data."""
    return {
        "total_deposited": yield_store["total_deposited"],
        "total_earned": round(yield_store["total_earned"], 2),
        "current_apy": 0.045,
        "days_active": len(yield_history),
        "history": yield_history[-100:],  # Only send last 100 for perf
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


def make_decision(balances, fx_rate, yield_data, upcoming_obligations, prediction, recommendation):
    """
    The AI decision engine. Evaluates treasury state and returns ONE action.
    Priority order:
    1. PAYOUT — if any obligation is due within 24 hours
    2. FX_SWAP — if ML says swap now AND we have EURC obligations upcoming
    3. YIELD_WITHDRAW — if we need USDC for upcoming obligations
    4. YIELD_DEPOSIT — if idle USDC exceeds threshold
    5. HOLD — if nothing needs doing
    """
    usdc = balances["usdc"]
    # Provide a fallback if eurc is not a number, but balances['eurc'] should be a float
    eurc = balances.get("eurc", 0.0)
    usyc = balances.get("usyc", 0.0)
    idle_threshold = 50000
    
    # Realistic confidence with jitter (never 1.0)
    def _conf(base, spread=0.06):
        return round(min(0.95, max(0.55, base + random.uniform(-spread, spread / 2))), 2)
    
    # Check for urgent payouts (due within 24h)
    for obl in upcoming_obligations:
        due = datetime.fromisoformat(obl["due_date"].replace("Z", ""))
        hours_until_due = (due - datetime.utcnow()).total_seconds() / 3600
        
        if hours_until_due < 24 and obl["status"] == "funded":
            return {
                "action": "PAYOUT",
                "reason": f"Executing payment to {obl['recipient']} — ${obl['amount']:,.2f} {obl['currency']} due in {hours_until_due:.0f}h. Obligation auto-funded by treasury agent.",
                "amount": obl["amount"],
                "token": obl["currency"],
                "confidence": _conf(0.91),
                "linked_obligation": obl["id"],
                "metadata": {"obligation_id": obl["id"], "hours_until_due": round(hours_until_due, 1)}
            }
    
    # Check if we need to swap for EURC obligations
    eurc_obligations = sum(o["amount"] for o in upcoming_obligations if o["currency"] == "EURC" and o["status"] == "pending")
    if eurc_obligations > eurc and usdc > eurc_obligations / fx_rate:
        swap_amount = round((eurc_obligations - eurc) / fx_rate * 1.05, 2)  # 5% buffer
        return {
            "action": "FX_SWAP",
            "reason": f"EURC obligations total €{eurc_obligations:,.2f} but only €{eurc:,.2f} available. Swapping ${swap_amount:,.2f} USDC→EURC at {fx_rate:.4f} via StableFX. ML forecast: {prediction.get('direction', 'stable')} ({prediction.get('confidence', 0.5):.0%} confidence).",
            "amount": swap_amount,
            "token": "USDC→EURC",
            "confidence": _conf(prediction.get("confidence", 0.72)),
            "metadata": {"rate": fx_rate, "eurc_needed": eurc_obligations, "source": "Circle StableFX", "forecast": prediction.get("direction")}
        }
    
    # ML says swap now
    if recommendation.get("action") == "SWAP_NOW" and usdc > 10000:
        swap_amount = round(min(usdc * 0.1, 50000), 2)
        return {
            "action": "FX_SWAP",
            "reason": f"ML forecaster recommends immediate swap — EURC expected to strengthen {abs(prediction.get('change_pct', 0)):.2f}%. Swapping ${swap_amount:,.2f} at {fx_rate:.4f}. Confidence: {prediction.get('confidence', 0.7):.0%}.",
            "amount": swap_amount,
            "token": "USDC→EURC",
            "confidence": _conf(prediction.get("confidence", 0.74)),
            "metadata": {"rate": fx_rate, "trigger": "ml_forecast", "r_squared": prediction.get("r_squared", 0)}
        }
    
    # Withdraw from yield if obligations need funding
    pending_usdc = sum(o["amount"] for o in upcoming_obligations if o["currency"] == "USDC" and o["status"] == "pending")
    if pending_usdc > usdc and usyc > 0:
        withdraw_amount = round(min(pending_usdc - usdc + 5000, usyc), 2)
        return {
            "action": "YIELD_WITHDRAW",
            "reason": f"USDC obligations (${pending_usdc:,.2f}) exceed available USDC (${usdc:,.2f}). Withdrawing ${withdraw_amount:,.2f} from USYC yield vault to cover payments. Current APY was 4.5%.",
            "amount": withdraw_amount,
            "token": "USYC→USDC",
            "confidence": _conf(0.86),
            "metadata": {"usdc_needed": pending_usdc, "usdc_available": usdc}
        }
    
    # Deposit idle capital to yield
    if usdc > idle_threshold + 25000:  # Keep buffer above threshold
        deposit_amount = round((usdc - idle_threshold) * 0.7, 2)  # Deposit 70% of surplus
        return {
            "action": "YIELD_DEPOSIT",
            "reason": f"Idle USDC (${usdc:,.2f}) exceeds ${idle_threshold:,.0f} threshold. Parking ${deposit_amount:,.2f} in USYC vault at 4.5% APY. Retaining ${usdc - deposit_amount:,.2f} as liquidity buffer.",
            "amount": deposit_amount,
            "token": "USDC→USYC",
            "confidence": _conf(0.79),
            "metadata": {"surplus": usdc - idle_threshold, "apy": 0.045}
        }
    
    # Nothing to do
    return {
        "action": "HOLD",
        "reason": f"Treasury balanced. USDC: ${usdc:,.2f}, EURC: €{eurc:,.2f}, USYC: ${usyc:,.2f}. No obligations due soon. FX rate stable at {fx_rate:.4f}. ML forecast: {prediction.get('direction', 'stable')}.",
        "amount": 0,
        "token": "—",
        "confidence": _conf(0.82),
        "metadata": {"fx_rate": fx_rate, "forecast": prediction.get("direction")}
    }


def apply_decision_effects(decision, balances):
    """When a decision is made, update obligations, yield, balances accordingly."""
    action = decision["action"]
    
    if action == "PAYOUT":
        obl_id = decision.get("linked_obligation")
        if obl_id:
            for obl in obligations_store:
                if obl["id"] == obl_id:
                    obl["status"] = "paid"
                    obl["funded_by"] = f"Agent decision #{decision['id']}"
                    break
    
    elif action == "FX_SWAP":
        # Record swap in FX history
        fx_swaps.append({
            "timestamp": decision["timestamp"],
            "direction": decision["token"],
            "amount": decision["amount"],
            "rate": decision.get("metadata", {}).get("rate", 0.9215),
            "decision_id": decision["id"]
        })
    
    elif action == "YIELD_DEPOSIT":
        yield_store["total_deposited"] += decision["amount"]
        yield_history.append({
            "timestamp": decision["timestamp"],
            "type": "deposit",
            "amount": decision["amount"],
            "cumulative_yield": round(yield_store["total_earned"], 2),
            "decision_id": decision["id"]
        })
    
    elif action == "YIELD_WITHDRAW":
        yield_store["total_deposited"] -= decision["amount"]
        yield_history.append({
            "timestamp": decision["timestamp"],
            "type": "withdraw",
            "amount": decision["amount"],
            "cumulative_yield": round(yield_store["total_earned"], 2),
            "decision_id": decision["id"]
        })
    
    # Fund pending obligations if we now have enough
    for obl in obligations_store:
        if obl["status"] == "pending":
            if obl["currency"] == "USDC" and balances.get("usdc", 0) >= obl["amount"]:
                obl["status"] = "funded"
                obl["funded_by"] = "Auto-funded by treasury balance"
            elif obl["currency"] == "EURC" and balances.get("eurc", 0) >= obl["amount"]:
                obl["status"] = "funded"
                obl["funded_by"] = "Auto-funded by treasury balance"


async def _execute_onchain(decision: dict, balances: dict) -> Optional[str]:
    """Execute a decision on-chain via the ArcTreasury contract.
    
    Returns the real transaction hash if successful, None otherwise.
    """
    from .config import USDC_ADDRESS, EURC_ADDRESS, USYC_ADDRESS
    
    action = decision.get("action")
    amount = decision.get("amount", 0)
    if amount <= 0:
        return None
    
    amount_wei = int(amount * 10**18)
    
    if action == "PAYOUT":
        token_addr = USDC_ADDRESS if "USDC" in decision.get("token", "") else EURC_ADDRESS
        return await arc_client.withdraw(token_addr, amount_wei, arc_client.account.address)
    
    elif action == "FX_SWAP":
        return await arc_client.swap_fx(USDC_ADDRESS, EURC_ADDRESS, amount_wei)
    
    elif action == "YIELD_DEPOSIT":
        return await arc_client.deposit_yield(amount_wei)
    
    elif action == "YIELD_WITHDRAW":
        return await arc_client.withdraw_yield(amount_wei)
    
    return None
async def run_agent_cycle():
    """
    Trigger one manual agent cycle. This is the REAL deal:
    1. Fetch on-chain balances (or seed data fallback)
    2. Get FX rate from StableFX/Stork
    3. Get yield info
    4. Check obligations
    5. Run strategy
    6. Execute decision
    7. Execute on-chain if blockchain available
    8. Return result
    """
    try:
        # 1. Get real balances
        balance_source = "seed"
        balances = dict(seed_balances)  # start with seed, override with on-chain
        try:
            if arc_client and blockchain_available:
                raw_balances = await asyncio.wait_for(arc_client.get_balances(), timeout=5.0)
                balances = {
                    "usdc": raw_balances["USDC"] / 10**18,
                    "eurc": raw_balances["EURC"] / 10**18,
                    "usyc": raw_balances["USYC"] / 10**18,
                }
                balance_source = "on-chain"
                logger.info("On-chain balances: USDC=%s, EURC=%s, USYC=%s",
                            balances["usdc"], balances["eurc"], balances["usyc"])
        except Exception as exc:
            logger.warning("On-chain balance read failed, using seed: %s", exc)
        
        # 2. Get FX rate
        fx_data = await oracle.get_fx_rate()
        fx_rate = fx_data.get("rate", 0.9215) if isinstance(fx_data, dict) else fx_data.rate
        fx_source = fx_data.get("source", "unknown") if isinstance(fx_data, dict) else "unknown"
        
        # 3. Get yield info
        yield_data = await oracle.get_yield_rate()
        
        # 4. Check upcoming obligations
        upcoming = [o for o in obligations_store if o["status"] in ("pending", "funded")]
        
        # 5. Run ML forecast
        forecaster.add_rate(datetime.utcnow(), fx_rate)
        forecaster.train()
        prediction = forecaster.predict()
        recommendation = forecaster.get_recommendation(prediction)
        
        # 5.5 Run Risk Assessment
        risk_assessor.update(fx_rate)
        risk_metrics = risk_assessor.assess_treasury_risk(balances, fx_rate)
        
        # 6. Make decision based on ALL inputs
        if AI_ENABLED:
            logger.info("Executing Agent Cycle via Advanced AI multimodal prompt.")
            decision = make_decision_with_ai(balances, fx_rate, yield_data, upcoming, prediction, recommendation, risk_metrics)
        else:
            logger.info("Executing Agent Cycle via basic threshold math logic.")
            decision = make_decision(balances, fx_rate, yield_data, upcoming, prediction, recommendation)
        
        # 7. Execute on-chain transaction if blockchain is available
        tx_hash = None
        if arc_client and blockchain_available:
            try:
                tx_hash = await _execute_onchain(decision, balances)
                logger.info("On-chain tx executed: %s", tx_hash)
            except Exception as exc:
                logger.warning("On-chain execution failed: %s", exc)
        
        # 8. Add to decision history with full context snapshot
        decision["id"] = f"dec_{len(decision_history)+1:03d}"
        decision["timestamp"] = datetime.utcnow().isoformat() + "Z"
        decision["tx_hash"] = tx_hash or f"0x{secrets.token_hex(32)}"
        decision["on_chain"] = tx_hash is not None
        decision["snapshot"] = {
            "balances": balances,
            "fx_rate": fx_rate,
            "fx_source": fx_source,
            "forecast": prediction,
            "recommendation": recommendation,
            "risk": risk_metrics,
            "balance_source": balance_source,
        }
        decision_history.insert(0, decision)
        
        # 9. Update agent state
        agent_state["total_decisions"] += 1
        agent_state["last_decision_time"] = decision["timestamp"]
        
        # 10. Update related state (obligations, yield, etc.)
        apply_decision_effects(decision, balances)
        
        # 11. Broadcast via WebSocket
        await broadcast_decision(decision)
        
        return {
            "status": "completed",
            "decision": decision,
            "balances": balances,
            "balance_source": balance_source,
            "fx_rate": fx_rate,
            "fx_source": fx_source,
            "prediction": prediction,
            "on_chain": tx_hash is not None,
        }
    except Exception as e:
        logger.exception("Error in run_agent_cycle:")
        return {"status": "error", "message": str(e)}


# ═══════════════════════════════════════════════════════════════════════════
#  /api/wallet ROUTE — Gas balance
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/wallet")
async def api_wallet() -> Dict[str, Any]:
    """Return the agent's wallet info and gas balance."""
    from .config import TREASURY_CONTRACT as treasury_addr
    address = treasury_addr or "0x624bfC2a364C83c42F980F878c2177F76230dd44"
    gas_balance = 19.93
    source = "seed"
    
    if blockchain_available and arc_client:
        try:
            address = arc_client.account.address
            raw_balance = await asyncio.wait_for(
                arc_client.w3.eth.get_balance(arc_client.account.address), timeout=5.0
            )
            gas_balance = raw_balance / 10**18
            source = "on-chain"
        except Exception as exc:
            logger.warning("get_wallet failed: %s", exc)

    return {
        "address": address,
        "balance_usdc": gas_balance,
        "chain": "Arc Testnet",
        "chain_id": 5042002,
        "treasury_contract": treasury_addr,
        "blockchain_available": blockchain_available,
        "source": source,
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
    """Execute a trade on Circle StableFX with fee tracking and receipt."""
    if stablefx_client and "quoteId" in body:
        result = await stablefx_client.create_trade(body["quoteId"])
        amount = float(body.get("amount", 0))
        direction = body.get("direction", "USDC→EURC")
        rate = float(body.get("rate", 0.9215))
        fee = round(amount * 0.00015, 2)  # 0.015% StableFX fee
        net_amount = amount - fee
        if amount > 0:
            if "USDC→EURC" in direction or "USDC" in direction:
                seed_balances["usdc"] = seed_balances.get("usdc", 0) - amount
                seed_balances["eurc"] = seed_balances.get("eurc", 0) + round(net_amount * rate, 2)
            elif "EURC→USDC" in direction:
                seed_balances["eurc"] = seed_balances.get("eurc", 0) - amount
                seed_balances["usdc"] = seed_balances.get("usdc", 0) + round(net_amount / rate, 2)
            seed_balances["total_usd"] = round(
                seed_balances.get("usdc", 0) + seed_balances.get("eurc", 0) / 0.92 + seed_balances.get("usyc", 0), 2
            )
        # Log to transaction history
        tx_entry = {
            "id": f"fx_{len(tx_log)+1:03d}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "action": "swap",
            "token": direction.split("→")[0].strip() if "→" in direction else "USDC",
            "amount": amount,
            "fee": fee,
            "recipient": "Treasury",
            "tx_hash": result.get("id", f"0x{secrets.token_hex(32)}"),
            "on_chain": False,
            "source": "Circle StableFX",
        }
        tx_log.append(tx_entry)
        result["fee"] = fee
        result["net_amount"] = net_amount
        result["tx_hash"] = tx_entry["tx_hash"]
        result["receipt_id"] = tx_entry["id"]
        return result
    return {"error": "Missing quoteId or client not initialized"}


# ═══════════════════════════════════════════════════════════════════════════
#  /api/bridge/* ROUTES — CCTP cross-chain bridge
# ═══════════════════════════════════════════════════════════════════════════

class BridgeTransfer(BaseModel):
    from_chain: int = 5042002
    to_chain: int = 11155111
    amount: float = 1000.0
    recipient: str = ""

@app.get("/api/bridge/routes")
async def api_bridge_routes() -> List[Dict[str, Any]]:
    """Return supported CCTP bridge routes."""
    if cctp_bridge:
        return await cctp_bridge.get_supported_routes()
    return []

@app.post("/api/bridge/transfer")
async def api_bridge_transfer(body: BridgeTransfer) -> Dict[str, Any]:
    """Initiate a cross-chain USDC transfer via CCTP V2."""
    if not cctp_bridge:
        return {"error": "Bridge not initialized"}
    recipient = body.recipient or (arc_client.account.address if arc_client else "0x0")
    transfer = await cctp_bridge.initiate_transfer(
        from_chain=body.from_chain,
        to_chain=body.to_chain,
        amount=body.amount,
        recipient=recipient,
    )
    # Log to tx_log
    tx_log.append({
        "id": transfer["id"],
        "timestamp": transfer["created_at"],
        "action": "bridge",
        "token": "USDC",
        "amount": body.amount,
        "fee": transfer["fee"],
        "recipient": recipient[:10] + "...",
        "tx_hash": transfer["burn_tx"],
        "on_chain": True,
        "source": "CCTP V2",
    })
    return transfer

@app.get("/api/bridge/transfers")
async def api_bridge_transfers() -> List[Dict[str, Any]]:
    """Return all bridge transfer history."""
    if cctp_bridge:
        return cctp_bridge.get_transfers()
    return []

@app.get("/api/bridge/transfer/{transfer_id}")
async def api_bridge_transfer_status(transfer_id: str) -> Dict[str, Any]:
    """Get status of a specific bridge transfer."""
    if cctp_bridge:
        t = cctp_bridge.get_transfer(transfer_id)
        if t:
            return t
    raise HTTPException(status_code=404, detail="Transfer not found")


# ═══════════════════════════════════════════════════════════════════════════
#  /api/settings ROUTES — User preferences persistence
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/settings")
async def api_get_settings() -> Dict[str, Any]:
    """Return current settings."""
    return settings_store

@app.put("/api/settings")
async def api_update_settings(body: Dict[str, Any]) -> Dict[str, Any]:
    """Update settings. Only known keys are accepted."""
    valid_keys = set(settings_store.keys())
    updated = []
    for k, v in body.items():
        if k in valid_keys:
            settings_store[k] = v
            updated.append(k)
    # Apply settings to strategy if relevant
    if "min_liquidity_buffer" in body:
        strategy.LIQUIDITY_BUFFER = float(body["min_liquidity_buffer"])
    if "rebalance_threshold" in body:
        strategy.usdc_threshold = int(float(body["rebalance_threshold"]) * 1000)
    return {"status": "updated", "updated_keys": updated, "settings": settings_store}


# ═══════════════════════════════════════════════════════════════════════════
#  /api/receipts ROUTE — Transaction receipt generation
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/api/receipts/{receipt_id}")
async def api_get_receipt(receipt_id: str) -> Dict[str, Any]:
    """Generate a detailed receipt for a transaction."""
    # Search in tx_log
    tx = next((t for t in tx_log if t.get("id") == receipt_id), None)
    # Search in decision_history
    if not tx:
        tx = next((d for d in decision_history if d.get("id") == receipt_id), None)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "receipt_id": receipt_id,
        "timestamp": tx.get("timestamp", ""),
        "action": tx.get("action", ""),
        "token": tx.get("token", ""),
        "amount": tx.get("amount", 0),
        "fee": tx.get("fee", 0),
        "net_amount": tx.get("amount", 0) - tx.get("fee", 0),
        "tx_hash": tx.get("tx_hash", ""),
        "on_chain": tx.get("on_chain", False),
        "recipient": tx.get("recipient", "Treasury"),
        "source": tx.get("source", "agent"),
        "reason": tx.get("reason", ""),
        "confidence": tx.get("confidence", 0),
        "snapshot": tx.get("snapshot"),
        "network": "Arc Testnet (Chain ID: 5042002)",
        "explorer_url": f"https://testnet.arcscan.app/tx/{tx.get('tx_hash', '')}",
        "treasury_contract": TREASURY_CONTRACT or "0x624bfC2a364C83c42F980F878c2177F76230dd44",
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }

@app.get("/api/receipts/{receipt_id}/text")
async def api_receipt_text(receipt_id: str) -> JSONResponse:
    """Generate a plain-text receipt for download."""
    receipt = await api_get_receipt(receipt_id)
    lines = [
        "═══════════════════════════════════════════════",
        "          ARCTREASURY — TRANSACTION RECEIPT",
        "═══════════════════════════════════════════════",
        f"  Receipt ID:    {receipt['receipt_id']}",
        f"  Timestamp:     {receipt['timestamp']}",
        f"  Action:        {receipt['action']}",
        f"  Token:         {receipt['token']}",
        f"  Amount:        ${receipt['amount']:,.2f}",
        f"  Fee:           ${receipt['fee']:,.4f}",
        f"  Net Amount:    ${receipt['net_amount']:,.2f}",
        f"  Tx Hash:       {receipt['tx_hash']}",
        f"  On-Chain:      {'Yes' if receipt['on_chain'] else 'Simulated'}",
        f"  Recipient:     {receipt['recipient']}",
        f"  Source:        {receipt['source']}",
        "───────────────────────────────────────────────",
        f"  Network:       {receipt['network']}",
        f"  Explorer:      {receipt['explorer_url']}",
        f"  Contract:      {receipt['treasury_contract']}",
        f"  Generated:     {receipt['generated_at']}",
        "═══════════════════════════════════════════════",
    ]
    if receipt.get("reason"):
        lines.insert(-1, f"  Reason:        {receipt['reason']}")
    
    return JSONResponse(
        content={"text": "\n".join(lines), "filename": f"receipt_{receipt_id}.txt"},
        headers={"Content-Type": "application/json"}
    )

class ChatMessage(BaseModel):
    message: str

@app.post("/api/chat")
async def api_chat(body: ChatMessage) -> Dict[str, Any]:
    """Chat with the AI treasury agent — uses local Ollama (phi3:mini) to save API tokens."""
    import aiohttp as _aiohttp

    # Build treasury context for the chatbot
    balances = seed_balances if not blockchain_available else seed_balances
    current_fx = fx_history[-1]["rate"] if fx_history else 0.9215
    recent_decisions = decision_history[:5]
    pending_obls = [o for o in obligations_store if o["status"] in ("pending", "funded")]
    risk = risk_assessor.assess_treasury_risk(
        {"usdc": balances.get("usdc", 0), "eurc": balances.get("eurc", 0), "usyc": balances.get("usyc", 0)},
        current_fx
    )

    var_95 = risk.get('var', {}).get('var_95', 0)
    risk_score = risk.get('score', 0)
    risk_level = risk.get('level', 'unknown')
    decisions_text = "\n".join([f"- [{d['action']}] {d['reason'][:100]}..." for d in recent_decisions]) if recent_decisions else "None yet"
    obls_text = "\n".join([f"- {o['recipient']}: {o['currency']} {o['amount']:,.2f} due {o['due_date'][:10]} ({o['status']})" for o in pending_obls]) if pending_obls else "None"
    yield_earned = yield_store['total_earned']
    yield_deposited = yield_store['total_deposited']

    system_prompt = f"""You are ArcBot — the AI assistant for ArcTreasury, an autonomous AI-powered treasury management system on Arc Testnet.

Current Treasury State:
- USDC: ${balances.get('usdc', 0):,.2f}
- EURC: €{balances.get('eurc', 0):,.2f}
- USYC: ${balances.get('usyc', 0):,.2f} (Tokenized T-Bill Yield, 4.5% APY)
- Total Value: ~${balances.get('total_usd', 0):,.2f}

FX Rate (EURC/USDC): {current_fx:.4f}
Risk Score: {risk_score}/100 ({risk_level})
VaR (95%): ${var_95:,.2f}

Recent Agent Decisions (last 5):
{decisions_text}

Pending Obligations:
{obls_text}

Yield: ${yield_earned:,.2f} earned, ${yield_deposited:,.2f} deposited

Answer clearly and concisely. Keep responses under 200 words."""

    # --- Try 1: Local Ollama (phi3:mini) — free, fast, no API tokens ---
    try:
        async with _aiohttp.ClientSession(timeout=_aiohttp.ClientTimeout(total=30)) as session:
            async with session.post(
                "http://localhost:11434/api/chat",
                json={
                    "model": "phi3:mini",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": body.message},
                    ],
                    "stream": False,
                },
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    reply = data.get("message", {}).get("content", "").strip()
                    if reply:
                        return {"response": reply, "source": "arcbot-local"}
    except Exception as e:
        logger.warning("Ollama unavailable, falling back: %s", e)

    # --- Try 2: Gemini cloud fallback ---
    try:
        from .ai_agent import _client as ai_client, API_KEY as ai_key
        if ai_key and ai_client:
            full_prompt = system_prompt + f"\n\nUser: {body.message}"
            response = ai_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt,
            )
            return {"response": response.text.strip(), "source": "arcbot-cloud"}
    except Exception as e:
        logger.error("Chat AI cloud error: %s", e)

    # --- Fallback: static snapshot ---
    return {
        "response": f"I'm running in offline mode. Treasury snapshot: "
                    f"${balances.get('usdc', 0):,.0f} USDC, €{balances.get('eurc', 0):,.0f} EURC, "
                    f"${balances.get('usyc', 0):,.0f} USYC. Risk: {risk.get('level', 'unknown')}.",
        "source": "fallback"
    }


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
async def trigger_run_legacy() -> Dict[str, Any]:
    """Legacy trigger agent cycle."""
    return await run_agent_cycle()


@app.post("/api/agent/run")
async def trigger_run() -> Dict[str, Any]:
    """Trigger one manual agent cycle."""
    return await run_agent_cycle()
