"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useLLMStore, PROVIDER_META, type LLMProvider } from "@/store/llmStore";

const PROVIDERS = Object.entries(PROVIDER_META) as [LLMProvider, (typeof PROVIDER_META)[LLMProvider]][];

interface Props {
  compact?: boolean;
  dropUp?: boolean;
}

export default function ProviderPicker({ compact = false, dropUp = false }: Props) {
  const { provider, setProvider } = useLLMStore();
  const [open, setOpen] = useState(false);
  const current = PROVIDER_META[provider];

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {/* 현재 provider 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: compact ? "3px 8px" : "5px 10px",
          borderRadius: 7,
          border: `1px solid ${open ? "var(--border3)" : "var(--border2)"}`,
          background: open ? "var(--s3)" : "var(--s2)",
          cursor: "pointer",
          fontSize: compact ? 10 : 11,
          color: "var(--t2)",
          fontFamily: "var(--font)",
          transition: "all .15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border3)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border2)"; }}
      >
        <span style={{
          width: compact ? 5 : 6, height: compact ? 5 : 6,
          borderRadius: "50%", background: current.color,
          flexShrink: 0, animation: "pulse 2s infinite",
        }} />
        {current.name}
        <svg width={9} height={9} viewBox="0 0 9 9" fill="none"
          style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <polyline points="1.5,3 4.5,6 7.5,3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.97 }}
              transition={{ duration: 0.13, ease: "easeOut" }}
              style={{
                position: "absolute",
                ...(dropUp ? { bottom: "calc(100% + 6px)" } : { top: "calc(100% + 6px)" }),
                left: 0, width: 210,
                background: "var(--s2)",
                border: "1px solid var(--border2)",
                borderRadius: 11, overflow: "hidden",
                boxShadow: "0 8px 24px oklch(0% 0 0 / .45), 0 1px 0 oklch(100% 0 0 / .06) inset",
                zIndex: 200,
              }}
            >
              <div style={{ padding: "8px 12px 6px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "var(--t4)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>
                  AI 엔진 선택
                </span>
              </div>

              {PROVIDERS.map(([id, meta]) => {
                const isActive = provider === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setProvider(id); setOpen(false); }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", border: "none", cursor: "pointer",
                      background: isActive ? "var(--s3)" : "transparent",
                      fontFamily: "var(--font)", transition: "background .12s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "var(--s3)"; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: meta.color, flexShrink: 0,
                      boxShadow: isActive ? `0 0 6px ${meta.color}` : "none",
                    }} />
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? "var(--t1)" : "var(--t2)" }}>
                          {meta.name}
                        </span>
                        {meta.badge && (
                          <span style={{
                            fontSize: 8, fontWeight: 700, letterSpacing: "0.06em",
                            padding: "1px 5px", borderRadius: 3,
                            background: `color-mix(in oklch, ${meta.color} 15%, transparent)`,
                            color: meta.color,
                            border: `1px solid color-mix(in oklch, ${meta.color} 35%, transparent)`,
                            textTransform: "uppercase" as const,
                          }}>
                            {meta.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--t4)", marginTop: 1 }}>{meta.desc}</div>
                    </div>
                    {isActive && <Check size={12} color="var(--primary)" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
