"use client";

import { useMonitoringRuntimeStore } from "@/store/monitoringRuntimeStore";
import MonitoringWidgetRenderer from "@/components/monitoring-editor/MonitoringWidgetRenderer";

const CATEGORY_LABELS: Record<string, string> = {
  ultrasonic: "초음파",
  vibration: "진동",
  thermal: "열",
  gas: "가스",
  "worker-bio": "작업자",
  imu: "IMU",
  communication: "통신",
  "ai-diagnosis": "AI",
  "sop-events": "SOP",
  "sensor-fleet": "계측기",
  "field-validation": "실증",
};

export default function RuntimeWidgetOverlay() {
  const { items, widgetMeta } = useMonitoringRuntimeStore();
  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gridAutoRows: "44px",
        gap: "16px",
        padding: "20px 20px 20px 28px",
        alignContent: "start",
      }}
    >
      {items.map((instance) => {
        const meta = widgetMeta[instance.widgetId];
        if (!meta) return null;
        const dataSource = String(instance.options.dataSource ?? meta.dataSource ?? "");
        return (
          <div
            key={instance.instanceId}
            className="pointer-events-auto overflow-hidden rounded-xl"
            style={{
              gridColumn: `${instance.x + 1} / span ${instance.w}`,
              gridRow: `${instance.y + 1} / span ${instance.h}`,
            }}
          >
            <MonitoringWidgetRenderer
              title={instance.title}
              widget={meta}
              categoryLabel={CATEGORY_LABELS[dataSource] ?? (dataSource || "Monitoring")}
            />
          </div>
        );
      })}
    </div>
  );
}
