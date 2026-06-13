"use client";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from "recharts";
import { generateVibrationHistory, FFT_REFERENCE_LINES } from "@/monitoring-app/mock/data";

export default function FftSpectrumWidget() {
  const [fft, setFft] = useState(() => generateVibrationHistory(1)[0].fft);

  useEffect(() => {
    const t = setInterval(() => {
      setFft(generateVibrationHistory(1)[0].fft);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full flex flex-col gap-1">
      <div className="flex gap-3 shrink-0">
        {FFT_REFERENCE_LINES.map((r) => (
          <span key={r.label} className="flex items-center gap-1 text-[10px]" style={{ color: r.color }}>
            <span className="w-3 h-px inline-block" style={{ background: r.color }} />
            {r.label} {r.freq}Hz
          </span>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={fft} margin={{ top: 2, right: 2, left: -20, bottom: 0 }} barSize={2}>
            <XAxis dataKey="freq" tick={{ fontSize: 9, fill: "#ffffff40" }} interval={15} unit="Hz" />
            <YAxis tick={{ fontSize: 9, fill: "#ffffff40" }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 6, fontSize: 10 }}
              formatter={(v: number) => [`${v.toFixed(3)} mm/s`, "Amp"]}
              labelFormatter={(v) => `${v} Hz`}
            />
            {FFT_REFERENCE_LINES.map((r) => (
              <ReferenceLine key={r.label} x={r.freq} stroke={r.color} strokeDasharray="4 2" strokeWidth={1.5} />
            ))}
            <Bar dataKey="amplitude">
              {fft.map((entry, i) => {
                const isRef = FFT_REFERENCE_LINES.some((r) => Math.abs(entry.freq - r.freq) < 3);
                return <Cell key={i} fill={isRef ? "#06b6d4" : "#06b6d480"} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
