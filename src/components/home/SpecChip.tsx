"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";

interface SpecChipProps {
  label: string;
  selected: boolean;
  animating?: boolean;
  onClick?: () => void;
  isCustom?: boolean;
  customValue?: string | null;
  onCustomUpdate?: (val: string) => void;
  onCustomToggle?: (val: string) => void;
}

export default function SpecChip({
  label, selected, animating, onClick,
  isCustom, customValue, onCustomUpdate, onCustomToggle,
}: SpecChipProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isOn = selected || animating;

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const commitCustom = () => {
    setIsEditing(false);
    const val = inputValue.trim();
    if (val) {
      onCustomUpdate?.(val);
      onCustomToggle?.(val);
    }
  };

  const handleCustomClick = () => {
    if (isOn && customValue) onCustomToggle?.(customValue);
    else { setIsEditing(true); setInputValue(customValue || ""); }
  };

  if (isCustom && isEditing) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "2px 2px 2px 12px",
        background: "var(--ds-s2)", border: "1px solid var(--ds-border2)", borderRadius: 9,
      }}>
        <input
          ref={inputRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") commitCustom(); if (e.key === "Escape") setIsEditing(false); }}
          onBlur={commitCustom}
          placeholder="직접 입력..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: 12, color: "var(--ds-t1)", fontFamily: "inherit",
            minWidth: 80, width: `${Math.max(80, (inputValue.length + 3) * 8)}px`,
          }}
        />
        <button
          onMouseDown={e => { e.preventDefault(); commitCustom(); }}
          style={{
            padding: "6px 10px", borderRadius: 7, border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: 600,
            background: inputValue.trim() ? "var(--ds-primary)" : "var(--ds-s4)",
            color: inputValue.trim() ? "white" : "var(--ds-t4)",
          }}
        >추가</button>
        <button
          onMouseDown={e => { e.preventDefault(); setIsEditing(false); }}
          style={{ width: 28, height: 28, borderRadius: 7, border: "none", cursor: "pointer", background: "transparent", color: "var(--ds-t4)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
        >×</button>
      </div>
    );
  }

  const chipStyle: React.CSSProperties = isCustom ? {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12,
    border: "1px dashed var(--ds-border3)", background: "transparent", color: "var(--ds-t3)",
    transition: "all .15s",
  } : isOn ? {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
    border: "1px solid oklch(60% 0.20 285 / .7)",
    background: "oklch(60% 0.20 285 / .15)",
    color: "var(--ds-t1)",
    transition: "all .15s",
  } : {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12,
    border: "1px solid var(--ds-border2)",
    background: "var(--ds-s2)",
    color: "var(--ds-t2)",
    transition: "all .15s",
  };

  return (
    <motion.button
      type="button"
      onClick={isCustom ? handleCustomClick : onClick}
      whileTap={{ scale: 0.97 }}
      animate={animating ? { scale: [1, 1.04, 1], transition: { duration: 0.3 } } : {}}
      style={chipStyle}
      onMouseEnter={e => {
        if (!isOn && !isCustom) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ds-border3)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--ds-s3)";
        }
      }}
      onMouseLeave={e => {
        if (!isOn && !isCustom) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ds-border2)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--ds-s2)";
        }
      }}
    >
      {isOn && !isCustom && <Check size={12} strokeWidth={2.5} color="oklch(60% 0.20 285)" />}
      {label}
    </motion.button>
  );
}
