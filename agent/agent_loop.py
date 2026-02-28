import asyncio
import logging
from datetime import datetime
from typing import List, Callable, Awaitable, Optional, Any

from .blockchain import ArcClient
from .oracle import StorkOracle
from .strategy import TreasuryStrategy
from .models import Balance, Action, AgentDecision, Obligation, OraclePrice, YieldInfo

logger = logging.getLogger(__name__)


class AgentLoop:
    """Autonomous agent loop that monitors markets and executes treasury actions."""

    def __init__(
        self,
        arc_client: ArcClient,
        oracle: StorkOracle,
        strategy: TreasuryStrategy,
        obligations_store: List[Obligation],
        decision_history: List[AgentDecision],
        broadcast_callback: Optional[Callable[[AgentDecision], Awaitable[None]]] = None,
        interval_seconds: int = 30,
        forecaster: Optional[Any] = None,
    ) -> None:
        self.arc = arc_client
        self.oracle = oracle
        self.strategy = strategy
        self.obligations = obligations_store
        self.history = decision_history
        self.broadcast_callback = broadcast_callback
        self.interval = interval_seconds
        self.forecaster = forecaster
        self._consecutive_failures = 0
        self._max_backoff = 300  # 5 minutes max

    async def run(self) -> None:
        """Run the agent loop indefinitely with exponential backoff on errors."""
        while True:
            await self.run_once()
            if self._consecutive_failures > 0:
                backoff = min(self.interval * (2 ** self._consecutive_failures), self._max_backoff)
                logger.info("Backing off for %ds after %d consecutive failures", backoff, self._consecutive_failures)
                await asyncio.sleep(backoff)
            else:
                await asyncio.sleep(self.interval)

    async def run_once(self) -> None:
        """Execute a single agent cycle."""
        try:
            # 1. fetch balances
            raw_balances = await self.arc.get_balances()
            balances = [Balance(token=k, amount=v) for k, v in raw_balances.items()]

            # 2. fetch oracle data and wrap in Pydantic models
            fx_data = await self.oracle.get_fx_rate()
            yield_data = await self.oracle.get_yield_rate()

            oracle_price = OraclePrice(**fx_data) if isinstance(fx_data, dict) else fx_data
            # oracle returns "yield" key but model expects "yield_rate"
            if isinstance(yield_data, dict):
                yd = dict(yield_data)
                if "yield" in yd and "yield_rate" not in yd:
                    yd["yield_rate"] = yd.pop("yield")
                yield_info = YieldInfo(**yd)
            else:
                yield_info = yield_data

            # Update forecaster and predict
            prediction = None
            if self.forecaster:
                self.forecaster.add_rate(datetime.utcnow(), oracle_price.rate)
                self.forecaster.train()
                prediction = self.forecaster.predict()

            # 3. decide actions
            actions: List[Action] = self.strategy.decide(
                balances=balances,
                fx_price=oracle_price,
                yield_info=yield_info,
                obligations=self.obligations,
                prediction=prediction,
            )

            # 4. execute actions
            for act in actions:
                tx_hash: Optional[str] = None
                try:
                    if act.type.value == "deposit":
                        tx_hash = await self.arc.deposit(act.token, act.amount)
                    elif act.type.value == "withdraw":
                        tx_hash = await self.arc.withdraw(act.token, act.amount)
                    elif act.type.value == "swap":
                        tx_hash = await self.arc.swap_fx(act.token, "EURC", act.amount)
                except Exception as tx_exc:
                    logger.warning("Transaction failed for %s: %s", act.type, tx_exc)
                logger.info("Executed %s action, tx=%s", act.type, tx_hash)

            decision = AgentDecision(actions=actions, timestamp=datetime.utcnow())
            self.history.append(decision)

            if self.broadcast_callback:
                await self.broadcast_callback(decision)

            self._consecutive_failures = 0

        except Exception as exc:
            self._consecutive_failures += 1
            logger.warning("Agent loop iteration failed (%d consecutive): %s", self._consecutive_failures, exc)
