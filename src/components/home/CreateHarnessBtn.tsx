"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { HarnessLoader } from "@/components/shared/AIMILoader";

const LS_KEY_BASE = "aimnis_harness_draft";

export default function CreateHarnessBtn() {
  const { isComplete, selectedSolution, selectedScenario, blueprintMd, selectedSpecs } = useHomeStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [justActivated, setJustActivated] = useState(false);
  const prevComplete = useRef(false);

  // isComplete 전환 시 pulse 1회 트리거
  useEffect(() => {
    if (isComplete && !prevComplete.current) {
      setJustActivated(true);
      const t = setTimeout(() => setJustActivated(false), 800);
      prevComplete.current = true;
      return () => clearTimeout(t);
    }
    if (!isComplete) prevComplete.current = false;
  }, [isComplete]);

  const handleCreate = async () => {
    if (!isComplete || loading || !selectedScenario) return;
    setLoading(true);
    const solutionId = selectedSolution ?? "guard";

    // MD + 메타데이터 sessionStorage 저장 (EditorLayout 복원용)
    const lsKey = `${LS_KEY_BASE}_${solutionId}`;
    try {
      const payload = JSON.stringify({
        solution: solutionId,
        md: blueprintMd,
        scenario: selectedScenario,
        specs: selectedSpecs,
        savedAt: Date.now(),
      });
      sessionStorage.setItem(lsKey, payload);
      localStorage.setItem(lsKey, payload);
    } catch {
      // 스토리지 접근 불가 시 무시
    }

    await new Promise((r) => setTimeout(r, 1500));
    router.push(`/editor?solution=${solutionId}&scenario=${selectedScenario}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
      {/* AIMI 하네스 생성 오버레이 — createPortal로 CSS transform 영향 차단 */}
      <HarnessLoader show={loading} />
      <motion.button
        type="button"
        onClick={handleCreate}
        disabled={!isComplete || loading}
        whileHover={isComplete && !loading ? { scale: 1.02 } : {}}
        whileTap={isComplete && !loading ? { scale: 0.97 } : {}}
        animate={
          justActivated
            ? { scale: [1, 1.04, 1], transition: { duration: 0.4 } }
            : isComplete && !loading
            ? {
                boxShadow: [
                  "0 0 0px oklch(60% 0.20 285 / 0)",
                  "0 0 24px oklch(60% 0.20 285 / .55)",
                  "0 0 10px oklch(60% 0.20 285 / .28)",
                ],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }
            : { boxShadow: "none" }
        }
        style={{
          width: "100%",
          padding: "12px 20px",
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 700,
          cursor: isComplete && !loading ? "pointer" : "not-allowed",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          position: "relative" as const,
          overflow: "hidden",
          ...(isComplete
            ? {
                background: "linear-gradient(135deg, #5a3ee1 0%, #735FE9 100%)",
                color: "#fff",
              }
            : {
                background: "#111827",
                color: "#334155",
                border: "1px solid #1e293b",
              }),
        }}
      >
        {/* 로딩 shimmer */}
        {loading && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              pointerEvents: "none",
            }}
          />
        )}

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              AI가 맞춤 대시보드를 구성하고 있습니다...
            </motion.span>
          ) : isComplete ? (
            <motion.span
              key="active"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              현장 맞춤 솔루션 생성하기
              <ArrowRight size={15} />
            </motion.span>
          ) : (
            <motion.span
              key="inactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <Lock size={12} />
              현장 정보를 입력하면 AI가 맞춤 설정을 자동으로 구성합니다
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 완료 후 안내 */}
      <AnimatePresence>
        {isComplete && !loading && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ fontSize: 10, color: "var(--primary)", textAlign: "center" as const, margin: 0 }}
          >
            설정이 완료됐습니다. 버튼을 눌러 대시보드를 바로 만들어보세요
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
