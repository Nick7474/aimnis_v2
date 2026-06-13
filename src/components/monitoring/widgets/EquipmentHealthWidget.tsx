"use client";
import React from "react";
import { MOCK_EQUIPMENT } from "@/monitoring-app/mock/data";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

const RADAR_DATA = [
  { subject: "진동", A: 72, fullMark: 100 },
  { subject: "온도", A: 85, fullMark: 100 },
  { subject: "가스", A: 91, fullMark: 100 },
  { subject: "초음파", A: 78, fullMark: 100 },
  { subject: "통신", A: 96, fullMark: 100 },
];

export default function EquipmentHealthWidget() {
  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={RADAR_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <PolarGrid stroke="#ffffff10" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#ffffff60" }} />
            <Radar name="건강도" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
