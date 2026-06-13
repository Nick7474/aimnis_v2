"use client";
import React from "react";
import { Calendar, Wrench, AlertTriangle } from "lucide-react";

const SCHEDULE = [
  { id: 1, equipment: "압축기 #1", task: "베어링 교체", dueDate: "2026-06-10", priority: "high",   status: "upcoming" },
  { id: 2, equipment: "모터 #7",   task: "코일 절연 점검", dueDate: "2026-06-08", priority: "critical", status: "overdue" },
  { id: 3, equipment: "펌프 #3",   task: "씰 교체",     dueDate: "2026-06-20", priority: "medium", status: "scheduled" },
  { id: 4, equipment: "변압기 T2", task: "절연유 분석", dueDate: "2026-07-01", priority: "low",    status: "scheduled" },
];

const PRIORITY_COLOR: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#10b981"
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  overdue:   <AlertTriangle className="w-3 h-3 text-red-400" />,
  upcoming:  <Calendar className="w-3 h-3 text-yellow-400" />,
  scheduled: <Wrench className="w-3 h-3 text-white/30" />,
};

export default function MaintenanceScheduleWidget() {
  return (
    <div className="h-full flex flex-col gap-1.5 overflow-auto">
      {SCHEDULE.map((s) => {
        const pc = PRIORITY_COLOR[s.priority] ?? "#06b6d4";
        return (
          <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-white/[0.02]">
            <div className="shrink-0">{STATUS_ICON[s.status]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/80 truncate">{s.equipment}</div>
              <div className="text-[9px] text-white/40">{s.task}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[9px] text-white/40">{s.dueDate}</div>
              <div className="text-[9px] font-medium" style={{ color: pc }}>{s.priority}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
