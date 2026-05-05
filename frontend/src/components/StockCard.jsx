import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function StockCard({ stock, onClick, isSelected, showStar, onToggleStar }) {
  const prevPrice = useRef(stock?.price);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (!stock) return;
    if (prevPrice.current !== undefined && prevPrice.current !== stock.price) {
      const dir = stock.price > prevPrice.current ? "green" : "red";
      setFlash(dir);
      const t = setTimeout(() => setFlash(null), 600);
      prevPrice.current = stock.price;
      return () => clearTimeout(t);
    }
    prevPrice.current = stock.price;
  }, [stock?.price]);

  if (!stock) return null;

  const isUp = stock.change >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick?.(stock.symbol)}
      className={`
        flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer 
        border transition-all duration-150 select-none
        ${isSelected
          ? "border-kite-accent/50 bg-kite-accent/5"
          : "border-transparent hover:border-kite-border hover:bg-kite-border/20"
        }
        ${flash === "green" ? "flash-green" : flash === "red" ? "flash-red" : ""}
      `}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Ticker badge */}
        <div className="w-9 h-9 rounded-lg bg-kite-border/50 flex items-center justify-center shrink-0">
          <span className="text-xs font-mono font-bold text-kite-subtext">
            {stock.symbol.slice(0, 2)}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-kite-text truncate">{stock.symbol}</div>
          <div className="text-xs text-kite-subtext truncate hidden sm:block">{stock.name}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <div className="text-sm font-mono font-semibold text-kite-text">
            ${stock.price?.toFixed(2)}
          </div>
          <div className={`text-xs font-mono ${isUp ? "price-up" : "price-down"}`}>
            {isUp ? "+" : ""}{stock.change?.toFixed(2)}%
          </div>
        </div>

        {showStar && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStar?.(stock.symbol); }}
            className="ml-1 text-kite-subtext hover:text-yellow-400 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill={onToggleStar ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
