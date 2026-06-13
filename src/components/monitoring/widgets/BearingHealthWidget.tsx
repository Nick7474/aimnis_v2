"use client";
import React, { useEffect, useState } from "react";
import { FAULT_STAGES } from "@/monitoring-app/mock/data";

export default function BearingHealthWidget() {
  const [health, setHealth] = useState(72);
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setHealth((h) => Math.max(0, Math.min(100, h + (Math.random() - 0.52) * 2)));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const stageData = FAULT_STAGES[stage] ?? FAULT_STAGES[0];
  const pct = health;
  const color = pct > 70 ? "#10b981" : pct > 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40">베어링 건강도</span>
        <span className="text-xs font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
      </div>
      {/* 게이지 바 */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
      {/* 고장 단계 */}
      <div className="flex gap-1 mt-1">
        {FAULT_STAGES.map((s, i) => (
          <button
            key={s.stage}
            onClick={() => setStage(i)}
            className={`flex-1 rounded px-1 py-1 text-[9px] text-center border transition-colors ${
              i === stage
                ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400"
                : "border-white/5 bg-white/[0.02] text-white/30"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="text-[10px] text-white/40 leading-relaxed">
        <span className="text-yellow-400">▶</span> {stageData.action}
      </div>
      <div className="flex flex-wrap gap-1">
        {stageData.sensors.map((s) => (
          <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{s}</span>
        ))}
      </div>
    </div>
  );
}
