"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Terminal } from "lucide-react";
import AiChatInput from "@/components/shared/AiChatInput";
import { cn } from "@/lib/utils";

interface MonitoringChatPanelProps {
  solutionId: string;
  onWidgetCommand?: (prompt: string) => { added: boolean; widgetName?: string; message?: string };
  onPresetCommand?: (presetId: string) => { applied: boolean; presetLabel?: string };
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const LOGS = [
  "✓ AIM Monitoring loader initialized",
  "✓ monitoring widgets loaded",
  "✓ 12-column layout engine ready",
  "✓ AI Studio dashboard mounted",
  "✓ Claude advisor connected",
  "→ waiting for user input...",
];

type QuickHint =
  | { type: "widget";  label: string; widgetPrompt: string }
  | { type: "preset";  label: string; presetId: string; presetLabel: string }
  | { type: "chat";    label: string; prompt: string };

const QUICK_HINTS: QuickHint[] = [
  { type: "widget", label: "초음파 아크",       widgetPrompt: "초음파 아크 위험 위젯을 추가해줘" },
  { type: "widget", label: "진동 FFT",          widgetPrompt: "진동 FFT 스펙트럼 추가해줘" },
  { type: "widget", label: "작업자 SpO2안전",   widgetPrompt: "spo2 산소포화도 안전 위젯을 추가해줘" },
  { type: "widget", label: "환경 위험",          widgetPrompt: "가스 열화 위젯 추가해줘" },
  { type: "widget", label: "SOP 자동화",         widgetPrompt: "sop 자동 실행 위젯 추가해줘" },
  { type: "preset", label: "KEPCO 톤",          presetId: "kepco-aiot-blue", presetLabel: "KEPCO AIoT Control" },
  { type: "widget", label: "제조 설비",          widgetPrompt: "복합 센서 헬스 위젯 추가해줘" },
];

function extractDisplayText(content: string) {
  const markerIdx = content.indexOf("__WIDGET_JSON__");
  if (markerIdx === -1) return content;
  return content.slice(0, markerIdx).trim();
}

export default function MonitoringChatPanel({ solutionId, onWidgetCommand, onPresetCommand }: MonitoringChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "monitoring-welcome",
      role: "assistant",
      content:
        "안녕하세요! AIM Monitoring 설계 어시스턴트입니다.\n초음파, 진동, 열, 가스, 작업자 안전, SOP, AI 진단 위젯을 자연어로 요청하시면 구성 방향을 제안하겠습니다.",
    },
  ]);
  const [input, setInput] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const messageScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = messageScrollRef.current;
    if (!scroller) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const updateLastAssistant = (content: string) => {
    setMessages((current) =>
      current.map((message, index) =>
        index === current.length - 1 && message.role === "assistant"
          ? { ...message, content }
          : message
      )
    );
  };

  const sendText = async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if ((!text && attachedImages.length === 0) || isStreaming) return;

    setInput("");
    setAttachedImages([]);
    const widgetCommand = onWidgetCommand?.(text);
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", content: text || "첨부 파일 분석 요청" },
      {
        id: `assistant-${Date.now() + 1}`,
        role: "assistant",
        content: widgetCommand?.added
          ? `요청하신 ${widgetCommand.widgetName ?? "AIM Monitoring 위젯"}을 컨텐츠에 추가했습니다.\n\n`
          : "",
        streaming: true,
      },
    ]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
          solution: solutionId,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`API ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = widgetCommand?.added
        ? `요청하신 ${widgetCommand.widgetName ?? "AIM Monitoring 위젯"}을 컨텐츠에 추가했습니다.\n\n`
        : "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        updateLastAssistant(full);
      }

      updateLastAssistant(full || "응답을 받았지만 표시할 내용이 없습니다.");
    } catch {
      updateLastAssistant(
        widgetCommand?.added
          ? `요청하신 ${widgetCommand.widgetName ?? "AIM Monitoring 위젯"}을 컨텐츠에 추가했습니다.\n\nAPI 답변은 연결 오류로 표시하지 못했습니다.`
          : "API 연결 오류가 발생했습니다. ANTHROPIC_API_KEY 또는 /api/chat 상태를 확인해야 합니다."
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={messageScrollRef} className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const displayText = extractDisplayText(message.content);
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex gap-2", message.role === "user" ? "justify-end" : "items-start justify-start")}
              >
                {message.role === "assistant" && (
                  <img src="/img/ch6.png" alt="에임이" className="mt-1 h-6 w-6 flex-shrink-0 rounded-full object-cover ring-1 ring-violet-500/20" />
                )}
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-xs leading-relaxed",
                    message.role === "user"
                      ? "bg-purple-500/20 text-purple-100"
                      : "bg-white/5 text-white/80"
                  )}
                >
                  {displayText ? (
                    displayText
                  ) : (
                    <span className="flex items-center gap-1.5 text-white/30">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                        ●
                      </motion.span>
                      생각 중…
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="border-t border-white/5">
        <button
          type="button"
          onClick={() => setLogsOpen((value) => !value)}
          className="flex w-full items-center gap-1.5 px-4 py-2 text-[10px] text-white/25 transition-colors hover:text-white/50"
        >
          <Terminal className="h-3 w-3" />
          실행 로그
          {logsOpen ? <ChevronDown className="ml-auto h-3 w-3" /> : <ChevronRight className="ml-auto h-3 w-3" />}
        </button>
        <AnimatePresence>
          {logsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 pb-2"
            >
              {LOGS.map((log) => (
                <p key={log} className="font-mono text-[10px] text-white/20">{log}</p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-1.5 px-3 pb-1 pt-2">
        {QUICK_HINTS.map((hint) => (
          <button
            key={hint.label}
            type="button"
            onClick={() => {
              if (hint.type === "widget") {
                sendText(hint.widgetPrompt);
              } else if (hint.type === "preset") {
                const result = onPresetCommand?.(hint.presetId);
                setMessages((current) => [
                  ...current,
                  { id: `user-${Date.now()}`, role: "user", content: `${hint.presetLabel} 테마 적용` },
                  {
                    id: `assistant-${Date.now() + 1}`,
                    role: "assistant",
                    content: result?.applied
                      ? `${result.presetLabel ?? hint.presetLabel} 브랜드 테마를 적용했습니다. 우측 브랜드 설정에서 세부 조정이 가능합니다.`
                      : `${hint.presetLabel} 테마 적용에 실패했습니다.`,
                  },
                ]);
              } else {
                sendText(hint.prompt);
              }
            }}
            className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/25 transition-all hover:border-white/15 hover:bg-white/[0.07] hover:text-white/50"
          >
            {hint.label}
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 p-3">
        <AiChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => sendText()}
          isLoading={isStreaming}
          placeholder="위젯 추가, 센서 분석, 알람 정책 등 자연어로 요청하세요"
          attachedImages={attachedImages}
          onImagesChange={setAttachedImages}
        />
      </div>
    </div>
  );
}
