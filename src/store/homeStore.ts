import { create } from "zustand";
import { requiredInfoMap } from "@/data/scenarios";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface HomeState {
  // 시나리오
  selectedScenario: "energy" | "manufacturing" | "smartcity" | null;
  setSelectedScenario: (id: "energy" | "manufacturing" | "smartcity" | null) => void;

  // 대화
  messages: Message[];
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
  isThinking: boolean;
  setIsThinking: (v: boolean) => void;

  // 정보 수집
  collectedInfo: Record<string, string | null>;
  updateCollectedInfo: (key: string, value: string) => void;
  isComplete: boolean;

  // Blueprint MD
  blueprintMd: string;
  appendBlueprint: (content: string) => void;
  setBlueprint: (md: string) => void;

  // 리셋
  reset: () => void;
}

const initialState = {
  selectedScenario: null as "energy" | "manufacturing" | "smartcity" | null,
  messages: [] as Message[],
  isThinking: false,
  collectedInfo: {} as Record<string, string | null>,
  isComplete: false,
  blueprintMd: "",
};

export const useHomeStore = create<HomeState>((set, get) => ({
  ...initialState,

  setSelectedScenario: (id) => {
    const keys = id ? requiredInfoMap[id] ?? [] : [];
    const collectedInfo: Record<string, string | null> = {};
    keys.forEach((k) => (collectedInfo[k] = null));
    set({
      selectedScenario: id,
      collectedInfo,
      isComplete: false,
      messages: [],
      blueprintMd: id
        ? `# ${
            id === "energy"
              ? "국가 에너지 관제"
              : id === "manufacturing"
              ? "제조 비전 관제"
              : "스마트시티 대응"
          } 아키텍처 설계서\n\n## Project Info\n- 도메인: ${id}\n- 생성일: ${new Date().toLocaleDateString("ko-KR")}\n- 상태: 인터뷰 진행 중...\n\n## Requirements\n\n## Widgets\n\n## API Mapping\n\n## Pages\n`
        : "",
    });
  },

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      return { messages: msgs };
    }),

  setIsThinking: (isThinking) => set({ isThinking }),

  updateCollectedInfo: (key, value) => {
    set((s) => {
      const updated = { ...s.collectedInfo, [key]: value };
      const allFilled = Object.values(updated).every((v) => v !== null && v !== "");
      return { collectedInfo: updated, isComplete: allFilled };
    });
  },

  appendBlueprint: (content) =>
    set((s) => ({ blueprintMd: s.blueprintMd + content })),

  setBlueprint: (blueprintMd) => set({ blueprintMd }),

  reset: () =>
    set({
      ...initialState,
      collectedInfo: {},
    }),
}));
