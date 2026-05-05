# 📈 KiteFlow — Trading Platform

A production-grade, real-time paper trading platform inspired by Zerodha Kite.

## ✨ Features

- **Live market data** — WebSocket streaming with 1s updates (10 stocks)
- **Candlestick charts** — TradingView Lightweight Charts with real-time appending
- **Buy / Sell engine** — Paper trading with portfolio tracking and real P&L
- **AI Price Forecast** — Momentum-based prediction with confidence scores
- **Watchlist** — Persistent via localStorage
- **Order History** — Full trade log with filtering
- **Dark UI** — Zerodha-inspired design with smooth Framer Motion animations

---

## 🗂 Project Structure

```
trading-platform/
├── backend/
│   ├── app.py            # Flask + SocketIO server
│   ├── data_feed.py      # Random walk market data generator
│   ├── model.py          # AI prediction engine
│   ├── db.py             # SQLite database
│   └── requirements.txt
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── styles.css
        ├── context/
        │   └── SocketContext.jsx
        ├── hooks/
        │   └── useWatchlist.js
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── Chart.jsx
        │   ├── StockCard.jsx
        │   ├── OrderPanel.jsx
        │   └── AIPrediction.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Watchlist.jsx
            ├── Portfolio.jsx
            └── Orders.jsx
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**

---

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server starts at: `http://localhost:5000`

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at: `http://localhost:3000`

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stocks` | All stocks with live prices |
| GET | `/history/<symbol>` | Historical OHLCV candles |
| GET | `/portfolio` | Holdings with P&L |
| GET | `/orders` | Order history |
| POST | `/orders` | Place buy/sell order |
| GET | `/predict/<symbol>` | AI price prediction |

### POST /orders payload
```json
{
  "symbol": "AAPL",
  "order_type": "BUY",
  "quantity": 5
}
```

### WebSocket Events
- `snapshot` — Initial full stock list on connect
- `price_update` — Per-symbol tick updates every 1 second

---

## 📊 Available Stocks

`AAPL`, `GOOGL`, `MSFT`, `TSLA`, `AMZN`, `NVDA`, `META`, `NFLX`, `AMD`, `INTC`

---

## 🔧 Configuration

- Backend port: Change in `app.py` → `socketio.run(..., port=5000)`
- Frontend port: Change in `vite.config.js` → `server.port`
- Candle rotation interval: Change `% 60` in `app.py` background_feed

---

## 🏗 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Charts | TradingView Lightweight Charts v4 |
| Real-time | Socket.IO (client + server) |
| Backend | Python Flask, Flask-SocketIO, eventlet |
| Database | SQLite (drop-in PostgreSQL compatible schema) |
| AI | NumPy momentum/WMA prediction model |
