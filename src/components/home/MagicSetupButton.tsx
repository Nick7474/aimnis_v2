"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { useLLMStore } from "@/store/llmStore";
import { specGroups, scenarioMap } from "@/data/scenarios";

const STAGGER_MS = 50;
const CHIP_HOLD_MS = 200;

interface MagicSetupButtonProps {
  onAnimatingChange: (specs: Partial<Record<string, string>>) => void;
}

export default function MagicSetupButton({ onAnimatingChange }: MagicSetupButtonProps) {
  const {
    selectedScenario, isMagicAnimating, isGenerating,
    setMagicAnimating, applyMagicDefault, generateHarness,
  } = useHomeStore();
  const { provider } = useLLMStore();

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const handleClick = useCallback(async () => {
    if (!selectedScenario || isMagicAnimating || isGenerating) return;

    clearTimers();
    setMagicAnimating(true);
    onAnimatingChange({});

    // 칩 애니메이션 — defaultSpecs 순차 표시
    const { defaultSpecs } = scenarioMap[selectedScenario];
    const allQuestions = specGroups.flatMap((g) => g.questions);

    allQuestions.forEach((q, i) => {
      const onTimer = setTimeout(() => {
        onAnimatingChange(
          Object.fromEntries(
            allQuestions.slice(0, i + 1).map((cq) => {
              let v = defaultSpecs[cq.id];
              if (Array.isArray(v) && v.length > 0) v = v[0];
              return [cq.id, v];
            })
          ) as Partial<Record<string, string>>
        );
      }, i * STAGGER_MS);
      timers.current.push(onTimer);
    });

    // 애니메이션 완료 후 → defaultSpecs 적용 + AI 하네스 생성
    const doneTimer = setTimeout(async () => {
      applyMagicDefault();
      onAnimatingChange({});
      setMagicAnimating(false);

      // 실제 AI 하네스 생성 (스트리밍)
      await generateHarness(provider);
    }, allQuestions.length * STAGGER_MS + CHIP_HOLD_MS);

    timers.current.push(doneTimer);
  }, [
    selectedScenario, isMagicAnimating, isGenerating,
    setMagicAnimating, applyMagicDefault, generateHarness,
    onAnimatingChange, clearTimers, provider,
  ]);

  const isLoading = isMagicAnimating || isGenerating;
  const disabled = !selectedScenario || isLoading;

  const label = isMagicAnimating
    ? "분석 중..."
    : isGenerating
    ? "AI 설계 중..."
    : "Magic Setup";

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 10,
        fontSize: 12, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        border: `1px solid ${disabled ? "var(--border)" : "oklch(70% 0.14 210 / .35)"}`,
        background: disabled ? "var(--s2)" : "oklch(70% 0.14 210 / .08)",
        color: disabled ? "var(--t4)" : "var(--primary)",
        transition: "all 0.15s ease",
        boxShadow: disabled ? "none" : "0 0 12px oklch(70% 0.14 210 / .15)",
        position: "relative" as const, overflow: "hidden",
        fontFamily: "var(--font)",
      }}
    >
      {/* shimmer */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent, oklch(70% 0.14 210 / .12), transparent)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {isGenerating ? (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Loader2 size={13} />
        </motion.div>
      ) : (
        <motion.div animate={isMagicAnimating ? { rotate: [0, 20, -20, 0] } : {}} transition={{ repeat: Infinity, duration: 0.6 }}>
          <Sparkles size={13} />
        </motion.div>
      )}
      {label}
    </motion.button>
  );
}
