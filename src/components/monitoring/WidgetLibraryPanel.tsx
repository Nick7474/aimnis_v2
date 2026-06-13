"use client";
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight } from "lucide-react";

// ─── 위젯 카탈로그 ──────────────────────────────────────────

interface WidgetDef {
  widgetId: string;
  label: string;
  icon: string;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
  color?: string;
}

interface Category {
  id: string;
  label: string;
  widgets: WidgetDef[];
}

const CATEGORIES: Category[] = [
  {
    id: "overview",
    label: "개요",
    widgets: [
      { widgetId: "kpi-summary",       label: "KPI 요약",        icon: "📊", defaultW: 12, defaultH: 2, minW: 6, minH: 2 },
      { widgetId: "equipment-health",  label: "설비 건강 레이더",  icon: "🕸️", defaultW: 3,  defaultH: 4, minW: 2, minH: 3 },
      { widgetId: "fault-prediction",  label: "고장 예측 목록",   icon: "🔮", defaultW: 3,  defaultH: 4, minW: 2, minH: 3 },
      { widgetId: "maintenance-schedule", label: "정비 일정",     icon: "📅", defaultW: 4,  defaultH: 4, minW: 3, minH: 3 },
    ],
  },
  {
    id: "vibration",
    label: "진동",
    widgets: [
      { widgetId: "vibration-timeseries", label: "진동 시계열",   icon: "📈", defaultW: 5, defaultH: 4, minW: 3, minH: 3 },
      { widgetId: "fft-spectrum",         label: "FFT 스펙트럼",  icon: "🌊", defaultW: 6, defaultH: 4, minW: 4, minH: 3 },
      { widgetId: "bearing-health",       label: "베어링 건강도", icon: "⚙️", defaultW: 3, defaultH: 4, minW: 2, minH: 3 },
    ],
  },
  {
    id: "gas",
    label: "가스",
    widgets: [
      { widgetId: "gas-monitor",   label: "가스 모니터",  icon: "💨", defaultW: 4, defaultH: 4, minW: 3, minH: 3 },
      { widgetId: "gas-diagnosis", label: "가스 진단",    icon: "🧪", defaultW: 3, defaultH: 3, minW: 2, minH: 2 },
    ],
  },
  {
    id: "temperature",
    label: "온도",
    widgets: [
      { widgetId: "thermal-camera", label: "열화상 카메라",  icon: "🔥", defaultW: 4, defaultH: 4, minW: 3, minH: 3 },
      { widgetId: "contact-temp",   label: "접촉식 온도",   icon: "🌡️", defaultW: 4, defaultH: 4, minW: 3, minH: 3 },
    ],
  },
  {
    id: "ultrasound",
    label: "초음파",
    widgets: [
      { widgetId: "ultrasound-wave", label: "초음파 파형", icon: "〰️", defaultW: 4, defaultH: 4, minW: 3, minH: 3 },
    ],
  },
  {
    id: "worker",
    label: "작업자 안전",
    widgets: [
      { widgetId: "spo2-vital",      label: "SpO₂ 바이탈",   icon: "❤️", defaultW: 3, defaultH: 4, minW: 2, minH: 3 },
      { widgetId: "fall-detection",  label: "낙하 감지",     icon: "🚨", defaultW: 3, defaultH: 4, minW: 2, minH: 3 },
      { widgetId: "worker-map",      label: "작업자 맵",     icon: "🗺️", defaultW: 4, defaultH: 4, minW: 3, minH: 3 },
    ],
  },
  {
    id: "alarm",
    label: "알람",
    widgets: [
      { widgetId: "alarm-history",   label: "알람 이력",     icon: "🔔", defaultW: 3, defaultH: 4, minW: 2, minH: 3 },
      { widgetId: "risk-timeline",   label: "리스크 타임라인", icon: "📉", defaultW: 6, defaultH: 3, minW: 4, minH: 2 },
    ],
  },
  {
    id: "ai",
    label: "AI 모델",
    widgets: [
      { widgetId: "ai-model-badge", label: "AI 모델 배지", icon: "🤖", defaultW: 3, defaultH: 3, minW: 2, minH: 2 },
    ],
  },
  {
    id: "communication",
    label: "통신",
    widgets: [
      { widgetId: "comm-status",      label: "통신 상태",     icon: "📡", defaultW: 3, defaultH: 4, minW: 2, minH: 3 },
      { widgetId: "network-topology", label: "네트워크 토폴로지", icon: "🕸️", defaultW: 4, defaultH: 4, minW: 3, minH: 3 },
    ],
  },
];

// ─── 드래그 가능한 위젯 카드 ──────────────────────────────────

function DraggableWidgetCard({ widget }: { widget: WidgetDef }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lib-${widget.widgetId}`,
    data: widget,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing
        border border-white/5 bg-white/[0.03] hover:border-cyan-400/30 hover:bg-cyan-400/5
        transition-all duration-150 select-none
        ${isDragging ? "opacity-0" : "opacity-100"}`}
    >
      <span className="text-sm shrink-0">{widget.icon}</span>
      <span className="text-[11px] text-white/60 truncate">{widget.label}</span>
    </div>
  );
}

// ─── WidgetLibraryPanel ───────────────────────────────────────

export default function WidgetLibraryPanel() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    overview: true, vibration: true,
  });

  const toggle = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="flex flex-col h-full overflow-auto px-2 py-2 gap-0.5">
      <p className="text-[10px] text-white/30 px-1 pb-1.5 shrink-0">
        드래그해서 캔버스에 추가
      </p>
      {CATEGORIES.map((cat) => (
        <div key={cat.id}>
          <button
            onClick={() => toggle(cat.id)}
            className="flex items-center gap-1.5 w-full px-1 py-1 text-[11px] text-white/50 hover:text-white/80 transition-colors"
          >
            {expanded[cat.id]
              ? <ChevronDown className="w-3 h-3 shrink-0" />
              : <ChevronRight className="w-3 h-3 shrink-0" />}
            <span>{cat.label}</span>
            <span className="ml-auto text-white/25 text-[9px]">{cat.widgets.length}</span>
          </button>
          {expanded[cat.id] && (
            <div className="flex flex-col gap-1 pl-2 pb-1">
              {cat.widgets.map((w) => (
                <DraggableWidgetCard key={w.widgetId} widget={w} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
