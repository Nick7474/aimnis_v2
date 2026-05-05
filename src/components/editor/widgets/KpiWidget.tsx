"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { WidgetData } from "@/store/editorStore";

interface KpiWidgetProps {
  title: string;
  data: WidgetData;
}

export default function KpiWidget({ title, data }: KpiWidgetProps) {
  const { value, unit, trend, trendUp, color = "var(--guard-color-secondary)", description } = data;

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="flex h-full flex-col justify-between rounded-xl border p-4 backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--guard-color-surface) 72%, transparent)",
        borderColor: "color-mix(in srgb, var(--guard-color-border) 72%, transparent)",
        color: "var(--guard-color-text)",
      }}
    >
      <p className="text-[11px] font-medium truncate" style={{ color: "var(--guard-color-text-soft)" }}>{title}</p>
      <div className="flex items-end justify-between gap-2 mt-2">
        <div className="flex items-baseline gap-1">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 280 }}
            className="text-3xl font-bold tabular-nums"
            style={{ color }}
          >
            {value ?? "—"}
          </motion.span>
          {unit && <span className="text-xs" style={{ color: "var(--guard-color-text-faint)" }}>{unit}</span>}
        </div>
        {trend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: "spring" }}
            className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: trendUp
                ? "color-mix(in srgb, var(--guard-color-success) 15%, transparent)"
                : "color-mix(in srgb, var(--guard-color-danger) 15%, transparent)",
              color: trendUp ? "var(--guard-color-success)" : "var(--guard-color-danger)",
            }}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </motion.div>
        )}
      </div>
      {description && (
        <p className="mt-1.5 text-[10px] truncate" style={{ color: "var(--guard-color-text-faint)" }}>{description}</p>
      )}
    </motion.div>
  );
}
