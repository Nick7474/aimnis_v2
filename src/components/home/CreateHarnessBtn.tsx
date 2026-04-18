"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";

export default function CreateHarnessBtn() {
  const { isComplete, selectedScenario, blueprintMd } = useHomeStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!isComplete || loading) return;
    setLoading(true);

    // Blueprint MD를 sessionStorage에 저장
    sessionStorage.setItem(
      "harnessMd",
      JSON.stringify({ md: blueprintMd, scenario: selectedScenario })
    );

    // 1.5초 로딩 후 에디터 이동
    await new Promise((r) => setTimeout(r, 1500));
    router.push(`/editor?solution=guard&scenario=${selectedScenario}`);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleCreate}
        disabled={!isComplete || loading}
        whileHover={isComplete && !loading ? { scale: 1.02 } : {}}
        whileTap={isComplete && !loading ? { scale: 0.98 } : {}}
        animate={
          isComplete && !loading
            ? { boxShadow: ["0 0 0px rgba(0,212,255,0)", "0 0 20px rgba(0,212,255,0.4)", "0 0 0px rgba(0,212,255,0)"] }
            : {}
        }
        transition={{ duration: 2, repeat: isComplete ? Infinity : 0 }}
        className="relative w-full overflow-hidden rounded-xl py-3 text-sm font-semibold transition-all duration-300"
        style={
          isComplete
            ? {
                background: "linear-gradient(135deg, #0891b2, #00d4ff)",
                color: "white",
              }
            : {
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "not-allowed",
              }
        }
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              하네스를 생성하고 있습니다...
            </motion.span>
          ) : isComplete ? (
            <motion.span
              key="active"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Create Harness
            </motion.span>
          ) : (
            <motion.span
              key="inactive"
              className="flex items-center justify-center gap-2"
            >
              인터뷰 진행 중...
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* 진행률 표시 */}
      <CollectedProgress />
    </div>
  );
}

function CollectedProgress() {
  const { collectedInfo } = useHomeStore();
  const keys = Object.keys(collectedInfo);
  if (keys.length === 0) return null;

  const filled = Object.values(collectedInfo).filter((v) => v !== null && v !== "").length;
  const total = keys.length;
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-white/25">정보 수집</span>
        <span className="text-[10px] text-white/25">{filled}/{total}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #0891b2, #00d4ff)" }}
        />
      </div>
    </div>
  );
}
