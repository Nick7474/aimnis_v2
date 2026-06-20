"use client";

import type { ReactNode } from "react";
import {
  Activity, AlertTriangle, Battery, Brain, CheckCircle2,
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
  liveData?: Record<string, unknown>;
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
  brandColor, brandSurface, brandBorder,
}: {
  title: string; categoryLabel?: string; accent?: string;
  icon: ReactNode; children: ReactNode; selected?: boolean;
  brandColor?: string; brandSurface?: string; brandBorder?: string;
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
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
            {categoryLabel && <div style={{ fontSize: 10.5, color: C.t3, marginTop: 1 }}>{categoryLabel}</div>}
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", padding: "3px 11px", borderRadius: 20, flexShrink: 0,
          background: selected ? "rgba(0,200,255,.1)" : `${iconColor}14`,
          border: selected ? "1px solid rgba(0,200,255,.4)" : `1px solid ${iconColor}40`,
        }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: selected ? "#00C8FF" : iconColor, letterSpacing: "0.02em" }}>Live</span>
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
export default function MonitoringWidgetRenderer({ title, widget, categoryLabel, selected, brandPrimaryColor, brandSurfaceColor, brandBorderColor, liveData }: MonitoringWidgetRendererProps) {
  const id = widget?.id ?? "";
  const bc  = brandPrimaryColor;
  const bsc = brandSurfaceColor;
  const bbc = brandBorderColor;

  switch (id) {

    /* 1. 초음파 아크 위험도 */
    case "ultrasonic-arc-risk": {
      const arcVal = (liveData?.value as number) ?? (liveData?.anomalyScore as number) ?? 73;
      const liveSeries2 = liveData?.timeSeries as Array<{ time: string; value: number }> | undefined;
      const d = liveSeries2 ? liveSeries2.map((p) => p.value) : [18,21,20,24,22,28,26,38,30,52,36,30,44,40,46,34,42];
      const arcColor = arcVal >= 80 ? C.red : arcVal >= 60 ? C.yellow : C.red;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Zap className="h-4 w-4" />} accent="red" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 18, minHeight: 0, alignItems: "stretch" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <AIMLineChart data={d} color={arcColor} bare area smooth />
            </div>
            <div style={{ flexShrink: 0, width: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AIMGauge value={arcVal} max={100} color={arcColor} size={100} thickness={10} label={`${arcVal}%`} sub="ARC" />
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
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Activity className="h-4 w-4" />} accent="blue" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, minHeight: 120 }}>
            <AIMBarChart data={d} xLabels={["0","1k","2k","3k","4k","5k Hz"]}
              colorFn={(v) => v > 55 ? C.red : v > 40 ? C.yellow : C.blue} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 10, color: C.t3 }}>
            <span>피크 <b style={{ color: "#e2e8f0", fontFamily: "'DM Mono'" }}>2.1 kHz</b></span>
            <span>RMS <b style={{ color: "#e2e8f0", fontFamily: "'DM Mono'" }}>{rmsVal} mm/s</b></span>
            <span style={{ color: C.yellow }}>● {classLabel} 감지</span>
          </div>
        </WidgetFrame>
      );
    }

    /* 3. 과열 ΔT 히트맵 */
    case "thermal-delta-map": {
      const r = rndSeeded(31);
      const cells = Array.from({ length: 24 }, () => heatColor(r()));
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Thermometer className="h-4 w-4" />} accent="yellow" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 90 }}><AIMHeatmap rows={4} cols={6} cells={cells} /></div>
            <div style={{ width: 78, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 9, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Max ΔT</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.red, fontFamily: "'DM Mono'" }}>18.6°C</div>
              </div>
              <div style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 9, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Hotspot</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", fontFamily: "'DM Mono'" }}>A-03</div>
              </div>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 4. 열화 가스 분해 패널 */
    case "gas-decomposition-panel":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Flame className="h-4 w-4" />} accent="green" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AIMProgBar label="CO"            value={42} color={C.green}  />
            <AIMProgBar label="CH₄ (메탄)"    value={64} color={C.yellow} />
            <AIMProgBar label="H₂ (수소)"     value={31} color={C.cyan}   />
            <AIMProgBar label="C₂H₂ (아세틸렌)" value={78} color={C.red} />
          </div>
          <div style={{ marginTop: 6, padding: "8px 11px", borderRadius: 8, background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", fontSize: 11, color: C.red, display: "flex", alignItems: "center", gap: 7 }}>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            C₂H₂ 임계 초과 — 아크 방전 의심
          </div>
        </WidgetFrame>
      );

    /* 5. 유해 환경 구역 맵 */
    case "hazard-zone-map": {
      const dots = [
        { x: "18%", y: "30%", c: C.green,  l: "Z1" },
        { x: "62%", y: "22%", c: C.yellow, l: "Z2" },
        { x: "78%", y: "62%", c: C.red,    l: "Z3" },
        { x: "34%", y: "70%", c: C.green,  l: "Z4" },
        { x: "50%", y: "45%", c: C.cyan,   l: "Z5" },
      ];
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Map className="h-4 w-4" />} accent="yellow" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
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
            {[["안전 3", C.green], ["주의 1", C.yellow], ["위험 1", C.red]].map(([t, c]) => (
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
      const cells = Array.from({ length: 40 }, () => { const v = r(); return v > 0.88 ? C.red : v > 0.78 ? C.yellow : C.green; });
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<ShieldCheck className="h-4 w-4" />} accent="green" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
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
            <span>정상 <b style={{ color: C.green,  fontFamily: "'DM Mono'" }}>34</b></span>
            <span>주의 <b style={{ color: C.yellow, fontFamily: "'DM Mono'" }}>4</b></span>
            <span>점검 <b style={{ color: C.red,    fontFamily: "'DM Mono'" }}>2</b></span>
          </div>
        </WidgetFrame>
      );
    }

    /* 7. 계측기 전원/배터리 */
    case "device-power-battery":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Battery className="h-4 w-4" />} accent="green" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AIMProgBar label="휴대형 계측기" value={86} color={C.green} />
            <AIMProgBar label="고정형 노드"   value={72} color={C.cyan}  />
            <AIMProgBar label="교체 필요"     value={14} color={C.red}   />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <AIMStatTile label="평균 잔량"   value="74%" color={C.green}  />
            <AIMStatTile label="저전력 노드" value="6"   color={C.yellow} />
          </div>
        </WidgetFrame>
      );

    /* 8. 복합 계측기 배치 현황 */
    case "fleet-device-inventory":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Activity className="h-4 w-4" />} accent="cyan" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 11, alignItems: "stretch" }}>
            <AIMStatTile label="총 계측기" value="154" sub="등록 기준" />
            <AIMStatTile label="온라인"   value="148" color={C.green}  sub="96.1%" />
            <AIMStatTile label="점검"     value="6"   color={C.yellow} sub="정기"  />
            <AIMStatTile label="오프라인" value="0"   color={C.t3}    sub="없음"  />
          </div>
        </WidgetFrame>
      );

    /* 9. 고장 진행 단계 */
    case "fault-progression-stage": {
      const stages = ["정상", "초기", "진행", "임박"];
      const cur = Math.min(3, Math.max(0, ((liveData?.stage as number) ?? 2) - 1));
      const rulDays = (liveData?.rul as number) ?? 46;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<AlertTriangle className="h-4 w-4" />} accent="violet" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {stages.map((s, i) => (
                <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flexShrink: 0, flex: i < stages.length - 1 ? "unset" : "unset" }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: i <= cur ? (i === cur ? C.purple : `${C.purple}33`) : "rgba(255,255,255,.05)",
                      border: `1.5px solid ${i <= cur ? C.purple : "rgba(255,255,255,.12)"}`,
                      fontSize: 11, fontWeight: 700, color: i === cur ? "#fff" : i < cur ? C.purple : C.t4,
                      fontFamily: "'DM Mono'", flexShrink: 0,
                    }}>{i + 1}</div>
                    {i < stages.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: i < cur ? C.purple : "rgba(255,255,255,.1)", margin: "0 4px" }} />
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: i === cur ? "#e2e8f0" : C.t4, fontWeight: i === cur ? 600 : 400, marginTop: 6, alignSelf: "flex-start" }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 9, background: `${C.purple}14`, border: `1px solid ${C.purple}33` }}>
              <div style={{ fontSize: 10, color: C.t3, marginBottom: 2 }}>현재 단계 · 잔여 수명 추정</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{stages[cur]} 단계 · 약 <span style={{ color: C.purple, fontFamily: "'DM Mono'" }}>{rulDays}일</span></div>
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
      const gaugeColor = gaugeVal >= 80 ? C.red : gaugeVal >= 60 ? C.yellow : C.purple;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Brain className="h-4 w-4" />} accent="violet" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <AIMGauge value={gaugeVal} max={100} color={gaugeColor} size={96} label={`${gaugeVal}%`} sub="ERROR" />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, minHeight: 80 }}>
                <AIMLineChart data={d} color={gaugeColor} yTicks={3} xLabels={liveSeries ? ["시작", "중간", "현재"] : ["-24h", "-12h", "now"]} />
              </div>
              <div style={{ fontSize: 10, color: isLive ? gaugeColor : C.purple, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: isLive ? gaugeColor : C.purple, flexShrink: 0 }} />
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
      const rulColor = rulVal <= 30 ? C.red : rulVal <= 60 ? C.yellow : C.cyan;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Brain className="h-4 w-4" />} accent="cyan" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 130 }}>
              <AIMLineChart data={d} color={rulColor} yTicks={4} xLabels={["D-30","D-20","D-10","오늘","D+10"]} />
            </div>
            <div style={{ width: 88, flexShrink: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ background: `${rulColor}12`, border: `1px solid ${rulColor}33`, borderRadius: 10, padding: "10px 11px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>RUL</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: rulColor, fontFamily: "'DM Mono'" }}>{rulVal}일</div>
              </div>
              <div style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: "10px 11px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Next PM</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", fontFamily: "'DM Mono'" }}>06.22</div>
              </div>
              <div style={{ fontSize: 9, color: C.t4, lineHeight: 1.5 }}>신뢰구간<br /><span style={{ color: C.green, fontFamily: "'DM Mono'" }}>±3.2일</span></div>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 12. CNN-LSTM 스펙트로그램 진단 */
    case "cnn-lstm-spectrogram": {
      const r = rndSeeded(77);
      const cells = Array.from({ length: 60 }, () => { const v = r(); return v > 0.78 ? C.red : v > 0.62 ? C.blue : "#1e4536"; });
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Waves className="h-4 w-4" />} accent="blue" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 110 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12,1fr)", gridTemplateRows: "repeat(5,1fr)", gap: 3, height: "100%" }}>
                {cells.map((c, i) => <div key={i} style={{ borderRadius: 2, background: c }} />)}
              </div>
            </div>
            <div style={{ width: 88, flexShrink: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              <div style={{ background: `${C.blue}12`, border: `1px solid ${C.blue}33`, borderRadius: 10, padding: "10px 11px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Class</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Bearing</div>
              </div>
              <div style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, padding: "10px 11px" }}>
                <div style={{ fontSize: 9, color: C.t3 }}>Conf.</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.green, fontFamily: "'DM Mono'" }}>91%</div>
              </div>
            </div>
          </div>
        </WidgetFrame>
      );
    }

    /* 13. F1/F2 모델 운용 모드 */
    case "fscore-model-tuning":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<Gauge className="h-4 w-4" />} accent="violet" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AIMProgBar label="F1 균형"     value={82} color={C.purple} />
            <AIMProgBar label="F2 안전 우선" value={94} color={C.cyan}   />
          </div>
          <div style={{ padding: "9px 12px", borderRadius: 9, background: "rgba(168,85,247,.1)", border: "1px solid rgba(168,85,247,.28)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.purple, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#e2e8f0" }}>현재 모드 · <b style={{ color: C.purple }}>오검출 최소화 (F2)</b></span>
          </div>
        </WidgetFrame>
      );

    /* 14. 예지보전 리포트 요약 */
    case "predictive-report": {
      const normalN  = (liveData?.normalCount  as number) ?? 128;
      const warnN    = (liveData?.warningCount as number) ?? 9;
      const critN    = (liveData?.criticalCount as number) ?? 2;
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<FileText className="h-4 w-4" />} accent="green" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 11, minHeight: 0 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {([["정상 설비", String(normalN), C.green], ["예방정비 권고", String(warnN), C.yellow], ["긴급 점검", String(critN), C.red]] as [string,string,string][]).map(([k, v, c]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 9, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.06)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: C.t2 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />{k}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: c, fontFamily: "'DM Mono'" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ width: 120, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6, background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.2)", borderRadius: 10 }}>
              <AIMGauge value={89} max={100} color={C.green} size={80} label="89%" sub="가동률" />
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
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<HeartPulse className="h-4 w-4" />} accent="red" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 14, minHeight: 0 }}>
            <div style={{ flexShrink: 0, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.green, fontFamily: "'DM Mono'", lineHeight: 1 }}>96<span style={{ fontSize: 14, color: C.t3 }}>%</span></div>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>SpO₂ 평균</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginTop: 10, fontFamily: "'DM Mono'" }}>72 <span style={{ fontSize: 9, color: C.t4 }}>BPM</span></div>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ flex: 1, minHeight: 70 }}>
                <AIMLineChart data={d} color={C.red} yTicks={2} xLabels={["-1h", "-30m", "now"]} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <span style={{ flex: 1, fontSize: 10, textAlign: "center", padding: "5px 0", borderRadius: 6, background: "rgba(34,197,94,.1)", color: C.green, border: "1px solid rgba(34,197,94,.25)" }}>정상 12명</span>
            <span style={{ flex: 1, fontSize: 10, textAlign: "center", padding: "5px 0", borderRadius: 6, background: "rgba(234,179,8,.1)", color: C.yellow, border: "1px solid rgba(234,179,8,.25)" }}>주의 1명</span>
          </div>
        </WidgetFrame>
      );
    }

    /* 16. 작업자 컨텍스트 융합 */
    case "worker-context-fusion":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<ShieldCheck className="h-4 w-4" />} accent="cyan" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", gap: 11, minHeight: 0 }}>
            {([
              { n: "위치", v: "B동 3F", c: C.cyan,   d: "GPS+UWB" },
              { n: "활동", v: "점검 중", c: C.green,  d: "IMU 분류" },
              { n: "환경", v: "안전",   c: C.green,  d: "가스+온도" },
              { n: "피로도", v: "보통", c: C.yellow, d: "HRV 추정" },
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
      const steps: [string, string][] = [["IMU 수신","done"],["낙하 가속 감지","done"],["자세 분석","active"],["SOP 트리거","wait"]];
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<AlertTriangle className="h-4 w-4" />} accent="orange" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
            {steps.map(([s, st], i) => (
              <div key={s} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: st === "done" ? C.green : st === "active" ? C.orange : "rgba(255,255,255,.05)",
                    border: `1.5px solid ${st === "done" ? C.green : st === "active" ? C.orange : "rgba(255,255,255,.12)"}`,
                  }}>
                    {st === "done"
                      ? <CheckCircle2 className="h-3 w-3 text-white" />
                      : <span style={{ width: 7, height: 7, borderRadius: "50%", background: st === "active" ? "#fff" : "transparent" }} />
                    }
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2, height: 22, background: st === "done" ? C.green : "rgba(255,255,255,.1)" }} />}
                </div>
                <div style={{ paddingTop: 2, paddingBottom: 14 }}>
                  <div style={{ fontSize: 12.5, fontWeight: st === "active" ? 700 : 500, color: st === "wait" ? C.t4 : "#e2e8f0" }}>{s}</div>
                  <div style={{ fontSize: 10, color: C.t3, marginTop: 1 }}>{st === "done" ? "완료" : st === "active" ? "진행 중" : "대기"}</div>
                </div>
              </div>
            ))}
          </div>
        </WidgetFrame>
      );
    }

    /* 18. 통신 게이트웨이 상태 */
    case "gateway-communication":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<RadioTower className="h-4 w-4" />} accent="green" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 11 }}>
            {([["LoRa","연결",98,C.green],["LTE-M","연결",91,C.green],["Wi-Fi Mesh","약함",64,C.yellow]] as [string,string,number,string][]).map(([n, s, v, c]) => (
              <div key={n}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: C.t2, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />{n}
                  </span>
                  <span style={{ fontSize: 10, color: c, fontWeight: 600 }}>{s} · {v}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,.06)" }}>
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
        ["이상 감지 → 알림 발송", "완료",     C.green],
        ["담당자 자동 배정",       "완료",     C.green],
        ["현장 격리 안내 푸시",    "진행 중",  C.blue],
        ["보고서 자동 생성",       "대기",     C.t3],
      ];
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<CheckCircle2 className="h-4 w-4" />} accent="blue" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            {items.map(([t, s, c], i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 9,
                background: c === C.blue ? "rgba(59,130,246,.08)" : "rgba(255,255,255,.025)",
                border: `1px solid ${c === C.blue ? "rgba(59,130,246,.28)" : "rgba(255,255,255,.06)"}`,
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${c}22`, border: `1px solid ${c}44`, fontSize: 10, fontWeight: 700, color: c, fontFamily: "'DM Mono'" }}>{i + 1}</div>
                <span style={{ flex: 1, fontSize: 12, color: "#e2e8f0" }}>{t}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: c, padding: "2px 9px", borderRadius: 5, background: `${c}1a` }}>{s}</span>
              </div>
            ))}
          </div>
        </WidgetFrame>
      );
    }

    /* 20. 현장 실증 진행률 */
    case "field-validation-progress":
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<CheckCircle2 className="h-4 w-4" />} accent="green" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
            <AIMGauge value={72} max={100} color={C.green} size={104} label="72%" sub="전체" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {([["설치","100%",C.green],["데이터 수집","84%",C.cyan],["검증","52%",C.yellow]] as [string,string,string][]).map(([k, v, c]) => (
                <div key={k}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: C.t2 }}>{k}</span>
                    <span style={{ fontSize: 10, color: c, fontFamily: "'DM Mono'", fontWeight: 600 }}>{v}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,.06)" }}>
                    <div style={{ height: "100%", width: v, borderRadius: 3, background: c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WidgetFrame>
      );

    default:
      return (
        <WidgetFrame title={title} categoryLabel={categoryLabel} icon={<SparkIcon />} accent="blue" selected={selected} brandColor={bc} brandSurface={bsc} brandBorder={bbc}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <AIMProgBar label="Signal"     value={72} color={C.blue}   />
            <AIMProgBar label="Confidence" value={88} color={C.green}  />
            <AIMProgBar label="Risk"       value={48} color={C.yellow} />
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
      <div className={cn(base, "bg-[#0e0609] flex items-center justify-center")}>
        <svg width="86%" height="38" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke={C.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
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
      <div className={cn(base, "bg-[#0d0506] flex items-center justify-center")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "70%" }}>
          {(["done","done","active","wait"] as string[]).map((st,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: st==="done"?C.green:st==="active"?C.orange:"rgba(255,255,255,.12)" }} />
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: st==="wait"?"rgba(255,255,255,.08)":st==="active"?C.orange:C.green }} />
            </div>
          ))}
        </div>
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
      <div className={cn(base, "bg-[#040f08] flex items-center justify-center")}>
        <AIMGauge value={72} max={100} color={C.green} size={48} thickness={6} label="" />
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
