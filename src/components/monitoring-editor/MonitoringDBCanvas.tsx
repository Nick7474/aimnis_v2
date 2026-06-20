"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, CheckCircle2, ChevronRight, Database,
  Loader2, Plus, Server, ShieldCheck, Sparkles, Wind, Wifi, WifiOff, Zap,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DBConnectionState = "idle" | "connecting" | "connected";

export interface MonitoringDBCanvasProps {
  initialConnectedIds?: Set<string>;
  onSourceConnect: (id: string, name: string, endpoint: string, fields?: string[]) => void;
  onNavigateToMapping: () => void;
}

interface CustomDBSource {
  id: string;
  name: string;
  protocol: string;
  endpoint: string;
  fields: string[];
  color: string;
}

const PROTOCOL_OPTIONS = ["OPC-UA", "MQTT", "REST API", "WebSocket", "gRPC", "Kafka"] as const;
const CUSTOM_COLORS = ["#c084fc", "#fb923c", "#34d399", "#60a5fa", "#f472b6", "#a3e635"];

const DB_SOURCES = [
  {
    id: "equipment-sensor",
    name: "설비 센서 데이터",
    protocol: "OPC-UA",
    presetEndpoint: "opc.tcp://plc-gateway:4840",
    placeholder: "opc.tcp://host:port",
    Icon: Activity,
    color: "#f59e0b",
    fields: ["anomalyScore", "vibration", "temperature", "timeSeries", "status", "rul"],
  },
  {
    id: "environment-sensor",
    name: "환경 IoT 센서",
    protocol: "MQTT",
    presetEndpoint: "mqtt://iot-broker:1883/env/#",
    placeholder: "mqtt://broker:port/topic",
    Icon: Wind,
    color: "#38bdf8",
    fields: ["pm25", "co2", "temperature", "humidity", "gasLevel"],
  },
  {
    id: "worker-safety",
    name: "작업자 안전 시스템",
    protocol: "REST API",
    presetEndpoint: "GET /api/v2/worker/safety",
    placeholder: "GET /api/v1/...",
    Icon: ShieldCheck,
    color: "#a78bfa",
    fields: ["onSiteCount", "helmetCompliance", "spo2", "heartRate"],
  },
  {
    id: "alerts-events",
    name: "알림·이벤트 스트림",
    protocol: "WebSocket",
    presetEndpoint: "wss://event-bus:8080/stream",
    placeholder: "wss://host:port/path",
    Icon: Bell,
    color: "#f43f5e",
    fields: ["alertId", "severity", "timestamp", "source"],
  },
  {
    id: "system-monitor",
    name: "시스템 헬스 모니터",
    protocol: "REST API",
    presetEndpoint: "GET /api/v1/system/health",
    placeholder: "GET /api/v1/...",
    Icon: Server,
    color: "#10b981",
    fields: ["serverHealth", "networkLatency", "activeConnections"],
  },
] as const;

type SourceId = (typeof DB_SOURCES)[number]["id"];

const PROTOCOL_COLORS: Record<string, string> = {
  "OPC-UA":    "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  "MQTT":      "bg-sky-400/10 text-sky-300 ring-sky-400/20",
  "REST API":  "bg-violet-400/10 text-violet-300 ring-violet-400/20",
  "WebSocket": "bg-rose-400/10 text-rose-300 ring-rose-400/20",
};

function DBSourceCard({
  source, status, index, endpointValue, onEndpointChange, onConnect, connectDisabled,
}: {
  source: typeof DB_SOURCES[number];
  status: "idle" | "connecting" | "connected";
  index: number;
  endpointValue: string;
  onEndpointChange: (v: string) => void;
  onConnect: () => void;
  connectDisabled: boolean;
}) {
  const { Icon, color, name, protocol, placeholder, fields } = source;
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const canConnect = endpointValue.trim().length > 0 && !connectDisabled && !isConnecting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-500",
        isConnected
          ? "border-emerald-400/30 bg-emerald-400/[0.04]"
          : isConnecting
          ? "border-amber-400/25 bg-amber-400/[0.03]"
          : "border-white/[0.08] bg-white/[0.02]"
      )}
      style={isConnected ? { boxShadow: `0 0 22px rgba(16,185,129,0.09)` } : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{name}</p>
            <span className={cn("mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold ring-1", PROTOCOL_COLORS[protocol] ?? "bg-white/5 text-white/40 ring-white/10")}>
              {protocol}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div key="connected" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 ring-1 ring-emerald-400/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-300">연결됨</span>
            </motion.div>
          ) : isConnecting ? (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 ring-1 ring-amber-400/20">
              <Loader2 className="h-3 w-3 animate-spin text-amber-300" />
              <span className="text-[10px] font-semibold text-amber-300">연결 중</span>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 ring-1 ring-white/[0.08]">
              <WifiOff className="h-3 w-3 text-white/25" />
              <span className="text-[10px] text-white/30">미연결</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Endpoint area */}
      {isConnected ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-2">
          <Database className="h-3 w-3 shrink-0 text-emerald-400/60" />
          <code className="truncate text-[10px] text-emerald-300/70">{endpointValue}</code>
        </div>
      ) : (
        <div className={cn(
          "flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors",
          isConnecting ? "border-amber-400/20 bg-amber-400/[0.03]" : "border-white/[0.08] bg-black/20"
        )}>
          <Database className="h-3 w-3 shrink-0 text-white/25" />
          <input
            type="text"
            value={endpointValue}
            onChange={(e) => onEndpointChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && canConnect) onConnect(); }}
            placeholder={placeholder}
            disabled={isConnecting || connectDisabled}
            className="min-w-0 flex-1 bg-transparent font-mono text-[10px] text-white/70 outline-none placeholder:text-white/20 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* Field tags */}
      <div className="flex flex-wrap gap-1.5">
        {fields.slice(0, 4).map((f) => (
          <span key={f} className={cn("rounded-md px-2 py-0.5 text-[9px] font-mono transition-colors",
            isConnected ? "bg-emerald-400/10 text-emerald-300/80" : "bg-white/[0.04] text-white/25"
          )}>{f}</span>
        ))}
        {fields.length > 4 && (
          <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/20">+{fields.length - 4}개</span>
        )}
      </div>

      {/* Manual connect button (only when not connected) */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <motion.button
              type="button"
              onClick={onConnect}
              disabled={!canConnect}
              whileTap={canConnect ? { scale: 0.97 } : undefined}
              className={cn(
                "mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold transition-all",
                isConnecting
                  ? "bg-amber-400/[0.08] text-amber-300/50 cursor-not-allowed"
                  : !canConnect
                  ? "bg-white/[0.03] text-white/20 cursor-not-allowed ring-1 ring-white/[0.05]"
                  : "bg-white/[0.06] text-white/60 ring-1 ring-white/[0.10] hover:bg-emerald-500/15 hover:text-emerald-200 hover:ring-emerald-400/25"
              )}
            >
              {isConnecting ? (
                <><Loader2 className="h-3 w-3 animate-spin" />연결 중...</>
              ) : (
                <><Link2 className="h-3 w-3" />연결{!endpointValue.trim() && <span className="ml-1 text-[9px] text-white/25">(주소 입력 필요)</span>}</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connected bottom line */}
      <AnimatePresence>
        {isConnected && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4 }}
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl origin-left bg-gradient-to-r from-emerald-400/60 to-emerald-400/10" />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MonitoringDBCanvas({
  initialConnectedIds,
  onSourceConnect,
  onNavigateToMapping,
}: MonitoringDBCanvasProps) {
  const [connectedIds, setConnectedIds] = useState<Set<string>>(() =>
    initialConnectedIds ? new Set<string>(Array.from(initialConnectedIds)) : new Set<string>()
  );
  const [endpointValues, setEndpointValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    DB_SOURCES.forEach((s) => { init[s.id] = ""; });
    if (initialConnectedIds) {
      DB_SOURCES.forEach((s) => { if (initialConnectedIds.has(s.id)) init[s.id] = s.presetEndpoint; });
    }
    return init;
  });
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [isAutoRunning, setIsAutoRunning] = useState(false);

  // 커스텀 소스 상태
  const [customSources, setCustomSources] = useState<CustomDBSource[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", protocol: "REST API", endpoint: "", fieldsStr: "" });

  const isDone = useMemo(() => connectedIds.size >= DB_SOURCES.length, [connectedIds]);
  const connectedCount = connectedIds.size;

  const handleManualConnect = useCallback(async (id: SourceId) => {
    if (connectingId !== null || connectedIds.has(id)) return;
    if (!endpointValues[id].trim()) return;
    const source = DB_SOURCES.find((s) => s.id === id);
    setConnectingId(id);
    await new Promise((r) => setTimeout(r, 720));
    setConnectedIds((prev) => { const next = new Set<string>(Array.from(prev)); next.add(id); return next; });
    onSourceConnect(id, source?.name ?? id, endpointValues[id], source ? [...source.fields] : undefined);
    setConnectingId(null);
  }, [connectingId, connectedIds, endpointValues, onSourceConnect]);

  const handleCustomConnect = useCallback(async (cid: string) => {
    if (connectingId !== null || connectedIds.has(cid)) return;
    const src = customSources.find((s) => s.id === cid);
    if (!src || !src.endpoint.trim()) return;
    setConnectingId(cid);
    await new Promise((r) => setTimeout(r, 750));
    setConnectedIds((prev) => { const next = new Set<string>(Array.from(prev)); next.add(cid); return next; });
    onSourceConnect(cid, src.name, src.endpoint, src.fields);
    setConnectingId(null);
  }, [connectingId, connectedIds, customSources, onSourceConnect]);

  const handleAddFormSubmit = useCallback(() => {
    const name = addForm.name.trim();
    const endpoint = addForm.endpoint.trim();
    if (!name || !endpoint) return;
    const newId = `custom-${Date.now()}`;
    const fields = addForm.fieldsStr.split(",").map((f) => f.trim()).filter(Boolean);
    const color = CUSTOM_COLORS[customSources.length % CUSTOM_COLORS.length];
    setCustomSources((prev) => [...prev, { id: newId, name, protocol: addForm.protocol, endpoint, fields: fields.length ? fields : ["value"], color }]);
    setEndpointValues((prev) => ({ ...prev, [newId]: endpoint }));
    setAddForm({ name: "", protocol: "REST API", endpoint: "", fieldsStr: "" });
    setShowAddForm(false);
  }, [addForm, customSources.length]);

  const handleAutoSetup = useCallback(async () => {
    if (isAutoRunning || isDone) return;
    setIsAutoRunning(true);
    for (const source of DB_SOURCES) {
      const sid = source.id;
      if (connectedIds.has(sid)) continue;
      setEndpointValues((prev) => ({ ...prev, [sid]: source.presetEndpoint }));
      await new Promise((r) => setTimeout(r, 80));
      setConnectingId(sid);
      await new Promise((r) => setTimeout(r, 680));
      setConnectedIds((prev) => { const next = new Set<string>(Array.from(prev)); next.add(sid); return next; });
      onSourceConnect(sid, source.name, source.presetEndpoint, [...source.fields]);
      setConnectingId(null);
      await new Promise((r) => setTimeout(r, 100));
    }
    setIsAutoRunning(false);
  }, [connectedIds, isDone, isAutoRunning, onSourceConnect]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050711]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.09),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(139,92,246,0.10),transparent_24%)]" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#080b18]/80 px-6 py-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20">
            <Wifi className="h-4 w-4 text-emerald-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">데이터 소스 연결</p>
            <p className="text-[11px] text-white/35">수집할 DB / API / IoT 소스 주소를 입력하거나 자동 세팅을 이용하세요</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-colors",
            isDone
              ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25"
              : "bg-white/[0.04] text-white/40 ring-white/[0.08]"
          )}>
            <CheckCircle2 className={cn("h-3.5 w-3.5", isDone ? "text-emerald-400" : "text-white/20")} />
            {connectedCount} / {DB_SOURCES.length} 연결됨
          </div>

          <motion.button
            type="button"
            onClick={handleAutoSetup}
            disabled={isAutoRunning || isDone}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
              isDone
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25 cursor-default"
                : isAutoRunning
                ? "bg-white/[0.05] text-white/30 ring-1 ring-white/[0.08] cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500/25 to-teal-500/20 text-emerald-200 ring-1 ring-emerald-400/30 hover:from-emerald-500/35 hover:to-teal-500/30 shadow-lg shadow-emerald-900/20"
            )}
          >
            {isDone ? (
              <><CheckCircle2 className="h-3.5 w-3.5" />세팅 완료</>
            ) : isAutoRunning ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />연결 중...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" />자동 세팅</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Card grid */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {DB_SOURCES.map((source, i) => {
            const sid = source.id;
            const status = connectedIds.has(sid) ? "connected" : connectingId === sid ? "connecting" : "idle";
            return (
              <DBSourceCard
                key={source.id}
                source={source}
                status={status}
                index={i}
                endpointValue={endpointValues[sid] ?? ""}
                onEndpointChange={(v) => setEndpointValues((prev) => ({ ...prev, [sid]: v }))}
                onConnect={() => handleManualConnect(sid)}
                connectDisabled={isAutoRunning || connectingId !== null}
              />
            );
          })}

          {/* 커스텀 소스 카드 */}
          {customSources.map((cs, i) => {
            const status = connectedIds.has(cs.id) ? "connected" : connectingId === cs.id ? "connecting" : "idle";
            return (
              <motion.div
                key={cs.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative flex flex-col gap-3 rounded-xl border p-4 transition-all duration-500",
                  status === "connected" ? "border-emerald-400/30 bg-emerald-400/[0.04]"
                  : status === "connecting" ? "border-amber-400/25 bg-amber-400/[0.03]"
                  : "border-violet-400/20 bg-violet-400/[0.02]"
                )}
                style={status === "connected" ? { boxShadow: "0 0 22px rgba(16,185,129,0.09)" } : undefined}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${cs.color}18`, border: `1px solid ${cs.color}30` }}>
                      <Database className="h-4 w-4" style={{ color: cs.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">{cs.name}</p>
                      <span className={cn("mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold ring-1", PROTOCOL_COLORS[cs.protocol] ?? "bg-white/5 text-white/40 ring-white/10")}>{cs.protocol}</span>
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    {status === "connected" ? (
                      <motion.div key="c" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 ring-1 ring-emerald-400/25">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-semibold text-emerald-300">연결됨</span>
                      </motion.div>
                    ) : status === "connecting" ? (
                      <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 ring-1 ring-amber-400/20">
                        <Loader2 className="h-3 w-3 animate-spin text-amber-300" />
                        <span className="text-[10px] font-semibold text-amber-300">연결 중</span>
                      </motion.div>
                    ) : (
                      <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-violet-400/[0.07] px-2.5 py-1 ring-1 ring-violet-400/20">
                        <WifiOff className="h-3 w-3 text-violet-400/50" />
                        <span className="text-[10px] text-violet-300/50">미연결</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2",
                  status === "connected" ? "border-emerald-400/15 bg-emerald-400/[0.04]" : "border-white/[0.06] bg-black/20"
                )}>
                  <Database className="h-3 w-3 shrink-0 text-white/25" />
                  <code className="truncate text-[10px] text-white/40">{cs.endpoint}</code>
                </div>
                {cs.fields.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cs.fields.slice(0, 4).map((f) => (
                      <span key={f} className={cn("rounded-md px-2 py-0.5 text-[9px] font-mono",
                        status === "connected" ? "bg-emerald-400/10 text-emerald-300/80" : "bg-white/[0.04] text-white/25"
                      )}>{f}</span>
                    ))}
                    {cs.fields.length > 4 && <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/20">+{cs.fields.length - 4}개</span>}
                  </div>
                )}
                {status !== "connected" && (
                  <motion.button type="button" onClick={() => handleCustomConnect(cs.id)}
                    disabled={connectingId !== null || status === "connecting"}
                    whileTap={{ scale: 0.97 }}
                    className={cn("mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-semibold transition-all",
                      status === "connecting" ? "bg-amber-400/[0.08] text-amber-300/50 cursor-not-allowed"
                      : connectingId !== null ? "bg-white/[0.03] text-white/20 cursor-not-allowed ring-1 ring-white/[0.05]"
                      : "bg-violet-500/10 text-violet-300/70 ring-1 ring-violet-400/20 hover:bg-violet-500/20 hover:text-violet-200"
                    )}>
                    {status === "connecting" ? <><Loader2 className="h-3 w-3 animate-spin" />연결 중...</> : <><Link2 className="h-3 w-3" />연결</>}
                  </motion.button>
                )}
                {status === "connected" && (
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4 }}
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl origin-left bg-gradient-to-r from-emerald-400/60 to-emerald-400/10" />
                )}
              </motion.div>
            );
          })}

          {/* 소스 추가 카드 / 폼 */}
          {!showAddForm ? (
            <motion.button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex h-full min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.1] text-white/25 transition-all hover:border-violet-400/30 hover:bg-violet-400/[0.03] hover:text-violet-300/60"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-medium">소스 추가</span>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-3 rounded-xl border border-violet-400/25 bg-violet-400/[0.04] p-4"
            >
              <p className="text-[11px] font-semibold text-violet-200">새 데이터 소스</p>
              <input value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="소스 이름 (예: 생산 MES)" maxLength={30}
                className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[11px] text-white/80 outline-none placeholder:text-white/20 focus:border-violet-400/40" />
              <select value={addForm.protocol} onChange={(e) => setAddForm((p) => ({ ...p, protocol: e.target.value }))}
                className="rounded-lg border border-white/[0.08] bg-[#0a0c18] px-3 py-2 text-[11px] text-white/70 outline-none focus:border-violet-400/40">
                {PROTOCOL_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input value={addForm.endpoint} onChange={(e) => setAddForm((p) => ({ ...p, endpoint: e.target.value }))}
                placeholder="엔드포인트 (예: GET /api/v1/mes/status)"
                className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 font-mono text-[10px] text-white/70 outline-none placeholder:text-white/20 focus:border-violet-400/40" />
              <input value={addForm.fieldsStr} onChange={(e) => setAddForm((p) => ({ ...p, fieldsStr: e.target.value }))}
                placeholder="데이터 필드 (쉼표 구분: value, status, count)"
                className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[10px] text-white/70 outline-none placeholder:text-white/20 focus:border-violet-400/40" />
              <div className="flex gap-2">
                <button type="button" onClick={handleAddFormSubmit}
                  disabled={!addForm.name.trim() || !addForm.endpoint.trim()}
                  className="flex-1 rounded-lg bg-violet-500/20 py-1.5 text-[11px] font-semibold text-violet-200 ring-1 ring-violet-400/30 transition-colors hover:bg-violet-500/30 disabled:cursor-not-allowed disabled:opacity-40">
                  추가
                </button>
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/40 ring-1 ring-white/[0.08] transition-colors hover:text-white/60">
                  취소
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Completion banner */}
        <AnimatePresence>
          {isDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-5 flex items-center justify-between rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-3.5"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-sm text-emerald-200 font-medium">모든 소스 연결 완료 — 데이터 매핑 탭에서 위젯에 연결하세요</span>
              </div>
              <motion.button
                type="button"
                onClick={onNavigateToMapping}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1 text-[11px] text-emerald-400/70 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                데이터 매핑으로 이동 <ChevronRight className="h-3.5 w-3.5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint when not yet running */}
        <AnimatePresence>
          {!isDone && !isAutoRunning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/70" />
                <div>
                  <p className="text-[12px] font-semibold text-white/60">자동 세팅 또는 수동 연결</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/30">
                    각 카드에 소스 주소를 직접 입력 후 "연결" 버튼으로 개별 연결하거나, 우측 상단 "자동 세팅"으로 데모 주소를 자동 입력 및 연결할 수 있습니다.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
