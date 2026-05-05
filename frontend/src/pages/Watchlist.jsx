import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { useWatchlist } from "../hooks/useWatchlist";
import StockCard from "../components/StockCard";
import { useNavigate } from "react-router-dom";

export default function Watchlist() {
  const { stocks } = useSocket();
  const { watchlist, removeFromWatchlist, addToWatchlist } = useWatchlist();
  const [inputVal, setInputVal] = useState("");
  const [addError, setAddError] = useState("");
  const navigate = useNavigate();

  const allSymbols = Object.keys(stocks);

  const handleAdd = () => {
    const sym = inputVal.trim().toUpperCase();
    if (!sym) return;
    if (!allSymbols.includes(sym)) {
      setAddError(`"${sym}" not found in market`);
      return;
    }
    if (watchlist.includes(sym)) {
      setAddError(`"${sym}" already in watchlist`);
      return;
    }
    addToWatchlist(sym);
    setInputVal("");
    setAddError("");
  };

  const watchedStocks = watchlist
    .map((sym) => stocks[sym])
    .filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center justify-between px-5 border-b border-kite-border bg-kite-surface shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-kite-text">Watchlist</h1>
          <p className="text-xs text-kite-muted">{watchlist.length} stocks tracked</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Add stock */}
          <div className="kite-card">
            <h3 className="text-xs font-semibold text-kite-subtext uppercase tracking-wider mb-3">
              Add to Watchlist
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter symbol (e.g. AAPL)"
                value={inputVal}
                onChange={(e) => { setInputVal(e.target.value.toUpperCase()); setAddError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="kite-input flex-1 uppercase"
              />
              <button onClick={handleAdd} className="kite-btn-primary px-4">
                + Add
              </button>
            </div>

            {addError && (
              <p className="text-xs text-kite-red mt-2">{addError}</p>
            )}

            {/* Available symbols */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {allSymbols
                .filter((s) => !watchlist.includes(s))
                .map((sym) => (
                  <button
                    key={sym}
                    onClick={() => addToWatchlist(sym)}
                    className="text-xs font-mono bg-kite-border/50 hover:bg-kite-accent/15 hover:text-kite-accent text-kite-subtext px-2 py-1 rounded transition-all"
                  >
                    {sym}
                  </button>
                ))}
            </div>
          </div>

          {/* Watched stocks */}
          {watchedStocks.length === 0 ? (
            <div className="text-center py-16 text-kite-subtext">
              <div className="text-4xl mb-3">⭐</div>
              <p className="text-sm">Your watchlist is empty</p>
              <p className="text-xs text-kite-muted mt-1">Add stocks using the search above</p>
            </div>
          ) : (
            <div className="kite-card">
              <h3 className="text-xs font-semibold text-kite-subtext uppercase tracking-wider mb-3">
                Tracked Stocks
              </h3>
              <div className="space-y-1">
                <AnimatePresence>
                  {watchedStocks.map((stock) => (
                    <motion.div
                      key={stock.symbol}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="flex-1">
                        <StockCard
                          stock={stock}
                          onClick={() => navigate("/")}
                        />
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(stock.symbol)}
                        className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-kite-muted hover:text-kite-red flex items-center justify-center transition-all text-lg shrink-0"
                        title="Remove"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
