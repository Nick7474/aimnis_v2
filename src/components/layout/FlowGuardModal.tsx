"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export type FlowGuardScenario =
  | "editor-no-interview"    // Step2 미완료
  | "editor-no-harness"      // 완료했지만 하네스 미생성
  | "projects-no-publish"    // 퍼블리시 없음
  | "guard-no-publish";      // 퍼블리시 없음

interface ScenarioConfig {
  character: string;
  title: string;
  desc: string;
  cta: string;
  ctaHref: string;
  secondary?: string;
  secondaryHref?: string;
}

const SCENARIOS: Record<FlowGuardScenario, ScenarioConfig> = {
  "editor-no-interview": {
    character: "/img/ch3.png",
    title: "현장 정보를 먼저 입력해 주세요",
    desc: "에디터를 열려면 AI 아키텍트 인터뷰를 완료해야 합니다.\n홈에서 시나리오를 선택하고 3가지 현장 정보를 입력하면\n맞춤 에디터 환경이 자동으로 구성됩니다.",
    cta: "인터뷰 시작하기",
    ctaHref: "/home",
  },
  "editor-no-harness": {
    character: "/img/ch1.png",
    title: "솔루션을 먼저 생성해 주세요",
    desc: "현장 정보 입력이 완료됐습니다.\n'솔루션 생성하기' 버튼을 눌러 하네스를 생성하면\n에디터가 바로 열립니다.",
    cta: "홈으로 돌아가기",
    ctaHref: "/home",
  },
  "projects-no-publish": {
    character: "/img/ch4.png",
    title: "퍼블리시된 프로젝트가 없습니다",
    desc: "에디터에서 대시보드를 완성하고 퍼블리시 버튼을 누르면\n여기서 모든 프로젝트를 관리할 수 있습니다.\n지금 바로 시작해 보세요.",
    cta: "에디터로 이동",
    ctaHref: "/editor",
    secondary: "홈에서 시작하기",
    secondaryHref: "/home",
  },
  "guard-no-publish": {
    character: "/img/ch2.png",
    title: "실행할 프로젝트가 없습니다",
    desc: "AIM GUARD를 실행하려면 에디터에서 솔루션을 구성하고\n퍼블리시해야 합니다.\n하네스를 만들어 첫 번째 프로젝트를 배포해 보세요.",
    cta: "에디터로 이동",
    ctaHref: "/editor",
    secondary: "홈에서 시작하기",
    secondaryHref: "/home",
  },
};

interface FlowGuardModalProps {
  scenario: FlowGuardScenario | null;
  onClose: () => void;
  /** 에디터가 없을 때(하네스 없음) projects/guard 시나리오에서 CTA를 홈으로 변경 */
  hasHarness?: boolean;
}

export default function FlowGuardModal({ scenario, onClose, hasHarness = false }: FlowGuardModalProps) {
  const router = useRouter();

  if (!scenario) return null;

  const cfg = { ...SCENARIOS[scenario] };

  // 하네스 없으면 에디터 이동 CTA → 홈으로 변경
  if (!hasHarness && (scenario === "projects-no-publish" || scenario === "guard-no-publish")) {
    cfg.cta = "홈에서 시작하기";
    cfg.ctaHref = "/home";
    cfg.secondary = undefined;
  }

  const handleCta = () => {
    onClose();
    router.push(cfg.ctaHref);
  };

  const handleSecondary = () => {
    if (!cfg.secondaryHref) return;
    onClose();
    router.push(cfg.secondaryHref);
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1000] bg-black/75"
            style={{ backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-[1001] w-full max-w-sm -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className="relative flex flex-col items-center gap-5 rounded-2xl p-6"
              style={{
                background: "rgba(14,14,24,0.97)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
              }}
            >
              {/* 닫기 */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/30 transition-colors hover:border-white/15 hover:text-white/60"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* AIMI 카드 (피그마 스펙) */}
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 10,
                  background: "rgba(30,33,36,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  flexShrink: 0,
                }}
              >
                {/* 이중 글로우 */}
                <div style={{
                  position: "absolute", top: "5%", left: "-15%",
                  width: "75%", height: "65%", borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(124,58,237,0.5) 0%, transparent 70%)",
                  filter: "blur(18px)",
                }} />
                <div style={{
                  position: "absolute", bottom: "15%", right: "-15%",
                  width: "65%", height: "55%", borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(59,130,246,0.45) 0%, transparent 70%)",
                  filter: "blur(18px)",
                }} />

                {/* 캐릭터 */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                  style={{ position: "absolute", top: 32, left: 0, right: 0, display: "flex", justifyContent: "center" }}
                >
                  <img src={cfg.character} alt="에임이" style={{ width: 90, height: 90, objectFit: "contain" }} />
                </motion.div>

                {/* 텍스트 */}
                <p style={{
                  position: "absolute", top: 134, left: 0, right: 0,
                  textAlign: "center", fontSize: 12, color: "#b1b8be",
                  fontFamily: "var(--font-pretendard, sans-serif)",
                }}>
                  에임이 안내
                </p>
              </div>

              {/* 제목 + 설명 */}
              <div className="w-full space-y-2 text-center">
                <h3 className="text-[15px] font-bold text-white/90 leading-tight">
                  {cfg.title}
                </h3>
                <p className="text-[12px] leading-relaxed text-white/45 whitespace-pre-line">
                  {cfg.desc}
                </p>
              </div>

              {/* CTA 버튼 */}
              <div className="w-full space-y-2">
                <button
                  onClick={handleCta}
                  className="w-full rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #5a3ee1, #735FE9)" }}
                >
                  {cfg.cta}
                </button>
                {cfg.secondary && (
                  <button
                    onClick={handleSecondary}
                    className="w-full rounded-xl py-2.5 text-xs font-medium text-white/40 transition-colors hover:text-white/60"
                  >
                    {cfg.secondary}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
