"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode2, Circle } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";

export default function LiveBlueprint() {
  const { blueprintMd, selectedScenario } = useHomeStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);
  const [highlight, setHighlight] = useState(false);

  // 새 내용 추가 시 스크롤 + 하이라이트
  useEffect(() => {
    if (blueprintMd.length > prevLengthRef.current) {
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1000);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
    prevLengthRef.current = blueprintMd.length;
  }, [blueprintMd]);

  const fileName =
    selectedScenario === "energy"
      ? "energy_control.md"
      : selectedScenario === "manufacturing"
      ? "manufacturing_vision.md"
      : selectedScenario === "smartcity"
      ? "smartcity_response.md"
      : "aim_guard_home.md";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/8 bg-black/30 backdrop-blur-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500/60" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <FileCode2 className="h-3.5 w-3.5 text-cyan-400/60" />
          <span className="text-xs text-white/40 font-mono">{fileName}</span>
        </div>
        {blueprintMd && (
          <div className="ml-auto flex items-center gap-1">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Circle className="h-2 w-2 fill-cyan-400 text-cyan-400" />
            </motion.div>
            <span className="text-[10px] text-cyan-400/60">live</span>
          </div>
        )}
      </div>

      {/* 내용 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
      >
        <AnimatePresence mode="wait">
          {!blueprintMd ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-3"
            >
              <FileCode2 className="h-8 w-8 text-white/10" />
              <p className="text-xs text-white/20 text-center">
                시나리오를 선택하면<br />실시간으로 설계서가 생성됩니다
              </p>
              {/* 빈 라인 힌트 */}
              <div className="mt-4 w-full max-w-[200px] space-y-2 opacity-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-2 rounded bg-white/30"
                    style={{ width: `${60 + (i % 3) * 20}%` }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              {/* 새 내용 하이라이트 오버레이 */}
              <AnimatePresence>
                {highlight && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="pointer-events-none absolute inset-0 rounded bg-cyan-500/5"
                  />
                )}
              </AnimatePresence>
              <pre className="font-mono text-[11px] leading-relaxed text-white/60 whitespace-pre-wrap break-words">
                <BlueprintRenderer md={blueprintMd} />
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// MD를 구문 강조하여 렌더링
function BlueprintRenderer({ md }: { md: string }) {
  return (
    <>
      {md.split("\n").map((line, i) => {
        if (line.startsWith("# ")) {
          return (
            <span key={i} className="block text-cyan-300 font-bold text-sm mb-1">
              {line}
            </span>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <span key={i} className="block text-cyan-400/80 font-semibold mt-3 mb-1">
              {line}
            </span>
          );
        }
        if (line.startsWith("- ") || line.startsWith("  - ")) {
          return (
            <span key={i} className="block text-white/50 pl-2">
              {line}
            </span>
          );
        }
        if (line.startsWith("- [ ]")) {
          return (
            <span key={i} className="block text-amber-300/70 pl-2">
              {line}
            </span>
          );
        }
        if (line.startsWith("- [x]")) {
          return (
            <span key={i} className="block text-emerald-400/70 pl-2">
              {line}
            </span>
          );
        }
        return (
          <span key={i} className="block text-white/40">
            {line || "\u00A0"}
          </span>
        );
      })}
    </>
  );
}
