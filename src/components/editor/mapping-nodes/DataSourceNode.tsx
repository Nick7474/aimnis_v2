"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Database, FileJson2, FolderOpen, Globe2, Zap, Video, Wind, HardHat } from "lucide-react";
import type { MappingField, MappingSourceKind } from "@/store/editorStore";

// 커넥터별 아이콘 / 색상
const CONNECTOR_META: Record<string, { icon: typeof Database; color: string; label: string }> = {
  "energy-sensor": { icon: Zap, color: "#14b8a6", label: "에너지 센서" },
  cctv: { icon: Video, color: "#f59e0b", label: "CCTV" },
  "air-quality": { icon: Wind, color: "#3b82f6", label: "대기질" },
  "worker-safety": { icon: HardHat, color: "#8b5cf6", label: "작업자 안전" },
};

export interface DataSourceNodeData {
  connectorId: string;
  fields: Array<string | MappingField>;
  connectedFields?: Set<string>;
  label?: string;
  kind?: MappingSourceKind;
  method?: string;
  endpoint?: string;
  description?: string;
  fileCount?: number;
}

function DataSourceNode({ data }: NodeProps<DataSourceNodeData>) {
  const meta = data.kind && data.kind !== "demo" ? {
    icon: data.kind === "folder" ? FolderOpen : data.kind === "api" ? Globe2 : FileJson2,
    color: data.kind === "api" ? "#22c55e" : data.kind === "folder" ? "#38bdf8" : "#a78bfa",
    label: data.label ?? data.connectorId,
  } : CONNECTOR_META[data.connectorId] ?? {
    icon: Database,
    color: "#6b7280",
    label: data.label ?? data.connectorId,
  };
  const Icon = meta.icon;
  const connected = data.connectedFields ?? new Set();

  return (
    <div
      style={{
        minWidth: 260,
        position: "relative",
        background: "rgba(10, 12, 28, 0.95)",
        border: `1px solid ${meta.color}33`,
        borderRadius: 12,
        overflow: "visible",
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${meta.color}15`,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderBottom: `1px solid ${meta.color}20`,
          background: `${meta.color}08`,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: `${meta.color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={13} color={meta.color} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: meta.color }}>
          {meta.label}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            background: "rgba(255,255,255,0.05)",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          {data.method ?? (data.fileCount ? `${data.fileCount} files` : `${data.fields.length} fields`)}
        </span>
      </div>

      {(data.endpoint || data.description) && (
        <div style={{ padding: "8px 14px 4px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {data.endpoint && (
            <div style={{ fontSize: 9, color: "rgba(34,197,94,0.8)", fontFamily: "monospace" }}>
              {data.endpoint}
            </div>
          )}
          {data.description && (
            <div style={{ marginTop: 3, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
              {data.description}
            </div>
          )}
        </div>
      )}

      {/* 필드 목록 */}
      <div style={{ padding: "6px 0" }}>
        {data.fields.map((item) => {
          const field = typeof item === "string"
            ? { id: item, name: item, path: item, type: "unknown" as const }
            : item;
          const isConn = connected.has(field.id);
          return (
            <div
              key={field.id}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 8,
                minHeight: 30,
                padding: "6px 38px 6px 14px",
                transition: "background 0.1s",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isConn ? meta.color : "rgba(255,255,255,0.15)",
                  boxShadow: isConn ? `0 0 6px ${meta.color}` : "none",
                  transition: "all 0.2s",
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: isConn ? meta.color : "rgba(255,255,255,0.55)",
                }}
              >
                {field.name}
              </span>
              <span
                style={{
                  maxWidth: 64,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 8,
                  color: "rgba(255,255,255,0.25)",
                }}
              >
                {field.sample ?? field.type}
              </span>
              <div
                style={{
                  position: "absolute",
                  right: -5,
                  top: "50%",
                  width: 10,
                  height: 12,
                  transform: "translateY(-50%)",
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                  background: isConn ? "rgba(20,184,166,0.95)" : "rgba(176,183,194,0.92)",
                  opacity: 0.95,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: -3,
                  top: "50%",
                  width: 6,
                  height: 8,
                  transform: "translateY(-50%)",
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                  background: "rgba(10,12,28,0.96)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
              {/* 출력 핸들 — 오른쪽 */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${data.connectorId}__${field.id}`}
                style={{
                  width: 12,
                  height: 14,
                  right: -6,
                  zIndex: 2,
                  background: "transparent",
                  border: "none",
                  borderRadius: 0,
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                  transition: "all 0.2s",
                  cursor: "grab",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(DataSourceNode);
