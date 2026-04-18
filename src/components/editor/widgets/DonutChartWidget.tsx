"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { WidgetData } from "@/store/editorStore";

interface DonutChartWidgetProps {
  title: string;
  data: WidgetData;
}

const DONUT_COLORS = ["#14b8a6", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

export default function DonutChartWidget({ title, data }: DonutChartWidgetProps) {
  const { chartData = [] } = data;

  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, rotate: -5 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
    >
      <p className="mb-1 text-[11px] font-medium text-white/50 truncate">{title}</p>
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
                background: "rgba(10,10,20,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: 11,
              }}
            />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
