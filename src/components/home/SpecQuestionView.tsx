"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SpecQuestion, SpecQuestionId } from "@/data/scenarios";
import { useHomeStore } from "@/store/homeStore";

interface Props {
  question: SpecQuestion;
  groupColor: string;
}

export default function SpecQuestionView({ question, groupColor }: Props) {
  const selectedSpecs = useHomeStore((s) => s.selectedSpecs);
  const updateSpec = useHomeStore((s) => s.updateSpec);
  const [showOther, setShowOther] = useState(false);
  const [otherText, setOtherText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const rawVal = selectedSpecs[question.id];
  const values: string[] = rawVal
    ? Array.isArray(rawVal)
      ? rawVal
      : [rawVal as string]
    : [];
  const isAnswered = values.length > 0;
  const isSelected = (o: string) => values.includes(o);
  const customValues = values.filter((v) => !question.options.includes(v));

  useEffect(() => {
    if (showOther) inputRef.current?.focus();
  }, [showOther]);

  const toggle = (opt: string) => {
    updateSpec(question.id as SpecQuestionId, opt);
  };

  const submitOther = () => {
    const val = otherText.trim();
    if (!val) return;
    const tagged = `기타: ${val}`;
    updateSpec(question.id as SpecQuestionId, tagged);
    setShowOther(false);
    setOtherText("");
  };

  const removeCustom = (val: string) => {
    updateSpec(question.id as SpecQuestionId, val);
  };

  return (
    <div
      style={{
        background: "var(--s1)",
        border: `1px solid ${isAnswered ? "oklch(60% 0.20 285 / .3)" : "var(--border)"}`,
        borderRadius: 14,
        padding: "20px 20px 16px",
        transition: "all .2s",
        boxShadow: isAnswered ? "0 0 0 1px oklch(60% 0.20 285 / .1)" : "none",
      }}
    >
      {/* 질문 레이블 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", lineHeight: 1.5, flex: 1, margin: 0 }}>
          {question.label}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          {question.multiple && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.06em",
                padding: "2px 7px",
                borderRadius: 4,
                border: `1px solid color-mix(in oklch, ${groupColor} 44%, transparent)`,
                background: `color-mix(in oklch, ${groupColor} 12%, transparent)`,
                color: groupColor,
                textTransform: "uppercase",
                fontFamily: "var(--mono)",
              }}
            >
              복수 선택
            </span>
          )}
          {isAnswered && (
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <circle
                cx="8" cy="8" r="7"
                fill="oklch(65% 0.16 145 / .2)"
                stroke="oklch(65% 0.16 145 / .6)"
                strokeWidth="1.2"
              />
              <polyline
                points="4.5,8 7,10.5 11.5,5.5"
                stroke="var(--green)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 20, strokeDashoffset: 0, animation: "checkmark .2s ease" }}
              />
            </svg>
          )}
        </div>
      </div>

      {/* 칩 목록 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {question.options.map((opt) => {
          const sel = isSelected(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                cursor: "pointer",
                border: `1px solid ${sel ? "oklch(60% 0.20 285 / .7)" : "var(--border2)"}`,
                background: sel ? "oklch(60% 0.20 285 / .15)" : "var(--s2)",
                color: sel ? "var(--t1)" : "var(--t2)",
                fontSize: 12,
                fontFamily: "var(--font)",
                fontWeight: sel ? 600 : 400,
                transition: "all .15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!sel) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border3)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--s3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!sel) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border2)";
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--s2)";
                }
              }}
            >
              {sel && (
                <svg width={12} height={12} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                  <polyline
                    points="2,6 5,9 10,3"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ strokeDasharray: 20, strokeDashoffset: 0, animation: "checkmark .2s ease" }}
                  />
                </svg>
              )}
              {opt}
            </button>
          );
        })}

        {/* 직접 입력 버튼 */}
        {!showOther && (
          <button
            onClick={() => setShowOther(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              borderRadius: 8,
              cursor: "pointer",
              border: "1px dashed var(--border3)",
              background: "transparent",
              color: "var(--t3)",
              fontSize: 12,
              fontFamily: "var(--font)",
              transition: "all .15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border3)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--t3)";
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> 직접 입력...
          </button>
        )}
      </div>

      {/* 직접 입력 확장 영역 */}
      <AnimatePresence>
        {showOther && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ marginTop: 10 }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                background: "var(--s2)",
                border: "1px solid var(--border2)",
                borderRadius: 9,
                padding: "2px 2px 2px 12px",
              }}
            >
              <input
                ref={inputRef}
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitOther();
                  if (e.key === "Escape") { setShowOther(false); setOtherText(""); }
                }}
                placeholder="해당하는 내용을 직접 입력하세요..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 12,
                  color: "var(--t1)",
                  fontFamily: "var(--font)",
                  padding: "7px 0",
                  lineHeight: 1.5,
                }}
              />
              <button
                onClick={submitOther}
                style={{
                  padding: "6px 12px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  background: otherText.trim() ? "var(--primary)" : "var(--s4)",
                  color: otherText.trim() ? "white" : "var(--t4)",
                  fontSize: 11,
                  fontFamily: "var(--font)",
                  fontWeight: 600,
                  transition: "all .15s",
                  whiteSpace: "nowrap",
                }}
              >
                추가
              </button>
              <button
                onClick={() => { setShowOther(false); setOtherText(""); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--t4)",
                  fontSize: 14,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: 10, color: "var(--t4)", marginTop: 5, paddingLeft: 2 }}>
              Enter로 추가 · Esc로 취소
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 직접 입력된 값 칩 */}
      {customValues.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {customValues.map((v) => (
            <div
              key={v}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "5px 10px 5px 12px",
                borderRadius: 8,
                background: "oklch(60% 0.20 285 / .12)",
                border: "1px solid oklch(60% 0.20 285 / .35)",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--t1)", fontWeight: 500 }}>
                {v.replace("기타: ", "")}
              </span>
              <button
                onClick={() => removeCustom(v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--t3)",
                  fontSize: 12,
                  padding: 0,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
