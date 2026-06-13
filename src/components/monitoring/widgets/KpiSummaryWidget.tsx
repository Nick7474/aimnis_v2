"use client";
import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, Users, Wifi } from "lucide-react";

const KPIS = [
  { label: "설비 건강도", value: 78, unit: "%", icon: Activity, color: "#10b981", change: +2 },
  { label: "활성 알람", value: 3, unit: "건", icon: AlertTriangle, color: "#ef4444", change: -1 },
  { label: "현장 작업자", value: 12, unit: "명", icon: Users, color: "#06b6d4", change: 0 },
  { label: "통신 정상률", value: 96, unit: "%", icon: Wifi, color: "#8b5cf6", change: +1 },
];

export default function KpiSummaryWidget() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 h-full">
      {KPIS.map((kpi) => {
        const Icon = kpi.icon;
        const noise = (tick % 2 === 0 ? 0 : Math.floor(Math.random() * 2 - 1));
        const val = Math.max(0, kpi.value + noise);
        return (
          <div
            key={kpi.label}
            className="flex flex-col items-center justify-center gap-1 rounded-lg bg-white/[0.03] border border-white/5 p-2"
          >
            <Icon className="w-4 h-4" style={{ color: kpi.color }} />
            <div className="text-xl font-bold text-white leading-none">
              {val}
              <span className="text-xs font-normal text-white/40 ml-0.5">{kpi.unit}</span>
            </div>
            <div className="text-[10px] text-white/40 text-center leading-tight">{kpi.label}</div>
            <div className={`text-[10px] font-medium ${kpi.change > 0 ? "text-green-400" : kpi.change < 0 ? "text-red-400" : "text-white/30"}`}>
              {kpi.change > 0 ? `▲${kpi.change}` : kpi.change < 0 ? `▼${Math.abs(kpi.change)}` : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
