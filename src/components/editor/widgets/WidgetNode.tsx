"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import KpiWidget from "./KpiWidget";
import LineChartWidget from "./LineChartWidget";
import BarChartWidget from "./BarChartWidget";
import DonutChartWidget from "./DonutChartWidget";
import GaugeWidget from "./GaugeWidget";
import AlertWidget from "./AlertWidget";
import type { WidgetData } from "@/store/editorStore";

export interface WidgetNodeData {
  widgetId: string;
  type: string;
  title: string;
  data: WidgetData;
  selected?: boolean;
}

const SIZE_MAP: Record<string, { w: number; h: number }> = {
  kpi: { w: 180, h: 110 },
  "chart-line": { w: 280, h: 180 },
  "chart-bar": { w: 280, h: 180 },
  "chart-donut": { w: 220, h: 200 },
  gauge: { w: 160, h: 160 },
  "alert-panel": { w: 260, h: 200 },
  table: { w: 320, h: 200 },
  map: { w: 300, h: 220 },
};

function WidgetNodeInner({ data, selected, id }: NodeProps<WidgetNodeData>) {
  const removeNode = useEditorStore((s) => s.removeNode);
  const size = SIZE_MAP[data.type] ?? { w: 220, h: 150 };

  const renderWidget = () => {
    switch (data.type) {
      case "kpi":
        return <KpiWidget title={data.title} data={data.data} />;
      case "chart-line":
        return <LineChartWidget title={data.title} data={data.data} />;
      case "chart-bar":
        return <BarChartWidget title={data.title} data={data.data} />;
      case "chart-donut":
        return <DonutChartWidget title={data.title} data={data.data} />;
      case "gauge":
        return <GaugeWidget title={data.title} data={data.data} />;
      case "alert-panel":
        return <AlertWidget title={data.title} data={data.data} />;
      default:
        return (
          <div className="flex h-full items-center justify-center text-white/30 text-xs">
            {data.title}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      style={{ width: size.w, height: size.h }}
      className={`group relative rounded-xl ${
        selected ? "ring-2 ring-purple-500/60" : "ring-1 ring-white/0 hover:ring-white/10"
      }`}
    >
      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeNode(id);
        }}
        className="absolute -right-2 -top-2 z-10 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 transition-opacity group-hover:flex group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="h-full w-full">{renderWidget()}</div>

      {/* React Flow handles (숨김 — 드래그 연결 지원) */}
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="source" position={Position.Right} className="!opacity-0" />
    </motion.div>
  );
}

export const WidgetNode = memo(WidgetNodeInner);
