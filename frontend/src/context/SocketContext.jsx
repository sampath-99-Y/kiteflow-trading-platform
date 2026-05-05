import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const BACKEND_URL = "https://kiteflow-backend.onrender.com";

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [stocks, setStocks] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("[Socket] Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("[Socket] Disconnected");
    });

    socket.on("snapshot", (data) => {
      const map = {};
      data.forEach((s) => (map[s.symbol] = s));
      setStocks(map);
    });

    socket.on("price_update", (update) => {
      setStocks((prev) => ({
        ...prev,
        [update.symbol]: {
          ...prev[update.symbol],
          ...update,
        },
      }));
      setLastUpdate({ symbol: update.symbol, ts: Date.now() });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribe = useCallback((eventName, handler) => {
    socketRef.current?.on(eventName, handler);
    return () => socketRef.current?.off(eventName, handler);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, stocks, lastUpdate, subscribe, socket: socketRef }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
