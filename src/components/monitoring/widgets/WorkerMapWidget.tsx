"use client";
import React from "react";
import { MOCK_WORKERS, FALL_STAGE_LABELS } from "@/monitoring-app/mock/data";

const ZONES = [
  { id: "A", label: "A구역-1F", x: 10, y: 10, w: 35, h: 40 },
  { id: "B", label: "B구역-2F", x: 55, y: 10, w: 35, h: 40 },
  { id: "C", label: "C구역-B1", x: 10, y: 55, w: 80, h: 35 },
];

const WORKER_POS: Record<string, { x: number; y: number }> = {
  W001: { x: 22, y: 28 }, W002: { x: 68, y: 28 }, W003: { x: 50, y: 65 },
};

export default function WorkerMapWidget() {
  return (
    <div className="h-full relative">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* 구역 */}
        {ZONES.map((z) => (
          <g key={z.id}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={2} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
            <text x={z.x + 2} y={z.y + 5} fontSize={3.5} fill="rgba(255,255,255,0.3)">{z.label}</text>
          </g>
        ))}
        {/* 작업자 마커 */}
        {MOCK_WORKERS.map((w) => {
          const pos = WORKER_POS[w.workerId];
          if (!pos) return null;
          const stage = FALL_STAGE_LABELS[w.fall_stage];
          return (
            <g key={w.workerId}>
              <circle cx={pos.x} cy={pos.y} r={4} fill={stage.color} opacity={0.9} />
              {w.fall_stage === "confirmed_fall" && (
                <circle cx={pos.x} cy={pos.y} r={6} fill="none" stroke={stage.color} strokeWidth={0.8} opacity={0.5}>
                  <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={pos.x} y={pos.y + 8} fontSize={3} textAnchor="middle" fill="rgba(255,255,255,0.6)">{w.name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
