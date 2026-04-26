"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, ChevronRight, Terminal, Sparkles, Paperclip, Mic } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { useLLMStore } from "@/store/llmStore";
import ProviderPicker from "@/components/shared/ProviderPicker";
import { cn } from "@/lib/utils";
import { computeNextPosition, getWidgetSize } from "./SmartGridEngine";
import type { WidgetData } from "@/store/editorStore";

const LOGS = [
  "✓ solution loader initialized",
  "✓ harness-schema.json loaded",
  "✓ SmartGridEngine ready",
  "✓ Gemini widget engine ready",
  "✓ Sonnet+Opus advisor connected",
  "→ waiting for user input...",
];

const QUICK_HINTS = ["KPI 카드 추가", "라인 차트 추가", "알람 패널", "게이지 추가"];

interface ChatPanelProps {
  solutionId: string;
}

function extractDisplayText(content: string): string {
  const idx = content.indexOf("__WIDGET_JSON__");
  return idx === -1 ? content : content.slice(0, idx).trim();
}

function WidgetBadge({ type, title }: { type: string; title: string }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="mt-2 flex items-center gap-1.5 rounded-lg bg-purple-500/15 px-2 py-1 ring-1 ring-purple-500/25"
    >
      <Sparkles className="h-3 w-3 text-purple-400" />
      <span className="text-[10px] font-medium text-purple-300">
        {title} <span className="text-purple-400/60">({type})</span>
      </span>
    </motion.div>
  );
}

export default function ChatPanel({ solutionId }: ChatPanelProps) {
  const {
    messages,
    isStreaming,
    addMessage,
    updateLastMessage,
    setStreaming,
    setLastCommand,
    overlayWidgets,
    addOverlayWidget,
    canvasSize,
  } = useEditorStore();

  const { provider } = useLLMStore();
  const [input, setInput] = useState("");
  const [logsOpen, setLogsOpen] = useState(false);
  const [widgetBadges, setWidgetBadges] = useState<
    Record<string, { type: string; title: string }>
  >({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const processedJsonIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SmartGridEngine으로 위치 계산 후 오버레이 위젯 추가
  const addWidgetOverlay = (payload: {
    widgetId: string;
    type: string;
    title: string;
    data: WidgetData;
  }) => {
    const { w, h } = getWidgetSize(payload.type);
    const existing = overlayWidgets.map((ow) => ({
      x: ow.x, y: ow.y, w: ow.w, h: ow.h,
    }));
    const { x, y } = computeNextPosition(
      canvasSize.w,
      canvasSize.h,
      existing,
      payload.type
    );
    addOverlayWidget({
      id: payload.widgetId,
      type: payload.type,
      title: payload.title,
      data: payload.data,
      x, y, w, h,
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: text };
    addMessage(userMsg);

    const aiId = (Date.now() + 1).toString();
    addMessage({ id: aiId, role: "assistant", content: "", streaming: true });
    setStreaming(true);

    try {
      const apiMessages = [...messages, userMsg]
        .filter((m) => !(m as { streaming?: boolean }).streaming)
        .map((m) => ({
          role: m.role,
          content: extractDisplayText(m.content),
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, solution: solutionId, provider }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          updateLastMessage(full);
        }
      }

      setLastCommand({ userText: text, aiResponse: full, timestamp: Date.now() });

      // __WIDGET_JSON__ 파싱 → 오버레이 위젯 추가
      const markerIdx = full.indexOf("__WIDGET_JSON__");
      if (markerIdx !== -1 && !processedJsonIds.current.has(aiId)) {
        processedJsonIds.current.add(aiId);
        try {
          const jsonStr = full.slice(markerIdx + "__WIDGET_JSON__".length).trim();
          const parsed = JSON.parse(jsonStr);
          if (parsed.action === "add_widget" && parsed.widget) {
            addWidgetOverlay(parsed.widget);
            setWidgetBadges((prev) => ({
              ...prev,
              [aiId]: { type: parsed.widget.type, title: parsed.widget.title },
            }));
          }
        } catch {
          // JSON 파싱 실패 무시
        }
      }
    } catch {
      updateLastMessage("⚠️ API 연결 오류. ANTHROPIC_API_KEY를 확인하세요.");
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const displayText = extractDisplayText(msg.content);
            const badge = widgetBadges[msg.id];
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-purple-500/20 text-purple-100"
                      : "bg-white/5 text-white/80"
                  )}
                >
                  {displayText || (
                    <span className="flex items-center gap-1.5 text-white/30">
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      >
                        ●
                      </motion.span>
                      생각 중…
                    </span>
                  )}
                  {badge && <WidgetBadge type={badge.type} title={badge.title} />}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* 실행 로그 */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setLogsOpen((v) => !v)}
          className="flex w-full items-center gap-1.5 px-4 py-2 text-[10px] text-white/25 hover:text-white/50 transition-colors"
        >
          <Terminal className="h-3 w-3" />
          실행 로그
          {logsOpen ? (
            <ChevronDown className="h-3 w-3 ml-auto" />
          ) : (
            <ChevronRight className="h-3 w-3 ml-auto" />
          )}
        </button>
        <AnimatePresence>
          {logsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 pb-2"
            >
              {LOGS.map((log, i) => (
                <p key={i} className="font-mono text-[10px] text-white/20">
                  {log}
                </p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI 엔진 선택 + 빠른 예시 버튼 */}
      <div className="flex items-center justify-between border-t border-white/5 px-3 pt-2 pb-1">
        <ProviderPicker compact dropUp />
      </div>
      <div className="flex flex-wrap gap-1.5 px-3 pb-1">
        {QUICK_HINTS.map((hint) => (
          <button
            key={hint}
            onClick={() => setInput(hint)}
            className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[10px] text-white/35 transition-all hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
          >
            {hint}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div className="border-t border-white/5 p-3">
        <div className="rounded-xl border border-white/10 bg-white/5 focus-within:border-purple-500/30 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="위젯 추가, 차트 생성, 알람 패널 등 자연어로 요청하세요"
            rows={2}
            className="w-full resize-none bg-transparent px-3 pt-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-1">
              <button className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors" title="이미지 첨부">
                <Paperclip className="h-3 w-3" />
              </button>
              <button className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors" title="음성 입력">
                <Mic className="h-3 w-3" />
              </button>
            </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={cn(
              "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-all",
              input.trim() && !isStreaming
                ? "bg-purple-600 text-white hover:bg-purple-500"
                : "bg-white/5 text-white/20"
            )}
          >
            {isStreaming ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-3 w-3 rounded-full border border-white/30 border-t-white"
              />
            ) : (
              <Send className="h-3 w-3" />
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
