"use client";
import React, { useEffect, useState, useRef } from "react";

const W = 16, H = 12;
function genHeatmap() {
  return Array.from({ length: H }, (_, y) =>
    Array.from({ length: W }, (_, x) => {
      const cx = W / 2, cy = H / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const base = Math.max(0, 85 - dist * 4);
      return base + Math.random() * 8;
    })
  );
}

function tempToColor(t: number): string {
  const min = 30, max = 90;
  const n = Math.max(0, Math.min(1, (t - min) / (max - min)));
  const r = Math.round(n * 255);
  const g = Math.round((1 - Math.abs(n - 0.5) * 2) * 180);
  const b = Math.round((1 - n) * 255);
  return `rgb(${r},${g},${b})`;
}

export default function ThermalCameraWidget() {
  const [map, setMap] = useState(genHeatmap);
  useEffect(() => {
    const t = setInterval(() => setMap(genHeatmap()), 1500);
    return () => clearInterval(t);
  }, []);

  const maxTemp = Math.max(...map.flat());
  const minTemp = Math.min(...map.flat());

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] text-white/40">열화상 카메라</span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-blue-400">Min {minTemp.toFixed(0)}°C</span>
          <span className="text-red-400">Max {maxTemp.toFixed(0)}°C</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden rounded-lg" style={{ display: "grid", gridTemplateColumns: `repeat(${W},1fr)` }}>
        {map.flat().map((t, i) => (
          <div key={i} style={{ background: tempToColor(t) }} className="transition-colors duration-500" />
        ))}
      </div>
      <div className="flex gap-1 shrink-0 items-center">
        <span className="text-[9px] text-blue-400">30°C</span>
        <div className="flex-1 h-1.5 rounded" style={{ background: "linear-gradient(to right, rgb(0,0,255), rgb(0,180,0), rgb(255,0,0))" }} />
        <span className="text-[9px] text-red-400">90°C</span>
      </div>
    </div>
  );
}
