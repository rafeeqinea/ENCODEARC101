import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any

try:
    from .models import Action, ActionType, Balance, OraclePrice, YieldInfo, Obligation
except ImportError:
    from models import Action, ActionType, Balance, OraclePrice, YieldInfo, Obligation

logger = logging.getLogger(__name__)

class TreasuryStrategy:
    """Rule-based + ML-enhanced treasury strategy with RWA collateral tracking."""

    # RWA collateral parameters
    MIN_COLLATERAL_RATIO = 1.2   # 120% minimum backing
    TARGET_COLLATERAL_RATIO = 1.5  # 150% target
    LIQUIDITY_BUFFER = 25000     # always keep this much USDC liquid

    def __init__(self, usdc_threshold: int = 10_000, payment_window_hours: int = 2):
        self.usdc_threshold = usdc_threshold
        self.payment_window = timedelta(hours=payment_window_hours)
        self.collateral_history: List[Dict[str, Any]] = []

    def _upcoming_payment(self, obligations) -> bool:
        now = datetime.utcnow()
        for o in obligations:
            due = o.get("due_date", o.get("due_at")) if isinstance(o, dict) else (o.due_date or o.due_at)
            if due is None:
                continue
            if isinstance(due, str):
                try:
                    due = datetime.fromisoformat(due.replace("Z", "+00:00")).replace(tzinfo=None)
                except Exception:
                    continue
            if timedelta(0) <= (due - now) <= self.payment_window:
                return True
        return False

    def compute_collateral_ratio(self, balances: Dict[str, float], usyc_price: float = 1.0) -> Dict[str, Any]:
        """Compute RWA collateral ratio: total_assets / total_liabilities."""
        usdc = balances.get("usdc", 0)
        eurc = balances.get("eurc", 0)
        usyc = balances.get("usyc", 0)
        total_assets = usdc + (eurc / 0.92) + (usyc * usyc_price)
        # Liabilities = obligations outstanding (simplified: usyc deposits are the liability)
        total_liabilities = max(usyc * usyc_price, 1)  # avoid div/0
        ratio = total_assets / total_liabilities if total_liabilities > 0 else 999
        health = "healthy" if ratio >= self.TARGET_COLLATERAL_RATIO else "warning" if ratio >= self.MIN_COLLATERAL_RATIO else "critical"
        result = {
            "ratio": round(ratio, 3),
            "total_assets": round(total_assets, 2),
            "total_liabilities": round(total_liabilities, 2),
            "health": health,
            "usdc_liquid": round(usdc, 2),
            "rwa_backing": round(usyc * usyc_price, 2),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
        self.collateral_history.append(result)
        if len(self.collateral_history) > 100:
            self.collateral_history = self.collateral_history[-100:]
        return result

    def decide(
        self,
        balances: List[Balance],
        fx_price: OraclePrice,
        yield_info: YieldInfo,
        obligations: List[Obligation],
        prediction: dict = None,
    ) -> List[Action]:
        actions: List[Action] = []
        bal_map = {b.token: b.amount for b in balances}
        usdc_balance = bal_map.get("USDC", 0)

        # ML-enhanced: If forecaster says swap now with high confidence
        if prediction and prediction.get("direction") == "down" and prediction.get("confidence", 0) > 0.65:
            change_pct = prediction.get("change_pct", 0)
            if abs(change_pct) > 0.1 and usdc_balance > 5000:
                amount = min(usdc_balance * 0.2, 50000)
                actions.append(
                    Action(
                        type=ActionType.SWAP,
                        token="USDC",
                        amount=amount,
                        reason=f"ML Forecaster: EURC strengthening ({abs(change_pct):.2f}%) — strategic swap",
                    )
                )
                logger.info("Decision: ML swap %s USDC to EURC", amount)
                return actions

        # Rule 1: idle USDC surplus and no upcoming payments -> deposit to USYC
        if usdc_balance > self.usdc_threshold and not self._upcoming_payment(obligations):
            amount = usdc_balance - self.usdc_threshold
            actions.append(
                Action(
                    type=ActionType.DEPOSIT,
                    token="USDC",
                    amount=amount,
                    reason="Idle USDC surplus, moving to yield-bearing USYC",
                )
            )
            logger.info("Decision: deposit %s USDC to USYC", amount)
            return actions

        # Rule 2: payment due soon -> withdraw from USYC
        if self._upcoming_payment(obligations):
            def _get_due(o):
                d = o.get("due_date", o.get("due_at")) if isinstance(o, dict) else (o.due_date or o.due_at)
                if isinstance(d, str):
                    try: d = datetime.fromisoformat(d.replace("Z", "+00:00")).replace(tzinfo=None)
                    except Exception: d = datetime.max
                return d or datetime.max
            earliest = min(obligations, key=_get_due)
            needed = earliest.get("amount", 0) if isinstance(earliest, dict) else earliest.amount
            actions.append(
                Action(
                    type=ActionType.WITHDRAW,
                    token="USDC",
                    amount=needed,
                    reason="Upcoming payment obligation",
                )
            )
            logger.info("Decision: withdraw %s USDC for payment", needed)
            return actions

        # Rule 3: favorable FX rate and need EURC -> swap
        if fx_price.rate > 0.95 and bal_map.get("EURC", 0) == 0:
            swap_amount = min(usdc_balance // 2, 5_000)
            actions.append(
                Action(
                    type=ActionType.SWAP,
                    token="USDC",
                    amount=swap_amount,
                    reason=f"Favorable FX rate {fx_price.rate:.3f}, acquiring EURC",
                )
            )
            logger.info("Decision: swap %s USDC for EURC", swap_amount)
            return actions

        # Default hold
        actions.append(
            Action(
                type=ActionType.HOLD,
                token="USDC",
                amount=usdc_balance,
                reason="No actionable condition met; holding assets",
            )
        )
        logger.info("Decision: hold USDC")
        return actions
