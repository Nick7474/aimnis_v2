import type { MappingField, MappingSource } from "@/store/editorStore";

// ─── 소스 필드 정의 ──────────────────────────────────────────

function f(name: string, path: string, type: MappingField["type"], sample?: string): MappingField {
  const id = path.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return { id, name, path, type, sample };
}

export const MONITORING_DEMO_FIELDS: Record<string, MappingField[]> = {
  "equipment-sensor": [
    f("equipmentId",   "equipmentId",   "string", "EQ-1234"),
    f("status",        "status",        "string", "normal"),
    f("anomalyScore",  "anomalyScore",  "number", "23"),
    f("vibration",     "vibration",     "number", "0.34"),
    f("temperature",   "temperature",   "number", "67.2"),
    f("timeSeries",    "timeSeries",    "array",  "24 points"),
  ],
  "environment-sensor": [
    f("pm25",        "pm25",        "number", "35"),
    f("pm10",        "pm10",        "number", "48"),
    f("co2",         "co2",         "number", "420"),
    f("temperature", "temperature", "number", "23.8"),
    f("humidity",    "humidity",    "number", "47"),
    f("gasLevel",    "gasLevel",    "number", "12"),
  ],
  "worker-safety": [
    f("onSiteCount",       "onSiteCount",       "number", "128"),
    f("helmetCompliance",  "helmetCompliance",  "number", "97"),
    f("recentAlerts",      "recentAlerts",      "array",  "8 events"),
    f("workerId",          "workerId",          "string", "WK-1281"),
    f("zone",              "zone",              "string", "Zone-A"),
  ],
  "alerts-events": [
    f("alertId",   "alertId",   "string", "ALT-0042"),
    f("severity",  "severity",  "string", "critical"),
    f("timestamp", "timestamp", "string", "2026-06-14 09:22"),
    f("source",    "source",    "string", "EQ-1234"),
  ],
  "system-monitor": [
    f("serverHealth",       "serverHealth",       "number", "98"),
    f("networkLatency",     "networkLatency",     "number", "12"),
    f("dataFreshness",      "dataFreshness",      "number", "3"),
    f("activeConnections",  "activeConnections",  "number", "42"),
  ],
};

export const MONITORING_CONNECTORS = Object.keys(MONITORING_DEMO_FIELDS);

const SOURCE_LABELS: Record<string, string> = {
  "equipment-sensor":  "equipment-sensor-realtime.json",
  "environment-sensor": "environment-iot-sensor-feed.json",
  "worker-safety":     "worker-safety-compliance-events.json",
  "alerts-events":     "monitoring-alerts-events-stream.json",
  "system-monitor":    "system-health-status-snapshot.json",
};

export function buildMonitoringDemoSource(connectorId: string): MappingSource {
  return {
    id: connectorId,
    name: SOURCE_LABELS[connectorId] ?? connectorId,
    kind: "demo",
    description: "사전 연결된 고객사 데모 데이터",
    fields: MONITORING_DEMO_FIELDS[connectorId] ?? [f("value", "value", "unknown")],
    createdAt: 0,
  };
}

// ─── Core Panel 타겟 정의 ────────────────────────────────────

export const MONITORING_CORE_TARGETS = [
  { id: "summary-equipment-status", type: "summary-equip",   title: "전체 설비 상태",   color: "#14b8a6", properties: ["normalCount", "warningCount", "dangerCount"] },
  { id: "summary-environment-risk", type: "summary-env",     title: "환경 위험 상태",   color: "#3b82f6", properties: ["riskLevel", "alertCount", "trend"] },
  { id: "summary-worker-safety",    type: "summary-worker",  title: "작업자 안전 상태", color: "#8b5cf6", properties: ["onSiteCount", "compliantCount", "alertCount"] },
  { id: "summary-alert-count",      type: "summary-alert",   title: "오늘의 알림 건수", color: "#f43f5e", properties: ["critical", "warning", "info"] },
  { id: "equipment-anomaly-chart",  type: "anomaly-chart",   title: "설비 이상 현황",   color: "#f59e0b", properties: ["timeSeries", "anomalyScore", "equipmentId"] },
  { id: "worker-safety-overview",   type: "worker-overview", title: "작업자 안전 현황", color: "#22c55e", properties: ["workers", "compliance", "incidents"] },
  { id: "environment-diagnosis",    type: "env-diagnosis",   title: "환경 진단",        color: "#38bdf8", properties: ["pm25", "co2", "temperature", "humidity"] },
  { id: "realtime-alerts",          type: "rt-alerts",       title: "실시간 알림",      color: "#f43f5e", properties: ["alerts", "severity", "source"] },
  { id: "action-progress",          type: "action-prog",     title: "점검·조치 현황",   color: "#a78bfa", properties: ["tasks", "status", "assignee"] },
  { id: "system-status",            type: "sys-status",      title: "시스템 상태",      color: "#94a3b8", properties: ["serverHealth", "latency", "uptime"] },
] as const;

// ─── 기본 자동 연결 맵 ───────────────────────────────────────

export const MONITORING_CORE_BINDINGS: Array<{
  source: string; field: string; target: string; property: string;
}> = [
  // 설비 센서 → 설비 이상 현황
  { source: "equipment-sensor", field: "timeseries",   target: "equipment-anomaly-chart", property: "timeSeries" },
  { source: "equipment-sensor", field: "anomalyscore", target: "equipment-anomaly-chart", property: "anomalyScore" },
  { source: "equipment-sensor", field: "status",       target: "summary-equipment-status", property: "warningCount" },
  // 환경 센서 → 환경 진단
  { source: "environment-sensor", field: "pm25",        target: "environment-diagnosis",    property: "pm25" },
  { source: "environment-sensor", field: "co2",         target: "environment-diagnosis",    property: "co2" },
  { source: "environment-sensor", field: "temperature", target: "environment-diagnosis",    property: "temperature" },
  { source: "environment-sensor", field: "humidity",    target: "environment-diagnosis",    property: "humidity" },
  { source: "environment-sensor", field: "gaslevel",    target: "summary-environment-risk", property: "riskLevel" },
  // 작업자 안전 → 안전 현황
  { source: "worker-safety", field: "onsitecount",      target: "summary-worker-safety",  property: "onSiteCount" },
  { source: "worker-safety", field: "helmetcompliance", target: "worker-safety-overview",  property: "compliance" },
  { source: "worker-safety", field: "recentalerts",     target: "worker-safety-overview",  property: "incidents" },
  { source: "worker-safety", field: "onsitecount",      target: "worker-safety-overview",  property: "workers" },
  // 알림 → 실시간 알림
  { source: "alerts-events", field: "severity",  target: "realtime-alerts",    property: "severity" },
  { source: "alerts-events", field: "source",    target: "realtime-alerts",    property: "source" },
  { source: "alerts-events", field: "alertid",   target: "summary-alert-count", property: "critical" },
  // 시스템 → 시스템 상태
  { source: "system-monitor", field: "serverhealth",      target: "system-status", property: "serverHealth" },
  { source: "system-monitor", field: "networklatency",    target: "system-status", property: "latency" },
  { source: "system-monitor", field: "activeconnections", target: "system-status", property: "uptime" },
];

// ─── 커스텀 위젯 자동 시드 바인딩 ────────────────────────────

export const MONITORING_WIDGET_DEFAULT_BINDINGS: Record<string, {
  source: string; field: string; property: string;
}> = {
  "aim-line-chart": { source: "equipment-sensor",   field: "timeseries",   property: "timeSeries" },
  "aim-bar-chart":  { source: "equipment-sensor",   field: "timeseries",   property: "chartData" },
  "aim-gauge":      { source: "environment-sensor", field: "pm25",         property: "value" },
  "aim-kpi":        { source: "equipment-sensor",   field: "anomalyscore", property: "value" },
  "aim-alert-list": { source: "alerts-events",      field: "recentalerts", property: "alerts" },
};

export const MONITORING_WIDGET_PROPERTIES: Record<string, string[]> = {
  "aim-line-chart": ["timeSeries", "label", "color"],
  "aim-bar-chart":  ["chartData", "label", "color"],
  "aim-gauge":      ["value", "max", "color"],
  "aim-kpi":        ["value", "unit", "trend"],
  "aim-alert-list": ["alerts", "severity", "source"],
};

// ─── React Flow 노드 위치 ─────────────────────────────────────

export const MONITORING_SOURCE_POSITIONS: Record<string, { x: number; y: number }> = {
  "equipment-sensor":   { x: 54,  y: 80  },
  "environment-sensor": { x: 54,  y: 380 },
  "worker-safety":      { x: 54,  y: 680 },
  "alerts-events":      { x: 420, y: 240 },
  "system-monitor":     { x: 420, y: 540 },
};

export const MONITORING_TARGET_POSITIONS: Record<string, { x: number; y: number }> = {
  "summary-equipment-status": { x: 840,  y: 60  },
  "summary-environment-risk": { x: 840,  y: 220 },
  "summary-worker-safety":    { x: 840,  y: 380 },
  "summary-alert-count":      { x: 840,  y: 540 },
  "equipment-anomaly-chart":  { x: 1200, y: 80  },
  "worker-safety-overview":   { x: 1200, y: 290 },
  "environment-diagnosis":    { x: 1200, y: 500 },
  "realtime-alerts":          { x: 1200, y: 730 },
  "action-progress":          { x: 1560, y: 200 },
  "system-status":            { x: 1560, y: 430 },
};
