"use client";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { generateGasHistory, GasData } from "@/monitoring-app/mock/data";

export default function GasMonitorWidget() {
  const [data, setData] = useState<GasData[]>(() => generateGasHistory(30));

  useEffect(() => {
    const t = setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1];
        return [
          ...prev.slice(-29),
          {
            timestamp: Date.now(),
            co: parseFloat((last.co + (Math.random() - 0.5) * 5).toFixed(1)),
            ch4: parseFloat((last.ch4 + (Math.random() - 0.5) * 3).toFixed(1)),
            h2: parseFloat((last.h2 + (Math.random() - 0.5) * 4).toFixed(1)),
            c2h2: parseFloat((last.c2h2 + (Math.random() - 0.5) * 1).toFixed(1)),
          },
        ];
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="timestamp" hide />
        <YAxis tick={{ fontSize: 10, fill: "#ffffff40" }} unit="ppm" />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, fontSize: 11 }}
          formatter={(v: number, name: string) => [`${v} ppm`, name.toUpperCase()]}
          labelFormatter={() => ""}
        />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        <Line type="monotone" dataKey="co"   stroke="#ef4444" strokeWidth={1.5} dot={false} name="CO" />
        <Line type="monotone" dataKey="ch4"  stroke="#f59e0b" strokeWidth={1.5} dot={false} name="CH₄" />
        <Line type="monotone" dataKey="h2"   stroke="#06b6d4" strokeWidth={1.5} dot={false} name="H₂" />
        <Line type="monotone" dataKey="c2h2" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="C₂H₂" />
      </LineChart>
    </ResponsiveContainer>
  );
}
