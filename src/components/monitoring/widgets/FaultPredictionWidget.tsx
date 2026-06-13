"use client";
import React from "react";
import { MOCK_EQUIPMENT } from "@/monitoring-app/mock/data";

const STATUS_COLOR: Record<string, string> = {
  normal: "#10b981", warning: "#f59e0b", critical: "#ef4444", offline: "#6b7280",
};

export default function FaultPredictionWidget() {
  return (
    <div className="h-full flex flex-col gap-1.5 overflow-auto">
      {MOCK_EQUIPMENT.map((eq) => {
        const c = STATUS_COLOR[eq.status];
        return (
          <div key={eq.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/80 truncate">{eq.name}</div>
              <div className="text-[9px] text-white/30">{eq.location}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-xs font-bold" style={{ color: c }}>{eq.health}%</div>
              <div className="text-[9px] text-white/30">S{eq.faultStage}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
