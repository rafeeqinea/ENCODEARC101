import json
import logging
from pathlib import Path
from typing import Any, Dict

from web3 import AsyncWeb3
from web3.middleware import ExtraDataToPOAMiddleware

from .config import ARC_RPC_URL, PRIVATE_KEY, TREASURY_CONTRACT, CHAIN_ID

logger = logging.getLogger(__name__)

ABI_PATH = Path(__file__).parent / "abi" / "Treasury.json"


class ArcClient:
    """Async client for interacting with the Arc Treasury contract."""

    def __init__(self, abi_path: Path = ABI_PATH) -> None:
        self.w3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(ARC_RPC_URL))
        # POA middleware for testnet
        self.w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
        self.account = self.w3.eth.account.from_key(PRIVATE_KEY)
        # Load ABI
        if not abi_path.is_file():
            raise FileNotFoundError(f"ABI file not found: {abi_path}")
        with abi_path.open() as f:
            abi = json.load(f)
        self.contract = self.w3.eth.contract(address=TREASURY_CONTRACT, abi=abi)

    async def _send_tx(self, tx: Dict[str, Any]) -> str:
        """Sign and send a transaction, returning the transaction hash as hex string."""
        signed = self.account.sign_transaction(tx)
        tx_hash = await self.w3.eth.send_raw_transaction(signed.raw_transaction)
        logger.info("Sent transaction %s", tx_hash.hex())
        return tx_hash.hex()

    async def get_balances(self) -> Dict[str, int]:
        """Return token balances held by the treasury contract."""
        balances = await self.contract.functions.getBalances().call()
        return {"USDC": balances[0], "EURC": balances[1], "USYC": balances[2]}

    async def _build_tx(self, func: Any) -> Dict[str, Any]:
        """Build a transaction dict for the given contract function call."""
        nonce = await self.w3.eth.get_transaction_count(self.account.address)
        tx = await func.build_transaction({
            "from": self.account.address,
            "chainId": CHAIN_ID,
            "nonce": nonce,
            "gas": 300_000,
            "gasPrice": await self.w3.eth.gas_price,
        })
        return tx

    async def deposit(self, token: str, amount: int) -> str:
        """Deposit tokens into the treasury vault."""
        func = self.contract.functions.deposit(token, amount)
        tx = await self._build_tx(func)
        return await self._send_tx(tx)

    async def withdraw(self, token: str, amount: int, to: str = "") -> str:
        """Withdraw tokens from the treasury vault."""
        dest = to or self.account.address
        func = self.contract.functions.withdraw(token, amount, dest)
        tx = await self._build_tx(func)
        return await self._send_tx(tx)

    async def swap_fx(self, from_token: str, to_token: str, amount: int) -> str:
        """Execute an FX swap via the StableFX router."""
        func = self.contract.functions.swapFX(from_token, to_token, amount)
        tx = await self._build_tx(func)
        return await self._send_tx(tx)

    async def deposit_yield(self, amount: int) -> str:
        """Deposit USDC into the USYC yield vault."""
        func = self.contract.functions.depositToYield(amount)
        tx = await self._build_tx(func)
        return await self._send_tx(tx)

    async def withdraw_yield(self, amount: int) -> str:
        """Withdraw USDC from the USYC yield vault."""
        func = self.contract.functions.withdrawFromYield(amount)
        tx = await self._build_tx(func)
        return await self._send_tx(tx)
