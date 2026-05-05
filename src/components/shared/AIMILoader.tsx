"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── 캐릭터 메타 ──────────────────────────────────────────────
const CHARACTER_META = {
  ch1: { src: "/img/ch1.png", alt: "AIMI 작업 중" },        // 태블릿 홀로그램
  ch2: { src: "/img/ch2.png", alt: "AIMI 환영" },            // 손 흔들기
  ch3: { src: "/img/ch3.png", alt: "AIMI 자신감" },          // 팔짱
  ch4: { src: "/img/ch4.png", alt: "AIMI 완료" },            // 만세/점프
  ch5: { src: "/img/ch5.png", alt: "AIMI AI 처리" },         // AI 클라우드
} as const;

type CharacterKey = keyof typeof CHARACTER_META;

interface AIMILoaderProps {
  character?: CharacterKey;
  title?: string;
  subtitles?: string[];
  subtitle?: string;
  /** overlay: createPortal → body에 fixed / fullscreen: 컨테이너 채움 */
  variant?: "overlay" | "fullscreen";
  size?: "sm" | "md" | "lg";
  show?: boolean;
}

// ── 점 애니메이션 ─────────────────────────────────────────────
function LoadingDots() {
  return (
    <span className="inline-flex items-end gap-[3px] ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.15, 1, 0.15] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25, ease: "easeInOut" }}
          className="inline-block h-[5px] w-[5px] rounded-full bg-current"
        />
      ))}
    </span>
  );
}

// ── 순환 문구 ─────────────────────────────────────────────────
function CyclingSubtitle({ subtitles }: { subtitles: string[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (subtitles.length <= 1) return;
    const id = setInterval(() => setIdx((v) => (v + 1) % subtitles.length), 3000);
    return () => clearInterval(id);
  }, [subtitles.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="text-sm text-white/45 text-center leading-relaxed"
      >
        {subtitles[idx]}
      </motion.p>
    </AnimatePresence>
  );
}

// ── 공통 내부 콘텐츠 ─────────────────────────────────────────
function LoaderContent({
  character,
  title,
  resolvedSubtitles,
  charSize,
  fontSize,
}: {
  character: CharacterKey;
  title: string;
  resolvedSubtitles: string[];
  charSize: number;
  fontSize: number;
}) {
  const meta = CHARACTER_META[character];

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {/* 글로우 + 캐릭터 */}
      <div className="relative flex items-center justify-center">
        {/* 보라 글로우 */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.45, 0.2] }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: charSize * 1.5,
            height: charSize * 1.5,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
            filter: "blur(12px)",
          }}
        />
        {/* 캐릭터 float */}
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [-1.5, 1.5, -1.5] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        >
          <motion.img
            src={meta.src}
            alt={meta.alt}
            width={charSize}
            height={charSize}
            style={{
              objectFit: "contain",
              filter: "drop-shadow(0 12px 28px rgba(139,92,246,0.35))",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      </div>

      {/* 텍스트 */}
      <div className="flex flex-col items-center gap-3">
        {/* 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex items-center gap-1 font-semibold tracking-wide text-white/85"
          style={{ fontSize }}
        >
          {title}
          <LoadingDots />
        </motion.div>

        {/* 서브타이틀 */}
        {resolvedSubtitles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="min-h-[22px]"
          >
            <CyclingSubtitle subtitles={resolvedSubtitles} />
          </motion.div>
        )}

        {/* 셔틀 진행 바 */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
          className="w-28 h-[2px] rounded-full overflow-hidden bg-white/10"
        >
          <motion.div
            animate={{ x: ["-100%", "250%"] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", repeatDelay: 0.4 }}
            className="h-full w-1/2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(139,92,246,0.9), rgba(99,102,241,1), transparent)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function AIMILoader({
  character = "ch1",
  title = "Loading",
  subtitles,
  subtitle,
  variant = "overlay",
  size = "md",
  show = true,
}: AIMILoaderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const sizeMap = { sm: 100, md: 148, lg: 188 };
  const fontMap = { sm: 13, md: 16, lg: 19 };
  const charSize = sizeMap[size];
  const fontSize = fontMap[size];

  const resolvedSubtitles =
    subtitles && subtitles.length > 0 ? subtitles : subtitle ? [subtitle] : [];

  const contentProps = { character, title, resolvedSubtitles, charSize, fontSize };

  // ── fullscreen: 컨테이너 채움 ─────────────────────────────
  if (variant === "fullscreen") {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: "#070F24" }}
      >
        <LoaderContent {...contentProps} />
      </div>
    );
  }

  // ── overlay: createPortal → CSS transform 영향 완전 차단 ──
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="aimi-loader-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(8,8,16,0.84)",
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)",
          }}
        >
          <LoaderContent {...contentProps} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── 프리셋 ───────────────────────────────────────────────────

/** 홈 Create Harness 클릭 시 — ch1 태블릿 작업 포즈 */
export function HarnessLoader({ show }: { show: boolean }) {
  return (
    <AIMILoader
      character="ch1"
      title="AIMI가 설계 중이에요"
      subtitles={[
        "현장 데이터 구조를 분석하고 있어요",
        "맞춤 위젯 레이아웃을 구성 중이에요",
        "최적 하네스 패턴을 적용하고 있어요",
        "마지막 검수를 진행 중이에요",
      ]}
      variant="overlay"
      size="md"
      show={show}
    />
  );
}

/** AIM GUARD 페이지 최초 진입 — ch2 손 흔드는 포즈 */
export function GuardLoader({ show }: { show: boolean }) {
  return (
    <AIMILoader
      character="ch2"
      title="보안 시스템 연결 중"
      subtitles={[
        "실시간 모니터링을 활성화하고 있어요",
        "센서 장비 연결을 확인하고 있어요",
        "알람 규칙을 불러오고 있어요",
      ]}
      variant="overlay"
      size="lg"
      show={show}
    />
  );
}
