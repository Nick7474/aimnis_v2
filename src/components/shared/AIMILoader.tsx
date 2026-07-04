"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── 캐릭터 메타 & 이중 글로우 색상 (피그마 원본 기준) ─────────
const CHAR_META = {
  ch1: { src: "/img/ch1.png", alt: "AIMI 작업 중",
    glowL: "rgba(200,80,20,0.65)",   // 좌: 오렌지/레드
    glowR: "rgba(60,40,200,0.55)" }, // 우: 블루/퍼플
  ch2: { src: "/img/ch2.png", alt: "AIMI 환영",
    glowL: "rgba(20,40,80,0.5)",
    glowR: "rgba(30,60,120,0.45)" },
  ch3: { src: "/img/ch3.png", alt: "AIMI 자신감",
    glowL: "rgba(100,40,180,0.55)",
    glowR: "rgba(60,20,140,0.5)" },
  ch4: { src: "/img/ch4.png", alt: "AIMI 완료",
    glowL: "rgba(120,50,200,0.6)",
    glowR: "rgba(80,30,160,0.5)" },
  ch5: { src: "/img/ch5.png", alt: "AIMI AI처리",
    glowL: "rgba(200,40,30,0.6)",
    glowR: "rgba(40,20,120,0.5)" },
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
        style={{ color: "#fff", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
      >
        {items[i]}
      </motion.span>
    </AnimatePresence>
  );
}

// ── 점 애니메이션 ─────────────────────────────────────────────
function Dots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, marginLeft: 2, alignItems: "flex-end" }}>
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

// ── 피그마 스펙 카드 ──────────────────────────────────────────
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
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {/* ── 이중 글로우 (피그마 Vector2/3 재현) ── */}
      {/* 좌측 warm 글로우 */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "8%",
          left: "-15%",
          width: "75%",
          height: "65%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${meta.glowL} 0%, transparent 70%)`,
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />
      {/* 우측 cool 글로우 */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut", delay: 0.5 }}
        style={{
          position: "absolute",
          bottom: "18%",
          right: "-15%",
          width: "70%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${meta.glowR} 0%, transparent 70%)`,
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />

      {/* ── 캐릭터 (중앙 정렬 — flexbox, float 래퍼 분리) ── */}
      {/*
        position: absolute + translateX(-50%) 와 motion animate 충돌 방지
        → 외부 wrapper로 절대위치, 내부 motion으로 float
      */}
      <div style={{
        position: "absolute",
        top: 28,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        height: 90,
      }}>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <img
            src={meta.src}
            alt={meta.alt}
            style={{ width: 88, height: 88, objectFit: "contain" }}
          />
        </motion.div>
      </div>

      {/* ── 텍스트 영역 ── */}
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
        <span style={{ color: "#b1b8be", fontSize: 13, fontFamily: "var(--font-pretendard, sans-serif)" }}>
          {title}
        </span>
        <Dots />
      </div>

      {/* 서브타이틀 — top:162px */}
      <div style={{
        position: "absolute",
        top: 162,
        left: 8,
        right: 8,
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

export function HomeTransitionLoader({ show }: { show: boolean }) {
  return (
    <AIMILoader
      character="ch3"
      title="플랫폼 초기화 중"
      subtitles={[
        "AI 엔터프라이즈 환경 구성 중",
        "대시보드 데이터 준비 중",
        "솔루션 패키지 로드 중",
        "AI 엔진 웜업 중",
      ]}
      variant="overlay"
      show={show}
    />
  );
}

export function MonitoringInitLoader({ show }: { show: boolean }) {
  return (
    <AIMILoader
      character="ch4"
      title="모니터링 로드 중"
      subtitles={[
        "AIoT 센서 상태 확인 중",
        "실시간 데이터 스트림 연결 중",
        "대시보드 레이아웃 복원 중",
        "위젯 바인딩 초기화 중",
      ]}
      variant="overlay"
      show={show}
    />
  );
}

export function MonitoringMappingLoader({ show }: { show: boolean }) {
  return (
    <AIMILoader
      character="ch5"
      title="자동 매핑 중"
      subtitles={[
        "소스 필드 분석 중",
        "위젯 바인딩 생성 중",
        "데이터 연결 최적화 중",
      ]}
      variant="overlay"
      show={show}
    />
  );
}

export function MonitoringDBLoader({ show }: { show: boolean }) {
  return (
    <AIMILoader
      character="ch1"
      title="데이터 수집 중"
      subtitles={[
        "DB 소스 연결 확인 중",
        "실시간 스트림 초기화 중",
        "필드 스키마 파싱 중",
        "수집 파이프라인 준비 중",
      ]}
      variant="overlay"
      show={show}
    />
  );
}
