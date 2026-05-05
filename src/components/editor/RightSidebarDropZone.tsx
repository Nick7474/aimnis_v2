"use client";

import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, RotateCcw, GripVertical, ChevronDown } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { SwappedPanelWidget } from "@/store/editorStore";
import { brandToCssVars } from "@/lib/brandPresets";
import KpiWidget from "./widgets/KpiWidget";
import LineChartWidget from "./widgets/LineChartWidget";
import BarChartWidget from "./widgets/BarChartWidget";
import DonutChartWidget from "./widgets/DonutChartWidget";
import GaugeWidget from "./widgets/GaugeWidget";
import AlertWidget from "./widgets/AlertWidget";
import AlarmPanelSection from "./panels/AlarmPanelSection";
import FloorStatusSection from "./panels/FloorStatusSection";

// ── 위젯 높이 — 타입별
function getWidgetH(type: string) {
  if (type === "kpi")         return 100;
  if (type === "alert-panel") return 160;
  return 148; // gauge / chart 기준
}

function renderWidget(w: SwappedPanelWidget) {
  const p = { title: w.title, data: w.data };
  switch (w.type) {
    case "kpi":          return <KpiWidget {...p} />;
    case "chart-line":   return <LineChartWidget {...p} />;
    case "chart-bar":    return <BarChartWidget {...p} />;
    case "chart-donut":  return <DonutChartWidget {...p} />;
    case "gauge":        return <GaugeWidget {...p} />;
    case "alert-panel":  return <AlertWidget {...p} />;
    default:
      return (
        <div className="flex h-full items-center justify-center text-[11px]"
          style={{ color: "var(--guard-color-text-faint)" }}>{w.title}</div>
      );
  }
}

// ── AIM GUARD 네이티브 카드 ───────────────────────────────────────
function PanelCard({
  widget,
  dragHandleProps,
}: {
  widget: SwappedPanelWidget;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  const { removeFromRightPanel, toggleRightPanelWidget } = useEditorStore();
  const [collapsed, setCollapsed] = useState(false);
  const h = getWidgetH(widget.type);

  return (
    <div style={{ borderBottom: "1px solid var(--guard-color-border)" }}>
      {/* 섹션 헤더 */}
      <div
        className="flex items-center gap-1.5 px-3 cursor-pointer select-none"
        style={{
          height: 36,
          background: "var(--guard-color-surface)",
          borderBottom: collapsed ? "none" : "1px solid var(--guard-color-border)",
        }}
        onClick={() => setCollapsed((v) => !v)}
      >
        <div
          {...dragHandleProps}
          className="touch-none cursor-grab active:cursor-grabbing flex-shrink-0"
          style={{ color: "var(--guard-color-text-faint)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>
        <ChevronDown
          className="h-3 w-3 flex-shrink-0 transition-transform duration-150"
          style={{
            color: "var(--guard-color-accent)",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
          }}
        />
        <span className="flex-1 min-w-0 truncate text-xs font-medium" style={{ color: "var(--guard-color-text-strong)" }}>
          {widget.title}
        </span>
        <span
          className="rounded text-[8px] px-1.5 py-0.5 flex-shrink-0"
          style={{
            background: "color-mix(in srgb, var(--guard-color-primary) 18%, transparent)",
            color: "var(--guard-color-accent)",
          }}
        >
          {widget.type}
        </span>
        {widget.visible && !collapsed && (
          <motion.span
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{ background: "var(--guard-color-success)" }}
          />
        )}
        <div
          className="flex items-center gap-0.5 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => toggleRightPanelWidget(widget.id)}
            className="p-0.5 rounded"
            style={{ color: "var(--guard-color-text-faint)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--guard-color-text-soft)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--guard-color-text-faint)")}
          >
            {widget.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            onClick={() => removeFromRightPanel(widget.id)}
            className="p-0.5 rounded"
            style={{ color: "var(--guard-color-text-faint)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--guard-color-danger)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--guard-color-text-faint)")}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* 위젯 컨텐츠 — overflow:hidden으로 라운드 제거 */}
      <AnimatePresence initial={false}>
        {!collapsed && widget.visible && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: h }}
            exit={{ height: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            style={{ overflow: "hidden", background: "var(--guard-color-bg)" }}
          >
            {/* 모든 위젯 — 라운드·테두리·배경 제거, KPI는 패딩 축소로 잘림 방지 */}
            <div
              className={`[&>*]:!rounded-none [&>*]:!bg-transparent [&>*]:!border-0 [&>*]:!backdrop-blur-none${widget.type === "kpi" ? " [&>*]:!p-2" : ""}`}
              style={{ height: h }}
            >
              {renderWidget(widget)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 정렬 래퍼 ─────────────────────────────────────────────────────
// 핵심 3중 방어:
// 1) animateLayoutChanges: () => false  → dnd-kit 레이아웃 위치보정 비활성
// 2) dropAnimation={null} in EditorLayout → DragOverlay fly-to 제거
// 3) wasMounted 가드 → 첫 프레임은 transform/transition 모두 차단
function SortablePanelCard({ widget }: { widget: SwappedPanelWidget }) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id: `rp-card-${widget.id}`,
    animateLayoutChanges: () => false,
  });

  // 마운트 직후 두 프레임 동안 transform/transition 완전 차단
  // → dnd-kit이 드롭 직후 잔여 transform을 주입해도 무시됨
  const [wasMounted, setWasMounted] = useState(false);
  useEffect(() => {
    let raf1: number;
    let raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setWasMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={{
        // 마운트 직후엔 transform/transition 모두 없음
        transform: (wasMounted && transform) ? CSS.Transform.toString(transform) : undefined,
        transition: wasMounted ? [transition, "opacity 0.2s ease"].filter(Boolean).join(", ") : "opacity 0.2s ease",
        opacity: !wasMounted ? 0 : isDragging ? 0.2 : 1,
        position: "relative",
        zIndex: isDragging ? 50 : "auto",
      }}
    >
      <PanelCard
        widget={widget}
        dragHandleProps={{ ...listeners, ...attributes } as React.HTMLAttributes<HTMLDivElement>}
      />
    </div>
  );
}

// ── 삽입 슬롯 ─────────────────────────────────────────────────────
function DropSlot({ index, active }: { index: number; active: boolean }) {
  const { isOver, setNodeRef } = useDroppable({ id: `rp-slot-${index}` });

  return (
    <motion.div
      ref={setNodeRef}
      animate={{
        height: isOver ? 44 : active ? 6 : 0,
        opacity: isOver ? 1 : active ? 0.35 : 0,
      }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="overflow-hidden"
      style={{
        background: isOver ? "color-mix(in srgb, var(--guard-color-primary) 10%, transparent)" : "transparent",
        borderTop: isOver ? "1px solid color-mix(in srgb, var(--guard-color-primary) 40%, transparent)" : "1px solid transparent",
        borderBottom: isOver ? "1px solid color-mix(in srgb, var(--guard-color-primary) 40%, transparent)" : "1px solid transparent",
      }}
    >
      {isOver && (
        <div className="flex h-full items-center justify-center text-[9px]"
          style={{ color: "var(--guard-color-accent)" }}>
          ▼ 여기에 추가
        </div>
      )}
    </motion.div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────
export default function RightSidebarDropZone() {
  const { rightPanelWidgets, resetRightPanel, brand } = useEditorStore();
  const brandVars = brandToCssVars(brand) as CSSProperties;
  const hasWidgets = rightPanelWidgets.length > 0;
  const [canvasDragging, setCanvasDragging] = useState(false);

  useDndMonitor({
    onDragStart: (e) => {
      if (e.active.id.toString().startsWith("overlay-")) setCanvasDragging(true);
    },
    onDragEnd: () => setCanvasDragging(false),
    onDragCancel: () => setCanvasDragging(false),
  });

  const { isOver, setNodeRef } = useDroppable({ id: "right-sidebar-dropzone" });
  const sortableIds = rightPanelWidgets.map((w) => `rp-card-${w.id}`);

  return (
    <div
      ref={setNodeRef}
      className="absolute right-0 flex flex-col"
      style={{
        top: 44,    // MonitorWrapper 내부 헤더 높이
        bottom: 24, // MonitorWrapper 풋터 높이 — 항상 노출
        width: 300,
        zIndex: 28,
        pointerEvents: "none",
        borderLeft: hasWidgets || canvasDragging ? "1px solid var(--guard-color-border)" : "1px solid transparent",
        transition: "border-color 0.2s",
        ...brandVars,
      }}
    >
      <AnimatePresence>
        {hasWidgets && (
          <motion.div
            key="unified-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex flex-col"
            style={{
              pointerEvents: "auto",
              background: "var(--guard-color-bg)",
            }}
          >
            {/* 패널 헤더 */}
            <div
              className="flex flex-shrink-0 items-center justify-between px-3"
              style={{
                height: 32,
                background: "var(--guard-color-surface-strong)",
                borderBottom: "1px solid var(--guard-color-border)",
              }}
            >
              <span className="text-[10px] font-medium" style={{ color: "var(--guard-color-text-soft)" }}>
                커스텀 패널 ({rightPanelWidgets.length})
              </span>
              <button
                onClick={resetRightPanel}
                className="flex items-center gap-1 text-[9px] transition-colors"
                style={{ color: "var(--guard-color-text-faint)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--guard-color-text-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--guard-color-text-faint)")}
              >
                <RotateCcw className="h-2.5 w-2.5" />
                원래대로
              </button>
            </div>

            {/* 통합 스크롤 리스트: 커스텀 위젯 → 알람 패널 → 장비 상태 */}
            <div
              className="flex-1 overflow-y-auto"
              style={{ scrollbarWidth: "thin", scrollbarColor: "var(--guard-color-border) transparent" }}
            >
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                {rightPanelWidgets.map((w, i) => (
                  <div key={w.id}>
                    <DropSlot index={i} active={canvasDragging} />
                    <SortablePanelCard widget={w} />
                  </div>
                ))}
                <DropSlot index={rightPanelWidgets.length} active={canvasDragging} />
              </SortableContext>

              {/* 기존 AIM GUARD 패널 — 커스텀 위젯 아래에 자연스럽게 이어짐 */}
              <AlarmPanelSection />
              <FloorStatusSection />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 드롭 힌트 (빈 상태) */}
      <AnimatePresence>
        {canvasDragging && isOver && !hasWidgets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div
              className="rounded-lg border px-5 py-3 text-center"
              style={{
                background: "color-mix(in srgb, var(--guard-color-surface) 95%, transparent)",
                borderColor: "var(--guard-color-primary)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: "var(--guard-color-accent)" }}>패널에 추가</p>
              <p className="mt-0.5 text-[9px]" style={{ color: "var(--guard-color-text-faint)" }}>여기에 드롭</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
