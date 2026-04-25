"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";

// EditorLayout과 동일한 키
const LS_KEY = "aimnis_harness_draft";

export default function CreateHarnessBtn() {
  const { isComplete, selectedScenario, blueprintMd, selectedSpecs } = useHomeStore();
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

    // MD + 메타데이터 sessionStorage 저장 (EditorLayout 복원용)
    try {
      const payload = JSON.stringify({
        md: blueprintMd,
        scenario: selectedScenario,
        specs: selectedSpecs,
        savedAt: Date.now(),
      });
      sessionStorage.setItem(LS_KEY, payload);
      localStorage.setItem(LS_KEY, payload);
    } catch {
      // 스토리지 접근 불가 시 무시
    }

    await new Promise((r) => setTimeout(r, 1500));
    router.push(`/editor?solution=guard&scenario=${selectedScenario}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
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
                  "0 0 0px rgba(0,212,255,0)",
                  "0 0 20px rgba(0,212,255,0.5)",
                  "0 0 8px rgba(0,212,255,0.25)",
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
              하네스를 생성하고 있습니다...
            </motion.span>
          ) : isComplete ? (
            <motion.span
              key="active"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              Create Harness
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
              운영 규모와 데이터 수집을 선택해주세요
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
            style={{ fontSize: 10, color: "#735FE9", textAlign: "center" as const, margin: 0 }}
          >
            선택을 완료하거나 바로 하네스를 만들 수 있습니다
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
