import numpy as np
import random


def predict_next_price(prices: list) -> dict:
    """
    Simulated trend-based prediction model.
    Uses weighted moving average + momentum + noise to predict next price.
    Returns prediction with confidence and direction.
    """
    if not prices or len(prices) < 5:
        return {"predicted": None, "confidence": 0, "direction": "neutral", "error": "Insufficient data"}

    arr = np.array(prices, dtype=float)

    # Weighted moving average (more weight on recent)
    weights = np.exp(np.linspace(0, 1, len(arr)))
    weights /= weights.sum()
    wma = float(np.dot(arr, weights))

    # Momentum: slope of last 10 prices (or all if less)
    window = min(10, len(arr))
    recent = arr[-window:]
    x = np.arange(window)
    slope, _ = np.polyfit(x, recent, 1)

    # Volatility (std of recent returns)
    returns = np.diff(arr[-20:]) / arr[-20:-1] if len(arr) >= 20 else np.diff(arr) / arr[:-1]
    volatility = float(np.std(returns)) if len(returns) > 0 else 0.01

    # Predict: wma + momentum step + tiny noise
    noise = random.gauss(0, volatility * arr[-1] * 0.3)
    predicted = round(wma + slope + noise, 2)
    predicted = max(predicted, 0.01)

    # Confidence: inverse of volatility, clamped
    raw_confidence = max(0, 1 - (volatility * 20))
    confidence = round(min(raw_confidence, 0.95) * 100, 1)

    direction = "up" if predicted > arr[-1] else "down" if predicted < arr[-1] else "neutral"

    # Support/resistance levels
    support = round(float(np.min(arr[-20:])), 2) if len(arr) >= 20 else round(float(arr.min()), 2)
    resistance = round(float(np.max(arr[-20:])), 2) if len(arr) >= 20 else round(float(arr.max()), 2)

    return {
        "predicted": predicted,
        "current": round(float(arr[-1]), 2),
        "confidence": confidence,
        "direction": direction,
        "support": support,
        "resistance": resistance,
        "wma": round(wma, 2),
        "momentum": round(float(slope), 4),
        "volatility": round(volatility * 100, 3),
    }
