"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── 캐릭터별 메타 ────────────────────────────────────────────
const CHARACTER_META = {
  ch1: { src: "/img/ch1.png", alt: "AIMI 작업 중" },
  ch2: { src: "/img/ch2.png", alt: "AIMI 환영" },
  ch3: { src: "/img/ch3.png", alt: "AIMI 대기 중" },
  ch4: { src: "/img/ch4.png", alt: "AIMI 완료" },
  ch5: { src: "/img/ch5.png", alt: "AIMI AI 처리 중" },
} as const;

type CharacterKey = keyof typeof CHARACTER_META;

// ── Props ────────────────────────────────────────────────────
interface AIMILoaderProps {
  /** 사용할 캐릭터 이미지 */
  character?: CharacterKey;
  /** 메인 타이틀 */
  title?: string;
  /** 순환 문구 배열 (빈 배열이면 subtitle 고정) */
  subtitles?: string[];
  /** 고정 부제 (subtitles 없을 때) */
  subtitle?: string;
  /**
   * overlay  : fixed inset-0, 전체 화면 반투명 오버레이
   * fullscreen: w-full h-full, 특정 컨테이너 채움
   */
  variant?: "overlay" | "fullscreen";
  /** 캐릭터 크기 */
  size?: "sm" | "md" | "lg";
  /** overlay 모드에서 show/hide 제어 */
  show?: boolean;
}

// ── 점 애니메이션 ─────────────────────────────────────────────
function LoadingDots() {
  return (
    <span className="inline-flex items-end gap-[3px] ml-0.5">
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

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function AIMILoader({
  character = "ch1",
  title = "Loading...",
  subtitles,
  subtitle,
  variant = "overlay",
  size = "md",
  show = true,
}: AIMILoaderProps) {
  const meta = CHARACTER_META[character];

  const sizeMap = {
    sm: 96,
    md: 140,
    lg: 180,
  };
  const charSize = sizeMap[size];

  // 해상된 서브타이틀 배열
  const resolvedSubtitles =
    subtitles && subtitles.length > 0
      ? subtitles
      : subtitle
      ? [subtitle]
      : [];

  // ── 내부 콘텐츠 ───────────────────────────────────────────
  const content = (
    <div className="flex flex-col items-center gap-5 select-none">
      {/* 글로우 + 캐릭터 */}
      <div className="relative flex items-center justify-center">
        {/* 배경 글로우 */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: charSize * 1.4,
            height: charSize * 1.4,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0) 70%)",
            filter: "blur(8px)",
          }}
        />

        {/* 캐릭터 — 둥둥 떠다니기 */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [-1, 1, -1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: "easeInOut",
          }}
        >
          <motion.img
            src={meta.src}
            alt={meta.alt}
            width={charSize}
            height={charSize}
            style={{ objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(99,102,241,0.3))" }}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      </div>

      {/* 텍스트 영역 */}
      <div className="flex flex-col items-center gap-2.5">
        {/* 타이틀 + 점 애니메이션 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex items-center gap-1 text-white/80 font-semibold tracking-wide"
          style={{ fontSize: size === "sm" ? 13 : size === "md" ? 16 : 18 }}
        >
          {title}
          <LoadingDots />
        </motion.div>

        {/* 서브타이틀 */}
        {resolvedSubtitles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="min-h-[24px]"
          >
            <CyclingSubtitle subtitles={resolvedSubtitles} />
          </motion.div>
        )}

        {/* 하단 진행 바 */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
          className="w-32 h-[2px] rounded-full overflow-hidden bg-white/10"
        >
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", repeatDelay: 0.3 }}
            className="h-full w-1/2 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(99,102,241,1), transparent)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );

  // ── overlay 모드 ──────────────────────────────────────────
  if (variant === "overlay") {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] flex items-center justify-center"
            style={{ background: "rgba(8,8,16,0.82)", backdropFilter: "blur(6px)" }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── fullscreen 모드 ───────────────────────────────────────
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: "#070F24" }}
    >
      {content}
    </div>
  );
}

// ── 프리셋 팩토리 ─────────────────────────────────────────────

/** 하네스 생성 전용 로더 */
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

/** Guard 초기 로딩 전용 로더 */
export function GuardLoader() {
  return (
    <AIMILoader
      character="ch2"
      title="보안 시스템 연결 중"
      subtitles={[
        "실시간 모니터링을 활성화하고 있어요",
        "센서 장비 연결을 확인하고 있어요",
        "알람 규칙을 불러오고 있어요",
      ]}
      variant="fullscreen"
      size="lg"
    />
  );
}
