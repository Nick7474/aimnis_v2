"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SpecGroup } from "@/data/scenarios";
import { useHomeStore } from "@/store/homeStore";
import SpecQuestionView from "./SpecQuestionView";

interface SpecGroupProps {
  group: SpecGroup;
  index: number;
  defaultOpen?: boolean;
  onCompleted?: () => void;
}

export default function SpecGroupView({ group, index, defaultOpen = false, onCompleted }: SpecGroupProps) {
  const [isOpen, setIsOpen] = useState(index === 0 || defaultOpen);
  const selectedSpecs = useHomeStore((s) => s.selectedSpecs);

  const IconComp = ((Icons as unknown as Record<string, LucideIcon>)[group.icon] || Icons.HelpCircle) as LucideIcon;

  const total = group.questions.length;
  const done = group.questions.filter((q) => {
    const val = selectedSpecs[q.id];
    return Array.isArray(val) ? val.length > 0 : !!val;
  }).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = done === total;

  // 완료 시 콜백 (부모에서 다음 카테고리 자동 열기)
  useEffect(() => {
    if (isComplete) onCompleted?.();
  }, [isComplete]);

  return (
    <div style={{ marginBottom: 8 }}>
      {/* 섹션 헤더 */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          border: "none",
          cursor: "pointer",
          background: isOpen ? "var(--s2)" : "var(--s1)",
          borderRadius: isOpen ? "12px 12px 0 0" : "12px",
          borderBottom: isOpen ? "1px solid var(--border)" : "none",
          outline: `1px solid var(--border)`,
          transition: "all .15s",
          textAlign: "left",
        }}
      >
        {/* 아이콘 박스 */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: `color-mix(in oklch, ${group.color} 18%, transparent)`,
            border: `1px solid color-mix(in oklch, ${group.color} 33%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconComp size={16} color={group.color} />
        </div>

        {/* 제목 + 진행바 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}>
              {group.label}
            </span>
            <span style={{ fontSize: 10, color: "var(--t4)", fontFamily: "var(--mono)" }}>
              {done}/{total}
            </span>
            {isComplete && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "oklch(65% 0.16 145 / .15)",
                  color: "var(--green)",
                  border: "1px solid oklch(65% 0.16 145 / .3)",
                  letterSpacing: "0.04em",
                }}
              >
                완료
              </span>
            )}
          </div>
          {/* 진행 바 */}
          <div style={{ height: 3, borderRadius: 2, background: "var(--s4)", overflow: "hidden", width: 160 }}>
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                height: "100%",
                borderRadius: 2,
                background: isComplete ? "var(--green)" : group.color,
              }}
            />
          </div>
        </div>

        {/* 완료 체크 아이콘 */}
        {isComplete && (
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <circle
              cx="9" cy="9" r="8"
              fill="oklch(65% 0.16 145 / .2)"
              stroke="var(--green)"
              strokeWidth="1.5"
            />
            <polyline
              points="5,9 8,12 13,6"
              stroke="var(--green)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* 화살표 */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <svg width={14} height={14} viewBox="0 0 14 14" fill="none">
            <polyline
              points="3,5 7,9 11,5"
              stroke="var(--t4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </button>

      {/* 질문 그리드 */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                padding: 16,
                background: "var(--s1)",
                borderRadius: "0 0 12px 12px",
                border: "1px solid var(--border)",
                borderTop: "none",
                animation: "fadeIn .2s ease both",
              }}
            >
              {group.questions.map((q) => (
                <SpecQuestionView key={q.id} question={q} groupColor={group.color} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
