"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, ChevronRight, Terminal, Sparkles } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import type { WidgetData } from "@/store/editorStore";

const LOGS = [
  "✓ solution loader initialized",
  "✓ harness-schema.json loaded",
  "✓ React Flow canvas mounted",
  "✓ Gemma4 widget engine ready",
  "✓ Sonnet+Opus advisor connected",
  "→ waiting for user input...",
];

// 위젯 타입별 위치 자동 배치 (그리드 레이아웃)
const SIZE_MAP: Record<string, { w: number; h: number }> = {
  kpi: { w: 180, h: 110 },
  "chart-line": { w: 280, h: 180 },
  "chart-bar": { w: 280, h: 180 },
  "chart-donut": { w: 220, h: 200 },
  gauge: { w: 160, h: 160 },
  "alert-panel": { w: 260, h: 200 },
  table: { w: 320, h: 200 },
  map: { w: 300, h: 220 },
};

const GRID_COLS = 3;
const PAD = 24;

interface ChatPanelProps {
  solutionId: string;
}

// 메시지에서 자연어 파트만 추출 (JSON 마커 이후 제거)
function extractDisplayText(content: string): string {
  const markerIdx = content.indexOf("__WIDGET_JSON__");
  if (markerIdx === -1) return content;
  return content.slice(0, markerIdx).trim();
}

// 위젯 배지 (응답에 위젯이 포함된 경우)
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
    addNode,
    setLastCommand,
    nodes,
  } = useEditorStore();
  const [input, setInput] = useState("");
  const [logsOpen, setLogsOpen] = useState(false);
  // 위젯 배지 추적: messageId → widget info
  const [widgetBadges, setWidgetBadges] = useState<
    Record<string, { type: string; title: string }>
  >({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const processedJsonIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 위젯 추가: 현재 노드 수 기반 자동 위치 계산
  const addWidgetNode = (widgetPayload: {
    widgetId: string;
    type: string;
    title: string;
    data: WidgetData;
  }) => {
    const idx = nodes.length;
    const col = idx % GRID_COLS;
    const row = Math.floor(idx / GRID_COLS);
    const size = SIZE_MAP[widgetPayload.type] ?? { w: 220, h: 150 };

    addNode({
      id: widgetPayload.widgetId,
      type: "widgetNode",
      position: {
        x: PAD + col * (size.w + PAD),
        y: PAD + row * (size.h + PAD),
      },
      data: {
        widgetId: widgetPayload.widgetId,
        type: widgetPayload.type,
        title: widgetPayload.title,
        data: widgetPayload.data,
      },
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
          // API로는 마커 이전 텍스트만 전송
          content: extractDisplayText(m.content),
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, solution: solutionId }),
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

      // iframe 브릿지 동기화 (레거시 호환)
      setLastCommand({ userText: text, aiResponse: full, timestamp: Date.now() });

      // __WIDGET_JSON__ 파싱 및 위젯 추가
      const markerIdx = full.indexOf("__WIDGET_JSON__");
      if (markerIdx !== -1 && !processedJsonIds.current.has(aiId)) {
        processedJsonIds.current.add(aiId);
        try {
          const jsonStr = full.slice(markerIdx + "__WIDGET_JSON__".length).trim();
          const parsed = JSON.parse(jsonStr);

          if (parsed.action === "add_widget" && parsed.widget) {
            addWidgetNode(parsed.widget);
            setWidgetBadges((prev) => ({
              ...prev,
              [aiId]: { type: parsed.widget.type, title: parsed.widget.title },
            }));
          }
        } catch {
          // JSON 파싱 실패 → 무시
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
                  {/* 위젯 배지 */}
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

      {/* 빠른 예시 버튼 */}
      <div className="flex flex-wrap gap-1.5 border-t border-white/5 px-3 pt-2.5 pb-1">
        {["KPI 카드 추가", "라인 차트 추가", "알람 패널", "게이지 추가"].map((hint) => (
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
        <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-2 focus-within:border-purple-500/30 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="위젯 추가, 차트 생성, 알람 패널 등 자연어로 요청하세요"
            rows={2}
            className="flex-1 resize-none bg-transparent text-xs text-white placeholder:text-white/20 focus:outline-none"
          />
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
  );
}
