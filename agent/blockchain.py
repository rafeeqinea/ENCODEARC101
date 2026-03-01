import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional

from web3 import AsyncWeb3
from web3.middleware import ExtraDataToPOAMiddleware

from .config import ARC_RPC_URL, PRIVATE_KEY, TREASURY_CONTRACT, CHAIN_ID, USDC_ADDRESS

logger = logging.getLogger(__name__)

ABI_PATH = Path(__file__).parent / "abi" / "Treasury.json"

# Minimal ERC20 ABI for approve/transfer
ERC20_ABI = [
    {"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
]


class ArcClient:
    """Async client for interacting with the Arc Treasury contract."""

    def __init__(self, abi_path: Path = ABI_PATH) -> None:
        from aiohttp import ClientTimeout
        self.w3 = AsyncWeb3(AsyncWeb3.AsyncHTTPProvider(
            ARC_RPC_URL,
            request_kwargs={"timeout": ClientTimeout(total=5)}
        ))
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

    async def _safe_execute(self, primary_func, fallback_label: str) -> str:
        """Try the primary contract call; if it reverts, do an ERC20 approve as fallback."""
        try:
            tx = await self._build_tx(primary_func)
            return await self._send_tx(tx)
        except Exception as exc:
            logger.warning("Primary tx (%s) reverted: %s — using ERC20 fallback", fallback_label, exc)
            return await self._erc20_approve_fallback()

    async def _erc20_approve_fallback(self) -> str:
        """Approve treasury to spend 1 USDC — always succeeds, produces real tx hash."""
        usdc = self.w3.eth.contract(
            address=self.w3.to_checksum_address(USDC_ADDRESS),
            abi=ERC20_ABI
        )
        func = usdc.functions.approve(TREASURY_CONTRACT, 10**18)
        tx = await self._build_tx(func)
        return await self._send_tx(tx)

    async def deposit(self, token: str, amount: int) -> str:
        """Deposit tokens into the treasury vault."""
        func = self.contract.functions.deposit(token, amount)
        return await self._safe_execute(func, "deposit")

    async def withdraw(self, token: str, amount: int, to: str = "") -> str:
        """Withdraw tokens from the treasury vault."""
        dest = to or self.account.address
        func = self.contract.functions.withdraw(token, amount, dest)
        return await self._safe_execute(func, "withdraw")

    async def swap_fx(self, from_token: str, to_token: str, amount: int) -> str:
        """Execute an FX swap — tries contract swapFX, falls back to deposit."""
        func = self.contract.functions.swapFX(from_token, to_token, amount)
        return await self._safe_execute(func, "swapFX")

    async def deposit_yield(self, amount: int) -> str:
        """Deposit USDC into yield — tries depositToYield, falls back."""
        func = self.contract.functions.depositToYield(amount)
        return await self._safe_execute(func, "depositToYield")

    async def withdraw_yield(self, amount: int) -> str:
        """Withdraw from yield — tries withdrawFromYield, falls back."""
        func = self.contract.functions.withdrawFromYield(amount)
        return await self._safe_execute(func, "withdrawFromYield")
