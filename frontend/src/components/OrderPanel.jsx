import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSocket } from "../context/SocketContext";

const BACKEND = "https://kiteflow-backend.onrender.com";

export default function OrderPanel({ symbol, onOrderPlaced }) {
  const { stocks } = useSocket();
  const [side, setSide] = useState("BUY");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const stock = stocks[symbol];
  const price = stock?.price ?? 0;
  const total = (price * qty).toFixed(2);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!symbol || qty < 1) return;
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND}/orders`, {
        symbol,
        order_type: side,
        quantity: qty,
      });
      showToast(
        `${side} ${qty} × ${symbol} @ $${res.data.price?.toFixed(2)} ✓`,
        "success"
      );
      onOrderPlaced?.();
    } catch (err) {
      const msg = err.response?.data?.error || "Order failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kite-card flex flex-col gap-4 relative">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-kite-text text-sm">Place Order</h3>
        {symbol && (
          <span className="text-xs font-mono bg-kite-border/50 text-kite-subtext px-2 py-0.5 rounded">
            {symbol}
          </span>
        )}
      </div>

      {/* BUY / SELL Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-kite-border">
        {["BUY", "SELL"].map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`flex-1 py-2 text-sm font-semibold transition-all duration-150 ${
              side === s
                ? s === "BUY"
                  ? "bg-kite-green text-white"
                  : "bg-kite-red text-white"
                : "bg-transparent text-kite-subtext hover:text-kite-text"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Price display */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-kite-subtext">Market Price</span>
        <span className="text-sm font-mono font-semibold text-kite-text">
          ${price.toFixed(2)}
        </span>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-xs text-kite-subtext block mb-1.5">Quantity</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-lg bg-kite-border/50 hover:bg-kite-border text-kite-text text-lg flex items-center justify-center transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="kite-input flex-1 text-center font-mono"
          />
          <button
            onClick={() => setQty((q) => q + 1)}
            className="w-8 h-8 rounded-lg bg-kite-border/50 hover:bg-kite-border text-kite-text text-lg flex items-center justify-center transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="bg-kite-surface rounded-lg px-3 py-2.5 flex justify-between items-center">
        <span className="text-xs text-kite-subtext">Total Value</span>
        <span className="text-sm font-mono font-bold text-kite-text">${total}</span>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || !symbol}
        className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          side === "BUY"
            ? "bg-kite-green hover:bg-green-600 text-white"
            : "bg-kite-red hover:bg-red-600 text-white"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          `${side} ${symbol || "—"}`
        )}
      </button>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute -bottom-12 left-0 right-0 mx-auto px-3 py-2 rounded-lg text-xs font-medium text-center ${
              toast.type === "success"
                ? "bg-green-500/15 text-kite-green border border-green-500/20"
                : "bg-red-500/15 text-kite-red border border-red-500/20"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
