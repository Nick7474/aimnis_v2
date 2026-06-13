"use client";
import React, { useCallback, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { GridLayout, type LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { useMonitoringEditorStore, GridLayoutItem } from "@/store/monitoringEditorStore";
import GridWidget from "./GridWidget";
import { renderWidgetContent } from "./widgets/WidgetRenderer";

const COLS = 12;
const ROW_HEIGHT = 60;

interface MonitoringCanvasProps {
  containerWidth: number;
}

export default function MonitoringCanvas({ containerWidth }: MonitoringCanvasProps) {
  const { layout, widgetProps, setLayout, removeWidget, clearSelection } =
    useMonitoringEditorStore();

  const { setNodeRef, isOver } = useDroppable({ id: "monitoring-canvas-drop" });

  // 스토어 → RGL Layout 변환
  const rlLayout: readonly LayoutItem[] = useMemo(
    () =>
      layout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW ?? 2,
        minH: item.minH ?? 2,
      })),
    [layout]
  );

  const handleLayoutChange = useCallback(
    (newLayout: readonly LayoutItem[]) => {
      const updated: GridLayoutItem[] = Array.from(newLayout).map((l) => {
        const original = layout.find((o) => o.i === l.i);
        return {
          i: l.i,
          x: l.x,
          y: l.y,
          w: l.w,
          h: l.h,
          widgetId: original?.widgetId ?? "",
          minW: original?.minW,
          minH: original?.minH,
        };
      });
      setLayout(updated);
    },
    [layout, setLayout]
  );

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-full transition-colors duration-200 ${isOver ? "bg-cyan-400/5" : ""}`}
      onClick={() => clearSelection()}
    >
      {/* 그리드 배경 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)",
          backgroundSize: `${containerWidth / COLS}px ${ROW_HEIGHT}px`,
        }}
      />

      {layout.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20 select-none pointer-events-none">
          <div className="text-4xl">⊞</div>
          <p className="text-sm">좌측 위젯 탭에서 위젯을 드래그하세요</p>
          <p className="text-xs">12컬럼 그리드 · 자유 크기 조절</p>
        </div>
      )}

      <GridLayout
        width={containerWidth}
        layout={rlLayout}
        onLayoutChange={handleLayoutChange}
        gridConfig={{ cols: COLS, rowHeight: ROW_HEIGHT, margin: [8, 8] }}
        dragConfig={{ enabled: true, handle: ".drag-handle", bounded: false, threshold: 3 }}
        resizeConfig={{ enabled: true, handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"] }}
      >
        {layout.map((item) => {
          const props = widgetProps[item.i];
          return (
            <div key={item.i}>
              <GridWidget
                instanceId={item.i}
                widgetId={item.widgetId}
                title={props?.title ?? item.widgetId}
                onRemove={removeWidget}
              >
                {renderWidgetContent(item.widgetId, props)}
              </GridWidget>
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
}
