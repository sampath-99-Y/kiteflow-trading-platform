import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { useWatchlist } from "../hooks/useWatchlist";
import StockCard from "../components/StockCard";
import Chart from "../components/Chart";
import OrderPanel from "../components/OrderPanel";
import AIPrediction from "../components/AIPrediction";

export default function Dashboard() {
  const { stocks, connected } = useSocket();
  const { watchlist, toggleWatchlist, isWatched } = useWatchlist();
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [orderKey, setOrderKey] = useState(0);

  const stockList = Object.values(stocks);
  const selectedStock = stocks[selectedSymbol];

  const topGainers = [...stockList]
    .sort((a, b) => b.change - a.change)
    .slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-kite-border bg-kite-surface shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-kite-text">Market Dashboard</h1>
          <p className="text-xs text-kite-muted">
            {connected ? `${stockList.length} stocks live` : "Connecting to market data..."}
          </p>
        </div>

        {/* Market summary pills */}
        <div className="hidden md:flex items-center gap-3">
          {topGainers.map((s) => (
            <div
              key={s.symbol}
              className="flex items-center gap-1.5 bg-kite-card border border-kite-border rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-kite-accent/40 transition-colors"
              onClick={() => setSelectedSymbol(s.symbol)}
            >
              <span className="text-xs font-mono font-semibold text-kite-text">{s.symbol}</span>
              <span className={`text-xs font-mono ${s.change >= 0 ? "text-kite-green" : "text-kite-red"}`}>
                {s.change >= 0 ? "+" : ""}{s.change?.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Stock list */}
        <div className="w-56 lg:w-64 shrink-0 border-r border-kite-border overflow-y-auto bg-kite-surface">
          <div className="p-3 space-y-0.5">
            <div className="text-xs font-semibold text-kite-muted uppercase tracking-wider px-2 mb-2">
              All Stocks
            </div>
            {stockList.length === 0
              ? [...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-2">
                    <div className="skeleton w-9 h-9 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3 rounded w-16" />
                      <div className="skeleton h-2.5 rounded w-24" />
                    </div>
                  </div>
                ))
              : stockList.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    isSelected={stock.symbol === selectedSymbol}
                    onClick={setSelectedSymbol}
                    showStar={isWatched(stock.symbol)}
                    onToggleStar={toggleWatchlist}
                  />
                ))}
          </div>
        </div>

        {/* Center: Chart */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Symbol header */}
          {selectedStock && (
            <motion.div
              key={selectedSymbol}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between px-5 py-3 border-b border-kite-border shrink-0"
            >
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold font-mono text-kite-text">{selectedSymbol}</span>
                    <span className="text-xs text-kite-subtext bg-kite-border/50 px-1.5 py-0.5 rounded">
                      {selectedStock.sector}
                    </span>
                  </div>
                  <div className="text-xs text-kite-subtext">{selectedStock.name}</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-bold text-kite-text">
                    ${selectedStock.price?.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm font-mono ${
                      selectedStock.change >= 0 ? "text-kite-green" : "text-kite-red"
                    }`}
                  >
                    {selectedStock.change >= 0 ? "+" : ""}
                    {selectedStock.change?.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleWatchlist(selectedSymbol)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    isWatched(selectedSymbol)
                      ? "border-yellow-500/40 text-yellow-400 bg-yellow-500/5"
                      : "border-kite-border text-kite-subtext hover:text-kite-text"
                  }`}
                >
                  ★ {isWatched(selectedSymbol) ? "Watched" : "Watchlist"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Chart area */}
          <div className="flex-1 p-4 min-h-0">
            <Chart key={selectedSymbol} symbol={selectedSymbol} />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-64 shrink-0 border-l border-kite-border overflow-y-auto bg-kite-surface p-3 space-y-3">
          <OrderPanel
            key={`order-${selectedSymbol}-${orderKey}`}
            symbol={selectedSymbol}
            onOrderPlaced={() => setOrderKey((k) => k + 1)}
          />
          <AIPrediction symbol={selectedSymbol} />
        </div>
      </div>
    </div>
  );
}
