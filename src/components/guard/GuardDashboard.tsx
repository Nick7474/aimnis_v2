"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  Shield, ArrowLeft, Activity, AlertTriangle, CheckCircle2,
  Wifi, Thermometer, Wind, Users, Camera, Zap, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── 타입 ─────────────────────────────────────────────────────

interface GuardData {
  overview: {
    systemStatus: string;
    totalSensors: number;
    activeSensors: number;
    alertCount: number;
    warningCount: number;
    uptime: string;
  };
  energySensor: {
    currentKw: number;
    peakKw: number;
    dailyKwh: number;
    monthlyKwh: number;
    efficiency: number;
    timeSeries: Array<{ time: string; kw: number }>;
  };
  cctv: {
    totalCameras: number;
    activeCameras: number;
    alertCameras: number;
    locations: Array<{
      id: string; name: string; x: number; y: number;
      status: "normal" | "alert" | "offline"; floor: number;
    }>;
  };
  airQuality: {
    overall: string;
    pm25: number;
    pm10: number;
    co2: number;
    temperature: number;
    humidity: number;
  };
  workerSafety: {
    totalWorkers: number;
    onSite: number;
    helmetCompliance: number;
    recentAlerts: Array<{
      id: string; type: string; severity: string;
      location: string; message: string; timestamp: string; resolved: boolean;
    }>;
  };
  batteryFireRisk: {
    riskLevel: string;
    score: number;
    factors: Array<{ factor: string; value: number; threshold: number; status: string }>;
  };
}

interface GuardDashboardProps {
  data: GuardData;
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────

export default function GuardDashboard({ data }: GuardDashboardProps) {
  const router = useRouter();
  const [liveKw, setLiveKw] = useState(data.energySensor.currentKw);
  const [chartData, setChartData] = useState(data.energySensor.timeSeries);

  // 실시간 에너지 데이터 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveKw((prev) => {
        const delta = (Math.random() - 0.5) * 80;
        return Math.round(Math.min(Math.max(prev + delta, 1500), 3500));
      });
      setChartData((prev) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
        const newPoint = { time: timeStr, kw: liveKw };
        return [...prev.slice(-11), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [liveKw]);

  return (
    <div className="min-h-screen bg-[#020817] text-[#e2e8f0]">
      {/* 배경 효과 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-teal-600/8 blur-[80px]" />
        <div className="absolute -right-20 bottom-1/4 h-60 w-60 rounded-full bg-cyan-600/8 blur-[80px]" />
      </div>

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-40 border-b border-teal-500/10 bg-[#020817]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 border border-teal-500/20">
              <Shield className="h-4 w-4 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">AIM GUARD</p>
              <p className="text-[10px] text-teal-400/70">통합 안전·환경 모니터링</p>
            </div>
            <div className="ml-2 flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
              <span className="text-[10px] text-teal-400">LIVE</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/editor?solution=guard")}
            className="flex items-center gap-1.5 rounded-lg border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs text-teal-300 hover:bg-teal-500/20 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            에디터로 돌아가기
          </button>
        </div>
      </header>

      {/* 본문 */}
      <main className="mx-auto max-w-[1280px] px-6 py-6">
        {/* KPI 카드 3개 */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <KpiCard
            icon={<Zap className="h-4 w-4 text-teal-400" />}
            label="현재 전력 사용량"
            value={`${liveKw.toLocaleString()} kW`}
            sub={`피크 ${data.energySensor.peakKw.toLocaleString()} kW`}
            color="teal"
            animate
          />
          <KpiCard
            icon={<Activity className="h-4 w-4 text-cyan-400" />}
            label="시스템 가동률"
            value={data.overview.uptime}
            sub={`센서 ${data.overview.activeSensors}/${data.overview.totalSensors} 활성`}
            color="cyan"
          />
          <KpiCard
            icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
            label="활성 알람"
            value={String(data.overview.alertCount)}
            sub={`경고 ${data.overview.warningCount}건`}
            color="amber"
          />
        </div>

        {/* 3열 그리드 */}
        <div className="grid grid-cols-3 gap-4">
          {/* 에너지 차트 */}
          <div className="col-span-2">
            <GuardCard title="실시간 에너지 사용량 (kW)" icon={<Zap className="h-3.5 w-3.5 text-teal-400" />}>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0d2d3d" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0a1628", border: "1px solid #14b8a620", borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: "#94a3b8" }}
                      itemStyle={{ color: "#14b8a6" }}
                    />
                    <Line
                      type="monotone" dataKey="kw" stroke="#14b8a6"
                      strokeWidth={2} dot={false} isAnimationActive
                      animationDuration={400}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <MiniStat label="효율" value={`${data.energySensor.efficiency}%`} />
                <MiniStat label="일간 사용" value={`${(data.energySensor.dailyKwh / 1000).toFixed(1)} MWh`} />
                <MiniStat label="월간 사용" value={`${(data.energySensor.monthlyKwh / 1000000).toFixed(2)} GWh`} />
              </div>
            </GuardCard>
          </div>

          {/* 공기질 */}
          <GuardCard title="공기질 현황" icon={<Wind className="h-3.5 w-3.5 text-teal-400" />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-teal-500/10 bg-teal-500/5 px-3 py-2">
                <span className="text-xs text-[#94a3b8]">종합 등급</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  data.airQuality.overall === "good" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                )}>
                  {data.airQuality.overall === "good" ? "좋음" : "보통"}
                </span>
              </div>
              {[
                { label: "PM2.5", value: `${data.airQuality.pm25} μg/m³`, warn: data.airQuality.pm25 > 25 },
                { label: "PM10", value: `${data.airQuality.pm10} μg/m³`, warn: false },
                { label: "CO₂", value: `${data.airQuality.co2} ppm`, warn: data.airQuality.co2 > 1000 },
                { label: "온도", value: `${data.airQuality.temperature}°C`, warn: false },
                { label: "습도", value: `${data.airQuality.humidity}%`, warn: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b]">{item.label}</span>
                  <span className={item.warn ? "font-medium text-amber-400" : "text-[#94a3b8]"}>{item.value}</span>
                </div>
              ))}
            </div>
          </GuardCard>

          {/* CCTV 맵 */}
          <GuardCard title="CCTV 위치 현황" icon={<Camera className="h-3.5 w-3.5 text-teal-400" />}>
            <div className="relative h-44 rounded-lg border border-teal-500/10 bg-[#0a1628] overflow-hidden">
              {/* 그리드 배경 */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "linear-gradient(rgba(20,184,166,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.3) 1px, transparent 1px)",
                  backgroundSize: "20% 20%",
                }}
              />
              {data.cctv.locations.map((cam) => (
                <motion.div
                  key={cam.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.05 * parseInt(cam.id.split("-")[1]) }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${cam.x}%`, top: `${cam.y}%` }}
                  title={cam.name}
                >
                  <div className={cn(
                    "h-3 w-3 rounded-full border",
                    cam.status === "normal" ? "border-teal-400 bg-teal-400/40"
                      : cam.status === "alert" ? "border-red-400 bg-red-400/40 animate-pulse"
                      : "border-white/20 bg-white/10"
                  )} />
                </motion.div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-3 text-[10px] text-[#64748b]">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-400" />정상 {data.cctv.activeCameras - data.cctv.alertCameras}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" />알람 {data.cctv.alertCameras}</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white/20" />오프라인 {data.cctv.totalCameras - data.cctv.activeCameras}</span>
            </div>
          </GuardCard>

          {/* 작업자 현황 */}
          <GuardCard title="작업자 안전 현황" icon={<Users className="h-3.5 w-3.5 text-teal-400" />}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-teal-500/10 bg-teal-500/5 p-3 text-center">
                  <p className="text-xl font-bold text-teal-400">{data.workerSafety.onSite}</p>
                  <p className="text-[10px] text-[#64748b]">현장 근무</p>
                </div>
                <div className="rounded-lg border border-teal-500/10 bg-teal-500/5 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-400">{data.workerSafety.helmetCompliance}%</p>
                  <p className="text-[10px] text-[#64748b]">안전모 착용률</p>
                </div>
              </div>
              {/* 위험구역 없음 표시 */}
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/8 px-3 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-emerald-400">위험구역 내 작업자 없음</span>
              </div>
            </div>
          </GuardCard>

          {/* 알람 리스트 */}
          <GuardCard title="실시간 알람" icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}>
            <div className="space-y-2">
              {data.workerSafety.recentAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "rounded-lg border p-2.5",
                    alert.resolved ? "border-white/5 bg-white/[0.02] opacity-50"
                      : alert.severity === "high" ? "border-red-500/20 bg-red-500/8"
                      : alert.severity === "medium" ? "border-amber-500/20 bg-amber-500/8"
                      : "border-teal-500/15 bg-teal-500/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[11px] font-medium text-[#e2e8f0] leading-snug">{alert.message}</p>
                    {alert.resolved && <span className="flex-shrink-0 rounded bg-white/10 px-1 text-[9px] text-white/30">해결</span>}
                  </div>
                  <p className="mt-1 text-[10px] text-[#64748b]">{alert.location}</p>
                </motion.div>
              ))}
            </div>
          </GuardCard>
        </div>

        {/* AI 게이트웨이 상태 */}
        <div className="mt-4">
          <GuardCard title="하이브리드 AI 게이트웨이" icon={<Brain className="h-3.5 w-3.5 text-teal-400" />}>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Orchestrator", model: "claude-sonnet-4-6", status: "active", latency: "142ms" },
                { label: "Advisor", model: "claude-opus-4-6", status: "standby", latency: "-" },
                { label: "센서 분석", model: "Edge AI", status: "active", latency: "8ms" },
                { label: "이상 감지", model: "ML Model v2", status: "active", latency: "23ms" },
              ].map((node) => (
                <div key={node.label} className="rounded-xl border border-teal-500/10 bg-[#0a1628] p-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Wifi className={cn("h-3 w-3", node.status === "active" ? "text-teal-400" : "text-white/20")} />
                    <span className={cn("h-1.5 w-1.5 rounded-full", node.status === "active" ? "bg-teal-400 animate-pulse" : "bg-white/20")} />
                  </div>
                  <p className="text-xs font-medium text-[#e2e8f0]">{node.label}</p>
                  <p className="mt-0.5 text-[10px] text-[#64748b]">{node.model}</p>
                  <p className="mt-1 font-mono text-[10px] text-teal-400/70">{node.latency}</p>
                </div>
              ))}
            </div>
          </GuardCard>
        </div>
      </main>

      {/* 하단 배너 */}
      <footer className="mt-8 border-t border-teal-500/10 bg-[#020817]/80 py-4">
        <div className="mx-auto max-w-[1280px] px-6 flex items-center justify-center gap-3">
          <Shield className="h-4 w-4 text-teal-400/50" />
          <p className="text-xs text-[#475569]">
            이 화면은 <span className="text-teal-400/80 font-medium">AIMNIS 플랫폼</span>으로 <span className="text-white/60 font-medium">2개월</span> 만에 만들어졌습니다
          </p>
          <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 text-[10px] text-teal-400">Powered by AI</span>
        </div>
      </footer>
    </div>
  );
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────

function GuardCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-teal-500/10 bg-[#0d1f3c]/60 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color, animate }: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  color: "teal" | "cyan" | "amber"; animate?: boolean;
}) {
  const borderMap = { teal: "border-teal-500/15", cyan: "border-cyan-500/15", amber: "border-amber-500/15" };
  const bgMap = { teal: "bg-teal-500/5", cyan: "bg-cyan-500/5", amber: "bg-amber-500/5" };
  return (
    <div className={cn("rounded-xl border p-4", borderMap[color], bgMap[color])}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-xs text-[#64748b]">{label}</p>
      </div>
      <p className={cn("text-2xl font-bold text-white", animate && "tabular-nums")}>{value}</p>
      <p className="mt-1 text-[11px] text-[#475569]">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-teal-500/10 bg-[#0a1628] px-2.5 py-2 text-center">
      <p className="text-xs font-semibold text-[#94a3b8]">{value}</p>
      <p className="text-[10px] text-[#475569]">{label}</p>
    </div>
  );
}
