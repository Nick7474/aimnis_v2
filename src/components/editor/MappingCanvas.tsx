"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  addEdge,
  applyNodeChanges,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type EdgeProps,
  type NodeChange,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  FileJson2,
  FolderOpen,
  Globe2,
  Link2,
  Loader2,
  Network,
  Sparkles,
  Unlink,
  UploadCloud,
  X,
} from "lucide-react";
import { useEditorStore, type MappingEdge, type MappingSource } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import DataSourceNode from "./mapping-nodes/DataSourceNode";
import WidgetTargetNode from "./mapping-nodes/WidgetTargetNode";
import type { DataSourceNodeData } from "./mapping-nodes/DataSourceNode";
import type { WidgetTargetNodeData } from "./mapping-nodes/WidgetTargetNode";
import {
  buildApiSource,
  buildDemoSource,
  extractFilesFromDrop,
  parseFilesToSources,
} from "./mappingUtils";

const NODE_TYPES = {
  dataSource: DataSourceNode,
  widgetTarget: WidgetTargetNode,
};

const EDGE_TYPES = {
  projectLine: ProjectLineEdge,
};

type MappingNodeData = DataSourceNodeData | WidgetTargetNodeData;

function ProjectLineEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  data,
}: EdgeProps) {
  const direction = targetX >= sourceX ? 1 : -1;
  const distance = Math.abs(targetX - sourceX);
  const lead = Math.max(28, Math.min(96, distance * 0.16));
  const startX = sourceX + lead * direction;
  const endX = targetX - lead * direction;
  const labelX = (startX + endX) / 2;
  const labelY = (sourceY + targetY) / 2;
  const isLatest = !!data?.isLatest;
  const path = `M ${sourceX} ${sourceY} L ${startX} ${sourceY} L ${endX} ${targetY} L ${targetX} ${targetY}`;

  return (
    <>
      <BaseEdge
        path={path}
        style={{
          stroke: "rgba(4,7,18,0.9)",
          strokeWidth: 4.5,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
      />
      <BaseEdge
        path={path}
        label={label}
        labelX={labelX}
        labelY={labelY}
        labelStyle={labelStyle}
        labelBgStyle={labelBgStyle}
        labelBgPadding={labelBgPadding}
        style={{
          ...style,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          filter: isLatest ? "drop-shadow(0 0 5px rgba(20,184,166,0.38))" : undefined,
        }}
      />
      {isLatest && (
        <circle r="2.5" fill="#14b8a6">
          <animateMotion dur="1.4s" repeatCount="indefinite" path={path} />
        </circle>
      )}
    </>
  );
}

const MOCK_BY_TYPE: Record<string, Record<string, unknown>> = {
  kpi: { value: "247", unit: "kW", trend: "+3.2%", trendUp: true, color: "#14b8a6", description: "실시간 전력 소비" },
  "chart-line": {
    chartData: [
      { name: "09:00", value: 210 }, { name: "10:00", value: 247 },
      { name: "11:00", value: 231 }, { name: "12:00", value: 268 },
      { name: "13:00", value: 255 }, { name: "14:00", value: 280 },
    ],
  },
  "chart-bar": {
    chartData: [
      { name: "월", value: 1420 }, { name: "화", value: 1580 },
      { name: "수", value: 1350 }, { name: "목", value: 1690 }, { name: "금", value: 1520 },
    ],
  },
  "chart-donut": {
    chartData: [
      { name: "PM2.5", value: 35 }, { name: "PM10", value: 28 },
      { name: "CO2", value: 420 }, { name: "기타", value: 17 },
    ],
  },
  gauge: { gaugeValue: 73, gaugeMax: 100, color: "#14b8a6" },
  "alert-panel": {
    alerts: [
      { level: "critical", msg: "Zone-A 침입 감지" },
      { level: "warning", msg: "카메라 #3 연결 불안정" },
      { level: "info", msg: "출입-B 정상 복구" },
    ],
  },
};

const DEFAULT_BINDINGS: Record<string, { source: string; field: string; property: string }> = {
  kpi: { source: "energy-sensor", field: "currentkw", property: "value" },
  "chart-line": { source: "energy-sensor", field: "timeseries", property: "chartData" },
  "chart-bar": { source: "energy-sensor", field: "dailykwh", property: "chartData" },
  "chart-donut": { source: "air-quality", field: "pm25", property: "chartData" },
  gauge: { source: "air-quality", field: "pm25", property: "gaugeValue" },
  "alert-panel": { source: "worker-safety", field: "recentalerts", property: "alerts" },
};

const CORE_PANEL_TARGETS = [
  {
    id: "core-map-monitor",
    type: "core-map",
    title: "Map 기반 모니터링",
    color: "#14b8a6",
    properties: ["markers", "alerts", "cameraStatus"],
  },
  {
    id: "core-alarm-panel",
    type: "core-alarm",
    title: "우측 알람 패널",
    color: "#f43f5e",
    properties: ["events", "severity", "sourceCamera"],
  },
  {
    id: "core-floor-status",
    type: "core-floor",
    title: "Floor Status",
    color: "#8b5cf6",
    properties: ["energyLoad", "airQuality", "workerCount"],
  },
  {
    id: "core-cctv-status",
    type: "core-cctv",
    title: "CCTV 인프라",
    color: "#38bdf8",
    properties: ["activeCameras", "alertCameras", "streamHealth"],
  },
  {
    id: "core-worker-safety",
    type: "core-worker",
    title: "작업자 안전 현황",
    color: "#22c55e",
    properties: ["onSite", "helmetCompliance", "recentAlerts"],
  },
  {
    id: "core-air-quality",
    type: "core-air",
    title: "공기질/센서 상태",
    color: "#60a5fa",
    properties: ["pm25", "co2", "temperature"],
  },
] as const;

const CORE_PANEL_BINDINGS: Array<{
  source: string;
  field: string;
  target: string;
  property: string;
}> = [
  { source: "cctv", field: "locations", target: "core-map-monitor", property: "markers" },
  { source: "cctv", field: "alertcameras", target: "core-map-monitor", property: "alerts" },
  { source: "cctv", field: "status", target: "core-map-monitor", property: "cameraStatus" },
  { source: "worker-safety", field: "recentalerts", target: "core-alarm-panel", property: "events" },
  { source: "cctv", field: "alertcameras", target: "core-alarm-panel", property: "sourceCamera" },
  { source: "energy-sensor", field: "currentkw", target: "core-floor-status", property: "energyLoad" },
  { source: "air-quality", field: "pm25", target: "core-floor-status", property: "airQuality" },
  { source: "worker-safety", field: "onsite", target: "core-floor-status", property: "workerCount" },
  { source: "cctv", field: "activecameras", target: "core-cctv-status", property: "activeCameras" },
  { source: "cctv", field: "alertcameras", target: "core-cctv-status", property: "alertCameras" },
  { source: "cctv", field: "status", target: "core-cctv-status", property: "streamHealth" },
  { source: "worker-safety", field: "onsite", target: "core-worker-safety", property: "onSite" },
  { source: "worker-safety", field: "helmetcompliance", target: "core-worker-safety", property: "helmetCompliance" },
  { source: "worker-safety", field: "recentalerts", target: "core-worker-safety", property: "recentAlerts" },
  { source: "air-quality", field: "pm25", target: "core-air-quality", property: "pm25" },
  { source: "air-quality", field: "co2", target: "core-air-quality", property: "co2" },
  { source: "air-quality", field: "temperature", target: "core-air-quality", property: "temperature" },
];

const SOURCE_POSITIONS: Record<string, { x: number; y: number }> = {
  "energy-sensor": { x: 54, y: 280 },
  cctv: { x: 56, y: 610 },
  "air-quality": { x: 390, y: 420 },
  "worker-safety": { x: 390, y: 740 },
};

const CORE_TARGET_POSITIONS: Record<string, { x: number; y: number }> = {
  "core-map-monitor": { x: 820, y: 230 },
  "core-alarm-panel": { x: 1160, y: 350 },
  "core-floor-status": { x: 820, y: 570 },
  "core-cctv-status": { x: 1160, y: 650 },
  "core-worker-safety": { x: 820, y: 900 },
  "core-air-quality": { x: 1160, y: 960 },
};

interface MappingCanvasProps {
  dataConnectors: string[];
  solutionName: string;
}

export default function MappingCanvas({ dataConnectors, solutionName }: MappingCanvasProps) {
  const {
    overlayWidgets,
    mappingSources,
    addMappingSource,
    removeMappingSource,
    mappingEdges,
    addMappingEdge,
    removeMappingEdge,
    updateOverlayWidgetData,
  } = useEditorStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [isParsing, setParsing] = useState(false);
  const [apiInput, setApiInput] = useState("GET /api/guard/events");
  const [notice, setNotice] = useState<string | null>(null);
  const [latestManualEdgeId, setLatestManualEdgeId] = useState<string | null>(null);
  const seededWidgetsRef = useRef<Set<string>>(new Set());
  const seededCoreRef = useRef(false);

  const demoSources = useMemo(
    () => dataConnectors.map(buildDemoSource),
    [dataConnectors]
  );

  const sources = useMemo(() => {
    const existing = new Set(mappingSources.map((source) => source.id));
    return [
      ...mappingSources,
      ...demoSources.filter((source) => !existing.has(source.id)),
    ];
  }, [demoSources, mappingSources]);

  const connectedSourceFields = useMemo(() => {
    const set = new Set<string>();
    mappingEdges.forEach((edge) => set.add(`${edge.sourceConnector}__${edge.sourceField}`));
    return set;
  }, [mappingEdges]);

  const connectedTargetProps = useMemo(() => {
    const map = new Map<string, Set<string>>();
    mappingEdges.forEach((edge) => {
      if (!map.has(edge.targetWidgetId)) map.set(edge.targetWidgetId, new Set());
      map.get(edge.targetWidgetId)!.add(edge.targetProperty);
    });
    return map;
  }, [mappingEdges]);

  const fieldLabels = useMemo(() => {
    const map = new Map<string, string>();
    sources.forEach((source) => {
      source.fields.forEach((field) => {
        map.set(`${source.id}__${field.id}`, field.name);
      });
    });
    return map;
  }, [sources]);

  const sourceNodes: Node<MappingNodeData>[] = useMemo(
    () =>
      sources.map((source, index) => {
        const fallbackY = source.kind === "demo" ? 118 + index * 245 : 930 + index * 245;
        const position = SOURCE_POSITIONS[source.id] ?? {
          x: source.kind === "demo" ? 54 : 220 + (index % 2) * 320,
          y: fallbackY,
        };
        return {
        id: `ds-${source.id}`,
        type: "dataSource",
        position,
        data: {
          connectorId: source.id,
          fields: source.fields,
          connectedFields: new Set(
            source.fields
              .filter((field) => connectedSourceFields.has(`${source.id}__${field.id}`))
              .map((field) => field.id)
          ),
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
    [connectedSourceFields, sources]
  );

  const widgetNodes: Node<MappingNodeData>[] = useMemo(
    () => {
      const coreNodes: Node<MappingNodeData>[] = CORE_PANEL_TARGETS.map((panel, index) => ({
        id: `wt-${panel.id}`,
        type: "widgetTarget",
        position: CORE_TARGET_POSITIONS[panel.id] ?? { x: 820, y: 118 + index * 184 },
        data: {
          widgetId: panel.id,
          widgetType: panel.type,
          title: panel.title,
          connectedProperties: connectedTargetProps.get(panel.id),
          themeColor: panel.color,
          category: "Core Panel",
          targetProperties: [...panel.properties],
        },
        draggable: true,
      }));

      const aiWidgetNodes: Node<MappingNodeData>[] = overlayWidgets.map((widget, index) => ({
        id: `wt-${widget.id}`,
        type: "widgetTarget",
        position: { x: 1460, y: 160 + index * 190 },
        data: {
          widgetId: widget.id,
          widgetType: widget.type,
          title: widget.title,
          connectedProperties: connectedTargetProps.get(widget.id),
          themeColor: widget.data.color,
          category: "AI Widget",
        },
        draggable: true,
      }));

      return [...coreNodes, ...aiWidgetNodes];
    },
    [connectedTargetProps, overlayWidgets]
  );

  const initialNodes = useMemo<Node<MappingNodeData>[]>(
    () => [...sourceNodes, ...widgetNodes],
    [sourceNodes, widgetNodes]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
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
          style: {
            stroke,
            strokeWidth: isLatest ? 2 : 1.5,
          },
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

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((current) => applyNodeChanges(changes, current));
    },
    [setNodes]
  );

  useEffect(() => {
    setNodes((current) => {
      const byId = new Map(current.map((node) => [node.id, node]));
      return initialNodes.map((node) => {
        const previous = byId.get(node.id);
        return previous
          ? { ...node, position: previous.position, selected: previous.selected }
          : node;
      });
    });
  }, [initialNodes, setNodes]);
  useEffect(() => setEdges(initialEdges), [initialEdges, setEdges]);

  useEffect(() => {
    if (seededCoreRef.current) return;
    const sourceIds = new Set(sources.map((source) => source.id));
    const available = CORE_PANEL_BINDINGS.every((binding) => sourceIds.has(binding.source));
    if (!available) return;

    CORE_PANEL_BINDINGS.forEach((binding) => {
      const edgeId = `core-${binding.source}-${binding.field}-${binding.target}-${binding.property}`;
      if (mappingEdges.some((edge) => edge.id === edgeId)) return;
      addMappingEdge({
        id: edgeId,
        sourceConnector: binding.source,
        sourceField: binding.field,
        targetWidgetId: binding.target,
        targetProperty: binding.property,
      });
    });
    seededCoreRef.current = true;
  }, [addMappingEdge, mappingEdges, sources]);

  useEffect(() => {
    overlayWidgets.forEach((widget) => {
      if (seededWidgetsRef.current.has(widget.id)) return;
      if (mappingEdges.some((edge) => edge.targetWidgetId === widget.id)) {
        seededWidgetsRef.current.add(widget.id);
        return;
      }

      const binding = DEFAULT_BINDINGS[widget.type];
      if (!binding) return;
      const source = sources.find((item) => item.id === binding.source);
      const field = source?.fields.find((item) => item.id === binding.field);
      if (!field) return;

      const edgeId = `seed-${binding.source}-${binding.field}-${widget.id}-${binding.property}`;
      const edge: MappingEdge = {
        id: edgeId,
        sourceConnector: binding.source,
        sourceField: binding.field,
        targetWidgetId: widget.id,
        targetProperty: binding.property,
      };
      addMappingEdge(edge);
      seededWidgetsRef.current.add(widget.id);
    });
  }, [addMappingEdge, mappingEdges, overlayWidgets, sources]);

  const ingestFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setParsing(true);
      try {
        const parsed = await parseFilesToSources(files);
        parsed.forEach(addMappingSource);
        setNotice(parsed.length > 0
          ? `${parsed.length}개 데이터 소스를 매핑 캔버스에 추가했습니다`
          : "JSON, YAML, TXT API 명세만 분석할 수 있습니다");
      } finally {
        setParsing(false);
        window.setTimeout(() => setNotice(null), 2600);
      }
    },
    [addMappingSource]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setDragging(false);
      const files = await extractFilesFromDrop(event);
      await ingestFiles(files);
    },
    [ingestFiles]
  );

  const handleFileInput = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      await ingestFiles(Array.from(event.target.files ?? []));
      event.target.value = "";
    },
    [ingestFiles]
  );

  const addApiEndpoint = useCallback(() => {
    if (!apiInput.trim()) return;
    addMappingSource(buildApiSource(apiInput));
    setNotice("API 엔드포인트가 소스 노드로 추가되었습니다");
    window.setTimeout(() => setNotice(null), 2200);
  }, [addMappingSource, apiInput]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.sourceHandle || !connection.targetHandle) return;

      const [sourceConnector, sourceField] = connection.sourceHandle.split("__");
      const targetParts = connection.targetHandle.split("__");
      const targetProperty = targetParts[targetParts.length - 1];
      const targetWidgetId = targetParts.slice(0, -1).join("__");
      const edgeId = `me-${sourceConnector}-${sourceField}-${targetWidgetId}-${targetProperty}`;
      const sourceLabel = fieldLabels.get(`${sourceConnector}__${sourceField}`) ?? sourceField;

      setLatestManualEdgeId(edgeId);
      addMappingEdge({ id: edgeId, sourceConnector, sourceField, targetWidgetId, targetProperty });
      setEdges((current) =>
        addEdge(
          {
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
          },
          current
        )
      );

      const widget = overlayWidgets.find((item) => item.id === targetWidgetId);
      const mockData = widget ? MOCK_BY_TYPE[widget.type] : null;
      if (widget && mockData) updateOverlayWidgetData(targetWidgetId, mockData);
    },
    [addMappingEdge, fieldLabels, overlayWidgets, setEdges, updateOverlayWidgetData]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      removeMappingEdge(edge.id);
      setEdges((current) => current.filter((item) => item.id !== edge.id));
    },
    [removeMappingEdge, setEdges]
  );

  const customSourceCount = mappingSources.length;
  const totalTargets = CORE_PANEL_TARGETS.length + overlayWidgets.length;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[#050711]",
        isDragging && "ring-2 ring-emerald-400/60"
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setDragging(false);
      }}
      onDrop={handleDrop}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(20,184,166,0.12),transparent_26%),radial-gradient(circle_at_75%_20%,rgba(139,92,246,0.13),transparent_24%)]" />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        defaultViewport={{ x: 14, y: 44, zoom: 0.7 }}
        minZoom={0.25}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
        connectionLineStyle={{ stroke: "#14b8a6", strokeWidth: 2, strokeDasharray: "5 5" }}
        defaultEdgeOptions={{
          animated: false,
          type: "projectLine",
          style: { stroke: "rgba(170,176,185,0.72)", strokeWidth: 1.5 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.045)" />
        <Controls
          className="!bottom-4 !right-4 !left-auto !top-auto !overflow-hidden !rounded-xl !border-white/10 !bg-white/5"
          showInteractive={false}
        />
      </ReactFlow>

      <div className="pointer-events-none absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] items-start gap-3">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto w-[360px] rounded-xl border border-white/10 bg-[#080b18]/[0.92] p-3 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
              <Network className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white">Data Mapping Studio</p>
              <p className="mt-1 text-[10px] leading-relaxed text-white/[0.45]">
                API 명세, JSON, 또는 폴더를 드롭하면 {solutionName} 위젯과 연결 가능한 스키마 노드로 변환됩니다.
              </p>
            </div>
          </div>

          <div
            className={cn(
              "mt-3 rounded-lg border border-dashed px-3 py-3 transition-colors",
              isDragging
                ? "border-emerald-400/70 bg-emerald-400/10"
                : "border-white/[0.12] bg-white/[0.03]"
            )}
          >
            <div className="flex items-center gap-2">
              {isParsing ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
              ) : (
                <UploadCloud className="h-4 w-4 text-emerald-300" />
              )}
              <div className="flex-1">
                <p className="text-[11px] font-medium text-white/75">
                  파일/폴더 드래그 앤 드롭
                </p>
                <p className="mt-0.5 text-[9px] text-white/[0.35]">JSON, OpenAPI, YAML, TXT</p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] text-white/[0.55] transition-colors hover:border-emerald-400/30 hover:text-emerald-200"
              >
                선택
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".json,.yaml,.yml,.txt"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex h-8 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2">
              <Globe2 className="h-3.5 w-3.5 text-white/30" />
              <input
                value={apiInput}
                onChange={(event) => setApiInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addApiEndpoint();
                }}
                className="h-full min-w-0 flex-1 bg-transparent font-mono text-[10px] text-white/70 outline-none placeholder:text-white/20"
                placeholder="GET /api/events"
              />
            </div>
            <button
              type="button"
              onClick={addApiEndpoint}
              className="flex h-8 items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20 transition-colors hover:bg-emerald-500/20"
            >
              추가
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-xl border border-white/10 bg-[#080b18]/[0.86] p-3 backdrop-blur-xl"
        >
          <div className="grid grid-cols-3 gap-2">
            <Metric icon={FileJson2} label="소스" value={String(sources.length)} />
            <Metric icon={Sparkles} label="타겟" value={String(totalTargets)} />
            <Metric icon={Link2} label="연결" value={String(mappingEdges.length)} active={mappingEdges.length > 0} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-[9px] text-white/[0.32]">
            <CheckCircle2 className="h-3 w-3 text-emerald-300/70" />
            <span>선 연결 즉시 샘플 데이터가 위젯에 반영됩니다</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-xl border border-white/10 bg-[#080b18]/[0.90] px-4 py-2 backdrop-blur-xl">
        <div className="flex items-center gap-1.5">
          <Link2 className="h-3 w-3 text-emerald-300" />
          <span className="text-[10px] font-semibold text-emerald-300">연결 {mappingEdges.length}개</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          <Braces className="h-3 w-3 text-violet-300" />
          <span className="text-[10px] text-white/[0.42]">커스텀 소스 {customSourceCount}개</span>
        </div>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-1.5">
          <Unlink className="h-3 w-3 text-white/25" />
          <span className="text-[10px] text-white/25">연결선 클릭으로 해제</span>
        </div>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.12] px-4 py-2 text-[11px] text-emerald-200 backdrop-blur-xl"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {notice}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-emerald-950/[0.18] backdrop-blur-[1px]"
          >
            <div className="flex w-[440px] flex-col items-center rounded-2xl border border-emerald-300/30 bg-[#07111d]/95 px-8 py-7 text-center shadow-2xl shadow-emerald-950/40">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30">
                <FolderOpen className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">여기에 놓으면 스키마가 생성됩니다</p>
              <p className="mt-2 text-xs leading-relaxed text-white/[0.45]">
                API 명세 폴더, OpenAPI JSON, 응답 샘플을 자동 분석해 매핑 노드로 전환합니다.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {overlayWidgets.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-20 z-10 flex justify-center">
          <div className="rounded-xl border border-violet-400/15 bg-violet-500/10 px-4 py-2 text-[11px] text-violet-200/80 backdrop-blur-xl">
            기존 AIM GUARD 패널은 이미 Core Panel로 연결되어 있습니다. AI 위젯을 추가하면 별도 타겟 노드가 더 생깁니다.
          </div>
        </div>
      )}

      {mappingSources.length > 0 && (
        <div className="absolute right-4 top-4 z-10 flex max-h-[calc(100%-7rem)] w-56 flex-col gap-2 overflow-y-auto rounded-xl border border-white/10 bg-[#080b18]/[0.86] p-2 backdrop-blur-xl">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-white/[0.35]">Imported Sources</p>
          {mappingSources.map((source) => (
            <ImportedSource key={source.id} source={source} onRemove={() => removeMappingSource(source.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  active = false,
}: {
  icon: typeof FileJson2;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className={cn(
      "min-w-[68px] rounded-lg border px-2.5 py-2",
      active ? "border-emerald-400/20 bg-emerald-400/10" : "border-white/[0.08] bg-white/[0.035]"
    )}>
      <div className="flex items-center gap-1.5 text-white/[0.35]">
        <Icon className="h-3 w-3" />
        <span className="text-[9px]">{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function ImportedSource({ source, onRemove }: { source: MappingSource; onRemove: () => void }) {
  const Icon = source.kind === "folder" ? FolderOpen : source.kind === "api" ? Globe2 : FileJson2;
  return (
    <div className="group rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-2">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-300/80" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium text-white/70">{source.name}</p>
          <p className="mt-0.5 text-[9px] text-white/30">{source.fields.length} fields</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md text-white/25 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-300 group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
