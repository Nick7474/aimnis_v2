"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SolutionManifest } from "@/lib/solutionLoader";

// Lucide 아이콘을 이름으로 동적 렌더링
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

interface HomeHeroProps {
  solutions: SolutionManifest[];
}

export default function HomeHero({ solutions }: HomeHeroProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [activeSolution, setActiveSolution] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (activeSolution === "guard") {
      router.push("/editor");
    } else {
      router.push("/editor");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-14">
      {/* 헤드라인 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
          <Sparkles className="h-3 w-3" />
          AI-Powered Enterprise Platform
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          무엇을 만들어 드릴까요?
        </h1>
        <p className="mt-3 text-sm text-white/40">
          요구사항을 입력하면 AI가 맞춤 솔루션 하네스를 생성합니다
        </p>
      </motion.div>

      {/* AI 입력창 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="relative rounded-2xl border border-purple-500/20 bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl focus-within:border-purple-500/40 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeSolution === "guard"
                  ? "예: 배터리공장 화재 감지 + 에너지 모니터링 대시보드 만들어줘"
                  : "솔루션을 선택하거나 요구사항을 직접 입력하세요"
              }
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
            />

            {/* 하단 액션 */}
            <div className="mt-3 flex items-center justify-between">
              {/* 솔루션 칩 */}
              <SolutionChips
                solutions={solutions}
                active={activeSolution}
                onSelect={(id) => setActiveSolution(id === activeSolution ? null : id)}
              />

              {/* 전송 버튼 */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim()}
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all",
                  input.trim()
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                    : "bg-white/5 text-white/20"
                )}
              >
                <ArrowUp className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </form>

        {/* 힌트 텍스트 */}
        <p className="mt-3 text-center text-[11px] text-white/20">
          Enter로 전송 · Shift+Enter 줄바꿈
        </p>
      </motion.div>
    </div>
  );
}

// ─── 솔루션 칩 컴포넌트 ──────────────────────────────────────

interface SolutionChipsProps {
  solutions: SolutionManifest[];
  active: string | null;
  onSelect: (id: string) => void;
}

function SolutionChips({ solutions, active, onSelect }: SolutionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {solutions.map((sol) => {
        const IconComp = (
          (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[sol.icon] ??
          LucideIcons.Box
        ) as React.FC<LucideProps>;
        const isActive = active === sol.id;
        const isComingSoon = sol.status === "coming-soon";

        return (
          <motion.button
            key={sol.id}
            type="button"
            onClick={() => !isComingSoon && onSelect(sol.id)}
            whileHover={{ scale: isComingSoon ? 1 : 1.03 }}
            whileTap={{ scale: isComingSoon ? 1 : 0.97 }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
              isActive
                ? "border-purple-400/40 bg-purple-500/20 text-purple-200"
                : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70",
              isComingSoon && "cursor-not-allowed opacity-50"
            )}
          >
            <IconComp className="h-3 w-3" color={sol.color} />
            <span>{sol.name}</span>
            <AnimatePresence>
              {isComingSoon && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-full bg-white/10 px-1 py-0.5 text-[9px] text-white/40"
                >
                  예정
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="h-1.5 w-1.5 rounded-full bg-purple-400"
                />
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
