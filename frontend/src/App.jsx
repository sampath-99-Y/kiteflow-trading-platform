import React from "react";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Watchlist from "./pages/Watchlist";
import Portfolio from "./pages/Portfolio";
import Orders from "./pages/Orders";

export default function App() {
  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden bg-kite-bg font-sans">
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </SocketProvider>
  );
}
