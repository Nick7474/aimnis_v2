"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { cn } from "@/lib/utils";

export default function ChatArea() {
  const { messages, isThinking } = useHomeStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/20 bg-brand-500/10"
        >
          <Bot className="h-5 w-5 text-brand-400" />
        </motion.div>
        <p className="text-sm text-white/30">
          시나리오를 선택하거나 요구사항을 입력하면
          <br />
          AI 아키텍트가 역질문을 시작합니다
        </p>
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
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-brand-400" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "rounded-tr-sm bg-white/10 text-white"
                  : "rounded-tl-sm border border-white/8 bg-white/[0.04] text-white/85"
              )}
              style={
                msg.role === "user"
                  ? { background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,180,220,0.08))" }
                  : undefined
              }
            >
              {msg.content || (
                <span className="text-white/30 text-xs">...</span>
              )}
            </div>
          </motion.div>
        ))}

        {/* Thinking 애니메이션 */}
        {isThinking && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 mt-0.5">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Bot className="h-3.5 w-3.5 text-brand-400" />
              </motion.div>
            </div>
            <div
              className="rounded-2xl rounded-tl-sm border border-white/8 px-4 py-3"
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
