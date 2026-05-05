import { useState, useEffect } from "react";

const STORAGE_KEY = "kiteflow_watchlist";
const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "NVDA", "TSLA"];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol.toUpperCase())) {
      setWatchlist((prev) => [...prev, symbol.toUpperCase()]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol.toUpperCase()));
  };

  const isWatched = (symbol) => watchlist.includes(symbol.toUpperCase());

  const toggleWatchlist = (symbol) => {
    if (isWatched(symbol)) removeFromWatchlist(symbol);
    else addToWatchlist(symbol);
  };

  return { watchlist, addToWatchlist, removeFromWatchlist, isWatched, toggleWatchlist };
}
