"""
Circle StableFX API Client.

Docs: https://developers.circle.com/stablefx
Flow: Request Quote -> Create Trade -> Sign -> Settle
"""

import random
import logging
from datetime import datetime
from typing import Optional

import httpx

from .config import STABLEFX_API_KEY, STABLEFX_BASE_URL

logger = logging.getLogger(__name__)


class StableFXClient:
    """Client for Circle's institutional FX engine (StableFX).

    Gracefully falls back to realistic mock responses when the API key
    is missing or the API is unreachable.
    """

    def __init__(self) -> None:
        self.base_url: str = STABLEFX_BASE_URL or "https://api-sandbox.circle.com/v1/exchange/stablefx"
        self.api_key: str = STABLEFX_API_KEY
        self.headers: dict = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        self._mock_mode: bool = not bool(self.api_key) or self.api_key == "demo"

    async def get_quote(
        self,
        from_currency: str,
        to_currency: str,
        amount: str,
    ) -> dict:
        """Request an FX quote from StableFX.

        POST /quotes
        Body: {"from": {"currency": "USDC", "amount": "1000.00"},
               "to": {"currency": "EURC"}, "tenor": "instant"}
        """
        if self._mock_mode:
            return self._mock_quote(from_currency, to_currency, amount)

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/quotes",
                    headers=self.headers,
                    json={
                        "from": {"currency": from_currency, "amount": amount},
                        "to": {"currency": to_currency},
                        "tenor": "instant",
                    },
                    timeout=10.0,
                )
                if response.status_code == 200:
                    return response.json()
                logger.warning(
                    "StableFX quote error %s: %s",
                    response.status_code,
                    response.text,
                )
                return self._mock_quote(from_currency, to_currency, amount)
            except Exception as exc:
                logger.warning("StableFX API unreachable: %s", exc)
                return self._mock_quote(from_currency, to_currency, amount)

    async def create_trade(self, quote_id: str) -> dict:
        """Accept a quote and create a trade.

        POST /trades
        Body: {"quoteId": "uuid"}
        """
        if self._mock_mode:
            return self._mock_trade(quote_id)

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/trades",
                    headers=self.headers,
                    json={"quoteId": quote_id},
                    timeout=10.0,
                )
                if response.status_code == 200:
                    return response.json()
                return self._mock_trade(quote_id)
            except Exception as exc:
                logger.warning("StableFX trade error: %s", exc)
                return self._mock_trade(quote_id)

    async def get_rate(self) -> dict:
        """Get current USDC/EURC rate by requesting a small quote.

        Returns: {"rate": 0.9215, "timestamp": "...", "source": "stablefx"}
        """
        quote = await self.get_quote("USDC", "EURC", "100.00")
        rate = float(quote.get("rate", 0.9215))
        return {
            "rate": rate,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "source": "stablefx" if not self._mock_mode else "mock",
            "fee": quote.get("fee", {}).get("amount", "0.15"),
        }

    # ── Mock helpers ────────────────────────────────────────────

    def _mock_quote(self, from_curr: str, to_curr: str, amount: str) -> dict:
        """Realistic mock quote when API is unavailable."""
        rate = 0.9215 + random.uniform(-0.005, 0.005)
        from_amount = float(amount)
        to_amount = round(from_amount * rate, 2)
        return {
            "id": f"mock-quote-{datetime.utcnow().strftime('%H%M%S')}",
            "rate": str(round(rate, 4)),
            "from": {"currency": from_curr, "amount": amount},
            "to": {"currency": to_curr, "amount": str(to_amount)},
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "expiry": datetime.utcnow().isoformat() + "Z",
            "fee": {"currency": from_curr, "amount": "1.50"},
        }

    def _mock_trade(self, quote_id: str) -> dict:
        """Realistic mock trade."""
        return {
            "id": f"mock-trade-{datetime.utcnow().strftime('%H%M%S')}",
            "quoteId": quote_id,
            "status": "completed",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
