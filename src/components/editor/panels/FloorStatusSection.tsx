"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FLOOR_DATA } from "@/guard-app/mock/floorData";

const floor = FLOOR_DATA[0];

export default function FloorStatusSection() {
  const [collapsed, setCollapsed] = useState(false);

  const cameras = floor.cctv.slice(0, 4);
  const devices = floor.devices;

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
          장비·CCTV 상태
        </span>
        <span className="text-[8px]" style={{ color: "var(--guard-color-text-faint)" }}>- 알람 배제</span>
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
            {/* 검색 바 */}
            <div className="px-3 pt-2 pb-1">
              <div
                className="flex items-center gap-2 px-2 text-[10px]"
                style={{
                  height: 24,
                  background: "var(--guard-color-surface)",
                  border: "1px solid var(--guard-color-border)",
                  borderRadius: 4,
                  color: "var(--guard-color-text-faint)",
                }}
              >
                이름·채널·종류 검색
              </div>
            </div>

            {/* CCTV 목록 */}
            <div className="px-2 pb-1">
              <p
                className="px-1 py-1 text-[9px] font-medium uppercase tracking-wider"
                style={{ color: "var(--guard-color-text-faint)" }}
              >
                CCTV ({cameras.length})
              </p>
              {cameras.map((cam) => (
                <div
                  key={cam.id}
                  className="flex items-center gap-2 px-2 py-1.5"
                  style={{ borderBottom: "1px solid color-mix(in srgb, var(--guard-color-border) 50%, transparent)" }}
                >
                  <div
                    className="flex-shrink-0 h-3 w-3 rounded-sm"
                    style={{ background: "var(--guard-color-border)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[10px]" style={{ color: "var(--guard-color-text-soft)" }}>
                      {cam.label}
                    </p>
                    <p className="truncate text-[9px]" style={{ color: "var(--guard-color-text-faint)" }}>
                      {cam.channelId} · Main VMS
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--guard-color-success)" }} />
                    <span className="text-[9px]" style={{ color: "var(--guard-color-success)" }}>연결</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 장비 목록 */}
            <div className="px-2 pb-2" style={{ borderTop: "1px solid var(--guard-color-border)" }}>
              <p
                className="px-1 py-1 text-[9px] font-medium uppercase tracking-wider"
                style={{ color: "var(--guard-color-text-faint)" }}
              >
                출입통제 (1)
              </p>
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center gap-2 px-2 py-1.5"
                  style={{ borderBottom: "1px solid color-mix(in srgb, var(--guard-color-border) 50%, transparent)" }}
                >
                  <div
                    className="flex-shrink-0 h-3 w-3 rounded-sm"
                    style={{ background: "var(--guard-color-border)" }}
                  />
                  <span className="flex-1 truncate text-[10px]" style={{ color: "var(--guard-color-text-soft)" }}>
                    {dev.label}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          dev.status === "CONNECTED" ? "var(--guard-color-success)" : "var(--guard-color-danger)",
                      }}
                    />
                    <span
                      className="text-[9px]"
                      style={{
                        color:
                          dev.status === "CONNECTED" ? "var(--guard-color-success)" : "var(--guard-color-danger)",
                      }}
                    >
                      {dev.status === "CONNECTED" ? "연결" : "끊김"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
