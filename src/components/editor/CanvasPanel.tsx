"use client";

import { useCallback } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Sparkles } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { WidgetNode } from "./widgets/WidgetNode";

const NODE_TYPES = { widgetNode: WidgetNode };

export default function CanvasPanel() {
  const { nodes, edges, setNodes, setEdges, selectNode } = useEditorStore();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  // store와 ReactFlow 로컬 상태 동기화
  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      // position 변경 시 store 업데이트 (드래그 후)
      setRfNodes((nds) => {
        setNodes(nds);
        return nds;
      });
    },
    [onNodesChange, setRfNodes, setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setRfEdges((eds) => {
        const next = addEdge(connection, eds);
        setEdges(next);
        return next;
      });
    },
    [setRfEdges, setEdges]
  );

  // store nodes → ReactFlow 동기화 (새 위젯 추가 시)
  const storeNodes = useEditorStore((s) => s.nodes);
  if (storeNodes !== rfNodes && storeNodes.length !== rfNodes.length) {
    const newNode = storeNodes[storeNodes.length - 1];
    if (newNode && !rfNodes.find((n) => n.id === newNode.id)) {
      setRfNodes([...rfNodes, newNode]);
    }
    // removeNode 동기화
    if (storeNodes.length < rfNodes.length) {
      setRfNodes(storeNodes);
    }
  }

  const isEmpty = rfNodes.length === 0;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#080b14]">
      {/* 빈 상태 힌트 */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20"
            >
              <Sparkles className="h-6 w-6 text-purple-400" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/40">캔버스가 비어 있습니다</p>
              <p className="mt-1 text-[11px] text-white/20">
                좌측 채팅에서 AI에게 위젯 추가를 요청하세요
              </p>
            </div>
            {/* 그리드 패턴 힌트 */}
            <div className="mt-4 grid grid-cols-3 gap-2 opacity-15">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  className="h-10 w-20 rounded-lg border border-white/10 bg-white/5"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* React Flow 캔버스 */}
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={NODE_TYPES}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView={false}
        defaultViewport={{ x: 40, y: 40, zoom: 1 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
        <Controls
          className="!bottom-4 !right-4 !left-auto !top-auto !bg-white/5 !border-white/10 !rounded-xl overflow-hidden"
          showInteractive={false}
        />
        <MiniMap
          className="!bottom-4 !left-4 !bg-white/5 !border-white/10 !rounded-xl overflow-hidden"
          nodeColor="rgba(99,102,241,0.5)"
          maskColor="rgba(0,0,0,0.4)"
          style={{ width: 120, height: 70 }}
        />
      </ReactFlow>

      {/* 상단 상태바 */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-[10px] text-white/30 backdrop-blur-sm ring-1 ring-white/5">
          <Layers className="h-3 w-3" />
          위젯 {rfNodes.length}개
        </div>
      </div>
    </div>
  );
}
