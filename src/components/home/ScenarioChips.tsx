"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Zap, Factory, Building2, Activity, Brain, RadioTower, ShieldCheck, type LucideIcon } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { getScenarioConfig } from "@/data/scenarios";
import type { ScenarioId } from "@/data/scenarios";

const ICONS: Record<string, LucideIcon> = { Zap, Factory, Building2, Activity, Brain, RadioTower, ShieldCheck };

interface ScenarioChipsProps {
  /** Magic Default 즉시 실행 후 콜백 (One-Click 경로) */
  onMagicTrigger?: () => void;
}

export default function ScenarioChips({ onMagicTrigger }: ScenarioChipsProps) {
  const { selectedSolution, selectedScenario, setSelectedScenario, applyMagicDefault } = useHomeStore();
  const { scenarios } = getScenarioConfig(selectedSolution);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 더블클릭 or 500ms 길게 누름 → Magic Default 즉시 실행
  const triggerOneClick = useCallback(
    (id: ScenarioId) => {
      setSelectedScenario(id);
      // 다음 틱에 시나리오가 세팅된 뒤 applyMagicDefault 호출
      setTimeout(() => {
        applyMagicDefault();
        onMagicTrigger?.();
      }, 0);
    },
    [setSelectedScenario, applyMagicDefault, onMagicTrigger]
  );

  const handlePointerDown = (id: ScenarioId) => {
    longPressTimer.current = setTimeout(() => triggerOneClick(id), 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ fontSize: 10, color: "#475569", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
        시나리오 선택
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {scenarios.map((s) => {
          const Icon = ICONS[s.icon] ?? Zap;
          const isActive = selectedScenario === s.id;

          return (
            <motion.button
              key={s.id}
              type="button"
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedScenario(s.id)}
              onDoubleClick={() => triggerOneClick(s.id)}
              onPointerDown={() => handlePointerDown(s.id)}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${isActive ? s.color + "50" : "rgba(255,255,255,0.06)"}`,
                background: isActive ? s.color + "12" : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                textAlign: "left" as const,
                transition: "all 0.15s ease",
                boxShadow: isActive ? `0 0 16px ${s.color}25` : "none",
              }}
            >
              {/* 아이콘 */}
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isActive ? s.color + "20" : "rgba(255,255,255,0.04)",
                  flexShrink: 0,
                }}
              >
                <Icon size={14} color={isActive ? s.color : "#475569"} />
              </div>

              {/* 텍스트 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: isActive ? "#e2e8f0" : "#64748b", margin: 0 }}>
                  {s.label}
                </p>
                <p style={{ fontSize: 10, color: isActive ? s.color + "cc" : "#334155", margin: 0 }}>
                  {s.subLabel}
                </p>
              </div>

              {/* 활성 인디케이터 */}
              {isActive && (
                <motion.div
                  layoutId="scenario-indicator"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: s.color,
                    boxShadow: `0 0 6px ${s.color}`,
                    flexShrink: 0,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* One-Click 힌트 */}
      <p style={{ fontSize: 9, color: "#1e293b", marginTop: 4, textAlign: "center" as const }}>
        더블클릭 또는 길게 누르면 Magic Default 즉시 실행
      </p>
    </div>
  );
}
