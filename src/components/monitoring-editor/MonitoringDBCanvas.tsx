"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Bell, CheckCircle2, ChevronRight, Database,
  Loader2, Server, ShieldCheck, Sparkles, Wind, Wifi, WifiOff, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DBConnectionState = "idle" | "connecting" | "connected";

export interface MonitoringDBCanvasProps {
  dbConnectionState: DBConnectionState;
  onConnectionComplete: () => void;
}

// ─── 소스 정의 ────────────────────────────────────────────────

const DB_SOURCES = [
  {
    id: "equipment-sensor",
    name: "설비 센서 데이터",
    protocol: "OPC-UA",
    endpoint: "opc.tcp://plc-gateway:4840",
    Icon: Activity,
    color: "#f59e0b",
    fields: ["anomalyScore", "vibration", "temperature", "timeSeries", "status", "rul"],
  },
  {
    id: "environment-sensor",
    name: "환경 IoT 센서",
    protocol: "MQTT",
    endpoint: "mqtt://iot-broker:1883/env/#",
    Icon: Wind,
    color: "#38bdf8",
    fields: ["pm25", "co2", "temperature", "humidity", "gasLevel"],
  },
  {
    id: "worker-safety",
    name: "작업자 안전 시스템",
    protocol: "REST API",
    endpoint: "GET /api/v2/worker/safety",
    Icon: ShieldCheck,
    color: "#a78bfa",
    fields: ["onSiteCount", "helmetCompliance", "spo2", "heartRate"],
  },
  {
    id: "alerts-events",
    name: "알림·이벤트 스트림",
    protocol: "WebSocket",
    endpoint: "wss://event-bus:8080/stream",
    Icon: Bell,
    color: "#f43f5e",
    fields: ["alertId", "severity", "timestamp", "source"],
  },
  {
    id: "system-monitor",
    name: "시스템 헬스 모니터",
    protocol: "REST API",
    endpoint: "GET /api/v1/system/health",
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

// ─── 소스 카드 ────────────────────────────────────────────────

function DBSourceCard({
  source, status, index,
}: {
  source: typeof DB_SOURCES[number];
  status: "idle" | "connecting" | "connected";
  index: number;
}) {
  const { Icon, color, name, protocol, endpoint, fields } = source;
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

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
      {/* 헤더 */}
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

        {/* 상태 뱃지 */}
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

      {/* 엔드포인트 */}
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2">
        <Database className="h-3 w-3 shrink-0 text-white/25" />
        <code className="truncate text-[10px] text-white/40">{endpoint}</code>
      </div>

      {/* 필드 태그 */}
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

      {/* 연결 완료 라인 */}
      <AnimatePresence>
        {isConnected && (
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4 }}
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-xl origin-left bg-gradient-to-r from-emerald-400/60 to-emerald-400/10" />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────

export default function MonitoringDBCanvas({ dbConnectionState, onConnectionComplete }: MonitoringDBCanvasProps) {
  const [connectedIds, setConnectedIds] = useState<Set<SourceId>>(
    dbConnectionState === "connected" ? new Set<SourceId>(DB_SOURCES.map((s) => s.id as SourceId)) : new Set<SourceId>()
  );
  const [connectingId, setConnectingId] = useState<SourceId | null>(null);
  const [isRunning, setIsRunning] = useState(dbConnectionState === "connecting");
  const [isDone, setIsDone] = useState(dbConnectionState === "connected");

  const connectedCount = isDone ? DB_SOURCES.length : connectedIds.size;

  const handleAutoSetup = useCallback(async () => {
    if (isRunning || isDone) return;
    setIsRunning(true);

    for (const source of DB_SOURCES) {
      setConnectingId(source.id as SourceId);
      await new Promise((r) => setTimeout(r, 680));
      setConnectedIds((prev) => { const next = new Set<SourceId>(Array.from(prev)); next.add(source.id as SourceId); return next; });
      setConnectingId(null);
      await new Promise((r) => setTimeout(r, 120));
    }

    setIsRunning(false);
    setIsDone(true);
    onConnectionComplete();
  }, [isRunning, isDone, onConnectionComplete]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#050711]">
      {/* 배경 그라디언트 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.09),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(139,92,246,0.10),transparent_24%)]" />

      {/* ── 상단 헤더 ── */}
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
            <p className="text-[11px] text-white/35">수집할 DB / API / IoT 소스를 연결하세요</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 연결 현황 */}
          <div className={cn("flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-colors",
            isDone
              ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25"
              : "bg-white/[0.04] text-white/40 ring-white/[0.08]"
          )}>
            <CheckCircle2 className={cn("h-3.5 w-3.5", isDone ? "text-emerald-400" : "text-white/20")} />
            {connectedCount} / {DB_SOURCES.length} 연결됨
          </div>

          {/* 자동 세팅 버튼 */}
          <motion.button
            type="button"
            onClick={handleAutoSetup}
            disabled={isRunning || isDone}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
              isDone
                ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25 cursor-default"
                : isRunning
                ? "bg-white/[0.05] text-white/30 ring-1 ring-white/[0.08] cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500/25 to-teal-500/20 text-emerald-200 ring-1 ring-emerald-400/30 hover:from-emerald-500/35 hover:to-teal-500/30 shadow-lg shadow-emerald-900/20"
            )}
          >
            {isDone ? (
              <><CheckCircle2 className="h-3.5 w-3.5" />세팅 완료</>
            ) : isRunning ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" />연결 중...</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" />자동 세팅</>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ── 카드 그리드 ── */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {DB_SOURCES.map((source, i) => {
            const sid = source.id as SourceId;
            const status = connectedIds.has(sid)
              ? "connected"
              : connectingId === sid
              ? "connecting"
              : "idle";
            return <DBSourceCard key={source.id} source={source} status={status} index={i} />;
          })}
        </div>

        {/* 완료 후 안내 */}
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
              <div className="flex items-center gap-1 text-[11px] text-emerald-400/70">
                데이터 매핑으로 이동 <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 미연결 안내 */}
        <AnimatePresence>
          {!isDone && !isRunning && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/70" />
                <div>
                  <p className="text-[12px] font-semibold text-white/60">자동 세팅 권장</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/30">
                    "자동 세팅" 버튼을 누르면 5개 소스를 순서대로 자동 연결합니다. 연결 후 데이터 매핑 탭에서 위젯과 연결할 수 있습니다.
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
