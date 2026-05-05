"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { WidgetData } from "@/store/editorStore";

interface BarChartWidgetProps {
  title: string;
  data: WidgetData;
}

const BAR_COLORS = [
  "var(--guard-color-primary)",
  "var(--guard-color-secondary)",
  "var(--guard-color-accent)",
  "var(--guard-color-warning)",
];

export default function BarChartWidget({ title, data }: BarChartWidgetProps) {
  const { chartData = [], color = "var(--guard-color-primary)" } = data;

  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex h-full flex-col rounded-xl border p-3 backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--guard-color-surface) 72%, transparent)",
        borderColor: "color-mix(in srgb, var(--guard-color-border) 72%, transparent)",
        color: "var(--guard-color-text)",
      }}
    >
      <p className="mb-2 text-[11px] font-medium truncate" style={{ color: "var(--guard-color-text-soft)" }}>{title}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--guard-color-text-faint)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--guard-color-text-faint)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--guard-color-surface)",
                border: "1px solid var(--guard-color-border)",
                borderRadius: "8px",
                fontSize: 11,
              }}
              cursor={{ fill: "color-mix(in srgb, var(--guard-color-primary) 8%, transparent)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={BAR_COLORS[i % BAR_COLORS.length] ?? color}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
