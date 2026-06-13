"use client";
import React, { useState } from "react";
import { MOCK_ALARMS, AlarmSeverity } from "@/monitoring-app/mock/data";
import { AlertTriangle, Info, Zap } from "lucide-react";

const SEVERITY_CONFIG: Record<AlarmSeverity, { color: string; icon: typeof Info }> = {
  critical: { color: "#ef4444", icon: Zap },
  warning:  { color: "#f59e0b", icon: AlertTriangle },
  info:     { color: "#06b6d4", icon: Info },
};

function elapsed(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return `${Math.floor(diff / 3600)}시간 전`;
}

export default function AlarmHistoryWidget() {
  const [alarms, setAlarms] = useState(MOCK_ALARMS);

  const ack = (id: string) =>
    setAlarms((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));

  return (
    <div className="h-full flex flex-col gap-1 overflow-auto">
      {alarms.map((alarm) => {
        const cfg = SEVERITY_CONFIG[alarm.severity];
        const Icon = cfg.icon;
        return (
          <div
            key={alarm.id}
            className={`flex items-start gap-2 p-2 rounded-lg border transition-opacity ${
              alarm.acknowledged ? "opacity-40 border-white/5 bg-transparent" : "border-white/10 bg-white/[0.03]"
            }`}
            style={!alarm.acknowledged ? { borderLeftColor: cfg.color, borderLeftWidth: 2 } : {}}
          >
            <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: cfg.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/70 leading-tight break-words">{alarm.message}</p>
              <p className="text-[9px] text-white/30 mt-0.5">{elapsed(alarm.timestamp)}</p>
            </div>
            {!alarm.acknowledged && (
              <button
                onClick={() => ack(alarm.id)}
                className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-white/40 transition-colors"
              >
                확인
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
