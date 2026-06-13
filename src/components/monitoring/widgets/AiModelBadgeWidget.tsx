"use client";
import React, { useEffect, useState } from "react";
import { AI_MODEL_BADGES } from "@/monitoring-app/mock/data";
import { Cpu } from "lucide-react";

export default function AiModelBadgeWidget() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % AI_MODEL_BADGES.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center gap-1.5 shrink-0">
        <Cpu className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] text-white/40">AI 모델 현황</span>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        {AI_MODEL_BADGES.map((b, i) => (
          <div
            key={b.type}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-300 ${
              i === active ? "border-opacity-60 bg-opacity-10" : "border-white/5 bg-transparent"
            }`}
            style={i === active ? { borderColor: `${b.color}60`, background: `${b.color}10` } : {}}
          >
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold px-1.5 py-0.5 rounded text-[10px]" style={{ background: `${b.color}20`, color: b.color }}>
                  {b.type}
                </span>
                <span className="text-[10px] text-white/40">{b.target}</span>
              </div>
            </div>
            <div className="shrink-0">
              <div className="text-xs font-bold" style={{ color: b.color }}>{b.accuracy}%</div>
              <div className="text-[9px] text-white/30 text-right">정확도</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
