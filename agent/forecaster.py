"""
FX Rate Forecaster
Uses simple linear regression on recent rate history to predict short-term direction.
For hackathon demo — shows ML integration capability.
"""
import numpy as np
from datetime import datetime, timedelta
from typing import List, Tuple

class FXForecaster:
    def __init__(self):
        self.rate_history: List[Tuple[datetime, float]] = []
        self.lookback = 24  # Use last 24 data points
        self.model_weights = None
        self.last_prediction = None
    
    def add_rate(self, timestamp: datetime, rate: float):
        """Add a new rate observation"""
        self.rate_history.append((timestamp, rate))
        # Keep only last 100 points
        if len(self.rate_history) > 100:
            self.rate_history = self.rate_history[-100:]
    
    def train(self):
        """Fit linear regression on recent rates to detect trend"""
        if len(self.rate_history) < 5:
            return None
        
        recent = self.rate_history[-self.lookback:]
        
        # X = time index, Y = rate
        X = np.arange(len(recent)).reshape(-1, 1)
        Y = np.array([r[1] for r in recent])
        
        # Simple linear regression: Y = wX + b
        X_mean = X.mean()
        Y_mean = Y.mean()
        
        numerator = np.sum((X.flatten() - X_mean) * (Y - Y_mean))
        denominator = np.sum((X.flatten() - X_mean) ** 2)
        
        if denominator == 0:
            self.model_weights = (0, Y_mean)
        else:
            w = numerator / denominator
            b = Y_mean - w * X_mean
            self.model_weights = (w, b)
        
        return self.model_weights
    
    def predict(self, steps_ahead: int = 6) -> dict:
        """
        Predict rate direction for next N steps.
        Returns prediction with confidence.
        """
        if not self.model_weights or len(self.rate_history) < 5:
            return {
                "direction": "stable",
                "confidence": 0.5,
                "predicted_rate": 0.9215,
                "current_rate": 0.9215,
                "change_pct": 0.0,
                "method": "default"
            }
        
        w, b = self.model_weights
        current_idx = len(self.rate_history) - 1
        future_idx = current_idx + steps_ahead
        
        current_rate = self.rate_history[-1][1]
        predicted_rate = w * future_idx + b
        change = predicted_rate - current_rate
        change_pct = (change / current_rate) * 100
        
        # Confidence based on R² and data quantity
        recent = self.rate_history[-self.lookback:]
        Y = np.array([r[1] for r in recent])
        Y_pred = np.array([w * i + b for i in range(len(recent))])
        
        ss_res = np.sum((Y - Y_pred) ** 2)
        ss_tot = np.sum((Y - Y.mean()) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        
        # Scale confidence: min 0.5, max 0.95
        confidence = min(0.95, max(0.5, 0.5 + r_squared * 0.45))
        
        # Determine direction
        if abs(change_pct) < 0.05:
            direction = "stable"
        elif change > 0:
            direction = "up"
        else:
            direction = "down"
        
        self.last_prediction = {
            "direction": direction,
            "confidence": round(confidence, 3),
            "predicted_rate": round(predicted_rate, 6),
            "current_rate": round(current_rate, 6),
            "change_pct": round(change_pct, 4),
            "steps_ahead": steps_ahead,
            "method": "linear_regression",
            "data_points": len(self.rate_history),
            "r_squared": round(r_squared, 4),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        return self.last_prediction
    
    def get_recommendation(self, prediction: dict = None) -> dict:
        """
        Trading recommendation based on forecast.
        """
        if prediction is None:
            prediction = self.predict()
        
        direction = prediction["direction"]
        confidence = prediction["confidence"]
        change_pct = prediction["change_pct"]
        
        if direction == "down" and confidence > 0.65 and abs(change_pct) > 0.1:
            return {
                "action": "SWAP_NOW",
                "reason": f"EURC expected to strengthen {abs(change_pct):.2f}% — swap USDC→EURC now for better rate",
                "urgency": "high",
                "confidence": confidence
            }
        elif direction == "up" and confidence > 0.65 and abs(change_pct) > 0.1:
            return {
                "action": "WAIT",
                "reason": f"EURC expected to weaken {abs(change_pct):.2f}% — delay EURC purchases",
                "urgency": "medium",
                "confidence": confidence
            }
        else:
            return {
                "action": "HOLD",
                "reason": "Rate stable — no action recommended",
                "urgency": "low",
                "confidence": confidence
            }
