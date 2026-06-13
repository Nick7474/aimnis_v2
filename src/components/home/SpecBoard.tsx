"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { getScenarioConfig } from "@/data/scenarios";
import { useHomeStore } from "@/store/homeStore";
import SpecGroupView from "./SpecGroupView";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  animatingSpecs?: Partial<Record<string, string>>;
  renderHeaderExtra?: React.ReactNode;
}

export default function SpecBoard({ animatingSpecs = {}, renderHeaderExtra }: Props) {
  const selectedSolution = useHomeStore((s) => s.selectedSolution);
  const selectedScenario = useHomeStore((s) => s.selectedScenario);
  const selectedSpecs = useHomeStore((s) => s.selectedSpecs);
  const scenarioConfig = getScenarioConfig(selectedSolution);
  const { specGroups, scenarioMap, requiredQuestions } = scenarioConfig;
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  // 카테고리별 열림 상태 — HTML 패턴: 첫 번째만 열림, 완료 시 다음 자동 열림
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    specGroups.forEach((g, i) => { init[g.id] = i === 0; });
    return init;
  });

  const totalQ = requiredQuestions.length;
  const doneQ = requiredQuestions.filter((id) => {
    const v = selectedSpecs[id];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;
  const pct = totalQ > 0 ? Math.round((doneQ / totalQ) * 100) : 0;

  const visibleGroups = activeFilter
    ? specGroups.filter((g) => g.id === activeFilter)
    : specGroups;

  // 시나리오 변경 시 첫 번째 그룹만 열기
  useEffect(() => {
    if (selectedScenario) {
      const init: Record<string, boolean> = {};
      specGroups.forEach((g, i) => { init[g.id] = i === 0; });
      setOpenGroups(init);
      setActiveFilter(null);
    }
  }, [selectedScenario, specGroups]);

  // 카테고리 완료 시 다음 카테고리 자동 열기 (HTML 패턴)
  const handleGroupCompleted = useCallback((groupId: string) => {
    const idx = specGroups.findIndex((g) => g.id === groupId);
    const next = specGroups[idx + 1];
    if (next) {
      setOpenGroups((prev) => ({ ...prev, [next.id]: true }));
    }
  }, []);

  const scenarioLabel = selectedScenario ? scenarioMap[selectedScenario]?.label : null;

  if (!selectedScenario) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--bg)",
        }}
      >
        {/* 빈 보드 헤더 */}
        <div
          style={{
            padding: "20px 24px 14px",
            borderBottom: "1px solid var(--border)",
            background: "var(--s1)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--t1)", margin: 0, marginBottom: 6 }}>
                Spec Board
              </h2>
              <p style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.55, margin: 0 }}>
                좌측에서 시나리오를 선택하면 전문가 옵션이 펼쳐집니다
              </p>
            </div>
            {renderHeaderExtra}
          </div>
        </div>
        {/* 빈 상태 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            opacity: 0.25,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: 180 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 44,
                  borderRadius: 9,
                  background: "var(--s2)",
                  border: "1px solid var(--border)",
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--t4)", textAlign: "center" }}>
            시나리오를 선택하면<br />전문가 옵션이 펼쳐집니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg)" }}>
      {/* ── 보드 헤더 (HTML Spec Board 중앙 헤더 패턴) ── */}
      <div
        style={{
          padding: "20px 24px 14px",
          borderBottom: "1px solid var(--border)",
          background: "var(--s1)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--t1)",
                  margin: 0,
                }}
              >
                Spec Board
              </h2>
              {scenarioLabel && (
                <span
                  style={{
                    fontSize: 10,
                    padding: "3px 9px",
                    borderRadius: 5,
                    background: "oklch(60% 0.20 285 / .12)",
                    border: "1px solid oklch(60% 0.20 285 / .3)",
                    color: "var(--primary)",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    fontFamily: "var(--mono)",
                  }}
                >
                  {scenarioLabel}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: "var(--t3)", lineHeight: 1.55, margin: 0 }}>
              {selectedSolution === "monitoring"
                ? "계측 센서, AI 진단, 작업자 안전, 데이터 연동 기준을 선택하면 AIM Monitoring 하네스가 구성됩니다."
                : "현장 환경에 맞는 솔루션을 구성합니다. 각 항목에 답변하시면 AI가 최적 설정을 자동 생성합니다."}
            </p>
          </div>

          {/* 우측: 카테고리 필터 칩 + 헤더 액션 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            {renderHeaderExtra}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {specGroups.map((g) => {
                const IconComp = ((Icons as unknown as Record<string, LucideIcon>)[g.icon] || Icons.HelpCircle) as LucideIcon;
                const gDone = g.questions.filter((q) => {
                  const v = selectedSpecs[q.id];
                  return Array.isArray(v) ? v.length > 0 : !!v;
                }).length;
                const gComplete = gDone === g.questions.length;
                const isActive = activeFilter === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveFilter(isActive ? null : g.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 9px",
                      borderRadius: 7,
                      border: `1px solid ${isActive ? `color-mix(in oklch, ${g.color} 55%, transparent)` : "var(--border2)"}`,
                      background: isActive ? `color-mix(in oklch, ${g.color} 12%, transparent)` : "var(--s2)",
                      color: isActive ? "var(--t1)" : "var(--t2)",
                      fontSize: 11,
                      fontFamily: "var(--font)",
                      fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      transition: "all .15s",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={13} color={isActive ? g.color : "oklch(52% 0.010 275)"} />
                    {g.label}
                    {gComplete && (
                      <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
                        <circle cx="5" cy="5" r="4.5" fill="none" stroke="var(--green)" strokeWidth="1.2" />
                        <polyline
                          points="2.5,5 4.5,7 7.5,3.5"
                          stroke="var(--green)"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 진행률 바 */}
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 10, color: "var(--t3)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              설문 완성도
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--mono)",
                fontWeight: 700,
                color: pct === 100 ? "var(--green)" : pct > 50 ? "var(--primary)" : "var(--t2)",
              }}
            >
              {pct}%
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "var(--s4)", overflow: "hidden" }}>
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                height: "100%",
                borderRadius: 2,
                background:
                  pct === 100
                    ? "var(--green)"
                    : "linear-gradient(90deg, var(--primary), oklch(65% 0.14 210))",
              }}
            />
          </div>
          <div style={{ fontSize: 9, color: "var(--t4)", marginTop: 4, fontFamily: "var(--mono)" }}>
            {doneQ}/{totalQ}개 질문 답변 완료
          </div>
        </div>
      </div>

      {/* ── 스크롤 가능한 질문 영역 ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px 40px",
          scrollbarWidth: "thin" as const,
          scrollbarColor: "var(--s4) transparent",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedScenario + (activeFilter ?? "")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {visibleGroups.map((group, i) => (
              <SpecGroupView
                key={group.id}
                group={group}
                index={i}
                defaultOpen={openGroups[group.id] ?? i === 0}
                onCompleted={() => handleGroupCompleted(group.id)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* 완료 배너 */}
        {doneQ === totalQ && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginTop: 16,
              padding: "20px 24px",
              background: "oklch(65% 0.16 145 / .08)",
              border: "1px solid oklch(65% 0.16 145 / .3)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "oklch(65% 0.16 145 / .2)",
                border: "1px solid oklch(65% 0.16 145 / .4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              ✓
            </div>
            <div>
              <div
                style={{ fontSize: 14, fontWeight: 700, color: "var(--green)", marginBottom: 3 }}
              >
                모든 항목 답변 완료
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)" }}>
                우측 패널에서 Magic Setup을 실행해 솔루션 설정을 자동 생성하세요.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
