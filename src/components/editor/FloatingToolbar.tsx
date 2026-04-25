"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Map, MapPin, Eye, EyeOff, Palette, Image, Pencil,
  Plus, ArrowUpDown, Bell, ChevronsUpDown, Database,
  Trash2,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { SectionType } from "@/store/editorStore";

// ─── 타입별 툴바 액션 ─────────────────────────────────────────

interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  panel?: string;
  action?: string;
}

const ACTIONS: Record<SectionType, ToolbarAction[]> = {
  map: [
    { icon: <Map size={13} />, label: "GIS 설정", panel: "gis" },
    { icon: <MapPin size={13} />, label: "마커 추가", action: "marker" },
    { icon: <EyeOff size={13} />, label: "레이어 숨김", action: "layer" },
  ],
  header: [
    { icon: <Palette size={13} />, label: "색상 변경", panel: "brand" },
    { icon: <Image size={13} />, label: "로고 교체", action: "logo" },
    { icon: <Pencil size={13} />, label: "타이틀 수정", panel: "brand" },
  ],
  sidebar: [
    { icon: <Plus size={13} />, label: "메뉴 추가", panel: "navigation" },
    { icon: <ArrowUpDown size={13} />, label: "순서 변경", panel: "navigation" },
    { icon: <Eye size={13} />, label: "숨김", action: "hide" },
  ],
  "alarm-panel": [
    { icon: <Bell size={13} />, label: "규칙 설정", panel: "alarm" },
    { icon: <ChevronsUpDown size={13} />, label: "우선순위", panel: "alarm" },
    { icon: <Database size={13} />, label: "데이터 연결", panel: "mapping" },
  ],
  "floor-status": [
    { icon: <Database size={13} />, label: "데이터 연결", panel: "mapping" },
    { icon: <Palette size={13} />, label: "색상 변경", action: "color" },
    { icon: <Trash2 size={13} />, label: "삭제", action: "delete" },
  ],
  widget: [
    { icon: <Database size={13} />, label: "데이터 연결", panel: "mapping" },
    { icon: <Palette size={13} />, label: "색상 변경", action: "color" },
    { icon: <Trash2 size={13} />, label: "삭제", action: "delete" },
  ],
};

const TOOLBAR_H = 40;
const TOOLBAR_MARGIN = 8;

// ─── 메인 컴포넌트 ────────────────────────────────────────────

export default function FloatingToolbar() {
  const { selectedElement, setSelectedElement, setRightPanel } = useEditorStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !selectedElement) return null;

  const actions = ACTIONS[selectedElement.type] ?? ACTIONS.widget;
  const { rect } = selectedElement;

  const topAbove = rect.top - TOOLBAR_H - TOOLBAR_MARGIN;
  const top = topAbove < 8 ? rect.top + rect.height + TOOLBAR_MARGIN : topAbove;
  const left = Math.min(rect.left, window.innerWidth - 400);

  const handleAction = (a: ToolbarAction) => {
    if (a.panel) {
      setRightPanel(a.panel as Parameters<typeof setRightPanel>[0]);
    }
  };

  return createPortal(
    <AnimatePresence>
      {selectedElement && (
        <motion.div
          key={selectedElement.sectionId}
          initial={{ scale: 0.82, opacity: 0, y: 6 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.82, opacity: 0, y: 6 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            top,
            left,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: 4,
            height: TOOLBAR_H,
            padding: "0 8px",
            background: "rgba(10,10,20,0.96)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0,212,255,0.22)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.08)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 섹션 라벨 */}
          <span
            style={{
              fontSize: 10,
              color: "#735FE9",
              fontWeight: 600,
              paddingRight: 8,
              borderRight: "1px solid rgba(255,255,255,0.1)",
              whiteSpace: "nowrap",
            }}
          >
            {selectedElement.label}
          </span>

          {/* 액션 버튼들 */}
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => handleAction(a)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 8px",
                borderRadius: 7,
                fontSize: 11,
                color: "rgba(255,255,255,0.65)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,212,255,0.12)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
              }}
            >
              {a.icon}
              <span>{a.label}</span>
            </button>
          ))}

          {/* 닫기 */}
          <button
            onClick={() => setSelectedElement(null)}
            style={{
              marginLeft: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.3)",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.3)";
            }}
          >
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
