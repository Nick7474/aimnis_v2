"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import type { SwappedPanelWidget } from "@/store/editorStore";

export interface DraggableWidgetProps {
  /** dnd-kit draggable id — must be unique across all draggables */
  dragId: string;
  label: string;
  /** Widget type hint shown as ghost badge */
  type: string;
  /** 4 panels that replace the Monitor right sidebar on drop */
  scenario: SwappedPanelWidget[];
  /** Also fires onClick for text-input shortcut (existing behaviour) */
  onClick?: () => void;
}

export default function DraggableWidget({
  dragId,
  label,
  type,
  scenario,
  onClick,
}: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: dragId,
      data: { label, type, scenario },
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <motion.button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      animate={{
        scale: isDragging ? 1.08 : 1,
        opacity: isDragging ? 0.72 : 1,
        boxShadow: isDragging
          ? "0 0 0 2px rgba(0,212,255,0.5), 0 8px 24px rgba(0,0,0,0.5)"
          : "none",
      }}
      transition={{ duration: 0.12 }}
      className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[10px] text-white/35 transition-colors hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300 cursor-grab active:cursor-grabbing select-none"
    >
      {label}
    </motion.button>
  );
}
