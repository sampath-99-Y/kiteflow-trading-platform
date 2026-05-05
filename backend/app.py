from gevent import monkey
monkey.patch_all()

from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import time
from datetime import datetime

from db import init_db, get_connection
from data_feed import init_data, tick, rotate_candles, get_stocks, get_history, get_current_price
from model import predict_next_price

app = Flask(__name__)
app.config["SECRET_KEY"] = "kite-trading-secret-2024"
CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="gevent",
    logger=False,
    engineio_logger=False,
)

# ─────────────────────────────────────────
# Init
# ─────────────────────────────────────────
init_db()
init_data()


# ─────────────────────────────────────────
# Background data emitter
# ─────────────────────────────────────────
_tick_count = 0

def background_feed():
    global _tick_count
    while True:
        socketio.sleep(1)
        updates = tick()
        _tick_count += 1

        for update in updates:
            socketio.emit("price_update", update)

        # Rotate candles every 60 ticks (~60 seconds)
        if _tick_count % 60 == 0:
            rotate_candles()


thread = None

@socketio.on("connect")
def on_connect():
    global thread
    print(f"[WS] Client connected: {request.sid}")
    if thread is None or not thread.is_alive():
        thread = socketio.start_background_task(background_feed)

    # Send initial snapshot
    emit("snapshot", get_stocks())


@socketio.on("disconnect")
def on_disconnect():
    print(f"[WS] Client disconnected: {request.sid}")


# ─────────────────────────────────────────
# REST API Routes
# ─────────────────────────────────────────

@app.route("/stocks", methods=["GET"])
def stocks_route():
    return jsonify(get_stocks())


@app.route("/history/<symbol>", methods=["GET"])
def history_route(symbol):
    data = get_history(symbol.upper())
    if not data:
        return jsonify({"error": "Symbol not found"}), 404
    return jsonify(data)


@app.route("/portfolio", methods=["GET"])
def portfolio_route():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM portfolio WHERE quantity > 0").fetchall()
    conn.close()
    result = []
    for row in rows:
        sym = row["symbol"]
        current_price = get_current_price(sym)
        avg = row["avg_price"]
        qty = row["quantity"]
        pnl = round((current_price - avg) * qty, 2)
        pnl_pct = round(((current_price - avg) / avg) * 100, 2) if avg else 0
        result.append({
            "symbol": sym,
            "quantity": qty,
            "avg_price": avg,
            "current_price": current_price,
            "pnl": pnl,
            "pnl_pct": pnl_pct,
            "invested": round(avg * qty, 2),
            "current_value": round(current_price * qty, 2),
        })
    return jsonify(result)


@app.route("/orders", methods=["GET"])
def get_orders():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM orders ORDER BY id DESC LIMIT 100"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/orders", methods=["POST"])
def place_order():
    data = request.json
    symbol = data.get("symbol", "").upper()
    order_type = data.get("order_type", "").upper()  # BUY or SELL
    quantity = int(data.get("quantity", 0))

    if not symbol or order_type not in ("BUY", "SELL") or quantity <= 0:
        return jsonify({"error": "Invalid order parameters"}), 400

    price = get_current_price(symbol)
    if price == 0:
        return jsonify({"error": "Unknown symbol"}), 404

    conn = get_connection()

    if order_type == "BUY":
        row = conn.execute("SELECT * FROM portfolio WHERE symbol=?", (symbol,)).fetchone()
        if row:
            new_qty = row["quantity"] + quantity
            new_avg = round(((row["avg_price"] * row["quantity"]) + (price * quantity)) / new_qty, 4)
            conn.execute(
                "UPDATE portfolio SET quantity=?, avg_price=? WHERE symbol=?",
                (new_qty, new_avg, symbol)
            )
        else:
            conn.execute(
                "INSERT INTO portfolio (symbol, quantity, avg_price) VALUES (?,?,?)",
                (symbol, quantity, price)
            )

    elif order_type == "SELL":
        row = conn.execute("SELECT * FROM portfolio WHERE symbol=?", (symbol,)).fetchone()
        if not row or row["quantity"] < quantity:
            conn.close()
            return jsonify({"error": "Insufficient holdings to sell"}), 400
        new_qty = row["quantity"] - quantity
        conn.execute("UPDATE portfolio SET quantity=? WHERE symbol=?", (new_qty, symbol))

    conn.execute(
        "INSERT INTO orders (symbol, order_type, quantity, price, timestamp) VALUES (?,?,?,?,?)",
        (symbol, order_type, quantity, price, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

    return jsonify({
        "status": "success",
        "symbol": symbol,
        "order_type": order_type,
        "quantity": quantity,
        "price": price,
        "total": round(price * quantity, 2),
    })


@app.route("/predict/<symbol>", methods=["GET"])
def predict_route(symbol):
    history = get_history(symbol.upper())
    if not history:
        return jsonify({"error": "Symbol not found"}), 404
    prices = [c["close"] for c in history[-30:]]
    result = predict_next_price(prices)
    result["symbol"] = symbol.upper()
    return jsonify(result)


if __name__ == "__main__":
    print("[SERVER] Starting Kite Trading Platform on port 5000...")
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)
