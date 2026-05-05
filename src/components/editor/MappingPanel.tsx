"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Sparkles, ChevronDown, ChevronRight, Check, Zap, Network } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import type { WidgetData } from "@/store/editorStore";

interface MappingPanelProps {
  dataConnectors: string[];
}

// ── 데이터 소스 필드 정의 ─────────────────────────────────────

const SOURCE_FIELDS: Record<string, string[]> = {
  "energy-sensor": ["currentKw", "peakKw", "dailyKwh", "timeSeries", "kpi", "voltage", "current"],
  "cctv":          ["locations", "activeCameras", "alertCameras", "cameraId", "status"],
  "air-quality":   ["pm25", "pm10", "co2", "temperature", "humidity"],
  "worker-safety": ["onSite", "helmetCompliance", "recentAlerts", "workerId", "zone"],
};

// ── 위젯 타입별 AI 추천 필드 ──────────────────────────────────

const WIDGET_RECS: Record<string, string[]> = {
  kpi:           ["currentKw", "peakKw", "kpi"],
  "chart-line":  ["timeSeries", "dailyKwh"],
  "chart-bar":   ["dailyKwh", "consumption"],
  "chart-donut": ["pm25", "pm10", "co2"],
  gauge:         ["currentKw", "voltage"],
  "alert-panel": ["recentAlerts", "alertCameras"],
  table:         ["currentKw", "peakKw", "dailyKwh"],
  map:           ["locations", "activeCameras"],
};

// ── 연결 시 Mock 데이터 ───────────────────────────────────────

const MOCK_BY_TYPE: Record<string, WidgetData> = {
  kpi: {
    value: "247", unit: "kW", trend: "+3.2%", trendUp: true,
    color: "#14b8a6", description: "실시간 전력 소비",
  },
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
      { name: "수", value: 1350 }, { name: "목", value: 1690 },
      { name: "금", value: 1520 },
    ],
  },
  "chart-donut": {
    chartData: [
      { name: "PM2.5", value: 35 }, { name: "PM10", value: 28 },
      { name: "CO₂", value: 420 }, { name: "기타", value: 17 },
    ],
  },
  gauge: { gaugeValue: 73, gaugeMax: 100, color: "#14b8a6" },
  "alert-panel": {
    alerts: [
      { level: "critical", msg: "Zone-A 침입 감지" },
      { level: "warning",  msg: "카메라 #3 연결 불안정" },
      { level: "info",     msg: "출입-B 정상 복구" },
    ],
  },
};

// ── 데이터 소스 아코디언 아이템 ───────────────────────────────

interface SourceItemProps {
  source: string;
  isOpen: boolean;
  onToggle: () => void;
  connectedFields: Set<string>;
  onConnect: (field: string) => void;
  widgetType: string;
}

function SourceItem({ source, isOpen, onToggle, connectedFields, onConnect, widgetType }: SourceItemProps) {
  const fields = SOURCE_FIELDS[source] ?? [];
  const recs = new Set(WIDGET_RECS[widgetType] ?? []);

  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.03]">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-500/15">
          <Zap className="h-2.5 w-2.5 text-purple-400" />
        </div>
        <span className="flex-1 text-xs font-medium text-white/70">{source}</span>
        <span className="text-[10px] text-white/25">{fields.length}개 필드</span>
        {isOpen ? (
          <ChevronDown className="h-3 w-3 text-white/30" />
        ) : (
          <ChevronRight className="h-3 w-3 text-white/30" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="flex flex-col gap-0.5 p-2">
              {fields.map((field) => {
                const connected = connectedFields.has(field);
                const recommended = recs.has(field);
                return (
                  <div
                    key={field}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5"
                  >
                    {connected ? (
                      <Check className="h-2.5 w-2.5 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-white/15" />
                    )}
                    <span className={cn(
                      "flex-1 font-mono text-[10px]",
                      connected ? "text-emerald-300" : "text-white/50"
                    )}>
                      {field}
                    </span>
                    {recommended && !connected && (
                      <span className="rounded px-1 py-0.5 text-[8px] font-semibold bg-purple-500/15 text-purple-400">
                        AI 추천
                      </span>
                    )}
                    <button
                      onClick={() => onConnect(field)}
                      className={cn(
                        "rounded px-2 py-0.5 text-[9px] font-medium transition-all",
                        connected
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/[0.08] text-white/[0.35] hover:bg-purple-500/20 hover:text-purple-300"
                      )}
                    >
                      {connected ? "연결됨" : "연결"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────

export default function MappingPanel({ dataConnectors: _dataConnectors }: MappingPanelProps) {
  const {
    selectedElement,
    overlayWidgets,
    mappings,
    mappingEdges,
    updateMapping,
    updateOverlayWidgetData,
    setCenterView,
  } = useEditorStore();

  const [openSource, setOpenSource] = useState<string | null>("energy-sensor");

  // 선택된 오버레이 위젯 찾기
  const widget = overlayWidgets.find((w) => w.id === selectedElement?.sectionId);

  if (!widget) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Link2 className="h-4 w-4 text-white/30" />
        </div>
        <p className="text-xs text-white/30">
          캔버스에서 위젯을 선택하면<br />연결 상태를 확인할 수 있습니다
        </p>
        <button
          type="button"
          onClick={() => setCenterView("mapping")}
          className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/15"
        >
          <Network className="h-3 w-3" />
          데이터 매핑 스튜디오 열기
        </button>
      </div>
    );
  }

  const mapping = mappings[widget.id] ?? {};
  const connectedFields = new Set<string>(
    Object.entries(mapping.fieldBindings ?? {})
      .filter(([, v]) => !!v)
      .map(([k]) => k)
  );
  const totalConnected = connectedFields.size;

  const handleConnect = (field: string) => {
    const alreadyConnected = connectedFields.has(field);
    // 토글
    updateMapping(widget.id, {
      fieldBindings: {
        ...mapping.fieldBindings,
        [field]: alreadyConnected ? "" : `data.${field}`,
      },
    });
    // 첫 연결 시 위젯 데이터를 Mock으로 업데이트
    if (!alreadyConnected && totalConnected === 0) {
      updateOverlayWidgetData(widget.id, MOCK_BY_TYPE[widget.type] ?? {});
    }
  };

  const sources = Object.keys(SOURCE_FIELDS);

  return (
    <div className="flex h-full flex-col overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-4 p-4">

        {/* 선택된 위젯 헤더 */}
        <motion.div
          key={widget.id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-brand-500/20 bg-brand-500/8 p-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/30">선택된 위젯</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{widget.title}</p>
              <p className="text-[10px] text-brand-400/70">{widget.type}</p>
            </div>
            {totalConnected > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1.5">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
                <span className="text-[10px] font-semibold text-emerald-400">
                  {totalConnected}개 연결됨
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <button
          type="button"
          onClick={() => setCenterView("mapping")}
          className="flex items-center justify-between rounded-xl border border-emerald-400/[0.18] bg-emerald-500/[0.08] px-3 py-2.5 text-left transition-colors hover:bg-emerald-500/[0.12]"
        >
          <span className="flex items-center gap-2">
            <Network className="h-3.5 w-3.5 text-emerald-300" />
            <span>
              <span className="block text-[11px] font-semibold text-emerald-200">
                시각 매핑 캔버스
              </span>
              <span className="block text-[9px] text-emerald-100/[0.45]">
                파일/폴더 드롭 후 선으로 연결
              </span>
            </span>
          </span>
          <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-[9px] font-semibold text-emerald-300">
            {mappingEdges.length} links
          </span>
        </button>

        {/* AI 추천 필드 */}
        {(WIDGET_RECS[widget.type]?.length ?? 0) > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                AI 추천 필드
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              {(WIDGET_RECS[widget.type] ?? []).map((field, i) => {
                const connected = connectedFields.has(field);
                return (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                      connected
                        ? "border-emerald-500/25 bg-emerald-500/8"
                        : "border-white/[0.06] bg-white/[0.03]"
                    )}
                  >
                    <div className={cn(
                      "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                      connected ? "bg-emerald-400" : "bg-white/20"
                    )} />
                    <span className={cn(
                      "flex-1 font-mono text-[10px]",
                      connected ? "text-emerald-300" : "text-white/60"
                    )}>
                      {field}
                    </span>
                    <button
                      onClick={() => handleConnect(field)}
                      className={cn(
                        "rounded px-2 py-0.5 text-[9px] font-medium transition-all",
                        connected
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/[0.08] text-white/[0.35] hover:bg-purple-500/20 hover:text-purple-300"
                      )}
                    >
                      {connected ? "연결됨" : "연결"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* 데이터 소스 아코디언 */}
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/40">
            데이터 소스
          </p>
          <div className="flex flex-col gap-1.5">
            {sources.map((src) => (
              <SourceItem
                key={src}
                source={src}
                isOpen={openSource === src}
                onToggle={() => setOpenSource(openSource === src ? null : src)}
                connectedFields={connectedFields}
                onConnect={handleConnect}
                widgetType={widget.type}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
