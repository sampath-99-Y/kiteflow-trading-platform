import random
import time
from datetime import datetime, timedelta

STOCKS = [
    {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology", "base_price": 182.0},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology", "base_price": 141.0},
    {"symbol": "MSFT", "name": "Microsoft Corp.", "sector": "Technology", "base_price": 415.0},
    {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Automotive", "base_price": 245.0},
    {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "E-Commerce", "base_price": 185.0},
    {"symbol": "NVDA", "name": "NVIDIA Corp.", "sector": "Semiconductors", "base_price": 875.0},
    {"symbol": "META", "name": "Meta Platforms", "sector": "Social Media", "base_price": 510.0},
    {"symbol": "NFLX", "name": "Netflix Inc.", "sector": "Streaming", "base_price": 628.0},
    {"symbol": "AMD", "name": "Advanced Micro Devices", "sector": "Semiconductors", "base_price": 165.0},
    {"symbol": "INTC", "name": "Intel Corp.", "sector": "Semiconductors", "base_price": 30.0},
]

# Live price state
_prices = {s["symbol"]: s["base_price"] for s in STOCKS}
_open_prices = {s["symbol"]: s["base_price"] for s in STOCKS}
_candles = {}  # symbol -> list of OHLCV dicts
_current_candle = {}  # symbol -> current forming candle


def _generate_history(symbol, base_price, days=60):
    candles = []
    price = base_price * random.uniform(0.85, 1.0)
    now = datetime.utcnow()
    start = now - timedelta(days=days)

    for i in range(days * 8):  # 8 candles/day (3h intervals)
        t = start + timedelta(hours=i * 3)
        open_p = price
        change = random.gauss(0, price * 0.012)
        close_p = round(max(open_p + change, 1.0), 2)
        high_p = round(max(open_p, close_p) + abs(random.gauss(0, price * 0.005)), 2)
        low_p = round(min(open_p, close_p) - abs(random.gauss(0, price * 0.005)), 2)
        vol = int(random.uniform(50000, 500000))

        candles.append({
            "time": int(t.timestamp()),
            "open": round(open_p, 2),
            "high": high_p,
            "low": low_p,
            "close": close_p,
            "volume": vol,
        })
        price = close_p

    return candles


def init_data():
    for stock in STOCKS:
        sym = stock["symbol"]
        history = _generate_history(sym, stock["base_price"])
        _candles[sym] = history
        last = history[-1]
        _prices[sym] = last["close"]
        _open_prices[sym] = last["open"]

        # Start a new forming candle
        _current_candle[sym] = {
            "time": int(datetime.utcnow().timestamp()),
            "open": last["close"],
            "high": last["close"],
            "low": last["close"],
            "close": last["close"],
            "volume": 0,
        }


def tick():
    """Advance prices one tick. Returns list of update dicts."""
    updates = []
    for stock in STOCKS:
        sym = stock["symbol"]
        prev = _prices[sym]
        volatility = prev * 0.003
        change = random.gauss(0, volatility)
        new_price = round(max(prev + change, 0.5), 2)
        _prices[sym] = new_price

        pct_change = round(((new_price - _open_prices[sym]) / _open_prices[sym]) * 100, 2)
        volume_tick = int(random.uniform(1000, 15000))

        # Update current forming candle
        c = _current_candle[sym]
        c["close"] = new_price
        c["high"] = max(c["high"], new_price)
        c["low"] = min(c["low"], new_price)
        c["volume"] += volume_tick

        updates.append({
            "symbol": sym,
            "name": stock["name"],
            "price": new_price,
            "change": pct_change,
            "volume": volume_tick,
            "open": _open_prices[sym],
            "candle": dict(c),
        })

    return updates


def rotate_candles():
    """Seal current candle and start a new one (call every 60s or so)."""
    now = int(datetime.utcnow().timestamp())
    for sym in _current_candle:
        sealed = dict(_current_candle[sym])
        _candles[sym].append(sealed)
        if len(_candles[sym]) > 500:
            _candles[sym] = _candles[sym][-500:]

        _current_candle[sym] = {
            "time": now,
            "open": _prices[sym],
            "high": _prices[sym],
            "low": _prices[sym],
            "close": _prices[sym],
            "volume": 0,
        }


def get_stocks():
    result = []
    for stock in STOCKS:
        sym = stock["symbol"]
        price = _prices.get(sym, stock["base_price"])
        open_p = _open_prices.get(sym, price)
        pct = round(((price - open_p) / open_p) * 100, 2) if open_p else 0
        result.append({
            "symbol": sym,
            "name": stock["name"],
            "sector": stock["sector"],
            "price": price,
            "change": pct,
            "open": open_p,
        })
    return result


def get_history(symbol):
    return _candles.get(symbol.upper(), [])


def get_current_price(symbol):
    return _prices.get(symbol.upper(), 0.0)
