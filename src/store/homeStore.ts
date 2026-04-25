import { create } from "zustand";
import {
  type ScenarioId,
  type SpecQuestionId,
  scenarioMap,
  REQUIRED_QUESTIONS,
  specGroups,
  specQuestionMap
} from "@/data/scenarios";

// ─── 채팅 메시지 (좌측 보조 패널용) ────────────────────────────
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

// ─── Spec 선택 상태 ──────────────────────────────────────────
export type SelectedSpecs = Record<string, string | string[] | null>;

const EMPTY_SPECS: SelectedSpecs = {};
if (typeof REQUIRED_QUESTIONS !== 'undefined') {
  REQUIRED_QUESTIONS.forEach(id => {
    EMPTY_SPECS[id] = null;
  });
}

// ─── MD 생성 헬퍼 ────────────────────────────────────────────

function generateWidgets(specs: SelectedSpecs): string {
  return "- VMS 연동 위젯\n- 지능형 CCTV 모니터링 뷰\n- 3D 로케이션 맵\n- AI 알람 이벤트 티커";
}

function generateApiMapping(specs: SelectedSpecs): string {
  return "- GET /api/vms/streams\n- WS /ws/surveillance/alerts\n- GET /api/dashboard/stats";
}

function formatSpecValue(val: string | string[] | null): string {
  if (!val) return "선택 대기 중...";
  if (Array.isArray(val)) {
    return val.length > 0 ? val.join(", ") : "선택 대기 중...";
  }
  return val;
}

function buildBlueprintMd(
  scenarioId: ScenarioId | null,
  specs: SelectedSpecs
): string {
  if (!scenarioId) return "";
  const s = scenarioMap[scenarioId];
  const isComplete = REQUIRED_QUESTIONS.every(id => {
    const val = specs[id];
    if (Array.isArray(val)) return val.length > 0;
    return !!val;
  });
  
  const status = isComplete ? "설계 확정" : "설계 중...";

  let md = `# ${s.label} 아키텍처 설계서\n\n`;
  md += `## 프로젝트 정보\n`;
  md += `- 도메인: ${s.label} (${s.subLabel})\n`;
  md += `- 생성일: ${new Date().toLocaleDateString("ko-KR")}\n`;
  md += `- 상태: ${status}\n\n`;

  specGroups.forEach(group => {
    md += `## ${group.label}\n`;
    group.questions.forEach(q => {
      const val = specs[q.id];
      const answered = Array.isArray(val) ? val.length > 0 : !!val;
      md += `${answered ? "- ✅" : "- ⬜"} **${q.label}**\n  - ${formatSpecValue(val)}\n`;
    });
    md += "\n";
  });

  md += `## Widgets\n${generateWidgets(specs)}\n\n`;
  md += `## API Mapping\n${generateApiMapping(specs)}\n`;

  return md;
}

// ─── Store 인터페이스 ─────────────────────────────────────────
interface HomeState {
  selectedScenario: ScenarioId | null;
  setSelectedScenario: (id: ScenarioId | null) => void;

  selectedSpecs: SelectedSpecs;
  updateSpec: (questionId: SpecQuestionId, value: string) => void;
  clearSpecs: () => void;

  applyMagicDefault: () => void;
  isMagicAnimating: boolean;
  setMagicAnimating: (v: boolean) => void;

  blueprintMd: string;
  isComplete: boolean;

  messages: Message[];
  addMessage: (msg: Message) => void;
  updateLastMessage: (content: string) => void;
  isThinking: boolean;
  setIsThinking: (v: boolean) => void;

  reset: () => void;

  isWorking: boolean;
  setIsWorking: (v: boolean) => void;
  turnCount: number;
  incrementTurn: () => void;
  appendBlueprint: (content: string) => void;
  setBlueprint: (md: string) => void;

  isGenerating: boolean;
  generateHarness: (provider?: string) => Promise<void>;
}

// ─── 초기 상태 ───────────────────────────────────────────────
const initialState = {
  selectedScenario: null as ScenarioId | null,
  selectedSpecs: { ...EMPTY_SPECS },
  isMagicAnimating: false,
  blueprintMd: "",
  isComplete: false,
  messages: [] as Message[],
  isThinking: false,
  isWorking: false,
  turnCount: 0,
  isGenerating: false,
};

// ─── Store 구현 ──────────────────────────────────────────────
export const useHomeStore = create<HomeState>((set, get) => ({
  ...initialState,

  setSelectedScenario: (id) => {
    const specs = { ...EMPTY_SPECS };
    set({
      selectedScenario: id,
      selectedSpecs: specs,
      isComplete: false,
      blueprintMd: id ? buildBlueprintMd(id, specs) : "",
      messages: [],
    });
  },

  updateSpec: (questionId, value) => {
    const { selectedScenario, selectedSpecs } = get();
    const q = specQuestionMap[questionId];
    if (!q) return;

    let nextVal: string | string[] | null = value;
    
    if (q.multiple) {
      const currentArr = Array.isArray(selectedSpecs[questionId]) 
        ? (selectedSpecs[questionId] as string[]) 
        : [];
      if (currentArr.includes(value)) {
        nextVal = currentArr.filter(v => v !== value);
      } else {
        nextVal = [...currentArr, value];
      }
    } else {
      nextVal = selectedSpecs[questionId] === value ? null : value;
    }

    const nextSpecs: SelectedSpecs = {
      ...selectedSpecs,
      [questionId]: nextVal,
    };

    const isComplete = REQUIRED_QUESTIONS.every(id => {
      const v = nextSpecs[id];
      if (Array.isArray(v)) return v.length > 0;
      return !!v;
    });

    set({
      selectedSpecs: nextSpecs,
      isComplete,
      blueprintMd: buildBlueprintMd(selectedScenario, nextSpecs),
    });
  },

  clearSpecs: () => {
    const { selectedScenario } = get();
    const specs = { ...EMPTY_SPECS };
    set({
      selectedSpecs: specs,
      isComplete: false,
      blueprintMd: selectedScenario ? buildBlueprintMd(selectedScenario, specs) : "",
    });
  },

  applyMagicDefault: () => {
    const { selectedScenario } = get();
    if (!selectedScenario) return;
    const { defaultSpecs } = scenarioMap[selectedScenario];
    const next: SelectedSpecs = { ...EMPTY_SPECS };
    
    Object.keys(defaultSpecs).forEach(k => {
      if (defaultSpecs[k]) {
        next[k] = defaultSpecs[k] as string | string[];
      }
    });

    set({
      selectedSpecs: next,
      isComplete: true,
      blueprintMd: buildBlueprintMd(selectedScenario, next),
    });
  },

  setMagicAnimating: (isMagicAnimating) => set({ isMagicAnimating }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  updateLastMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      return { messages: msgs };
    }),
  setIsThinking: (isThinking) => set({ isThinking }),

  reset: () => set({ ...initialState, selectedSpecs: { ...EMPTY_SPECS } }),

  setIsWorking: (isWorking) => set({ isWorking }),
  incrementTurn: () => set((s) => ({ turnCount: s.turnCount + 1 })),
  appendBlueprint: (content) => set((s) => ({ blueprintMd: s.blueprintMd + content })),
  setBlueprint: (md) => set({ blueprintMd: md }),

  // ─── Harness AI 생성 ─────────────────────────────────────────
  generateHarness: async (provider = "gemini-flash-lite") => {
    const { selectedScenario, selectedSpecs } = get();
    if (!selectedScenario) return;

    set({ isGenerating: true, blueprintMd: "" });

    try {
      const scenarioLabel = scenarioMap[selectedScenario]?.label ?? selectedScenario;
      const res = await fetch("/api/harness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioLabel, specs: selectedSpecs, provider }),
      });

      if (!res.ok || !res.body) throw new Error("harness API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        set({ blueprintMd: full });
      }

      set({ isComplete: true });
    } catch {
      // fallback: 정적 blueprint
      set({ blueprintMd: buildBlueprintMd(selectedScenario, get().selectedSpecs) });
    } finally {
      set({ isGenerating: false });
    }
  },
}));
