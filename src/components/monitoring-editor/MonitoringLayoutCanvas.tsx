"use client";

import { useEffect, useMemo, useState, type CSSProperties, type DragEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { motion } from "framer-motion";
import { Activity, Bell, Info, MoreVertical, Triangle, UserCheck, Wind } from "lucide-react";
import type { BrandSettings } from "@/lib/brandPresets";
import type { SolutionWidget } from "@/lib/solutionLoader";
import { resolveMonitoringGrid } from "@/lib/monitoringLayoutEngine";
import Sidebar from "@/monitoring-app/components/Sidebar";
import Header from "@/monitoring-app/components/Header";
import MainChartSection from "@/monitoring-app/components/MainChartSection";
import WorkerSafetySection from "@/monitoring-app/components/WorkerSafetySection";
import EnvironmentStatusWidget from "@/monitoring-app/components/EnvironmentStatusWidget";
import RealtimeAlertList from "@/monitoring-app/components/RealtimeAlertList";
import ActionProgressWidget from "@/monitoring-app/components/ActionProgressWidget";
import SystemStatusWidget from "@/monitoring-app/components/SystemStatusWidget";
import MonitoringWidgetRenderer from "./MonitoringWidgetRenderer";
import IntegratedDashboard from "@/monitoring-app/pages/IntegratedDashboard";
import EquipmentDiagnosis from "@/monitoring-app/pages/EquipmentDiagnosis";
import EnvironmentDiagnosis from "@/monitoring-app/pages/EnvironmentDiagnosis";
import WorkerSafety from "@/monitoring-app/pages/WorkerSafety";
import AlertsEvents from "@/monitoring-app/pages/AlertsEvents";
import Report from "@/monitoring-app/pages/Report";
import SettingsPage from "@/monitoring-app/pages/Settings";

type WidgetOptionValue = string | number | boolean;

export interface MonitoringCanvasWidgetInstance {
  instanceId: string;
  widgetId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  options: Record<string, WidgetOptionValue>;
}

export interface MonitoringEditableElement {
  id: string;
  label: string;
  kind: "header" | "sidebar" | "default-widget";
}

export interface MonitoringHeaderConfig {
  title: string;
  showStatusBadges: boolean;
  showTimestamp: boolean;
  timestampLabel: string;
  operatorName: string;
  operatorRole: string;
  logoUrl?: string;
  logoSize?: number;
  bgColor?: string;
  borderColor?: string;
  accentColor?: string;
  textStrongColor?: string;
  textSoftColor?: string;
}

export interface MonitoringSidebarConfig {
  logoUrl: string;
  expandMode: "hover" | "fixed" | "collapsed";
  menuDensity: "comfortable" | "compact";
  showFooter: boolean;
  footerText: string;
  bgColor?: string;
  borderColor?: string;
  primaryColor?: string;
  accentColor?: string;
  textColor?: string;
  textSoftColor?: string;
}

export interface MonitoringDefaultWidgetConfig {
  title: string;
  dataBinding: string;
  accentColor: string;
  visible: boolean;
  bgColor?: string;
  borderColor?: string;
  textStrongColor?: string;
  textSoftColor?: string;
  warningColor?: string;
  dangerColor?: string;
  series1Color?: string;
  series2Color?: string;
  series3Color?: string;
  series4Color?: string;
  /* 사용자가 이동/크기조절한 경우 저장 — 없으면 기본값 사용 */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export interface MonitoringElementConfigs {
  header: MonitoringHeaderConfig;
  sidebar: MonitoringSidebarConfig;
  defaultWidgets: Record<string, MonitoringDefaultWidgetConfig>;
}

interface MonitoringLayoutCanvasProps {
  canvasRef: RefObject<HTMLDivElement>;
  customWidgets: MonitoringCanvasWidgetInstance[];
  widgetById: Record<string, SolutionWidget>;
  widgetLiveData?: Record<string, Record<string, unknown>>;
  elementConfigs: MonitoringElementConfigs;
  brand?: BrandSettings;
  selectedWidgetId: string | null;
  selectedElementId: string | null;
  isDraggingWidget: boolean;
  interactionActive: boolean;
  layoutPriorityId?: string | null;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onSelectWidget: (instanceId: string) => void;
  onSelectElement: (element: MonitoringEditableElement) => void;
  onStartWidgetInteraction: (
    event: ReactPointerEvent<HTMLElement>,
    instance: MonitoringCanvasWidgetInstance,
    kind: "move" | "resize",
    handle?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"
  ) => void;
  onStartDefaultWidgetInteraction?: (
    event: ReactPointerEvent<HTMLElement>,
    id: string,
    kind: "move" | "resize",
    currentPos: { x: number; y: number; w: number; h: number },
    handle?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"
  ) => void;
  onHideDefaultWidget?: (id: string) => void;
  addedPages?: import("@/store/monitoringPagesStore").MonitoringPage[];
  hidePageManagement?: boolean;
  onOpenPageBuilder?: () => void;
  onRemovePage?: (key: string) => void;
  navigateToPage?: string | null;
  onNavigated?: () => void;
}

interface LayoutItem {
  id: string;
  source: "ai-studio-default" | "widget-library";
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  render: () => React.ReactNode;
  widgetInstance?: MonitoringCanvasWidgetInstance;
}

const GRID_COLUMNS = 12;
const ROW_HEIGHT = 44;
const GRID_GAP = 16;
const GRID_PADDING_TOP = 20;
const GRID_PADDING_RIGHT = 20;
const GRID_PADDING_BOTTOM = 20;
const GRID_PADDING_LEFT = 28;
const GUARD_EDIT_CYAN = "#00C8FF";

function hexLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const DEFAULT_MONITORING_BRAND_TOKENS = {
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
  fontFamily: "Noto Sans KR",
};

const DEFAULT_WIDGET_TITLES: Record<string, string> = {
  "summary-equipment-status": "전체 설비 상태",
  "summary-environment-risk": "환경 위험 상태",
  "summary-worker-safety": "작업자 안전 상태",
  "summary-alert-count": "오늘의 알림 건수",
  "equipment-anomaly-chart": "설비 이상 현황",
  "worker-safety-overview": "작업자 안전 현황",
  "environment-diagnosis": "환경 진단",
  "realtime-alerts": "실시간 알림",
  "action-progress": "점검·조치 현황",
  "system-status": "시스템 상태",
};

export const DEFAULT_MONITORING_ELEMENT_CONFIGS: MonitoringElementConfigs = {
  header: {
    title: "AIoT 복합 계측 모니터링",
    showStatusBadges: true,
    showTimestamp: true,
    timestampLabel: "2026.05.30 (토) 08:24:36",
    operatorName: "홍길동",
    operatorRole: "관리자",
  },
  sidebar: {
    logoUrl: "/img/AIM%20Mornitering2.svg",
    expandMode: "hover",
    menuDensity: "comfortable",
    showFooter: true,
    footerText: "© 2026 KOWEPO.",
  },
  defaultWidgets: Object.fromEntries(
    Object.entries(DEFAULT_WIDGET_TITLES).map(([id, title]) => [
      id,
      {
        title,
        dataBinding: "ai-studio-demo",
        accentColor: "#3b82f6",
        visible: true,
      },
    ])
  ),
};

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

// priorityId: 드래그 중인 위젯 ID — 같은 y 위치에서 이 위젯이 항상 먼저 배치됨
// → 기존 위젯들이 드래그된 위젯에게 자리를 양보하는 "자연스러운 배치" 구현
function resolveLayout(items: LayoutItem[], priorityId?: string) {
  return resolveMonitoringGrid(items, {
    columns: GRID_COLUMNS,
    mode: "push",
    priorityId,
    sourceOrder: { "widget-library": 0, "ai-studio-default": 1 },
  });
}

function SummaryCard({
  title,
  icon: Icon,
  value,
  unit,
  sub,
  tone = "white",
  accentColor,
  brand,
}: {
  title: string;
  icon: typeof Activity;
  value: string;
  unit?: string;
  sub: string;
  tone?: "white" | "yellow" | "danger";
  accentColor?: string;
  brand: typeof DEFAULT_MONITORING_BRAND_TOKENS;
}) {
  const lineColor =
    tone === "yellow" ? (brand.warningColor ?? "#eab308") :
    tone === "danger" ? (brand.dangerColor ?? "#ef4444") :
    (accentColor ?? "#3b82f6");

  return (
    <div
      className="flex h-full flex-col justify-between rounded-lg border p-5 shadow-sm transition-colors"
      style={{
        backgroundColor: brand.surfaceColor,
        borderColor: brand.borderColor,
        color: brand.textColor,
      }}
    >
      <div className="mb-2 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: brand.textColor }}>
          <Icon size={16} style={{ color: brand.textSoftColor }} strokeWidth={1.5} />
          {title}
          <Info size={14} className="ml-1" style={{ color: brand.textSoftColor }} />
        </div>
        <MoreVertical size={16} style={{ color: brand.textSoftColor }} />
      </div>
      <div className="flex flex-1 items-end justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1">
            <span
              className="text-[28px] font-bold leading-none"
              style={{ color: tone === "yellow" ? brand.warningColor : tone === "danger" ? brand.dangerColor : brand.textStrongColor }}
            >
              {value}
            </span>
            {unit ? <span className="text-sm font-normal" style={{ color: brand.textSoftColor }}>{unit}</span> : null}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: brand.textSoftColor }}>
            <Triangle
              size={10}
              style={{
                color: tone === "yellow" ? brand.warningColor : tone === "danger" ? brand.dangerColor : brand.successColor,
                fill: tone === "yellow" ? brand.warningColor : tone === "danger" ? brand.dangerColor : brand.successColor,
              }}
            />
            <span className="font-medium" style={{ color: tone === "yellow" ? brand.warningColor : tone === "danger" ? brand.dangerColor : brand.successColor }}>{sub}</span>
            <span>(어제 대비)</span>
          </div>
        </div>
        <svg viewBox="0 0 120 36" preserveAspectRatio="none" className="h-8 w-28">
          <polyline points="0,24 12,21 24,23 36,18 48,21 60,15 72,19 84,14 96,18 108,15 120,17" fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function DefaultItemFrame({
  selected,
  children,
  onSelect,
  accentColor,
  label,
  selectionId,
}: {
  selected: boolean;
  children: React.ReactNode;
  onSelect: () => void;
  accentColor: string;
  label: string;
  selectionId: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      data-monitoring-selection-id={selectionId}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button,a,input,textarea,select")) return;
        onSelect();
      }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative h-full min-h-0 rounded-lg transition-all"
      style={{
        outline: selected ? `2px solid ${GUARD_EDIT_CYAN}` : hovered ? "1px dashed rgba(0,212,255,0.35)" : "2px solid transparent",
        outlineOffset: "-2px",
        boxShadow: selected ? `0 0 0 1px ${accentColor}66` : undefined,
      }}
    >
      {hovered && !selected && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: [
              "linear-gradient(rgba(0,212,255,0.055) 1px, transparent 1px)",
              "linear-gradient(90deg, rgba(0,212,255,0.055) 1px, transparent 1px)",
            ].join(","),
            backgroundSize: "8px 8px",
          }}
        />
      )}
      {selected && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 flex items-center gap-1 rounded-br-md px-2 py-0.5"
          style={{
            background: GUARD_EDIT_CYAN,
            color: "#021018",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export default function MonitoringLayoutCanvas({
  canvasRef,
  customWidgets,
  widgetById,
  widgetLiveData = {},
  elementConfigs,
  brand,
  selectedWidgetId,
  selectedElementId,
  isDraggingWidget,
  interactionActive,
  layoutPriorityId = null,
  onDragOver,
  onDrop,
  onSelectWidget,
  onSelectElement,
  onStartWidgetInteraction,
  onStartDefaultWidgetInteraction,
  onHideDefaultWidget,
  addedPages = [],
  hidePageManagement = false,
  onOpenPageBuilder,
  onRemovePage,
  navigateToPage,
  onNavigated,
}: MonitoringLayoutCanvasProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("홈");

  useEffect(() => {
    if (navigateToPage) {
      setCurrentPage(navigateToPage);
      onNavigated?.();
    }
  }, [navigateToPage]);
  const brandTokens = useMemo(
    () => ({
      ...DEFAULT_MONITORING_BRAND_TOKENS,
      ...(brand ?? {}),
      textStrongColor: brand?.textStrongColor ?? DEFAULT_MONITORING_BRAND_TOKENS.textStrongColor,
      textColor: brand?.textColor ?? DEFAULT_MONITORING_BRAND_TOKENS.textColor,
      textSoftColor: brand?.textSoftColor ?? DEFAULT_MONITORING_BRAND_TOKENS.textSoftColor,
    }),
    [brand]
  );
  const isLightTheme = hexLuminance(brandTokens.backgroundColor) > 0.5;

  const headerBrand = useMemo(() => ({
    ...brandTokens,
    ...(elementConfigs.header.bgColor ? { surfaceColor: elementConfigs.header.bgColor, backgroundColor: elementConfigs.header.bgColor } : {}),
    ...(elementConfigs.header.borderColor ? { borderColor: elementConfigs.header.borderColor } : {}),
    ...(elementConfigs.header.accentColor ? { accentColor: elementConfigs.header.accentColor } : {}),
    ...(elementConfigs.header.textStrongColor ? { textStrongColor: elementConfigs.header.textStrongColor } : {}),
    ...(elementConfigs.header.textSoftColor ? { textSoftColor: elementConfigs.header.textSoftColor } : {}),
  }), [brandTokens, elementConfigs.header]);

  const sidebarBrand = useMemo(() => ({
    ...brandTokens,
    ...(brand?.sidebarColor ? { sidebarColor: brand.sidebarColor } : {}),
    ...(elementConfigs.sidebar.bgColor ? { surfaceColor: elementConfigs.sidebar.bgColor, sidebarColor: elementConfigs.sidebar.bgColor } : {}),
    ...(elementConfigs.sidebar.borderColor ? { borderColor: elementConfigs.sidebar.borderColor } : {}),
    ...(elementConfigs.sidebar.primaryColor ? { primaryColor: elementConfigs.sidebar.primaryColor } : {}),
    ...(elementConfigs.sidebar.accentColor ? { accentColor: elementConfigs.sidebar.accentColor } : {}),
    ...(elementConfigs.sidebar.textColor ? { textColor: elementConfigs.sidebar.textColor } : {}),
    ...(elementConfigs.sidebar.textSoftColor ? { textSoftColor: elementConfigs.sidebar.textSoftColor } : {}),
  }), [brand, brandTokens, elementConfigs.sidebar]);

  const rootStyle: CSSProperties = {
    backgroundColor: brandTokens.backgroundColor,
    color: brandTokens.textColor,
    display: "flex",
    height: "100%",
    overflow: "hidden",
    width: "100%",
    fontFamily: `${brandTokens.fontFamily}, var(--font), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  };
  const getDefaultConfig = (id: string) => elementConfigs.defaultWidgets[id] ?? DEFAULT_MONITORING_ELEMENT_CONFIGS.defaultWidgets[id];

  const defaultItems = useMemo<LayoutItem[]>(
    () => {
      const item = (id: string, fallbackTitle: string, fallbackX: number, fallbackY: number, fallbackW: number, fallbackH: number) => {
        const config = getDefaultConfig(id);
        return {
          config,
          title: config?.title ?? fallbackTitle,
          accentColor: config?.accentColor ?? "#3b82f6",
          bgColor: config?.bgColor,
          borderColor: config?.borderColor,
          textStrongColor: config?.textStrongColor,
          textSoftColor: config?.textSoftColor,
          warningColor: config?.warningColor,
          dangerColor: config?.dangerColor,
          series1Color: config?.series1Color,
          series2Color: config?.series2Color,
          series3Color: config?.series3Color,
          series4Color: config?.series4Color,
          visible: config?.visible ?? true,
          x: config?.x ?? fallbackX,
          y: config?.y ?? fallbackY,
          w: config?.w ?? fallbackW,
          h: config?.h ?? fallbackH,
        };
      };
      const wb = (cfg: { bgColor?: string; borderColor?: string; textStrongColor?: string; textSoftColor?: string; warningColor?: string; dangerColor?: string }) => ({
        ...brandTokens,
        ...(cfg.bgColor ? { surfaceColor: cfg.bgColor } : {}),
        ...(cfg.borderColor ? { borderColor: cfg.borderColor } : {}),
        ...(cfg.textStrongColor ? { textStrongColor: cfg.textStrongColor } : {}),
        ...(cfg.textSoftColor ? { textSoftColor: cfg.textSoftColor } : {}),
        ...(cfg.warningColor ? { warningColor: cfg.warningColor } : {}),
        ...(cfg.dangerColor ? { dangerColor: cfg.dangerColor } : {}),
      });
      const equipment    = item("summary-equipment-status", "전체 설비 상태",  0, 0,  3, 3);
      const environment  = item("summary-environment-risk", "환경 위험 상태",   3, 0,  3, 3);
      const worker       = item("summary-worker-safety",    "작업자 안전 상태", 6, 0,  3, 3);
      const alerts       = item("summary-alert-count",      "오늘의 알림 건수", 9, 0,  3, 3);
      const chart        = item("equipment-anomaly-chart",  "설비 이상 현황",   0, 3,  8, 10);
      const safety       = item("worker-safety-overview",   "작업자 안전 현황", 8, 3,  4, 10);
      const envDiagnosis = item("environment-diagnosis",    "환경 진단",        0, 13, 3, 5);
      const realtime     = item("realtime-alerts",          "실시간 알림",      3, 13, 3, 5);
      const action       = item("action-progress",          "점검·조치 현황",   6, 13, 3, 5);
      const system       = item("system-status",            "시스템 상태",      9, 13, 3, 5);

      const items: LayoutItem[] = [
        {
        id: "summary-equipment-status",
        source: "ai-studio-default",
        title: equipment.title,
        x: equipment.x, y: equipment.y, w: equipment.w, h: equipment.h,
        render: () => <SummaryCard title={equipment.title} icon={Activity} value="128" unit="/ 154 대" sub="6 대" accentColor={equipment.accentColor} brand={wb(equipment)} />,
      },
      {
        id: "summary-environment-risk",
        source: "ai-studio-default",
        title: environment.title,
        x: environment.x, y: environment.y, w: environment.w, h: environment.h,
        render: () => <SummaryCard title={environment.title} icon={Wind} value="주의" unit="(Yellow)" sub="1 단계" tone="yellow" accentColor={environment.accentColor} brand={wb(environment)} />,
      },
      {
        id: "summary-worker-safety",
        source: "ai-studio-default",
        title: worker.title,
        x: worker.x, y: worker.y, w: worker.w, h: worker.h,
        render: () => <SummaryCard title={worker.title} icon={UserCheck} value="주의" unit="(Yellow)" sub="2 명" tone="yellow" accentColor={worker.accentColor} brand={wb(worker)} />,
      },
      {
        id: "summary-alert-count",
        source: "ai-studio-default",
        title: alerts.title,
        x: alerts.x, y: alerts.y, w: alerts.w, h: alerts.h,
        render: () => <SummaryCard title={alerts.title} icon={Bell} value="26" unit="건" sub="10 건" tone="danger" accentColor={alerts.accentColor} brand={wb(alerts)} />,
      },
      {
        id: "equipment-anomaly-chart",
        source: "ai-studio-default",
        title: chart.title,
        x: chart.x, y: chart.y, w: chart.w, h: chart.h,
        render: () => <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border shadow-sm" style={{ backgroundColor: wb(chart).surfaceColor, borderColor: wb(chart).borderColor }}><MainChartSection brand={wb(chart)} title={chart.title} seriesColors={{ vibration: chart.series1Color ?? "#f97316", temp: chart.series2Color ?? "#ef4444", thermal: chart.series3Color ?? "#a855f7", gas: chart.series4Color ?? "#06b6d4" }} /></div>,
      },
      {
        id: "worker-safety-overview",
        source: "ai-studio-default",
        title: safety.title,
        x: safety.x, y: safety.y, w: safety.w, h: safety.h,
        render: () => <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border shadow-sm" style={{ backgroundColor: wb(safety).surfaceColor, borderColor: wb(safety).borderColor }}><WorkerSafetySection brand={wb(safety)} title={safety.title} /></div>,
      },
      {
        id: "environment-diagnosis",
        source: "ai-studio-default",
        title: envDiagnosis.title,
        x: envDiagnosis.x, y: envDiagnosis.y, w: envDiagnosis.w, h: envDiagnosis.h,
        render: () => <EnvironmentStatusWidget setCurrentPage={setCurrentPage} brand={wb(envDiagnosis)} />,
      },
      {
        id: "realtime-alerts",
        source: "ai-studio-default",
        title: realtime.title,
        x: realtime.x, y: realtime.y, w: realtime.w, h: realtime.h,
        render: () => <RealtimeAlertList brand={wb(realtime)} />,
      },
      {
        id: "action-progress",
        source: "ai-studio-default",
        title: action.title,
        x: action.x, y: action.y, w: action.w, h: action.h,
        render: () => <ActionProgressWidget brand={wb(action)} />,
      },
      {
        id: "system-status",
        source: "ai-studio-default",
        title: system.title,
        x: system.x, y: system.y, w: system.w, h: system.h,
        render: () => <SystemStatusWidget brand={wb(system)} />,
      },
      ];

      return items.filter((layoutItem) => getDefaultConfig(layoutItem.id)?.visible ?? true);
    },
    [brandTokens, elementConfigs.defaultWidgets]
  );

  const layoutItems = useMemo<LayoutItem[]>(() => {
    const customItems = customWidgets.map<LayoutItem>((instance) => {
      const meta = widgetById[instance.widgetId];
      return {
        id: instance.instanceId,
        source: "widget-library",
        title: instance.title,
        x: instance.x,
        y: instance.y,
        w: instance.w,
        h: instance.h,
        widgetInstance: instance,
        render: () => (
          <MonitoringWidgetRenderer
            title={instance.title}
            widget={meta}
            categoryLabel={
              CATEGORY_LABELS[String(instance.options.dataSource ?? meta?.dataSource ?? "")]
              ?? String(instance.options.dataSource ?? meta?.dataSource ?? "Monitoring")
            }
            selected={selectedWidgetId === instance.instanceId}
            brandPrimaryColor={brandTokens.primaryColor}
            brandSurfaceColor={(instance.options.bgColor as string | undefined) ?? brandTokens.surfaceColor}
            brandBorderColor={(instance.options.borderColor as string | undefined) ?? brandTokens.borderColor}
            brandTextStrongColor={(instance.options.textStrongColor as string | undefined) ?? brandTokens.textStrongColor}
            brandTextSoftColor={(instance.options.textSoftColor as string | undefined) ?? brandTokens.textSoftColor}
            brandAccentColor={(instance.options.accentColor as string | undefined) ?? brandTokens.accentColor}
            brandAccentSecondaryColor={(instance.options.accentSecondaryColor as string | undefined) ?? brandTokens.secondaryColor}
            brandSuccessColor={(instance.options.successColor as string | undefined) ?? brandTokens.successColor}
            brandWarningColor={(instance.options.warningColor as string | undefined) ?? brandTokens.warningColor}
            brandDangerColor={(instance.options.dangerColor as string | undefined) ?? brandTokens.dangerColor}
            isLight={isLightTheme}
            liveData={widgetLiveData[instance.instanceId]}
          />
        ),
      };
    });

    // 기본/신규 위젯을 하나의 12-column 배치 엔진에서 해석한다.
    return resolveLayout([...defaultItems, ...customItems], layoutPriorityId ?? undefined);
  }, [customWidgets, defaultItems, layoutPriorityId, selectedWidgetId, widgetById, widgetLiveData]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden font-sans" style={rootStyle}>
      {/* ── Header: 전체 너비 (로고 포함) ── */}
      <div
        role="button"
        tabIndex={0}
        data-monitoring-selection-id="header"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button,a,input,textarea,select")) return;
          onSelectElement({ id: "header", label: "상단 메뉴", kind: "header" });
        }}
        onClick={() => onSelectElement({ id: "header", label: "상단 메뉴", kind: "header" })}
        className="group relative shrink-0"
        style={{
          flexShrink: 0,
          position: "relative",
          outline: selectedElementId === "header" ? `2px solid ${GUARD_EDIT_CYAN}` : "2px solid transparent",
          outlineOffset: "-2px",
        }}
      >
        <Header
          title={elementConfigs.header.title}
          showStatusBadges={elementConfigs.header.showStatusBadges}
          showTimestamp={elementConfigs.header.showTimestamp}
          timestampLabel={elementConfigs.header.timestampLabel}
          operatorName={elementConfigs.header.operatorName}
          operatorRole={elementConfigs.header.operatorRole}
          logoUrl={elementConfigs.header.logoUrl ?? brand?.logoUrl}
          logoSize={elementConfigs.header.logoSize ?? brand?.logoSize}
          brand={headerBrand}
        />
      </div>
      {/* ── Sidebar + Canvas: 헤더 아래 ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          data-monitoring-selection-id="sidebar"
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest("button,a,input,textarea,select")) return;
            onSelectElement({ id: "sidebar", label: "좌측 메뉴", kind: "sidebar" });
          }}
          onClick={() => onSelectElement({ id: "sidebar", label: "좌측 메뉴", kind: "sidebar" })}
          className="group relative shrink-0"
          style={{
            flexShrink: 0,
            position: "relative",
            boxShadow: selectedElementId === "sidebar" ? `inset 0 0 0 2px ${GUARD_EDIT_CYAN}` : "none",
          }}
        >
          {selectedElementId === "sidebar" && (
            <div
              className="pointer-events-none absolute inset-0 z-[80]"
              style={{
                border: `2px solid ${GUARD_EDIT_CYAN}`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.65), 0 0 22px ${GUARD_EDIT_CYAN}55`,
              }}
            />
          )}
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            brand={sidebarBrand}
            expandMode={elementConfigs.sidebar.expandMode}
            menuDensity={elementConfigs.sidebar.menuDensity}
            showFooter={elementConfigs.sidebar.showFooter}
            footerText={elementConfigs.sidebar.footerText}
            addedPages={addedPages}
            hidePageManagement={hidePageManagement}
            onOpenPageBuilder={onOpenPageBuilder}
            onRemovePage={onRemovePage ? (key) => {
              const page = addedPages.find((p) => p.key === key);
              if (page && (page.config.pageTitle || page.label) === currentPage) {
                setCurrentPage("홈");
              }
              onRemovePage(key);
            } : undefined}
          />
        </div>
        <main
          ref={canvasRef}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className="custom-scrollbar relative flex-1 overflow-y-auto"
          style={{
            backgroundColor: brandTokens.backgroundColor,
            flex: "1 1 0%",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {currentPage !== "홈" ? (
            (() => {
              const matchedPage = addedPages.find(
                (p) => (p.config.pageTitle || p.label) === currentPage
              );
              if (matchedPage) {
                const wrapClass = "custom-scrollbar h-full overflow-y-auto px-5 pb-5 pt-4";
                switch (matchedPage.key) {
                  case "integrated":
                    return (
                      <div className={wrapClass}>
                        <IntegratedDashboard setCurrentPage={setCurrentPage} brand={brandTokens as unknown as typeof brand} />
                      </div>
                    );
                  case "equipment":
                    return <div className={wrapClass}><EquipmentDiagnosis brand={brandTokens as unknown as typeof brand} /></div>;
                  case "environment":
                    return <div className={wrapClass}><EnvironmentDiagnosis brand={brandTokens as unknown as typeof brand} /></div>;
                  case "worker":
                    return <div className={wrapClass}><WorkerSafety brand={brandTokens as unknown as typeof brand} /></div>;
                  case "alerts":
                    return <div className={wrapClass}><AlertsEvents brand={brandTokens as unknown as typeof brand} /></div>;
                  case "report":
                    return <div className={wrapClass}><Report brand={brandTokens as unknown as typeof brand} /></div>;
                  case "settings":
                    return <div className={wrapClass}><SettingsPage brand={brandTokens as unknown as typeof brand} /></div>;
                }
              }
              return (
                <div className="flex h-full flex-col items-center justify-center text-slate-500">
                  <h2 className="mb-2 text-xl">{currentPage}</h2>
                  <p>페이지를 준비 중입니다.</p>
                </div>
              );
            })()
          ) : (
            /* 래퍼: 컨텐츠 높이 == 위젯 그리드 높이 → 그리드 오버레이가 스크롤 전체를 커버 */
            <div style={{ position: "relative", minHeight: "100%" }}>
              <div
                className={`pointer-events-none absolute inset-0 z-0 transition-opacity ${
                  isDraggingWidget || interactionActive ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  inset: 0,
                  padding: `${GRID_PADDING_TOP}px ${GRID_PADDING_RIGHT}px ${GRID_PADDING_BOTTOM}px ${GRID_PADDING_LEFT}px`,
                  pointerEvents: "none",
                  position: "absolute",
                  zIndex: 0,
                }}
              >
                <div
                  className="grid h-full grid-cols-12"
                  style={{
                    columnGap: GRID_GAP,
                    display: "grid",
                    gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
                    height: "100%",
                    rowGap: GRID_GAP,
                  }}
                >
                  {Array.from({ length: GRID_COLUMNS }).map((_, index) => (
                    <div key={index} className="rounded-sm bg-blue-400/10 ring-1 ring-blue-300/10" />
                  ))}
                </div>
              </div>
              <div
                className="relative z-10 grid grid-cols-12"
                style={{
                  display: "grid",
                  gridAutoRows: ROW_HEIGHT,
                  gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))`,
                  columnGap: GRID_GAP,
                  rowGap: GRID_GAP,
                  padding: `${GRID_PADDING_TOP}px ${GRID_PADDING_RIGHT}px ${GRID_PADDING_BOTTOM}px ${GRID_PADDING_LEFT}px`,
                  position: "relative",
                  minHeight: "100%",
                  zIndex: 10,
                }}
              >
                {layoutItems.map((item) => {
                  const isCustom = item.source === "widget-library" && item.widgetInstance;
                  const isBeingDragged = isCustom && item.id === selectedWidgetId;
                  const isSelected = isCustom ? selectedWidgetId === item.id : selectedElementId === item.id;

                  // 드래그되지 않는 커스텀 위젯에만 layout 애니메이션 적용
                  // → 다른 위젯이 밀려날 때 자연스럽게 슬라이드 이동 (FLIP 기법)
                  const shouldAnimate = isCustom && !isBeingDragged;

                  return (
                    <motion.div
                      key={`${item.source}-${item.id}`}
                      className="min-h-0"
                      layout={shouldAnimate ? "position" : false}
                      transition={
                        shouldAnimate
                          ? interactionActive
                            ? { type: "tween", duration: 0.1, ease: "easeOut" }
                            : { type: "spring", damping: 30, stiffness: 400 }
                          : { duration: 0 }
                      }
                      style={{
                        gridColumn: `${item.x + 1} / span ${item.w}`,
                        gridRow: `${item.y + 1} / span ${item.h}`,
                        ...(isCustom ? { position: "relative" } : {}),
                      }}
                    >
                      {isCustom && item.widgetInstance ? (
                        <div
                          role="button"
                          tabIndex={0}
                          data-monitoring-selection-id={item.id}
                          onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "move")}
                          onClick={() => onSelectWidget(item.id)}
                          className="group relative h-full min-h-0 cursor-grab overflow-hidden rounded-lg transition-all"
                          style={{
                            outline: isSelected ? `2px solid ${GUARD_EDIT_CYAN}` : "2px solid transparent",
                            outlineOffset: "-2px",
                            boxShadow: isSelected ? `0 0 0 4px rgba(0,200,255,.12), 0 0 24px rgba(0,200,255,.22)` : undefined,
                          }}
                        >
                          {item.render()}
                          {isSelected && (
                            <div
                              aria-hidden
                              className="pointer-events-none absolute left-0 top-0 z-20 flex items-center gap-1 rounded-br-md px-2 py-0.5"
                              style={{
                                background: GUARD_EDIT_CYAN,
                                color: "#021018",
                                fontSize: 10,
                                fontWeight: 600,
                                letterSpacing: "0.04em",
                              }}
                            >
                              {item.title}
                            </div>
                          )}
                          {isSelected && (
                            <>
                              {/* North edge */}
                              <span onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "resize", "n")} className="absolute top-0 left-6 right-6 h-2 cursor-ns-resize bg-transparent transition-colors hover:bg-[#00C8FF]/15" aria-hidden="true" />
                              {/* South edge */}
                              <span onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "resize", "s")} className="absolute bottom-0 left-6 right-6 h-2 cursor-ns-resize bg-transparent transition-colors hover:bg-[#00C8FF]/15" aria-hidden="true" />
                              {/* East edge */}
                              <span onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "resize", "e")} className="absolute right-0 top-6 bottom-6 w-2 cursor-ew-resize bg-transparent transition-colors hover:bg-[#00C8FF]/15" aria-hidden="true" />
                              {/* West edge */}
                              <span onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "resize", "w")} className="absolute left-0 top-6 bottom-6 w-2 cursor-ew-resize bg-transparent transition-colors hover:bg-[#00C8FF]/15" aria-hidden="true" />
                              {/* NW corner */}
                              <span onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "resize", "nw")} className="absolute top-0 left-0 h-6 w-6 cursor-nwse-resize" aria-hidden="true">
                                <span className="absolute top-1 left-1 h-4 w-4 rounded-sm bg-[#00C8FF]/80 shadow-[0_0_10px_rgba(0,200,255,.6)]" />
                              </span>
                              {/* NE corner */}
                              <span onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "resize", "ne")} className="absolute top-0 right-0 h-6 w-6 cursor-nesw-resize" aria-hidden="true">
                                <span className="absolute top-1 right-1 h-4 w-4 rounded-sm bg-[#00C8FF]/80 shadow-[0_0_10px_rgba(0,200,255,.6)]" />
                              </span>
                              {/* SE corner */}
                              <span onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "resize", "se")} className="absolute bottom-0 right-0 h-6 w-6 cursor-nwse-resize" aria-hidden="true">
                                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-sm bg-[#00C8FF]/80 shadow-[0_0_10px_rgba(0,200,255,.6)]" />
                              </span>
                              {/* SW corner */}
                              <span onPointerDown={(event) => onStartWidgetInteraction(event, item.widgetInstance!, "resize", "sw")} className="absolute bottom-0 left-0 h-6 w-6 cursor-nesw-resize" aria-hidden="true">
                                <span className="absolute bottom-1 left-1 h-4 w-4 rounded-sm bg-[#00C8FF]/80 shadow-[0_0_10px_rgba(0,200,255,.6)]" />
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          className="relative h-full min-h-0 cursor-grab overflow-hidden rounded-lg"
                          style={{
                            outline: isSelected ? `2px solid ${GUARD_EDIT_CYAN}` : "2px solid transparent",
                            outlineOffset: "-2px",
                            boxShadow: isSelected ? `0 0 0 4px rgba(0,200,255,.12), 0 0 24px rgba(0,200,255,.22)` : undefined,
                          }}
                          onPointerDownCapture={(event) => {
                            /* 리사이즈 핸들 클릭은 캡처 단계에서 가로채지 않음 */
                            if ((event.target as HTMLElement).closest("[data-resize-handle]")) return;
                            if (onStartDefaultWidgetInteraction) {
                              onStartDefaultWidgetInteraction(event, item.id, "move", { x: item.x, y: item.y, w: item.w, h: item.h });
                            }
                            onSelectElement({ id: item.id, label: item.title, kind: "default-widget" });
                          }}
                          onClick={() => onSelectElement({ id: item.id, label: item.title, kind: "default-widget" })}
                        >
                          <DefaultItemFrame
                            selected={isSelected}
                            accentColor={getDefaultConfig(item.id)?.accentColor ?? "#3b82f6"}
                            label={item.title}
                            selectionId={item.id}
                            onSelect={() => {}}
                          >
                            {item.render()}
                          </DefaultItemFrame>
                          {isSelected && onStartDefaultWidgetInteraction && (
                            <>
                              {/* North edge */}
                              <span data-resize-handle="n" onPointerDown={(e) => { e.stopPropagation(); onStartDefaultWidgetInteraction(e, item.id, "resize", { x: item.x, y: item.y, w: item.w, h: item.h }, "n"); }} className="absolute top-0 left-6 right-6 h-2 cursor-ns-resize bg-transparent transition-colors hover:bg-[#00C8FF]/15" aria-hidden="true" />
                              {/* South edge */}
                              <span data-resize-handle="s" onPointerDown={(e) => { e.stopPropagation(); onStartDefaultWidgetInteraction(e, item.id, "resize", { x: item.x, y: item.y, w: item.w, h: item.h }, "s"); }} className="absolute bottom-0 left-6 right-6 h-2 cursor-ns-resize bg-transparent transition-colors hover:bg-[#00C8FF]/15" aria-hidden="true" />
                              {/* East edge */}
                              <span data-resize-handle="e" onPointerDown={(e) => { e.stopPropagation(); onStartDefaultWidgetInteraction(e, item.id, "resize", { x: item.x, y: item.y, w: item.w, h: item.h }, "e"); }} className="absolute right-0 top-6 bottom-6 w-2 cursor-ew-resize bg-transparent transition-colors hover:bg-[#00C8FF]/15" aria-hidden="true" />
                              {/* West edge */}
                              <span data-resize-handle="w" onPointerDown={(e) => { e.stopPropagation(); onStartDefaultWidgetInteraction(e, item.id, "resize", { x: item.x, y: item.y, w: item.w, h: item.h }, "w"); }} className="absolute left-0 top-6 bottom-6 w-2 cursor-ew-resize bg-transparent transition-colors hover:bg-[#00C8FF]/15" aria-hidden="true" />
                              {/* NW corner */}
                              <span data-resize-handle="nw" onPointerDown={(e) => { e.stopPropagation(); onStartDefaultWidgetInteraction(e, item.id, "resize", { x: item.x, y: item.y, w: item.w, h: item.h }, "nw"); }} className="absolute top-0 left-0 h-6 w-6 cursor-nwse-resize" aria-hidden="true">
                                <span className="absolute top-1 left-1 h-4 w-4 rounded-sm bg-[#00C8FF]/80 shadow-[0_0_10px_rgba(0,200,255,.6)]" />
                              </span>
                              {/* NE corner */}
                              <span data-resize-handle="ne" onPointerDown={(e) => { e.stopPropagation(); onStartDefaultWidgetInteraction(e, item.id, "resize", { x: item.x, y: item.y, w: item.w, h: item.h }, "ne"); }} className="absolute top-0 right-0 h-6 w-6 cursor-nesw-resize" aria-hidden="true">
                                <span className="absolute top-1 right-1 h-4 w-4 rounded-sm bg-[#00C8FF]/80 shadow-[0_0_10px_rgba(0,200,255,.6)]" />
                              </span>
                              {/* SE corner */}
                              <span data-resize-handle="se" onPointerDown={(e) => { e.stopPropagation(); onStartDefaultWidgetInteraction(e, item.id, "resize", { x: item.x, y: item.y, w: item.w, h: item.h }, "se"); }} className="absolute bottom-0 right-0 h-6 w-6 cursor-nwse-resize" aria-hidden="true">
                                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-sm bg-[#00C8FF]/80 shadow-[0_0_10px_rgba(0,200,255,.6)]" />
                              </span>
                              {/* SW corner */}
                              <span data-resize-handle="sw" onPointerDown={(e) => { e.stopPropagation(); onStartDefaultWidgetInteraction(e, item.id, "resize", { x: item.x, y: item.y, w: item.w, h: item.h }, "sw"); }} className="absolute bottom-0 left-0 h-6 w-6 cursor-nesw-resize" aria-hidden="true">
                                <span className="absolute bottom-1 left-1 h-4 w-4 rounded-sm bg-[#00C8FF]/80 shadow-[0_0_10px_rgba(0,200,255,.6)]" />
                              </span>
                              {onHideDefaultWidget && (
                                <button
                                  type="button"
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => { e.stopPropagation(); onHideDefaultWidget(item.id); }}
                                  className="absolute right-2 top-2 z-30 flex h-6 w-6 items-center justify-center rounded bg-black/60 text-white/70 hover:bg-red-500/60 hover:text-white"
                                  title="위젯 숨기기"
                                >
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 9 9 1M1 1l8 8" strokeLinecap="round"/></svg>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
