"use client";
import React, { useEffect, useState } from "react";
import { MOCK_WORKERS, FALL_STAGE_LABELS } from "@/monitoring-app/mock/data";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default function FallDetectionWidget() {
  const [workers, setWorkers] = useState(MOCK_WORKERS);
  const fallen = workers.filter((w) => w.fall_stage === "confirmed_fall");

  return (
    <div className="h-full flex flex-col gap-2">
      <div className={`flex items-center gap-2 p-2 rounded-lg border shrink-0 ${fallen.length > 0 ? "border-red-500/50 bg-red-500/10" : "border-green-500/30 bg-green-500/5"}`}>
        {fallen.length > 0
          ? <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
          : <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />}
        <div>
          <div className={`text-xs font-bold ${fallen.length > 0 ? "text-red-400" : "text-green-400"}`}>
            {fallen.length > 0 ? `낙상 감지 ${fallen.length}건` : "전원 안전"}
          </div>
          <div className="text-[9px] text-white/30">SVM+Tilt 알고리즘</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-1 overflow-auto">
        {workers.map((w) => {
          const stage = FALL_STAGE_LABELS[w.fall_stage];
          return (
            <div key={w.workerId} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/[0.02] border border-white/5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: stage.color }} />
              <div className="flex-1">
                <span className="text-xs text-white/70">{w.name}</span>
                <span className="text-[9px] text-white/30 ml-1">{w.location}</span>
              </div>
              <span className="text-[10px] font-medium shrink-0" style={{ color: stage.color }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
