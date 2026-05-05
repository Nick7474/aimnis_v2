"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import {
  BarChart3, LineChart, PieChart, Gauge, Bell, LayoutDashboard, Map, Video, ShieldCheck, Wind, Activity,
} from "lucide-react";

// 위젯 타입별 아이콘
const WIDGET_ICONS: Record<string, typeof LayoutDashboard> = {
  kpi: LayoutDashboard,
  "chart-line": LineChart,
  "chart-bar": BarChart3,
  "chart-donut": PieChart,
  gauge: Gauge,
  "alert-panel": Bell,
  "core-map": Map,
  "core-alarm": Bell,
  "core-floor": Activity,
  "core-cctv": Video,
  "core-worker": ShieldCheck,
  "core-air": Wind,
};

// 위젯 타입별 바인딩 가능한 프로퍼티
const WIDGET_PROPERTIES: Record<string, string[]> = {
  kpi: ["value", "unit", "trend", "color"],
  "chart-line": ["chartData", "color"],
  "chart-bar": ["chartData", "color"],
  "chart-donut": ["chartData"],
  gauge: ["gaugeValue", "gaugeMax", "color"],
  "alert-panel": ["alerts"],
  "core-map": ["markers", "alerts", "cameraStatus"],
  "core-alarm": ["events", "severity", "sourceCamera"],
  "core-floor": ["energyLoad", "airQuality", "workerCount"],
  "core-cctv": ["activeCameras", "alertCameras", "streamHealth"],
  "core-worker": ["onSite", "helmetCompliance", "recentAlerts"],
  "core-air": ["pm25", "co2", "temperature"],
};

export interface WidgetTargetNodeData {
  widgetId: string;
  widgetType: string;
  title: string;
  connectedProperties?: Set<string>;
  themeColor?: string;
  category?: "Core Panel" | "AI Widget";
  targetProperties?: string[];
}

function WidgetTargetNode({ data }: NodeProps<WidgetTargetNodeData>) {
  const Icon = WIDGET_ICONS[data.widgetType] ?? LayoutDashboard;
  const properties = data.targetProperties ?? WIDGET_PROPERTIES[data.widgetType] ?? ["value"];
  const connected = data.connectedProperties ?? new Set();
  const color = data.themeColor ?? "#8b5cf6";
  const connCount = connected.size;

  return (
    <div
      style={{
        minWidth: 220,
        position: "relative",
        background: "rgba(10, 12, 28, 0.95)",
        border: `1px solid ${color}33`,
        borderRadius: 12,
        overflow: "visible",
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${color}15`,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderBottom: `1px solid ${color}20`,
          background: `${color}08`,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={13} color={color} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
            {data.title}
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
            {data.category ?? data.widgetType}
          </div>
        </div>
        {connCount > 0 && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#22c55e",
              background: "rgba(34,197,94,0.15)",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {connCount}/{properties.length}
          </span>
        )}
      </div>

      {/* 프로퍼티 목록 */}
      <div style={{ padding: "6px 0" }}>
        {properties.map((prop) => {
          const isConn = connected.has(prop);
          return (
            <div
              key={prop}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: 30,
                padding: "6px 14px 6px 38px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: -5,
                  top: "50%",
                  width: 10,
                  height: 12,
                  transform: "translateY(-50%)",
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                  background: isConn ? "rgba(20,184,166,0.95)" : "rgba(176,183,194,0.92)",
                  opacity: 0.95,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: -3,
                  top: "50%",
                  width: 6,
                  height: 8,
                  transform: "translateY(-50%)",
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                  background: "rgba(10,12,28,0.96)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
              {/* 입력 핸들 — 왼쪽 */}
              <Handle
                type="target"
                position={Position.Left}
                id={`${data.widgetId}__${prop}`}
                style={{
                  width: 12,
                  height: 14,
                  left: -6,
                  zIndex: 2,
                  background: "transparent",
                  border: "none",
                  borderRadius: 0,
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                  transition: "all 0.2s",
                  cursor: "grab",
                }}
              />
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isConn ? "#22c55e" : "rgba(255,255,255,0.15)",
                  boxShadow: isConn ? "0 0 6px #22c55e" : "none",
                  transition: "all 0.2s",
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: isConn ? "#22c55e" : "rgba(255,255,255,0.55)",
                }}
              >
                {prop}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(WidgetTargetNode);
