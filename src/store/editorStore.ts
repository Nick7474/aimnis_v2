import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import type { Node, Edge } from "reactflow";

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

export interface BrandSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl: string | null;
}

export interface NodeMapping {
  nodeId: string;
  dataConnector: string;
  fieldBindings: Record<string, string>;
}

type RightPanel = "mapping" | "settings" | "brand" | "gis" | "alarm" | "navigation";

// ─── 스왑 패널 위젯 ───────────────────────────────────────────

export interface SwappedPanelWidget {
  id: string;
  type: string;
  title: string;
  data: WidgetData;
  visible: boolean;
  originalWidget: OverlayWidget; // "원래대로" 복원용
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

  // iframe postMessage 브릿지
  lastCommand: { userText: string; aiResponse: string; timestamp: number } | null;

  // 퍼블리시
  publishedUrl: string | null;
  isFullscreen: boolean;

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
}

export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  // 오버레이 위젯
  overlayWidgets: [],
  canvasSize: { w: 800, h: 600 },
  addOverlayWidget: (w) =>
    set((s) => ({
      overlayWidgets: [...s.overlayWidgets, w],
      // activeWidget 동시 생성
      activeWidgets: [
        ...s.activeWidgets,
        {
          id: w.id,
          type: w.type,
          properties: {
            title: w.title,
            themeColor: w.data.color ?? "#14b8a6",
            value: w.data.gaugeValue,
          },
        },
      ],
    })),
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
    })),
  setSystemTitle: (systemTitle) => set({ systemTitle }),

  messages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! AIMNIS 에디터입니다.\n위젯을 추가하려면 자연어로 요청하세요.\n예: \"에너지 KPI 카드 추가\", \"실시간 라인 차트 보여줘\", \"알람 패널 추가\"",
    },
  ],
  isStreaming: false,

  rightPanel: "mapping",
  mappings: {},

  brand: {
    primaryColor: "#14b8a6",
    secondaryColor: "#06b6d4",
    fontFamily: "Inter",
    logoUrl: null,
  },

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
    set((s) => ({ brand: { ...s.brand, ...partial } })),

  // iframe 브릿지
  setLastCommand: (lastCommand) => set({ lastCommand }),

  // 퍼블리시
  setPublishedUrl: (publishedUrl) => set({ publishedUrl }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),

  selectedElement: null,
  setSelectedElement: (selectedElement) => set({ selectedElement }),

  // 우측 패널
  rightPanelWidgets: [],
  addToRightPanel: (widget) =>
    set((s) => {
      if (s.rightPanelWidgets.some((w) => w.id === widget.id)) return s;
      return {
        overlayWidgets: s.overlayWidgets.filter((w) => w.id !== widget.id),
        activeWidgets: s.activeWidgets.filter((aw) => aw.id !== widget.id),
        rightPanelWidgets: [
          ...s.rightPanelWidgets,
          { id: widget.id, type: widget.type, title: widget.title, data: widget.data, visible: true, originalWidget: widget },
        ],
      };
    }),
  insertToRightPanel: (widget, index) =>
    set((s) => {
      if (s.rightPanelWidgets.some((w) => w.id === widget.id)) return s;
      const newItem: SwappedPanelWidget = {
        id: widget.id, type: widget.type, title: widget.title,
        data: widget.data, visible: true, originalWidget: widget,
      };
      const updated = [...s.rightPanelWidgets];
      updated.splice(index, 0, newItem);
      return {
        overlayWidgets: s.overlayWidgets.filter((w) => w.id !== widget.id),
        activeWidgets: s.activeWidgets.filter((aw) => aw.id !== widget.id),
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
        ...s.rightPanelWidgets.map((w) => w.originalWidget),
      ],
      activeWidgets: [
        ...s.activeWidgets,
        ...s.rightPanelWidgets.map((w) => ({
          id: w.id, type: w.type,
          properties: { title: w.title, themeColor: w.data.color ?? "#14b8a6" },
        })),
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
}));
