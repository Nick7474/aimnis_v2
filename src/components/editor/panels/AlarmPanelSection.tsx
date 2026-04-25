"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAlarmStore } from "@/guard-app/stores";
import { MOCK_EVENTS } from "@/guard-app/mock/data";

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "#ff4d4f",
  HIGH: "#fa8c16",
  MEDIUM: "#fadb14",
  LOW: "#52c41a",
};
const SEV_BG: Record<string, string> = {
  CRITICAL: "rgba(255,77,79,0.12)",
  HIGH: "rgba(250,140,22,0.12)",
  MEDIUM: "rgba(250,219,20,0.12)",
  LOW: "rgba(82,196,26,0.12)",
};

export default function AlarmPanelSection() {
  const alarms = useAlarmStore((s) => s.alarms);
  const [collapsed, setCollapsed] = useState(false);

  // 이벤트 피드 = MOCK_EVENTS + 실시간 alarms (unacked 우선)
  const feed = [
    ...alarms.map((a) => ({
      id: a.eventId,
      time: a.occurredAt?.slice(11, 19) ?? "—",
      zone: a.zoneName,
      sev: a.severity,
      live: true,
    })),
    ...MOCK_EVENTS.slice(0, 6).map((e) => ({
      id: e.id,
      time: e.occurredAt.slice(11, 19),
      zone: e.zoneName,
      sev: e.severity as string,
      live: false,
    })),
  ].slice(0, 8);

  return (
    <div style={{ borderBottom: "1px solid #1E3A5F" }}>
      {/* 헤더 */}
      <div
        className="flex items-center gap-2 px-3 cursor-pointer select-none"
        style={{ height: 36, background: "#0A1428", borderBottom: collapsed ? "none" : "1px solid #1E3A5F" }}
        onClick={() => setCollapsed((v) => !v)}
      >
        <ChevronDown
          className="h-3 w-3 flex-shrink-0 transition-transform duration-150"
          style={{ color: "#60A5FA", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        />
        <span className="flex-1 text-xs font-medium" style={{ color: "#e2e8f0" }}>
          알람 패널
        </span>
        {alarms.length > 0 && (
          <span
            className="rounded px-1.5 text-[8px] font-bold"
            style={{ background: "rgba(255,77,79,0.18)", color: "#ff7875" }}
          >
            {alarms.length}건
          </span>
        )}
        <span className="text-[8px]" style={{ color: "#334155" }}>전체</span>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            style={{ overflow: "hidden", background: "#070F24" }}
          >
            {/* 이벤트 피드 */}
            <div className="px-2 py-1.5 space-y-0.5">
              {feed.length === 0 && (
                <p className="py-3 text-center text-[10px]" style={{ color: "#334155" }}>
                  이벤트 없음
                </p>
              )}
              {feed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded"
                  style={{
                    background: item.live ? SEV_BG[item.sev] : "transparent",
                    borderLeft: `2px solid ${SEV_COLOR[item.sev] ?? "#475569"}`,
                  }}
                >
                  <span className="text-[9px] font-mono flex-shrink-0" style={{ color: "#475569" }}>
                    {item.time}
                  </span>
                  <span className="flex-1 truncate text-[10px]" style={{ color: "#94a3b8" }}>
                    {item.zone}
                  </span>
                  <span
                    className="rounded text-[8px] px-1.5 py-0.5 font-bold flex-shrink-0"
                    style={{
                      background: SEV_BG[item.sev],
                      color: SEV_COLOR[item.sev] ?? "#475569",
                    }}
                  >
                    {item.sev}
                  </span>
                </div>
              ))}
            </div>

            {/* 알람 패널 (활성 알람) */}
            {alarms.length > 0 && (
              <div
                className="px-2 pb-2 pt-1 space-y-1"
                style={{ borderTop: "1px solid #1E3A5F" }}
              >
                <p className="text-[8px] uppercase tracking-wider px-1" style={{ color: "#334155" }}>
                  미처리 알람
                </p>
                {alarms.slice(0, 3).map((a) => (
                  <div
                    key={a.eventId}
                    className="flex items-center gap-2 px-2 py-1.5"
                    style={{
                      background: SEV_BG[a.severity],
                      border: `1px solid ${SEV_COLOR[a.severity]}30`,
                      borderRadius: 4,
                    }}
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ background: SEV_COLOR[a.severity] }}
                    />
                    <span className="flex-1 truncate text-[10px]" style={{ color: "#e2e8f0" }}>
                      {a.zoneName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
