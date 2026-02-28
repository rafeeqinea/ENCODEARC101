import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file located in the same directory as this config module
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Environment variables
ARC_RPC_URL: str = os.getenv("ARC_RPC_URL", "")
PRIVATE_KEY: str = os.getenv("PRIVATE_KEY", "")
TREASURY_CONTRACT: str = os.getenv("TREASURY_CONTRACT", "")
USDC_ADDRESS: str = os.getenv("USDC_ADDRESS", "")
EURC_ADDRESS: str = os.getenv("EURC_ADDRESS", "")
USYC_ADDRESS: str = os.getenv("USYC_ADDRESS", "")
STORK_API_KEY: str = os.getenv("STORK_API_KEY", "")
STORK_WS_URL: str = os.getenv("STORK_WS_URL", "")
STABLEFX_API_KEY: str = os.getenv("STABLEFX_API_KEY", "")
STABLEFX_BASE_URL: str = os.getenv("STABLEFX_BASE_URL", "https://api-sandbox.circle.com/v1/exchange/stablefx")

# Constants
CHAIN_ID = 5042002
GAS_TOKEN = "USDC"
