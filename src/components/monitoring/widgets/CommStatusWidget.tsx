"use client";
import React, { useEffect, useState } from "react";
import { MOCK_COMM_STATUS, CommStatus, getRssiLabel } from "@/monitoring-app/mock/data";
import { Wifi, WifiOff } from "lucide-react";

export default function CommStatusWidget() {
  const [statuses, setStatuses] = useState<CommStatus[]>(MOCK_COMM_STATUS);

  useEffect(() => {
    const t = setInterval(() => {
      setStatuses((prev) =>
        prev.map((s) => ({
          ...s,
          rssi: s.protocol === "RS-485" ? s.rssi : parseFloat((s.rssi + (Math.random() - 0.5) * 3).toFixed(0)),
          link_quality: Math.max(0, Math.min(100, s.link_quality + (Math.random() - 0.5) * 5)),
          packet_loss: Math.max(0, s.packet_loss + (Math.random() - 0.5) * 0.5),
        }))
      );
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const STATUS_COLOR: Record<string, string> = {
    online: "#10b981", degraded: "#f59e0b", offline: "#ef4444"
  };

  return (
    <div className="h-full flex flex-col gap-1.5">
      {statuses.map((s) => {
        const c = STATUS_COLOR[s.status];
        return (
          <div key={s.protocol} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="shrink-0">
              {s.status === "offline"
                ? <WifiOff className="w-3.5 h-3.5" style={{ color: c }} />
                : <Wifi className="w-3.5 h-3.5" style={{ color: c }} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-white/80">{s.protocol}</span>
                <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: `${c}20`, color: c }}>
                  {s.status === "online" ? "정상" : s.status === "degraded" ? "저하" : "오프라인"}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/10 mt-1 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.link_quality}%`, background: c }} />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[10px] text-white/60">
                {s.protocol === "RS-485" ? "유선" : `${s.rssi}dBm`}
              </div>
              <div className="text-[9px] text-white/30">{getRssiLabel(s.protocol, s.rssi)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
