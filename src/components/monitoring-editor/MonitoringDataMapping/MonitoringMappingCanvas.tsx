"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, BackgroundVariant, Controls, addEdge, applyNodeChanges, useEdgesState, useNodesState, type Connection, type Edge, type NodeChange, type Node } from "reactflow";
import "reactflow/dist/style.css";
import ProjectLineEdge from "./nodes/ProjectLineEdge";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Database, Link2, Loader2, Network, Sparkles, Unlink } from "lucide-react";
import { LoaderCard } from "@/components/shared/AIMILoader";
import type { MappingEdge, MappingField, MappingSource } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import MonitoringSourceNode from "./nodes/MonitoringSourceNode";
import MonitoringTargetNode from "./nodes/MonitoringTargetNode";
import type { MonitoringSourceNodeData } from "./nodes/MonitoringSourceNode";
import type { MonitoringTargetNodeData } from "./nodes/MonitoringTargetNode";
import {
  buildMonitoringDemoSource,
  MONITORING_CONNECTORS,
  MONITORING_CORE_TARGETS,
  MONITORING_CORE_BINDINGS,
  MONITORING_SOURCE_POSITIONS,
  MONITORING_TARGET_POSITIONS,
  MONITORING_WIDGET_DEFAULT_BINDINGS,
  MONITORING_WIDGET_PROPERTIES,
} from "./monitoringMappingData";

const NODE_TYPES = {
  dataSource: MonitoringSourceNode,
  widgetTarget: MonitoringTargetNode,
};

const EDGE_TYPES = { projectLine: ProjectLineEdge };

type MappingNodeData = MonitoringSourceNodeData | MonitoringTargetNodeData;

export interface CanvasWidgetRef {
  instanceId: string;
  widgetId: string;
  title: string;
  widgetType?: string;
}

export interface MonitoringMappingCanvasProps {
  mappingEdges: MappingEdge[];
  addMappingEdge: (edge: MappingEdge) => void;
  removeMappingEdge: (id: string) => void;
  canvasWidgets?: CanvasWidgetRef[];
  savedNodePositions?: Record<string, { x: number; y: number }>;
  onNodePositionsChange?: (positions: Record<string, { x: number; y: number }>) => void;
  connectedSourceIds?: Set<string>;
  connectedSourceMeta?: Record<string, { name: string; endpoint: string; fields?: string[] }>;
  activePageLabel?: string;
}

export default function MonitoringMappingCanvas({
  mappingEdges, addMappingEdge, removeMappingEdge,
  canvasWidgets = [], savedNodePositions = {}, onNodePositionsChange,
  connectedSourceIds, connectedSourceMeta, activePageLabel,
}: MonitoringMappingCanvasProps) {
  const [notice, setNotice] = useState<string | null>(null);
  const [latestManualEdgeId, setLatestManualEdgeId] = useState<string | null>(null);
  const [isMappingLoading, setIsMappingLoading] = useState(false);

  const sources = useMemo<MappingSource[]>(() => {
    if (!connectedSourceIds || connectedSourceIds.size === 0) return [];
    const result: MappingSource[] = [];
    connectedSourceIds.forEach((id) => {
      const meta = connectedSourceMeta?.[id];
      if (MONITORING_CONNECTORS.includes(id)) {
        const base = buildMonitoringDemoSource(id);
        result.push(meta ? { ...base, name: meta.name } : base);
      } else if (meta) {
        const fields: MappingField[] = (meta.fields ?? []).map((f) => ({
          id: f.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          name: f, path: f, type: "unknown" as MappingField["type"],
        }));
        result.push({
          id, name: meta.name, kind: "api", description: meta.endpoint, endpoint: meta.endpoint,
          fields: fields.length > 0 ? fields : [{ id: "value", name: "value", path: "value", type: "unknown" as MappingField["type"] }],
          createdAt: 0,
        });
      }
    });
    return result;
  }, [connectedSourceIds, connectedSourceMeta]);

  const connectedSourceFields = useMemo(() => {
    const set = new Set<string>();
    mappingEdges.forEach((e) => set.add(`${e.sourceConnector}__${e.sourceField}`));
    return set;
  }, [mappingEdges]);

  const connectedTargetProps = useMemo(() => {
    const map = new Map<string, Set<string>>();
    mappingEdges.forEach((e) => {
      if (!map.has(e.targetWidgetId)) map.set(e.targetWidgetId, new Set());
      map.get(e.targetWidgetId)!.add(e.targetProperty);
    });
    return map;
  }, [mappingEdges]);

  const fieldLabels = useMemo(() => {
    const map = new Map<string, string>();
    sources.forEach((s) => s.fields.forEach((f) => map.set(`${s.id}__${f.id}`, f.name)));
    return map;
  }, [sources]);

  const sourceNodes: Node<MappingNodeData>[] = useMemo(() =>
    sources.map((source, index) => {
      const fallbackY = source.kind === "demo" ? 80 + index * 245 : 900 + index * 245;
      const nodeId = `ds-${source.id}`;
      const position = savedNodePositions[nodeId] ?? MONITORING_SOURCE_POSITIONS[source.id] ?? {
        x: source.kind === "demo" ? 54 : 220 + (index % 2) * 320,
        y: fallbackY,
      };
      return {
        id: nodeId,
        type: "dataSource",
        position,
        data: {
          connectorId: source.id,
          fields: source.fields,
          connectedFields: new Set(source.fields.filter((f) => connectedSourceFields.has(`${source.id}__${f.id}`)).map((f) => f.id)),
          label: source.name,
          kind: source.kind,
          method: source.method,
          endpoint: source.endpoint,
          description: source.description,
          fileCount: source.fileCount,
        },
        draggable: true,
      };
    }),
    [connectedSourceFields, savedNodePositions, sources]
  );

  const widgetNodes: Node<MappingNodeData>[] = useMemo(() => {
    const coreNodes: Node<MappingNodeData>[] = MONITORING_CORE_TARGETS.map((panel, index) => ({
      id: `wt-${panel.id}`,
      type: "widgetTarget",
      position: savedNodePositions[`wt-${panel.id}`] ?? MONITORING_TARGET_POSITIONS[panel.id] ?? { x: 840, y: 60 + index * 180 },
      data: {
        widgetId: panel.id,
        widgetType: panel.type,
        title: panel.title,
        connectedProperties: connectedTargetProps.get(panel.id),
        themeColor: panel.color,
        category: "Core Panel" as const,
        targetProperties: [...panel.properties],
      },
      draggable: true,
    }));

    const aiWidgetNodes: Node<MappingNodeData>[] = canvasWidgets.map((widget, index) => ({
      id: `wt-${widget.instanceId}`,
      type: "widgetTarget",
      position: savedNodePositions[`wt-${widget.instanceId}`] ?? { x: 1920, y: 80 + index * 190 },
      data: {
        widgetId: widget.instanceId,
        widgetType: widget.widgetType ?? widget.widgetId,
        title: widget.title,
        connectedProperties: connectedTargetProps.get(widget.instanceId),
        themeColor: "#a78bfa",
        category: "AI Widget" as const,
        targetProperties: MONITORING_WIDGET_PROPERTIES[widget.widgetType ?? widget.widgetId] ?? ["value"],
      },
      draggable: true,
    }));

    return [...coreNodes, ...aiWidgetNodes];
  }, [canvasWidgets, connectedTargetProps, savedNodePositions]);

  const initialNodes = useMemo<Node<MappingNodeData>[]>(() => [...sourceNodes, ...widgetNodes], [sourceNodes, widgetNodes]);

  const initialEdges: Edge[] = useMemo(() =>
    mappingEdges.map((edge) => {
      const isLatest = edge.id === latestManualEdgeId;
      const stroke = isLatest ? "rgba(20,184,166,0.95)" : "rgba(170,176,185,0.72)";
      return {
        id: edge.id,
        source: `ds-${edge.sourceConnector}`,
        sourceHandle: `${edge.sourceConnector}__${edge.sourceField}`,
        target: `wt-${edge.targetWidgetId}`,
        targetHandle: `${edge.targetWidgetId}__${edge.targetProperty}`,
        type: "projectLine",
        animated: false,
        data: { isLatest },
        style: { stroke, strokeWidth: isLatest ? 2 : 1.5 },
        label: `${fieldLabels.get(`${edge.sourceConnector}__${edge.sourceField}`) ?? edge.sourceField} -> ${edge.targetProperty}`,
        labelStyle: { fontSize: 9, fill: isLatest ? "#99f6e4" : "rgba(255,255,255,0.42)", fontFamily: "monospace" },
        labelBgStyle: { fill: "rgba(10,10,20,0.88)", rx: 4, ry: 4 },
        labelBgPadding: [4, 4] as [number, number],
      };
    }),
    [fieldLabels, latestManualEdgeId, mappingEdges]
  );

  const [nodes, setNodes] = useNodesState<MappingNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((cur) => {
      const next = applyNodeChanges(changes, cur);
      const hasDragEnd = changes.some((c) => c.type === "position" && !(c as { dragging?: boolean }).dragging);
      if (hasDragEnd && onNodePositionsChange) {
        const posMap: Record<string, { x: number; y: number }> = {};
        next.forEach((n) => { posMap[n.id] = n.position; });
        onNodePositionsChange(posMap);
      }
      return next;
    });
  }, [onNodePositionsChange, setNodes]);

  useEffect(() => {
    setNodes((cur) => {
      const byId = new Map(cur.map((n) => [n.id, n]));
      return initialNodes.map((n) => {
        const prev = byId.get(n.id);
        return prev ? { ...n, position: prev.position, selected: prev.selected } : n;
      });
    });
  }, [initialNodes, setNodes]);

  useEffect(() => setEdges(initialEdges), [initialEdges, setEdges]);

  const handleAutoMap = useCallback(async () => {
    if (!connectedSourceIds || connectedSourceIds.size === 0) {
      setNotice("DB 수집 탭에서 소스를 먼저 연결하세요");
      window.setTimeout(() => setNotice(null), 2200);
      return;
    }
    setIsMappingLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    let count = 0;
    MONITORING_CORE_BINDINGS.forEach((b) => {
      if (!connectedSourceIds.has(b.source)) return;
      const edgeId = `core-${b.source}-${b.field}-${b.target}-${b.property}`;
      if (mappingEdges.some((e) => e.id === edgeId)) return;
      addMappingEdge({ id: edgeId, sourceConnector: b.source, sourceField: b.field, targetWidgetId: b.target, targetProperty: b.property });
      count++;
    });
    canvasWidgets.forEach((widget) => {
      // widgetType에 "monitoring-" 접두사가 붙어 있으므로 widgetId 기준으로 조회
      const binding = MONITORING_WIDGET_DEFAULT_BINDINGS[widget.widgetId];
      if (!binding || !connectedSourceIds.has(binding.source)) return;
      const edgeId = `seed-${binding.source}-${binding.field}-${widget.instanceId}-${binding.property}`;
      if (mappingEdges.some((e) => e.id === edgeId)) return;
      addMappingEdge({ id: edgeId, sourceConnector: binding.source, sourceField: binding.field, targetWidgetId: widget.instanceId, targetProperty: binding.property });
      count++;
    });
    setIsMappingLoading(false);
    setNotice(count > 0 ? `${count}개 연결을 자동으로 매핑했습니다` : "이미 모든 소스가 매핑되어 있습니다");
    window.setTimeout(() => setNotice(null), 2400);
  }, [addMappingEdge, canvasWidgets, connectedSourceIds, mappingEdges]);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.sourceHandle || !connection.targetHandle) return;
    const [sourceConnector, sourceField] = connection.sourceHandle.split("__");
    const targetParts = connection.targetHandle.split("__");
    const targetProperty = targetParts[targetParts.length - 1];
    const targetWidgetId = targetParts.slice(0, -1).join("__");
    const edgeId = `me-${sourceConnector}-${sourceField}-${targetWidgetId}-${targetProperty}`;
    const sourceLabel = fieldLabels.get(`${sourceConnector}__${sourceField}`) ?? sourceField;
    setLatestManualEdgeId(edgeId);
    addMappingEdge({ id: edgeId, sourceConnector, sourceField, targetWidgetId, targetProperty });
    setEdges((cur) => addEdge({
      ...connection,
      id: edgeId,
      type: "projectLine",
      animated: false,
      data: { isLatest: true },
      style: { stroke: "rgba(20,184,166,0.95)", strokeWidth: 2 },
      label: `${sourceLabel} -> ${targetProperty}`,
      labelStyle: { fontSize: 9, fill: "rgba(255,255,255,0.58)", fontFamily: "monospace" },
      labelBgStyle: { fill: "rgba(10,10,20,0.9)", rx: 4, ry: 4 },
      labelBgPadding: [4, 4] as [number, number],
    }, cur));
  }, [addMappingEdge, fieldLabels, setEdges]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    removeMappingEdge(edge.id);
    setEdges((cur) => cur.filter((e) => e.id !== edge.id));
  }, [removeMappingEdge, setEdges]);

  const totalTargets = MONITORING_CORE_TARGETS.length + canvasWidgets.length;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050711]">
      {/* 자동 매핑 인라인 오버레이 — 캔버스가 보이면서 로딩 표시 */}
      <AnimatePresence>
        {isMappingLoading && (
          <motion.div
            key="mapping-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 50,
              background: "rgba(5,7,17,0.72)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoaderCard
              character="ch5"
              title="자동 매핑 중"
              subtitles={["소스 필드 분석 중", "위젯 바인딩 생성 중", "데이터 연결 최적화 중"]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.12),transparent_26%),radial-gradient(circle_at_75%_20%,rgba(139,92,246,0.13),transparent_24%)]" />

      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} edgeTypes={EDGE_TYPES}
        onNodesChange={handleNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onEdgeClick={onEdgeClick}
        defaultViewport={{ x: 14, y: 44, zoom: 0.65 }}
        minZoom={0.25} maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
        connectionLineStyle={{ stroke: "#14b8a6", strokeWidth: 2, strokeDasharray: "5 5" }}
        defaultEdgeOptions={{ animated: false, type: "projectLine", style: { stroke: "rgba(170,176,185,0.72)", strokeWidth: 1.5 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.045)" />
        <Controls className="!bottom-4 !right-4 !left-auto !top-auto !overflow-hidden !rounded-xl !border-white/10 !bg-white/5" showInteractive={false} />
      </ReactFlow>

      {/* Empty state when no DB sources connected */}
      <AnimatePresence>
        {sources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#080b18]/80 px-10 py-8 text-center backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05] ring-1 ring-white/[0.08]">
                <Network className="h-5 w-5 text-white/25" />
              </div>
              <p className="text-sm font-semibold text-white/50">연결된 데이터 소스가 없습니다</p>
              <p className="text-[11px] leading-relaxed text-white/25">
                "DB 수집" 탭에서 소스를 연결하면<br />여기에 소스 노드가 표시됩니다
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-left panel */}
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] items-start gap-3">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto w-[340px] rounded-xl border border-white/10 bg-[#080b18]/[0.92] p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
              <Network className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-white">Monitoring Data Mapping Studio</p>
                {activePageLabel && (
                  <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] font-semibold text-violet-300 ring-1 ring-violet-400/25">
                    {activePageLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-white/[0.45]">
                DB 수집에서 연결된 소스를 위젯 타겟으로 드래그해 데이터를 바인딩합니다.
              </p>
            </div>
          </div>

          {/* Connected source chips */}
          {sources.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/25">연결된 소스</p>
              <div className="flex flex-wrap gap-1.5">
                {sources.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 rounded-md border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[9px] font-medium text-emerald-300/80">
                    <Database className="h-2.5 w-2.5 flex-shrink-0" />
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-emerald-300/70" />
              <span className="text-[10px] text-emerald-200/70">연결된 소스를 위젯에 자동 매핑</span>
            </div>
            <button type="button" onClick={handleAutoMap} disabled={isMappingLoading}
              className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25 hover:bg-emerald-500/30 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
              {isMappingLoading ? (
                <><Loader2 className="h-3 w-3 animate-spin" />매핑 중...</>
              ) : (
                "자동 매핑"
              )}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="rounded-xl border border-white/10 bg-[#080b18]/[0.86] p-3 backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-2">
            <Metric icon={Database} label="소스" value={String(sources.length)} />
            <Metric icon={Sparkles} label="타겟" value={String(totalTargets)} />
            <Metric icon={Link2} label="연결" value={String(mappingEdges.length)} active={mappingEdges.length > 0} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[9px] text-white/[0.32]">
            <CheckCircle2 className="h-3 w-3 text-emerald-300/70" />
            <span>선 연결 즉시 위젯 설정에 반영됩니다</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-xl border border-white/10 bg-[#080b18]/[0.90] px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <Link2 className="h-3 w-3 text-emerald-300" />
          <span className="text-[10px] font-semibold text-emerald-300">연결 {mappingEdges.length}개</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          <Database className="h-3 w-3 text-sky-300/60" />
          <span className="text-[10px] text-white/[0.42]">소스 {sources.length}개</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          <Unlink className="h-3 w-3 text-white/25" />
          <span className="text-[10px] text-white/25">연결선 클릭으로 해제</span>
        </div>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.12] px-4 py-2 text-[11px] text-emerald-200 backdrop-blur-xl">
            <CheckCircle2 className="h-3.5 w-3.5" />{notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Metric({ icon: Icon, label, value, active = false }: { icon: typeof Database; label: string; value: string; active?: boolean }) {
  return (
    <div className={cn("min-w-[68px] rounded-lg border px-2.5 py-2", active ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/[0.08] bg-white/[0.035]")}>
      <div className="flex items-center gap-1.5 text-white/[0.35]"><Icon className="h-3 w-3" /><span className="text-[9px]">{label}</span></div>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
