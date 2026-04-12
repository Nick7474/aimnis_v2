"use client";

import { useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { useEditorStore } from "@/store/editorStore";
import type { SolutionTemplate } from "@/lib/solutionLoader";

interface CanvasPanelProps {
  template: SolutionTemplate | null;
  primaryColor: string;
}

// ─── 커스텀 노드 스타일 ───────────────────────────────────────

function StyledNode({ data }: { data: { label: string; color?: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="min-w-[140px] rounded-xl border border-teal-500/30 bg-[#0d1f3c] px-4 py-3 shadow-lg"
      style={{ borderColor: `${data.color ?? "#14b8a6"}40` }}
    >
      <div
        className="mb-1 h-1.5 w-8 rounded-full"
        style={{ backgroundColor: data.color ?? "#14b8a6" }}
      />
      <p className="text-xs font-medium text-white/80">{data.label}</p>
    </motion.div>
  );
}

const NODE_TYPES = {
  chartWidget: StyledNode,
  kpiWidget: StyledNode,
  mapWidget: StyledNode,
  alertWidget: StyledNode,
  default: StyledNode,
};

export default function CanvasPanel({ template, primaryColor }: CanvasPanelProps) {
  const { nodes, edges, setNodes, setEdges, selectNode } = useEditorStore();

  // 템플릿에서 초기 노드/엣지 로드
  useEffect(() => {
    if (!template) return;
    const coloredNodes = template.nodes.map((n) => ({
      ...n,
      data: { ...n.data, color: primaryColor },
    }));
    setNodes(coloredNodes);
    setEdges(template.edges);
  }, [template, primaryColor, setNodes, setEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e1e3a" gap={24} size={1} />
        <Controls
          className="[&>button]:border-white/10 [&>button]:bg-white/5 [&>button]:text-white/50 [&>button:hover]:bg-white/10"
        />
        <MiniMap
          nodeColor={() => primaryColor + "80"}
          maskColor="rgba(10,10,15,0.7)"
          className="!border-white/10 !bg-[#0a0a0f]"
        />
      </ReactFlow>
    </div>
  );
}
