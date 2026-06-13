"use client";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

function genPoint(prev: number) {
  return parseFloat((prev + (Math.random() - 0.5) * 3).toFixed(1));
}

export default function ContactTempWidget() {
  const [data, setData] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      t: i, temp1: 65 + Math.random() * 5, temp2: 58 + Math.random() * 4
    }))
  );

  useEffect(() => {
    const t = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        return [
          ...prev.slice(-19),
          { t: last.t + 1, temp1: genPoint(last.temp1), temp2: genPoint(last.temp2) },
        ];
      });
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const last = data[data.length - 1];
  const warn1 = last.temp1 > 80;
  const warn2 = last.temp2 > 75;

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex gap-2 shrink-0">
        {[{ label: "베어링 1", val: last.temp1, warn: warn1, color: "#f97316" },
          { label: "베어링 2", val: last.temp2, warn: warn2, color: "#06b6d4" }].map((s) => (
          <div key={s.label} className={`flex-1 rounded-lg p-2 border ${s.warn ? "border-red-500/40 bg-red-500/10" : "border-white/5 bg-white/[0.03]"}`}>
            <div className="text-[9px] text-white/40">{s.label}</div>
            <div className="text-base font-bold" style={{ color: s.warn ? "#ef4444" : s.color }}>
              {s.val.toFixed(1)}°C
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
            <XAxis dataKey="t" hide />
            <YAxis tick={{ fontSize: 9, fill: "#ffffff40" }} unit="°C" />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 6, fontSize: 10 }} labelFormatter={() => ""} />
            <Area type="monotone" dataKey="temp1" stroke="#f97316" fill="#f9741620" strokeWidth={1.5} dot={false} name="베어링 1" />
            <Area type="monotone" dataKey="temp2" stroke="#06b6d4" fill="#06b6d420" strokeWidth={1.5} dot={false} name="베어링 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
