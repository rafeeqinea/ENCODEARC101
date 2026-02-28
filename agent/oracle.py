import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, Optional

import httpx
from websockets import connect as ws_connect

from .config import STORK_API_KEY, STORK_WS_URL

logger = logging.getLogger(__name__)


class StorkOracle:
    """Fetches price and yield data.

    Priority chain: StableFX -> Stork -> mock.
    """

    def __init__(self, stablefx_client: Optional[Any] = None) -> None:
        self.http_client = httpx.AsyncClient(timeout=10)
        self.ws_url = STORK_WS_URL
        self.api_key = STORK_API_KEY
        self.stablefx = stablefx_client
        self._mock_price: Dict[str, float] = {"USDC_EURC": 0.92, "USYC_YIELD": 0.015}

    async def get_fx_rate(self) -> Dict[str, Any]:
        """Get USDC/EURC exchange rate.

        Priority 1: Circle StableFX API (real institutional rate).
        Priority 2: Stork Oracle.
        Priority 3: Mock fallback.
        """
        # Priority 1: StableFX
        if self.stablefx:
            try:
                rate_data = await self.stablefx.get_rate()
                if rate_data.get("source") == "stablefx":
                    return {
                        "pair": "USDC/EURC",
                        "rate": rate_data["rate"],
                        "source": "Circle StableFX",
                        "timestamp": rate_data["timestamp"],
                    }
            except Exception as exc:
                logger.warning("StableFX rate failed: %s", exc)

        # Priority 2: Stork Oracle
        data = await self._fetch_http("https://api.stork.ai/v1/price/usdc-eurc")
        if data:
            return {
                "pair": "USDC/EURC",
                "rate": float(data.get("price", 0)),
                "source": "Stork Oracle",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }

        # Priority 3: Mock
        return {
            "pair": "USDC/EURC",
            "rate": self._mock_price["USDC_EURC"],
            "source": "mock",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    async def get_yield_rate(self) -> Dict[str, Any]:
        """Get USYC yield APY."""
        data = await self._fetch_http("https://api.stork.ai/v1/yield/usyc")
        if data:
            return {
                "token": "USYC",
                "yield": float(data.get("apy", 0)),
                "timestamp": datetime.utcnow().isoformat() + "Z",
            }
        return {
            "token": "USYC",
            "yield": self._mock_price["USYC_YIELD"],
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }

    async def _fetch_http(self, endpoint: str) -> Dict[str, Any]:
        """HTTP fetch with error handling."""
        try:
            resp = await self.http_client.get(
                endpoint,
                headers={"Authorization": f"Bearer {self.api_key}"},
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as exc:
            logger.warning("HTTP fetch failed %s: %s", endpoint, exc)
            return {}

    async def stream_prices(self):
        """WebSocket streaming — yields dicts with price updates."""
        if not self.ws_url:
            logger.warning("WebSocket URL not configured; streaming disabled.")
            return
        async with ws_connect(
            self.ws_url,
            extra_headers={"Authorization": f"Bearer {self.api_key}"},
        ) as ws:
            async for message in ws:
                try:
                    payload = json.loads(message)
                    yield payload
                except json.JSONDecodeError:
                    continue
