"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { WidgetData } from "@/store/editorStore";

interface KpiWidgetProps {
  title: string;
  data: WidgetData;
}

export default function KpiWidget({ title, data }: KpiWidgetProps) {
  const { value, unit, trend, trendUp, color = "#14b8a6", description } = data;

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
    >
      <p className="text-[11px] font-medium text-white/50 truncate">{title}</p>
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
          {unit && <span className="text-xs text-white/40">{unit}</span>}
        </div>
        {trend && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, type: "spring" }}
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              trendUp ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
            }`}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </motion.div>
        )}
      </div>
      {description && (
        <p className="mt-1.5 text-[10px] text-white/30 truncate">{description}</p>
      )}
    </motion.div>
  );
}
