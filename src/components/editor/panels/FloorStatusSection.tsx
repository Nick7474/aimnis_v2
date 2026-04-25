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
          장비·CCTV 상태
        </span>
        <span className="text-[8px]" style={{ color: "#334155" }}>- 알람 배제</span>
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
            {/* 검색 바 */}
            <div className="px-3 pt-2 pb-1">
              <div
                className="flex items-center gap-2 px-2 text-[10px]"
                style={{
                  height: 24,
                  background: "#0C1733",
                  border: "1px solid #1E3A5F",
                  borderRadius: 4,
                  color: "#475569",
                }}
              >
                이름·채널·종류 검색
              </div>
            </div>

            {/* CCTV 목록 */}
            <div className="px-2 pb-1">
              <p
                className="px-1 py-1 text-[9px] font-medium uppercase tracking-wider"
                style={{ color: "#334155" }}
              >
                CCTV ({cameras.length})
              </p>
              {cameras.map((cam) => (
                <div
                  key={cam.id}
                  className="flex items-center gap-2 px-2 py-1.5"
                  style={{ borderBottom: "1px solid #0C1733" }}
                >
                  <div
                    className="flex-shrink-0 h-3 w-3 rounded-sm"
                    style={{ background: "#1E3A5F" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[10px]" style={{ color: "#94a3b8" }}>
                      {cam.label}
                    </p>
                    <p className="truncate text-[9px]" style={{ color: "#334155" }}>
                      {cam.channelId} · Main VMS
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#16A34A" }} />
                    <span className="text-[9px]" style={{ color: "#16A34A" }}>연결</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 장비 목록 */}
            <div className="px-2 pb-2" style={{ borderTop: "1px solid #1E3A5F" }}>
              <p
                className="px-1 py-1 text-[9px] font-medium uppercase tracking-wider"
                style={{ color: "#334155" }}
              >
                출입통제 (1)
              </p>
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  className="flex items-center gap-2 px-2 py-1.5"
                  style={{ borderBottom: "1px solid #0C1733" }}
                >
                  <div
                    className="flex-shrink-0 h-3 w-3 rounded-sm"
                    style={{ background: "#1E3A5F" }}
                  />
                  <span className="flex-1 truncate text-[10px]" style={{ color: "#94a3b8" }}>
                    {dev.label}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          dev.status === "CONNECTED" ? "#16A34A" : "#DC2626",
                      }}
                    />
                    <span
                      className="text-[9px]"
                      style={{
                        color:
                          dev.status === "CONNECTED" ? "#16A34A" : "#DC2626",
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
