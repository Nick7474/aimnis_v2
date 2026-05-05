"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import type { WidgetData } from "@/store/editorStore";

interface AlertWidgetProps {
  title: string;
  data: WidgetData;
}

const LEVEL_CONFIG = {
  critical: {
    icon: XCircle,
    bg: "color-mix(in srgb, var(--guard-color-danger) 12%, transparent)",
    border: "color-mix(in srgb, var(--guard-color-danger) 34%, transparent)",
    text: "var(--guard-color-danger)",
  },
  warning: {
    icon: AlertTriangle,
    bg: "color-mix(in srgb, var(--guard-color-warning) 12%, transparent)",
    border: "color-mix(in srgb, var(--guard-color-warning) 34%, transparent)",
    text: "var(--guard-color-warning)",
  },
  info: {
    icon: Info,
    bg: "color-mix(in srgb, var(--guard-color-primary) 12%, transparent)",
    border: "color-mix(in srgb, var(--guard-color-primary) 34%, transparent)",
    text: "var(--guard-color-accent)",
  },
};

export default function AlertWidget({ title, data }: AlertWidgetProps) {
  const { alerts = [] } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="flex h-full flex-col rounded-xl border p-3 backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--guard-color-surface) 72%, transparent)",
        borderColor: "color-mix(in srgb, var(--guard-color-border) 72%, transparent)",
        color: "var(--guard-color-text)",
      }}
    >
      <p className="mb-2 text-[11px] font-medium truncate" style={{ color: "var(--guard-color-text-soft)" }}>{title}</p>
      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        <AnimatePresence>
          {alerts.map((alert, i) => {
            const cfg = LEVEL_CONFIG[alert.level] ?? LEVEL_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={i}
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.08 * i, type: "spring", stiffness: 320, damping: 24 }}
                className="flex items-start gap-2 rounded-lg border px-2 py-1.5"
                style={{ background: cfg.bg, borderColor: cfg.border }}
              >
                <Icon className="mt-0.5 h-3 w-3 flex-shrink-0" style={{ color: cfg.text }} />
                <p className="text-[10px] leading-relaxed" style={{ color: cfg.text }}>{alert.msg}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {alerts.length === 0 && (
          <p className="text-[10px] text-center mt-4" style={{ color: "var(--guard-color-text-faint)" }}>활성 알람 없음</p>
        )}
      </div>
    </motion.div>
  );
}
