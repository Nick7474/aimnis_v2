"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import ScenarioChips from "./ScenarioChips";
import SpecBoard from "./SpecBoard";
import MagicSetupButton from "./MagicSetupButton";
import LiveBlueprint from "./LiveBlueprint";
import CreateHarnessBtn from "./CreateHarnessBtn";
import ChatArea from "./ChatArea";

// ─── 채팅 입력창 ──────────────────────────────────────────────
function ChatInput() {
  const { addMessage, updateLastMessage, isThinking, setIsThinking } = useHomeStore();
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
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "8px 10px",
        background: "var(--s2)",
        border: "1px solid var(--border2)",
        borderRadius: 10,
        flexShrink: 0,
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        placeholder="요구사항을 입력하세요..."
        rows={1}
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          resize: "none", fontSize: 11, color: "var(--t2)", lineHeight: 1.5,
          fontFamily: "var(--font)", maxHeight: 72, overflowY: "auto",
        }}
      />
      <button
        onClick={submit}
        disabled={!value.trim() || isThinking}
        style={{
          width: 28, height: 28, borderRadius: 7, border: "none",
          cursor: value.trim() && !isThinking ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          background: value.trim() && !isThinking
            ? "linear-gradient(135deg, var(--primary), oklch(52% 0.20 295))"
            : "var(--s3)",
          color: value.trim() && !isThinking ? "#fff" : "var(--t4)",
          transition: "all 0.15s",
          boxShadow: value.trim() && !isThinking ? "0 2px 10px oklch(55% 0.22 285 / .35)" : "none",
        }}
      >
        {isThinking ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff" }}
          />
        ) : (
          <Send size={11} />
        )}
      </button>
    </div>
  );
}

// ─── 좌측 AI 에이전트 패널 ────────────────────────────────────
function LeftPanel({ onMagicTrigger }: { onMagicTrigger: () => void }) {
  return (
    <div
      style={{
        width: 220, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--s1)", borderRight: "1px solid var(--border)",
        height: "100%", overflow: "hidden",
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
        <div
          style={{
            padding: "10px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: "linear-gradient(135deg, var(--primary), oklch(52% 0.20 295))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, flexShrink: 0,
              }}
            >✦</div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--t2)" }}>AI 어시스턴트</span>
          </div>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse 2s infinite" }} />
        </div>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "10px 12px 8px" }}>
          <div style={{ flex: 1, overflow: "hidden", minHeight: 0, marginBottom: 8 }}>
            <ChatArea />
          </div>
          <ChatInput />
        </div>
      </div>
    </div>
  );
}

// ─── 우측 하네스 미리보기 패널 ───────────────────────────────
function BlueprintPanel() {
  return (
    <div
      style={{
        width: 280, flexShrink: 0, display: "flex", flexDirection: "column",
        background: "var(--s1)", borderLeft: "1px solid var(--border)",
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
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
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
