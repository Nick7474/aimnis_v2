"use client";
import React, { useEffect, useState, useRef } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { ISO_10816_THRESHOLDS, generateVibrationHistory } from "@/monitoring-app/mock/data";

export default function VibrationTimeseriesWidget() {
  const [data, setData] = useState(() => generateVibrationHistory(30));
  const bufRef = useRef(data);

  useEffect(() => {
    const t = setInterval(() => {
      const last = bufRef.current[bufRef.current.length - 1];
      const rms = parseFloat((last.rms + (Math.random() - 0.48) * 0.8).toFixed(2));
      const next = {
        ...last,
        timestamp: Date.now(),
        rms: Math.max(0.5, rms),
        peak: parseFloat((rms * 2.8).toFixed(2)),
      };
      const updated = [...bufRef.current.slice(-29), next];
      bufRef.current = updated;
      setData([...updated]);
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="timestamp" hide />
        <YAxis tick={{ fontSize: 10, fill: "#ffffff40" }} />
        <Tooltip
          contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 8, fontSize: 11 }}
          formatter={(v: number) => [`${v} mm/s`]}
          labelFormatter={() => ""}
        />
        <ReferenceLine y={ISO_10816_THRESHOLDS.acceptable} stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={1} />
        <ReferenceLine y={ISO_10816_THRESHOLDS.alert} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
        <Line type="monotone" dataKey="rms" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="RMS" />
        <Line type="monotone" dataKey="peak" stroke="#8b5cf6" strokeWidth={1} dot={false} strokeDasharray="3 1" name="Peak" />
      </LineChart>
    </ResponsiveContainer>
  );
}
