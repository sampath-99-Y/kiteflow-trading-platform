import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const BACKEND = "http://localhost:5000";

function StatCard({ label, value, sub, color }) {
  return (
    <div className="kite-card">
      <div className="text-xs text-kite-muted mb-1">{label}</div>
      <div className={`text-xl font-mono font-bold ${color || "text-kite-text"}`}>{value}</div>
      {sub && <div className="text-xs text-kite-subtext mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Portfolio() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(() => {
    axios
      .get(`${BACKEND}/portfolio`)
      .then((res) => setHoldings(res.data))
      .catch(() => setHoldings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 3000);
    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const totalValue = holdings.reduce((s, h) => s + h.current_value, 0);
  const totalPnl = totalValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center px-5 border-b border-kite-border bg-kite-surface shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-kite-text">Portfolio</h1>
          <p className="text-xs text-kite-muted">{holdings.length} active positions</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total Invested"
              value={`$${totalInvested.toFixed(2)}`}
              color="text-kite-text"
            />
            <StatCard
              label="Current Value"
              value={`$${totalValue.toFixed(2)}`}
              color="text-kite-text"
            />
            <StatCard
              label="Total P&L"
              value={`${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`}
              sub={`${totalPnlPct >= 0 ? "+" : ""}${totalPnlPct.toFixed(2)}%`}
              color={totalPnl >= 0 ? "text-kite-green" : "text-kite-red"}
            />
            <StatCard
              label="Positions"
              value={holdings.length}
              color="text-kite-text"
            />
          </div>

          {/* Holdings table */}
          <div className="kite-card overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-kite-subtext uppercase tracking-wider">Holdings</h3>
              <button
                onClick={fetchPortfolio}
                className="text-xs text-kite-subtext hover:text-kite-text transition-colors"
              >
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-lg" />
                ))}
              </div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-sm text-kite-subtext">No holdings yet</p>
                <p className="text-xs text-kite-muted mt-1">Place a buy order to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-kite-muted border-b border-kite-border">
                      {["Symbol", "Qty", "Avg Price", "Current", "Invested", "Value", "P&L", "P&L %"].map(
                        (h) => (
                          <th key={h} className="text-left pb-2 pr-4 font-medium">
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kite-border/50">
                    {holdings.map((h, i) => {
                      const isUp = h.pnl >= 0;
                      return (
                        <motion.tr
                          key={h.symbol}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="hover:bg-kite-border/10 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-md bg-kite-border/50 flex items-center justify-center text-xs font-mono font-bold text-kite-subtext">
                                {h.symbol.slice(0, 2)}
                              </div>
                              <span className="font-semibold font-mono text-kite-text">
                                {h.symbol}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-mono text-kite-text">{h.quantity}</td>
                          <td className="py-3 pr-4 font-mono text-kite-subtext">${h.avg_price?.toFixed(2)}</td>
                          <td className="py-3 pr-4 font-mono text-kite-text">${h.current_price?.toFixed(2)}</td>
                          <td className="py-3 pr-4 font-mono text-kite-subtext">${h.invested?.toFixed(2)}</td>
                          <td className="py-3 pr-4 font-mono text-kite-text">${h.current_value?.toFixed(2)}</td>
                          <td className={`py-3 pr-4 font-mono font-semibold ${isUp ? "text-kite-green" : "text-kite-red"}`}>
                            {isUp ? "+" : ""}${h.pnl?.toFixed(2)}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isUp ? "badge-up" : "badge-down"}`}>
                              {isUp ? "+" : ""}{h.pnl_pct?.toFixed(2)}%
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
