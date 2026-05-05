import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import axios from "axios";
import { useSocket } from "../context/SocketContext";

const BACKEND = "https://kiteflow-backend.onrender.com";

export default function Chart({ symbol }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const volumeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { subscribe } = useSocket();

  // Init chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#111827" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#3b82f6", width: 1, style: 2 },
        horzLine: { color: "#3b82f6", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "#1e293b",
        textColor: "#94a3b8",
      },
      timeScale: {
        borderColor: "#1e293b",
        textColor: "#94a3b8",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight || 380,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const volSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "#3b82f620",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;
    volumeRef.current = volSeries;

    // Handle resize
    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  // Load history when symbol changes
  useEffect(() => {
    if (!symbol || !seriesRef.current) return;

    setLoading(true);
    setError(null);

    axios
      .get(`${BACKEND}/history/${symbol}`)
      .then((res) => {
        const data = res.data;
        if (!data || data.length === 0) throw new Error("No data");

        seriesRef.current.setData(
          data.map((c) => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
        );

        volumeRef.current?.setData(
          data.map((c) => ({
            time: c.time,
            value: c.volume,
            color: c.close >= c.open ? "#22c55e30" : "#ef444430",
          }))
        );

        chartRef.current?.timeScale().fitContent();
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [symbol]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!symbol) return;

    const unsub = subscribe("price_update", (update) => {
      if (update.symbol !== symbol) return;
      if (!seriesRef.current || !update.candle) return;

      const candle = update.candle;
      seriesRef.current.update({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      });

      volumeRef.current?.update({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open ? "#22c55e30" : "#ef444430",
      });
    });

    return unsub;
  }, [symbol, subscribe]);

  return (
    <div className="relative w-full h-full min-h-[380px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-kite-card rounded-xl z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-kite-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-kite-subtext">Loading chart...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-kite-card rounded-xl z-10">
          <div className="text-center">
            <div className="text-kite-red text-lg mb-1">⚠</div>
            <p className="text-kite-subtext text-sm">Chart unavailable</p>
            <p className="text-kite-muted text-xs mt-1">Check if backend is running</p>
          </div>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full tv-chart-container rounded-xl overflow-hidden" />
    </div>
  );
}
