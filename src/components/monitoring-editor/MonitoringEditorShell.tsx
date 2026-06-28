"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookmarkPlus,
  Check,
  ChevronLeft,
  Database,
  Edit3,
  EyeOff,
  Grip,
  ImagePlus,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  MessageSquareText,
  Monitor,
  Network,
  Palette,
  Plus,
  RotateCcw,
  Rocket,
  Save,
  Search,
  Settings2,
  SlidersHorizontal,
  Trash2,
  Type,
  X,
} from "lucide-react";
import type { BrandDensity, BrandMapTone, BrandRadius, BrandSettings } from "@/lib/brandPresets";
import { getBrandTextDefaults } from "@/lib/brandPresets";
import type { SolutionManifest, SolutionTemplate, SolutionWidget } from "@/lib/solutionLoader";
import { monitoringGridItemsIntersect, resolveMonitoringGrid, type MonitoringLayoutMode } from "@/lib/monitoringLayoutEngine";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";
import MonitoringLayoutCanvas, {
  DEFAULT_MONITORING_ELEMENT_CONFIGS,
  type MonitoringEditableElement,
  type MonitoringElementConfigs,
} from "./MonitoringLayoutCanvas";
import {
  MonitoringColorControl,
  MonitoringInspectorFrame,
  MonitoringInspectorHeader,
  MonitoringInspectorSection,
  MonitoringNumberControl,
  MonitoringResetButton,
  MonitoringSelectControl,
  MonitoringTextControl,
  MonitoringToggleControl,
} from "./MonitoringInspectorControls";
import MonitoringChatPanel from "./MonitoringChatPanel";
import MonitoringFloatingToolbar from "./MonitoringFloatingToolbar";
import MonitoringWidgetRenderer, { MonitoringWidgetThumbnail } from "./MonitoringWidgetRenderer";
import MonitoringMappingCanvas from "./MonitoringDataMapping/MonitoringMappingCanvas";
import MonitoringDBCanvas from "./MonitoringDBCanvas";
import MonitoringPageBuilder from "@/monitoring-app/components/MonitoringPageBuilder";
import { useMonitoringPagesStore, type MonitoringPageConfig } from "@/store/monitoringPagesStore";
import type { MappingEdge } from "@/store/editorStore";
import { DEFAULT_WIDGET_GROUPS, WIDGET_COLOR_GROUPS } from "@/solutions/monitoring/widgets/colorSchema";

interface MonitoringEditorShellProps {
  solution: SolutionManifest;
  template: SolutionTemplate | null;
  widgets: SolutionWidget[];
}


type LeftTab = "chat" | "widgets";
type CenterView = "monitor" | "db" | "mapping";
type RightInspectorMode = "settings" | "mapping";
type SettingsPanelScope = "brand" | "selection";
type WidgetInteractionKind = "move" | "resize";
type ResizeHandle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
type WidgetOptionValue = string | number | boolean;

interface MonitoringBrandSlot extends BrandSettings {
  id: string;
  label: string;
  description: string;
}

interface WidgetOptionChoice {
  label: string;
  value: string;
}

interface WidgetOptionDefinition {
  id: string;
  label: string;
  type: "select" | "number" | "toggle";
  defaultValue: WidgetOptionValue;
  choices?: WidgetOptionChoice[];
  min?: number;
  max?: number;
  unit?: string;
}

interface CanvasWidgetInstance {
  instanceId: string;
  widgetId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  options: Record<string, WidgetOptionValue>;
}

interface MonitoringSnapshot {
  schemaVersion: "monitoring.snapshot.v1";
  solution: "monitoring";
  app: {
    activePageId: string;
    dashboardMode: "default" | "custom";
    runtimeView: "operator" | "executive" | "maintenance";
  };
  editor: {
    centerView: CenterView;
    leftPanelTab: LeftTab;
    showRightPanel: boolean;
    selectedWidgetId: string | null;
    selectedElement: MonitoringEditableElement | null;
  };
  elements: MonitoringElementConfigs;
  brand?: {
    selectedPresetId: string;
    settings: BrandSettings;
    customSlots: MonitoringBrandSlot[];
  };
  widgets: {
    grid: {
      columns: number;
      rowHeight: number;
    };
    items: CanvasWidgetInstance[];
  };
  createdAt: string;
  updatedAt: string;
}

interface WidgetInteraction {
  kind: WidgetInteractionKind;
  handle?: ResizeHandle;
  instanceId: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
}

interface DefaultWidgetInteraction {
  kind: WidgetInteractionKind;
  handle?: ResizeHandle;
  elementId: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
}

const GRID_COLS = 12;
const GRID_ROW_HEIGHT = 44;
const GRID_MARGIN_TOP = 20;
const GRID_MARGIN_RIGHT = 20;
const GRID_MARGIN_BOTTOM = 20;
const GRID_MARGIN_LEFT = 28;
const GRID_GUTTER = 16;
const GRID_ROW_GAP = 16;
const MIN_WIDGET_W = 2;
const MIN_WIDGET_H = 2;
const MONITORING_DRAFT_STORAGE_KEY = "aimnis_monitoring_editor_draft";
const MONITORING_LEFT_PANEL_WIDTH = 300;

const MONITORING_EDITOR_NAV = [
  { href: "/home", label: "홈", Icon: LayoutDashboard },
  { href: "/editor?solution=monitoring", label: "에디터", Icon: Activity },
  { href: "/projects", label: "프로젝트", Icon: Database },
  { href: "/monitoring", label: "AIM Monitoring", Icon: Activity },
];

const MONITORING_DEFAULT_BRAND: BrandSettings = {
  tenantName: "AIMWID",
  serviceName: "AIoT 복합 계측 모니터링 시스템",
  productName: "AIM Monitoring",
  logoUrl: "/img/AIM%20Mornitering2.svg",
  logoMode: "combined",
  logoSize: 160,
  primaryColor: "#2563EB",
  secondaryColor: "#00C8FF",
  accentColor: "#3B82F6",
  successColor: "#10B981",
  warningColor: "#EAB308",
  dangerColor: "#EF4444",
  backgroundColor: "#0B1120",
  surfaceColor: "#111827",
  borderColor: "#1F2937",
  textStrongColor: "#F8FAFC",
  textColor: "#CBD5E1",
  textSoftColor: "#94A3B8",
  textFaintColor: "#64748B",
  fontFamily: "Noto Sans KR",
  radius: "soft",
  density: "standard",
  mapTone: "deep",
};

const MONITORING_BRAND_PRESETS: MonitoringBrandSlot[] = [
  /* 1 */ {
    id: "monitoring-default",
    label: "AIM Monitoring Default",
    description: "기본 납품 데모용 다크 네이비 AIoT 관제 톤",
    ...MONITORING_DEFAULT_BRAND,
  },
  /* 2 */ {
    id: "posco-smart-safety",
    label: "POSCO Smart Safety",
    description: "제조 현장 안전 관제용 스틸 블루",
    ...MONITORING_DEFAULT_BRAND,
    tenantName: "POSCO Smart Factory",
    serviceName: "Smart Safety Monitoring Center",
    productName: "Safety Monitoring",
    primaryColor: "#0F766E",
    secondaryColor: "#38BDF8",
    accentColor: "#22D3EE",
    successColor: "#22C55E",
    warningColor: "#F59E0B",
    dangerColor: "#EF4444",
    backgroundColor: "#06161E",
    surfaceColor: "#0B2430",
    borderColor: "#1E4D5F",
    density: "compact",
    mapTone: "blueprint",
  },
  /* 3 */ {
    id: "samsung-digital-campus",
    label: "Samsung Digital Campus",
    description: "반도체/캠퍼스 관제용 딥 블루",
    ...MONITORING_DEFAULT_BRAND,
    tenantName: "Samsung Digital Campus",
    serviceName: "Integrated Monitoring Operations",
    productName: "Campus Monitoring",
    primaryColor: "#1428A0",
    secondaryColor: "#00A6FF",
    accentColor: "#7DD3FC",
    successColor: "#22C55E",
    warningColor: "#F59E0B",
    dangerColor: "#EF4444",
    backgroundColor: "#050B1D",
    surfaceColor: "#0A1633",
    borderColor: "#1F3A75",
    mapTone: "deep",
  },
  /* 4 */ {
    id: "hyundai-mobility-guard",
    label: "Hyundai Mobility",
    description: "모빌리티/공장 관제용 네이비 시안",
    ...MONITORING_DEFAULT_BRAND,
    tenantName: "Hyundai Mobility",
    serviceName: "Mobility Safety Monitoring",
    productName: "Mobility Monitoring",
    primaryColor: "#002C5F",
    secondaryColor: "#00AAD2",
    accentColor: "#38BDF8",
    successColor: "#22C55E",
    warningColor: "#F97316",
    dangerColor: "#EF4444",
    backgroundColor: "#06111F",
    surfaceColor: "#0B1D33",
    borderColor: "#24415F",
    mapTone: "blueprint",
  },
  /* 5 */ {
    id: "kepco-aiot-blue",
    label: "KEPCO Energy Control",
    description: "화이트 기반 엔터프라이즈 관제 톤",
    ...MONITORING_DEFAULT_BRAND,
    tenantName: "KEPCO Energy",
    serviceName: "Clean Energy AIoT Monitoring",
    productName: "Energy Monitoring",
    primaryColor: "#0C8AE5",
    secondaryColor: "#38BDF8",
    accentColor: "#0C8AE5",
    successColor: "#22C55E",
    warningColor: "#F59E0B",
    dangerColor: "#EF4444",
    backgroundColor: "#F8F9FD",
    surfaceColor: "#FFFFFF",
    borderColor: "#E0E6F0",
    textStrongColor: "#1E2124",
    textColor: "#3A4552",
    textSoftColor: "#6D7882",
    textFaintColor: "#9DAAB8",
    sidebarColor: "#003481",
    density: "spacious",
    mapTone: "mono",
  },
  /* 6 */ {
    id: "twinx-industrial-gray",
    label: "TWIN-X Industrial Gray",
    description: "그레이 베이스에 오렌지 포인트를 둔 설비 관제 톤",
    ...MONITORING_DEFAULT_BRAND,
    tenantName: "Industrial Twin-X",
    serviceName: "Facility Event Monitoring",
    productName: "Twin Monitoring",
    primaryColor: "#F97316",
    secondaryColor: "#A3A3A3",
    accentColor: "#F59E0B",
    successColor: "#22C55E",
    warningColor: "#FB923C",
    dangerColor: "#EF4444",
    backgroundColor: "#2F3030",
    surfaceColor: "#3B3B3D",
    borderColor: "#55565A",
    radius: "sharp",
    density: "compact",
    mapTone: "mono",
  },
  /* 7 */ {
    id: "public-neutral",
    label: "Public Institution Neutral",
    description: "공공기관 납품용 절제된 중립 톤",
    ...MONITORING_DEFAULT_BRAND,
    tenantName: "Public Institution",
    serviceName: "Integrated Safety Monitoring",
    productName: "Public Monitoring",
    primaryColor: "#475569",
    secondaryColor: "#0EA5E9",
    accentColor: "#94A3B8",
    successColor: "#16A34A",
    warningColor: "#D97706",
    dangerColor: "#DC2626",
    backgroundColor: "#0A0F1A",
    surfaceColor: "#111827",
    borderColor: "#334155",
    density: "spacious",
    mapTone: "mono",
  },
];

const MONITORING_FONT_OPTIONS = [
  { value: "Noto Sans KR", label: "Noto Sans KR" },
  { value: "Pretendard", label: "Pretendard" },
  { value: "Inter", label: "Inter" },
  { value: "IBM Plex Sans KR", label: "IBM Plex Sans KR" },
];

const MONITORING_RADIUS_OPTIONS: Array<{ value: BrandRadius; label: string }> = [
  { value: "sharp", label: "Sharp" },
  { value: "soft", label: "Soft" },
  { value: "rounded", label: "Rounded" },
];

const MONITORING_DENSITY_OPTIONS: Array<{ value: BrandDensity; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "standard", label: "Standard" },
  { value: "spacious", label: "Spacious" },
];

const MONITORING_MAP_TONE_OPTIONS: Array<{ value: BrandMapTone; label: string }> = [
  { value: "deep", label: "Deep" },
  { value: "blueprint", label: "Blueprint" },
  { value: "satellite", label: "Satellite" },
  { value: "mono", label: "Mono" },
];

function cloneMonitoringBrand(brand: BrandSettings = MONITORING_DEFAULT_BRAND): BrandSettings {
  const textDefaults = getBrandTextDefaults(brand);
  return {
    ...MONITORING_DEFAULT_BRAND,
    ...brand,
    textStrongColor: brand.textStrongColor ?? textDefaults.textStrongColor,
    textColor: brand.textColor ?? textDefaults.textColor,
    textSoftColor: brand.textSoftColor ?? textDefaults.textSoftColor,
    textFaintColor: brand.textFaintColor ?? textDefaults.textFaintColor,
  };
}

function makeMonitoringBrandSlot(id: string, label: string, description: string, brand: BrandSettings): MonitoringBrandSlot {
  return {
    id,
    label,
    description,
    ...cloneMonitoringBrand(brand),
  };
}

const LEGACY_LOGO_URLS = [
  "https://cdn.imweb.me/upload/S20220215d5bc0d1f16d2a/d3e5b407f8f08.png",
];

function resolveSnapshotBrand(snapshot?: MonitoringSnapshot["brand"]) {
  const presetId = snapshot?.selectedPresetId ?? "monitoring-default";
  const savedBrand = snapshot?.settings;
  const isLegacyMonitoringDefault =
    presetId === "monitoring-default" &&
    (!savedBrand ||
      (savedBrand.backgroundColor === "#070F24" &&
        savedBrand.surfaceColor === "#0C1733" &&
        savedBrand.borderColor === "#1E3A5F"));

  const resolved = isLegacyMonitoringDefault ? cloneMonitoringBrand() : cloneMonitoringBrand(savedBrand);
  if (resolved.logoUrl && LEGACY_LOGO_URLS.includes(resolved.logoUrl)) {
    resolved.logoUrl = MONITORING_DEFAULT_BRAND.logoUrl;
  }
  return resolved;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function TopIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center leading-none"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      {children}
    </span>
  );
}

const WIDGET_CATEGORY_LABELS: Record<string, string> = {
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

const DATA_SOURCE_CHOICES = Object.entries(WIDGET_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

const WIDGET_COMMAND_KEYWORDS = [
  "추가", "넣", "생성", "배치", "구성", "만들", "올려", "붙여",
  "보여줘", "보여", "열어", "넣어줘", "추가해줘", "달아줘", "설치", "띄워",
  "주세요", "해주세요", "해줘", "싶어", "필요해", "원해", "써줘", "사용",
];

const WIDGET_COMMAND_PATTERNS: Array<{ widgetId: string; keywords: string[] }> = [
  { widgetId: "ultrasonic-arc-risk", keywords: ["초음파", "아크", "방전", "코로나", "ultrasonic"] },
  { widgetId: "vibration-fft-spectrum", keywords: ["진동", "fft", "스펙트럼", "회전", "베어링"] },
  { widgetId: "thermal-delta-map", keywords: ["열", "열화상", "과열", "온도", "히트맵", "delta", "dt"] },
  { widgetId: "gas-decomposition-panel", keywords: ["가스", "co", "ch4", "h2", "열화"] },
  { widgetId: "multi-sensor-health", keywords: ["복합", "센서", "헬스", "매트릭스", "통합"] },
  { widgetId: "fault-progression-stage", keywords: ["고장", "진행", "단계", "잠복"] },
  { widgetId: "autoencoder-anomaly", keywords: ["autoencoder", "오토인코더", "이상점수", "재구성"] },
  { widgetId: "rul-lstm-forecast", keywords: ["lstm", "잔여수명", "rul", "수명", "예측"] },
  { widgetId: "cnn-lstm-spectrogram", keywords: ["cnn", "스펙트로그램", "이미지", "진단"] },
  { widgetId: "fscore-model-tuning", keywords: ["f1", "f2", "모델", "재현율", "정확도"] },
  { widgetId: "worker-spo2-status", keywords: ["spo2", "산소", "산소포화도", "맥박", "생체"] },
  { widgetId: "worker-fall-detection", keywords: ["쓰러짐", "낙상", "fall", "충격", "긴급"] },
  { widgetId: "worker-context-fusion", keywords: ["작업자", "안전", "컨텍스트", "위치"] },
  { widgetId: "hazard-zone-map", keywords: ["유해", "환경", "구역", "맵", "zone", "지도"] },
  { widgetId: "gateway-communication", keywords: ["통신", "게이트웨이", "lte", "wifi", "lora", "rs-485", "ble"] },
  { widgetId: "device-power-battery", keywords: ["배터리", "전원", "계측기 전원"] },
  { widgetId: "sop-auto-execution", keywords: ["sop", "자동", "조치", "실행"] },
  { widgetId: "predictive-report", keywords: ["리포트", "보고서", "예지보전", "요약"] },
  { widgetId: "field-validation-progress", keywords: ["실증", "검증", "현장", "진행률"] },
  { widgetId: "fleet-device-inventory", keywords: ["배치", "인벤토리", "설치", "현황", "fleet"] },
];

const COMMON_WIDGET_OPTIONS: WidgetOptionDefinition[] = [
  {
    id: "refreshInterval",
    label: "갱신 주기",
    type: "select",
    defaultValue: "5s",
    choices: [
      { label: "실시간 1초", value: "1s" },
      { label: "운영 5초", value: "5s" },
      { label: "분석 30초", value: "30s" },
      { label: "리포트 5분", value: "5m" },
    ],
  },
  {
    id: "alertLevel",
    label: "경보 기준",
    type: "select",
    defaultValue: "yellow",
    choices: [
      { label: "주의부터 표시", value: "yellow" },
      { label: "위험만 표시", value: "red" },
      { label: "정상 포함 전체", value: "all" },
    ],
  },
  {
    id: "displayMode",
    label: "표시 밀도",
    type: "select",
    defaultValue: "balanced",
    choices: [
      { label: "균형형", value: "balanced" },
      { label: "차트 중심", value: "chart" },
      { label: "운영 지표 중심", value: "metric" },
      { label: "컴팩트", value: "compact" },
    ],
  },
  {
    id: "threshold",
    label: "위험 임계값",
    type: "number",
    defaultValue: 75,
    min: 0,
    max: 100,
    unit: "%",
  },
];

function getWidgetOptionDefinitions(widget?: SolutionWidget | null): WidgetOptionDefinition[] {
  const dataSource = widget?.dataSource ?? "sensor-fleet";
  const sourceOption: WidgetOptionDefinition = {
    id: "dataSource",
    label: "데이터 소스",
    type: "select",
    defaultValue: dataSource,
    choices: DATA_SOURCE_CHOICES,
  };

  const bySource: Record<string, WidgetOptionDefinition[]> = {
    ultrasonic: [
      { id: "baselineDb", label: "기준 dB", type: "number", defaultValue: 58, min: 20, max: 120, unit: "dB" },
      {
        id: "arcPolicy",
        label: "아크 판정",
        type: "select",
        defaultValue: "early",
        choices: [
          { label: "초기 징후 우선", value: "early" },
          { label: "오탐 최소화", value: "strict" },
        ],
      },
    ],
    vibration: [
      {
        id: "fftBand",
        label: "FFT 대역",
        type: "select",
        defaultValue: "0-2khz",
        choices: [
          { label: "0-500Hz", value: "0-500hz" },
          { label: "0-2kHz", value: "0-2khz" },
          { label: "0-10kHz", value: "0-10khz" },
        ],
      },
      { id: "rpmReference", label: "기준 RPM", type: "number", defaultValue: 1800, min: 300, max: 6000, unit: "rpm" },
    ],
    thermal: [
      { id: "deltaThreshold", label: "ΔT 기준", type: "number", defaultValue: 12, min: 1, max: 80, unit: "°C" },
      {
        id: "thermalPalette",
        label: "열지도 팔레트",
        type: "select",
        defaultValue: "risk",
        choices: [
          { label: "위험도", value: "risk" },
          { label: "온도", value: "thermal" },
        ],
      },
    ],
    gas: [
      {
        id: "gasProfile",
        label: "가스 프로파일",
        type: "select",
        defaultValue: "decomposition",
        choices: [
          { label: "열화 가스", value: "decomposition" },
          { label: "유해 환경", value: "hazard" },
        ],
      },
      { id: "h2sLimit", label: "H2S 기준", type: "number", defaultValue: 15, min: 0, max: 100, unit: "ppm" },
    ],
    "worker-bio": [
      { id: "spo2Limit", label: "SpO2 하한", type: "number", defaultValue: 94, min: 80, max: 100, unit: "%" },
      {
        id: "workerRule",
        label: "작업자 정책",
        type: "select",
        defaultValue: "safety-first",
        choices: [
          { label: "안전 우선", value: "safety-first" },
          { label: "현장 지속성", value: "continuity" },
        ],
      },
    ],
    imu: [
      { id: "fallCountdown", label: "신고 카운트다운", type: "number", defaultValue: 30, min: 5, max: 120, unit: "초" },
      { id: "autoReport", label: "자동 신고", type: "toggle", defaultValue: true },
    ],
    communication: [
      {
        id: "protocol",
        label: "통신 방식",
        type: "select",
        defaultValue: "ble-lte",
        choices: [
          { label: "BLE + LTE", value: "ble-lte" },
          { label: "Wi-Fi", value: "wifi" },
          { label: "LoRa", value: "lora" },
          { label: "RS-485", value: "rs485" },
        ],
      },
      { id: "latencyLimit", label: "지연 기준", type: "number", defaultValue: 250, min: 50, max: 3000, unit: "ms" },
    ],
    "ai-diagnosis": [
      {
        id: "modelMode",
        label: "AI 모델",
        type: "select",
        defaultValue: "hybrid",
        choices: [
          { label: "Autoencoder", value: "autoencoder" },
          { label: "LSTM", value: "lstm" },
          { label: "CNN-LSTM", value: "cnn-lstm" },
          { label: "Hybrid", value: "hybrid" },
        ],
      },
      {
        id: "scorePolicy",
        label: "평가 정책",
        type: "select",
        defaultValue: "f2",
        choices: [
          { label: "F1 균형", value: "f1" },
          { label: "F2 안전", value: "f2" },
        ],
      },
    ],
    "sop-events": [
      {
        id: "sopPolicy",
        label: "SOP 실행",
        type: "select",
        defaultValue: "semi-auto",
        choices: [
          { label: "자동 실행", value: "auto" },
          { label: "승인 후 실행", value: "semi-auto" },
          { label: "알림만", value: "notify" },
        ],
      },
      { id: "reportAfterAction", label: "조치 리포트", type: "toggle", defaultValue: true },
    ],
    "sensor-fleet": [
      {
        id: "deviceMode",
        label: "계측기 모드",
        type: "select",
        defaultValue: "hybrid",
        choices: [
          { label: "휴대형", value: "portable" },
          { label: "고정형", value: "fixed" },
          { label: "휴대/고정 겸용", value: "hybrid" },
        ],
      },
      { id: "batteryLimit", label: "배터리 주의", type: "number", defaultValue: 25, min: 5, max: 80, unit: "%" },
    ],
    "field-validation": [
      {
        id: "validationSite",
        label: "실증 현장",
        type: "select",
        defaultValue: "taean",
        choices: [
          { label: "태안 발전본부", value: "taean" },
          { label: "ESS", value: "ess" },
          { label: "신재생 설비", value: "renewable" },
        ],
      },
      { id: "feedbackLoop", label: "사용자 의견 반영", type: "toggle", defaultValue: true },
    ],
  };

  return [sourceOption, ...COMMON_WIDGET_OPTIONS, ...(bySource[dataSource] ?? [])];
}

function buildDefaultWidgetOptions(widget: SolutionWidget): Record<string, WidgetOptionValue> {
  return Object.fromEntries(getWidgetOptionDefinitions(widget).map((option) => [option.id, option.defaultValue]));
}

function normalizeCommandText(prompt: string) {
  return prompt.toLowerCase().replace(/\s+/g, " ").trim();
}

function hasWidgetCreateIntent(prompt: string) {
  const normalized = normalizeCommandText(prompt);
  if (WIDGET_COMMAND_KEYWORDS.some((keyword) => normalized.includes(keyword))) return true;
  // short phrases (≤5 words): match direct widget keyword without action verb
  if (normalized.split(/\s+/).filter(Boolean).length <= 5) {
    return WIDGET_COMMAND_PATTERNS.some((pattern) =>
      pattern.keywords.some((kw) => normalized.includes(kw.toLowerCase()))
    );
  }
  return false;
}

function resolveWidgetIdFromPrompt(prompt: string, widgets: SolutionWidget[]) {
  const normalized = normalizeCommandText(prompt);
  if (!normalized || !hasWidgetCreateIntent(normalized)) return null;

  const byName = widgets.find((widget) => normalized.includes(widget.name.toLowerCase()));
  if (byName) return byName.id;

  let bestWidgetId: string | null = null;
  let bestScore = 0;
  WIDGET_COMMAND_PATTERNS.forEach((pattern) => {
    const score = pattern.keywords.reduce((sum, keyword) => {
      return normalized.includes(keyword.toLowerCase()) ? sum + 1 : sum;
    }, 0);
    if (score > bestScore) {
      bestWidgetId = pattern.widgetId;
      bestScore = score;
    }
  });

  return bestWidgetId;
}

const DEFAULT_WIDGET_POSITIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  "summary-equipment-status": { x: 0, y: 0,  w: 3, h: 3  },
  "summary-environment-risk": { x: 3, y: 0,  w: 3, h: 3  },
  "summary-worker-safety":    { x: 6, y: 0,  w: 3, h: 3  },
  "summary-alert-count":      { x: 9, y: 0,  w: 3, h: 3  },
  "equipment-anomaly-chart":  { x: 0, y: 3,  w: 8, h: 10 },
  "worker-safety-overview":   { x: 8, y: 3,  w: 4, h: 10 },
  "environment-diagnosis":    { x: 0, y: 13, w: 3, h: 5  },
  "realtime-alerts":          { x: 3, y: 13, w: 3, h: 5  },
  "action-progress":          { x: 6, y: 13, w: 3, h: 5  },
  "system-status":            { x: 9, y: 13, w: 3, h: 5  },
};

function canvasWidgetsIntersect(
  a: Pick<CanvasWidgetInstance, "x" | "y" | "w" | "h">,
  b: Pick<CanvasWidgetInstance, "x" | "y" | "w" | "h">
) {
  return monitoringGridItemsIntersect(a, b);
}

interface ResolvedMonitoringLayout {
  widgets: CanvasWidgetInstance[];
  elements: MonitoringElementConfigs;
}

/** 기본 위젯과 라이브러리 위젯을 동일한 12-column 좌표계에서 확정한다. */
function resolveMonitoringLayout(
  widgets: CanvasWidgetInstance[],
  elements: MonitoringElementConfigs,
  priorityId?: string,
  mode: MonitoringLayoutMode = "compact"
): ResolvedMonitoringLayout {
  const defaults = Object.entries(elements.defaultWidgets)
    .filter(([, config]) => config.visible !== false)
    .map(([id, config]) => {
      const fallback = DEFAULT_WIDGET_POSITIONS[id] ?? { x: 0, y: 0, w: 1, h: 1 };
      return {
        id,
        source: "default" as const,
        x: config.x ?? fallback.x,
        y: config.y ?? fallback.y,
        w: config.w ?? fallback.w,
        h: config.h ?? fallback.h,
      };
    });
  const customs = widgets.map((widget) => ({
    id: widget.instanceId,
    source: "custom" as const,
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h,
  }));
  const placed = resolveMonitoringGrid([...defaults, ...customs], {
    columns: GRID_COLS,
    mode,
    priorityId,
    sourceOrder: { default: 0, custom: 1 },
  });

  const positionById = Object.fromEntries(placed.map((item) => [item.id, item]));
  return {
    widgets: widgets.map((widget) => {
      const position = positionById[widget.instanceId];
      return position ? { ...widget, x: position.x, y: position.y, w: position.w, h: position.h } : widget;
    }),
    elements: {
      ...elements,
      defaultWidgets: Object.fromEntries(
        Object.entries(elements.defaultWidgets).map(([id, config]) => {
          const position = positionById[id];
          return [id, position ? { ...config, x: position.x, y: position.y, w: position.w, h: position.h } : config];
        })
      ),
    },
  };
}

function findNextWidgetPlacement(
  widget: SolutionWidget,
  currentWidgets: CanvasWidgetInstance[],
  preferred?: { x: number; y: number }
) {
  const w = Math.min(widget.defaultSize.w, GRID_COLS);
  const h = Math.max(MIN_WIDGET_H, widget.defaultSize.h);

  const preferredPlacement = preferred
    ? {
        x: clamp(preferred.x, 0, GRID_COLS - w),
        y: Math.max(0, preferred.y),
        w,
        h,
      }
    : null;

  if (preferredPlacement && !currentWidgets.some((item) => canvasWidgetsIntersect(preferredPlacement, item))) {
    return preferredPlacement;
  }

  for (let y = 0; y < 60; y += 1) {
    for (let x = 0; x <= GRID_COLS - w; x += 1) {
      const candidate = { x, y, w, h };
      if (!currentWidgets.some((item) => canvasWidgetsIntersect(candidate, item))) {
        return candidate;
      }
    }
  }

  const lastY = currentWidgets.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  return { x: 0, y: lastY, w, h };
}

function cloneDefaultElementConfigs(): MonitoringElementConfigs {
  return {
    header: { ...DEFAULT_MONITORING_ELEMENT_CONFIGS.header },
    sidebar: { ...DEFAULT_MONITORING_ELEMENT_CONFIGS.sidebar },
    defaultWidgets: Object.fromEntries(
      Object.entries(DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets).map(([id, config]) => [id, { ...config }])
    ),
  };
}

function normalizeElementConfigs(configs?: Partial<MonitoringElementConfigs> | null): MonitoringElementConfigs {
  const defaults = cloneDefaultElementConfigs();

  return {
    header: {
      ...defaults.header,
      ...(configs?.header ?? {}),
    },
    sidebar: {
      ...defaults.sidebar,
      ...(configs?.sidebar ?? {}),
    },
    defaultWidgets: {
      ...defaults.defaultWidgets,
      ...Object.fromEntries(
        Object.entries(configs?.defaultWidgets ?? {}).map(([id, config]) => [
          id,
          {
            ...(defaults.defaultWidgets[id] ?? {
              title: id,
              dataBinding: "ai-studio-demo",
              accentColor: "#3b82f6",
              visible: true,
            }),
            ...config,
          },
        ])
      ),
    },
  };
}

export default function MonitoringEditorShell({ solution, widgets }: MonitoringEditorShellProps) {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const router = useRouter();
  const projects = useProjectStore((state) => state.projects);
  const upsertProject = useProjectStore((state) => state.upsert);
  const [leftPanelWidth, setLeftPanelWidth] = useState(MONITORING_LEFT_PANEL_WIDTH);
  const [leftTab, setLeftTab] = useState<LeftTab>("chat");
  const [centerView, setCenterView] = useState<CenterView>("monitor");
  const [rightInspectorMode, setRightInspectorMode] = useState<RightInspectorMode>("settings");
  const [settingsPanelScope, setSettingsPanelScope] = useState<SettingsPanelScope>("brand");
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({ name: "", client: "", versionNote: "" });
  const [publishDone, setPublishDone] = useState<{ id: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDraggingWidget, setIsDraggingWidget] = useState(false);
  const [canvasWidgets, setCanvasWidgets] = useState<CanvasWidgetInstance[]>([]);
  const [monitoringMappingEdges, setMonitoringMappingEdges] = useState<MappingEdge[]>([]);
  const [widgetLiveData, setWidgetLiveData] = useState<Record<string, Record<string, unknown>>>({});
  const [mappingNodePositions, setMappingNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [connectedSourceIds, setConnectedSourceIds] = useState<Set<string>>(new Set());
  const [connectedSourceMeta, setConnectedSourceMeta] = useState<Record<string, { name: string; endpoint: string; fields?: string[] }>>({});
  const [isPageBuilderOpen, setIsPageBuilderOpen] = useState(false);
  const [pendingNavPage, setPendingNavPage] = useState<string | null>(null);
  const { addedPages, addPage, removePage } = useMonitoringPagesStore();
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<MonitoringEditableElement | null>(null);
  const [elementConfigs, setElementConfigs] = useState<MonitoringElementConfigs>(() => cloneDefaultElementConfigs());
  const [brand, setBrand] = useState<BrandSettings>(() => cloneMonitoringBrand());
  const [selectedBrandPresetId, setSelectedBrandPresetId] = useState("monitoring-default");
  const [customBrandSlots, setCustomBrandSlots] = useState<MonitoringBrandSlot[]>([]);
  const [brandSlotName, setBrandSlotName] = useState("AIM Monitoring Default");
  const [customBrandName, setCustomBrandName] = useState("");
  const [interaction, setInteraction] = useState<WidgetInteraction | null>(null);
  const [defaultInteraction, setDefaultInteraction] = useState<DefaultWidgetInteraction | null>(null);
  const [widgetSearch, setWidgetSearch] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const fullscreenCanvasRef = useRef<HTMLDivElement>(null);
  const canvasWidgetsRef = useRef<CanvasWidgetInstance[]>([]);
  const elementConfigsRef = useRef<MonitoringElementConfigs>(elementConfigs);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const hydratedRef = useRef(false);

  canvasWidgetsRef.current = canvasWidgets;
  elementConfigsRef.current = elementConfigs;

  const commitResolvedLayout = useCallback((
    priorityId?: string,
    mode: MonitoringLayoutMode = "compact",
    widgetsOverride?: CanvasWidgetInstance[],
    elementsOverride?: MonitoringElementConfigs
  ) => {
    const resolved = resolveMonitoringLayout(
      widgetsOverride ?? canvasWidgetsRef.current,
      elementsOverride ?? elementConfigsRef.current,
      priorityId,
      mode
    );
    canvasWidgetsRef.current = resolved.widgets;
    elementConfigsRef.current = resolved.elements;
    setCanvasWidgets(resolved.widgets);
    setElementConfigs(resolved.elements);
  }, []);

  const widgetById = useMemo(() => {
    return Object.fromEntries(widgets.map((widget) => [widget.id, widget])) as Record<string, SolutionWidget>;
  }, [widgets]);

  const selectedWidget = selectedWidgetId ? canvasWidgets.find((widget) => widget.instanceId === selectedWidgetId) ?? null : null;
  const selectedWidgetMeta = selectedWidget ? widgetById[selectedWidget.widgetId] : null;
  const selectedDefaultWidgetConfig =
    selectedElement?.kind === "default-widget"
      ? elementConfigs.defaultWidgets[selectedElement.id] ?? DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets[selectedElement.id]
      : null;
  const selectedWidgetOptionDefinitions = useMemo(
    () => getWidgetOptionDefinitions(selectedWidgetMeta),
    [selectedWidgetMeta]
  );

  const libraryGroups = useMemo(() => {
    return widgets.reduce<Record<string, SolutionWidget[]>>((acc, widget) => {
      const key = widget.dataSource ?? "기타";
      acc[key] = acc[key] ? [...acc[key], widget] : [widget];
      return acc;
    }, {});
  }, [widgets]);

  const filteredLibraryGroups = useMemo(() => {
    const q = widgetSearch.trim().toLowerCase();
    if (!q) return libraryGroups;
    const result: Record<string, SolutionWidget[]> = {};
    for (const [group, groupWidgets] of Object.entries(libraryGroups)) {
      const matches = groupWidgets.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          (w.description ?? "").toLowerCase().includes(q) ||
          (w.dataSource ?? "").toLowerCase().includes(q) ||
          (WIDGET_CATEGORY_LABELS[group] ?? group).toLowerCase().includes(q)
      );
      if (matches.length > 0) result[group] = matches;
    }
    return result;
  }, [libraryGroups, widgetSearch]);

  const usedWidgetIds = useMemo(
    () => new Set(canvasWidgets.map((w) => w.widgetId)),
    [canvasWidgets]
  );

  const createSnapshot = (): MonitoringSnapshot => {
    const now = new Date().toISOString();
    const resolved = resolveMonitoringLayout(canvasWidgets, elementConfigs);
    return {
      schemaVersion: "monitoring.snapshot.v1",
      solution: "monitoring",
      app: {
        activePageId: "home",
        dashboardMode: resolved.widgets.length > 0 ? "custom" : "default",
        runtimeView: "operator",
      },
      editor: {
        centerView,
        leftPanelTab: leftTab,
        showRightPanel,
        selectedWidgetId,
        selectedElement,
      },
      elements: resolved.elements,
      brand: {
        selectedPresetId: selectedBrandPresetId,
        settings: brand,
        customSlots: customBrandSlots,
      },
      widgets: {
        grid: {
          columns: GRID_COLS,
          rowHeight: GRID_ROW_HEIGHT,
        },
        items: resolved.widgets,
      },
      createdAt: now,
      updatedAt: now,
    };
  };

  const applySnapshot = (snapshot: MonitoringSnapshot) => {
    const normalizedElements = normalizeElementConfigs(snapshot.elements);
    const resolved = resolveMonitoringLayout(snapshot.widgets.items ?? [], normalizedElements);
    setCenterView(snapshot.editor.centerView);
    setShowRightPanel(snapshot.editor.showRightPanel);
    canvasWidgetsRef.current = resolved.widgets;
    elementConfigsRef.current = resolved.elements;
    setCanvasWidgets(resolved.widgets);
    setSelectedWidgetId(snapshot.editor.selectedWidgetId);
    setSelectedElement(snapshot.editor.selectedElement ?? null);
    setElementConfigs(resolved.elements);
    setBrand(resolveSnapshotBrand(snapshot.brand));
    setSelectedBrandPresetId(snapshot.brand?.selectedPresetId ?? "monitoring-default");
    setCustomBrandSlots(snapshot.brand?.customSlots ?? []);
    setBrandSlotName(snapshot.brand?.settings?.productName ? `${snapshot.brand.settings.productName} Theme` : "AIM Monitoring Default");
  };

  const handleSave = () => {
    const snapshot = createSnapshot();
    window.localStorage.setItem(MONITORING_DRAFT_STORAGE_KEY, JSON.stringify(snapshot));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const handlePublish = () => {
    setPublishForm({ name: solution.name ?? "", client: "", versionNote: "" });
    setPublishDone(null);
    setShowPublishModal(true);
  };

  const handleConfirmPublish = () => {
    const snapshot = createSnapshot();
    const project = upsertProject({
      id: projectId ?? undefined,
      name: publishForm.name || solution.name,
      solution: solution.id,
      status: "active",
      client: publishForm.client || "미지정",
      description: solution.description,
      versionNote: publishForm.versionNote || "AIM Monitoring snapshot",
      tags: ["AIM Monitoring", "AIoT", "예지보전"],
      stats: { alerts: 26, uptime: "89.4%", sensors: Math.max(154, canvasWidgets.length) },
      harnessFile: null,
      industry: "industrial-aiot",
      systemTitle: publishForm.name || solution.name,
      monitoringSnapshot: snapshot,
    });
    window.localStorage.setItem(MONITORING_DRAFT_STORAGE_KEY, JSON.stringify(snapshot));
    setPublishedUrl(`https://${solution.id}.aimnis.ai/${project.id}`);
    setPublishDone({ id: project.id });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
    // 새 프로젝트인 경우 URL에 project ID 반영
    if (!projectId) {
      router.replace(`/editor?solution=monitoring&project=${project.id}`);
    }
  };

  const handleGoHome = () => {
    window.localStorage.removeItem(MONITORING_DRAFT_STORAGE_KEY);
    router.push("/home");
  };

  const updateMonitoringBrand = (patch: Partial<BrandSettings>, options?: { syncHeader?: boolean; syncLogo?: boolean }) => {
    setBrand((current) => cloneMonitoringBrand({ ...current, ...patch }));
    setSelectedBrandPresetId("custom-current");

    if (options?.syncHeader && typeof patch.serviceName === "string") {
      updateHeaderConfig("title", patch.serviceName);
    }

    /* 로고는 brand.logoUrl에서 Header가 직접 읽음 — sidebar 동기화 불필요 */
  };

  const handleMonitoringLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = typeof reader.result === "string" ? reader.result : undefined;
      updateHeaderConfig("logoUrl", url);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const selectMonitoringBrandSlot = (slot: MonitoringBrandSlot) => {
    const nextBrand = cloneMonitoringBrand(slot);
    setBrand(nextBrand);
    setSelectedBrandPresetId(slot.id);
    setBrandSlotName(slot.label);
    setElementConfigs((current) => ({
      ...current,
      header: {
        ...current.header,
        title: nextBrand.serviceName,
      },
      defaultWidgets: Object.fromEntries(
        Object.entries(current.defaultWidgets).map(([id, config]) => [
          id,
          {
            ...config,
            accentColor: nextBrand.primaryColor,
          },
        ])
      ),
    }));
  };

  const saveMonitoringBrandSlot = () => {
    const label = brandSlotName.trim() || `${brand.productName} Theme`;
    const slot = makeMonitoringBrandSlot(`custom-${Date.now()}`, label, "사용자 저장 AIM Monitoring 브랜드 톤", brand);
    setCustomBrandSlots((current) => [slot, ...current.filter((item) => item.label !== label)].slice(0, 6));
    setSelectedBrandPresetId(slot.id);
    setBrandSlotName(label);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const saveMonitoringCustomPreset = () => {
    const label = customBrandName.trim() || `${brand.tenantName} ${brand.productName}`;
    const slot = makeMonitoringBrandSlot(`custom-${Date.now()}`, label, brand.tenantName, brand);
    setCustomBrandSlots((current) => [slot, ...current.filter((item) => item.label !== label)].slice(0, 8));
    setSelectedBrandPresetId(slot.id);
    setBrandSlotName(label);
    setCustomBrandName("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const deleteMonitoringCustomPreset = (id: string) => {
    setCustomBrandSlots((current) => current.filter((item) => item.id !== id));
    if (selectedBrandPresetId === id) {
      selectMonitoringBrandSlot(MONITORING_BRAND_PRESETS[0]);
    }
  };

  const resetSelectedMonitoringBrandSlot = () => {
    const selectedPreset = MONITORING_BRAND_PRESETS.find((slot) => slot.id === selectedBrandPresetId);
    if (selectedPreset) {
      selectMonitoringBrandSlot(selectedPreset);
      return;
    }
    selectMonitoringBrandSlot(MONITORING_BRAND_PRESETS[0]);
  };

  const resetMonitoringBrand = () => {
    selectMonitoringBrandSlot(MONITORING_BRAND_PRESETS[0]);
  };

  const applyBrandToAllMonitoringRegions = () => {
    setElementConfigs((current) => ({
      ...current,
      header: {
        ...current.header,
        title: brand.serviceName,
      },
      defaultWidgets: Object.fromEntries(
        Object.entries(current.defaultWidgets).map(([id, config]) => [
          id,
          {
            ...config,
            accentColor: brand.primaryColor,
          },
        ])
      ),
    }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  /* 세션 중 마지막 에디터 = monitoring → Navbar가 올바른 에디터로 링크 */
  useEffect(() => {
    sessionStorage.setItem("aimnis_active_editor", "monitoring");
  }, []);

  useEffect(() => {
    if (hydratedRef.current) return;

    const activeProject = projectId ? projects.find((project) => project.id === projectId && project.solution === "monitoring") : null;
    const projectSnapshot = activeProject?.monitoringSnapshot as MonitoringSnapshot | undefined;
    if (projectSnapshot?.schemaVersion === "monitoring.snapshot.v1") {
      applySnapshot(projectSnapshot);
      hydratedRef.current = true;
      return;
    }

    if (!projectId) {
      const rawDraft = window.localStorage.getItem(MONITORING_DRAFT_STORAGE_KEY);
      if (rawDraft) {
        try {
          const draftSnapshot = JSON.parse(rawDraft) as MonitoringSnapshot;
          if (draftSnapshot.schemaVersion === "monitoring.snapshot.v1") {
            applySnapshot(draftSnapshot);
          }
        } catch {
          window.localStorage.removeItem(MONITORING_DRAFT_STORAGE_KEY);
        }
      }
    }

    hydratedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, projects]);

  const getCanvasMetrics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const contentWidth = Math.max(0, rect.width - GRID_MARGIN_LEFT - GRID_MARGIN_RIGHT);
    const colWidth = (contentWidth - GRID_GUTTER * (GRID_COLS - 1)) / GRID_COLS;
    return {
      rect,
      colWidth,
      strideX: colWidth + GRID_GUTTER,
      strideY: GRID_ROW_HEIGHT + GRID_ROW_GAP,
      /* 캔버스는 스크롤 가능 → 뷰포트 높이가 아닌 스크롤 전체 높이 기준으로 계산 */
      maxRows: Math.max(200, Math.ceil((canvas.scrollHeight - GRID_MARGIN_TOP - GRID_MARGIN_BOTTOM) / (GRID_ROW_HEIGHT + GRID_ROW_GAP))),
    };
  };

  const addWidgetToCanvas = (widget: SolutionWidget, preferred?: { x: number; y: number }) => {
    const instanceId = `${widget.id}-${Date.now()}`;

    /* 기본 위젯도 충돌 영역으로 포함 — 드롭 위치가 기본 위젯과 겹치지 않게 */
    const defaultOccupied: CanvasWidgetInstance[] = Object.entries(elementConfigs.defaultWidgets)
      .filter(([, cfg]) => cfg.visible !== false)
      .map(([id, cfg]) => {
        const pos = DEFAULT_WIDGET_POSITIONS[id] ?? { x: 0, y: 0, w: 1, h: 1 };
        return {
          instanceId: `default-${id}`,
          widgetId: id,
          title: cfg.title,
          x: cfg.x ?? pos.x,
          y: cfg.y ?? pos.y,
          w: cfg.w ?? pos.w,
          h: cfg.h ?? pos.h,
          options: {},
        };
      });

    const width = Math.min(widget.defaultSize.w, GRID_COLS);
    const height = Math.max(MIN_WIDGET_H, widget.defaultSize.h);
    const placement = preferred
      ? {
          x: clamp(preferred.x, 0, GRID_COLS - width),
          y: Math.max(0, preferred.y),
          w: width,
          h: height,
        }
      : findNextWidgetPlacement(widget, [...canvasWidgetsRef.current, ...defaultOccupied]);
    const instance: CanvasWidgetInstance = {
      instanceId,
      widgetId: widget.id,
      title: widget.name,
      x: placement.x,
      y: placement.y,
      w: placement.w,
      h: placement.h,
      options: buildDefaultWidgetOptions(widget),
    };
    const resolved = resolveMonitoringLayout(
      [...canvasWidgetsRef.current, instance],
      elementConfigsRef.current,
      preferred ? instanceId : undefined
    );
    canvasWidgetsRef.current = resolved.widgets;
    elementConfigsRef.current = resolved.elements;
    setCanvasWidgets(resolved.widgets);
    setElementConfigs(resolved.elements);

    setSelectedWidgetId(instanceId);
    setSelectedElement(null);

    return instanceId;
  };

  const handleWidgetDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDraggingWidget(false);

    const widgetId = event.dataTransfer.getData("application/x-aim-monitoring-widget");
    const widget = widgetById[widgetId];
    const canvas = canvasRef.current;
    if (!widget || !canvas) return;

    const metrics = getCanvasMetrics();
    if (!metrics) return;

    const { rect, strideX, strideY, maxRows } = metrics;
    const x = clamp(Math.floor((event.clientX - rect.left - GRID_MARGIN_LEFT) / strideX), 0, GRID_COLS - 1);
    const y = clamp(Math.floor((event.clientY - rect.top - GRID_MARGIN_TOP) / strideY), 0, Math.max(0, maxRows - MIN_WIDGET_H));
    addWidgetToCanvas(widget, { x, y: clamp(y, 0, Math.max(0, maxRows - MIN_WIDGET_H)) });
  };

  const handleChatWidgetCommand = (prompt: string) => {
    const widgetId = resolveWidgetIdFromPrompt(prompt, widgets);
    if (!widgetId) {
      return { added: false };
    }

    const widget = widgetById[widgetId];
    if (!widget) {
      return { added: false };
    }

    addWidgetToCanvas(widget);
    return { added: true, widgetName: widget.name };
  };

  const handleChatPresetCommand = (presetId: string) => {
    const slot = [...MONITORING_BRAND_PRESETS, ...customBrandSlots].find((p) => p.id === presetId);
    if (!slot) return { applied: false };
    const nextBrand = cloneMonitoringBrand(slot);
    setBrand(nextBrand);
    setSelectedBrandPresetId(slot.id);
    setBrandSlotName(slot.label);
    return { applied: true, presetLabel: slot.label };
  };

  const startDefaultWidgetInteraction = (
    event: ReactPointerEvent<HTMLElement>,
    id: string,
    kind: WidgetInteractionKind,
    currentPos: { x: number; y: number; w: number; h: number },
    handle?: ResizeHandle
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setDefaultInteraction({
      kind, handle, elementId: id,
      startClientX: event.clientX, startClientY: event.clientY,
      startX: currentPos.x, startY: currentPos.y,
      startW: currentPos.w, startH: currentPos.h,
    });
  };

  useEffect(() => {
    if (!defaultInteraction) return;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    const HANDLE_CURSORS: Record<ResizeHandle, string> = {
      n: "ns-resize", ne: "nesw-resize", e: "ew-resize", se: "nwse-resize",
      s: "ns-resize", sw: "nesw-resize", w: "ew-resize", nw: "nwse-resize",
    };
    document.body.style.cursor = defaultInteraction.kind === "move" ? "grabbing"
      : HANDLE_CURSORS[defaultInteraction.handle ?? "se"] ?? "nwse-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = (event: PointerEvent) => {
      const metrics = getCanvasMetrics();
      if (!metrics) return;
      event.preventDefault();
      const dxCols = Math.round((event.clientX - defaultInteraction.startClientX) / metrics.strideX);
      const dyRows = Math.round((event.clientY - defaultInteraction.startClientY) / metrics.strideY);

      if (defaultInteraction.kind === "move") {
        const nextX = clamp(defaultInteraction.startX + dxCols, 0, GRID_COLS - defaultInteraction.startW);
        const nextY = clamp(defaultInteraction.startY + dyRows, 0, Math.max(0, metrics.maxRows - defaultInteraction.startH));
        updateDefaultWidgetConfig(defaultInteraction.elementId, { x: nextX, y: nextY });
      } else {
        const dh = defaultInteraction.handle;
        const canResizeE    = dh === "e"  || dh === "se" || dh === "ne";
        const canResizeS    = dh === "s"  || dh === "se" || dh === "sw";
        const canResizeN    = dh === "n"  || dh === "nw" || dh === "ne";
        const canResizeWest = dh === "w"  || dh === "nw" || dh === "sw";

        let nextX = defaultInteraction.startX, nextW = defaultInteraction.startW;
        let nextY = defaultInteraction.startY, nextH = defaultInteraction.startH;

        if (canResizeE) {
          nextW = clamp(defaultInteraction.startW + dxCols, 2, GRID_COLS - defaultInteraction.startX);
        } else if (canResizeWest) {
          const dxC = clamp(dxCols, -defaultInteraction.startX, defaultInteraction.startW - 2);
          nextX = defaultInteraction.startX + dxC;
          nextW = defaultInteraction.startW - dxC;
        }

        if (canResizeS) {
          nextH = clamp(defaultInteraction.startH + dyRows, 2, Math.max(2, metrics.maxRows - defaultInteraction.startY));
        } else if (canResizeN) {
          const dyR = clamp(dyRows, -defaultInteraction.startY, defaultInteraction.startH - 2);
          nextY = defaultInteraction.startY + dyR;
          nextH = defaultInteraction.startH - dyR;
        }

        updateDefaultWidgetConfig(defaultInteraction.elementId, { x: nextX, y: nextY, w: nextW, h: nextH });
      }
    };
    const draggedId = defaultInteraction.elementId;
    const handlePointerUp = () => {
      setDefaultInteraction(null);
      commitResolvedLayout(draggedId);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [commitResolvedLayout, defaultInteraction]);

  const updateSelectedWidget = (patch: Partial<CanvasWidgetInstance>) => {
    if (!selectedWidgetId) return;
    setCanvasWidgets((current) =>
      current.map((widget) => (widget.instanceId === selectedWidgetId ? { ...widget, ...patch } : widget))
    );
  };

  const removeSelectedWidget = () => {
    if (!selectedWidgetId) return;
    const nextWidgets = canvasWidgetsRef.current.filter((widget) => widget.instanceId !== selectedWidgetId);
    commitResolvedLayout(undefined, "compact", nextWidgets, elementConfigsRef.current);
    setSelectedWidgetId(null);
  };

  const hideSelectedDefaultWidget = () => {
    if (selectedElement?.kind !== "default-widget") return;
    const currentConfig =
      elementConfigsRef.current.defaultWidgets[selectedElement.id] ??
      DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets[selectedElement.id];
    const nextElements = {
      ...elementConfigsRef.current,
      defaultWidgets: {
        ...elementConfigsRef.current.defaultWidgets,
        [selectedElement.id]: {
          ...currentConfig,
          visible: false,
        },
      },
    };
    commitResolvedLayout(undefined, "compact", canvasWidgetsRef.current, nextElements);
    setSelectedElement(null);
  };

  const resetAllDefaultWidgets = () => {
    const nextElements = {
      ...elementConfigsRef.current,
      defaultWidgets: Object.fromEntries(
        Object.entries(elementConfigsRef.current.defaultWidgets).map(([id]) => [
          id,
          { ...DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets[id], x: undefined, y: undefined, w: undefined, h: undefined },
        ])
      ),
    };
    commitResolvedLayout(undefined, "compact", canvasWidgetsRef.current, nextElements);
  };

  const resetFullCanvas = () => {
    const nextElements = {
      ...elementConfigsRef.current,
      defaultWidgets: Object.fromEntries(
        Object.entries(elementConfigsRef.current.defaultWidgets).map(([id]) => [
          id,
          { ...DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets[id], x: undefined, y: undefined, w: undefined, h: undefined },
        ])
      ),
    };
    commitResolvedLayout(undefined, "compact", [], nextElements);
    setSelectedWidgetId(null);
    setSelectedElement(null);
  };

  const hideSelectedToolbarTarget = () => {
    if (selectedWidget) {
      removeSelectedWidget();
      return;
    }

    hideSelectedDefaultWidget();
  };

  const updateSelectedWidgetOption = (optionId: string, value: WidgetOptionValue) => {
    if (!selectedWidgetId) return;
    setCanvasWidgets((current) =>
      current.map((widget) =>
        widget.instanceId === selectedWidgetId
          ? {
              ...widget,
              options: {
                ...widget.options,
                [optionId]: value,
              },
            }
          : widget
      )
    );
  };

  const resetSelectedWidgetColors = () => {
    if (!selectedWidgetId) return;
    const colorOptionIds = ["bgColor", "borderColor", "textStrongColor", "textSoftColor", "accentColor", "accentSecondaryColor", "successColor", "warningColor", "dangerColor"];
    setCanvasWidgets((current) =>
      current.map((widget) => {
        if (widget.instanceId !== selectedWidgetId) return widget;
        const nextOptions = { ...widget.options };
        for (const key of colorOptionIds) delete nextOptions[key];
        return { ...widget, options: nextOptions };
      })
    );
  };

  const updateHeaderConfig = <Key extends keyof MonitoringElementConfigs["header"]>(
    key: Key,
    value: MonitoringElementConfigs["header"][Key]
  ) => {
    setElementConfigs((current) => ({
      ...current,
      header: {
        ...current.header,
        [key]: value,
      },
    }));
  };

  const updateSidebarConfig = <Key extends keyof MonitoringElementConfigs["sidebar"]>(
    key: Key,
    value: MonitoringElementConfigs["sidebar"][Key]
  ) => {
    setElementConfigs((current) => ({
      ...current,
      sidebar: {
        ...current.sidebar,
        [key]: value,
      },
    }));
  };

  const updateDefaultWidgetConfig = (
    id: string,
    patch: Partial<MonitoringElementConfigs["defaultWidgets"][string]>
  ) => {
    setElementConfigs((current) => {
      const currentConfig = current.defaultWidgets[id] ?? DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets[id];
      const next = {
        ...current,
        defaultWidgets: {
          ...current.defaultWidgets,
          [id]: {
            ...currentConfig,
            ...patch,
          },
        },
      };
      elementConfigsRef.current = next;
      return next;
    });

    if (patch.title && selectedElement?.id === id) {
      setSelectedElement((current) => (current ? { ...current, label: patch.title! } : current));
    }
  };

  const startWidgetInteraction = (
    event: ReactPointerEvent<HTMLElement>,
    instance: CanvasWidgetInstance,
    kind: WidgetInteractionKind,
    handle?: ResizeHandle
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedWidgetId(instance.instanceId);
    setSelectedElement(null);
    setInteraction({
      kind,
      handle,
      instanceId: instance.instanceId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: instance.x,
      startY: instance.y,
      startW: instance.w,
      startH: instance.h,
    });
  };

  useEffect(() => {
    if (!interaction) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    const HANDLE_CURSORS: Record<ResizeHandle, string> = {
      n: "ns-resize", ne: "nesw-resize", e: "ew-resize", se: "nwse-resize",
      s: "ns-resize", sw: "nesw-resize", w: "ew-resize", nw: "nwse-resize",
    };
    document.body.style.cursor =
      interaction.kind === "move"
        ? "grabbing"
        : HANDLE_CURSORS[interaction.handle ?? "se"] ?? "nwse-resize";
    document.body.style.userSelect = "none";

    const handlePointerMove = (event: PointerEvent) => {
      const metrics = getCanvasMetrics();
      if (!metrics) return;

      event.preventDefault();
      const dxCols = Math.round((event.clientX - interaction.startClientX) / metrics.strideX);
      const dyRows = Math.round((event.clientY - interaction.startClientY) / metrics.strideY);

      setCanvasWidgets((current) => {
        const next = current.map((widget) => {
          if (widget.instanceId !== interaction.instanceId) return widget;

          if (interaction.kind === "move") {
            const nextX = clamp(interaction.startX + dxCols, 0, GRID_COLS - interaction.startW);
            const nextY = clamp(interaction.startY + dyRows, 0, Math.max(0, metrics.maxRows - interaction.startH));
            return { ...widget, x: nextX, y: nextY };
          }

          const ih = interaction.handle;
          const canResizeE = ih === "e"  || ih === "se" || ih === "ne";
          const canResizeS = ih === "s"  || ih === "se" || ih === "sw";
          const canResizeN = ih === "n"  || ih === "nw" || ih === "ne";
          const canResizeW = ih === "w"  || ih === "nw" || ih === "sw";

          let nextX = interaction.startX, nextW = interaction.startW;
          let nextY = interaction.startY, nextH = interaction.startH;

          if (canResizeE) {
            nextW = clamp(interaction.startW + dxCols, MIN_WIDGET_W, GRID_COLS - interaction.startX);
          } else if (canResizeW) {
            const dxC = clamp(dxCols, -interaction.startX, interaction.startW - MIN_WIDGET_W);
            nextX = interaction.startX + dxC;
            nextW = interaction.startW - dxC;
          }

          if (canResizeS) {
            nextH = clamp(interaction.startH + dyRows, MIN_WIDGET_H, Math.max(MIN_WIDGET_H, metrics.maxRows - interaction.startY));
          } else if (canResizeN) {
            const dyR = clamp(dyRows, -interaction.startY, interaction.startH - MIN_WIDGET_H);
            nextY = interaction.startY + dyR;
            nextH = interaction.startH - dyR;
          }

          return { ...widget, x: nextX, y: nextY, w: nextW, h: nextH };
        });
        canvasWidgetsRef.current = next;
        return next;
      });
    };

    const draggedId = interaction.instanceId;
    const handlePointerUp = () => {
      setInteraction(null);
      commitResolvedLayout(draggedId);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [commitResolvedLayout, interaction]);

  const selectedInspectorLabel = selectedWidget?.title ?? selectedElement?.label ?? null;
  const selectedToolbarId = selectedWidget?.instanceId ?? selectedElement?.id ?? null;
  const selectedToolbarLabel = selectedWidget?.title ?? selectedElement?.label ?? null;
  const selectedToolbarType = selectedWidget ? "widget" : selectedElement ? "section" : null;

  const handleConfigureSelected = () => {
    if (!selectedWidget && !selectedElement) return;
    setRightInspectorMode("settings");
    setSettingsPanelScope("selection");
    setShowRightPanel(true);
  };

  const handleConnectSelectedData = () => {
    setRightInspectorMode("mapping");
    setShowRightPanel(true);
  };

  const clearSelection = () => {
    setSelectedWidgetId(null);
    setSelectedElement(null);
  };

  const renderSelectionScopeBanner = (label: string) => (
    <div className="-mx-4 -mt-4 border-b border-violet-400/20 bg-violet-500/10 px-4 py-3 text-violet-300">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <Settings2 className="h-3.5 w-3.5" />
        {label}
      </div>
    </div>
  );

  const renderHiddenDefaultWidgetManager = () => {
    const hiddenWidgets = Object.entries(elementConfigs.defaultWidgets)
      .filter(([, config]) => !config.visible)
      .map(([id, config]) => ({ id, title: config.title || DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets[id]?.title || id }));

    return (
      <MonitoringInspectorSection icon={EyeOff} title="Hidden Defaults">
        {hiddenWidgets.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-xs leading-5 text-white/35">
            숨겨진 기본 위젯이 없습니다. 기본 위젯은 삭제하지 않고 숨김 처리해 화면 구성을 자유롭게 조정합니다.
          </div>
        ) : (
          <div className="space-y-2">
            {hiddenWidgets.map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2.5"
              >
                <span className="min-w-0 truncate text-xs font-medium text-white/70">{widget.title}</span>
                <button
                  type="button"
                  onClick={() => updateDefaultWidgetConfig(widget.id, { visible: true })}
                  className="shrink-0 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 transition-colors hover:bg-cyan-500/15"
                >
                  다시 표시
                </button>
              </div>
            ))}
          </div>
        )}
      </MonitoringInspectorSection>
    );
  };

  const renderMappingInspectorContent = () => {
    return (
      <MonitoringInspectorFrame
        eyebrow="Connection"
        title="데이터 연결"
        description="AIM Monitoring 위젯과 복합 계측 데이터 소스를 연결합니다."
      >
        <MonitoringInspectorSection icon={Network} title="Data Connectors">
          {(solution.dataConnectors ?? []).map((connector) => (
            <div
              key={connector}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-white/65">{connector}</p>
                <p className="mt-0.5 text-[10px] text-white/25">AIM Monitoring source</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] text-emerald-300">
                연결 가능
              </span>
            </div>
          ))}
        </MonitoringInspectorSection>
        <MonitoringInspectorSection icon={Database} title="API Mapping">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[10px] text-white/35">
              <span>Widget field</span>
              <span className="text-white/15">→</span>
              <span>Data field</span>
            </div>
            {["riskScore", "sensorStatus", "eventLevel", "lastUpdated"].map((field, index) => (
              <div key={field} className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <span className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5 text-[10px] text-white/55">
                  {field}
                </span>
                <span className="text-white/20">→</span>
                <span className="rounded-lg border border-cyan-400/15 bg-cyan-400/10 px-2 py-1.5 text-[10px] text-cyan-200">
                  data.track{index + 1}
                </span>
              </div>
            ))}
          </div>
        </MonitoringInspectorSection>
      </MonitoringInspectorFrame>
    );
  };

  const renderBrandSettingsContent = () => {
    const slots = MONITORING_BRAND_PRESETS;
    const activeWidgets = Object.values(elementConfigs.defaultWidgets).filter((widget) => widget.visible).slice(0, 6);
    const moduleChips = activeWidgets.length > 0
      ? activeWidgets.map((widget) => widget.title)
      : ["설비 상태", "환경 위험", "작업자 안전", "실시간 알림"];

    return (
      <MonitoringInspectorFrame
        eyebrow="White Label"
        title="브랜드 설정"
        description="AIM Monitoring 화면의 고객사 톤, 서비스명, 납품형 프리셋을 관리합니다."
      >
        <MonitoringInspectorSection icon={Palette} title="Brand Slots">
          {slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => selectMonitoringBrandSlot(slot)}
              className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                selectedBrandPresetId === slot.id
                  ? "border-violet-400/35 bg-violet-500/15"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {[slot.primaryColor, slot.secondaryColor, slot.dangerColor, slot.successColor].map((color) => (
                    <span
                      key={color}
                      className="h-5 w-5 rounded-full border border-black/30"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white/75">{slot.label}</p>
                  <p className="mt-0.5 truncate text-[10px] text-white/35">{slot.description}</p>
                </div>
                {selectedBrandPresetId === slot.id && <Check className="h-4 w-4 text-violet-200" />}
              </div>
            </button>
          ))}
        </MonitoringInspectorSection>

        <MonitoringInspectorSection icon={Save} title="Save Selected Slot">
          <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-3">
            <MonitoringTextControl label="슬롯 이름" value={brandSlotName} onChange={setBrandSlotName} />
            <button
              type="button"
              onClick={saveMonitoringBrandSlot}
              className="mt-2 h-9 w-full rounded-xl border border-violet-300/20 bg-violet-500/25 text-xs font-semibold text-violet-100 transition-colors hover:bg-violet-500/35"
            >
              슬롯 저장
            </button>
            <button
              type="button"
              onClick={resetSelectedMonitoringBrandSlot}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[11px] font-medium text-white/40 transition-colors hover:border-white/15 hover:text-white/65"
            >
              <RotateCcw className="h-3 w-3" />
              선택 슬롯 기본값 복원
            </button>
          </div>
        </MonitoringInspectorSection>

        <MonitoringInspectorSection icon={BookmarkPlus} title="My Presets">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
            {customBrandSlots.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {customBrandSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/15 p-2">
                    <button
                      type="button"
                      onClick={() => selectMonitoringBrandSlot(slot)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-xs font-semibold text-white/65">{slot.label}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-white/30">{slot.tenantName}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMonitoringCustomPreset(slot.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 transition-colors hover:bg-red-500/10 hover:text-red-200"
                      aria-label={`${slot.label} 삭제`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={customBrandName}
                onChange={(event) => setCustomBrandName(event.target.value)}
                placeholder={`${brand.tenantName} ${brand.productName}`}
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-xs text-white/75 placeholder:text-white/20 focus:border-violet-400/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={saveMonitoringCustomPreset}
                className="rounded-lg border border-violet-400/30 bg-violet-500/15 px-3 text-xs font-semibold text-violet-100 transition-colors hover:bg-violet-500/25"
              >
                저장
              </button>
            </div>
          </div>
        </MonitoringInspectorSection>

        <MonitoringInspectorSection icon={Type} title="Identity">
          <MonitoringTextControl label="고객사" value={brand.tenantName} onChange={(tenantName) => updateMonitoringBrand({ tenantName })} />
          <MonitoringTextControl
            label="서비스명"
            value={brand.serviceName}
            onChange={(serviceName) => updateMonitoringBrand({ serviceName }, { syncHeader: true })}
          />
          <MonitoringTextControl label="제품명" value={brand.productName} onChange={(productName) => updateMonitoringBrand({ productName })} />
          <MonitoringTextControl
            label="헤더 타이틀"
            value={elementConfigs.header.title}
            onChange={(title) => {
              updateHeaderConfig("title", title);
              updateMonitoringBrand({ serviceName: title });
            }}
          />
        </MonitoringInspectorSection>

        <MonitoringInspectorSection icon={Palette} title="Logo">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-4 text-xs text-white/35 transition-all hover:border-violet-400/40 hover:text-white/60"
          >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="Tenant logo" className="h-8 max-w-[180px] object-contain" />
            ) : (
              <>
                <ImagePlus className="h-3.5 w-3.5" />
                고객사 로고 업로드
              </>
            )}
          </button>
          <MonitoringTextControl
            label="로고 URL"
            value={brand.logoUrl ?? ""}
            onChange={(logoUrl) => updateMonitoringBrand({ logoUrl }, { syncLogo: true })}
          />
          <MonitoringNumberControl
            label="로고 크기"
            min={20}
            max={200}
            unit="px"
            value={brand.logoSize}
            onChange={(logoSize) => updateMonitoringBrand({ logoSize })}
          />
        </MonitoringInspectorSection>

        <MonitoringInspectorSection icon={Palette} title="Color Tokens">
          <MonitoringColorControl label="Primary" value={brand.primaryColor} onChange={(primaryColor) => updateMonitoringBrand({ primaryColor })} />
          <MonitoringColorControl label="Secondary" value={brand.secondaryColor} onChange={(secondaryColor) => updateMonitoringBrand({ secondaryColor })} />
          <MonitoringColorControl label="Accent" value={brand.accentColor} onChange={(accentColor) => updateMonitoringBrand({ accentColor })} />
          <MonitoringColorControl label="Success" value={brand.successColor} onChange={(successColor) => updateMonitoringBrand({ successColor })} />
          <MonitoringColorControl label="Warning" value={brand.warningColor} onChange={(warningColor) => updateMonitoringBrand({ warningColor })} />
          <MonitoringColorControl label="Danger" value={brand.dangerColor} onChange={(dangerColor) => updateMonitoringBrand({ dangerColor })} />
          <MonitoringColorControl label="Background" value={brand.backgroundColor} onChange={(backgroundColor) => updateMonitoringBrand({ backgroundColor })} />
          <MonitoringColorControl label="Surface" value={brand.surfaceColor} onChange={(surfaceColor) => updateMonitoringBrand({ surfaceColor })} />
          <MonitoringColorControl label="Border" value={brand.borderColor} onChange={(borderColor) => updateMonitoringBrand({ borderColor })} />
          <MonitoringColorControl label="Text Strong" value={brand.textStrongColor ?? "#E2E8F0"} onChange={(textStrongColor) => updateMonitoringBrand({ textStrongColor })} />
          <MonitoringColorControl label="Text" value={brand.textColor ?? "#CBD5E1"} onChange={(textColor) => updateMonitoringBrand({ textColor })} />
          <MonitoringColorControl label="Text Soft" value={brand.textSoftColor ?? "#94A3B8"} onChange={(textSoftColor) => updateMonitoringBrand({ textSoftColor })} />
        </MonitoringInspectorSection>

        <MonitoringInspectorSection icon={Settings2} title="Style System">
          <MonitoringSelectControl
            label="Font"
            value={brand.fontFamily}
            options={MONITORING_FONT_OPTIONS}
            onChange={(fontFamily) => updateMonitoringBrand({ fontFamily })}
          />
          <MonitoringSelectControl
            label="Radius"
            value={brand.radius}
            options={MONITORING_RADIUS_OPTIONS}
            onChange={(radius) => updateMonitoringBrand({ radius: radius as BrandRadius })}
          />
          <MonitoringSelectControl
            label="Density"
            value={brand.density}
            options={MONITORING_DENSITY_OPTIONS}
            onChange={(density) => updateMonitoringBrand({ density: density as BrandDensity })}
          />
          <MonitoringSelectControl
            label="Map tone"
            value={brand.mapTone}
            options={MONITORING_MAP_TONE_OPTIONS}
            onChange={(mapTone) => updateMonitoringBrand({ mapTone: mapTone as BrandMapTone })}
          />
        </MonitoringInspectorSection>

        <button
          type="button"
          onClick={applyBrandToAllMonitoringRegions}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2.5 text-xs font-medium text-cyan-100 transition-colors hover:bg-cyan-500/15"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          모든 영역을 현재 브랜드 테마로 맞추기
        </button>
        <MonitoringResetButton label="기본 AIM Monitoring으로 복원" onClick={resetMonitoringBrand} />

        <MonitoringInspectorSection icon={LayoutDashboard} title="기본 위젯 표시">
          <div className="space-y-1">
            {Object.entries(elementConfigs.defaultWidgets).map(([id, config]) => (
              <MonitoringToggleControl
                key={id}
                label={config.title}
                checked={config.visible !== false}
                onChange={(visible) => updateDefaultWidgetConfig(id, { visible })}
              />
            ))}
          </div>
        </MonitoringInspectorSection>

        <MonitoringInspectorSection icon={RotateCcw} title="캔버스 초기화">
          <button
            type="button"
            onClick={resetAllDefaultWidgets}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-white/50 transition-colors hover:border-white/15 hover:text-white/75"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            기본 위젯 위치·크기 복원
          </button>
          <button
            type="button"
            onClick={() => { setCanvasWidgets([]); setSelectedWidgetId(null); }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2.5 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/15"
          >
            <Trash2 className="h-3.5 w-3.5" />
            추가 위젯 전체 삭제
          </button>
          <button
            type="button"
            onClick={resetFullCanvas}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/15"
          >
            <X className="h-3.5 w-3.5" />
            전체 초기화 (기본값으로)
          </button>
        </MonitoringInspectorSection>
      </MonitoringInspectorFrame>
    );
  };

  const renderRightInspectorContent = () => {
    if (rightInspectorMode === "mapping") {
      return renderMappingInspectorContent();
    }

    if (settingsPanelScope === "brand") {
      return renderBrandSettingsContent();
    }

    if (selectedWidget) {
      return (
        <MonitoringInspectorFrame
          eyebrow="Widget Inspector"
          title="Monitoring 위젯 설정"
          description="12컬럼 레이아웃에 배치된 Monitoring 위젯의 표시, 크기, 데이터 옵션을 조정합니다."
        >
          {renderSelectionScopeBanner(selectedWidget.title)}
          <MonitoringInspectorSection icon={Type} title="Widget Properties">
            <MonitoringTextControl label="타이틀" value={selectedWidget.title} onChange={(title) => updateSelectedWidget({ title })} />
            <MonitoringNumberControl
              label="가로 그리드"
              min={MIN_WIDGET_W}
              max={GRID_COLS - selectedWidget.x}
              value={selectedWidget.w}
              onChange={(w) => updateSelectedWidget({ w })}
            />
            <MonitoringNumberControl
              label="세로 그리드"
              min={MIN_WIDGET_H}
              max={50}
              value={selectedWidget.h}
              onChange={(h) => updateSelectedWidget({ h })}
            />
          </MonitoringInspectorSection>

          <MonitoringInspectorSection icon={Database} title="Data Binding">
            <MonitoringTextControl
              label="데이터 소스"
              value={
                WIDGET_CATEGORY_LABELS[String(selectedWidget.options.dataSource ?? selectedWidgetMeta?.dataSource ?? "")]
                  ?? String(selectedWidget.options.dataSource ?? selectedWidgetMeta?.dataSource ?? "Monitoring")
              }
              readOnly
            />
            {selectedWidgetOptionDefinitions.filter((o) => o.id !== "dataSource").map((option) => {
              const currentValue = selectedWidget.options[option.id] ?? option.defaultValue;

              if (option.type === "toggle") {
                return (
                  <MonitoringToggleControl
                    key={option.id}
                    label={option.label}
                    checked={Boolean(currentValue)}
                    onChange={(value) => updateSelectedWidgetOption(option.id, value)}
                  />
                );
              }

              if (option.type === "number") {
                return (
                  <MonitoringNumberControl
                    key={option.id}
                    label={option.label}
                    min={option.min ?? 0}
                    max={option.max ?? 100}
                    unit={option.unit}
                    value={Number(currentValue)}
                    onChange={(value) => updateSelectedWidgetOption(option.id, value)}
                  />
                );
              }

              return (
                <MonitoringSelectControl
                  key={option.id}
                  label={option.label}
                  value={String(currentValue)}
                  options={option.choices ?? []}
                  onChange={(value) => updateSelectedWidgetOption(option.id, value)}
                />
              );
            })}
          </MonitoringInspectorSection>

          <MonitoringInspectorSection icon={Palette} title="Panel Style">
            <MonitoringColorControl label="패널 배경" value={(selectedWidget?.options.bgColor as string | undefined) ?? brand.surfaceColor} onChange={(v) => updateSelectedWidgetOption("bgColor", v)} />
            <MonitoringColorControl label="패널 라인" value={(selectedWidget?.options.borderColor as string | undefined) ?? brand.borderColor} onChange={(v) => updateSelectedWidgetOption("borderColor", v)} />
          </MonitoringInspectorSection>

          <MonitoringInspectorSection icon={Type} title="텍스트 색상">
            <MonitoringColorControl label="주요 텍스트" value={(selectedWidget?.options.textStrongColor as string | undefined) ?? brand.textStrongColor ?? "#F8FAFC"} onChange={(v) => updateSelectedWidgetOption("textStrongColor", v)} />
            <MonitoringColorControl label="보조 텍스트" value={(selectedWidget?.options.textSoftColor as string | undefined) ?? brand.textSoftColor ?? "#94A3B8"} onChange={(v) => updateSelectedWidgetOption("textSoftColor", v)} />
          </MonitoringInspectorSection>

          {(WIDGET_COLOR_GROUPS[selectedWidgetMeta?.id ?? ""] ?? DEFAULT_WIDGET_GROUPS).includes("accent") && (
            <MonitoringInspectorSection icon={SlidersHorizontal} title="강조 색상">
              <MonitoringColorControl label="강조색 (Accent)" value={(selectedWidget?.options.accentColor as string | undefined) ?? brand.accentColor} onChange={(v) => updateSelectedWidgetOption("accentColor", v)} />
              {(WIDGET_COLOR_GROUPS[selectedWidgetMeta?.id ?? ""] ?? DEFAULT_WIDGET_GROUPS).includes("accentSecondary") && (
                <MonitoringColorControl label="보조 강조색" value={(selectedWidget?.options.accentSecondaryColor as string | undefined) ?? brand.secondaryColor} onChange={(v) => updateSelectedWidgetOption("accentSecondaryColor", v)} />
              )}
            </MonitoringInspectorSection>
          )}

          {(WIDGET_COLOR_GROUPS[selectedWidgetMeta?.id ?? ""] ?? DEFAULT_WIDGET_GROUPS).includes("status") && (
            <MonitoringInspectorSection icon={Activity} title="상태 색상">
              <MonitoringColorControl label="정상 (Success)" value={(selectedWidget?.options.successColor as string | undefined) ?? brand.successColor} onChange={(v) => updateSelectedWidgetOption("successColor", v)} />
              <MonitoringColorControl label="경고 (Warning)" value={(selectedWidget?.options.warningColor as string | undefined) ?? brand.warningColor} onChange={(v) => updateSelectedWidgetOption("warningColor", v)} />
              <MonitoringColorControl label="위험 (Danger)" value={(selectedWidget?.options.dangerColor as string | undefined) ?? brand.dangerColor} onChange={(v) => updateSelectedWidgetOption("dangerColor", v)} />
            </MonitoringInspectorSection>
          )}

          <MonitoringResetButton label="색상 초기화 (브랜드 기본값)" onClick={resetSelectedWidgetColors} />

          <button
            type="button"
            onClick={handleConnectSelectedData}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/15"
          >
            <Network className="h-3.5 w-3.5" />
            데이터 매핑 스튜디오 열기
          </button>

          <button
            type="button"
            onClick={removeSelectedWidget}
            className="flex h-9 w-full items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-xs font-medium text-red-200 transition-colors hover:bg-red-500/15"
          >
            위젯 삭제
          </button>
        </MonitoringInspectorFrame>
      );
    }

    if (selectedElement) {
      if (selectedElement.kind === "header") {
        return (
          <MonitoringInspectorFrame
            eyebrow="Header Inspector"
            title="상단 메뉴 설정"
            description="AI Studio 홈 화면 헤더의 표시 정보와 상태 배지 노출을 조정합니다."
          >
            {renderSelectionScopeBanner("상단 메뉴")}
            <MonitoringInspectorSection icon={ImagePlus} title="Logo">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-4 text-xs text-white/35 transition-all hover:border-violet-400/40 hover:text-white/60"
              >
                {(elementConfigs.header.logoUrl ?? brand.logoUrl) ? (
                  <img src={elementConfigs.header.logoUrl ?? brand.logoUrl!} alt="Tenant logo" className="h-8 max-w-[180px] object-contain" />
                ) : (
                  <>
                    <ImagePlus className="h-3.5 w-3.5" />
                    고객사 로고 업로드
                  </>
                )}
              </button>
              <MonitoringNumberControl
                label="로고 크기"
                min={20}
                max={200}
                unit="px"
                value={elementConfigs.header.logoSize ?? brand.logoSize}
                onChange={(logoSize) => updateHeaderConfig("logoSize", logoSize)}
              />
            </MonitoringInspectorSection>
            <MonitoringInspectorSection icon={Type} title="Identity">
              <MonitoringTextControl label="시스템 타이틀" value={elementConfigs.header.title} onChange={(title) => updateHeaderConfig("title", title)} />
              <MonitoringTextControl label="시간 표시" value={elementConfigs.header.timestampLabel} onChange={(timestampLabel) => updateHeaderConfig("timestampLabel", timestampLabel)} />
              <MonitoringTextControl label="사용자" value={elementConfigs.header.operatorName} onChange={(operatorName) => updateHeaderConfig("operatorName", operatorName)} />
              <MonitoringTextControl label="권한" value={elementConfigs.header.operatorRole} onChange={(operatorRole) => updateHeaderConfig("operatorRole", operatorRole)} />
            </MonitoringInspectorSection>
            <MonitoringInspectorSection icon={Palette} title="Header Tone">
              <MonitoringColorControl label="헤더 배경" value={elementConfigs.header.bgColor ?? brand.surfaceColor} onChange={(bgColor) => updateHeaderConfig("bgColor", bgColor)} />
              <MonitoringColorControl label="보더" value={elementConfigs.header.borderColor ?? brand.borderColor} onChange={(borderColor) => updateHeaderConfig("borderColor", borderColor)} />
              <MonitoringColorControl label="강조 색상" value={elementConfigs.header.accentColor ?? brand.accentColor} onChange={(accentColor) => updateHeaderConfig("accentColor", accentColor)} />
              <MonitoringColorControl label="제목 텍스트" value={elementConfigs.header.textStrongColor ?? brand.textStrongColor ?? "#F8FAFC"} onChange={(textStrongColor) => updateHeaderConfig("textStrongColor", textStrongColor)} />
              <MonitoringColorControl label="보조 텍스트" value={elementConfigs.header.textSoftColor ?? brand.textSoftColor ?? "#94A3B8"} onChange={(textSoftColor) => updateHeaderConfig("textSoftColor", textSoftColor)} />
            </MonitoringInspectorSection>
            <MonitoringInspectorSection icon={Settings2} title="Header Options">
              <MonitoringToggleControl label="시간 표시" checked={elementConfigs.header.showTimestamp} onChange={(showTimestamp) => updateHeaderConfig("showTimestamp", showTimestamp)} />
              <MonitoringToggleControl label="상태 배지 표시" checked={elementConfigs.header.showStatusBadges} onChange={(showStatusBadges) => updateHeaderConfig("showStatusBadges", showStatusBadges)} />
            </MonitoringInspectorSection>
            <MonitoringResetButton label="헤더를 브랜드 테마로 복원" onClick={() => setElementConfigs((current) => ({ ...current, header: { ...DEFAULT_MONITORING_ELEMENT_CONFIGS.header } }))} />
          </MonitoringInspectorFrame>
        );
      }

      if (selectedElement.kind === "sidebar") {
        return (
          <MonitoringInspectorFrame
            eyebrow="Navigation Inspector"
            title="좌측 메뉴 설정"
            description="AIM Monitoring 런타임 내비게이션의 확장 방식, 밀도, 로고와 푸터를 조정합니다."
          >
            {renderSelectionScopeBanner("좌측 메뉴")}
            <MonitoringInspectorSection icon={Palette} title="Navigation Tone">
              <MonitoringColorControl label="활성 메뉴" value={elementConfigs.sidebar.primaryColor ?? brand.primaryColor} onChange={(primaryColor) => updateSidebarConfig("primaryColor", primaryColor)} />
              <MonitoringColorControl label="아이콘/강조" value={elementConfigs.sidebar.accentColor ?? brand.accentColor} onChange={(accentColor) => updateSidebarConfig("accentColor", accentColor)} />
              <MonitoringColorControl label="사이드바 배경" value={elementConfigs.sidebar.bgColor ?? brand.surfaceColor} onChange={(bgColor) => updateSidebarConfig("bgColor", bgColor)} />
              <MonitoringColorControl label="라인 컬러" value={elementConfigs.sidebar.borderColor ?? brand.borderColor} onChange={(borderColor) => updateSidebarConfig("borderColor", borderColor)} />
              <MonitoringColorControl label="비활성 메뉴 텍스트" value={elementConfigs.sidebar.textColor ?? brand.textColor ?? "#CBD5E1"} onChange={(textColor) => updateSidebarConfig("textColor", textColor)} />
              <MonitoringColorControl label="섹션/버전 텍스트" value={elementConfigs.sidebar.textSoftColor ?? brand.textSoftColor ?? "#94A3B8"} onChange={(textSoftColor) => updateSidebarConfig("textSoftColor", textSoftColor)} />
            </MonitoringInspectorSection>
            <MonitoringInspectorSection icon={LayoutDashboard} title="Navigation Feel">
              <MonitoringSelectControl
                label="메뉴 스타일"
                value={elementConfigs.sidebar.expandMode}
                options={[
                  { value: "hover", label: "호버 확장" },
                  { value: "fixed", label: "항상 확장" },
                  { value: "collapsed", label: "아이콘 고정" },
                ]}
                onChange={(value) => updateSidebarConfig("expandMode", value as MonitoringElementConfigs["sidebar"]["expandMode"])}
              />
              <MonitoringSelectControl
                label="메뉴 밀도"
                value={elementConfigs.sidebar.menuDensity}
                options={[
                  { value: "comfortable", label: "기본" },
                  { value: "compact", label: "컴팩트" },
                ]}
                onChange={(value) => updateSidebarConfig("menuDensity", value as MonitoringElementConfigs["sidebar"]["menuDensity"])}
              />
              <MonitoringToggleControl label="푸터 표시" checked={elementConfigs.sidebar.showFooter} onChange={(showFooter) => updateSidebarConfig("showFooter", showFooter)} />
            </MonitoringInspectorSection>
            <MonitoringInspectorSection icon={Palette} title="Navigation Assets">
              <MonitoringTextControl label="푸터 문구" value={elementConfigs.sidebar.footerText} onChange={(footerText) => updateSidebarConfig("footerText", footerText)} />
            </MonitoringInspectorSection>
            <MonitoringResetButton label="좌측 메뉴 기본값 복원" onClick={() => setElementConfigs((current) => ({ ...current, sidebar: { ...DEFAULT_MONITORING_ELEMENT_CONFIGS.sidebar } }))} />
          </MonitoringInspectorFrame>
        );
      }

      if (selectedDefaultWidgetConfig) {
        const wid = selectedElement.id;
        const isStatusCard = wid === "summary-environment-risk" || wid === "summary-worker-safety";
        const isAlertCard = wid === "summary-alert-count";
        const isAnomalyChart = wid === "equipment-anomaly-chart";
        const isAccentCard = wid === "summary-equipment-status";
        const upd = (patch: Partial<import("./MonitoringLayoutCanvas").MonitoringDefaultWidgetConfig>) => updateDefaultWidgetConfig(wid, patch);
        return (
          <MonitoringInspectorFrame
            eyebrow="Panel Inspector"
            title="기본 대시보드 위젯 설정"
            description="위젯 표시명, 데이터 바인딩, 색상을 조정합니다. 변경사항이 즉시 캔버스에 반영됩니다."
          >
            {renderSelectionScopeBanner(selectedElement.label)}
            <MonitoringInspectorSection icon={Type} title="Widget Properties">
              <MonitoringTextControl label="표시 이름" value={selectedDefaultWidgetConfig.title} onChange={(title) => upd({ title })} />
              <MonitoringSelectControl
                label="데이터 바인딩"
                value={selectedDefaultWidgetConfig.dataBinding}
                options={[
                  { value: "ai-studio-demo", label: "AI Studio 데모 데이터" },
                  { value: "equipment-live", label: "설비 실시간 데이터" },
                  { value: "worker-safety-live", label: "작업자 안전 데이터" },
                  { value: "environment-risk-live", label: "환경 위험 데이터" },
                  { value: "sop-event-log", label: "SOP 이벤트 로그" },
                ]}
                onChange={(dataBinding) => upd({ dataBinding })}
              />
              <MonitoringToggleControl label="위젯 표시" checked={selectedDefaultWidgetConfig.visible} onChange={(visible) => upd({ visible })} />
            </MonitoringInspectorSection>

            {/* ── 위젯 타입별 컬러 컨트롤 ── */}
            {isAccentCard && (
              <MonitoringInspectorSection icon={Palette} title="차트 색상">
                <MonitoringColorControl label="주컬러 (스파크라인)" value={selectedDefaultWidgetConfig.accentColor} onChange={(accentColor) => upd({ accentColor })} />
              </MonitoringInspectorSection>
            )}

            {isStatusCard && (
              <MonitoringInspectorSection icon={Palette} title="상태 색상">
                <MonitoringColorControl label="상태색 (텍스트 + 라인)" value={selectedDefaultWidgetConfig.warningColor ?? brand.warningColor} onChange={(warningColor) => upd({ warningColor })} />
              </MonitoringInspectorSection>
            )}

            {isAlertCard && (
              <MonitoringInspectorSection icon={Palette} title="차트 색상">
                <MonitoringColorControl label="위험색 (바 차트)" value={selectedDefaultWidgetConfig.dangerColor ?? brand.dangerColor} onChange={(dangerColor) => upd({ dangerColor })} />
              </MonitoringInspectorSection>
            )}

            {isAnomalyChart && (
              <MonitoringInspectorSection icon={Palette} title="계열별 라인 색상">
                <MonitoringColorControl label="계열 1 — 진동" value={selectedDefaultWidgetConfig.series1Color ?? "#f97316"} onChange={(series1Color) => upd({ series1Color })} />
                <MonitoringColorControl label="계열 2 — 온도" value={selectedDefaultWidgetConfig.series2Color ?? "#ef4444"} onChange={(series2Color) => upd({ series2Color })} />
                <MonitoringColorControl label="계열 3 — 열화상" value={selectedDefaultWidgetConfig.series3Color ?? "#a855f7"} onChange={(series3Color) => upd({ series3Color })} />
                <MonitoringColorControl label="계열 4 — 가스" value={selectedDefaultWidgetConfig.series4Color ?? "#06b6d4"} onChange={(series4Color) => upd({ series4Color })} />
              </MonitoringInspectorSection>
            )}

            <MonitoringInspectorSection icon={SlidersHorizontal} title="Panel Style">
              <MonitoringColorControl label="패널 배경" value={selectedDefaultWidgetConfig?.bgColor ?? brand.surfaceColor} onChange={(bgColor) => upd({ bgColor })} />
              <MonitoringColorControl label="패널 라인" value={selectedDefaultWidgetConfig?.borderColor ?? brand.borderColor} onChange={(borderColor) => upd({ borderColor })} />
              <MonitoringColorControl label="주요 텍스트" value={selectedDefaultWidgetConfig?.textStrongColor ?? brand.textStrongColor ?? "#F8FAFC"} onChange={(textStrongColor) => upd({ textStrongColor })} />
              <MonitoringColorControl label="보조 텍스트" value={selectedDefaultWidgetConfig?.textSoftColor ?? brand.textSoftColor ?? "#94A3B8"} onChange={(textSoftColor) => upd({ textSoftColor })} />
            </MonitoringInspectorSection>

            <button
              type="button"
              onClick={handleConnectSelectedData}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/15"
            >
              <Network className="h-3.5 w-3.5" />
              데이터 매핑 스튜디오 열기
            </button>
            <MonitoringResetButton
              label="기본 위젯 설정 복원"
              onClick={() =>
                updateDefaultWidgetConfig(wid, {
                  ...(DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets[wid] ?? selectedDefaultWidgetConfig),
                  x: undefined,
                  y: undefined,
                  w: undefined,
                  h: undefined,
                })
              }
            />
          </MonitoringInspectorFrame>
        );
      }
    }

    return (
      <MonitoringInspectorFrame
        eyebrow="Selection Inspector"
        title="설정 대상을 선택하세요"
        description="위젯, 헤더, 좌측 메뉴를 선택한 뒤 플로팅 툴바의 설정을 누르면 해당 요소 설정이 열립니다."
      >
        <MonitoringInspectorSection icon={Settings2} title="대기 중">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-xs leading-relaxed text-white/45">
            브랜드 설정은 상단 편집 버튼에서만 열리도록 분리했습니다.
          </div>
        </MonitoringInspectorSection>
      </MonitoringInspectorFrame>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#080810] text-white">
      <input ref={logoInputRef} type="file" accept=".png,.svg,.jpg,.jpeg" className="hidden" onChange={handleMonitoringLogoUpload} />
      <MonitoringFloatingToolbar
        selectedId={selectedToolbarId}
        label={selectedToolbarLabel}
        type={selectedToolbarType}
        onConfigure={handleConfigureSelected}
        onConnectData={selectedWidget ? handleConnectSelectedData : undefined}
        onDelete={selectedWidget ? removeSelectedWidget : undefined}
        onClose={clearSelection}
      />
      <header className="relative flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0a14] px-4">
        <div className="relative z-20 flex min-w-0 items-center gap-3">
          <button type="button" onClick={handleGoHome} className="flex items-center gap-2.5">
            <img src="/img/Aimnis_Symbol.svg" alt="AIMNIS Logo" className="h-[24px] w-[24px] object-contain drop-shadow-xl" />
            <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>AIMNIS</span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
              style={{
                background: "oklch(60% 0.20 285 / .15)",
                color: "oklch(60% 0.20 285)",
                border: "1px solid oklch(60% 0.20 285 / .25)",
                letterSpacing: "0.08em",
              }}
            >
              Enterprise
            </span>
          </button>
          <span className="text-white/15">/</span>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center">
              <Activity className="h-4 w-4 text-[#94a3b8]" />
            </div>
            <span className="truncate text-xs font-medium text-white/80">{solution.name}</span>
          </div>
          <div className="relative z-20 ml-1 flex h-8 shrink-0 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => setCenterView("monitor")}
              className={cn(
                "flex h-7 w-[72px] shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-medium leading-none transition-colors",
                centerView === "monitor"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/[0.35] hover:text-white/60"
              )}
            >
              <TopIcon><Monitor className="h-3 w-3" /></TopIcon>
              <span className="block">모니터</span>
            </button>
            <button
              type="button"
              onClick={() => setCenterView("db")}
              className={cn(
                "relative flex h-7 w-[80px] shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-medium leading-none transition-colors",
                centerView === "db"
                  ? "bg-sky-500/15 text-sky-200 shadow-sm ring-1 ring-sky-400/20"
                  : "text-white/[0.35] hover:text-white/60"
              )}
            >
              <TopIcon><Database className="h-3 w-3" /></TopIcon>
              <span className="block">DB 수집</span>
              {connectedSourceIds.size > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setCenterView("mapping")}
              className={cn(
                "flex h-7 w-[92px] shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-medium leading-none transition-colors",
                centerView === "mapping"
                  ? "bg-emerald-500/15 text-emerald-200 shadow-sm ring-1 ring-emerald-400/20"
                  : "text-white/[0.35] hover:text-white/60"
              )}
            >
              <TopIcon><Network className="h-3 w-3" /></TopIcon>
              <span className="block">데이터 매핑</span>
            </button>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-[10px] text-emerald-400"
              >
                <Check className="h-3 w-3 shrink-0" /> 저장됨
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-auto absolute left-1/2 z-0 flex h-14 -translate-x-1/2 items-center gap-1">
          {MONITORING_EDITOR_NAV.map(({ href, label, Icon }) => {
            const isActive = label === "에디터";
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex h-14 min-w-[78px] shrink-0 items-center justify-center gap-1.5 border-b-2 px-3 text-xs transition-colors",
                  isActive
                    ? "border-violet-500 text-white"
                    : "border-transparent text-white/40 hover:text-white/70"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="monitoring-editor-nav-active"
                    className="absolute inset-[6px_4px] rounded-md bg-purple-500/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="relative h-3.5 w-3.5 shrink-0" />
                <span className="relative whitespace-nowrap leading-none">{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="relative z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const shouldOpenGlobalSettings = !showRightPanel || Boolean(selectedWidget || selectedElement) || rightInspectorMode !== "settings";
              clearSelection();
              setCenterView("monitor");
              setRightInspectorMode("settings");
              setSettingsPanelScope("brand");
              setShowRightPanel(shouldOpenGlobalSettings);
            }}
            className={cn(
              "flex h-8 w-[64px] shrink-0 items-center justify-center gap-1.5 rounded-lg border text-xs leading-none transition-colors",
              showRightPanel
                ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                : "border-white/10 bg-white/5 text-white/50 hover:text-white/80"
            )}
          >
            <TopIcon><Edit3 className="h-3 w-3" /></TopIcon>
            <span className="block">편집</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex h-8 w-[64px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs leading-none text-white/50 transition-colors hover:text-white/80"
          >
            <TopIcon><Save className="h-3 w-3" /></TopIcon>
            <span className="block">저장</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="flex h-8 w-[64px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs leading-none text-white/50 transition-colors hover:text-white/80"
          >
            <TopIcon>{isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}</TopIcon>
            <span className="block">{isFullscreen ? "축소" : "확대"}</span>
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="flex h-8 w-[86px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-xs leading-none text-white shadow-lg shadow-violet-500/20 transition-colors hover:from-violet-500 hover:to-indigo-500"
          >
            <TopIcon><Rocket className="h-3 w-3" /></TopIcon>
            <span className="block">퍼블리시</span>
          </button>
        </div>
      </header>

      {/* ── 퍼블리시 모달 ── */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">
                    {publishDone ? "✅ 퍼블리시 완료" : "프로젝트 퍼블리시"}
                  </h2>
                  <p className="mt-0.5 text-xs text-white/40">
                    {publishDone ? "프로젝트가 등록됐습니다" : "프로젝트 정보를 입력하세요"}
                  </p>
                </div>
                <button onClick={() => setShowPublishModal(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {!publishDone ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">프로젝트명</label>
                      <input value={publishForm.name} onChange={e => setPublishForm(p => ({ ...p, name: e.target.value }))}
                        placeholder={solution.name}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-colors" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">고객사 (선택)</label>
                      <input value={publishForm.client} onChange={e => setPublishForm(p => ({ ...p, client: e.target.value }))}
                        placeholder="예: KEPCO, POSCO, 현대제철..."
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-colors" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">버전 메모 (선택)</label>
                      <input value={publishForm.versionNote} onChange={e => setPublishForm(p => ({ ...p, versionNote: e.target.value }))}
                        placeholder="변경 사항을 간략히 기록하세요"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-colors" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                    <Activity className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
                    <span className="text-xs text-white/50">솔루션: <span className="text-white/70">{solution.name}</span></span>
                  </div>
                  <button onClick={handleConfirmPublish}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all">
                    <Rocket className="h-4 w-4" />
                    프로젝트에 배포하기
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    ✓ 프로젝트 DB에 등록 완료
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowPublishModal(false); router.push("/projects"); }}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-white/70 hover:text-white transition-colors">
                      프로젝트 보기
                    </button>
                    <button onClick={() => { setShowPublishModal(false); router.push("/monitoring"); }}
                      className="flex-1 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 py-2.5 text-xs font-bold text-white hover:from-sky-500 hover:to-blue-500 transition-all">
                      AIM Monitoring 실행
                    </button>
                  </div>
                  <button onClick={() => setShowPublishModal(false)}
                    className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors py-1">
                    닫기
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <motion.div
          data-monitoring-left-panel
          animate={{ marginLeft: showRightPanel ? -(leftPanelWidth - 70) : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ position: "relative", display: "flex", flexShrink: 0, height: "100%", minHeight: 0, width: leftPanelWidth }}
        >
        <aside className="flex min-h-0 w-full flex-shrink-0 flex-col overflow-hidden bg-[#0a0a14]">
          <div className="flex items-center gap-2.5 border-b border-white/5 px-3 py-2">
            <img src="/img/ch6.png" alt="에임이" className="h-8 w-8 flex-shrink-0 rounded-full object-cover ring-1 ring-violet-500/25" />
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-tight text-white/80">에임이 · AIMI</p>
              <p className="text-[10px] leading-tight text-white/30">AIM Monitoring 어시스턴트</p>
            </div>
          </div>
          <div className="border-b border-white/5 p-2">
            <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => setLeftTab("chat")}
                className={cn(
                  "flex h-8 items-center justify-center gap-1.5 rounded-md text-xs transition-colors",
                  leftTab === "chat" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/65"
                )}
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                채팅
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("widgets")}
                className={cn(
                  "flex h-8 items-center justify-center gap-1.5 rounded-md text-xs transition-colors",
                  leftTab === "widgets" ? "bg-white/10 text-white" : "text-white/35 hover:text-white/65"
                )}
              >
                <Grip className="h-3.5 w-3.5" />
                위젯
              </button>
            </div>
          </div>

          <div className={cn("min-h-0 flex-1 overflow-hidden", leftTab !== "chat" && "hidden")}>
            <MonitoringChatPanel solutionId={solution.id} onWidgetCommand={handleChatWidgetCommand} onPresetCommand={handleChatPresetCommand} />
          </div>
          {leftTab === "widgets" && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* 검색창 */}
              <div className="sticky top-0 z-10 bg-[#0a0a14] px-3 pb-2 pt-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                  <input
                    type="text"
                    value={widgetSearch}
                    onChange={(e) => setWidgetSearch(e.target.value)}
                    placeholder="위젯 검색..."
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pl-8 pr-7 text-xs text-white/75 placeholder:text-white/20 focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20"
                  />
                  {widgetSearch && (
                    <button
                      type="button"
                      onClick={() => setWidgetSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-white/30">
                  드래그하면 12그리드에 배치됩니다.
                </p>
              </div>

              <div className="space-y-4 px-3 pb-3">
                {Object.keys(filteredLibraryGroups).length === 0 ? (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] py-8 text-center text-xs text-white/25">
                    검색 결과가 없습니다
                  </div>
                ) : (
                  Object.entries(filteredLibraryGroups).map(([group, groupWidgets]) => (
                    <section key={group}>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">
                        {WIDGET_CATEGORY_LABELS[group] ?? group}
                      </p>
                      <div className="grid grid-cols-2 gap-[7px]">
                        {groupWidgets.map((widget) => {
                          const used = usedWidgetIds.has(widget.id);
                          return (
                            <button
                              key={widget.id}
                              type="button"
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData("application/x-aim-monitoring-widget", widget.id);
                                event.dataTransfer.effectAllowed = "copy";
                                setIsDraggingWidget(true);
                              }}
                              onDragEnd={() => setIsDraggingWidget(false)}
                              title={widget.name}
                              className={cn(
                                "group relative flex flex-col rounded-[9px] p-[7px] text-left transition-all duration-150 hover:border-[#3b82f6]",
                                used
                                  ? "border border-[rgba(59,130,246,.3)] bg-[rgba(59,130,246,.06)]"
                                  : "border border-white/[0.07] bg-[#0f1623]"
                              )}
                            >
                              <MonitoringWidgetThumbnail widget={widget} />
                              <span
                                className="mt-2 line-clamp-2 text-[11px] font-semibold leading-snug text-[#e2e8f0]"
                                style={{ minHeight: "2.6em" }}
                              >
                                {widget.name}
                              </span>
                              <div className="mt-[5px] flex items-center justify-between">
                                <span className="font-mono text-[9px] text-white/[0.28]">
                                  {widget.defaultSize.w}x{widget.defaultSize.h}
                                </span>
                                <span
                                  className={cn(
                                    "flex h-4 w-4 items-center justify-center rounded-[4px]",
                                    used ? "bg-[rgba(91,143,214,.18)]" : "bg-white/[0.04]"
                                  )}
                                >
                                  {used
                                    ? <Edit3 className="h-[9px] w-[9px] text-[#3b82f6]" strokeWidth={2.2} />
                                    : <Plus  className="h-[9px] w-[9px] text-white/[0.4]" strokeWidth={2.2} />
                                  }
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))
                )}
              </div>
            </div>
          )}
        </aside>

        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 flex cursor-pointer items-center justify-end bg-black/60 backdrop-blur-[1px] group"
              style={{ paddingRight: 14 }}
              onClick={() => setShowRightPanel(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/20 transition-opacity duration-150 group-hover:opacity-100">
                <ChevronLeft className="h-5 w-5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </motion.div>

        {/* ── 좌측 패널 리사이즈 핸들 — 1px 레이아웃, ±5px 히트영역 ── */}
        <div
          className="group relative flex-shrink-0 cursor-col-resize"
          style={{ width: 1, zIndex: 20 }}
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startW = leftPanelWidth;
            const onMove = (ev: MouseEvent) => {
              setLeftPanelWidth(Math.min(480, Math.max(200, startW + ev.clientX - startX)));
            };
            const onUp = () => {
              document.removeEventListener("mousemove", onMove);
              document.removeEventListener("mouseup", onUp);
              document.body.style.cursor = "";
              document.body.style.userSelect = "";
            };
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
            document.addEventListener("mousemove", onMove);
            document.addEventListener("mouseup", onUp);
          }}
        >
          <div className="absolute inset-0 bg-white/[0.07] transition-colors duration-150 group-hover:bg-violet-500/60" />
          <div className="absolute inset-y-0" style={{ left: -5, right: -5 }} />
        </div>

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0b1120]">
          {/* ── 중앙 뷰 컨테이너 ── */}
          <div className="relative min-h-0 flex-1 overflow-hidden">
          {centerView === "db" ? (
            <MonitoringDBCanvas
              initialConnectedIds={connectedSourceIds}
              onSourceConnect={(id, name, endpoint, fields) => {
                setConnectedSourceIds((prev) => new Set([...Array.from(prev), id]));
                setConnectedSourceMeta((prev) => ({ ...prev, [id]: { name, endpoint, fields } }));
              }}
              onNavigateToMapping={() => setCenterView("mapping")}
            />
          ) : centerView === "monitor" ? (
            <MonitoringLayoutCanvas
              canvasRef={canvasRef}
              customWidgets={canvasWidgets}
              widgetById={widgetById}
              widgetLiveData={widgetLiveData}
              elementConfigs={elementConfigs}
              brand={brand}
              selectedWidgetId={selectedWidgetId}
              selectedElementId={selectedElement?.id ?? null}
              isDraggingWidget={isDraggingWidget}
              interactionActive={Boolean(interaction) || Boolean(defaultInteraction)}
              layoutPriorityId={interaction?.instanceId ?? defaultInteraction?.elementId ?? null}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes("application/x-aim-monitoring-widget")) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "copy";
                }
              }}
              onDrop={handleWidgetDrop}
              onSelectWidget={(instanceId) => {
                setSelectedWidgetId(instanceId);
                setSelectedElement(null);
                if (showRightPanel && rightInspectorMode === "settings") {
                  setSettingsPanelScope("selection");
                }
              }}
              onSelectElement={(element) => {
                setSelectedWidgetId(null);
                setSelectedElement(element);
                if (showRightPanel && rightInspectorMode === "settings") {
                  setSettingsPanelScope("selection");
                }
              }}
              onStartWidgetInteraction={startWidgetInteraction}
              onStartDefaultWidgetInteraction={startDefaultWidgetInteraction}
              onHideDefaultWidget={(id) => updateDefaultWidgetConfig(id, { visible: false })}
              addedPages={addedPages}
              onOpenPageBuilder={() => setIsPageBuilderOpen(true)}
              navigateToPage={pendingNavPage}
              onNavigated={() => setPendingNavPage(null)}
              onRemovePage={removePage}
            />
          ) : (
            <MonitoringMappingCanvas
              mappingEdges={monitoringMappingEdges}
              addMappingEdge={(edge) => setMonitoringMappingEdges((prev) => prev.some((e) => e.id === edge.id) ? prev : [...prev, edge])}
              removeMappingEdge={(id) => setMonitoringMappingEdges((prev) => prev.filter((e) => e.id !== id))}
              canvasWidgets={canvasWidgets.map((w) => ({
                instanceId: w.instanceId,
                widgetId: w.widgetId,
                title: w.title,
                widgetType: widgetById[w.widgetId]?.type,
              }))}
              savedNodePositions={mappingNodePositions}
              onNodePositionsChange={setMappingNodePositions}
              connectedSourceIds={connectedSourceIds}
              connectedSourceMeta={connectedSourceMeta}
              activePageLabel="홈 대시보드"
            />
          )}
          </div>

          {/* ── 페이지 추가 패널 — main 안에서 absolute, 탑메뉴·좌패널 제외 ── */}
          <AnimatePresence>
            {isPageBuilderOpen && (
              <MonitoringPageBuilder
                addedPageKeys={new Set(addedPages.map((p) => p.key))}
                onClose={() => setIsPageBuilderOpen(false)}
                onCreatePage={(key: string, config: MonitoringPageConfig) => {
                  addPage(key, config);
                  setPendingNavPage(config.pageTitle || key);
                  setIsPageBuilderOpen(false);
                }}
              />
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
        {showRightPanel && (
          <motion.aside
            key="monitoring-right-panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            data-monitoring-inspector
            className="flex h-full min-h-0 flex-shrink-0 flex-col overflow-hidden border-l border-white/5 bg-[#0a0a14]"
          >
            <MonitoringInspectorHeader
              icon={SlidersHorizontal}
              label={
                rightInspectorMode === "mapping"
                  ? "연결 상태"
                  : settingsPanelScope === "selection"
                    ? selectedInspectorLabel ?? "요소 설정"
                    : "화이트 라벨"
              }
              selectedLabel={selectedInspectorLabel}
            />
            <div className="flex border-b border-white/5 bg-white/[0.015] p-1">
              <button
                type="button"
                onClick={() => {
                  setRightInspectorMode("settings");
                  setSettingsPanelScope("brand");
                }}
                className={cn(
                  "flex h-8 flex-[1.25] items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  rightInspectorMode === "settings"
                    ? "border-violet-400/20 bg-violet-500/15 text-violet-200"
                    : "text-white/35 hover:bg-white/[0.04] hover:text-white/55"
                )}
              >
                <SlidersHorizontal className="h-3 w-3 shrink-0" />
                브랜드 설정
              </button>
              <button
                type="button"
                onClick={() => {
                  setRightInspectorMode("mapping");
                }}
                className={cn(
                  "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  rightInspectorMode === "mapping"
                    ? "border-emerald-400/20 bg-emerald-500/12 text-emerald-200"
                    : "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
                )}
              >
                <Network className="h-3 w-3 shrink-0" />
                연결
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {renderRightInspectorContent()}
            </div>
          </motion.aside>
        )}
        </AnimatePresence>
      </div>

      {/* 풀스크린 오버레이 */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#080810]"
          >
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:text-white"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <MonitoringLayoutCanvas
              canvasRef={fullscreenCanvasRef}
              customWidgets={canvasWidgets}
              widgetById={widgetById}
              widgetLiveData={widgetLiveData}
              elementConfigs={elementConfigs}
              brand={brand}
              selectedWidgetId={selectedWidgetId}
              selectedElementId={null}
              isDraggingWidget={false}
              interactionActive={false}
              layoutPriorityId={null}
              onDragOver={() => {}}
              onDrop={() => {}}
              onSelectWidget={(id) => { setSelectedWidgetId(id); setIsFullscreen(false); }}
              onSelectElement={() => {}}
              onStartWidgetInteraction={() => {}}
              hidePageManagement
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
