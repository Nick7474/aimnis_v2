"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAlarmStore } from "@/guard-app/stores";
import { MOCK_EVENTS } from "@/guard-app/mock/data";

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "var(--guard-color-danger)",
  HIGH: "var(--guard-color-warning)",
  MEDIUM: "var(--guard-color-accent)",
  LOW: "var(--guard-color-success)",
};
const SEV_BG: Record<string, string> = {
  CRITICAL: "color-mix(in srgb, var(--guard-color-danger) 12%, transparent)",
  HIGH: "color-mix(in srgb, var(--guard-color-warning) 12%, transparent)",
  MEDIUM: "color-mix(in srgb, var(--guard-color-accent) 12%, transparent)",
  LOW: "color-mix(in srgb, var(--guard-color-success) 12%, transparent)",
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
    <div style={{ borderBottom: "1px solid var(--guard-color-border)" }}>
      {/* 헤더 */}
      <div
        className="flex items-center gap-2 px-3 cursor-pointer select-none"
        style={{ height: 36, background: "var(--guard-color-surface-strong)", borderBottom: collapsed ? "none" : "1px solid var(--guard-color-border)" }}
        onClick={() => setCollapsed((v) => !v)}
      >
        <ChevronDown
          className="h-3 w-3 flex-shrink-0 transition-transform duration-150"
          style={{ color: "var(--guard-color-accent)", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
        />
        <span className="flex-1 text-xs font-medium" style={{ color: "var(--guard-color-text-strong)" }}>
          알람 패널
        </span>
        {alarms.length > 0 && (
          <span
            className="rounded px-1.5 text-[8px] font-bold"
            style={{ background: "color-mix(in srgb, var(--guard-color-danger) 18%, transparent)", color: "var(--guard-color-danger)" }}
          >
            {alarms.length}건
          </span>
        )}
        <span className="text-[8px]" style={{ color: "var(--guard-color-text-faint)" }}>전체</span>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            style={{ overflow: "hidden", background: "var(--guard-color-bg)" }}
          >
            {/* 이벤트 피드 */}
            <div className="px-2 py-1.5 space-y-0.5">
              {feed.length === 0 && (
                <p className="py-3 text-center text-[10px]" style={{ color: "var(--guard-color-text-faint)" }}>
                  이벤트 없음
                </p>
              )}
              {feed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded"
                  style={{
                    background: item.live ? SEV_BG[item.sev] : "transparent",
                    borderLeft: `2px solid ${SEV_COLOR[item.sev] ?? "var(--guard-color-muted)"}`,
                  }}
                >
                  <span className="text-[9px] font-mono flex-shrink-0" style={{ color: "var(--guard-color-text-faint)" }}>
                    {item.time}
                  </span>
                  <span className="flex-1 truncate text-[10px]" style={{ color: "var(--guard-color-text-soft)" }}>
                    {item.zone}
                  </span>
                  <span
                    className="rounded text-[8px] px-1.5 py-0.5 font-bold flex-shrink-0"
                    style={{
                      background: SEV_BG[item.sev],
                      color: SEV_COLOR[item.sev] ?? "var(--guard-color-muted)",
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
                style={{ borderTop: "1px solid var(--guard-color-border)" }}
              >
                <p className="text-[8px] uppercase tracking-wider px-1" style={{ color: "var(--guard-color-text-faint)" }}>
                  미처리 알람
                </p>
                {alarms.slice(0, 3).map((a) => (
                  <div
                    key={a.eventId}
                    className="flex items-center gap-2 px-2 py-1.5"
                    style={{
                      background: SEV_BG[a.severity],
                      border: `1px solid color-mix(in srgb, ${SEV_COLOR[a.severity]} 30%, transparent)`,
                      borderRadius: 4,
                    }}
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ background: SEV_COLOR[a.severity] }}
                    />
                    <span className="flex-1 truncate text-[10px]" style={{ color: "var(--guard-color-text-strong)" }}>
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
