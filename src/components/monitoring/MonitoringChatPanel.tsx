"use client";
import React, { useRef, useState, useEffect } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";
import { useMonitoringEditorStore } from "@/store/monitoringEditorStore";

export default function MonitoringChatPanel() {
  const { messages, isStreaming, addMessage, updateLastMessage, setStreaming } =
    useMonitoringEditorStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    addMessage({ id: Date.now().toString(), role: "user", content: text });
    setStreaming(true);
    addMessage({ id: `ai-${Date.now()}`, role: "assistant", content: "", streaming: true });

    // 스트리밍 시뮬레이션
    const reply = `[${text}]에 대한 AIM Monitoring 분석 결과입니다. 현재 진동 RMS 수치는 정상 범위이며, 가스 농도는 안전 수준입니다.`;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      updateLastMessage(reply.slice(0, i * 3));
      if (i * 3 >= reply.length) {
        clearInterval(timer);
        setStreaming(false);
      }
    }, 40);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-auto px-3 py-3 flex flex-col gap-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-cyan-500/20 text-white/80 rounded-br-sm"
                  : "bg-white/5 text-white/60 rounded-bl-sm"
              }`}
            >
              {msg.content}
              {msg.streaming && <span className="inline-block w-1.5 h-3 bg-cyan-400/80 animate-pulse ml-0.5 align-middle" />}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="shrink-0 px-3 pb-3 pt-1 border-t border-white/5">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            rows={1}
            placeholder="AI에게 질문..."
            className="flex-1 resize-none bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/40 transition-colors"
          />
          <button
            onClick={send}
            disabled={isStreaming || !input.trim()}
            className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 disabled:opacity-30 transition-colors"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
