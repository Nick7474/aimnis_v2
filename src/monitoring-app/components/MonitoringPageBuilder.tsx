"use client";

/**
 * MonitoringPageBuilder — MonitorWrapper.tsx PageAddModal 동일 구조 포팅
 * 모든 색상을 tokens.css CSS 변수 사용 (AIM GUARD와 완전 동일한 껍데기)
 */

import React, { useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Activity, Wind, ShieldCheck,
  Bell, FileText, Settings, Check,
} from "lucide-react";
import {
  AVAILABLE_MONITORING_PAGES,
  type MonitoringPageConfig,
  type MonitoringPageMeta,
} from "@/store/monitoringPagesStore";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Activity:        <Activity size={20} />,
  Wind:            <Wind size={20} />,
  ShieldCheck:     <ShieldCheck size={20} />,
  Bell:            <Bell size={20} />,
  FileText:        <FileText size={20} />,
  Settings:        <Settings size={20} />,
};

const PAGE_COLORS: Record<string, string> = {
  integrated:  "oklch(60% 0.18 220)",
  equipment:   "oklch(60% 0.20 160)",
  environment: "oklch(65% 0.16 180)",
  worker:      "oklch(60% 0.18 280)",
  alerts:      "oklch(68% 0.18 55)",
  report:      "oklch(60% 0.15 300)",
  settings:    "oklch(60% 0.08 275)",
};

const SPECS: Record<string, { title: string; qs: { id: string; label: string; multi: boolean; options: string[] }[] }> = {
  integrated: { title: "통합 대시보드 설정", qs: [
    { id: "data",    label: "주요 표시 데이터는? (복수)",  multi: true,  options: ["설비 KPI", "환경 지표", "작업자 현황", "알림 피드", "위험 타임라인"] },
    { id: "refresh", label: "데이터 갱신 주기는?",         multi: false, options: ["실시간 (1초)", "운영 (5초)", "분석 (30초)", "리포트 (5분)"] },
    { id: "layout",  label: "레이아웃 구성은?",            multi: false, options: ["KPI 상단 + 차트 중단", "전체 요약 카드형", "타임라인 중심형", "혼합 레이아웃"] },
  ]},
  equipment: { title: "설비 진단 설정", qs: [
    { id: "sensors", label: "모니터링할 센서 유형은? (복수)", multi: true,  options: ["진동 센서", "온도 센서", "초음파 센서", "전류 센서", "압력 센서"] },
    { id: "model",   label: "AI 진단 모델은?",               multi: false, options: ["Autoencoder (이상 감지)", "LSTM (시계열 예측)", "CNN-LSTM (복합)", "RUL 예측 특화"] },
    { id: "refresh", label: "데이터 갱신 주기는?",            multi: false, options: ["실시간 (1초)", "운영 (5초)", "분석 (30초)"] },
  ]},
  environment: { title: "환경 진단 설정", qs: [
    { id: "metrics", label: "모니터링할 환경 지표는? (복수)", multi: true,  options: ["PM2.5 (미세먼지)", "CO2 (이산화탄소)", "온도·습도", "유해가스 농도", "소음 수준"] },
    { id: "alert",   label: "알림 기준은?",                   multi: false, options: ["법정 기준값 자동 적용", "사용자 지정 임계값", "AI 동적 임계값", "복합 조건"] },
    { id: "refresh", label: "데이터 갱신 주기는?",            multi: false, options: ["실시간 (1초)", "운영 (5초)", "분석 (30초)"] },
  ]},
  worker: { title: "작업자 안전 설정", qs: [
    { id: "vitals",  label: "모니터링할 생체신호는? (복수)", multi: true,  options: ["심박수 (HR)", "혈중산소 (SpO2)", "체온", "활동량"] },
    { id: "safety",  label: "안전 감지 기능은? (복수)",      multi: true,  options: ["낙상 감지", "안전모 착용률", "위험구역 진입", "SOS 알림"] },
    { id: "refresh", label: "데이터 갱신 주기는?",           multi: false, options: ["실시간 (1초)", "운영 (5초)"] },
  ]},
  alerts: { title: "알림·이벤트 설정", qs: [
    { id: "types",  label: "표시할 알림 유형은? (복수)", multi: true,  options: ["위험 (CRITICAL)", "경고 (HIGH)", "주의 (MEDIUM)", "정보 (LOW)"] },
    { id: "filter", label: "기본 필터는?",               multi: false, options: ["전체 알림", "미확인만", "오늘 발생", "최근 24시간"] },
    { id: "action", label: "자동 조치 연동은? (복수)",   multi: true,  options: ["SOP 자동 연동", "담당자 알림", "CCTV 팝업", "에스컬레이션"] },
  ]},
  report: { title: "리포트 설정", qs: [
    { id: "period",  label: "기본 리포트 기간은?",   multi: false, options: ["일간", "주간", "월간", "분기", "연간"] },
    { id: "content", label: "포함할 항목은? (복수)", multi: true,  options: ["설비 KPI 추이", "환경 지표 요약", "작업자 안전 현황", "알림 이력", "AI 인사이트"] },
    { id: "format",  label: "내보내기 형식은?",      multi: false, options: ["PDF 보고서", "Excel 데이터", "대화형 대시보드", "API 연동"] },
  ]},
  settings: { title: "설정 페이지 구성", qs: [
    { id: "tabs",        label: "필요한 설정 탭은? (복수)", multi: true,  options: ["시스템 파라미터", "사용자 권한", "알람 임계값", "데이터 연동", "장치 관리"] },
    { id: "auth",        label: "권한 체계는?",             multi: false, options: ["2단계 (관리자/조회)", "3단계 (관리/운영/조회)", "커스텀 역할"] },
    { id: "integration", label: "외부 연동 방식은?",        multi: false, options: ["REST API", "MQTT/실시간", "OPC-UA", "직접 DB 연결"] },
  ]},
};

const FILE_NAMES: Record<string, string> = {
  integrated: "integrated_dashboard.md", equipment: "equipment_diagnosis.md",
  environment: "environment_diagnosis.md", worker: "worker_safety.md",
  alerts: "alerts_events.md", report: "report.md", settings: "settings.md",
};
const CAT_MAP: Record<string, string[]> = {
  integrated:  ["데이터 구성", "갱신 설정", "레이아웃"],
  equipment:   ["센서 유형", "AI 모델", "갱신 설정"],
  environment: ["환경 지표", "알림 기준", "갱신 설정"],
  worker:      ["생체신호", "안전 기능", "갱신 설정"],
  alerts:      ["알림 유형", "필터 설정", "조치 연동"],
  report:      ["기간 설정", "콘텐츠 구성", "내보내기"],
  settings:    ["탭 구성", "권한 체계", "연동 방식"],
};

// ── Chip (AIM GUARD Chip 완전 동일) ─────────────────────────
function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 13px", borderRadius: 7, cursor: "pointer",
        border: `1px solid ${selected ? "oklch(60% 0.20 285 / .7)" : "var(--border2)"}`,
        background: selected ? "oklch(60% 0.20 285 / .15)" : "var(--s2)",
        color: selected ? "var(--t1)" : "var(--t2)",
        fontSize: 12, fontFamily: "var(--font)", fontWeight: selected ? 600 : 400,
        transition: "all .15s",
      }}
    >
      {selected && <Check size={10} style={{ color: "oklch(60% 0.20 285)", flexShrink: 0 }} />}
      {label}
    </button>
  );
}

// ── AI 생성 미리보기 (AIM GUARD HarnessPreview 완전 동일) ────
function HarnessPreview({
  page, answers, canCreate, onCreate,
}: {
  page: MonitoringPageMeta;
  answers: Record<string, string[]>;
  canCreate: boolean;
  onCreate: () => void;
}) {
  const specs = SPECS[page.key];
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString("ko-KR");

  const lines = useMemo(() => {
    const r: { t: string; text?: string; ok?: boolean }[] = [];
    const cats = CAT_MAP[page.key] ?? [];
    r.push({ t: "h1", text: `# ${page.label} 설정서` });
    r.push({ t: "blank" });
    r.push({ t: "h2", text: "## 프로젝트 정보" });
    r.push({ t: "meta", text: `- 솔루션: AIM Monitoring v1.0` });
    r.push({ t: "meta", text: `- 생성일: ${today}` });
    r.push({ t: "meta", text: `- 상태: 설계 중...` });
    r.push({ t: "blank" });
    specs?.qs.forEach((q, i) => {
      const ans = answers[q.id] ?? [];
      const ok = ans.length > 0;
      r.push({ t: "h2", text: `## ${cats[i] ?? q.label}` });
      r.push({ t: "q", ok, text: q.label });
      if (ok) ans.forEach((a) => r.push({ t: "a", text: a }));
      else r.push({ t: "pending" });
      r.push({ t: "blank" });
    });
    return r;
  }, [page, answers, today]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  return (
    <div style={{
      width: 380, flexShrink: 0, display: "flex", flexDirection: "column",
      background: "oklch(9% 0.020 275)", height: "100%",
      borderLeft: "1px solid var(--border2)",
    }}>
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", marginBottom: 3 }}>AI 생성 미리보기</div>
        <div style={{ fontSize: 11, color: "var(--t4)" }}>답변 내용이 실시간으로 설계서에 반영됩니다</div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", padding: "14px 16px 0", display: "flex", flexDirection: "column" }}>
        <div style={{
          background: "oklch(16% 0.018 275)", borderRadius: "10px 10px 0 0",
          border: "1px solid var(--border2)", borderBottom: "none",
          padding: "9px 14px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)" }}>
            {FILE_NAMES[page.key] ?? "config.md"}
          </span>
          <div style={{
            display: "flex", alignItems: "center", gap: 5, padding: "2px 8px",
            borderRadius: 4, background: "oklch(65% 0.16 145 / .12)",
            border: "1px solid oklch(65% 0.16 145 / .3)",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 9, color: "var(--green)", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
          </div>
        </div>

        <div ref={scrollRef} style={{
          flex: 1, overflowY: "auto", background: "oklch(12% 0.018 275)",
          border: "1px solid var(--border2)", borderTop: "none",
          borderRadius: "0 0 10px 10px", padding: "14px 16px",
          fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.85,
        }}>
          {lines.map((ln, i) => {
            if (ln.t === "blank") return <div key={i} style={{ height: 6 }} />;
            if (ln.t === "h1") return <div key={i} style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", marginBottom: 4 }}>{ln.text}</div>;
            if (ln.t === "h2") return <div key={i} style={{ fontSize: 12, fontWeight: 700, color: "var(--cyan)", marginTop: 8 }}>{ln.text}</div>;
            if (ln.t === "meta") return <div key={i} style={{ color: "var(--t3)", paddingLeft: 4 }}>{ln.text}</div>;
            if (ln.t === "q") return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, paddingLeft: 4, marginTop: 2 }}>
                <span style={{ color: ln.ok ? "var(--green)" : "var(--t4)", flexShrink: 0 }}>{ln.ok ? "✅" : "□"}</span>
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
        <button
          type="button"
          onClick={onCreate}
          style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none",
            background: canCreate
              ? "linear-gradient(135deg, oklch(58% 0.22 285), oklch(52% 0.20 295))"
              : "var(--s3)",
            color: canCreate ? "white" : "var(--t4)",
            fontFamily: "var(--font)", fontSize: 13, fontWeight: 700,
            cursor: canCreate ? "pointer" : "not-allowed",
            boxShadow: canCreate ? "0 4px 20px oklch(55% 0.22 285 / .4)" : "none",
            transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          페이지 생성하기 →
        </button>
        <div style={{ fontSize: 10, color: "var(--t4)", textAlign: "center", marginTop: 7 }}>
          {canCreate ? "선택 완료 후 바로 페이지를 생성할 수 있습니다" : "최소 1개 항목을 선택하면 활성화됩니다"}
        </div>
      </div>
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────
interface MonitoringPageBuilderProps {
  addedPageKeys: Set<string>;
  onClose: () => void;
  onCreatePage: (key: string, config: MonitoringPageConfig) => void;
}

// ── Main (AIM GUARD PageAddModal 완전 동일 구조) ─────────────
export default function MonitoringPageBuilder({ addedPageKeys, onClose, onCreatePage }: MonitoringPageBuilderProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<MonitoringPageMeta | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  const canCreate = selected !== null && SPECS[selected.key]?.qs.some((q) => (answers[q.id] ?? []).length > 0);

  const toggle = (qid: string, opt: string, multi: boolean) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? [];
      return {
        ...prev,
        [qid]: multi
          ? cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]
          : cur[0] === opt ? [] : [opt],
      };
    });
  };

  const handleCreate = () => {
    if (!selected || !canCreate) return;
    const primaryData = answers[SPECS[selected.key]?.qs[0]?.id ?? ""]?.[0] ?? "all";
    const refreshInterval = answers[SPECS[selected.key]?.qs[1]?.id ?? ""]?.[0] ?? "5s";
    const pageTitle = selected.label;
    onCreatePage(selected.key, { primaryData, refreshInterval, pageTitle });
    onClose();
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 200, display: "flex", alignItems: "stretch" }}>
      {/* 배경 딤 */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}
      />

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
        <div style={{
          width: 480, flexShrink: 0, background: "var(--s1)",
          borderLeft: "1px solid var(--border2)",
          display: "flex", flexDirection: "column", height: "100%",
        }}>
          {/* 헤더 */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => { setStep(1); setSelected(null); setAnswers({}); }}
                    style={{
                      width: 28, height: 28, borderRadius: 7, border: "1px solid var(--border2)",
                      background: "transparent", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", color: "var(--t3)", fontSize: 18,
                    }}
                  >
                    ‹
                  </button>
                )}
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--t1)" }}>
                    {step === 1 ? "페이지 추가" : `${selected?.label} 설정`}
                  </h2>
                  <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>
                    {step === 1 ? "추가할 페이지를 선택하세요" : "설문에 답변하면 최적 설정으로 페이지를 생성합니다"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)",
                  background: "transparent", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "var(--t3)", fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>

            {/* 스텝 인디케이터 */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center" }}>
              {["페이지 선택", "기능 설정"].map((s, i) => (
                <React.Fragment key={s}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: step >= i + 1 ? "var(--primary)" : "var(--s4)",
                      border: `1px solid ${step >= i + 1 ? "var(--primary)" : "var(--border2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700,
                      color: step >= i + 1 ? "white" : "var(--t4)",
                      transition: "all .2s",
                    }}>
                      {step > i + 1 ? <Check size={10} /> : i + 1}
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
                {AVAILABLE_MONITORING_PAGES.map((page) => {
                  const isAdded = addedPageKeys.has(page.key);
                  const color = PAGE_COLORS[page.key] ?? "var(--primary)";
                  return (
                    <button
                      key={page.key}
                      type="button"
                      disabled={isAdded}
                      onClick={() => { if (!isAdded) { setSelected(page); setStep(2); } }}
                      style={{
                        display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
                        border: `1px solid ${isAdded ? "var(--border)" : "var(--border2)"}`,
                        borderRadius: 12, cursor: isAdded ? "default" : "pointer",
                        background: isAdded ? "transparent" : "var(--s2)",
                        transition: "all .15s", opacity: isAdded ? 0.5 : 1,
                        textAlign: "left", width: "100%",
                      }}
                      onMouseEnter={(e) => {
                        if (!isAdded) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = `color-mix(in oklch, ${color} 50%, transparent)`;
                          (e.currentTarget as HTMLButtonElement).style.background = "var(--s3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isAdded) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border2)";
                          (e.currentTarget as HTMLButtonElement).style.background = "var(--s2)";
                        }
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `color-mix(in oklch, ${color} 15%, transparent)`,
                        border: `1px solid color-mix(in oklch, ${color} 30%, transparent)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color, fontSize: 20,
                      }}>
                        {ICON_MAP[page.iconName]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--t1)" }}>{page.label}</span>
                          {isAdded && (
                            <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "var(--s4)", color: "var(--t4)", fontWeight: 600 }}>
                              추가됨
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.5 }}>{page.description}</span>
                      </div>
                      {!isAdded && <span style={{ color: "var(--t4)", fontSize: 16, flexShrink: 0 }}>›</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2: 기능 설정 */}
            {step === 2 && selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {(() => {
                  const color = PAGE_COLORS[selected.key] ?? "var(--primary)";
                  return (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                      background: `color-mix(in oklch, ${color} 8%, transparent)`,
                      border: `1px solid color-mix(in oklch, ${color} 25%, transparent)`,
                      borderRadius: 10, marginBottom: 20,
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: `color-mix(in oklch, ${color} 15%, transparent)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, color, fontSize: 16,
                      }}>
                        {ICON_MAP[selected.iconName]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>{selected.label}</div>
                        <div style={{ fontSize: 11, color: "var(--t3)" }}>{selected.description}</div>
                      </div>
                    </div>
                  );
                })()}

                {SPECS[selected.key]?.qs.map((q, qi) => {
                  const ans = answers[q.id] ?? [];
                  return (
                    <div key={q.id} style={{
                      marginBottom: 16, padding: 16,
                      background: ans.length > 0 ? "oklch(60% 0.20 285 / .04)" : "var(--s2)",
                      border: `1px solid ${ans.length > 0 ? "oklch(60% 0.20 285 / .25)" : "var(--border)"}`,
                      borderRadius: 12, transition: "all .2s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t4)", fontFamily: "var(--mono)" }}>
                          {String(qi + 1).padStart(2, "0")}
                        </span>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", flex: 1, lineHeight: 1.4, margin: 0 }}>
                          {q.label}
                        </p>
                        {ans.length > 0 && <Check size={14} style={{ color: "var(--green)", flexShrink: 0 }} />}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {q.options.map((opt) => (
                          <Chip key={opt} label={opt} selected={ans.includes(opt)} onClick={() => toggle(q.id, opt, q.multi)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {step === 1 && (
            <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "var(--t4)", textAlign: "center" }}>
                페이지를 선택하면 설정 단계로 이동합니다
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: AI 생성 미리보기 (Step 2에서만) */}
        <AnimatePresence>
          {step === 2 && selected && (
            <motion.div
              key="preview"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden", height: "100%" }}
            >
              <HarnessPreview
                page={selected}
                answers={answers}
                canCreate={!!canCreate}
                onCreate={handleCreate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
