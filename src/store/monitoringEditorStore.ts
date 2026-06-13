"use client";
import { create } from "zustand";

// ─── 타입 정의 ───────────────────────────────────────────────

export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  widgetId: string;
  minW?: number;
  minH?: number;
}

export interface MonitoringWidgetProps {
  id: string;
  title: string;
  color: string;
  refreshInterval: number;
  thresholds?: Record<string, number>;
}

export interface MonitoringChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export type LeftPanelTab = "chat" | "widgets";
export type MonitoringCenterView = "app" | "canvas" | "mapping";

// 앱 뷰에서 선택된 기존 위젯
export interface SelectedAppWidget {
  componentId: string;
  label: string;
}

// 그리드 캔버스에서 선택된 위젯
export interface SelectedGridItem {
  instanceId: string;
  widgetId: string;
}

// ─── 스토어 인터페이스 ─────────────────────────────────────

interface MonitoringEditorState {
  // 중앙 패널 모드
  centerView: MonitoringCenterView;
  setCenterView: (mode: MonitoringCenterView) => void;

  // 우측 패널 표시
  showRightPanel: boolean;
  setShowRightPanel: (v: boolean) => void;

  // 좌측 패널 너비
  leftPanelWidth: number;
  setLeftPanelWidth: (w: number) => void;

  // 그리드 캔버스 레이아웃
  layout: GridLayoutItem[];
  setLayout: (layout: GridLayoutItem[]) => void;
  addWidget: (item: GridLayoutItem) => void;
  removeWidget: (instanceId: string) => void;

  // 위젯 프로퍼티
  widgetProps: Record<string, MonitoringWidgetProps>;
  updateWidgetProps: (instanceId: string, patch: Partial<MonitoringWidgetProps>) => void;

  // 데이터 바인딩 (MappingCanvas 연동)
  widgetBindings: Record<string, Record<string, string>>;
  updateWidgetBinding: (instanceId: string, widgetField: string, dataField: string) => void;
  clearWidgetBindings: (instanceId: string) => void;
  selectedDataSource: Record<string, string>;
  setWidgetDataSource: (instanceId: string, connectorId: string) => void;

  // 선택 상태
  selectedGridItem: SelectedGridItem | null;
  selectedAppWidget: SelectedAppWidget | null;
  selectGridItem: (item: SelectedGridItem | null) => void;
  selectAppWidget: (item: SelectedAppWidget | null) => void;
  clearSelection: () => void;

  // 좌측 탭
  leftTab: LeftPanelTab;
  setLeftTab: (tab: LeftPanelTab) => void;

  // 채팅
  messages: MonitoringChatMessage[];
  isStreaming: boolean;
  addMessage: (msg: MonitoringChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (v: boolean) => void;

  // 강조색
  accentColor: string;
  setAccentColor: (color: string) => void;
}

// ─── 스토어 생성 ─────────────────────────────────────────────

export const useMonitoringEditorStore = create<MonitoringEditorState>((set) => ({
  // 중앙 패널
  centerView: "app",
  setCenterView: (centerView) => set({ centerView }),

  // 우측 패널
  showRightPanel: false,
  setShowRightPanel: (showRightPanel) => set({ showRightPanel }),

  // 좌측 패널 너비
  leftPanelWidth: 320,
  setLeftPanelWidth: (leftPanelWidth) => set({ leftPanelWidth }),

  // 그리드 레이아웃
  layout: [],
  setLayout: (layout) => set({ layout }),
  addWidget: (item) => set((s) => ({ layout: [...s.layout, item] })),
  removeWidget: (instanceId) =>
    set((s) => ({
      layout: s.layout.filter((l) => l.i !== instanceId),
      widgetProps: Object.fromEntries(
        Object.entries(s.widgetProps).filter(([k]) => k !== instanceId)
      ),
      selectedGridItem:
        s.selectedGridItem?.instanceId === instanceId ? null : s.selectedGridItem,
    })),

  // 위젯 프로퍼티
  widgetProps: {},
  updateWidgetProps: (instanceId, patch) =>
    set((s) => ({
      widgetProps: {
        ...s.widgetProps,
        [instanceId]: {
          ...(s.widgetProps[instanceId] ?? { id: instanceId, title: "", color: "#06b6d4", refreshInterval: 2000 }),
          ...patch,
        },
      },
    })),

  // 데이터 바인딩
  widgetBindings: {},
  updateWidgetBinding: (instanceId, widgetField, dataField) =>
    set((s) => ({
      widgetBindings: {
        ...s.widgetBindings,
        [instanceId]: { ...s.widgetBindings[instanceId], [widgetField]: dataField },
      },
    })),
  clearWidgetBindings: (instanceId) =>
    set((s) => {
      const next = { ...s.widgetBindings };
      delete next[instanceId];
      return { widgetBindings: next };
    }),
  selectedDataSource: {},
  setWidgetDataSource: (instanceId, connectorId) =>
    set((s) => ({
      selectedDataSource: { ...s.selectedDataSource, [instanceId]: connectorId },
    })),

  // 선택 상태
  selectedGridItem: null,
  selectedAppWidget: null,
  selectGridItem: (selectedGridItem) =>
    set({ selectedGridItem, selectedAppWidget: null }),
  selectAppWidget: (selectedAppWidget) =>
    set({ selectedAppWidget, selectedGridItem: null }),
  clearSelection: () => set({ selectedGridItem: null, selectedAppWidget: null }),

  // 좌측 탭
  leftTab: "chat",
  setLeftTab: (leftTab) => set({ leftTab }),

  // 채팅
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "AIM Monitoring 에디터입니다. 위젯 탭에서 위젯을 드래그하거나, 채팅으로 도움을 요청하세요.",
    },
  ],
  isStreaming: false,
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length > 0)
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      return { messages: msgs };
    }),
  setStreaming: (isStreaming) => set({ isStreaming }),

  // 강조색
  accentColor: "#06b6d4",
  setAccentColor: (accentColor) => set({ accentColor }),
}));
