import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const BACKEND = "https://kiteflow-backend.onrender.com";

export default function AIPrediction({ symbol }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setData(null);

    axios
      .get(`${BACKEND}/predict/${symbol}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="kite-card">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded-full border-2 border-kite-accent border-t-transparent animate-spin" />
          <span className="text-xs text-kite-subtext">AI Analyzing...</span>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton h-4 mb-2 rounded" style={{ width: `${70 + i * 10}%` }} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const isUp = data.direction === "up";
  const priceDiff = data.predicted - data.current;
  const priceDiffPct = ((priceDiff / data.current) * 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="kite-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-500/15 flex items-center justify-center">
            <span className="text-xs">🤖</span>
          </div>
          <span className="text-xs font-semibold text-kite-subtext uppercase tracking-wider">AI Forecast</span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isUp ? "bg-green-500/10 text-kite-green" : "bg-red-500/10 text-kite-red"
          }`}
        >
          {isUp ? "▲ BULLISH" : "▼ BEARISH"}
        </span>
      </div>

      {/* Predicted price */}
      <div className="flex items-end gap-3 mb-4">
        <div>
          <div className="text-xs text-kite-subtext mb-0.5">Predicted Next</div>
          <div className={`text-xl font-mono font-bold ${isUp ? "text-kite-green" : "text-kite-red"}`}>
            ${data.predicted?.toFixed(2)}
          </div>
        </div>
        <div className={`text-sm font-mono pb-0.5 ${isUp ? "text-kite-green" : "text-kite-red"}`}>
          {isUp ? "+" : ""}{priceDiff.toFixed(2)} ({isUp ? "+" : ""}{priceDiffPct}%)
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-kite-subtext">Confidence</span>
          <span className="text-xs font-mono text-kite-text">{data.confidence}%</span>
        </div>
        <div className="h-1.5 bg-kite-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${data.confidence > 60 ? "bg-kite-green" : "bg-yellow-500"}`}
          />
        </div>
      </div>

      {/* Levels grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: "Support", value: data.support, color: "text-kite-green" },
          { label: "Resistance", value: data.resistance, color: "text-kite-red" },
          { label: "Volatility", value: `${data.volatility}%`, color: "text-kite-subtext" },
          { label: "Momentum", value: data.momentum > 0 ? `+${data.momentum}` : data.momentum, color: data.momentum > 0 ? "text-kite-green" : "text-kite-red" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-kite-surface rounded-lg px-2.5 py-2">
            <div className="text-kite-muted mb-0.5">{label}</div>
            <div className={`font-mono font-semibold ${color}`}>{value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
