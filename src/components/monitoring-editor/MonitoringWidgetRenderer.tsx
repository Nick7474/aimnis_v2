"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity, AlertTriangle, Battery, Brain, CheckCircle2, Database,
  FileText, Flame, Gauge, HeartPulse, Map, RadioTower,
  ShieldCheck, Thermometer, Waves, Zap,
} from "lucide-react";
import type { SolutionWidget } from "@/lib/solutionLoader";
import { cn } from "@/lib/utils";
import {
  C, AIMLineChart, AIMBarChart, AIMGauge, AIMHeatmap,
  AIMProgBar, AIMStatTile, heatColor, series, rndSeeded,
} from "./MonitoringChartPrimitives";

interface MonitoringWidgetRendererProps {
  title: string;
  widget?: SolutionWidget;
  categoryLabel?: string;
  selected?: boolean;
  brandPrimaryColor?: string;
  brandSurfaceColor?: string;
  brandBorderColor?: string;
  brandTextStrongColor?: string;
  brandTextSoftColor?: string;
  brandAccentColor?: string;
  brandSuccessColor?: string;
  brandWarningColor?: string;
  brandDangerColor?: string;
  brandAccentSecondaryColor?: string;
  isLight?: boolean;
  liveData?: Record<string, unknown>;
  isConnected?: boolean;
}

/* ── CARD SHELL (aim-widgets.jsx의 Card와 동일) ─────── */
const ACCENT: Record<string, string> = {
  red:    C.red,   blue:   C.blue,  cyan:   C.cyan,
  green:  C.green, yellow: C.yellow, violet: C.purple,
  emerald: C.green, orange: C.orange,
};

function SparkIcon() {
  return <Gauge className="h-4 w-4" />;
}

function WidgetFrame({
  title, categoryLabel, accent = "blue", icon, children, selected,
  brandColor, brandSurface, brandBorder, brandTextStrong, brandTextSoft, isLight, isConnected = true,
}: {
  title: string; categoryLabel?: string; accent?: string;
  icon: ReactNode; children: ReactNode; selected?: boolean;
  brandColor?: string; brandSurface?: string; brandBorder?: string;
  brandTextStrong?: string; brandTextSoft?: string; isLight?: boolean; isConnected?: boolean;
}) {
  const widgetColor = ACCENT[accent] ?? C.blue;
  /* 브랜드 primary color가 있으면 아이콘/뱃지에 적용, 없으면 위젯 고유색 유지 */
  const iconColor = brandColor ?? widgetColor;
  /* 기본 위젯과 동일하게 brandSurface/brandBorder 우선, 없으면 기본값 */
  const bgColor  = brandSurface ?? "#111827";
  const bdColor  = brandBorder  ?? "rgba(255,255,255,.07)";
  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${bdColor}`,
      borderRadius: 18,
      padding: 18,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0,
      overflow: "hidden",
      boxShadow: selected
        ? "0 0 0 2px #00C8FF, 0 0 28px rgba(0,200,255,.22), 0 10px 30px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.035)"
        : "0 10px 30px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.035)",
    }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 11, flexShrink: 0,
            background: `linear-gradient(145deg,${iconColor}30,${iconColor}0d)`,
            border: `1px solid ${iconColor}3a`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: brandTextStrong ?? (isLight ? "#1E2124" : "#f1f5f9"), letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
            {categoryLabel && <div style={{ fontSize: 10.5, color: brandTextSoft ?? C.t3, marginTop: 1 }}>{categoryLabel}</div>}
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5, padding: "3px 11px", borderRadius: 20, flexShrink: 0,
          background: selected && isConnected ? "rgba(0,200,255,.1)" : `${iconColor}14`,
          border: selected && isConnected ? "1px solid rgba(0,200,255,.4)" : `1px solid ${iconColor}40`,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: selected && isConnected ? "#00C8FF" : iconColor, display: "inline-block", flexShrink: 0, opacity: isConnected ? 1 : 0.6 }} />
          <span style={{ fontSize: 10.5, fontWeight: 600, color: selected && isConnected ? "#00C8FF" : iconColor, letterSpacing: "0.02em", opacity: isConnected ? 1 : 0.7 }}>
            {isConnected ? "Live" : "미연결"}
          </span>
        </div>
      </div>
      {/* body */}
      <div className="custom-scrollbar" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}

/* ── 20 WIDGETS (aim-widgets.jsx 원본 그대로 이식) ──── */
export default function MonitoringWidgetRenderer({ title, widget, categoryLabel, selected, brandPrimaryColor, brandSurfaceColor, brandBorderColor, brandTextStrongColor, brandTextSoftColor, brandAccentColor, brandSuccessColor, brandWarningColor, brandDangerColor, brandAccentSecondaryColor, isLight: isLightProp, liveData, isConnected = true }: MonitoringWidgetRendererProps) {
  const id = widget?.id ?? "";
  const bsc = brandSurfaceColor;
  const bbc = brandBorderColor;
  const isLight = !!isLightProp;
  /* ── 위젯별 색상 팔레트 (per-widget override → brand → 하드코딩 기본값) ── */
  const iconBrandColor = brandAccentColor ?? brandPrimaryColor; // undefined 시 WidgetFrame이 ACCENT[] 폴백 사용
  const wc = {
    accent:  brandAccentColor ?? brandPrimaryColor ?? C.blue,
    accent2: brandAccentSecondaryColor ?? C.cyan,
    success: brandSuccessColor ?? C.green,
    warning: brandWarningColor ?? C.yellow,
    danger:  brandDangerColor  ?? C.red,
  };
  const th = {
    cardBg:    isLight ? "rgba(0,0,0,.03)"  : "rgba(255,255,255,.025)",
    cardBd:    isLight ? "rgba(0,0,0,.08)"  : "rgba(255,255,255,.06)",
    textStrong: brandTextStrongColor ?? (isLight ? "#1E2124" : "#e2e8f0"),
    textSoft:   brandTextSoftColor ?? (isLight ? "#6D7882" : "#94a3b8"),
    progTrack:  isLight ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.06)",
    gaugeTrack: isLight ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.07)",
  };

  /* ── 미연결 상태 — NoneSummaryCard와 동일한 스타일 ── */
  if (!isConnected) {
    const accentCol = brandAccentColor ?? brandPrimaryColor ?? "#3B82F6";
    const bgCol     = brandSurfaceColor ?? "#111827";
    const bdCol     = brandBorderColor  ?? "#1F2937";
    const textSoft  = brandTextSoftColor ?? "#94A3B8";

    return (
      <WidgetFrame
        title={title} categoryLabel={categoryLabel} icon={<SparkIcon />}
        accent="blue" selected={selected}
        brandColor={iconBrandColor}
        brandSurface={bgCol}
        brandBorder={bdCol}
        brandTextStrong={brandTextStrongColor} brandTextSoft={textSoft}
        isLight={isLight} isConnected={false}
      >
        {/* NoneSummaryCard 레이아웃 그대로 */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, minHeight: 0 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 700, lineHeight: 1, color: textSoft }}>
              None
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: textSoft }}>
              DB 수집 연결 전
            </div>
          </div>
          {/* ghost bar chart — NoneSummaryCard 동일 */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40, width: 112, flexShrink: 0, opacity: 0.35 }}>
            {[34, 22, 29, 18, 26, 14, 21].map((h, i) => (
              <span key={i} style={{ flex: 1, borderRadius: "2px 2px 0 0", height: h, backgroundColor: i % 3 === 0 ? accentCol : bdCol }} />
            ))}
          </div>
        </div>
      </WidgetFrame>
    );
  }

  switch (id) {

    /* 1. 초음파 아크 위험도 */
    case "ultrasonic-arc-risk": {
      const arcVal = (liveData?.value as number) ?? (liveData?.anomalyScore as number) ?? 73;
      const liveSeries2 = liveData?.timeSeries as Array<{ time: string; value: number }> | undefined;
      const d = liveSeries2 ? liveSeries2.map((p) => p.value) : [18,21,20,24,22,28,26,38,30,52,36,30,44,40,46,34,42];
      /* 정상 상태 기본색 = success(green), 임계 초과 시 warning/danger — 게이지·차트 동일 색 */
      const arcColor = arcVal >= 80 ? wc.danger : arcVal >= 60 ? wc.warning : wc.success;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Zap className="h-4 w-4" />} accent="red" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 18, minHeight: 0, alignItems: "stretch" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <AIMLineChart data={d} color={arcColor} bare area smooth isLight={isLight} />
            </div>
            <div style={{ flexShrink: 0, width: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AIMGauge value={arcVal} max={100} color={arcColor} size={100} thickness={10} label={`${arcVal}%`} sub="ARC" track={th.gaugeTrack} isLight={isLight} />
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 2. 진동 FFT 스펙트럼 */
    case "vibration-fft-spectrum": {
      const d = series(28, 22, 38, 13).map((v, i) => i % 7 === 3 ? v * 1.8 : v);
      const rmsVal = (liveData?.rms as number) ?? (liveData?.vibration as number) ?? 4.7;
      const classLabel = (liveData?.classification as string) ?? "베어링 고조파";
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Activity className="h-4 w-4" />} accent="blue" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, minHeight: 120 }}>
            <AIMBarChart data={d} xLabels={["0","1k","2k","3k","4k","5k Hz"]}
              colorFn={(v) => v > 55 ? wc.danger : v > 40 ? wc.warning : wc.accent} isLight={isLight} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 10, color: C.t3 }}>
            <span>피크 <b style={{ color: th.textStrong, fontFamily: "'DM Mono'" }}>2.1 kHz</b></span>
            <span>RMS <b style={{ color: th.textStrong, fontFamily: "'DM Mono'" }}>{rmsVal} mm/s</b></span>
            <span style={{ color: wc.warning }}>● {classLabel} 감지</span>
          </div>
        </WidgetFrame>
      );
    }

    /* 3. 과열 ΔT 히트맵 */
    case "thermal-delta-map": {
      const r = rndSeeded(31);
      const cells = Array.from({ length: 24 }, () => heatColor(r()));
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Thermometer className="h-4 w-4" />} accent="yellow" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 90 }}><AIMHeatmap rows={4} cols={6} cells={cells} /></div>
            <div style={{ width: 78, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 9, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Max ΔT</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: wc.danger, fontFamily: "'DM Mono'" }}>18.6°C</div>
              </div>
              <div style={{ background: th.cardBg, border: `1px solid ${th.cardBd}`, borderRadius: 9, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Hotspot</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: th.textStrong, fontFamily: "'DM Mono'" }}>A-03</div>
              </div>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 4. 열화 가스 분해 패널 */
    case "gas-decomposition-panel":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Flame className="h-4 w-4" />} accent="green" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AIMProgBar label="CO"            value={42} color={wc.success} isLight={isLight} />
            <AIMProgBar label="CH₄ (메탄)"    value={64} color={wc.warning} isLight={isLight} />
            <AIMProgBar label="H₂ (수소)"     value={31} color={wc.accent}  isLight={isLight} />
            <AIMProgBar label="C₂H₂ (아세틸렌)" value={78} color={wc.danger} isLight={isLight} />
          </div>
          <div style={{ marginTop: 6, padding: "8px 11px", borderRadius: 8, background: `${wc.danger}14`, border: `1px solid ${wc.danger}40`, fontSize: 11, color: wc.danger, display: "flex", alignItems: "center", gap: 7 }}>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            C₂H₂ 임계 초과 — 아크 방전 의심
          </div>
        </WidgetFrame>
      );

    /* 5. 유해 환경 구역 맵 */
    case "hazard-zone-map": {
      const dots = [
        { x: "18%", y: "30%", c: wc.success, l: "Z1" },
        { x: "62%", y: "22%", c: wc.warning, l: "Z2" },
        { x: "78%", y: "62%", c: wc.danger,  l: "Z3" },
        { x: "34%", y: "70%", c: wc.success, l: "Z4" },
        { x: "50%", y: "45%", c: wc.accent,  l: "Z5" },
      ];
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Map className="h-4 w-4" />} accent="yellow" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, position: "relative", borderRadius: 10, overflow: "hidden", minHeight: 120, background: "radial-gradient(circle at 30% 40%,rgba(56,189,248,.06),transparent 60%),#0b1019", border: "1px solid rgba(255,255,255,.05)" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
            {dots.map((d, i) => (
              <div key={i} style={{ position: "absolute", left: d.x, top: d.y, transform: "translate(-50%,-50%)" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: d.c, boxShadow: `0 0 16px ${d.c}`, border: "2px solid rgba(0,0,0,.3)" }} />
                <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: C.t3, fontFamily: "'DM Mono'", whiteSpace: "nowrap" }}>{d.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 10, color: C.t3 }}>
            {([["안전 3", wc.success], ["주의 1", wc.warning], ["위험 1", wc.danger]] as [string, string][]).map(([t, c]) => (
              <span key={String(t)} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: String(c) }} />{t}
              </span>
            ))}
          </div>
        </WidgetFrame>
      );
    }

    /* 6. 복합 센서 헬스 매트릭스 */
    case "multi-sensor-health": {
      const r = rndSeeded(19);
      const cells = Array.from({ length: 40 }, () => { const v = r(); return v > 0.88 ? wc.danger : v > 0.78 ? wc.warning : wc.success; });
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<ShieldCheck className="h-4 w-4" />} accent="green" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, minHeight: 90 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gridTemplateRows: "repeat(4,1fr)", gap: 5, height: "100%" }}>
              {cells.map((c, i) => (
                <div key={i} style={{ borderRadius: 5, background: `${c}22`, border: `1px solid ${c}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 10, color: C.t3 }}>
            <span>정상 <b style={{ color: wc.success, fontFamily: "'DM Mono'" }}>34</b></span>
            <span>주의 <b style={{ color: wc.warning, fontFamily: "'DM Mono'" }}>4</b></span>
            <span>점검 <b style={{ color: wc.danger,  fontFamily: "'DM Mono'" }}>2</b></span>
          </div>
        </WidgetFrame>
      );
    }

    /* 7. 계측기 전원/배터리 */
    case "device-power-battery":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Battery className="h-4 w-4" />} accent="green" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AIMProgBar label="휴대형 계측기" value={86} color={wc.success} isLight={isLight} />
            <AIMProgBar label="고정형 노드"   value={72} color={wc.accent}  isLight={isLight} />
            <AIMProgBar label="교체 필요"     value={14} color={wc.danger}  isLight={isLight} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <AIMStatTile label="평균 잔량"   value="74%" color={wc.success} isLight={isLight} />
            <AIMStatTile label="저전력 노드" value="6"   color={wc.warning} isLight={isLight} />
          </div>
        </WidgetFrame>
      );

    /* 8. 복합 계측기 배치 현황 */
    case "fleet-device-inventory":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Activity className="h-4 w-4" />} accent="cyan" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 11, alignItems: "stretch" }}>
            <AIMStatTile label="총 계측기" value="154" sub="등록 기준" isLight={isLight} />
            <AIMStatTile label="온라인"   value="148" color={wc.success} sub="96.1%" isLight={isLight} />
            <AIMStatTile label="점검"     value="6"   color={wc.warning} sub="정기"  isLight={isLight} />
            <AIMStatTile label="오프라인" value="0"   color={C.t3}    sub="없음"  isLight={isLight} />
          </div>
        </WidgetFrame>
      );

    /* 9. 고장 진행 단계 */
    case "fault-progression-stage": {
      const stages = ["정상", "초기", "진행", "임박"];
      const cur = Math.min(3, Math.max(0, ((liveData?.stage as number) ?? 2) - 1));
      const rulDays = (liveData?.rul as number) ?? 46;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<AlertTriangle className="h-4 w-4" />} accent="violet" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {stages.map((s, i) => (
                <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flexShrink: 0, flex: i < stages.length - 1 ? "unset" : "unset" }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: i <= cur ? (i === cur ? wc.accent : `${wc.accent}33`) : "rgba(255,255,255,.05)",
                      border: `1.5px solid ${i <= cur ? wc.accent : "rgba(255,255,255,.12)"}`,
                      fontSize: 11, fontWeight: 700, color: i === cur ? "#fff" : i < cur ? wc.accent : C.t4,
                      fontFamily: "'DM Mono'", flexShrink: 0,
                    }}>{i + 1}</div>
                    {i < stages.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: i < cur ? wc.accent : "rgba(255,255,255,.1)", margin: "0 4px" }} />
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: i === cur ? th.textStrong : C.t4, fontWeight: i === cur ? 600 : 400, marginTop: 6, alignSelf: "flex-start" }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 9, background: `${wc.accent}14`, border: `1px solid ${wc.accent}33` }}>
              <div style={{ fontSize: 10, color: C.t3, marginBottom: 2 }}>현재 단계 · 잔여 수명 추정</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.textStrong }}>{stages[cur]} 단계 · 약 <span style={{ color: wc.accent, fontFamily: "'DM Mono'" }}>{rulDays}일</span></div>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 10. Autoencoder 이상 점수 */
    case "autoencoder-anomaly": {
      const gaugeVal = (liveData?.value as number) ?? 64;
      const liveSeries = liveData?.timeSeries as Array<{ time: string; value: number }> | undefined;
      const d = liveSeries ? liveSeries.map((p) => p.value) : series(24, 30, 30, 42).map((v, i) => i > 18 ? v * 1.5 : v);
      const isLive = !!liveData?.value;
      /* 게이지·차트 동일 accent 색상으로 연동 — 상태 배지에서만 threshold 텍스트 표시 */
      const acColor = wc.accent;
      const statusColor = gaugeVal >= 80 ? wc.danger : gaugeVal >= 60 ? wc.warning : wc.success;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Brain className="h-4 w-4" />} accent="violet" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <AIMGauge value={gaugeVal} max={100} color={acColor} size={96} label={`${gaugeVal}%`} sub="ERROR" track={th.gaugeTrack} isLight={isLight} />
              <div style={{ marginTop: 6, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 4, background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44` }}>
                {gaugeVal >= 80 ? "위험" : gaugeVal >= 60 ? "경고" : "정상"}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, minHeight: 80 }}>
                <AIMLineChart data={d} color={acColor} yTicks={3} xLabels={liveSeries ? ["시작", "중간", "현재"] : ["-24h", "-12h", "now"]} isLight={isLight} />
              </div>
              <div style={{ fontSize: 10, color: acColor, marginTop: 6, display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 6, background: `${acColor}12`, border: `1px solid ${acColor}30` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: acColor, flexShrink: 0 }} />
                {isLive ? `실시간 이상 점수 ${gaugeVal}% — 즉각 점검 필요` : "재구성 오차 급증 감지"}
              </div>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 11. LSTM 잔여수명 예측 */
    case "rul-lstm-forecast": {
      const rulVal = (liveData?.rul as number) ?? 46;
      const d = [20,24,22,28,26,32,30,35,33,38,36,42,40,45,43,48,46,52,50,55,53,58,56,60];
      /* 차트·값 카드: accent 색상으로 연동 — 상태 배지에서만 threshold 텍스트 */
      const rulAccent = wc.accent;
      const rulStatus = rulVal <= 30 ? wc.danger : rulVal <= 60 ? wc.warning : wc.success;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Brain className="h-4 w-4" />} accent="cyan" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 130 }}>
              <AIMLineChart data={d} color={rulAccent} yTicks={4} xLabels={["D-30","D-20","D-10","오늘","D+10"]} isLight={isLight} />
            </div>
            <div style={{ width: 88, flexShrink: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ background: `${rulAccent}12`, border: `1px solid ${rulAccent}33`, borderRadius: 10, padding: "10px 11px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>RUL</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rulAccent, fontFamily: "'DM Mono'" }}>{rulVal}일</div>
              </div>
              <div style={{ background: th.cardBg, border: `1px solid ${th.cardBd}`, borderRadius: 10, padding: "10px 11px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Next PM</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: th.textStrong, fontFamily: "'DM Mono'" }}>06.22</div>
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4, background: `${rulStatus}20`, color: rulStatus, border: `1px solid ${rulStatus}40`, textAlign: "center" }}>
                {rulVal <= 30 ? "긴급 점검" : rulVal <= 60 ? "점검 권고" : "정상"}
              </div>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 12. CNN-LSTM 스펙트로그램 진단 */
    case "cnn-lstm-spectrogram": {
      const r = rndSeeded(77);
      const cells = Array.from({ length: 60 }, () => { const v = r(); return v > 0.78 ? wc.danger : v > 0.62 ? wc.accent : "#1e4536"; });
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Waves className="h-4 w-4" />} accent="blue" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 110 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gridTemplateRows: "repeat(5,1fr)", gap: 3, height: "100%" }}>
                {cells.map((c, i) => <div key={i} style={{ borderRadius: 2, background: c }} />)}
              </div>
            </div>
            <div style={{ width: 88, flexShrink: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ background: `${wc.accent}12`, border: `1px solid ${wc.accent}33`, borderRadius: 10, padding: "10px 11px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Class</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: th.textStrong }}>Bearing</div>
              </div>
              <div style={{ background: th.cardBg, border: `1px solid ${th.cardBd}`, borderRadius: 10, padding: "10px 11px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Conf.</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: wc.success, fontFamily: "'DM Mono'" }}>91%</div>
              </div>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 13. F1/F2 모델 운용 모드 */
    case "fscore-model-tuning":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Gauge className="h-4 w-4" />} accent="violet" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AIMProgBar label="F1 균형"     value={82} color={wc.accent}  isLight={isLight} />
            <AIMProgBar label="F2 안전 우선" value={94} color={wc.accent2} isLight={isLight} />
          </div>
          <div style={{ padding: "9px 12px", borderRadius: 9, background: `${wc.accent}1a`, border: `1px solid ${wc.accent}47`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: wc.accent, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: th.textStrong }}>현재 모드 · <b style={{ color: wc.accent }}>오검출 최소화 (F2)</b></span>
          </div>
        </WidgetFrame>
      );

    /* 14. 예지보전 리포트 요약 */
    case "predictive-report": {
      const normalN  = (liveData?.normalCount  as number) ?? 128;
      const warnN    = (liveData?.warningCount as number) ?? 9;
      const critN    = (liveData?.criticalCount as number) ?? 2;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<FileText className="h-4 w-4" />} accent="green" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 11, minHeight: 0 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {([["정상 설비", String(normalN), wc.success], ["예방정비 권고", String(warnN), wc.warning], ["긴급 점검", String(critN), wc.danger]] as [string,string,string][]).map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 9, background: th.cardBg, border: `1px solid ${th.cardBd}` }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: C.t2 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />{k}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: "'DM Mono'" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ width: 120, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6, background: `${wc.success}0f`, border: `1px solid ${wc.success}33`, borderRadius: 10 }}>
              <AIMGauge value={89} max={100} color={wc.success} size={80} label="89%" sub="가동률" track={th.gaugeTrack} isLight={isLight} />
              <span style={{ fontSize: 10, color: C.t3 }}>주간 종합 점수</span>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 15. 작업자 SpO2 안전 */
    case "worker-spo2-status": {
      const d = [97,98,97,96,97,95,96,94,95,93,94,96];
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<HeartPulse className="h-4 w-4" />} accent="red" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flexShrink: 0, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: wc.success, fontFamily: "'DM Mono'", lineHeight: 1 }}>96<span style={{ fontSize: 14, color: C.t3 }}>%</span></div>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>SpO₂ 평균</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: th.textStrong, marginTop: 10, fontFamily: "'DM Mono'" }}>72 <span style={{ fontSize: 9, color: C.t4 }}>BPM</span></div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ flex: 1, minHeight: 70 }}>
                <AIMLineChart data={d} color={wc.accent} yTicks={2} xLabels={["-1h", "-30m", "now"]} isLight={isLight} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <span style={{ flex: 1, fontSize: 10, textAlign: "center", padding: "5px 0", borderRadius: 6, background: `${wc.success}1a`, color: wc.success, border: `1px solid ${wc.success}40` }}>정상 12명</span>
            <span style={{ flex: 1, fontSize: 10, textAlign: "center", padding: "5px 0", borderRadius: 6, background: `${wc.warning}1a`, color: wc.warning, border: `1px solid ${wc.warning}40` }}>주의 1명</span>
          </div>
        </WidgetFrame>
      );
    }

    /* 16. 작업자 컨텍스트 융합 */
    case "worker-context-fusion":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<ShieldCheck className="h-4 w-4" />} accent="cyan" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", gap: 11, minHeight: 0 }}>
            {([
              { n: "위치", v: "B동 3F", c: wc.accent,   d: "GPS+UWB" },
              { n: "활동", v: "점검 중", c: wc.success,  d: "IMU 분류" },
              { n: "환경", v: "안전",   c: wc.success,  d: "가스+온도" },
              { n: "피로도", v: "보통", c: wc.warning, d: "HRV 추정" },
            ] as {n:string;v:string;c:string;d:string}[]).map((s) => (
              <div key={s.n} style={{ flex: 1, background: "rgba(255,255,255,.025)", border: `1px solid ${s.c}22`, borderRadius: 10, padding: "12px 13px", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: C.t3 }}>{s.n}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.c, whiteSpace: "nowrap" }}>{s.v}</div>
                <div style={{ fontSize: 9, color: C.t4 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </WidgetFrame>
      );

    /* 17. 쓰러짐 감지 플로우 */
    case "worker-fall-detection": {
      type FallStep = { label: string; st: "done" | "active" | "wait"; detail: string; time: string; };
      const steps: FallStep[] = [
        { label: "IMU 수신",       st: "done",   detail: "가속도 12.4g 감지",   time: "10:24:01" },
        { label: "낙하 가속 감지", st: "done",   detail: "RMS ΔV 8.2 m/s²",    time: "10:24:05" },
        { label: "자세 분석",      st: "active", detail: "Pose 벡터 추론 중…",   time: "진행 중" },
        { label: "SOP 트리거",     st: "wait",   detail: "담당자 자동 배정 대기", time: "대기" },
      ];
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<AlertTriangle className="h-4 w-4" />} accent="orange" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            {/* 이벤트 헤더 배너 */}
            <div style={{ padding: "7px 10px", borderRadius: 8, background: `${wc.danger}18`, border: `1px solid ${wc.danger}40`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: wc.danger, flexShrink: 0, boxShadow: `0 0 6px ${wc.danger}` }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: wc.danger }}>낙상 감지 이벤트 발생</span>
              </div>
              <span style={{ fontSize: 9, fontFamily: "'DM Mono'", color: wc.danger, opacity: 0.8 }}>WK-004 · A동 3층</span>
            </div>
            {/* 단계 타임라인 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
              {steps.map(({ label, st, detail, time }, i) => (
                <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {/* 노드 + 연결선 */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: st === "done" ? wc.success : st === "active" ? `${wc.accent}22` : "rgba(255,255,255,.04)",
                      border: `2px solid ${st === "done" ? wc.success : st === "active" ? wc.accent : "rgba(255,255,255,.1)"}`,
                      boxShadow: st === "active" ? `0 0 10px ${wc.accent}66` : "none",
                    }}>
                      {st === "done"
                        ? <CheckCircle2 style={{ width: 14, height: 14, color: "#fff" }} />
                        : st === "active"
                          ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: wc.accent }} />
                          : <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.15)" }} />
                      }
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 14, background: st === "done" ? `${wc.success}80` : st === "active" ? `${wc.accent}40` : "rgba(255,255,255,.06)", borderRadius: 1 }} />
                    )}
                  </div>
                  {/* 텍스트 영역 */}
                  <div style={{ flex: 1, paddingTop: 2, paddingBottom: i < steps.length - 1 ? 12 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 12, fontWeight: st === "active" ? 700 : 500, color: st === "wait" ? "rgba(255,255,255,.25)" : th.textStrong }}>{label}</span>
                      <span style={{ fontSize: 9, fontFamily: "'DM Mono'", color: st === "done" ? `${wc.success}cc` : st === "active" ? wc.accent : "rgba(255,255,255,.2)" }}>{time}</span>
                    </div>
                    <div style={{ fontSize: 10, color: st === "wait" ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.45)", marginTop: 2 }}>{detail}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* 하단 SOP 예상 시각 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 7, background: `${wc.accent}12`, border: `1px solid ${wc.accent}30`, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.5)" }}>SOP 트리거 예상</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: wc.accent, fontFamily: "'DM Mono'" }}>+00:00:12</span>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 18. 통신 게이트웨이 상태 */
    case "gateway-communication":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<RadioTower className="h-4 w-4" />} accent="green" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 11 }}>
            {([["LoRa","연결",98,wc.success],["LTE-M","연결",91,wc.success],["Wi-Fi Mesh","약함",64,wc.warning]] as [string,string,number,string][]).map(([n, s, v, c]) => (
              <div key={n}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: C.t2, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />{n}
                  </span>
                  <span style={{ fontSize: 10, color: c, fontWeight: 600 }}>{s} · {v}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: th.progTrack }}>
                  <div style={{ height: "100%", width: `${v}%`, borderRadius: 3, background: c }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: C.t3, marginTop: 4, fontFamily: "'DM Mono'" }}>패킷 손실 0.2% · 지연 28ms</div>
        </WidgetFrame>
      );

    /* 19. SOP 자동 실행 */
    case "sop-auto-execution": {
      const items: [string, string, string][] = [
        ["이상 감지 → 알림 발송", "완료",     wc.success],
        ["담당자 자동 배정",       "완료",     wc.success],
        ["현장 격리 안내 푸시",    "진행 중",  wc.accent],
        ["보고서 자동 생성",       "대기",     C.t3],
      ];
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<CheckCircle2 className="h-4 w-4" />} accent="blue" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            {items.map(([t, s, c], i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 9,
                background: c === wc.accent ? `${wc.accent}14` : th.cardBg,
                border: `1px solid ${c === wc.accent ? `${wc.accent}47` : th.cardBd}`,
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${c}22`, border: `1px solid ${c}44`, fontSize: 10, fontWeight: 700, color: c, fontFamily: "'DM Mono'" }}>{i + 1}</div>
                <span style={{ flex: 1, fontSize: 12, color: th.textStrong }}>{t}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: c, padding: "2px 9px", borderRadius: 5, background: `${c}1a` }}>{s}</span>
              </div>
            ))}
          </div>
        </WidgetFrame>
      );
    }

    /* 20. 현장 실증 진행률 */
    case "field-validation-progress": {
      type FVBar = { label: string; pct: number; color: string; };
      const fvBars: FVBar[] = [
        { label: "설치 완료",    pct: 100, color: wc.success },
        { label: "데이터 수집",  pct: 84,  color: wc.accent2 },
        { label: "검증·분석",   pct: 52,  color: wc.warning },
        { label: "최적화 적용", pct: 28,  color: wc.accent },
      ];
      const fvKpi: [string, string][] = [
        ["배포 현장", "12개"],
        ["활성 센서", "284개"],
        ["달성률",   "72%"],
        ["목표 D-Day", "D-42"],
      ];
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<CheckCircle2 className="h-4 w-4" />} accent="green" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
            {/* 상단: 게이지 + 진행 바 */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
              {/* 좌측 게이지 */}
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <AIMGauge value={72} max={100} color={wc.accent} size={88} label="72%" sub="전체" track={th.gaugeTrack} isLight={isLight} />
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 4, background: `${wc.accent}20`, color: wc.accent, border: `1px solid ${wc.accent}44` }}>PILOT</div>
              </div>
              {/* 우측 진행 바 목록 */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {fvBars.map(({ label, pct, color }) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: th.textSoft }}>{label}</span>
                      <span style={{ fontSize: 10, color, fontFamily: "'DM Mono'", fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: th.progTrack, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 하단: KPI 요약 4개 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, flexShrink: 0, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,.06)` }}>
              {fvKpi.map(([k, v]) => (
                <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: wc.accent, fontFamily: "'DM Mono'" }}>{v}</span>
                  <span style={{ fontSize: 8.5, color: th.textSoft, textAlign: "center", lineHeight: 1.3 }}>{k}</span>
                </div>
              ))}
            </div>
          </div>
        </WidgetFrame>
      );
    }

    default:
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<SparkIcon />} accent="blue" selected={selected} brandColor={iconBrandColor} brandSurface={bsc} brandBorder={bbc} brandTextStrong={th.textStrong} brandTextSoft={th.textSoft} isLight={isLight}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AIMProgBar label="Signal"     value={72} color={wc.accent}   isLight={isLight} />
            <AIMProgBar label="Confidence" value={88} color={wc.success}  isLight={isLight} />
            <AIMProgBar label="Risk"       value={48} color={wc.warning} isLight={isLight} />
          </div>
        </WidgetFrame>
      );
  }
}

/* ════════════════════════════════════════════════════
   THUMBNAIL (좌측 패널 미리보기 — aim-widgets.jsx Mini 이식)
════════════════════════════════════════════════════ */
export function MonitoringWidgetThumbnail({ widget }: { widget: SolutionWidget }) {
  const id = widget.id;
  const base = "relative h-[76px] w-full overflow-hidden rounded-lg border border-white/[0.09]";

  /* 1. 초음파 아크 위험도 */
  if (id === "ultrasonic-arc-risk") {
    const d = [3,4,3,5,4,7,5,4]; const m = Math.max(...d), mn = Math.min(...d);
    const pts = d.map((v,i) => `${i/(d.length-1)*100},${100-(v-mn)/(m-mn)*60-20}`).join(" ");
    return (
      <div className={cn(base, "bg-[#050f09] flex items-center justify-center")}>
        <svg width="86%" height="38" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke={C.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
        </svg>
      </div>
    );
  }

  /* 2. 진동 FFT 스펙트럼 */
  if (id === "vibration-fft-spectrum") {
    const d = [3,5,4,7,5,9,6,8,5,4]; const m = Math.max(...d);
    return (
      <div className={cn(base, "bg-[#040e1a] flex items-end justify-center gap-[3px] px-3 pb-2 pt-4")}>
        {d.map((v,i) => (
          <div key={i} style={{ flex: 1, height: `${v/m*100}%`, borderRadius: 2, background: v>7?C.red:v>5?C.yellow:C.blue }} />
        ))}
      </div>
    );
  }

  /* 3. 과열 ΔT 히트맵 */
  if (id === "thermal-delta-map") {
    const r = rndSeeded(5);
    const cells = Array.from({ length: 18 }, () => heatColor(r()));
    return (
      <div className={cn(base, "bg-[#0b0906] p-1.5")}>
        <AIMHeatmap rows={3} cols={6} cells={cells} gap={2} />
      </div>
    );
  }

  /* 4. 열화 가스 분해 패널 */
  if (id === "gas-decomposition-panel") {
    const bars = [[C.green,"70%"],[C.yellow,"50%"],[C.red,"85%"]];
    return (
      <div className={cn(base, "bg-[#090d06] flex items-center justify-center")}>
        <div style={{ width: "80%", display: "flex", flexDirection: "column", gap: 6 }}>
          {bars.map(([c,w],i) => (
            <div key={i} style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,.08)" }}>
              <div style={{ height: "100%", width: w, borderRadius: 4, background: c }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* 5. 유해 환경 구역 맵 */
  if (id === "hazard-zone-map") {
    return (
      <div className={cn(base, "bg-[#070b06]")} style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "14px 14px" }}>
        {([["25%","35%",C.green],["65%","30%",C.yellow],["75%","65%",C.red]] as [string,string,string][]).map(([x,y,c],i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 8, height: 8, borderRadius: "50%", background: c, boxShadow: `0 0 8px ${c}` }} />
        ))}
      </div>
    );
  }

  /* 6. 복합 센서 헬스 매트릭스 */
  if (id === "multi-sensor-health") {
    const r = rndSeeded(9);
    const cells = Array.from({ length: 20 }, () => { const v = r(); return v > 0.85 ? C.yellow : C.green; });
    return (
      <div className={cn(base, "bg-[#05120f] flex items-center justify-center")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 3, width: "90%" }}>
          {cells.map((c,i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 3, background: c }} />)}
        </div>
      </div>
    );
  }

  /* 7. 계측기 전원/배터리 */
  if (id === "device-power-battery") {
    const bars = [[C.green,"82%"],[C.cyan,"62%"],[C.yellow,"40%"]];
    return (
      <div className={cn(base, "bg-[#040f08] flex items-center justify-center")}>
        <div style={{ width: "78%", display: "flex", flexDirection: "column", gap: 7 }}>
          {bars.map(([c,w],i) => (
            <div key={i} style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,.08)" }}>
              <div style={{ height: "100%", width: w, borderRadius: 4, background: c }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* 8. 복합 계측기 배치 현황 */
  if (id === "fleet-device-inventory") {
    return (
      <div className={cn(base, "bg-[#04090f] flex items-center justify-center")}>
        <div style={{ display: "flex", gap: 5, width: "88%" }}>
          {(["154","148","6","0"] as string[]).map((v,i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.04)", borderRadius: 5, padding: "5px 0", textAlign: "center", border: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: i===1?C.green:"#cbd5e1", fontFamily: "'DM Mono'" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* 9. 고장 진행 단계 */
  if (id === "fault-progression-stage") {
    return (
      <div className={cn(base, "bg-[#0a0608] flex items-center justify-center")}>
        <div style={{ display: "flex", alignItems: "center", width: "82%" }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i<3?1:"unset" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: i<=2?C.purple:"rgba(255,255,255,.1)", flexShrink: 0 }} />
              {i<3 && <div style={{ flex: 1, height: 2, background: i<2?C.purple:"rgba(255,255,255,.1)" }} />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* 10. Autoencoder 이상 점수 */
  if (id === "autoencoder-anomaly") {
    return (
      <div className={cn(base, "bg-[#09041a] flex items-center justify-center")}>
        <AIMGauge value={64} max={100} color={C.purple} size={48} thickness={6} label="" />
      </div>
    );
  }

  /* 11. LSTM 잔여수명 예측 */
  if (id === "rul-lstm-forecast") {
    const d = [2,4,3,6,5,8,7,9]; const m = Math.max(...d), mn = Math.min(...d);
    const pts = d.map((v,i) => `${i/(d.length-1)*100},${100-(v-mn)/(m-mn)*80-10}`).join(" ");
    return (
      <div className={cn(base, "bg-[#04091a] flex items-center justify-center")}>
        <svg width="86%" height="40" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke={C.cyan} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
        </svg>
      </div>
    );
  }

  /* 12. CNN-LSTM 스펙트로그램 */
  if (id === "cnn-lstm-spectrogram") {
    const r = rndSeeded(3);
    const cells = Array.from({ length: 24 }, () => { const v = r(); return v>0.7?C.red:v>0.5?C.blue:"#1e4536"; });
    return (
      <div className={cn(base, "bg-[#040a10] p-1.5")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 2, width: "90%" }}>
          {cells.map((c,i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 1.5, background: c }} />)}
        </div>
      </div>
    );
  }

  /* 13. F1/F2 모델 운용 모드 */
  if (id === "fscore-model-tuning") {
    return (
      <div className={cn(base, "bg-[#060510] flex items-center justify-center")}>
        <AIMGauge value={82} max={100} color={C.purple} size={48} thickness={6} label="" />
      </div>
    );
  }

  /* 14. 예지보전 리포트 요약 */
  if (id === "predictive-report") {
    return (
      <div className={cn(base, "bg-[#04090f] flex items-center justify-center")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "80%" }}>
          {([C.green,C.yellow,C.red] as string[]).map((c,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,.08)" }}>
                <div style={{ height: "100%", width: `${[80,40,20][i]}%`, borderRadius: 3, background: c }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* 15. 작업자 SpO2 안전 */
  if (id === "worker-spo2-status") {
    const d = [5,6,5,4,5,3,4,6]; const m = Math.max(...d), mn = Math.min(...d);
    const pts = d.map((v,i) => `${i/(d.length-1)*100},${100-(v-mn)/(m-mn)*70-15}`).join(" ");
    return (
      <div className={cn(base, "bg-[#040f09] flex items-center justify-center")}>
        <svg width="86%" height="40" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
        </svg>
      </div>
    );
  }

  /* 16. 작업자 컨텍스트 융합 */
  if (id === "worker-context-fusion") {
    return (
      <div className={cn(base, "bg-[#050e08] flex items-center justify-center")}>
        <div style={{ display: "flex", gap: 5, width: "88%" }}>
          {([C.cyan,C.green,C.green,C.yellow] as string[]).map((c,i) => (
            <div key={i} style={{ flex: 1, height: 34, borderRadius: 5, background: `${c}1f`, border: `1px solid ${c}44` }} />
          ))}
        </div>
      </div>
    );
  }

  /* 17. 쓰러짐 감지 플로우 */
  if (id === "worker-fall-detection") {
    return (
      <div className={cn(base, "bg-[#0d0506] flex flex-col justify-center px-3 py-2 gap-1.5")}>
        <div style={{ height: 6, borderRadius: 3, background: `${C.red}30`, border: `1px solid ${C.red}44`, marginBottom: 2 }} />
        {(["done","done","active","wait"] as string[]).map((st,i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: st==="done"?C.green:st==="active"?`${C.orange}33`:"rgba(255,255,255,.06)", border: `1.5px solid ${st==="done"?C.green:st==="active"?C.orange:"rgba(255,255,255,.15)"}`, boxShadow: st==="active"?`0 0 5px ${C.orange}88`:"none" }} />
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: st==="wait"?"rgba(255,255,255,.06)":st==="active"?`${C.orange}55`:C.green, opacity: st==="wait"?0.5:1 }} />
          </div>
        ))}
      </div>
    );
  }

  /* 18. 통신 게이트웨이 상태 */
  if (id === "gateway-communication") {
    return (
      <div className={cn(base, "bg-[#04090f] flex items-center justify-center")}>
        <RadioTower style={{ color: C.green, width: 30, height: 30 }} strokeWidth={1.6} />
      </div>
    );
  }

  /* 19. SOP 자동 실행 */
  if (id === "sop-auto-execution") {
    return (
      <div className={cn(base, "bg-[#040a14] flex items-center justify-center")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "82%" }}>
          {([C.green,C.green,C.blue,"rgba(255,255,255,.12)"] as string[]).map((c,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 5, height: 5, borderRadius: 1, background: c }} />
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: c === "rgba(255,255,255,.12)" ? "rgba(255,255,255,.08)" : c }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* 20. 현장 실증 진행률 */
  if (id === "field-validation-progress") {
    return (
      <div className={cn(base, "bg-[#040f08] flex items-center gap-3 px-3")}>
        <AIMGauge value={72} max={100} color={C.blue} size={44} thickness={5} label="" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {([[C.green,100],[C.cyan,84],[C.yellow,52],[C.blue,28]] as [string,number][]).map(([c,v],i) => (
            <div key={i} style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.06)" }}>
              <div style={{ height: "100%", width: `${v}%`, borderRadius: 2, background: c }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* 기본 */
  return (
    <div className={cn(base, "bg-[#0b111c] flex items-center justify-center")}>
      <span className="text-[10px] text-white/20">{widget.name}</span>
    </div>
  );
}
