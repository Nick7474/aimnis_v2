"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { WidgetData } from "@/store/editorStore";

interface LineChartWidgetProps {
  title: string;
  data: WidgetData;
}

export default function LineChartWidget({ title, data }: LineChartWidgetProps) {
  const { chartData = [], color = "var(--guard-color-secondary)" } = data;

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
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
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
              itemStyle={{ color: "var(--guard-color-text)" }}
              labelStyle={{ color: "var(--guard-color-text-soft)" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
