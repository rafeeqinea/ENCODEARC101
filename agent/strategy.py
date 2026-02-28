import logging
from datetime import datetime, timedelta
from typing import List

from .models import Action, ActionType, Balance, OraclePrice, YieldInfo, Obligation

logger = logging.getLogger(__name__)

class TreasuryStrategy:
    """Simple rule‑based strategy for the demo MVP.
    Future work will replace this with an ML model.
    """

    def __init__(self, usdc_threshold: int = 10_000, payment_window_hours: int = 2):
        self.usdc_threshold = usdc_threshold
        self.payment_window = timedelta(hours=payment_window_hours)

    def _upcoming_payment(self, obligations: List[Obligation]) -> bool:
        now = datetime.utcnow()
        for o in obligations:
            if timedelta(0) <= (o.due_at - now) <= self.payment_window:
                return True
        return False

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
                    reason="Idle USDC surplus, moving to yield‑bearing USYC",
                )
            )
            logger.info("Decision: deposit %s USDC to USYC", amount)
            return actions

        # Rule 2: payment due soon -> withdraw from USYC (simplified to withdraw USDC)
        if self._upcoming_payment(obligations):
            earliest = min(obligations, key=lambda o: o.due_at)
            needed = earliest.amount
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

        # Rule 3: favorable FX rate (>0.95) and need EURC -> swap USDC to EURC
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
