"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, ChevronRight, Terminal } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

const LOGS = [
  "✓ solution loader initialized",
  "✓ harness-schema.json loaded",
  "✓ React Flow canvas mounted",
  "✓ API mapping panel ready",
  "→ waiting for user input...",
];

interface ChatPanelProps {
  solutionId: string;
}

export default function ChatPanel({ solutionId }: ChatPanelProps) {
  const { messages, isStreaming, addMessage, updateLastMessage, setStreaming, addNode } =
    useEditorStore();
  const [input, setInput] = useState("");
  const [logsOpen, setLogsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: text };
    addMessage(userMsg);

    // AI 응답 메시지 placeholder
    const aiId = (Date.now() + 1).toString();
    addMessage({ id: aiId, role: "assistant", content: "", streaming: true });
    setStreaming(true);

    try {
      const apiMessages = [...messages, userMsg]
        .filter((m) => !(m as { streaming?: boolean }).streaming)
        .map((m) => ({ role: m.role, content: m.content }));

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

      // 위젯 추가 명령 파싱
      if (full.startsWith("위젯 추가:")) {
        const widgetName = full.split("\n")[0].replace("위젯 추가:", "").trim();
        addNode({
          id: `node-${Date.now()}`,
          type: "kpiWidget",
          position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
          data: { label: widgetName, widgetId: "w-kpi-card" },
        });
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
          {messages.map((msg) => (
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
                {msg.content || (
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
              </div>
            </motion.div>
          ))}
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
          {logsOpen ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />}
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
                <p key={i} className="font-mono text-[10px] text-white/20">{log}</p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 입력창 */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 p-2 focus-within:border-purple-500/30 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AI에게 위젯 추가, 레이아웃 변경 등을 요청하세요"
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
            <Send className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
