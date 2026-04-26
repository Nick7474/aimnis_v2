"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Mic } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { useLLMStore } from "@/store/llmStore";
import ProviderPicker from "@/components/shared/ProviderPicker";
import ScenarioChips from "./ScenarioChips";
import SpecBoard from "./SpecBoard";
import MagicSetupButton from "./MagicSetupButton";
import LiveBlueprint from "./LiveBlueprint";
import CreateHarnessBtn from "./CreateHarnessBtn";
import ChatArea from "./ChatArea";

// ─── 채팅 입력창 ──────────────────────────────────────────────
function ChatInput() {
  const { addMessage, updateLastMessage, isThinking, setIsThinking } = useHomeStore();
  const { provider } = useLLMStore();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(async () => {
    const text = value.trim();
    if (!text || isThinking) return;
    setValue("");

    addMessage({ id: `u-${Date.now()}`, role: "user", content: text });
    setIsThinking(true);

    try {
      const { messages, selectedScenario } = useHomeStore.getState();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: text }],
          solution: selectedScenario ?? "guard",
          provider,
        }),
      });

      if (!res.ok) throw new Error("API 오류");
      if (!res.body) throw new Error("Stream 없음");

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
  }, [value, isThinking, addMessage, setIsThinking, updateLastMessage]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 focus-within:border-purple-500/30 transition-colors"
      style={{ flexShrink: 0 }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="요구사항을 입력하세요..."
        rows={2}
        className="w-full resize-none bg-transparent px-3 pt-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none"
        style={{ maxHeight: 72 }}
      />
      <div className="flex items-center justify-between px-2 pb-2">
        <div className="flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors" title="이미지 첨부">
            <Paperclip className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors" title="음성 입력">
            <Mic className="h-3.5 w-3.5" />
          </button>
        </div>
      <button
        onClick={submit}
        disabled={!value.trim() || isThinking}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg transition-all ${
          value.trim() && !isThinking
            ? "bg-purple-600 text-white hover:bg-purple-500"
            : "bg-white/5 text-white/20"
        }`}
      >
        {isThinking ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white"
          />
        ) : (
          <Send size={11} />
        )}
      </button>
      </div>
    </div>
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

      {/* AI 어시스턴트 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5" style={{ flexShrink: 0 }}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">AI 어시스턴트</p>
          <ProviderPicker compact />
        </div>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "8px 10px 10px" }}>
          <div style={{ flex: 1, overflow: "hidden", minHeight: 0, marginBottom: 8 }}>
            <ChatArea />
          </div>
          <ChatInput />
        </div>
      </div>
    </div>
    {/* 드래그 리사이즈 핸들 */}
    <div
      onMouseDown={onMouseDown}
      style={{
        width: 6, flexShrink: 0, cursor: "col-resize",
        background: "var(--border)",
        borderRight: "1px solid var(--border)",
        position: "relative",
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
