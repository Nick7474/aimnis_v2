"use client";

/**
 * MonitorWrapper — 에디터 중앙 캔버스
 *
 * 기존 Map 기반 모니터링(EditableSection 오버레이) 완전 유지.
 * + 페이지 추가 기능: 2단계 프로세스 (페이지 선택 → 기능 설정 + AI 미리보기)
 * + 동적 사이드바: guardPagesStore 기반
 * + 페이지 삭제 기능
 */

import React, { lazy, Suspense, useEffect, useState, useRef, useMemo, useCallback, type CSSProperties } from "react";
import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ConfigProvider, Spin, Tooltip, theme } from "antd";
import {
  MonitorOutlined, VideoCameraOutlined, BellOutlined, BarChartOutlined,
  ThunderboltOutlined, SettingOutlined, UserOutlined, WifiOutlined,
  PlusOutlined, CloseOutlined, CheckOutlined, DeleteOutlined,
} from "@ant-design/icons";
import { useAlarmStore, useAuthStore } from "@/guard-app/stores";
import { useEditorStore } from "@/store/editorStore";
import { useGuardPagesStore, AVAILABLE_PAGES } from "@/store/guardPagesStore";
import AimGuardLogo from "@/guard-app/components/AimGuardLogo";
import EditableSection from "./EditableSection";
import { brandToAntToken, brandToCssVars, type BrandSettings } from "@/lib/brandPresets";
import "@/guard-app/aim-guard.css";

function sectionVars(brand: BrandSettings, override?: Partial<BrandSettings>) {
  return brandToCssVars({ ...brand, ...(override ?? {}) }) as CSSProperties;
}

// ── 페이지 컴포넌트 ──────────────────────────────────────────
const MonitorPage    = lazy(() => import("@/guard-app/pages/Monitor"));
const CctvDashboard  = lazy(() => import("@/guard-app/pages/CctvDashboard"));
const GuardEvents    = lazy(() => import("@/guard-app/pages/Events"));
const StatsPage      = lazy(() => import("@/guard-app/pages/Stats"));
const EventRulesPage = lazy(() => import("@/guard-app/pages/admin/EventRules"));
const SettingsPage   = lazy(() => import("@/guard-app/pages/admin/Settings"));

function buildGuardTheme(brand: BrandSettings) {
  const lightSurface = isLightBrandSurface(brand.backgroundColor);
  return {
    algorithm: lightSurface ? theme.defaultAlgorithm : theme.darkAlgorithm,
    token: brandToAntToken(brand),
  };
}

function isLightBrandSurface(hex: string) {
  const clean = hex.replace("#", "").slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return false;
  const [r, g, b] = [0, 2, 4].map((index) => Number.parseInt(clean.slice(index, index + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.72;
}

function renderProductName(productName: string, primaryColor: string) {
  const [first, ...rest] = productName.split(" ");
  if (!first) return null;
  return (
    <>
      <span style={{ color: primaryColor }}>{first}</span>
      {rest.length > 0 ? ` ${rest.join(" ")}` : null}
    </>
  );
}

// ── 아이콘 맵 ────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
  MonitorOutlined:     <MonitorOutlined />,
  VideoCameraOutlined: <VideoCameraOutlined />,
  BellOutlined:        <BellOutlined />,
  BarChartOutlined:    <BarChartOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  SettingOutlined:     <SettingOutlined />,
};

// ── 페이지 타입 정의 (HTML 기획서 동일) ──────────────────────
const PAGE_TYPES = [
  { id: "video",    route: "/cctv",               icon: <VideoCameraOutlined />, iconKey: "VideoCameraOutlined", name: "영상 모니터링", desc: "CCTV 채널별 실시간 영상 및 멀티뷰 모니터링",     color: "oklch(70% 0.14 210)" },
  { id: "events",   route: "/events",              icon: <BellOutlined />,        iconKey: "BellOutlined",        name: "이벤트",        desc: "보안 알람 이벤트 목록 및 처리 현황",               color: "oklch(68% 0.18 55)"  },
  { id: "stats",    route: "/stats",               icon: <BarChartOutlined />,    iconKey: "BarChartOutlined",    name: "통계",          desc: "구역별·시간대별 이벤트 통계 및 분석 차트",         color: "oklch(60% 0.20 285)" },
  { id: "rules",    route: "/admin/event-rules",   icon: <ThunderboltOutlined />, iconKey: "ThunderboltOutlined", name: "이벤트 규칙",   desc: "알람 발생 조건 및 자동 대응 규칙 설정",             color: "oklch(74% 0.16 85)"  },
  { id: "settings", route: "/admin/settings",      icon: <SettingOutlined />,     iconKey: "SettingOutlined",     name: "설정",          desc: "시스템 환경 설정, 사용자 관리, 장치 연결",           color: "oklch(68% 0.012 275)" },
];

// ── 기능 설정 질문 (HTML 기획서 SPECS 동일) ──────────────────
const SPECS: Record<string, { title: string; qs: { id: string; label: string; multi: boolean; options: string[] }[] }> = {
  video: { title: "영상 모니터링 설정", qs: [
    { id: "split",    label: "기본 화면 분할 방식은?",          multi: false, options: ["1분할","4분할","9분할","16분할","32분할"] },
    { id: "quality",  label: "스트리밍 화질 우선순위는?",        multi: false, options: ["고화질 (4K/2K)","표준 (FHD)","저지연 우선 (SD)","자동 조절"] },
    { id: "features", label: "필요한 기능을 선택하세요 (복수)",  multi: true,  options: ["PTZ 제어","화면 녹화","스냅샷 저장","알람 팝업 연동","전체화면 모드"] },
  ]},
  events: { title: "이벤트 목록 설정", qs: [
    { id: "types",  label: "모니터링할 이벤트 유형은? (복수)", multi: true,  options: ["INTRUSION (침입 감지)","ACCESS_DENIED (접근 거부)","FORCED_OPEN (강제 개방)","DI_INPUT (센서 입력)","DOOR_HELD_OPEN (문 열림 유지)"] },
    { id: "filter", label: "기본 필터 상태는?",                multi: false, options: ["전체 이벤트","미확인(UNACKED)만","오늘 발생 이벤트","최근 24시간"] },
    { id: "cols",   label: "표시 컬럼을 선택하세요 (복수)",    multi: true,  options: ["발생시간","Zone","장비명","이벤트 타입","위치","확인 상태","담당자"] },
  ]},
  stats: { title: "통계 대시보드 설정", qs: [
    { id: "period", label: "기본 집계 기간은?",               multi: false, options: ["오늘","최근 7일","이번 달","분기","사용자 지정"] },
    { id: "charts", label: "표시할 차트 유형은? (복수)",      multi: true,  options: ["시간대별 이벤트 추이","Zone별 TOP 5","장비 유형별 비율","이벤트 타입 분류","주간 비교 추이"] },
    { id: "kpis",   label: "상단 KPI 카드 항목은? (복수)",    multi: true,  options: ["전체 이벤트","위험(CRITICAL)","미확인 알람","확인 처리율","평균 응답 시간"] },
  ]},
  rules: { title: "이벤트 규칙 설정", qs: [
    { id: "triggers",  label: "주요 규칙 트리거 유형은? (복수)", multi: true, options: ["침입 감지 (INTRUSION)","접근 거부 (ACCESS_DENIED)","강제 개방 (FORCED_OPEN)","센서 이상 (DI_INPUT)","복합 조건 트리거"] },
    { id: "actions",   label: "자동 대응 액션은? (복수)",        multi: true, options: ["CCTV 팝업 표시","PTZ 프리셋 이동","릴레이 제어","앱 알림 전송","외부 API 호출"] },
    { id: "severity",  label: "적용할 심각도 수준은? (복수)",    multi: true, options: ["CRITICAL","HIGH","MEDIUM","LOW"] },
  ]},
  settings: { title: "설정 페이지 구성", qs: [
    { id: "tabs",    label: "필요한 설정 탭은? (복수)",    multi: true,  options: ["맵 관리","Zone 편집","장비 관리","VMS/CCTV 연동","사용자 권한"] },
    { id: "maptype", label: "사용 중인 맵 유형은?",        multi: false, options: ["도면 이미지 (IMAGE)","위성 지도 (NAVER/카카오)","혼합 사용","3D 평면도"] },
    { id: "users",   label: "사용자 권한 체계는?",         multi: false, options: ["2단계 (관리자/일반)","3단계 (관리자/운영자/조회)","커스텀 역할 설정"] },
  ]},
};

// ── Chip 컴포넌트 ────────────────────────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 13px", borderRadius: 7, cursor: "pointer",
      border: `1px solid ${selected ? "oklch(60% 0.20 285 / .7)" : "var(--border2)"}`,
      background: selected ? "oklch(60% 0.20 285 / .15)" : "var(--s2)",
      color: selected ? "var(--t1)" : "var(--t2)",
      fontSize: 12, fontFamily: "var(--font)", fontWeight: selected ? 600 : 400,
      transition: "all .15s",
    }}>
      {selected && <CheckOutlined style={{ fontSize: 10, color: "oklch(60% 0.20 285)" }} />}
      {label}
    </button>
  );
}

// ── AI 생성 미리보기 패널 ────────────────────────────────────
function HarnessPreview({
  pageType, answers, canCreate, onCreate,
}: {
  pageType: typeof PAGE_TYPES[0];
  answers: Record<string, string[]>;
  canCreate: boolean;
  onCreate: () => void;
}) {
  const specs = SPECS[pageType.id];
  const catMap: Record<string, string[]> = {
    video: ["기본 설정", "화질 설정", "기능 구성"],
    events: ["이벤트 유형", "필터 설정", "컬럼 구성"],
    stats: ["기간 설정", "차트 구성", "KPI 설정"],
    rules: ["트리거 설정", "액션 구성", "심각도 설정"],
    settings: ["탭 구성", "맵 설정", "권한 설정"],
  };
  const fileNames: Record<string, string> = {
    video: "video_monitoring.md", events: "event_management.md",
    stats: "statistics_dashboard.md", rules: "event_rules.md", settings: "system_settings.md",
  };

  const lines = useMemo(() => {
    const r: { t: string; text?: string; ok?: boolean }[] = [];
    const today = new Date().toLocaleDateString("ko-KR");
    const cats = catMap[pageType.id] ?? ["설정 1", "설정 2", "설정 3"];
    r.push({ t: "h1", text: `# ${pageType.name} 설정서` });
    r.push({ t: "blank" });
    r.push({ t: "h2", text: "## 프로젝트 정보" });
    r.push({ t: "meta", text: `- 솔루션: AIM GUARD v1.0` });
    r.push({ t: "meta", text: `- 생성일: ${today}` });
    r.push({ t: "meta", text: `- 상태: 설계 중...` });
    r.push({ t: "blank" });
    specs.qs.forEach((q, i) => {
      const ans = answers[q.id] ?? [];
      const ok = ans.length > 0;
      r.push({ t: "h2", text: `## ${cats[i] ?? q.label}` });
      r.push({ t: "q", ok, text: q.label });
      if (ok) ans.forEach(a => r.push({ t: "a", text: a }));
      else r.push({ t: "pending" });
      r.push({ t: "blank" });
    });
    return r;
  }, [pageType, answers]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  return (
    <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", background: "oklch(9% 0.020 275)", height: "100%", borderLeft: "1px solid var(--border2)" }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 3 }}>AI 생성 미리보기</div>
        <div style={{ fontSize: 11, color: "var(--t4)" }}>답변 내용이 실시간으로 설계서에 반영됩니다</div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", padding: "14px 16px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "oklch(16% 0.018 275)", borderRadius: "10px 10px 0 0", border: "1px solid var(--border2)", borderBottom: "none", padding: "9px 14px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#FF5F57","#FFBD2E","#28CA41"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
          </div>
          <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)" }}>{fileNames[pageType.id]}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 4, background: "oklch(65% 0.16 145 / .12)", border: "1px solid oklch(65% 0.16 145 / .3)" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 9, color: "var(--green)", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
          </div>
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", background: "oklch(12% 0.018 275)", border: "1px solid var(--border2)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "14px 16px", fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.85 }}>
          {lines.map((ln, i) => {
            if (ln.t === "blank") return <div key={i} style={{ height: 6 }} />;
            if (ln.t === "h1") return <div key={i} style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>{ln.text}</div>;
            if (ln.t === "h2") return <div key={i} style={{ fontSize: 12, fontWeight: 700, color: "oklch(70% 0.14 210)", marginTop: 8 }}>{ln.text}</div>;
            if (ln.t === "meta") return <div key={i} style={{ color: "var(--t3)", paddingLeft: 4 }}>{ln.text}</div>;
            if (ln.t === "q") return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, paddingLeft: 4, marginTop: 2 }}>
                <span style={{ color: ln.ok ? "oklch(65% 0.16 145)" : "var(--t4)", flexShrink: 0 }}>{ln.ok ? "✅" : "□"}</span>
                <span style={{ color: ln.ok ? "var(--t1)" : "var(--t3)", fontWeight: ln.ok ? 600 : 400 }}>{ln.text}</span>
              </div>
            );
            if (ln.t === "a") return <div key={i} style={{ color: "var(--t2)", paddingLeft: 28 }}>{"  - " + ln.text}</div>;
            if (ln.t === "pending") return <div key={i} style={{ color: "var(--t4)", paddingLeft: 28 }}>{"  - 선택 대기 중..."}</div>;
            return null;
          })}
        </div>
      </div>

      <div style={{ padding: "14px 16px 16px", borderTop: "1px solid var(--border)", flexShrink: 0, marginTop: 8 }}>
        <button onClick={onCreate} style={{
          width: "100%", padding: "13px", borderRadius: 10, border: "none",
          background: canCreate ? "linear-gradient(135deg, oklch(58% 0.22 285), oklch(52% 0.20 295))" : "var(--s3)",
          color: canCreate ? "white" : "var(--t4)", fontFamily: "var(--font)", fontSize: 13,
          fontWeight: 700, cursor: canCreate ? "pointer" : "not-allowed",
          boxShadow: canCreate ? "0 4px 20px oklch(55% 0.22 285 / .4)" : "none",
          transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          페이지 생성하기 →
        </button>
        <div style={{ fontSize: 10, color: "var(--t4)", textAlign: "center", marginTop: 7 }}>
          {canCreate ? "선택 완료 후 바로 페이지를 생성할 수 있습니다" : "최소 1개 항목을 선택하면 활성화됩니다"}
        </div>
      </div>
    </div>
  );
}

// ── 페이지 추가 모달 (2단계) ─────────────────────────────────
function PageAddModal({ onClose, onCreated }: { onClose: () => void; onCreated: (route: string) => void }) {
  const { addedPages, addPage } = useGuardPagesStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<typeof PAGE_TYPES[0] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const addedRoutes = addedPages.map(p => p.key);
  const canCreate = selected !== null && SPECS[selected.id]?.qs.some(q => (answers[q.id] ?? []).length > 0);

  const toggle = (qid: string, opt: string, multi: boolean) => {
    setAnswers(prev => {
      const cur = prev[qid] ?? [];
      return { ...prev, [qid]: multi ? (cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt]) : (cur[0] === opt ? [] : [opt]) };
    });
  };

  const handleCreate = () => {
    if (!selected || !canCreate) return;
    const pt = PAGE_TYPES.find(p => p.id === selected.id)!;
    // guardPagesStore에 추가
    addPage(pt.route);
    onCreated(pt.route);
    onClose();
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", alignItems: "stretch" }}>
      {/* 배경 딤 */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }} />

      {/* 패널 컨테이너 */}
      <motion.div
        initial={{ x: 24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 24, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative", zIndex: 1, display: "flex", flexDirection: "row",
          height: "100%", marginLeft: "auto",
          boxShadow: "-8px 0 40px rgba(0,0,0,.5)",
        }}
      >
        {/* 왼쪽: 질문 패널 */}
        <div style={{ width: 480, flexShrink: 0, background: "var(--s1)", borderLeft: "1px solid var(--border2)", display: "flex", flexDirection: "column", height: "100%" }}>
          {/* 헤더 */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {step === 2 && (
                  <button onClick={() => { setStep(1); setSelected(null); setAnswers({}); }}
                    style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border2)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t3)" }}>
                    ‹
                  </button>
                )}
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--t1)" }}>
                    {step === 1 ? "페이지 추가" : `${selected?.name} 설정`}
                  </h2>
                  <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                    {step === 1 ? "추가할 페이지를 선택하세요" : "설문에 답변하면 최적 설정으로 페이지를 생성합니다"}
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--t3)" }}>
                <CloseOutlined style={{ fontSize: 13 }} />
              </button>
            </div>

            {/* 스텝 인디케이터 */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center" }}>
              {["페이지 선택", "기능 설정"].map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: step > i ? "var(--primary)" : step === i + 1 ? "var(--primary)" : "var(--s4)", border: `1px solid ${step >= i + 1 ? "var(--primary)" : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: step >= i + 1 ? "white" : "var(--t4)", transition: "all .2s" }}>
                      {step > i + 1 ? <CheckOutlined style={{ fontSize: 10 }} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 11, color: step === i + 1 ? "var(--t1)" : "var(--t4)", fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
                  </div>
                  {i < 1 && <span style={{ fontSize: 11, color: "var(--t4)", margin: "0 2px" }}>›</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 본문 */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
            {/* STEP 1: 페이지 선택 */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PAGE_TYPES.map(pt => {
                  const added = addedRoutes.includes(pt.route);
                  return (
                    <button key={pt.id} disabled={added}
                      onClick={() => { if (!added) { setSelected(pt); setStep(2); } }}
                      style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", border: `1px solid ${added ? "var(--border)" : "var(--border2)"}`, borderRadius: 12, cursor: added ? "default" : "pointer", background: added ? "transparent" : "var(--s2)", transition: "all .15s", opacity: added ? 0.5 : 1, textAlign: "left", width: "100%" }}
                      onMouseEnter={e => { if (!added) { (e.currentTarget as HTMLElement).style.borderColor = "oklch(60% 0.20 285 / .5)"; (e.currentTarget as HTMLElement).style.background = "var(--s3)"; } }}
                      onMouseLeave={e => { if (!added) { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.background = "var(--s2)"; } }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `color-mix(in oklch, ${pt.color} 15%, transparent)`, border: `1px solid color-mix(in oklch, ${pt.color} 30%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", color: pt.color, fontSize: 20 }}>
                        {pt.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{pt.name}</span>
                          {added && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "var(--s4)", color: "var(--t4)", fontWeight: 600 }}>추가됨</span>}
                        </div>
                        <span style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>{pt.desc}</span>
                      </div>
                      {!added && <span style={{ color: "var(--t4)", fontSize: 16 }}>›</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2: 기능 설정 */}
            {step === 2 && selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {/* 선택된 페이지 배지 */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: `color-mix(in oklch, ${selected.color} 8%, transparent)`, border: `1px solid color-mix(in oklch, ${selected.color} 25%, transparent)`, borderRadius: 10, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `color-mix(in oklch, ${selected.color} 15%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: selected.color, fontSize: 16 }}>
                    {selected.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{selected.name}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>{selected.desc}</div>
                  </div>
                </div>

                {/* 질문 카드 */}
                {SPECS[selected.id]?.qs.map((q, qi) => {
                  const ans = answers[q.id] ?? [];
                  return (
                    <div key={q.id} style={{ marginBottom: 16, padding: 16, background: ans.length > 0 ? "oklch(60% 0.20 285 / .04)" : "var(--s2)", border: `1px solid ${ans.length > 0 ? "oklch(60% 0.20 285 / .25)" : "var(--border)"}`, borderRadius: 12, transition: "all .2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t4)", fontFamily: "var(--mono)" }}>{String(qi + 1).padStart(2, "0")}</span>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", flex: 1, lineHeight: 1.4, margin: 0 }}>{q.label}</p>
                        {ans.length > 0 && <CheckOutlined style={{ fontSize: 14, color: "oklch(65% 0.16 145)" }} />}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {q.options.map(opt => (
                          <Chip key={opt} label={opt} selected={ans.includes(opt)} onClick={() => toggle(q.id, opt, q.multi)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* 푸터 */}
          {step === 1 && (
            <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "var(--t4)", textAlign: "center" }}>페이지를 선택하면 설정 단계로 이동합니다</div>
            </div>
          )}
        </div>

        {/* 오른쪽: AI 생성 미리보기 (Step 2에서만) */}
        <AnimatePresence>
          {step === 2 && selected && (
            <motion.div key="preview" initial={{ width: 0, opacity: 0 }} animate={{ width: 380, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden", height: "100%" }}>
              <HarnessPreview pageType={selected} answers={answers} canCreate={!!canCreate} onCreate={handleCreate} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ── 자동 로그인 ───────────────────────────────────────────────
const AutoLogin: React.FC = () => {
  const { user, login } = useAuthStore();
  useEffect(() => { if (!user) login({ id: "demo", name: "데모 관리자", role: "ADMIN" }); }, []);
  return null;
};

// ── PageLoading ───────────────────────────────────────────────
const PageLoading = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#070F24" }}>
    <Spin size="large" />
  </div>
);

// ── 내부 레이아웃 (MemoryRouter 내부) ────────────────────────
function InnerLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const alarms    = useAlarmStore((s) => s.alarms);
  const unacked   = alarms.length;
  const systemTitle       = useEditorStore((s) => s.systemTitle);
  const brand = useEditorStore((s) => s.brand);
  const sectionStyles = useEditorStore((s) => s.sectionStyles);
  const hiddenMonitorPanels = useEditorStore((s) => s.hiddenMonitorPanels);
  const { addedPages, removePage } = useGuardPagesStore();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const currentPath = location.pathname;
  const isMonitor   = currentPath === "/monitor" || currentPath === "/";
  const guardVars = brandToCssVars(brand) as CSSProperties;
  const headerVars = sectionVars(brand, sectionStyles.header);
  const sidebarVars = sectionVars(brand, sectionStyles.sidebar);
  const rightPanelSplit = "42%";

  // 사이드바: 기본 Map + 추가된 페이지
  const BASE = [{ key: "/monitor", iconKey: "MonitorOutlined", label: "Map 기반 모니터링" }];
  const adminKeys   = ["/admin/event-rules", "/admin/settings"];
  const allPages    = [...BASE, ...addedPages.map(p => ({ key: p.key, iconKey: p.icon, label: p.label }))];
  const mainPages   = allPages.filter(p => !adminKeys.includes(p.key));
  const adminPages  = allPages.filter(p => adminKeys.includes(p.key));

  const handleDelete = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    removePage(key);
    if (currentPath === key) navigate("/monitor");
  };

  return (
    <div style={{ ...guardVars, display: "flex", flexDirection: "column", width: "100%", height: "100%", minHeight: 0, maxHeight: "100%", background: "var(--guard-color-bg)", overflow: "hidden", fontFamily: "var(--guard-font-family)" }}>

      {/* ── 헤더 ── */}
      <EditableSection sectionId="header" type="header" label="헤더" panelType="brand" style={{ flexShrink: 0, ...headerVars }}>
        <header className="app-header" style={{ display: "flex", alignItems: "center", height: 44, padding: "0 20px", background: "var(--guard-color-surface-strong)", borderBottom: "1px solid var(--guard-color-border)", gap: 12, userSelect: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AimGuardLogo size={Math.min(brand.logoSize, 36)} src={brand.logoUrl} alt={`${brand.tenantName} logo`} />
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--guard-color-text-strong)", letterSpacing: "0.04em" }}>
                {renderProductName(brand.productName, sectionStyles.header?.accentColor ?? brand.primaryColor)}
              </div>
              <div style={{ marginTop: 2, fontSize: 8, color: "var(--guard-color-text-soft)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {brand.tenantName}
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, color: "var(--guard-color-text-soft)", marginLeft: 8, borderLeft: "1px solid var(--guard-color-border)", paddingLeft: 12 }}>{systemTitle}</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: "var(--guard-radius)", background: unacked > 0 ? "color-mix(in srgb, var(--guard-color-danger) 14%, transparent)" : "transparent", border: unacked > 0 ? "1px solid color-mix(in srgb, var(--guard-color-danger) 38%, transparent)" : "1px solid transparent" }}>
            <BellOutlined style={{ color: unacked > 0 ? "var(--guard-color-danger)" : "var(--guard-color-text-soft)", fontSize: 14 }} />
            {unacked > 0 && <span style={{ fontSize: 11, color: "var(--guard-color-danger)", fontWeight: 600 }}>{unacked}건</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--guard-color-text-soft)", fontSize: 12 }}>
            <UserOutlined /><span>데모 관리자</span>
          </div>
        </header>
      </EditableSection>

      {/* ── 바디 ── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

        {/* ── 사이드바 ── */}
        <EditableSection sectionId="sidebar" type="sidebar" label="사이드바" panelType="navigation" style={{ flexShrink: 0, ...sidebarVars }}>
          <aside style={{ width: 200, background: "var(--guard-color-surface)", borderRight: "1px solid var(--guard-color-border)", display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
            <div style={{ height: 36, display: "flex", alignItems: "center", padding: "0 16px", fontSize: 11, color: "var(--guard-color-muted)", borderBottom: "1px solid var(--guard-color-border)", letterSpacing: "0.04em", flexShrink: 0 }}>
              모니터링 시스템
            </div>

            <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
              {/* 일반 메뉴 */}
              {mainPages.map(item => {
                const active = currentPath === item.key || (item.key === "/monitor" && currentPath === "/");
                const isBase = item.key === "/monitor";
                const hovered = hoveredKey === item.key;
                return (
                  <div key={item.key}
                    onClick={() => navigate(item.key)}
                    onMouseEnter={() => setHoveredKey(item.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: "var(--guard-radius)", margin: "1px 8px", background: active ? "color-mix(in srgb, var(--guard-color-primary) 18%, transparent)" : "transparent", color: active ? "var(--guard-color-accent)" : "var(--guard-color-text)", fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer", boxShadow: active ? "inset 0 0 0 1px color-mix(in srgb, var(--guard-color-primary) 42%, transparent)" : "none", transition: "background .12s", position: "relative" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{ICON_MAP[item.iconKey] ?? null}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {/* 삭제 버튼 (기본 맵 페이지 제외) */}
                    {!isBase && hovered && (
                      <button onClick={(e) => handleDelete(e, item.key)}
                        style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid rgba(220,38,38,0.4)", background: "rgba(220,38,38,0.12)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", flexShrink: 0 }}>
                        <DeleteOutlined style={{ fontSize: 10 }} />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* 관리자 메뉴 */}
              {adminPages.length > 0 && <div style={{ height: 1, background: "var(--guard-color-border)", margin: "6px 16px" }} />}
              {adminPages.map(item => {
                const active = currentPath === item.key;
                const hovered = hoveredKey === item.key;
                return (
                  <div key={item.key}
                    onClick={() => navigate(item.key)}
                    onMouseEnter={() => setHoveredKey(item.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: "var(--guard-radius)", margin: "1px 8px", background: active ? "color-mix(in srgb, var(--guard-color-primary) 18%, transparent)" : "transparent", color: active ? "var(--guard-color-accent)" : "var(--guard-color-text)", fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer", transition: "background .12s", position: "relative" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{ICON_MAP[item.iconKey] ?? null}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {hovered && (
                      <button onClick={(e) => handleDelete(e, item.key)}
                        style={{ width: 20, height: 20, borderRadius: 4, border: "1px solid rgba(220,38,38,0.4)", background: "rgba(220,38,38,0.12)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", flexShrink: 0 }}>
                        <DeleteOutlined style={{ fontSize: 10 }} />
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* 페이지 추가 버튼 */}
            <div style={{ padding: "8px 10px", borderTop: "1px solid var(--guard-color-border)", flexShrink: 0 }}>
              <button onClick={() => setBuilderOpen(true)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 7, padding: "8px 10px", borderRadius: "var(--guard-radius)", cursor: "pointer", border: "1px dashed color-mix(in srgb, var(--guard-color-primary) 42%, transparent)", background: "color-mix(in srgb, var(--guard-color-primary) 8%, transparent)", color: "var(--guard-color-accent)", fontSize: 11, fontWeight: 500, transition: "all .15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--guard-color-primary) 16%, transparent)"; (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--guard-color-primary) 68%, transparent)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--guard-color-primary) 8%, transparent)"; (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--guard-color-primary) 42%, transparent)"; }}
              >
                <PlusOutlined style={{ fontSize: 12 }} />
                페이지 추가
              </button>
            </div>

            <div style={{ height: 32, display: "flex", alignItems: "center", padding: "0 16px", fontSize: 10, color: "var(--guard-color-muted)", borderTop: "1px solid var(--guard-color-border)", letterSpacing: 1 }}>
              {brand.productName} v1.0.0
            </div>
          </aside>
        </EditableSection>

        {/* ── 컨텐츠 영역 ── */}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: "relative", overflow: "hidden" }}>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Navigate to="/monitor" replace />} />

              {/* Map 기반 모니터링 — 기존 EditableSection 완전 유지 */}
              <Route path="/monitor" element={
                <div style={{ width: "100%", height: "100%", minHeight: 0, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <MonitorPage />
                  <EditableSection sectionId="map" type="map" label="맵 영역" panelType="gis" variant="overlay" badgePosition="top-left" style={{ top: 0, left: 0, right: 300, bottom: 0 }} />
                  <EditableSection sectionId="alarm-panel" type="alarm-panel" label="알람 패널" panelType="alarm" variant="overlay" style={{ top: 0, right: 0, width: 300, height: rightPanelSplit }} />
                  <EditableSection sectionId="floor-status" type="floor-status" label="플로어 상태" panelType="widget" variant="overlay" style={{ top: rightPanelSplit, right: 0, width: 300, bottom: 0 }} />
                  <AnimatePresence>
                    {hiddenMonitorPanels.includes("alarm-panel") && (
                      <motion.div key="cv1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", top: 0, right: 0, width: 300, height: rightPanelSplit, background: "var(--guard-color-bg)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid var(--guard-color-border)" }}>
                        <span style={{ fontSize: 10, color: "var(--guard-color-border)" }}>알람 패널 숨김</span>
                      </motion.div>
                    )}
                    {hiddenMonitorPanels.includes("floor-status") && (
                      <motion.div key="cv2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", top: rightPanelSplit, right: 0, width: 300, bottom: 0, background: "var(--guard-color-bg)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid var(--guard-color-border)", borderTop: "1px solid var(--guard-color-border)" }}>
                        <span style={{ fontSize: 10, color: "var(--guard-color-border)" }}>장비·CCTV 숨김</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              } />

              {/* 추가 페이지 — guard-app 실제 컴포넌트 */}
              <Route path="/cctv"              element={<CctvDashboard />} />
              <Route path="/events"            element={<GuardEvents />} />
              <Route path="/stats"             element={<StatsPage />} />
              <Route path="/admin/event-rules" element={<EventRulesPage />} />
              <Route path="/admin/settings"    element={<SettingsPage />} />
              <Route path="*"                  element={<Navigate to="/monitor" replace />} />
            </Routes>
          </Suspense>

          {/* 페이지 추가 모달 오버레이 */}
          <AnimatePresence>
            {builderOpen && (
              <PageAddModal
                onClose={() => setBuilderOpen(false)}
                onCreated={(route) => {
                  setBuilderOpen(false);
                  setTimeout(() => navigate(route), 100);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 상태바 ── */}
      <footer style={{ height: 24, flexShrink: 0, display: "flex", alignItems: "center", gap: 16, padding: "0 16px", background: "var(--guard-color-surface-strong)", borderTop: "1px solid var(--guard-color-border)", fontSize: 10, color: "var(--guard-color-muted)" }}>
        {[{ label: "Senstar-1F: 연결", color: brand.successColor }, { label: "ADAM-1F: 연결", color: brand.successColor }, { label: "출입-A: 끊김", color: brand.dangerColor }].map(s => (
          <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, boxShadow: `0 0 4px ${s.color}`, display: "inline-block" }} />
            {s.label}
          </span>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <WifiOutlined style={{ color: "var(--guard-color-accent)" }} />
          WS: <span style={{ color: "var(--guard-color-success)" }}>● 연결됨</span>
        </span>
      </footer>
    </div>
  );
}

// ── 메인 Export ──────────────────────────────────────────────
export default function MonitorWrapper() {
  const brand = useEditorStore((s) => s.brand);
  const guardTheme = useMemo(() => buildGuardTheme(brand), [brand]);

  return (
    <ConfigProvider theme={guardTheme}>
      <MemoryRouter initialEntries={["/monitor"]}>
        <AutoLogin />
        <InnerLayout />
      </MemoryRouter>
    </ConfigProvider>
  );
}
