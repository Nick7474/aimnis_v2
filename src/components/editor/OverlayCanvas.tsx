"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { useEditorStore } from "@/store/editorStore";
import KpiWidget from "./widgets/KpiWidget";
import LineChartWidget from "./widgets/LineChartWidget";
import BarChartWidget from "./widgets/BarChartWidget";
import DonutChartWidget from "./widgets/DonutChartWidget";
import GaugeWidget from "./widgets/GaugeWidget";
import AlertWidget from "./widgets/AlertWidget";
import type { OverlayWidget } from "@/store/editorStore";

// ── 위젯 렌더러 ───────────────────────────────────────────────

function renderWidget(w: OverlayWidget) {
  const props = { title: w.title, data: w.data };
  switch (w.type) {
    case "kpi":          return <KpiWidget {...props} />;
    case "chart-line":   return <LineChartWidget {...props} />;
    case "chart-bar":    return <BarChartWidget {...props} />;
    case "chart-donut":  return <DonutChartWidget {...props} />;
    case "gauge":        return <GaugeWidget {...props} />;
    case "alert-panel":  return <AlertWidget {...props} />;
    default:
      return (
        <div className="flex h-full items-center justify-center text-xs text-white/40">
          {w.title}
        </div>
      );
  }
}

// ── 단일 오버레이 위젯 카드 ───────────────────────────────────

interface OverlayCardProps {
  widget: OverlayWidget;
  index: number;
}

function OverlayCard({ widget: w, index }: OverlayCardProps) {
  const { removeOverlayWidget, setSelectedElement, setRightPanel, activeWidgets } = useEditorStore();

  const activeTitle = activeWidgets.find((aw) => aw.id === w.id)?.properties.title ?? w.title;

  // 드래그 핸들 (grip 아이콘) — DragOverlay가 실제 이동 담당
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `overlay-${w.id}`,
    data: { overlayWidget: w },
  });

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const el = (e.currentTarget as HTMLElement).closest("[data-overlay-card]") as HTMLElement;
      const rect = el?.getBoundingClientRect() ?? { top: 0, left: 0, width: w.w, height: w.h };
      setSelectedElement({
        sectionId: w.id,
        type: "widget",
        label: activeTitle,
        panelType: "widget",
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      });
      setRightPanel("mapping");
    },
    [w, activeTitle, setSelectedElement, setRightPanel]
  );

  return (
    <motion.div
      data-overlay-card
      key={w.id}
      initial={{ opacity: 0, y: 24, scale: 0.88 }}
      animate={{
        opacity: isDragging ? 0.2 : 1,
        scale: isDragging ? 0.97 : 1,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.85, y: 12 }}
      transition={{ type: "spring", stiffness: 320, damping: 26, delay: index * 0.06 }}
      style={{
        position: "absolute",
        left: w.x,
        top: w.y,
        width: w.w,
        height: w.h,
        zIndex: 30 + index,
        overflow: "visible",
      }}
      onClick={handleSelect}
    >
      <div
        className="group relative h-full w-full rounded-xl"
        style={{
          background: "rgba(7, 15, 36, 0.82)",
          backdropFilter: "blur(18px) saturate(1.4)",
          WebkitBackdropFilter: "blur(18px) saturate(1.4)",
          border: "1px solid rgba(0, 212, 255, 0.18)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,212,255,0.06)",
          cursor: "pointer",
          overflow: "visible",
        }}
      >
        <OverlayCardBorder widgetId={w.id} />

        {/* 위젯 콘텐츠 */}
        <div style={{ height: "100%", width: "100%", boxSizing: "border-box", borderRadius: "inherit" }}>
          {renderWidget({ ...w, title: activeTitle })}
        </div>

        {/* 드래그 핸들 — 좌상단, hover 시 노출 */}
        <div
          ref={setDragRef}
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className="absolute hidden h-6 w-6 cursor-grab items-center justify-center rounded-md bg-brand-500/20 text-brand-400 active:cursor-grabbing group-hover:flex"
          style={{ top: -8, left: -8, zIndex: 51 }}
          title="우측 패널로 드래그"
        >
          <GripVertical className="h-3 w-3" />
        </div>

        {/* 삭제 버튼 — 우상단 */}
        <button
          onClick={(e) => { e.stopPropagation(); removeOverlayWidget(w.id); }}
          className="absolute z-50 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white shadow-lg group-hover:flex"
          style={{ top: -8, right: -8 }}
        >
          <X className="h-3 w-3" />
        </button>

        {/* LIVE 뱃지 */}
        <div className="absolute bottom-2 right-2.5 flex items-center gap-1" style={{ pointerEvents: "none" }}>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
          <span className="text-[9px] text-emerald-400/70">LIVE</span>
        </div>

        {/* 드래그 힌트 툴팁 — hover 시 */}
        <div
          className="pointer-events-none absolute -top-7 left-0 hidden rounded-md bg-black/70 px-2 py-1 text-[9px] text-brand-300 group-hover:block"
          style={{ whiteSpace: "nowrap" }}
        >
          ← 드래그하여 우측 패널로 이동
        </div>
      </div>
    </motion.div>
  );
}

// 선택 테두리
function OverlayCardBorder({ widgetId }: { widgetId: string }) {
  const isSelected = useEditorStore((s) => s.selectedElement?.sectionId === widgetId);
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-xl transition-all duration-150"
      style={{
        outline: isSelected ? "2px solid #735FE9" : "2px solid transparent",
        outlineOffset: "-1px",
        boxShadow: isSelected ? "0 0 12px rgba(0,212,255,0.25)" : "none",
      }}
    />
  );
}

// ── 메인: 전체 오버레이 캔버스 ───────────────────────────────

export default function OverlayCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { overlayWidgets, setCanvasSize } = useEditorStore();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setCanvasSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [setCanvasSize]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" style={{ zIndex: 25 }}>
      <AnimatePresence>
        {overlayWidgets.map((w, i) => (
          <div key={w.id} style={{ pointerEvents: "auto" }}>
            <OverlayCard widget={w} index={i} />
          </div>
        ))}
      </AnimatePresence>

      {overlayWidgets.length > 0 && (
        <div
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] text-white/40"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        >
          위젯 {overlayWidgets.length}개
        </div>
      )}
    </div>
  );
}
