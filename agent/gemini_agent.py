import os
import json
import logging
from datetime import datetime
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Initialize the Gemini SDK if the key is present
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

def make_decision_with_gemini(balances, fx_rate, yield_data, upcoming_obligations, prediction, recommendation):
    """
    Passes treasury state to Gemini 1.5 Pro to return a structured JSON decision.
    Falls back to a basic HOLD response if Gemini fails.
    """
    if not API_KEY:
        logger.warning("No GEMINI_API_KEY found. Reverting to rule-based execution.")
        raise ValueError("Missing Gemini Key")

    model = genai.GenerativeModel("gemini-1.5-pro-latest")

    state_context = f"""
    You are an autonomous AI Treasury Manager for ArcTreasury.
    You manage corporate stablecoin liquidity on the Arc Testnet.
    
    Current State:
    - USDC Balance: ${balances.get('usdc', 0):,.2f}
    - EURC Balance: €{balances.get('eurc', 0):,.2f}
    - USYC Balance: ${balances.get('usyc', 0):,.2f} (Tokenized T-Bill Yield)
    - Current EURC/USDC FX Rate: {fx_rate:.4f}
    - Current USYC APY: 4.5%
    
    Upcoming Payments (Obligations):
    {json.dumps(upcoming_obligations, indent=2)}
    
    Market Oracle Forecast (EURC/USDC):
    Direction: {prediction.get('direction', 'neutral')}
    Confidence: {prediction.get('confidence', 0):.2f}
    Recommendation: {recommendation.get('action', 'none')}

    Rules:
    You must output EXACTLY one valid JSON object and nothing else. Do not use markdown blocks like ```json.
    Choose exactly one action from this list:
    1. "PAYOUT" (If an obligation is due within 24h, execute the payment)
    2. "FX_SWAP" (If we need EURC for an upcoming obligation, swap USDC->EURC via StableFX. Or if ML recommends a strategic trade)
    3. "YIELD_DEPOSIT" (If we have idle USDC over $50,000 and no immediate payments, deposit it into USYC)
    4. "YIELD_WITHDRAW" (If we need USDC for payments but it is locked in USYC)
    5. "HOLD" (If everything is perfectly balanced)

    Format requirements:
    {{
        "action": "ACTION_NAME",
        "reason": "Clear explanation of why this action was chosen based on the data",
        "amount": 1000.00,
        "token": "USDC->EURC" or "USDC->USYC" or "EURC",
        "confidence": 0.95
    }}
    """

    try:
        response = model.generate_content(state_context)
        response_text = response.text.strip()
        
        # Strip markdown if Gemini ignores instructions
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        decision = json.loads(response_text)
        decision["metadata"] = {"source": "gemini-1.5-pro", "fx_rate": fx_rate}
        
        # Add linked obligation ID if it's a payout
        if decision["action"] == "PAYOUT" and upcoming_obligations:
            # Try to find the matching obligation
            for obl in upcoming_obligations:
                if obl["currency"] in decision["token"]:
                    decision["linked_obligation"] = obl["id"]
                    break
                    
        return decision

    except Exception as e:
        logger.error(f"Gemini AI failed: {e}")
        raise
