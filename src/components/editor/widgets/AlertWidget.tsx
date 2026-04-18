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
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    dot: "bg-blue-500",
  },
};

export default function AlertWidget({ title, data }: AlertWidgetProps) {
  const { alerts = [] } = data;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
    >
      <p className="mb-2 text-[11px] font-medium text-white/50 truncate">{title}</p>
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
                className={`flex items-start gap-2 rounded-lg border px-2 py-1.5 ${cfg.bg} ${cfg.border}`}
              >
                <Icon className={`mt-0.5 h-3 w-3 flex-shrink-0 ${cfg.text}`} />
                <p className={`text-[10px] leading-relaxed ${cfg.text}`}>{alert.msg}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {alerts.length === 0 && (
          <p className="text-[10px] text-white/20 text-center mt-4">활성 알람 없음</p>
        )}
      </div>
    </motion.div>
  );
}
