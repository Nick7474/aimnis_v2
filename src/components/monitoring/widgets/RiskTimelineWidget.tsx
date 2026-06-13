"use client";
import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `D-${30 - i}`,
  risk: Math.max(5, Math.min(95, 30 + i * 1.8 + Math.sin(i * 0.5) * 10 + Math.random() * 8)),
}));

export default function RiskTimelineWidget() {
  return (
    <div className="h-full flex flex-col gap-1">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] text-white/40">리스크 트렌드</span>
        <span className="text-xs font-bold text-orange-400">
          {DATA[DATA.length - 1].risk.toFixed(0)}%
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DATA} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#ffffff40" }} interval={9} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#ffffff40" }} unit="%" />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 6, fontSize: 10 }}
              formatter={(v: number) => [`${v.toFixed(1)}%`, "리스크"]}
            />
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="risk" stroke="#ef4444" fill="url(#riskGrad)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
