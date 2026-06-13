"use client";
import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

function genWave(pts = 80) {
  return Array.from({ length: pts }, (_, i) => ({
    i,
    amp: parseFloat((Math.sin(i * 0.4) * 0.6 + Math.sin(i * 1.2) * 0.3 + (Math.random() - 0.5) * 0.2).toFixed(3)),
  }));
}

export default function UltrasoundWaveWidget() {
  const [wave, setWave] = useState(genWave);
  const [freq, setFreq] = useState(40.2);

  useEffect(() => {
    const t = setInterval(() => {
      setWave(genWave());
      setFreq((f) => parseFloat((f + (Math.random() - 0.5) * 0.5).toFixed(1)));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] text-white/40">초음파 파형</span>
        <span className="text-xs font-bold text-purple-400">{freq} kHz</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={wave} margin={{ top: 2, right: 2, left: -24, bottom: 0 }}>
            <XAxis dataKey="i" hide />
            <YAxis domain={[-1.2, 1.2]} tick={{ fontSize: 9, fill: "#ffffff40" }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #ffffff20", borderRadius: 6, fontSize: 10 }} labelFormatter={() => ""} />
            <ReferenceLine y={0} stroke="#ffffff10" />
            <Line type="monotone" dataKey="amp" stroke="#a855f7" strokeWidth={1.5} dot={false} name="진폭" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
