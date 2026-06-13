"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Database, EyeOff, Settings, Trash2, X } from "lucide-react";

interface MonitoringFloatingToolbarProps {
  selectedId: string | null;
  label: string | null;
  type: "widget" | "section" | null;
  onConfigure: () => void;
  onConnectData?: () => void;
  onHide?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

const TOOLBAR_H = 40;
const TOOLBAR_MARGIN = 8;

function getSelectionSelector(selectedId: string) {
  const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(selectedId) : selectedId.replace(/"/g, '\\"');
  return `[data-monitoring-selection-id="${escaped}"]`;
}

export default function MonitoringFloatingToolbar({
  selectedId,
  label,
  type,
  onConfigure,
  onConnectData,
  onHide,
  onDelete,
  onClose,
}: MonitoringFloatingToolbarProps) {
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDeleteConfirm(false);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const target = document.querySelector(getSelectionSelector(selectedId));
      setRect(target?.getBoundingClientRect() ?? null);
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (toolbarRef.current?.contains(target)) return;
      if (target.closest("[data-monitoring-selection-id]")) return;
      if (target.closest("[data-monitoring-inspector]")) return;
      if (target.closest("[data-monitoring-left-panel]")) return;
      onClose();
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose, selectedId]);

  if (!mounted || !selectedId || !label || !type || !rect) return null;

  const topAbove = rect.top - TOOLBAR_H - TOOLBAR_MARGIN;
  const top = topAbove < 8 ? rect.top + rect.height + TOOLBAR_MARGIN : topAbove;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 420));
  const isWidget = type === "widget";

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        key={selectedId}
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
          gap: 0,
          height: TOOLBAR_H,
          padding: "0 10px",
          background: "rgba(10,10,20,0.96)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0,212,255,0.22)",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.08)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <span
          style={{
            maxWidth: 116,
            overflow: "hidden",
            paddingRight: 10,
            borderRight: "1px solid rgba(255,255,255,0.1)",
            color: "#67E8F9",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.02em",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>

        <ToolbarButton icon={<Settings size={13} />} label="설정" ariaLabel={`${label} 설정`} onClick={onConfigure} />
        {isWidget && onConnectData && (
          <ToolbarButton icon={<Database size={13} />} label="데이터 연결" ariaLabel={`${label} 데이터 연결`} onClick={onConnectData} />
        )}
        {isWidget && onHide && (
          <ToolbarButton icon={<EyeOff size={13} />} label="숨김" ariaLabel={`${label} 숨김`} onClick={onHide} />
        )}
        {isWidget && onDelete ? (
          deleteConfirm ? (
            <div className="ml-1 flex items-center gap-1">
              <span className="text-[10px] text-rose-400">삭제?</span>
              <button
                type="button"
                onClick={onDelete}
                className="grid h-[22px] w-[22px] place-items-center rounded-md bg-rose-500/20 text-rose-300 transition-colors hover:bg-rose-500/30"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="grid h-[22px] w-[22px] place-items-center rounded-md text-white/35 transition-colors hover:bg-white/10 hover:text-white/70"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <ToolbarButton icon={<Trash2 size={13} />} label="삭제" ariaLabel={`${label} 삭제`} danger onClick={() => setDeleteConfirm(true)} />
          )
        ) : null}

        <button
          type="button"
          aria-label={`${label} 선택 해제`}
          onClick={onClose}
          style={{
            marginLeft: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 8,
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            cursor: "pointer",
          }}
        >
          <X size={12} />
        </button>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function ToolbarButton({
  icon,
  label,
  ariaLabel,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  ariaLabel: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginLeft: 6,
        padding: "5px 8px",
        borderRadius: 8,
        border: "none",
        background: "transparent",
        color: danger ? "rgba(244,63,94,0.8)" : "rgba(255,255,255,0.65)",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = danger ? "rgba(244,63,94,0.15)" : "rgba(0,212,255,0.12)";
        event.currentTarget.style.color = danger ? "#f43f5e" : "#fff";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "transparent";
        event.currentTarget.style.color = danger ? "rgba(244,63,94,0.8)" : "rgba(255,255,255,0.65)";
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
