import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const BACKEND = "http://localhost:5000";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchOrders = useCallback(() => {
    axios
      .get(`${BACKEND}/orders`)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.order_type === filter);

  const buyCount = orders.filter((o) => o.order_type === "BUY").length;
  const sellCount = orders.filter((o) => o.order_type === "SELL").length;
  const totalVolume = orders.reduce((s, o) => s + o.price * o.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center justify-between px-5 border-b border-kite-border bg-kite-surface shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-kite-text">Orders History</h1>
          <p className="text-xs text-kite-muted">{orders.length} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="text-xs text-kite-subtext hover:text-kite-text transition-colors border border-kite-border px-3 py-1.5 rounded-lg"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Buy Orders", value: buyCount, color: "text-kite-green" },
              { label: "Sell Orders", value: sellCount, color: "text-kite-red" },
              { label: "Total Volume", value: `$${totalVolume.toFixed(0)}`, color: "text-kite-text" },
            ].map((s) => (
              <div key={s.label} className="kite-card text-center">
                <div className="text-xs text-kite-muted mb-1">{s.label}</div>
                <div className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-kite-card border border-kite-border rounded-lg p-1 w-fit">
            {["ALL", "BUY", "SELL"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filter === f
                    ? "bg-kite-accent text-white"
                    : "text-kite-subtext hover:text-kite-text"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Orders table */}
          <div className="kite-card overflow-hidden">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-12 rounded-lg" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm text-kite-subtext">No orders found</p>
                <p className="text-xs text-kite-muted mt-1">
                  {filter !== "ALL" ? `No ${filter} orders placed yet` : "Place your first order on the Dashboard"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-kite-muted border-b border-kite-border">
                      {["#", "Symbol", "Type", "Qty", "Price", "Total", "Time"].map((h) => (
                        <th key={h} className="text-left pb-2 pr-4 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-kite-border/50">
                    {filtered.map((order, i) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-kite-border/10 transition-colors"
                      >
                        <td className="py-3 pr-4 text-xs text-kite-muted font-mono">#{order.id}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-kite-border/50 flex items-center justify-center text-xs font-mono font-bold text-kite-subtext">
                              {order.symbol?.slice(0, 2)}
                            </div>
                            <span className="font-semibold font-mono text-kite-text">{order.symbol}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                              order.order_type === "BUY"
                                ? "bg-green-500/10 text-kite-green"
                                : "bg-red-500/10 text-kite-red"
                            }`}
                          >
                            {order.order_type}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-kite-text">{order.quantity}</td>
                        <td className="py-3 pr-4 font-mono text-kite-subtext">${order.price?.toFixed(2)}</td>
                        <td className="py-3 pr-4 font-mono font-semibold text-kite-text">
                          ${(order.price * order.quantity).toFixed(2)}
                        </td>
                        <td className="py-3 pr-4 text-xs text-kite-muted font-mono">
                          {order.timestamp
                            ? new Date(order.timestamp + "Z").toLocaleTimeString()
                            : "—"}
                        </td>
                      </motion.tr>
                    ))}
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
