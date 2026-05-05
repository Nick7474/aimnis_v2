"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── 캐릭터 메타 & 글로우 색상 (피그마 스펙 기반) ───────────────
const CHAR_META = {
  ch1: { src: "/img/ch1.png", alt: "AIMI 작업 중",   glow: "rgba(59,130,246,0.55)"  }, // 파랑
  ch2: { src: "/img/ch2.png", alt: "AIMI 환영",      glow: "rgba(30,41,59,0.7)"     }, // 다크
  ch3: { src: "/img/ch3.png", alt: "AIMI 자신감",    glow: "rgba(124,58,237,0.55)"  }, // 보라
  ch4: { src: "/img/ch4.png", alt: "AIMI 완료",      glow: "rgba(139,92,246,0.55)"  }, // 보라
  ch5: { src: "/img/ch5.png", alt: "AIMI AI처리",    glow: "rgba(220,38,38,0.5)"    }, // 빨강
} as const;

type CharKey = keyof typeof CHAR_META;

interface AIMILoaderProps {
  character?: CharKey;
  title?: string;
  subtitles?: string[];
  subtitle?: string;
  variant?: "overlay" | "fullscreen";
  show?: boolean;
}

// ── 순환 서브타이틀 ───────────────────────────────────────────
function Subtitle({ items }: { items: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setI(v => (v + 1) % items.length), 3000);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        style={{ color: "#fff", fontSize: 12, whiteSpace: "nowrap" }}
      >
        {items[i]}
      </motion.span>
    </AnimatePresence>
  );
}

// ── 점 애니메이션 ─────────────────────────────────────────────
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, marginLeft: 4, alignItems: "flex-end" }}>
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.22 }}
          style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "#b1b8be" }}
        />
      ))}
    </span>
  );
}

// ── 피그마 스펙 카드 콘텐츠 ──────────────────────────────────
function LoaderCard({
  character = "ch1",
  title = "Loading",
  subtitles = [],
}: {
  character: CharKey;
  title: string;
  subtitles: string[];
}) {
  const meta = CHAR_META[character];

  return (
    // 카드: 200×200px, bg rgba(30,33,36,0.2), blur-10, border 0.05
    <div style={{
      position: "relative",
      width: 200,
      height: 200,
      borderRadius: 10,
      background: "rgba(30,33,36,0.2)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.05)",
      overflow: "hidden",
    }}>
      {/* 배경 글로우 */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: 130,
          height: 110,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${meta.glow} 0%, transparent 70%)`,
          filter: "blur(14px)",
          pointerEvents: "none",
        }}
      />

      {/* 캐릭터 — top:39px, float 애니메이션 */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 39,
          left: "50%",
          transform: "translateX(-50%)",
          width: 85,
          height: 85,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={meta.src}
          alt={meta.alt}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </motion.div>

      {/* "Loading..." — top:134px */}
      <div style={{
        position: "absolute",
        top: 134,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{ color: "#b1b8be", fontSize: 12, fontFamily: "'Pretendard', sans-serif" }}>
          {title}
        </span>
        <Dots />
      </div>

      {/* 서브타이틀 — top:164px */}
      <div style={{
        position: "absolute",
        top: 164,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {subtitles.length > 0 && <Subtitle items={subtitles} />}
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
  show = true,
}: AIMILoaderProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const resolved = subtitles?.length ? subtitles : subtitle ? [subtitle] : [];

  // fullscreen: 컨테이너 채움
  if (variant === "fullscreen") {
    return (
      <div style={{
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#131316",
      }}>
        <LoaderCard character={character} title={title} subtitles={resolved} />
      </div>
    );
  }

  // overlay: createPortal → CSS transform 영향 완전 차단
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="aimi-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#131316",
          }}
        >
          <LoaderCard character={character} title={title} subtitles={resolved} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ── 프리셋 ───────────────────────────────────────────────────

/** 홈 Step2 하네스 생성 — ch1 태블릿 작업 */
export function HarnessLoader({ show }: { show: boolean }) {
  return (
    <AIMILoader
      character="ch1"
      title="AIMI가 설계 중이에요"
      subtitles={[
        "현장 데이터 구조 분석 중",
        "맞춤 위젯 레이아웃 구성 중",
        "최적 하네스 패턴 적용 중",
        "마지막 검수 진행 중",
      ]}
      variant="overlay"
      show={show}
    />
  );
}

/** AIM GUARD 초기 진입 — ch2 손 흔들기 */
export function GuardLoader({ show }: { show: boolean }) {
  return (
    <AIMILoader
      character="ch2"
      title="보안 시스템 연결 중"
      subtitles={[
        "실시간 모니터링 활성화 중",
        "센서 장비 연결 확인 중",
        "알람 규칙 로드 중",
      ]}
      variant="overlay"
      show={show}
    />
  );
}
