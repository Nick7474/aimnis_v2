"use client";

import { useState, useRef, useCallback } from "react";
import { captureUsageFromResponse } from "@/store/usageStore";
import { motion } from "framer-motion";
import { useHomeStore } from "@/store/homeStore";

// 전문가 추천 세팅 트리거 키워드
const EXPERT_TRIGGERS = [
  "전문가 추천", "추천 세팅", "추천 설정", "추천으로",
  "자동으로", "알아서 해줘", "다 선택", "한번에",
  "빠르게 설정", "기본값", "디폴트", "최적으로",
  "전문가처럼", "그냥 해줘", "바로 해줘", "알아서",
  "자동 설정", "자동 적용", "빠르게",
];

const EXPERT_RESPONSE: Record<string, string> = {
  energy:       "에너지 시설 전문가 추천 세팅을 적용했습니다.\n500대+ CCTV, 24/365 운영, 하이브리드 스토리지 기준으로\n자동 구성했습니다. 우측에서 세부 조정 가능합니다.",
  manufacturing:"스마트 제조 추천 세팅을 적용했습니다.\nHanwha Wisenet VMS, 2교대 운영, 화재·침입\n중점 관제로 구성했습니다.",
  smartcity:    "스마트시티 표준 추천 세팅을 적용했습니다.\nMilestone XProtect, 경찰/소방 자동 신고 연동,\n24/365 관제로 구성했습니다.",
  default:      "전문가 추천 세팅을 적용했습니다.\n시나리오를 먼저 선택하면 더 정확한 설정을 제공할 수 있습니다.",
};

const MONITORING_EXPERT_RESPONSE: Record<string, string> = {
  energy:       "AIM Monitoring 에너지 설비 추천 세팅을 적용했습니다.\n초음파 아크, 열/온도, 가스, 진동 센서와 F2-score 안전 우선 AI 진단 기준으로 구성했습니다.",
  manufacturing:"AIM Monitoring 스마트 제조 추천 세팅을 적용했습니다.\n3축 진동 FFT, CNN-LSTM 스펙트로그램, Autoencoder 이상탐지와 예지보전 리포트를 중심으로 구성했습니다.",
  smartcity:    "AIM Monitoring 공공·환경 안전 추천 세팅을 적용했습니다.\n가스, SpO2, IMU/Gyro, 작업자 낙상 감지와 SOP 자동 실행 기준으로 구성했습니다.",
  default:      "AIM Monitoring 전문가 추천 세팅을 적용했습니다.\n시나리오를 먼저 선택하면 설비·센서·AI 모델 기준을 더 정확하게 구성할 수 있습니다.",
};
import AiChatInput from "@/components/shared/AiChatInput";
import ScenarioChips from "./ScenarioChips";
import SpecBoard from "./SpecBoard";
import MagicSetupButton from "./MagicSetupButton";
import LiveBlueprint from "./LiveBlueprint";
import CreateHarnessBtn from "./CreateHarnessBtn";
import ChatArea from "./ChatArea";

// ─── 채팅 입력창 (AiChatInput 사용) ─────────────────────────
function ChatInput() {
  const { addMessage, updateLastMessage, isThinking, setIsThinking } = useHomeStore();
  const [value, setValue] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  const { applyMagicDefault, selectedScenario } = useHomeStore();

  const submit = useCallback(async () => {
    const text = value.trim();
    if ((!text && attachedImages.length === 0) || isThinking) return;

    // ── 전문가 추천 감지 (클라이언트 사이드, API 불필요) ──
    const lower = text.toLowerCase();
    const isExpertTrigger = EXPERT_TRIGGERS.some(kw => lower.includes(kw.toLowerCase()));
    if (isExpertTrigger) {
      const { selectedScenario: currentScenario, selectedSolution } = useHomeStore.getState();
      setValue("");
      addMessage({ id: `u-${Date.now()}`, role: "user", content: text });
      applyMagicDefault();
      const responseMap = selectedSolution === "monitoring" ? MONITORING_EXPERT_RESPONSE : EXPERT_RESPONSE;
      const response = responseMap[currentScenario ?? "default"] ?? responseMap.default;
      setTimeout(() => {
        addMessage({ id: `a-${Date.now()}`, role: "assistant", content: response });
      }, 300);
      return;
    }

    const userContent = attachedImages.length > 0
      ? [{ type: "text", text }, ...attachedImages.map(img => ({ type: "image_url", url: img }))]
      : text;

    setValue("");
    setAttachedImages([]);
    addMessage({ id: `u-${Date.now()}`, role: "user", content: text });
    setIsThinking(true);

    try {
      const { messages, selectedSolution } = useHomeStore.getState();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: typeof userContent === "string" ? userContent : text }],
          solution: selectedSolution ?? "guard",
        }),
      });

      captureUsageFromResponse(res); // usage 캡처

      if (!res.ok || !res.body) throw new Error();
      addMessage({ id: `a-${Date.now()}`, role: "assistant", content: "" });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantContent = "";
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (chunk) {
          const decoded = decoder.decode(chunk, { stream: true });
          if (decoded.includes("__WIDGET_JSON__")) {
            assistantContent += decoded.split("__WIDGET_JSON__")[0];
            updateLastMessage(assistantContent);
            break;
          } else {
            assistantContent += decoded;
            updateLastMessage(assistantContent);
          }
        }
        if (done) break;
      }
    } catch {
      addMessage({ id: `a-${Date.now()}`, role: "assistant", content: "API 응답에 오류가 발생했습니다." });
    } finally {
      setIsThinking(false);
    }
  }, [value, attachedImages, isThinking, addMessage, setIsThinking, updateLastMessage]);

  return (
    <AiChatInput
      value={value}
      onChange={setValue}
      onSubmit={submit}
      isLoading={isThinking}
      placeholder="요구사항을 입력하세요..."
      attachedImages={attachedImages}
      onImagesChange={setAttachedImages}
      className="flex-shrink-0"
    />
  );
}

const MIN_W = 220;
const MAX_W = 550; // 220 * 2.5

// ─── 좌측 AI 에이전트 패널 (리사이즈 가능) ───────────────────
function LeftPanel({ onMagicTrigger }: { onMagicTrigger: () => void }) {
  const [panelWidth, setPanelWidth] = useState(MIN_W);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(MIN_W);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = panelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX.current;
      const next = Math.min(MAX_W, Math.max(MIN_W, startW.current + delta));
      setPanelWidth(next);
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div style={{ position: "relative", flexShrink: 0, height: "100%", display: "flex" }}>
    <div
      style={{
        width: panelWidth, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--s1)",
        height: "100%", overflow: "hidden",
        transition: dragging.current ? "none" : "width 0.05s",
      }}
    >
      {/* 시나리오 칩 */}
      <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ padding: "0 14px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "var(--t4)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
            최근 작업
          </span>
          <button style={{ fontSize: 16, background: "none", border: "none", cursor: "pointer", color: "var(--t3)", lineHeight: 1 }}>+</button>
        </div>
        <div style={{ padding: "0 8px" }}>
          <ScenarioChips onMagicTrigger={onMagicTrigger} />
        </div>
      </div>

      {/* 에임이 헤더 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div className="flex items-center gap-2.5 border-b border-white/5 px-3 py-2" style={{ flexShrink: 0 }}>
          <img src="/img/ch6.png" alt="에임이" className="h-8 w-8 flex-shrink-0 rounded-full ring-1 ring-violet-500/25 object-cover" />
          <div>
            <p className="text-[12px] font-semibold text-white/80 leading-tight">에임이 · AIMI</p>
            <p className="text-[10px] text-white/30 leading-tight">설계 어시스턴트</p>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "8px 10px 10px", minHeight: 0 }}>
          {/* flex 컨테이너로 ChatArea에 높이 전달 → overflow-y-auto 작동 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, marginBottom: 8, overflow: "hidden" }}>
            <ChatArea />
          </div>
          <div style={{ flexShrink: 0 }}>
            <ChatInput />
          </div>
        </div>
      </div>
    </div>
    {/* 1px 드래그 핸들 */}
    <div
      onMouseDown={onMouseDown}
      style={{
        width: 1, flexShrink: 0, cursor: "col-resize",
        background: "var(--border)",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--primary)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--border)")}
    />
    </div>
  );
}

// ─── 우측 하네스 미리보기 패널 ───────────────────────────────
function BlueprintPanel() {
  return (
    <div
      style={{
        width: 280, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--s1)",
        borderLeft: "1px solid var(--border)",
        height: "100%", overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)" }}>AI 생성 미리보기</span>
        <p style={{ fontSize: 11, color: "var(--t3)", margin: "4px 0 0", lineHeight: 1.5 }}>
          대화 내용을 바탕으로 실시간 설계서가 작성됩니다
        </p>
      </div>

      {/* Blueprint 본문 */}
      <div style={{ flex: 1, overflow: "hidden", padding: "12px 14px" }}>
        <LiveBlueprint />
      </div>

      {/* Create Harness 버튼 */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <CreateHarnessBtn />
      </div>
    </div>
  );
}

// ─── 메인 레이아웃 ────────────────────────────────────────────
export default function HomeV2() {
  const [animatingSpecs, setAnimatingSpecs] = useState<Partial<Record<string, string>>>({});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        marginTop: 48,
        height: "calc(100vh - 48px)",
        overflow: "hidden",
        background: "var(--bg)",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* 좌측: AI 에이전트 (220px — Spec Board HTML 좌측 패널 패턴) */}
      <LeftPanel onMagicTrigger={() => setAnimatingSpecs({})} />

      {/* 중앙: Spec Board (flex:1 — HTML 중앙 컨텐츠 패턴) */}
      <div
        style={{
          flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0,
          background: "var(--bg)",
        }}
      >
        <SpecBoard
          animatingSpecs={animatingSpecs}
          renderHeaderExtra={<MagicSetupButton onAnimatingChange={setAnimatingSpecs} />}
        />
      </div>

      {/* 우측: 하네스 미리보기 (280px — Spec Board HTML 우측 패널 패턴) */}
      <BlueprintPanel />
    </motion.div>
  );
}
