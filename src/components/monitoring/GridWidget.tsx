"use client";
import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { useMonitoringEditorStore } from "@/store/monitoringEditorStore";

interface GridWidgetProps {
  instanceId: string;
  widgetId: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (instanceId: string) => void;
}

export default function GridWidget({
  instanceId,
  widgetId,
  title,
  children,
  onRemove,
}: GridWidgetProps) {
  const { selectedGridItem, selectGridItem, setShowRightPanel } =
    useMonitoringEditorStore();

  const isSelected = selectedGridItem?.instanceId === instanceId;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectGridItem({ instanceId, widgetId });
    },
    [instanceId, widgetId, selectGridItem]
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectGridItem({ instanceId, widgetId });
      setShowRightPanel(true);
    },
    [instanceId, widgetId, selectGridItem, setShowRightPanel]
  );

  return (
    <motion.div
      onClick={handleClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        group relative h-full w-full rounded-xl border bg-[#0f1729] overflow-hidden
        transition-all duration-200
        ${isSelected
          ? "border-cyan-400/70 shadow-[0_0_0_1px_rgba(6,182,212,0.5)] shadow-cyan-400/20"
          : "border-white/5 hover:border-white/15"}
      `}
    >
      {/* 드래그 핸들 + 헤더 */}
      <div
        className="drag-handle flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.02] cursor-grab active:cursor-grabbing"
      >
        <GripHorizontal className="w-3.5 h-3.5 text-white/20 shrink-0" />
        <span className="text-xs font-medium text-white/60 truncate flex-1">
          {title}
        </span>
        {/* 선택시 버튼들 */}
        {isSelected && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleEdit}
              className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
              편집
            </button>
            {onRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(instanceId); }}
                className="p-0.5 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-white/40 hover:text-red-400" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 위젯 콘텐츠 */}
      <div className="p-3 h-[calc(100%-36px)] overflow-hidden">
        {children}
      </div>

      {/* 선택 테두리 오버레이 */}
      {isSelected && (
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-cyan-400/40" />
      )}
    </motion.div>
  );
}
