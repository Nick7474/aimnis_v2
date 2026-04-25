"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode2, Circle } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { specGroups } from "@/data/scenarios";
import type { SpecQuestionId } from "@/data/scenarios";

// ─── 질문 ID → MD 섹션 헤더 매핑 (specGroups 기반 자동 생성) ──
const QUESTION_TO_SECTION: Record<string, string> = {};
specGroups.forEach((g) => {
  g.questions.forEach((q) => {
    QUESTION_TO_SECTION[q.id] = `## ${g.label}`;
  });
});

// ─── MD 섹션 파서 ────────────────────────────────────────────
interface MdSection {
  header: string;   // "## 운영 규모" 등
  lines: string[];
}

function parseSections(md: string): { title: string; body: string[]; sections: MdSection[] } {
  const lines = md.split("\n");
  const title: string[] = [];
  const sections: MdSection[] = [];
  let current: MdSection | null = null;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      title.push(line);
    } else if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { header: line, lines: [] };
    } else {
      if (current) current.lines.push(line);
      else title.push(line);
    }
  }
  if (current) sections.push(current);

  return { title: title.join("\n"), body: [], sections };
}

// ─── 섹션 렌더러 ─────────────────────────────────────────────
function renderLine(line: string, key: number) {
  if (line.startsWith("- ✅")) {
    return (
      <span key={key} style={{ display: "block", color: "#34d399", paddingLeft: 8, lineHeight: 1.7 }}>
        {line}
      </span>
    );
  }
  if (line.startsWith("- ⬜")) {
    return (
      <span key={key} style={{ display: "block", color: "#1e3a5f", paddingLeft: 8, lineHeight: 1.7 }}>
        {line}
      </span>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <span key={key} style={{ display: "block", color: "rgba(255,255,255,0.4)", paddingLeft: 8, lineHeight: 1.7 }}>
        {line}
      </span>
    );
  }
  return (
    <span key={key} style={{ display: "block", color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
      {line || "\u00A0"}
    </span>
  );
}

// ─── 파일명 ──────────────────────────────────────────────────
const FILE_NAMES: Record<string, string> = {
  energy:        "energy_control.md",
  manufacturing: "manufacturing_vision.md",
  smartcity:     "smartcity_response.md",
};

// ─── 메인 ─────────────────────────────────────────────────────
export default function LiveBlueprint() {
  const { blueprintMd, selectedScenario, selectedSpecs } = useHomeStore();

  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const prevSpecsRef = useRef<typeof selectedSpecs | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const fileName = selectedScenario ? FILE_NAMES[selectedScenario] : "blueprint.md";

  // 스펙 변경 감지 → 변경된 카테고리 섹션 하이라이트 + 스크롤
  useEffect(() => {
    const prev = prevSpecsRef.current;
    if (!prev) {
      prevSpecsRef.current = selectedSpecs;
      return;
    }

    const changedCategory = (Object.keys(selectedSpecs) as SpecQuestionId[]).find(
      (k) => selectedSpecs[k] !== prev[k]
    );

    if (changedCategory) {
      const sectionHeader = QUESTION_TO_SECTION[changedCategory];
      setHighlightedSection(sectionHeader);

      // 해당 섹션으로 스크롤
      const el = sectionRefs.current[sectionHeader];
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });

      // 1초 후 하이라이트 해제
      const t = setTimeout(() => setHighlightedSection(null), 1000);
      prevSpecsRef.current = selectedSpecs;
      return () => clearTimeout(t);
    }

    prevSpecsRef.current = selectedSpecs;
  }, [selectedSpecs]);

  // 시나리오 변경 시 스크롤 상단 복귀
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    prevSpecsRef.current = null;
    setHighlightedSection(null);
  }, [selectedScenario]);

  const setSectionRef = useCallback(
    (header: string) => (el: HTMLDivElement | null) => {
      sectionRefs.current[header] = el;
    },
    []
  );

  const { title, sections } = parseSections(blueprintMd);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
    >
      {/* 헤더 바 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {/* macOS 신호등 */}
        <div style={{ display: "flex", gap: 5 }}>
          {["#ef4444", "#eab308", "#22c55e"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.5 }} />
          ))}
        </div>

        <FileCode2 size={12} color="rgba(34,211,238,0.5)" style={{ marginLeft: 6 }} />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
          {fileName}
        </span>

        {blueprintMd && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              <Circle size={7} color="#22d3ee" fill="#22d3ee" />
            </motion.div>
            <span style={{ fontSize: 9, color: "#22d3ee", fontWeight: 700, letterSpacing: "0.08em" }}>
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 16px",
          scrollbarWidth: "thin",
          scrollbarColor: "#1e293b transparent",
          fontFamily: "monospace",
          fontSize: 11,
        }}
      >
        <AnimatePresence mode="wait">
          {!blueprintMd ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}
            >
              <FileCode2 size={28} color="rgba(255,255,255,0.1)" />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.6 }}>
                시나리오를 선택하면<br />실시간으로 설계서가 생성됩니다
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 180, marginTop: 8, opacity: 0.3 }}>
                {[70, 90, 55, 80, 65, 75].map((w, i) => (
                  <div key={i} style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)", width: `${w}%` }} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* 타이틀 섹션 */}
              {title && (
                <div style={{ marginBottom: 8 }}>
                  {title.split("\n").map((line, i) => {
                    if (line.startsWith("# ")) {
                      return (
                        <div key={i} style={{ color: "#22d3ee", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
                          {line}
                        </div>
                      );
                    }
                    return (
                      <span key={i} style={{ display: "block", color: "rgba(255,255,255,0.25)", lineHeight: 1.7 }}>
                        {line || "\u00A0"}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* 섹션별 렌더링 */}
              {sections.map((sec) => {
                const isHighlighted = highlightedSection === sec.header;
                return (
                  <div
                    key={sec.header}
                    ref={setSectionRef(sec.header)}
                    style={{ marginBottom: 4, borderRadius: 6, overflow: "hidden" }}
                  >
                    {/* 섹션 헤더 */}
                    <div
                      style={{
                        color: "rgba(34,211,238,0.7)",
                        fontWeight: 600,
                        fontSize: 11,
                        marginTop: 10,
                        marginBottom: 2,
                      }}
                    >
                      {sec.header}
                    </div>

                    {/* 섹션 내용 + 하이라이트 오버레이 */}
                    <div style={{ position: "relative" }}>
                      <AnimatePresence>
                        {isHighlighted && (
                          <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,212,255,0.08)",
                              borderLeft: "2px solid rgba(0,212,255,0.4)",
                              borderRadius: 4,
                              pointerEvents: "none",
                            }}
                          />
                        )}
                      </AnimatePresence>
                      <div style={{ paddingLeft: isHighlighted ? 6 : 0, transition: "padding 0.2s" }}>
                        {sec.lines.map((line, i) => renderLine(line, i))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
