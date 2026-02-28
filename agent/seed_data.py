"""Realistic seed data for ArcTreasury demo.

Generates decisions, obligations, FX history, and yield history
so the API always returns meaningful data even without a live blockchain.
"""

from __future__ import annotations

import hashlib
import math
import random
from datetime import datetime, timedelta
from typing import Any, Dict, List


def _tx_hash(seed: str) -> str:
    """Generate a deterministic fake tx hash."""
    return "0x" + hashlib.sha256(seed.encode()).hexdigest()[:64]


def generate_decisions(count: int = 47) -> List[Dict[str, Any]]:
    """Generate *count* historical agent decisions spread over the last 24 h."""
    now = datetime.utcnow()
    actions = [
        ("YIELD_DEPOSIT", "USDC", "green"),
        ("YIELD_WITHDRAW", "USDC", "orange"),
        ("FX_SWAP", "USDC\u2192EURC", "blue"),
        ("PAYOUT", "EURC", "red"),
    ]
    reasons = {
        "YIELD_DEPOSIT": [
            "Idle USDC exceeds 50k threshold, parking ${amount:,.0f} in USYC for 4.5% APY",
            "No upcoming obligations for 48h, depositing ${amount:,.0f} to maximize yield",
            "Surplus USDC detected after FX swap, moving ${amount:,.0f} to USYC vault",
            "Treasury rebalance: allocating ${amount:,.0f} to yield-bearing position",
        ],
        "YIELD_WITHDRAW": [
            "Payment obligation due in 4h, withdrawing ${amount:,.0f} from USYC",
            "Liquidity buffer below 25k, recalling ${amount:,.0f} from yield position",
            "Upcoming EURC obligation requires USDC liquidity, withdrawing ${amount:,.0f}",
        ],
        "FX_SWAP": [
            "EURC obligation due in 4h, favorable rate 0.9220 detected — swapping ${amount:,.0f}",
            "EUR/USD rate dipped below 0.92 threshold, acquiring EURC at discount",
            "Pre-funding EURC payroll obligation with ${amount:,.0f} USDC at 0.9215",
            "Stork oracle signals rate reversal, executing defensive EURC acquisition",
        ],
        "PAYOUT": [
            "Executing funded obligation: Vendor A Invoice #1234 — ${amount:,.0f} EURC",
            "Auto-paying Cloud Services invoice — ${amount:,.0f} USDC",
            "Payroll distribution triggered — ${amount:,.0f} USDC to payroll contract",
            "Partner revenue-share payout — ${amount:,.0f} EURC via Circle bridge",
        ],
    }
    decisions: List[Dict[str, Any]] = []
    random.seed(42)
    for i in range(count):
        action_type, token, _color = actions[i % len(actions)]
        amount = round(random.uniform(5000, 100000), 2)
        reason_templates = reasons[action_type]
        reason = reason_templates[i % len(reason_templates)].format(amount=amount)
        ts = now - timedelta(hours=24 * (count - i) / count)
        decisions.append({
            "id": f"dec_{i + 1:03d}",
            "action": action_type,
            "reason": reason,
            "amount": amount,
            "token": token,
            "timestamp": ts.isoformat() + "Z",
            "tx_hash": _tx_hash(f"dec_{i}"),
            "confidence": round(random.uniform(0.72, 0.97), 2),
        })
    return decisions


def generate_obligations() -> List[Dict[str, Any]]:
    """Generate 6 payment obligations."""
    now = datetime.utcnow()
    return [
        {
            "id": "obl_001",
            "recipient": "Vendor A - Invoice #1234",
            "amount": 25000.0,
            "currency": "EURC",
            "due_date": (now + timedelta(days=2)).isoformat() + "Z",
            "status": "funded",
            "funded_by": "USYC withdrawal #dec_045",
        },
        {
            "id": "obl_002",
            "recipient": "Payroll - March 2026",
            "amount": 85000.0,
            "currency": "USDC",
            "due_date": (now + timedelta(days=3)).isoformat() + "Z",
            "status": "pending",
            "funded_by": None,
        },
        {
            "id": "obl_003",
            "recipient": "Supplier B - Q1 Payment",
            "amount": 12500.0,
            "currency": "EURC",
            "due_date": (now - timedelta(days=5)).isoformat() + "Z",
            "status": "paid",
            "funded_by": "FX swap #dec_032",
        },
        {
            "id": "obl_004",
            "recipient": "Cloud Services - AWS",
            "amount": 4200.0,
            "currency": "USDC",
            "due_date": (now - timedelta(days=2)).isoformat() + "Z",
            "status": "paid",
            "funded_by": "Direct USDC #dec_039",
        },
        {
            "id": "obl_005",
            "recipient": "Legal Retainer - March",
            "amount": 15000.0,
            "currency": "USDC",
            "due_date": (now + timedelta(days=5)).isoformat() + "Z",
            "status": "pending",
            "funded_by": None,
        },
        {
            "id": "obl_006",
            "recipient": "Partner Distribution",
            "amount": 50000.0,
            "currency": "EURC",
            "due_date": (now - timedelta(days=1)).isoformat() + "Z",
            "status": "overdue",
            "funded_by": None,
        },
    ]


def generate_fx_history(hours: int = 24) -> List[Dict[str, Any]]:
    """Generate hourly USDC/EURC rates hovering around 0.92."""
    now = datetime.utcnow()
    history: List[Dict[str, Any]] = []
    random.seed(99)
    rate = 0.9238
    for h in range(hours, 0, -1):
        ts = now - timedelta(hours=h)
        rate += random.uniform(-0.0015, 0.0012)
        rate = max(0.9100, min(0.9350, rate))
        history.append({
            "timestamp": ts.isoformat() + "Z",
            "rate": round(rate, 4),
        })
    return history


def generate_fx_swaps() -> List[Dict[str, Any]]:
    """Generate a handful of historical FX swaps."""
    now = datetime.utcnow()
    random.seed(77)
    swaps: List[Dict[str, Any]] = []
    for i in range(5):
        ts = now - timedelta(hours=random.uniform(1, 22))
        swaps.append({
            "timestamp": ts.isoformat() + "Z",
            "direction": "USDC\u2192EURC",
            "amount": round(random.uniform(5000, 30000), 0),
            "rate": round(random.uniform(0.9180, 0.9260), 4),
        })
    swaps.sort(key=lambda s: s["timestamp"])
    return swaps


def generate_yield_history(days: int = 14) -> List[Dict[str, Any]]:
    """Generate daily cumulative yield from $0 to ~$1,847 over *days*."""
    now = datetime.utcnow()
    history: List[Dict[str, Any]] = []
    total_yield = 0.0
    daily_base = 1847.50 / days
    random.seed(55)
    for d in range(days):
        ts = now - timedelta(days=days - d)
        daily = daily_base * random.uniform(0.7, 1.3)
        total_yield += daily
        history.append({
            "timestamp": ts.strftime("%Y-%m-%dT00:00:00Z"),
            "cumulative_yield": round(total_yield, 2),
        })
    # Ensure the first entry starts at 0
    history[0]["cumulative_yield"] = 0
    return history


def generate_all_seed_data() -> Dict[str, Any]:
    """Return a dict with every category of seed data."""
    fx_history = generate_fx_history()
    return {
        "decisions": generate_decisions(),
        "obligations": generate_obligations(),
        "fx_history": fx_history,
        "fx_swaps": generate_fx_swaps(),
        "yield_history": generate_yield_history(),
        "balances": {
            "usdc": 247500.0,
            "eurc": 85200.0,
            "usyc": 150000.0,
            "total_usd": 482700.0,
        },
        "current_fx_rate": fx_history[-1]["rate"] if fx_history else 0.9215,
    }
