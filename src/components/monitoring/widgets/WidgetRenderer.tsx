"use client";
import React from "react";
import { MonitoringWidgetProps } from "@/store/monitoringEditorStore";

// ─── 위젯 컴포넌트 임포트 ────────────────────────────────────
import KpiSummaryWidget from "./KpiSummaryWidget";
import VibrationTimeseriesWidget from "./VibrationTimeseriesWidget";
import FftSpectrumWidget from "./FftSpectrumWidget";
import BearingHealthWidget from "./BearingHealthWidget";
import GasMonitorWidget from "./GasMonitorWidget";
import GasDiagnosisWidget from "./GasDiagnosisWidget";
import ThermalCameraWidget from "./ThermalCameraWidget";
import ContactTempWidget from "./ContactTempWidget";
import UltrasoundWaveWidget from "./UltrasoundWaveWidget";
import Spo2VitalWidget from "./Spo2VitalWidget";
import FallDetectionWidget from "./FallDetectionWidget";
import WorkerMapWidget from "./WorkerMapWidget";
import AlarmHistoryWidget from "./AlarmHistoryWidget";
import RiskTimelineWidget from "./RiskTimelineWidget";
import FaultPredictionWidget from "./FaultPredictionWidget";
import AiModelBadgeWidget from "./AiModelBadgeWidget";
import CommStatusWidget from "./CommStatusWidget";
import EquipmentHealthWidget from "./EquipmentHealthWidget";
import NetworkTopologyWidget from "./NetworkTopologyWidget";
import MaintenanceScheduleWidget from "./MaintenanceScheduleWidget";

const WIDGET_MAP: Record<string, React.ComponentType<{ widgetProps?: MonitoringWidgetProps }>> = {
  "kpi-summary":          KpiSummaryWidget,
  "vibration-timeseries": VibrationTimeseriesWidget,
  "fft-spectrum":         FftSpectrumWidget,
  "bearing-health":       BearingHealthWidget,
  "gas-monitor":          GasMonitorWidget,
  "gas-diagnosis":        GasDiagnosisWidget,
  "thermal-camera":       ThermalCameraWidget,
  "contact-temp":         ContactTempWidget,
  "ultrasound-wave":      UltrasoundWaveWidget,
  "spo2-vital":           Spo2VitalWidget,
  "fall-detection":       FallDetectionWidget,
  "worker-map":           WorkerMapWidget,
  "alarm-history":        AlarmHistoryWidget,
  "risk-timeline":        RiskTimelineWidget,
  "fault-prediction":     FaultPredictionWidget,
  "ai-model-badge":       AiModelBadgeWidget,
  "comm-status":          CommStatusWidget,
  "equipment-health":     EquipmentHealthWidget,
  "network-topology":     NetworkTopologyWidget,
  "maintenance-schedule": MaintenanceScheduleWidget,
};

export function renderWidgetContent(
  widgetId: string,
  props?: MonitoringWidgetProps
): React.ReactNode {
  const Component = WIDGET_MAP[widgetId];
  if (!Component) {
    return (
      <div className="flex h-full items-center justify-center text-white/30 text-xs">
        [{widgetId}]
      </div>
    );
  }
  return <Component widgetProps={props} />;
}
