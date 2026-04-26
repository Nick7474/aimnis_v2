"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { specGroups, scenarioMap } from "@/data/scenarios";

const STAGGER_MS = 60;
const CHIP_HOLD_MS = 280;

interface MagicSetupButtonProps {
  onAnimatingChange: (specs: Partial<Record<string, string>>) => void;
}

export default function MagicSetupButton({ onAnimatingChange }: MagicSetupButtonProps) {
  const { selectedScenario, isMagicAnimating, setMagicAnimating, applyMagicDefault } =
    useHomeStore();

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const handleClick = useCallback(() => {
    if (!selectedScenario || isMagicAnimating) return;

    clearTimers();
    setMagicAnimating(true);
    onAnimatingChange({});

    const { defaultSpecs } = scenarioMap[selectedScenario];
    const allQuestions = specGroups.flatMap((g) => g.questions);

    // 칩 순차 애니메이션
    allQuestions.forEach((q, i) => {
      const timer = setTimeout(() => {
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
      timers.current.push(timer);
    });

    // 완료 — 기본값 적용 (AI 호출 없음, 토큰 절약)
    const doneTimer = setTimeout(() => {
      applyMagicDefault();
      onAnimatingChange({});
      setMagicAnimating(false);
    }, allQuestions.length * STAGGER_MS + CHIP_HOLD_MS);

    timers.current.push(doneTimer);
  }, [selectedScenario, isMagicAnimating, setMagicAnimating, applyMagicDefault, onAnimatingChange, clearTimers]);

  const disabled = !selectedScenario || isMagicAnimating;

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
        border: `1px solid ${disabled ? "var(--border)" : "oklch(70% 0.14 210 / .45)"}`,
        background: disabled ? "var(--s2)" : "oklch(70% 0.14 210 / .10)",
        color: disabled ? "var(--t4)" : "var(--cyan)",
        transition: "all 0.15s ease",
        boxShadow: disabled ? "none" : "0 0 14px oklch(70% 0.14 210 / .20)",
        position: "relative" as const, overflow: "hidden",
        fontFamily: "var(--font)",
      }}
    >
      <AnimatePresence>
        {isMagicAnimating && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity }}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(90deg, transparent, oklch(70% 0.14 210 / .12), transparent)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        animate={isMagicAnimating ? { rotate: [0, 20, -20, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.6 }}
      >
        <Sparkles size={13} />
      </motion.div>

      {isMagicAnimating ? "설정 중..." : "전문가 추천 세팅"}
    </motion.button>
  );
}
