"use client";
import React, { useCallback, useRef, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, useDraggable } from "@dnd-kit/core";
import { useMonitoringEditorStore } from "@/store/monitoringEditorStore";
import MonitoringCanvas from "./MonitoringCanvas";

// ─── 위젯 라이브러리에서 드래그 시 오버레이 프리뷰 ────────────

function DragPreview({ label }: { label: string }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs shadow-xl backdrop-blur-sm pointer-events-none">
      {label}
    </div>
  );
}

// ─── MonitoringWrapper ──────────────────────────────────────

interface MonitoringWrapperProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export default function MonitoringWrapper({ containerRef }: MonitoringWrapperProps) {
  const { addWidget, widgetProps, updateWidgetProps } = useMonitoringEditorStore();
  const [dragLabel, setDragLabel] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const ref = containerRef ?? wrapperRef;

  const handleDragStart = useCallback(
    (event: { active: { data: { current?: Record<string, unknown> } } }) => {
      const data = event.active.data.current as { label?: string } | undefined;
      setDragLabel(data?.label ?? null);
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragLabel(null);
      const { active, over } = event;
      if (over?.id !== "monitoring-canvas-drop") return;

      const data = active.data.current as {
        widgetId: string;
        label: string;
        defaultW: number;
        defaultH: number;
        minW?: number;
        minH?: number;
        color?: string;
      } | undefined;
      if (!data) return;

      const instanceId = `${data.widgetId}-${Date.now()}`;
      addWidget({
        i: instanceId,
        x: 0,
        y: Infinity, // 아래에 추가
        w: data.defaultW,
        h: data.defaultH,
        widgetId: data.widgetId,
        minW: data.minW ?? 2,
        minH: data.minH ?? 2,
      });
      updateWidgetProps(instanceId, {
        title: data.label,
        color: data.color ?? "#06b6d4",
        refreshInterval: 2000,
      });
    },
    [addWidget, updateWidgetProps]
  );

  const containerWidth = ref.current?.clientWidth ?? 900;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div ref={ref} className="flex-1 h-full overflow-auto p-4">
        <MonitoringCanvas containerWidth={containerWidth} />
      </div>
      <DragOverlay>
        {dragLabel ? <DragPreview label={dragLabel} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
