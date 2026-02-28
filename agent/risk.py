"""
Risk Assessment Module
Calculates basic risk metrics for treasury positions.
"""
import numpy as np
from typing import List

class RiskAssessor:
    def __init__(self):
        self.rate_history: List[float] = []
    
    def update(self, rate: float):
        self.rate_history.append(rate)
        if len(self.rate_history) > 200:
            self.rate_history = self.rate_history[-200:]
    
    def calculate_var(self, confidence: float = 0.95, position_size: float = 100000) -> dict:
        """
        Value at Risk — how much could we lose in worst case?
        Simple historical VaR calculation.
        """
        if len(self.rate_history) < 10:
            return {
                "var_95": 0,
                "var_99": 0,
                "position_size": position_size,
                "max_loss": 0,
                "method": "insufficient_data"
            }
        
        rates = np.array(self.rate_history)
        returns = np.diff(rates) / rates[:-1]
        
        var_95 = np.percentile(returns, 5) * position_size
        var_99 = np.percentile(returns, 1) * position_size
        
        volatility = np.std(returns)
        max_drawdown = (rates.min() - rates.max()) / rates.max() * position_size
        
        return {
            "var_95": round(abs(var_95), 2),
            "var_99": round(abs(var_99), 2),
            "position_size": position_size,
            "max_loss": round(abs(max_drawdown), 2),
            "volatility": round(volatility * 100, 4),
            "data_points": len(self.rate_history),
            "method": "historical_simulation"
        }
    
    def assess_treasury_risk(self, balances: dict, fx_rate: float) -> dict:
        """
        Overall treasury risk score (0-100, lower is safer).
        """
        usdc = balances.get("usdc", 0)
        eurc = balances.get("eurc", 0)
        usyc = balances.get("usyc", 0)
        total = usdc + (eurc / fx_rate) + usyc
        
        if total == 0:
            return {"score": 0, "level": "none", "factors": []}
        
        factors = []
        score = 0
        
        # Concentration risk — too much in one asset
        usdc_pct = usdc / total
        eurc_pct = (eurc / fx_rate) / total
        usyc_pct = usyc / total
        
        if usdc_pct > 0.7:
            score += 20
            factors.append(f"High USDC concentration: {usdc_pct:.0%}")
        if eurc_pct > 0.5:
            score += 15
            factors.append(f"High EURC exposure: {eurc_pct:.0%}")
        
        # FX volatility risk
        var = self.calculate_var(position_size=eurc / fx_rate)
        if var["volatility"] > 1.0:
            score += 25
            factors.append(f"High FX volatility: {var['volatility']:.2f}%")
        elif var["volatility"] > 0.5:
            score += 10
            factors.append(f"Moderate FX volatility: {var['volatility']:.2f}%")
        
        # Idle capital risk — not earning yield
        if usdc > 100000 and usyc < usdc * 0.3:
            score += 15
            factors.append(f"${usdc - usyc:,.0f} USDC not earning yield")
        
        # Determine level
        if score < 20:
            level = "low"
        elif score < 50:
            level = "moderate"
        else:
            level = "high"
        
        return {
            "score": min(score, 100),
            "level": level,
            "factors": factors,
            "var": var
        }
