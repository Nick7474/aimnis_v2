export type WidgetColorGroup = "frame" | "text" | "accent" | "accentSecondary" | "status";

/** 위젯 타입별 지원하는 색상 그룹 */
export const WIDGET_COLOR_GROUPS: Record<string, WidgetColorGroup[]> = {
  "ultrasonic-arc-risk":       ["frame", "text", "accent", "status"],
  "vibration-fft-spectrum":    ["frame", "text", "accent", "status"],
  "thermal-delta-map":         ["frame", "text", "accent", "status"],
  "gas-decomposition-panel":   ["frame", "text", "accent", "status"],
  "hazard-zone-map":           ["frame", "text", "status"],
  "multi-sensor-health":       ["frame", "text", "status"],
  "device-power-battery":      ["frame", "text", "accent", "status"],
  "fleet-device-inventory":    ["frame", "text", "status"],
  "fault-progression-stage":   ["frame", "text", "accent", "status"],
  "autoencoder-anomaly":       ["frame", "text", "accent", "status"],
  "rul-lstm-forecast":         ["frame", "text", "accent", "status"],
  "cnn-lstm-spectrogram":      ["frame", "text", "accent", "accentSecondary", "status"],
  "fscore-model-tuning":       ["frame", "text", "accent", "accentSecondary"],
  "predictive-report":         ["frame", "text", "status"],
  "worker-spo2-status":        ["frame", "text", "accent", "status"],
  "worker-context-fusion":     ["frame", "text", "accent", "status"],
  "worker-fall-detection":     ["frame", "text", "accent", "status"],
  "gateway-communication":     ["frame", "text", "status"],
  "sop-auto-execution":        ["frame", "text", "accent", "status"],
  "field-validation-progress": ["frame", "text", "accent", "accentSecondary", "status"],
};

export const DEFAULT_WIDGET_GROUPS: WidgetColorGroup[] = ["frame", "text", "accent", "status"];
