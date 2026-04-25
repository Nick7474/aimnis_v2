"use client";

import { useRef, useState, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import type { SectionType, PanelType } from "@/store/editorStore";
import { cn } from "@/lib/utils";

interface EditableSectionProps {
  sectionId: string;
  type: SectionType;
  label: string;
  panelType: PanelType;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /**
   * overlay: Monitor 같은 실제 컴포넌트 위에 얹는 투명 오버레이.
   * 배경 클릭은 Monitor로 통과, 귀퉁이 배지만 클릭 가능.
   */
  variant?: "default" | "overlay";
}

// panelType → rightPanel 패널 탭 매핑
const PANEL_MAP: Record<PanelType, string> = {
  brand: "brand",
  navigation: "navigation",
  gis: "gis",
  alarm: "alarm",
  widget: "mapping",
  empty: "settings",
};

export default function EditableSection({
  sectionId,
  type,
  label,
  panelType,
  children,
  className,
  style,
  variant = "default",
}: EditableSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const { selectedElement, setSelectedElement, setRightPanel } = useEditorStore();
  const isSelected = selectedElement?.sectionId === sectionId;

  const select = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setSelectedElement({
        sectionId, type, label, panelType,
        rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      });
      setRightPanel(PANEL_MAP[panelType] as Parameters<typeof setRightPanel>[0]);
    },
    [sectionId, type, label, panelType, setSelectedElement, setRightPanel]
  );

  // ── overlay 모드: Monitor 위 투명 레이어 ──────────────────
  if (variant === "overlay") {
    return (
      <div
        ref={ref}
        className={cn("absolute", className)}
        style={{
          ...style,
          pointerEvents: "none", // Monitor 클릭 통과
          zIndex: 20,
          outline: isSelected ? "2px solid #735FE9" : hovered ? "1px dashed rgba(0,212,255,0.4)" : "none",
          outlineOffset: "-2px",
          transition: "outline 0.12s ease",
        }}
      >
        {/* 항상 보이는 클릭 배지 (우상단) */}
        <button
          aria-label={`${label} 선택`}
          onClick={select}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            pointerEvents: "auto",
            position: "absolute",
            top: 6,
            right: 6,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            gap: 3,
            padding: "2px 7px",
            borderRadius: 5,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: isSelected ? "#000" : "#735FE9",
            background: isSelected ? "#735FE9" : "rgba(0,20,32,0.75)",
            border: "1px solid rgba(0,212,255,0.45)",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          ✏ {label}
        </button>

        {/* hover 시 그리드 오버레이 */}
        {hovered && !isSelected && (
          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: [
                "linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px)",
                "linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)",
              ].join(","),
              backgroundSize: "8px 8px",
            }}
          />
        )}
      </div>
    );
  }

  // ── default 모드: 자식 요소를 직접 감싸기 ────────────────
  return (
    <div
      ref={ref}
      className={cn("relative group", className)}
      style={{
        ...style,
        outline: isSelected
          ? "2px solid #735FE9"
          : hovered
          ? "1px dashed rgba(0,212,255,0.35)"
          : "2px solid transparent",
        outlineOffset: "-2px",
        cursor: "pointer",
        transition: "outline 0.12s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={select}
    >
      {/* 8pt 그리드 — hover */}
      {hovered && !isSelected && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            backgroundImage: [
              "linear-gradient(rgba(0,212,255,0.055) 1px, transparent 1px)",
              "linear-gradient(90deg, rgba(0,212,255,0.055) 1px, transparent 1px)",
            ].join(","),
            backgroundSize: "8px 8px",
          }}
        />
      )}

      {/* 선택 라벨 배지 */}
      {isSelected && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 flex items-center gap-1 rounded-br-md px-2 py-0.5"
          style={{
            background: "#735FE9", fontSize: 10, fontWeight: 600,
            color: "#000", letterSpacing: "0.04em",
          }}
        >
          {label}
        </div>
      )}

      {children}
    </div>
  );
}
