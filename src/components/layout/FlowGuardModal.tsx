"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

// 에디터 진입에만 적용 — 프로젝트·AIM GUARD는 자유롭게 접근 허용
export type FlowGuardScenario =
  | "editor-no-interview"  // 현장 설정 미완료
  | "editor-no-harness";   // 설정 완료, 솔루션 미생성

interface ScenarioConfig {
  character: string;
  title: string;
  desc: string;
  cta: string;
  ctaHref: string;
}

const SCENARIOS: Record<FlowGuardScenario, ScenarioConfig> = {
  "editor-no-interview": {
    character: "/img/ch3.png",
    title: "현장 설정 후 에디터가 열립니다",
    desc: "에임이가 딱 맞는 환경을 준비하려면\n현장 정보가 먼저 필요합니다.\n\n시나리오를 선택하고 현장 정보를 입력하면\n에디터가 자동으로 구성됩니다.",
    cta: "설정 시작하기",
    ctaHref: "/home",
  },
  "editor-no-harness": {
    character: "/img/ch1.png",
    title: "솔루션 생성 후 에디터가 열립니다",
    desc: "현장 설정이 완료됐습니다.\n\n홈에서 '솔루션 생성하기'를 누르면\n에임이가 에디터를 바로 열어드립니다.",
    cta: "홈으로 이동",
    ctaHref: "/home",
  },
};

interface FlowGuardModalProps {
  scenario: FlowGuardScenario | null;
  onClose: () => void;
}

export default function FlowGuardModal({ scenario, onClose }: FlowGuardModalProps) {
  const router = useRouter();

  if (!scenario) return null;
  const cfg = SCENARIOS[scenario];

  const handleCta = () => {
    onClose();
    router.push(cfg.ctaHref);
  };

  return (
    <AnimatePresence>
      {scenario && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[1000] bg-black/75"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* 정중앙 flex 래퍼 — Framer Motion transform 충돌 방지 */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.90, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.90, y: 20 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              style={{ pointerEvents: "auto", width: "100%", maxWidth: 380, padding: "0 20px" }}
            >
              <div
                className="relative flex flex-col items-center gap-5 rounded-2xl p-6"
                style={{
                  background: "rgba(12,12,22,0.98)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 40px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03) inset",
                }}
              >
                {/* 닫기 */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] text-white/25 transition-colors hover:border-white/15 hover:text-white/55"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* AIMI 카드 (피그마 스펙) */}
                <div
                  style={{
                    position: "relative",
                    width: 200,
                    height: 200,
                    borderRadius: 10,
                    background: "rgba(30,33,36,0.25)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {/* 좌 warm 글로우 */}
                  <div style={{
                    position: "absolute", top: "5%", left: "-15%",
                    width: "75%", height: "65%", borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(124,58,237,0.5) 0%, transparent 70%)",
                    filter: "blur(18px)",
                  }} />
                  {/* 우 cool 글로우 */}
                  <div style={{
                    position: "absolute", bottom: "15%", right: "-15%",
                    width: "65%", height: "55%", borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(59,130,246,0.4) 0%, transparent 70%)",
                    filter: "blur(18px)",
                  }} />

                  {/* 캐릭터 */}
                  <div style={{ position: "absolute", top: 28, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                    <motion.img
                      src={cfg.character}
                      alt="에임이"
                      animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
                      transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                      style={{ width: 92, height: 92, objectFit: "contain" }}
                    />
                  </div>

                  {/* 카드 하단 레이블 */}
                  <p style={{
                    position: "absolute", top: 134, left: 0, right: 0,
                    textAlign: "center", fontSize: 12, color: "#b1b8be",
                    fontFamily: "var(--font-pretendard, sans-serif)",
                  }}>
                    에임이 안내
                  </p>
                </div>

                {/* 제목 + 설명 */}
                <div className="w-full space-y-2.5 text-center">
                  <h3 className="text-[15px] font-bold text-white/90 leading-snug">
                    {cfg.title}
                  </h3>
                  <p className="text-[12.5px] leading-[1.7] text-white/40 whitespace-pre-line">
                    {cfg.desc}
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={handleCta}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #5a3ee1, #735FE9)" }}
                >
                  {cfg.cta}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
