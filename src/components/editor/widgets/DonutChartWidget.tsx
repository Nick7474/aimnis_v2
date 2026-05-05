"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { WidgetData } from "@/store/editorStore";

interface DonutChartWidgetProps {
  title: string;
  data: WidgetData;
}

const DONUT_COLORS = [
  "var(--guard-color-secondary)",
  "var(--guard-color-warning)",
  "var(--guard-color-danger)",
  "var(--guard-color-primary)",
  "var(--guard-color-accent)",
];

export default function DonutChartWidget({ title, data }: DonutChartWidgetProps) {
  const { chartData = [] } = data;

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, rotate: -5 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="flex h-full flex-col rounded-xl border p-3 backdrop-blur-sm"
      style={{
        background: "color-mix(in srgb, var(--guard-color-surface) 72%, transparent)",
        borderColor: "color-mix(in srgb, var(--guard-color-border) 72%, transparent)",
        color: "var(--guard-color-text)",
      }}
    >
      <p className="mb-1 text-[11px] font-medium truncate" style={{ color: "var(--guard-color-text-soft)" }}>{title}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="48%"
              outerRadius="72%"
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--guard-color-surface)",
                border: "1px solid var(--guard-color-border)",
                borderRadius: "8px",
                fontSize: 11,
              }}
            />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: 9, color: "var(--guard-color-text-soft)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
