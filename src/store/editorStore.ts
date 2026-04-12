import { create } from "zustand";
import type { Node, Edge } from "reactflow";

// ─── 타입 ─────────────────────────────────────────────────────

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

type RightPanel = "mapping" | "settings";

// ─── 스토어 ───────────────────────────────────────────────────

interface EditorState {
  // 캔버스
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  // 채팅
  messages: ChatMessage[];
  isStreaming: boolean;

  // 우측 패널
  rightPanel: RightPanel;
  mappings: Record<string, NodeMapping>;

  // 브랜드 설정
  brand: BrandSettings;

  // 퍼블리시
  publishedUrl: string | null;
  isFullscreen: boolean;

  // 액션 — 캔버스
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (nodeId: string | null) => void;
  addNode: (node: Node) => void;

  // 액션 — 채팅
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setStreaming: (v: boolean) => void;

  // 액션 — 패널
  setRightPanel: (panel: RightPanel) => void;
  updateMapping: (nodeId: string, mapping: Partial<NodeMapping>) => void;

  // 액션 — 브랜드
  updateBrand: (partial: Partial<BrandSettings>) => void;

  // 액션 — 퍼블리시
  setPublishedUrl: (url: string | null) => void;
  setFullscreen: (v: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,

  messages: [
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! AIMNIS 에디터입니다.\n솔루션 하네스를 수정하거나 새 위젯을 추가하려면 명령을 입력하세요.",
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

  publishedUrl: null,
  isFullscreen: false,

  // 캔버스
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (selectedNodeId) =>
    set({ selectedNodeId, rightPanel: selectedNodeId ? "mapping" : "settings" }),
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),

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

  // 퍼블리시
  setPublishedUrl: (publishedUrl) => set({ publishedUrl }),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
}));
