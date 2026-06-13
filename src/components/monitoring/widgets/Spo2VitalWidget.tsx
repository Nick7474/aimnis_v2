"use client";
import React, { useEffect, useState } from "react";
import { MOCK_WORKERS, evaluateWorkEligibility } from "@/monitoring-app/mock/data";
import { Heart, Wind } from "lucide-react";

export default function Spo2VitalWidget() {
  const [workers, setWorkers] = useState(MOCK_WORKERS);

  useEffect(() => {
    const t = setInterval(() => {
      setWorkers((prev) =>
        prev.map((w) => ({
          ...w,
          spo2: Math.max(80, Math.min(100, w.spo2 + (Math.random() - 0.5) * 2)),
          heart_rate: Math.max(50, Math.min(150, w.heart_rate + (Math.random() - 0.5) * 5)),
        }))
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full flex flex-col gap-1.5 overflow-auto">
      {workers.map((w) => {
        const elig = evaluateWorkEligibility(w.spo2, w.heart_rate);
        const eligColor = { "가능": "#10b981", "주의": "#f59e0b", "투입불가": "#ef4444" }[elig];
        return (
          <div key={w.workerId} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="shrink-0">
              <div className="text-xs font-medium text-white/80">{w.name}</div>
              <div className="text-[9px] text-white/30">{w.location}</div>
            </div>
            <div className="flex-1 flex gap-3 justify-end">
              <div className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-blue-400" />
                <span className={`text-xs font-bold ${w.spo2 < 90 ? "text-red-400" : w.spo2 < 95 ? "text-yellow-400" : "text-white"}`}>
                  {w.spo2.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span className="text-xs text-white/60">{w.heart_rate.toFixed(0)}</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ color: eligColor, background: `${eligColor}20` }}>
                {elig}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
