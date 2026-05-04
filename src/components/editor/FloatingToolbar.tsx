"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Database, Palette, Trash2, Check,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

// ─── 색상 프리셋 ─────────────────────────────────────────────
const COLOR_PRESETS = [
  "#14b8a6", "#06b6d4", "#8b5cf6", "#f43f5e",
  "#f59e0b", "#22c55e", "#3b82f6", "#ec4899",
];

const TOOLBAR_H = 40;
const TOOLBAR_MARGIN = 8;

// ─── 메인 컴포넌트 ────────────────────────────────────────────

export default function FloatingToolbar() {
  const {
    selectedElement, setSelectedElement, setRightPanel, setCenterView,
    removeOverlayWidget, overlayWidgets, updateOverlayWidgetData, setShowRightPanel,
  } = useEditorStore();
  const [mounted, setMounted] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // ─── 바깥 클릭 시 자동 닫기 ───
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (!selectedElement) return;
      const target = e.target as HTMLElement;
      // 툴바 자체 클릭이면 무시
      if (toolbarRef.current?.contains(target)) return;
      // 선택된 위젯 카드 내부 클릭이면 무시
      if (target.closest("[data-overlay-card]")) return;
      // EditableSection 내부 클릭이면 무시
      if (target.closest("[data-editable-section]")) return;
      // 우측 Inspector 내부 편집이면 선택 상태 유지
      if (target.closest("[data-editor-inspector]")) return;
      // 그 외 모든 클릭 → 선택 해제 (툴바 사라짐)
      setSelectedElement(null);
      setShowColorPicker(false);
      setDeleteConfirm(false);
    },
    [selectedElement, setSelectedElement]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // ESC 키로도 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedElement) {
        setSelectedElement(null);
        setShowColorPicker(false);
        setDeleteConfirm(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [selectedElement, setSelectedElement]);

  // 선택 대상 변경 시 서브 메뉴 초기화
  useEffect(() => {
    setShowColorPicker(false);
    setDeleteConfirm(false);
  }, [selectedElement?.sectionId]);

  if (!mounted || !selectedElement) return null;

  // 위젯 타입일 때만 위젯 전용 액션 표시
  const isWidget = selectedElement.type === "widget";
  const currentWidget = isWidget
    ? overlayWidgets.find((w) => w.id === selectedElement.sectionId)
    : null;

  const { rect } = selectedElement;
  const topAbove = rect.top - TOOLBAR_H - TOOLBAR_MARGIN;
  const top = topAbove < 8 ? rect.top + rect.height + TOOLBAR_MARGIN : topAbove;
  const left = Math.min(rect.left, window.innerWidth - 400);

  // ─── 기능 핸들러 ───

  const handleDataConnect = () => {
    setRightPanel("mapping");
    setCenterView("mapping");
    setShowRightPanel(true);
  };

  const handleColorChange = (color: string) => {
    if (!currentWidget) return;
    updateOverlayWidgetData(currentWidget.id, { color });
    setShowColorPicker(false);
  };

  const handleDelete = () => {
    if (!currentWidget) return;
    removeOverlayWidget(currentWidget.id);
    setSelectedElement(null);
    setDeleteConfirm(false);
  };

  return createPortal(
    <AnimatePresence>
      {selectedElement && (
        <motion.div
          ref={toolbarRef}
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
            flexDirection: "column",
            gap: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 메인 툴바 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              height: TOOLBAR_H,
              padding: "0 8px",
              background: "rgba(10,10,20,0.96)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0,212,255,0.22)",
              borderRadius: showColorPicker ? "12px 12px 0 0" : 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.08)",
            }}
          >
            {/* 섹션 라벨 */}
            <span
              style={{
                fontSize: 10,
                color: "#67E8F9",
                fontWeight: 600,
                paddingRight: 8,
                borderRight: "1px solid rgba(255,255,255,0.1)",
                whiteSpace: "nowrap",
                maxWidth: 100,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedElement.label}
            </span>

            {isWidget && currentWidget ? (
              <>
                {/* 데이터 연결 */}
                <ToolbarButton
                  icon={<Database size={13} />}
                  label="데이터 연결"
                  onClick={handleDataConnect}
                />

                {/* 색상 변경 */}
                <ToolbarButton
                  icon={<Palette size={13} />}
                  label="색상 변경"
                  active={showColorPicker}
                  onClick={() => setShowColorPicker((v) => !v)}
                />

                {/* 삭제 */}
                {deleteConfirm ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 4 }}>
                    <span style={{ fontSize: 10, color: "#f43f5e", whiteSpace: "nowrap" }}>삭제?</span>
                    <button
                      onClick={handleDelete}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: 6,
                        background: "rgba(244,63,94,0.2)", border: "none", cursor: "pointer",
                        color: "#f43f5e", transition: "background 0.12s",
                      }}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: 6,
                        background: "transparent", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.3)", transition: "background 0.12s",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <ToolbarButton
                    icon={<Trash2 size={13} />}
                    label="삭제"
                    danger
                    onClick={() => setDeleteConfirm(true)}
                  />
                )}
              </>
            ) : (
              /* 비-위젯 섹션 (map, header 등) — 간단한 설정 링크 */
              <ToolbarButton
                icon={<Database size={13} />}
                label="설정"
                onClick={() => { setRightPanel("settings"); setShowRightPanel(true); }}
              />
            )}

            {/* 닫기 */}
            <button
              onClick={() => { setSelectedElement(null); setShowColorPicker(false); setDeleteConfirm(false); }}
              style={{
                marginLeft: 4, display: "flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: 6,
                background: "transparent", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.3)", transition: "background 0.12s, color 0.12s",
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
          </div>

          {/* 색상 피커 서브 패널 */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  overflow: "hidden",
                  background: "rgba(10,10,20,0.96)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(0,212,255,0.22)",
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ display: "flex", gap: 6, padding: "8px 10px", flexWrap: "wrap" }}>
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      style={{
                        width: 24, height: 24, borderRadius: 8,
                        background: color,
                        border: currentWidget?.data.color === color
                          ? "2px solid #fff"
                          : "2px solid transparent",
                        cursor: "pointer",
                        transition: "transform 0.1s, border 0.1s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// ─── 재사용 버튼 컴포넌트 ──────────────────────────────────────

function ToolbarButton({
  icon,
  label,
  onClick,
  danger,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 8px",
        borderRadius: 7,
        fontSize: 11,
        color: active
          ? "#00d4ff"
          : danger
          ? "rgba(244,63,94,0.8)"
          : "rgba(255,255,255,0.65)",
        background: active ? "rgba(0,212,255,0.12)" : "transparent",
        border: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background 0.12s, color 0.12s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = danger
          ? "rgba(244,63,94,0.15)"
          : "rgba(0,212,255,0.12)";
        (e.currentTarget as HTMLButtonElement).style.color = danger ? "#f43f5e" : "#fff";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = active
          ? "rgba(0,212,255,0.12)"
          : "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = active
          ? "#00d4ff"
          : danger
          ? "rgba(244,63,94,0.8)"
          : "rgba(255,255,255,0.65)";
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
