"use client";

import { useRef, useEffect, useState, useId } from "react";

/* ── 색상 팔레트 (aim-charts.jsx 원본과 동일) ── */
export const C = {
  blue:   "#3b82f6",
  cyan:   "#38bdf8",
  green:  "#22c55e",
  yellow: "#eab308",
  red:    "#ef4444",
  purple: "#a855f7",
  orange: "#f97316",
  pink:   "#ec4899",
  grid:   "rgba(255,255,255,.06)",
  axis:   "rgba(255,255,255,.18)",
  t2:     "#94a3b8",
  t3:     "#64748b",
  t4:     "#475569",
};

/* ── LINE CHART ─────────────────────────────────────── */
interface LineChartProps {
  data: number[];
  color?: string;
  yUnit?: string;
  xLabels?: string[];
  yTicks?: number;
  area?: boolean;
  smooth?: boolean;
  bare?: boolean;
  isLight?: boolean;
}

export function AIMLineChart({
  data, color = C.cyan, yUnit = "", xLabels = [],
  yTicks = 4, area = true, smooth = true, bare = false, isLight = false,
}: LineChartProps) {
  const uid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState({ w: 320, h: 140 });

  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver((es) => {
      for (const e of es) {
        const r = e.contentRect;
        setSz({ w: Math.max(60, Math.round(r.width)), h: Math.max(50, Math.round(r.height)) });
      }
    });
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const W = sz.w, H = sz.h;
  const padL = bare ? 4  : 30;
  const padR = bare ? 6  : 12;
  const padT = bare ? 10 : 12;
  const padB = bare ? 6  : 19;
  const cw = Math.max(1, W - padL - padR);
  const ch = Math.max(1, H - padT - padB);
  const max = Math.max(...data) * 1.08;
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const xs = data.map((_, i) => padL + (i / (data.length - 1)) * cw);
  const ys = data.map((v) => padT + ch - ((v - min) / range) * ch);

  const path = (() => {
    if (!smooth || data.length < 3)
      return xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    let d = `M${xs[0].toFixed(1)},${ys[0].toFixed(1)}`;
    for (let i = 0; i < xs.length - 1; i++) {
      const x0 = xs[i - 1] ?? xs[i], y0 = ys[i - 1] ?? ys[i];
      const x1 = xs[i],     y1 = ys[i];
      const x2 = xs[i + 1], y2 = ys[i + 1];
      const x3 = xs[i + 2] ?? x2, y3 = ys[i + 2] ?? y2;
      const c1x = x1 + (x2 - x0) / 6, c1y = y1 + (y2 - y0) / 6;
      const c2x = x2 - (x3 - x1) / 6, c2y = y2 - (y3 - y1) / 6;
      d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
      void x0; void y0;
    }
    return d;
  })();

  const areaPath = `${path} L${xs[xs.length - 1].toFixed(1)},${(padT + ch).toFixed(1)} L${padL},${(padT + ch).toFixed(1)} Z`;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => min + (range / yTicks) * i);
  const fs = W < 260 ? 8 : 9;
  const gridColor = isLight ? "rgba(0,0,0,.06)" : C.grid;

  return (
    <div ref={box} style={{ position: "relative", width: "100%", height: "100%", minHeight: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}>
        <defs>
          <linearGradient id={`area${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.26" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {!bare && yTickVals.map((v, i) => {
          const y = padT + ch - (i / yTicks) * ch;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={gridColor} strokeWidth="1" />
              <text x={padL - 5} y={y + 3} fontSize={fs} fill={C.t4} textAnchor="end"
                fontFamily="'DM Mono',monospace">{Math.round(v)}{yUnit}</text>
            </g>
          );
        })}
        {!bare && xLabels.map((lb, i) => {
          const x = padL + (i / (xLabels.length - 1)) * cw;
          return (
            <text key={i} x={x} y={H - 6} fontSize={fs} fill={C.t4} textAnchor="middle"
              fontFamily="'DM Mono',monospace">{lb}</text>
          );
        })}
        {area && <path d={areaPath} fill={`url(#area${uid})`} />}
        <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3.2" fill={color} />
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="6"   fill={color} opacity="0.22" />
      </svg>
    </div>
  );
}

/* ── BAR CHART ──────────────────────────────────────── */
interface BarChartProps {
  data: number[];
  colorFn?: (v: number, i: number) => string;
  xLabels?: string[];
  isLight?: boolean;
}

export function AIMBarChart({ data, colorFn, xLabels = [], isLight = false }: BarChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const [sz, setSz] = useState({ w: 320, h: 140 });
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver((es) => {
      for (const e of es) {
        const r = e.contentRect;
        setSz({ w: Math.max(60, Math.round(r.width)), h: Math.max(50, Math.round(r.height)) });
      }
    });
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const W = sz.w, H = sz.h;
  const padL = 28, padR = 8, padT = 10, padB = 18;
  const cw = Math.max(1, W - padL - padR), ch = Math.max(1, H - padT - padB);
  const max = Math.max(...data) * 1.1;
  const bw = cw / data.length;
  const yTicks = 3;
  const fs = W < 260 ? 8 : 9;
  const gridColor = isLight ? "rgba(0,0,0,.06)" : C.grid;
  return (
    <div ref={box} style={{ position: "relative", width: "100%", height: "100%", minHeight: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}>
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = padT + ch - (i / yTicks) * ch;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={gridColor} strokeWidth="1" />
              <text x={padL - 5} y={y + 3} fontSize={fs} fill={C.t4} textAnchor="end"
                fontFamily="'DM Mono',monospace">{Math.round((max / yTicks) * i)}</text>
            </g>
          );
        })}
        {data.map((v, i) => {
          const h = (v / max) * ch;
          const x = padL + i * bw + bw * 0.18;
          const col = colorFn ? colorFn(v, i) : C.cyan;
          return (
            <rect key={i} x={x} y={padT + ch - h}
              width={Math.max(1, bw * 0.64)} height={h}
              rx={Math.min(bw * 0.3, 3)} fill={col} />
          );
        })}
        {xLabels.map((lb, i) => {
          const x = padL + (i / (xLabels.length - 1)) * cw;
          return (
            <text key={i} x={x} y={H - 5} fontSize={fs} fill={C.t4} textAnchor="middle"
              fontFamily="'DM Mono',monospace">{lb}</text>
          );
        })}
      </svg>
    </div>
  );
}

/* ── GAUGE / DONUT ──────────────────────────────────── */
interface GaugeProps {
  value: number;
  max?: number;
  color?: string;
  size?: number;
  label?: string;
  sub?: string;
  track?: string;
  thickness?: number;
  isLight?: boolean;
}

export function AIMGauge({
  value, max = 100, color = C.blue, size = 104,
  label = "", sub = "", track, thickness = 9, isLight = false,
}: GaugeProps) {
  const box = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState(size);

  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver((es) => {
      for (const e of es) {
        const r = e.contentRect;
        setDisplaySize(Math.max(32, Math.min(size, Math.round(Math.min(r.width, r.height)))));
      }
    });
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [size]);

  const r = (size - thickness) / 2 - 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const uid = useId().replace(/:/g, "");
  const actualTrack = track ?? (isLight ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.07)");
  const textFill = isLight ? "#1E2124" : "#f1f5f9";
  return (
    <div ref={box} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <svg width={displaySize} height={displaySize} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={actualTrack} strokeWidth={thickness} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#g${uid})`} strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={`${circ * pct} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray .6s" }} />
      <text x={cx} y={cy - 1} fontSize="20" fontWeight="700" fill={textFill}
        textAnchor="middle" fontFamily="'DM Mono',monospace">{label}</text>
      {sub && (
        <text x={cx} y={cy + 14} fontSize="9" fill={C.t3}
          textAnchor="middle" letterSpacing="0.1em">{sub}</text>
      )}
    </svg>
    </div>
  );
}

/* ── HEATMAP ────────────────────────────────────────── */
interface HeatmapProps {
  rows: number;
  cols: number;
  cells: string[];
  gap?: number;
  radius?: number;
}

export function AIMHeatmap({ rows, cols, cells, gap = 3, radius = 3 }: HeatmapProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
      gap,
      width: "100%",
      height: "100%",
    }}>
      {cells.map((c, i) => (
        <div key={i} style={{ background: c, borderRadius: radius, minHeight: 0 }} />
      ))}
    </div>
  );
}

/* ── PROGRESS BAR ROW ───────────────────────────────── */
interface ProgBarProps {
  label: string;
  value: number;
  color?: string;
  suffix?: string;
  isLight?: boolean;
}

export function AIMProgBar({ label, value, color = C.green, suffix = "%", isLight = false }: ProgBarProps) {
  const textStrong = isLight ? "#1E2124" : "#e2e8f0";
  const labelColor = isLight ? C.t3 : C.t2;
  const trackBg = isLight ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.06)";
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 8 }}>
        <span style={{ fontSize: 11, color: labelColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        <span style={{ fontSize: 11, color: textStrong, fontFamily: "'DM Mono',monospace", fontWeight: 500, flexShrink: 0 }}>{value}{suffix}</span>
      </div>
      <div style={{ height: 6, borderRadius: 4, background: trackBg, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, borderRadius: 4, background: `linear-gradient(90deg,${color},${color}cc)`, transition: "width .5s" }} />
      </div>
    </div>
  );
}

/* ── STAT TILE ──────────────────────────────────────── */
interface StatTileProps {
  label: string;
  value: string;
  color?: string;
  sub?: string;
  isLight?: boolean;
}

export function AIMStatTile({ label, value, color = "#e2e8f0", sub, isLight = false }: StatTileProps) {
  const tileBg = isLight ? "rgba(0,0,0,.03)" : "rgba(255,255,255,.025)";
  const tileBd = isLight ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.06)";
  const labelColor = C.t3;
  const subColor = C.t4;
  const valueColor = color === "#e2e8f0" && isLight ? "#1E2124" : color;
  return (
    <div style={{
      flex: 1,
      background: tileBg,
      border: `1px solid ${tileBd}`,
      borderRadius: 10,
      padding: "13px 15px",
      minWidth: 0,
    }}>
      <div style={{ fontSize: 10, color: labelColor, marginBottom: 7, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: valueColor, fontFamily: "'DM Mono',monospace", letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: subColor, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

/* ── heatColor helper ───────────────────────────────── */
export function heatColor(v: number): string {
  if (v < 0.4)  return C.green;
  if (v < 0.55) return "#3b6e4a";
  if (v < 0.7)  return C.blue;
  if (v < 0.82) return C.yellow;
  return C.red;
}

/* ── seeded random series ───────────────────────────── */
export function series(n: number, base: number, amp: number, seed = 7): number[] {
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  return Array.from({ length: n }, (_, i) =>
    Math.max(0, base + Math.sin(i / 2.2) * amp * 0.5 + (rnd() - 0.5) * amp)
  );
}

export function rndSeeded(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
