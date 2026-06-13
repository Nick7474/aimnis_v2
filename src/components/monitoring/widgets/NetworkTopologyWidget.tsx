"use client";
import React from "react";
import { MOCK_COMM_STATUS } from "@/monitoring-app/mock/data";

const NODES = [
  { id: "gateway", label: "게이트웨이", x: 50, y: 10, type: "gateway" },
  { id: "BLE",     label: "BLE Hub",    x: 20, y: 45, type: "hub" },
  { id: "LTE",     label: "LTE",        x: 45, y: 45, type: "hub" },
  { id: "LoRa",    label: "LoRa",       x: 70, y: 45, type: "hub" },
  { id: "RS-485",  label: "RS-485",     x: 85, y: 10, type: "hub" },
  { id: "w1",      label: "W001",       x: 10, y: 80, type: "device" },
  { id: "w2",      label: "W002",       x: 30, y: 80, type: "device" },
  { id: "eq1",     label: "EQ001",      x: 50, y: 80, type: "device" },
  { id: "eq3",     label: "EQ003",      x: 70, y: 80, type: "device" },
];

const LINKS = [
  { from: "gateway", to: "BLE" }, { from: "gateway", to: "LTE" },
  { from: "gateway", to: "LoRa" }, { from: "gateway", to: "RS-485" },
  { from: "BLE", to: "w1" }, { from: "BLE", to: "w2" },
  { from: "LTE", to: "eq1" }, { from: "LoRa", to: "eq3" },
];

const STATUS_COLORS: Record<string, string> = {
  online: "#10b981", degraded: "#f59e0b", offline: "#ef4444"
};

export default function NetworkTopologyWidget() {
  const getNode = (id: string) => NODES.find((n) => n.id === id)!;
  const commMap = Object.fromEntries(MOCK_COMM_STATUS.map((s) => [s.protocol, s.status]));

  return (
    <div className="h-full">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {LINKS.map((l, i) => {
          const from = getNode(l.from), to = getNode(l.to);
          const proto = to.id as string;
          const status = commMap[proto] ?? "online";
          const color = STATUS_COLORS[status] ?? "#06b6d4";
          return (
            <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={color} strokeWidth={0.8} strokeOpacity={0.5} strokeDasharray={status === "degraded" ? "2 1" : undefined} />
          );
        })}
        {NODES.map((n) => {
          const isHub = n.type === "hub";
          const status = commMap[n.id] ?? "online";
          const color = isHub ? STATUS_COLORS[status] ?? "#06b6d4" : n.type === "gateway" ? "#8b5cf6" : "#06b6d4";
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={isHub ? 5 : n.type === "gateway" ? 6 : 3.5}
                fill={`${color}30`} stroke={color} strokeWidth={0.8} />
              <text x={n.x} y={n.y + (isHub ? 9 : 7)} fontSize={3} textAnchor="middle" fill="rgba(255,255,255,0.5)">
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
