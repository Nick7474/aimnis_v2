"use client";

import { motion } from "framer-motion";
import { Link2, Sparkles, ChevronRight } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";

interface MappingPanelProps {
  dataConnectors: string[];
}

const FIELD_SUGGESTIONS: Record<string, string[]> = {
  "energy-sensor": ["currentKw", "peakKw", "dailyKwh", "timeSeries", "kpi"],
  "cctv": ["locations", "activeCameras", "alertCameras"],
  "air-quality": ["pm25", "pm10", "co2", "temperature", "humidity"],
  "worker-safety": ["onSite", "helmetCompliance", "recentAlerts"],
  "carbon-tracker": ["dailyCo2", "monthlyCo2", "reduction"],
  "energy-meter": ["consumption", "efficiency", "renewable"],
  "esg-reporter": ["score", "grade", "targets"],
};

export default function MappingPanel({ dataConnectors }: MappingPanelProps) {
  const { nodes, selectedNodeId, mappings, updateMapping } = useEditorStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Link2 className="h-4 w-4 text-white/30" />
        </div>
        <p className="text-xs text-white/30">
          캔버스에서 위젯을 선택하면<br />API 매핑을 편집할 수 있습니다
        </p>
      </div>
    );
  }

  const mapping = mappings[selectedNode.id] ?? {};
  const selectedConnector = mapping.dataConnector ?? dataConnectors[0] ?? "";
  const suggestions = FIELD_SUGGESTIONS[selectedConnector] ?? [];

  return (
    <div className="flex h-full flex-col overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-4">
        {/* 선택된 위젯 */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-[10px] text-white/30 mb-1">선택된 위젯</p>
          <p className="text-sm font-medium text-white">
            {String(selectedNode.data?.label ?? selectedNode.id)}
          </p>
          <p className="text-[10px] text-white/40 mt-0.5">{selectedNode.type}</p>
        </div>

        {/* 데이터 소스 */}
        <div>
          <p className="mb-2 text-[10px] font-medium text-white/40 uppercase tracking-wider">데이터 소스</p>
          <div className="space-y-1">
            {dataConnectors.map((connector) => (
              <button
                key={connector}
                onClick={() => updateMapping(selectedNode.id, { dataConnector: connector })}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-all",
                  selectedConnector === connector
                    ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                <span>{connector}</span>
                {selectedConnector === connector && <ChevronRight className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>

        {/* 자동 추천 필드 */}
        {suggestions.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-wider">AI 추천 필드</p>
            </div>
            <div className="space-y-1.5">
              {suggestions.map((field) => {
                const bound = mapping.fieldBindings?.[field];
                return (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
                  >
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full flex-shrink-0",
                      bound ? "bg-emerald-400" : "bg-white/20"
                    )} />
                    <span className="flex-1 font-mono text-[10px] text-white/60">{field}</span>
                    <button
                      onClick={() =>
                        updateMapping(selectedNode.id, {
                          fieldBindings: {
                            ...mapping.fieldBindings,
                            [field]: bound ? "" : `data.${field}`,
                          },
                        })
                      }
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] transition-all",
                        bound
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/10 text-white/30 hover:bg-purple-500/20 hover:text-purple-300"
                      )}
                    >
                      {bound ? "연결됨" : "연결"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
