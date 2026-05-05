"use client";

import { motion } from "framer-motion";
import type { WidgetData } from "@/store/editorStore";

interface GaugeWidgetProps {
  title: string;
  data: WidgetData;
}

export default function GaugeWidget({ title, data }: GaugeWidgetProps) {
  const { gaugeValue = 0, gaugeMax = 100, unit = "%", color = "var(--guard-color-warning)" } = data;

  const pct = Math.min(gaugeValue / gaugeMax, 1);
  const angle = -135 + pct * 270; // -135° to +135°
  const r = 36;
  const cx = 56;
  const cy = 56;

  // arc path helper
  const polarToXY = (deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const start = polarToXY(-135);
  const end = polarToXY(-135 + pct * 270);
  const large = pct * 270 > 180 ? 1 : 0;

  const trackEnd = polarToXY(135);

  const levelColor =
    pct > 0.85 ? "var(--guard-color-danger)" : pct > 0.6 ? "var(--guard-color-warning)" : color;

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="flex h-full flex-col items-center justify-center rounded-xl border p-3 backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--guard-color-surface) 72%, transparent)",
        borderColor: "color-mix(in srgb, var(--guard-color-border) 72%, transparent)",
        color: "var(--guard-color-text)",
      }}
    >
      <p className="mb-2 text-[11px] font-medium truncate w-full text-center" style={{ color: "var(--guard-color-text-soft)" }}>{title}</p>
      <svg width="112" height="80" viewBox="0 0 112 80">
        {/* track */}
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
          fill="none"
          stroke="color-mix(in srgb, var(--guard-color-border) 55%, transparent)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* fill arc */}
        {pct > 0 && (
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`}
            fill="none"
            stroke={levelColor}
            strokeWidth="7"
            strokeLinecap="round"
          />
        )}
        {/* needle */}
        <motion.line
          initial={{ rotate: -135 }}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.3 }}
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r + 10}
          stroke={levelColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        <circle cx={cx} cy={cy} r="4" fill={levelColor} />
        {/* value */}
        <text x={cx} y={cy + 20} textAnchor="middle" fill="var(--guard-color-text-strong)" fontSize="14" fontWeight="700">
          {gaugeValue}
        </text>
        <text x={cx} y={cy + 31} textAnchor="middle" fill="var(--guard-color-text-faint)" fontSize="9">
          {unit}
        </text>
      </svg>
    </motion.div>
  );
}
