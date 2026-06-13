"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowLeft, Sparkles, Loader2, ArrowRight, Paperclip } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { scenarios } from "@/data/scenarios";
import { cn } from "@/lib/utils";
import BlueprintCards from "./BlueprintCards";
import { HarnessLoader } from "@/components/shared/AIMILoader";

// localStorage 키
const LS_KEY = "aimnis_harness_draft";

interface AiResponse {
  message: string;
  question: string;
  blueprintUpdate?: { section: string; content: string };
  isComplete: boolean;
}

// ─── 채팅 버블 ───────────────────────────────────────────────
function ChatBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn("flex gap-2.5", role === "user" ? "justify-end" : "justify-start")}
    >
      {role === "assistant" && (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10 mt-0.5">
          <Bot className="h-3 w-3 text-brand-400" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          role === "user"
            ? "rounded-tr-sm text-white"
            : "rounded-tl-sm border border-white/[0.07] bg-white/[0.04] text-white/80"
        )}
        style={
          role === "user"
            ? { background: "linear-gradient(135deg, rgba(0,212,255,0.18), rgba(0,180,220,0.08))" }
            : undefined
        }
      >
        {content}
      </div>
    </motion.div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function ActiveWorkspace() {
  const {
    messages,
    addMessage,
    isThinking,
    setIsThinking,
    selectedScenario,
    turnCount,
    incrementTurn,
    isComplete,
    selectedSolution,
    blueprintMd,
    appendBlueprint,
    setBlueprint,
    setIsWorking,
    reset,
  } = useHomeStore();

  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const didAutoSend = useRef(false);

  // ─── 자동 첫 메시지 전송 ─────────────────────────────────────
  useEffect(() => {
    if (didAutoSend.current) return;
    if (!selectedScenario || messages.length > 0) return;
    const sc = scenarios.find((s) => s.id === selectedScenario);
    if (!sc) return;
    didAutoSend.current = true;

    // V1 호환: injection 필드 제거됨 → 라벨 사용
    const injection = sc.label;
    addMessage({ id: Date.now().toString(), role: "user", content: injection });
    callInterview([{ role: "user", content: injection }], 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScenario]);

  // ─── 스크롤 ──────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // ─── 인터뷰 API 호출 ─────────────────────────────────────────
  const callInterview = async (
    msgList: { role: string; content: string }[],
    currentTurn: number
  ) => {
    setIsThinking(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: msgList,
          scenario: selectedScenario ?? "energy",
          turnCount: currentTurn,
        }),
      });

      const raw = await res.text();
      let parsed: AiResponse;
      try {
        parsed = JSON.parse(raw);
      } catch {
        addMessage({ id: Date.now().toString(), role: "assistant", content: raw });
        return;
      }

      // AI 메시지 구성 (question은 별도 줄로)
      const aiContent = parsed.question
        ? `${parsed.message}\n\n→ ${parsed.question}`
        : parsed.message;

      addMessage({ id: Date.now().toString(), role: "assistant", content: aiContent });

      // Blueprint 업데이트
      if (parsed.blueprintUpdate) {
        const { section, content } = parsed.blueprintUpdate;
        const header = `## ${section}`;
        if (blueprintMd.includes(header)) {
          setBlueprint(
            blueprintMd.replace(
              new RegExp(`(## ${section}\\n)`),
              `$1${content}`
            )
          );
        } else {
          appendBlueprint(`\n## ${section}\n${content}`);
        }
      }
    } catch {
      addMessage({
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ AI 연결 오류입니다. Ollama 서버를 확인하세요.",
      });
    } finally {
      setIsThinking(false);
    }
  };

  // ─── 사용자 메시지 전송 ──────────────────────────────────────
  const handleSubmit = async () => {
    const text = inputValue.trim();
    if (!text || isThinking || isComplete) return;
    setInputValue("");

    const newMsg = { id: Date.now().toString(), role: "user" as const, content: text };
    addMessage(newMsg);
    incrementTurn();

    const newTurn = turnCount + 1;
    await callInterview(
      [...messages, { role: "user", content: text }],
      newTurn
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ─── Create Harness ──────────────────────────────────────────
  const router = useRouter();
  const [harnessLoading, setHarnessLoading] = useState(false);

  const handleCreateHarness = async () => {
    if (!isComplete || harnessLoading) return;
    setHarnessLoading(true);
    const solutionId = selectedSolution ?? "guard";

    // localStorage + sessionStorage 이중 저장 (탭 닫혀도 유지)
    const payload = JSON.stringify({
      solution: solutionId,
      md: blueprintMd,
      scenario: selectedScenario,
      savedAt: Date.now(),
    });
    try {
      localStorage.setItem(LS_KEY, payload);
      sessionStorage.setItem(LS_KEY, payload);
    } catch {
      // storage quota 예외 무시
    }

    await new Promise((r) => setTimeout(r, 900));
    router.push(`/editor?solution=${solutionId}&scenario=${selectedScenario ?? "energy"}`);
  };

  const scenarioData = scenarios.find((s) => s.id === selectedScenario);

  return (
    <div className="flex h-screen flex-col overflow-hidden pt-14">
      {/* AIMI 하네스 생성 로딩 오버레이 */}
      <HarnessLoader show={harnessLoading} />

      <div className="flex flex-1 overflow-hidden">
        {/* ─── 좌측: 채팅 (58%) ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-[58%] flex-col border-r border-white/[0.05] px-6 py-5"
        >
          {/* 상단 컴팩트 헤더 */}
          <div className="mb-4 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => { reset(); setIsWorking(false); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-white leading-tight">AI 아키텍트 인터뷰</h1>
              <p className="text-[11px] text-white/35">
                {scenarioData
                  ? <span>
                      <span style={{ color: scenarioData.color }}>{scenarioData.label}</span>
                      {" · "}
                      {isComplete ? "설계 완료" : `${turnCount}/3 진행 중`}
                    </span>
                  : "시나리오 준비 중..."}
              </p>
            </div>
            {/* 턴 인디케이터 */}
            <div className="ml-auto flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor:
                      turnCount > i
                        ? scenarioData?.color ?? "#735FE9"
                        : "rgba(255,255,255,0.1)",
                    boxShadow:
                      turnCount > i
                        ? `0 0 6px ${scenarioData?.color ?? "#735FE9"}80`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-0">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}

              {isThinking && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-brand-500/20 bg-brand-500/10">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <Bot className="h-3 w-3 text-brand-400" />
                    </motion.div>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm border border-white/[0.07] px-3.5 py-2.5" style={{ background: "rgba(0,212,255,0.04)" }}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white/35">설계 분석 중</span>
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.3 }}
                          className="h-1 w-1 rounded-full bg-brand-400"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* 입력 영역 또는 Create Harness */}
          <div className="flex-shrink-0 mt-4">
            <AnimatePresence mode="wait">
              {isComplete ? (
                /* ─ Create Harness 버튼 ─ */
                <motion.div
                  key="harness"
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.button
                    onClick={handleCreateHarness}
                    disabled={harnessLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: harnessLoading
                        ? "none"
                        : [
                            "0 0 0px rgba(0,212,255,0)",
                            "0 0 30px rgba(0,212,255,0.5)",
                            "0 0 0px rgba(0,212,255,0)",
                          ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="relative w-full overflow-hidden rounded-2xl py-4 text-base font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #5a3ee1, #735FE9, #5a3ee1)" }}
                  >
                    {harnessLoading ? (
                      <span className="flex items-center justify-center gap-2 opacity-60">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        생성 중...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Create Harness
                      </span>
                    )}

                    {/* 빛나는 스캔 라인 */}
                    {!harnessLoading && (
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        className="pointer-events-none absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                    )}
                  </motion.button>
                  <p className="mt-2 text-center text-[10px] text-white/25">
                    3가지 핵심 정보 수집 완료 — 맞춤 하네스 생성 준비됨
                  </p>
                </motion.div>
              ) : (
                /* ─ 텍스트 입력창 ─ */
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 focus-within:border-brand-500/30 transition-colors">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={isThinking}
                      placeholder="답변을 입력하세요… (Shift+Enter 줄바꿈)"
                      rows={2}
                      className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none disabled:opacity-50"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <Paperclip className="h-3.5 w-3.5 text-white/20" />
                        <span className="text-[10px] text-white/20">파일 첨부</span>
                      </div>
                      <motion.button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!inputValue.trim() || isThinking}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-xl transition-all",
                          inputValue.trim() && !isThinking
                            ? "bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/30"
                            : "bg-white/5 text-white/20"
                        )}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─── 우측: 블루프린트 카드 (42%) ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-[42%] flex-col p-5"
        >
          <div className="mb-3 flex-shrink-0">
            <h2 className="text-xs font-semibold text-white/40">Live Blueprint</h2>
            <p className="text-[10px] text-white/20 mt-0.5">
              대화 내용이 실시간으로 설계 카드에 반영됩니다
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <BlueprintCards />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
