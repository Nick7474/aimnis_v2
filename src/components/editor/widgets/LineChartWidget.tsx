"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { WidgetData } from "@/store/editorStore";

interface LineChartWidgetProps {
  title: string;
  data: WidgetData;
}

export default function LineChartWidget({ title, data }: LineChartWidgetProps) {
  const { chartData = [], color = "#6366f1" } = data;

  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
    >
      <p className="mb-2 text-[11px] font-medium text-white/50 truncate">{title}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(10,10,20,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: 11,
              }}
              itemStyle={{ color: "rgba(255,255,255,0.8)" }}
              labelStyle={{ color: "rgba(255,255,255,0.4)" }}
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
