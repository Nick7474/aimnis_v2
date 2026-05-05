import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import type { Node, Edge } from "reactflow";
import { BRAND_PRESETS, DEFAULT_BRAND, type BrandPreset, type BrandSettings } from "@/lib/brandPresets";

const CUSTOM_BRAND_PRESETS_KEY = "aimnis.customBrandPresets.v1";
const BRAND_PRESET_OVERRIDES_KEY = "aimnis.brandPresetOverrides.v1";
type BrandPresetOverrides = Record<string, BrandPreset>;

function readCustomBrandPresets(): BrandPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_BRAND_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BrandPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCustomBrandPresets(presets: BrandPreset[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_BRAND_PRESETS_KEY, JSON.stringify(presets));
}

function readBrandPresetOverrides(): BrandPresetOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BRAND_PRESET_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as BrandPresetOverrides;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writeBrandPresetOverrides(overrides: BrandPresetOverrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRAND_PRESET_OVERRIDES_KEY, JSON.stringify(overrides));
}

function getBaseBrandPreset(id: string) {
  return BRAND_PRESETS.find((preset) => preset.id === id) ?? BRAND_PRESETS[0];
}

// ─── 오버레이 위젯 (MonitorWrapper 위에 float) ─────────────────

export interface OverlayWidget {
  id: string;
  type: string;
  title: string;
  data: WidgetData;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── 양방향 바인딩: 위젯 프로퍼티 ────────────────────────────────

export interface WidgetProperties {
  title?: string;
  themeColor?: string;
  // Gauge
  value?: number;
  min?: number;
  max?: number;
  threshold?: number;
  // Chart
  dataSource?: string;
  refreshInterval?: number;
  // CCTV
  streamUrl?: string;
  channelId?: string;
  ptzControl?: boolean;
  // 공통
  label?: string;
  visible?: boolean;
}

export interface ActiveWidget {
  id: string;
  type: string;
  properties: WidgetProperties;
}

// ─── EditableSection 타입 ──────────────────────────────────────

export type SectionType =
  | "header"
  | "sidebar"
  | "map"
  | "alarm-panel"
  | "floor-status"
  | "widget";

export type PanelType =
  | "brand"
  | "navigation"
  | "gis"
  | "alarm"
  | "widget"
  | "empty";

export interface SelectedElement {
  sectionId: string;
  type: SectionType;
  label: string;
  panelType: PanelType;
  rect: { top: number; left: number; width: number; height: number };
}

// ─── 기존 타입 ────────────────────────────────────────────────

export interface WidgetData {
  value?: string;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  chartData?: Array<{ name: string; value: number }>;
  gaugeValue?: number;
  gaugeMax?: number;
  alerts?: Array<{ level: "critical" | "warning" | "info"; msg: string }>;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export interface NodeMapping {
  nodeId: string;
  dataConnector: string;
  fieldBindings: Record<string, string>;
}

// ─── 드롭 기반 데이터 매핑 소스 ────────────────────────────────

export type MappingSourceKind = "demo" | "file" | "folder" | "api";

export interface MappingField {
  id: string;
  name: string;
  path: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "unknown";
  sample?: string;
}

export interface MappingSource {
  id: string;
  name: string;
  kind: MappingSourceKind;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint?: string;
  description?: string;
  fileCount?: number;
  fields: MappingField[];
  createdAt: number;
}

// ─── 매핑 엣지 (비주얼 데이터 매핑) ─────────────────────────

export interface MappingEdge {
  id: string;
  sourceConnector: string;   // "energy-sensor"
  sourceField: string;       // "currentKw"
  targetWidgetId: string;    // "w-12345"
  targetProperty: string;    // "value"
}

export type CenterView = "monitor" | "mapping";

type RightPanel = "mapping" | "settings" | "brand" | "gis" | "alarm" | "navigation" | "widget";

// ─── 스왑 패널 위젯 ───────────────────────────────────────────

export interface SwappedPanelWidget {
  id: string;
  type: string;
  title: string;
  data: WidgetData;
  properties?: WidgetProperties;
  visible: boolean;
  originalWidget: OverlayWidget; // "원래대로" 복원용
}

export type SectionStyleKey = "header" | "sidebar" | "map" | "alarm-panel" | "floor-status";
export type SectionStyleOverrides = Partial<BrandSettings>;

type BrandColorKey =
  | "primaryColor"
  | "secondaryColor"
  | "accentColor"
  | "successColor"
  | "warningColor"
  | "dangerColor";

const LEGACY_WIDGET_COLORS = new Set(
  [
    "#14b8a6",
    "#0ea5e9",
    "#00c8ff",
    "#60a5fa",
    "#6366f1",
    "#8b5cf6",
    "#a78bfa",
    "#f59e0b",
    "#f97316",
    "#22c55e",
    "#16a34a",
    "#ef4444",
    "#dc2626",
    "#e11d48",
    "#38bdf8",
  ].map((color) => color.toLowerCase())
);

const WIDGET_COLOR_TOKEN: Record<string, BrandColorKey> = {
  kpi: "secondaryColor",
  "chart-line": "secondaryColor",
  "chart-bar": "primaryColor",
  "chart-donut": "accentColor",
  gauge: "warningColor",
  "alert-panel": "dangerColor",
};

function normalizeColorValue(color?: string) {
  return color?.trim().toLowerCase() ?? "";
}

function widgetBrandColor(type: string, brand: BrandSettings) {
  const key = WIDGET_COLOR_TOKEN[type] ?? "accentColor";
  return brand[key];
}

function brandColorPalette(brand: BrandSettings) {
  return [
    brand.primaryColor,
    brand.secondaryColor,
    brand.accentColor,
    brand.successColor,
    brand.warningColor,
    brand.dangerColor,
  ].map((color) => normalizeColorValue(color));
}

function shouldFollowBrandColor(color: string | undefined, previousBrand: BrandSettings) {
  const normalized = normalizeColorValue(color);
  if (!normalized) return true;
  if (normalized.startsWith("var(--guard-color-")) return true;
  if (LEGACY_WIDGET_COLORS.has(normalized)) return true;
  return brandColorPalette(previousBrand).includes(normalized);
}

function syncWidgetDataToBrand<T extends { type: string; data: WidgetData }>(
  widget: T,
  previousBrand: BrandSettings,
  nextBrand: BrandSettings = previousBrand
): T {
  if (!shouldFollowBrandColor(widget.data.color, previousBrand)) return widget;
  return {
    ...widget,
    data: {
      ...widget.data,
      color: widgetBrandColor(widget.type, nextBrand),
    },
  };
}

function syncActiveWidgetToBrand(
  widget: ActiveWidget,
  previousBrand: BrandSettings,
  nextBrand: BrandSettings = previousBrand
): ActiveWidget {
  const current = typeof widget.properties.themeColor === "string"
    ? widget.properties.themeColor
    : undefined;
  if (!shouldFollowBrandColor(current, previousBrand)) return widget;
  return {
    ...widget,
    properties: {
      ...widget.properties,
      themeColor: widgetBrandColor(widget.type, nextBrand),
    },
  };
}

function syncPanelWidgetToBrand(
  widget: SwappedPanelWidget,
  previousBrand: BrandSettings,
  nextBrand: BrandSettings = previousBrand
): SwappedPanelWidget {
  const syncedWidget = syncWidgetDataToBrand(widget, previousBrand, nextBrand);
  return {
    ...syncedWidget,
    originalWidget: syncWidgetDataToBrand(widget.originalWidget, previousBrand, nextBrand),
  };
}

function applyActivePropertiesToWidget(
  widget: OverlayWidget,
  active?: ActiveWidget
): OverlayWidget {
  if (!active) return widget;

  const data = { ...widget.data };
  const { properties } = active;

  if (typeof properties.themeColor === "string") data.color = properties.themeColor;
  if (typeof properties.value === "number") data.gaugeValue = properties.value;
  if (typeof properties.max === "number") data.gaugeMax = properties.max;

  return {
    ...widget,
    title: properties.title ?? widget.title,
    data,
  };
}

function toRightPanelWidget(widget: OverlayWidget, active?: ActiveWidget): SwappedPanelWidget {
  const resolvedWidget = applyActivePropertiesToWidget(widget, active);
  return {
    id: resolvedWidget.id,
    type: resolvedWidget.type,
    title: resolvedWidget.title,
    data: resolvedWidget.data,
    properties: active?.properties ? { ...active.properties } : undefined,
    visible: true,
    originalWidget: resolvedWidget,
  };
}

function applyWidgetPropertyToPanelWidget(
  widget: SwappedPanelWidget,
  key: keyof WidgetProperties,
  value: unknown
): SwappedPanelWidget {
  const properties = { ...(widget.properties ?? {}), [key]: value };
  switch (key) {
    case "title": {
      const title = value as string;
      return {
        ...widget,
        title,
        properties,
        originalWidget: { ...widget.originalWidget, title },
      };
    }
    case "themeColor": {
      const color = value as string;
      return {
        ...widget,
        data: { ...widget.data, color },
        properties,
        originalWidget: {
          ...widget.originalWidget,
          data: { ...widget.originalWidget.data, color },
        },
      };
    }
    case "value": {
      const gaugeValue = value as number;
      return {
        ...widget,
        data: { ...widget.data, gaugeValue },
        properties,
        originalWidget: {
          ...widget.originalWidget,
          data: { ...widget.originalWidget.data, gaugeValue },
        },
      };
    }
    case "max": {
      const gaugeMax = value as number;
      return {
        ...widget,
        data: { ...widget.data, gaugeMax },
        properties,
        originalWidget: {
          ...widget.originalWidget,
          data: { ...widget.originalWidget.data, gaugeMax },
        },
      };
    }
    default:
      return { ...widget, properties };
  }
}

function syncWidgetCollectionsToBrand(
  state: EditorState,
  previousBrand: BrandSettings,
  nextBrand: BrandSettings
) {
  return {
    overlayWidgets: state.overlayWidgets.map((widget) =>
      syncWidgetDataToBrand(widget, previousBrand, nextBrand)
    ),
    activeWidgets: state.activeWidgets.map((widget) =>
      syncActiveWidgetToBrand(widget, previousBrand, nextBrand)
    ),
    rightPanelWidgets: state.rightPanelWidgets.map((widget) =>
      syncPanelWidgetToBrand(widget, previousBrand, nextBrand)
    ),
  };
}

// ─── 스토어 ───────────────────────────────────────────────────

interface EditorState {
  // 캔버스 (ReactFlow 레거시)
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // 오버레이 위젯
  overlayWidgets: OverlayWidget[];
  canvasSize: { w: number; h: number };
  addOverlayWidget: (w: OverlayWidget) => void;
  removeOverlayWidget: (id: string) => void;
  updateOverlayWidgetData: (id: string, data: Partial<WidgetData>) => void;
  updateOverlayWidgetPosition: (id: string, x: number, y: number) => void;
  setCanvasSize: (size: { w: number; h: number }) => void;

  // 양방향 바인딩
  activeWidgets: ActiveWidget[];
  systemTitle: string;
  updateWidgetProperty: (id: string, key: keyof WidgetProperties, value: unknown) => void;
  setSystemTitle: (v: string) => void;

  // 채팅
  messages: ChatMessage[];
  isStreaming: boolean;

  // 우측 패널
  rightPanel: RightPanel;
  mappings: Record<string, NodeMapping>;

  // 브랜드 설정
  brand: BrandSettings;
  selectedBrandPresetId: string;
  brandPresetOverrides: BrandPresetOverrides;
  customBrandPresets: BrandPreset[];
  sectionStyles: Partial<Record<SectionStyleKey, SectionStyleOverrides>>;

  // iframe postMessage 브릿지
  lastCommand: { userText: string; aiResponse: string; timestamp: number } | null;

  // 퍼블리시
  publishedUrl: string | null;
  isFullscreen: boolean;

  // 중앙 뷰 모드
  centerView: CenterView;
  setCenterView: (view: CenterView) => void;

  // 비주얼 매핑 엣지
  mappingSources: MappingSource[];
  addMappingSource: (source: MappingSource) => void;
  removeMappingSource: (id: string) => void;
  clearMappingSources: () => void;
  mappingEdges: MappingEdge[];
  addMappingEdge: (edge: MappingEdge) => void;
  removeMappingEdge: (id: string) => void;
  clearMappingEdges: () => void;

  // EditableSection
  selectedElement: SelectedElement | null;
  setSelectedElement: (el: SelectedElement | null) => void;

  // 액션 — 캔버스
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (nodeId: string | null) => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;

  // 액션 — 채팅
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (v: boolean) => void;

  // 액션 — 패널
  setRightPanel: (panel: RightPanel) => void;
  updateMapping: (nodeId: string, mapping: Partial<NodeMapping>) => void;

  // 액션 — 브랜드
  updateBrand: (partial: Partial<BrandSettings>) => void;
  updateSectionStyle: (section: SectionStyleKey, partial: SectionStyleOverrides) => void;
  resetSectionStyle: (section: SectionStyleKey) => void;
  resetAllSectionStyles: () => void;
  saveCurrentBrandPreset: (label?: string) => void;
  deleteCustomBrandPreset: (id: string) => void;
  selectBrandPreset: (id: string) => void;
  saveBrandPreset: (label?: string) => void;
  resetBrandPreset: (id?: string) => void;

  // 액션 — iframe 브릿지
  setLastCommand: (cmd: { userText: string; aiResponse: string; timestamp: number }) => void;

  // 액션 — 퍼블리시
  setPublishedUrl: (url: string | null) => void;
  setFullscreen: (v: boolean) => void;

  // 우측 패널 (중앙에서 드래그해서 보낸 위젯들)
  rightPanelWidgets: SwappedPanelWidget[];
  addToRightPanel: (widget: OverlayWidget) => void;
  insertToRightPanel: (widget: OverlayWidget, index: number) => void;
  removeFromRightPanel: (id: string) => void;
  toggleRightPanelWidget: (id: string) => void;
  reorderRightPanel: (activeId: string, overId: string) => void;
  resetRightPanel: () => void;

  // AIM GUARD 기존 패널 가시성
  hiddenMonitorPanels: string[];
  toggleMonitorPanel: (panelId: string) => void;

  // 패널 모드 (UX: AI 기본, 설정 컨텍스트 기반)
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  // 오버레이 위젯
  overlayWidgets: [],
  canvasSize: { w: 800, h: 600 },
  addOverlayWidget: (w) =>
    set((s) => {
      const widget = syncWidgetDataToBrand(w, s.brand);
      return {
        overlayWidgets: [...s.overlayWidgets, widget],
        // activeWidget 동시 생성
        activeWidgets: [
          ...s.activeWidgets,
          {
            id: widget.id,
            type: widget.type,
            properties: {
              title: widget.title,
              themeColor: widget.data.color,
              value: widget.data.gaugeValue,
            },
          },
        ],
      };
    }),
  removeOverlayWidget: (id) =>
    set((s) => ({
      overlayWidgets: s.overlayWidgets.filter((w) => w.id !== id),
      activeWidgets: s.activeWidgets.filter((aw) => aw.id !== id),
    })),
  updateOverlayWidgetData: (id, data) =>
    set((s) => ({
      overlayWidgets: s.overlayWidgets.map((w) =>
        w.id === id ? { ...w, data: { ...w.data, ...data } } : w
      ),
    })),
  updateOverlayWidgetPosition: (id, x, y) =>
    set((s) => ({
      overlayWidgets: s.overlayWidgets.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    })),
  setCanvasSize: (canvasSize) => set({ canvasSize }),

  // 양방향 바인딩
  activeWidgets: [],
  systemTitle: "통합 보안 모니터링 시스템",
  updateWidgetProperty: (id, key, value) =>
    set((s) => ({
      // 1. activeWidgets 업데이트
      activeWidgets: s.activeWidgets.map((aw) =>
        aw.id === id
          ? { ...aw, properties: { ...aw.properties, [key]: value } }
          : aw
      ),
      // 2. overlayWidgets 동기화 (표시 데이터에 영향 있는 키)
      overlayWidgets: s.overlayWidgets.map((ow) => {
        if (ow.id !== id) return ow;
        switch (key) {
          case "title":
            return { ...ow, title: value as string };
          case "themeColor":
            return { ...ow, data: { ...ow.data, color: value as string } };
          case "value":
            return { ...ow, data: { ...ow.data, gaugeValue: value as number } };
          default:
            return ow;
        }
      }),
      rightPanelWidgets: s.rightPanelWidgets.map((pw) =>
        pw.id === id ? applyWidgetPropertyToPanelWidget(pw, key, value) : pw
      ),
    })),
  setSystemTitle: (systemTitle) => set({ systemTitle }),

  messages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! 저는 에임이예요 ✨\n자연어로 말씀하시면 바로 실행해 드릴게요.\n\n💡 이런 것도 가능해요\n• '에너지 KPI 카드 추가해줘'\n• '고객사를 포스코로 바꿔줘'\n• '실시간 라인 차트 보여줘'\n• '포스코 스타일로 전체 변경해줘'",
    },
  ],
  isStreaming: false,

  rightPanel: "mapping",
  mappings: {},

  brand: {
    ...(readBrandPresetOverrides()[BRAND_PRESETS[0]?.id] ?? BRAND_PRESETS[0] ?? DEFAULT_BRAND),
  },
  selectedBrandPresetId: BRAND_PRESETS[0]?.id ?? "default",
  brandPresetOverrides: readBrandPresetOverrides(),
  customBrandPresets: readCustomBrandPresets(),
  sectionStyles: {},

  lastCommand: null,
  publishedUrl: null,
  isFullscreen: false,

  // 캔버스
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (selectedNodeId) =>
    set({ selectedNodeId, rightPanel: selectedNodeId ? "mapping" : "settings" }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  removeNode: (nodeId) =>
    set((s) => ({ nodes: s.nodes.filter((n) => n.id !== nodeId) })),

  // 채팅
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      return { messages: msgs };
    }),
  setStreaming: (isStreaming) => set({ isStreaming }),

  // 패널
  setRightPanel: (rightPanel) => set({ rightPanel }),
  updateMapping: (nodeId, mapping) =>
    set((s) => ({
      mappings: {
        ...s.mappings,
        [nodeId]: { ...s.mappings[nodeId], nodeId, ...mapping },
      },
    })),

  // 브랜드
  updateBrand: (partial) =>
    set((s) => {
      const brand = { ...s.brand, ...partial };
      return {
        brand,
        ...syncWidgetCollectionsToBrand(s, s.brand, brand),
      };
    }),
  updateSectionStyle: (section, partial) =>
    set((s) => ({
      sectionStyles: {
        ...s.sectionStyles,
        [section]: {
          ...(s.sectionStyles[section] ?? {}),
          ...partial,
        },
      },
    })),
  resetSectionStyle: (section) =>
    set((s) => {
      const next = { ...s.sectionStyles };
      delete next[section];
      return { sectionStyles: next };
    }),
  resetAllSectionStyles: () => set({ sectionStyles: {} }),
  saveCurrentBrandPreset: (label) =>
    set((s) => {
      const trimmed = label?.trim();
      const presetLabel = trimmed || `${s.brand.tenantName} ${s.brand.productName}`;
      const preset: BrandPreset = {
        ...s.brand,
        id: `custom-${Date.now()}`,
        label: presetLabel,
        description: "사용자가 저장한 화이트 라벨 프리셋",
      };
      const customBrandPresets = [
        preset,
        ...s.customBrandPresets.filter((item) => item.label !== presetLabel),
      ].slice(0, 8);
      writeCustomBrandPresets(customBrandPresets);
      return { customBrandPresets };
    }),
  deleteCustomBrandPreset: (id) =>
    set((s) => {
      const customBrandPresets = s.customBrandPresets.filter((item) => item.id !== id);
      writeCustomBrandPresets(customBrandPresets);
      return { customBrandPresets };
    }),
  selectBrandPreset: (id) =>
    set((s) => {
      const preset = s.brandPresetOverrides[id] ?? getBaseBrandPreset(id);
      if (!preset) return s;
      return {
        selectedBrandPresetId: id,
        brand: { ...preset },
        systemTitle: preset.serviceName,
        sectionStyles: {},
        ...syncWidgetCollectionsToBrand(s, s.brand, preset),
      };
    }),
  saveBrandPreset: (label) =>
    set((s) => {
      const base = getBaseBrandPreset(s.selectedBrandPresetId);
      if (!base) return s;
      const preset: BrandPreset = {
        ...s.brand,
        id: base.id,
        label: label?.trim() || base.label,
        description: base.description,
      };
      const brandPresetOverrides = { ...s.brandPresetOverrides, [base.id]: preset };
      writeBrandPresetOverrides(brandPresetOverrides);
      return {
        brandPresetOverrides,
        brand: { ...preset },
        systemTitle: preset.serviceName,
        ...syncWidgetCollectionsToBrand(s, s.brand, preset),
      };
    }),
  resetBrandPreset: (id) =>
    set((s) => {
      const targetId = id ?? s.selectedBrandPresetId;
      const base = getBaseBrandPreset(targetId);
      if (!base) return s;
      const brandPresetOverrides = { ...s.brandPresetOverrides };
      delete brandPresetOverrides[targetId];
      writeBrandPresetOverrides(brandPresetOverrides);
      return {
        brandPresetOverrides,
        selectedBrandPresetId: targetId,
        brand: { ...base },
        systemTitle: base.serviceName,
        sectionStyles: {},
        ...syncWidgetCollectionsToBrand(s, s.brand, base),
      };
    }),

  // iframe 브릿지
  setLastCommand: (lastCommand) => set({ lastCommand }),

  // 퍼블리시
  setPublishedUrl: (publishedUrl) => set({ publishedUrl }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),

  // 중앙 뷰 모드
  centerView: "monitor",
  setCenterView: (centerView) => set({ centerView }),

  // 비주얼 매핑 엣지
  mappingSources: [],
  addMappingSource: (source) =>
    set((s) => ({
      mappingSources: [
        source,
        ...s.mappingSources.filter((item) => item.id !== source.id),
      ].slice(0, 8),
    })),
  removeMappingSource: (id) =>
    set((s) => ({
      mappingSources: s.mappingSources.filter((source) => source.id !== id),
      mappingEdges: s.mappingEdges.filter((edge) => edge.sourceConnector !== id),
    })),
  clearMappingSources: () => set({ mappingSources: [], mappingEdges: [] }),
  mappingEdges: [],
  addMappingEdge: (edge) =>
    set((s) => ({
      mappingEdges: s.mappingEdges.some((e) => e.id === edge.id)
        ? s.mappingEdges
        : [...s.mappingEdges, edge],
    })),
  removeMappingEdge: (id) =>
    set((s) => ({ mappingEdges: s.mappingEdges.filter((e) => e.id !== id) })),
  clearMappingEdges: () => set({ mappingEdges: [] }),

  selectedElement: null,
  setSelectedElement: (selectedElement) => set({ selectedElement }),

  // 우측 패널
  rightPanelWidgets: [],
  addToRightPanel: (widget) =>
    set((s) => {
      if (s.rightPanelWidgets.some((w) => w.id === widget.id)) return s;
      const activeWidget = s.activeWidgets.find((aw) => aw.id === widget.id);
      const panelWidget = toRightPanelWidget(widget, activeWidget);
      return {
        overlayWidgets: s.overlayWidgets.filter((w) => w.id !== panelWidget.id),
        activeWidgets: s.activeWidgets.filter((aw) => aw.id !== widget.id),
        rightPanelWidgets: [
          ...s.rightPanelWidgets,
          panelWidget,
        ],
      };
    }),
  insertToRightPanel: (widget, index) =>
    set((s) => {
      if (s.rightPanelWidgets.some((w) => w.id === widget.id)) return s;
      const activeWidget = s.activeWidgets.find((aw) => aw.id === widget.id);
      const newItem = toRightPanelWidget(widget, activeWidget);
      const updated = [...s.rightPanelWidgets];
      updated.splice(index, 0, newItem);
      return {
        overlayWidgets: s.overlayWidgets.filter((w) => w.id !== newItem.id),
        activeWidgets: s.activeWidgets.filter((aw) => aw.id !== newItem.id),
        rightPanelWidgets: updated,
      };
    }),
  removeFromRightPanel: (id) =>
    set((s) => ({
      rightPanelWidgets: s.rightPanelWidgets.filter((w) => w.id !== id),
    })),
  toggleRightPanelWidget: (id) =>
    set((s) => ({
      rightPanelWidgets: s.rightPanelWidgets.map((w) =>
        w.id === id ? { ...w, visible: !w.visible } : w
      ),
    })),
  reorderRightPanel: (activeId, overId) =>
    set((s) => {
      const oldIndex = s.rightPanelWidgets.findIndex((w) => w.id === activeId);
      const newIndex = s.rightPanelWidgets.findIndex((w) => w.id === overId);
      if (oldIndex === -1 || newIndex === -1) return s;
      return { rightPanelWidgets: arrayMove(s.rightPanelWidgets, oldIndex, newIndex) };
    }),
  // 원래대로: 우측 패널 위젯을 중앙에 복원
  resetRightPanel: () =>
    set((s) => ({
      rightPanelWidgets: [],
      overlayWidgets: [
        ...s.overlayWidgets,
        ...s.rightPanelWidgets.map((w) =>
          syncWidgetDataToBrand(w.originalWidget, s.brand)
        ),
      ],
      activeWidgets: [
        ...s.activeWidgets,
        ...s.rightPanelWidgets.map((w) => {
          const widget = syncPanelWidgetToBrand(w, s.brand);
          return {
            id: widget.id,
            type: widget.type,
            properties: {
              ...widget.properties,
              title: widget.title,
              themeColor: widget.data.color,
              value: widget.data.gaugeValue,
              max: widget.data.gaugeMax,
            },
          };
        }),
      ],
    })),

  // AIM GUARD 기존 패널 가시성
  hiddenMonitorPanels: [],
  toggleMonitorPanel: (panelId) =>
    set((s) => ({
      hiddenMonitorPanels: s.hiddenMonitorPanels.includes(panelId)
        ? s.hiddenMonitorPanels.filter((id) => id !== panelId)
        : [...s.hiddenMonitorPanels, panelId],
    })),

  // 패널 모드
  showRightPanel: false,
  setShowRightPanel: (showRightPanel) => set({ showRightPanel }),
}));
