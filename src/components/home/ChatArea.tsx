"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHomeStore } from "@/store/homeStore";
import { cn } from "@/lib/utils";

// 시나리오별 에임이 환영 메시지
const AIMI_GREETING: Record<string, string> = {
  default:      "현장에 맞는 최적 설정을 도와드립니다.\n왼쪽에서 시나리오를 선택해 주세요.",
  energy:       "에너지 시설 전문가 모드입니다.\n항목을 직접 선택하거나\n'전문가 추천으로 설정해줘'라고 입력하세요.",
  manufacturing:"스마트 제조 전문가 모드입니다.\n항목을 직접 채우거나 자유롭게 요청하세요.",
  smartcity:    "스마트시티 관제 전문가 모드입니다.\n지자체 표준 설정을 바로 적용할 수 있습니다.",
};

export default function ChatArea() {
  const { messages, isThinking, selectedScenario } = useHomeStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const greeting = AIMI_GREETING[selectedScenario ?? "default"] ?? AIMI_GREETING.default;

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex flex-1 flex-col gap-3 pt-2">
        {/* 에임이 환영 버블 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          key={selectedScenario ?? "default"}
          className="flex items-start gap-2.5"
        >
          <div className="relative flex-shrink-0 mt-0.5">
            <img
              src="/img/ch6.png"
              alt="에임이"
              className="h-7 w-7 rounded-full object-cover ring-1 ring-violet-500/30"
            />
            <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <div
            className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed border border-white/[0.07] text-white/80 whitespace-pre-line"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            {greeting}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="relative flex-shrink-0 mt-0.5">
                <img
                  src="/img/ch6.png"
                  alt="에임이"
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-violet-500/20"
                />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
                msg.role === "user"
                  ? "rounded-tr-sm text-white"
                  : "rounded-tl-sm border border-white/[0.07] text-white/85"
              )}
              style={
                msg.role === "user"
                  ? { background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,180,220,0.08))" }
                  : { background: "rgba(255,255,255,0.03)" }
              }
            >
              {msg.content || (
                <span className="text-white/30 text-xs">...</span>
              )}
            </div>
          </motion.div>
        ))}

        {/* 에임이 Thinking */}
        {isThinking && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5"
          >
            <div className="relative flex-shrink-0 mt-0.5">
              <motion.img
                src="/img/ch6.png"
                alt="에임이"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-violet-500/30"
              />
            </div>
            <div
              className="rounded-2xl rounded-tl-sm border border-white/[0.07] px-4 py-3"
              style={{ background: "rgba(0,212,255,0.04)" }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/40">설계 분석 중</span>
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
  );
}
