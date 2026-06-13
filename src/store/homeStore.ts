import { create } from "zustand";
import {
  type ScenarioId,
  type SpecQuestionId,
  getScenarioConfig,
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
const DEFAULT_CONFIG = getScenarioConfig("guard");
DEFAULT_CONFIG.requiredQuestions.forEach(id => {
  EMPTY_SPECS[id] = null;
});

function createEmptySpecs(solutionId?: string | null): SelectedSpecs {
  const specs: SelectedSpecs = {};
  getScenarioConfig(solutionId).requiredQuestions.forEach(id => {
    specs[id] = null;
  });
  return specs;
}

// ─── MD 생성 헬퍼 ────────────────────────────────────────────

function generateWidgets(specs: SelectedSpecs, solutionId?: string | null): string {
  if (solutionId === "monitoring") {
    return [
      "- 초음파 아크 위험도: 아크/코로나 초기 징후 모니터링",
      "- 진동 FFT 스펙트럼: 1X/2X/3X 피크와 베어링 이상 감지",
      "- 복합 센서 헬스 매트릭스: 초음파·진동·열·가스 통합 상태",
      "- 작업자 SpO2/낙상 상태: 현장 작업자 안전 관제",
      "- SOP 자동 실행: 위험 등급별 조치 흐름 자동화",
    ].join("\n");
  }
  return "- VMS 연동 위젯\n- 지능형 CCTV 모니터링 뷰\n- 3D 로케이션 맵\n- AI 알람 이벤트 티커";
}

function generateApiMapping(specs: SelectedSpecs, solutionId?: string | null): string {
  if (solutionId === "monitoring") {
    return [
      "- MQTT /sensors/ultrasonic: 초음파 아크 위험 이벤트",
      "- MQTT /sensors/vibration: 3축 진동/FFT 데이터",
      "- REST /api/monitoring/equipment-health: 설비 상태 및 RUL",
      "- REST /api/worker-safety/status: SpO2, IMU, 낙상 상태",
      "- WS /ws/monitoring/alerts: 실시간 경보 및 SOP 이벤트",
    ].join("\n");
  }
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
  specs: SelectedSpecs,
  solutionId?: string | null
): string {
  if (!scenarioId) return "";
  const config = getScenarioConfig(solutionId);
  const s = config.scenarioMap[scenarioId];
  const isComplete = config.requiredQuestions.every(id => {
    const val = specs[id];
    if (Array.isArray(val)) return val.length > 0;
    return !!val;
  });
  
  const status = isComplete ? "설계 확정" : "설계 중...";

  let md = `# ${solutionId === "monitoring" ? "AIM Monitoring" : s.label} ${solutionId === "monitoring" ? "Harness 설계서" : "아키텍처 설계서"}\n\n`;
  md += `## 프로젝트 정보\n`;
  md += `- 도메인: ${s.label} (${s.subLabel})\n`;
  md += `- 솔루션: ${solutionId === "monitoring" ? "AIM Monitoring" : "AIM GUARD"}\n`;
  md += `- 생성일: ${new Date().toLocaleDateString("ko-KR")}\n`;
  md += `- 상태: ${status}\n\n`;

  config.specGroups.forEach(group => {
    md += `## ${group.label}\n`;
    group.questions.forEach(q => {
      const val = specs[q.id];
      const answered = Array.isArray(val) ? val.length > 0 : !!val;
      md += `${answered ? "- ✅" : "- ⬜"} **${q.label}**\n  - ${formatSpecValue(val)}\n`;
    });
    md += "\n";
  });

  md += `## 추천 위젯 구성\n${generateWidgets(specs, solutionId)}\n\n`;
  md += `## API/Data Mapping\n${generateApiMapping(specs, solutionId)}\n`;

  return md;
}

// ─── Store 인터페이스 ─────────────────────────────────────────
interface HomeState {
  selectedSolution: string | null;
  setSelectedSolution: (id: string | null) => void;

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
  selectedSolution: null as string | null,
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

  setSelectedSolution: (id) => set({
    selectedSolution: id,
    selectedScenario: null,
    selectedSpecs: createEmptySpecs(id),
    isComplete: false,
    blueprintMd: "",
    messages: [],
  }),

  setSelectedScenario: (id) => {
    const { selectedSolution } = get();
    const specs = createEmptySpecs(selectedSolution);
    set({
      selectedScenario: id,
      selectedSpecs: specs,
      isComplete: false,
      blueprintMd: id ? buildBlueprintMd(id, specs, selectedSolution) : "",
      messages: [],
    });
  },

  updateSpec: (questionId, value) => {
    const { selectedScenario, selectedSolution, selectedSpecs } = get();
    const config = getScenarioConfig(selectedSolution);
    const q = config.specQuestionMap[questionId];
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

    const isComplete = config.requiredQuestions.every(id => {
      const v = nextSpecs[id];
      if (Array.isArray(v)) return v.length > 0;
      return !!v;
    });

    set({
      selectedSpecs: nextSpecs,
      isComplete,
      blueprintMd: buildBlueprintMd(selectedScenario, nextSpecs, selectedSolution),
    });
  },

  clearSpecs: () => {
    const { selectedScenario, selectedSolution } = get();
    const specs = createEmptySpecs(selectedSolution);
    set({
      selectedSpecs: specs,
      isComplete: false,
      blueprintMd: selectedScenario ? buildBlueprintMd(selectedScenario, specs, selectedSolution) : "",
    });
  },

  applyMagicDefault: () => {
    const { selectedScenario, selectedSolution } = get();
    if (!selectedScenario) return;
    const config = getScenarioConfig(selectedSolution);
    const { defaultSpecs } = config.scenarioMap[selectedScenario];
    const next: SelectedSpecs = createEmptySpecs(selectedSolution);
    
    Object.keys(defaultSpecs).forEach(k => {
      if (defaultSpecs[k]) {
        next[k] = defaultSpecs[k] as string | string[];
      }
    });

    set({
      selectedSpecs: next,
      isComplete: true,
      blueprintMd: buildBlueprintMd(selectedScenario, next, selectedSolution),
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
    const { selectedScenario, selectedSolution, selectedSpecs } = get();
    if (!selectedScenario) return;

    set({ isGenerating: true, blueprintMd: "" });

    try {
      const config = getScenarioConfig(selectedSolution);
      const scenarioLabel = config.scenarioMap[selectedScenario]?.label ?? selectedScenario;
      const res = await fetch("/api/harness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioLabel, solution: selectedSolution ?? "guard", specs: selectedSpecs, provider }),
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
      set({ blueprintMd: buildBlueprintMd(selectedScenario, get().selectedSpecs, selectedSolution) });
    } finally {
      set({ isGenerating: false });
    }
  },
}));
