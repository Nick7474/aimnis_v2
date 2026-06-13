"use client";
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Activity, Layout, GitBranch } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { useMonitoringEditorStore } from "@/store/monitoringEditorStore";
import MonitoringLeftPanel from "./MonitoringLeftPanel";
import MonitoringWrapper from "./MonitoringWrapper";
import MonitoringRightPanel from "./MonitoringRightPanel";
import MappingCanvas from "@/components/editor/MappingCanvas";

// 내장 앱 뷰 (iframe 또는 직접 렌더)
import MonitoringAppView from "./MonitoringAppView";

const LEFT_PANEL_WIDTH = 320;
const RIGHT_PANEL_WIDTH = 320;

export default function MonitoringEditorLayout() {
  const {
    showRightPanel, setShowRightPanel,
    centerView, setCenterView,
    addWidget, updateWidgetProps,
  } = useMonitoringEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);

  // DnD 핸들러 (위젯 라이브러리 → 캔버스)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id !== "monitoring-canvas-drop") return;
    const data = active.data.current as {
      widgetId: string; label: string;
      defaultW: number; defaultH: number;
      minW?: number; minH?: number; color?: string;
    } | undefined;
    if (!data) return;
    const instanceId = `${data.widgetId}-${Date.now()}`;
    addWidget({ i: instanceId, x: 0, y: Infinity, w: data.defaultW, h: data.defaultH, widgetId: data.widgetId, minW: data.minW, minH: data.minH });
    updateWidgetProps(instanceId, { title: data.label, color: data.color ?? "#06b6d4", refreshInterval: 2000 });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-full overflow-hidden bg-[#08101e] relative">

        {/* ── 좌측 패널 (AIM GUARD와 동일한 슬라이드 애니메이션) ── */}
        <motion.div
          animate={{ marginLeft: showRightPanel ? -(LEFT_PANEL_WIDTH - 70) : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="shrink-0 flex flex-col border-r border-white/5 bg-[#0b1525] overflow-hidden"
          style={{ width: LEFT_PANEL_WIDTH }}
        >
          <MonitoringLeftPanel />
        </motion.div>

        {/* ── 중앙 영역 ── */}
        <motion.div
          animate={{ marginLeft: showRightPanel ? -(LEFT_PANEL_WIDTH - 70) : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col overflow-hidden relative"
        >
          {/* 중앙 상단 탭 */}
          <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-white/5 bg-[#0b1525]">
            <div className="flex gap-1">
              {[
                { id: "app",     label: "앱 뷰",    icon: Activity },
                { id: "canvas",  label: "캔버스",   icon: Layout },
                { id: "mapping", label: "데이터 매핑", icon: GitBranch },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setCenterView(id as "app" | "canvas" | "mapping");
                    if (id === "mapping") setShowRightPanel(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
                    centerView === id
                      ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 중앙 컨텐츠 */}
          <div className="flex-1 overflow-hidden relative">
            {centerView === "app" && <MonitoringAppView />}
            {centerView === "canvas" && (
              <div ref={canvasRef} className="h-full overflow-auto">
                <MonitoringWrapper />
              </div>
            )}
            {centerView === "mapping" && (
              <MappingCanvas
                  dataConnectors={["vibration-sensor","ultrasound-sensor","gas-sensor","temperature-sensor","worker-safety","communication"]}
                  solutionName="AIM Monitoring"
                />
            )}

            {/* 딤 오버레이 (우측 패널 열렸을 때) */}
            <AnimatePresence>
              {showRightPanel && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowRightPanel(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-[1px] cursor-pointer z-10 group"
                >
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft className="w-5 h-5 text-white/60" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── 우측 패널 (AIM GUARD와 동일한 슬라이드 인) ── */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              key="right-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: RIGHT_PANEL_WIDTH, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="shrink-0 h-full border-l border-white/5 bg-[#0b1525] overflow-hidden z-20"
            >
              <MonitoringRightPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DragOverlay>
        {null}
      </DragOverlay>
    </DndContext>
  );
}
