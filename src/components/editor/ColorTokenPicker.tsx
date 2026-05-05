"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Check, Crosshair, Droplets, Grid2X2, Image as ImageIcon, Minus, Plus, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COLOR_SWATCHES = [
  "#2563EB",
  "#00C8FF",
  "#60A5FA",
  "#0EA5E9",
  "#0F766E",
  "#22C55E",
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#E11D48",
  "#9A6A0E",
  "#D29D00",
  "#06161E",
  "#070F24",
  "#0C1733",
  "#111827",
  "#1E3A5F",
  "#475569",
  "#94A3B8",
  "#E4E8F2",
  "#F7F9FC",
  "#FFFFFF",
  "#3B3B3D",
  "#55565A",
];

const PAGE_SWATCHES = [
  "#FFFFFF",
  "#F7F9FC",
  "#E4E8F2",
  "#94A3B8",
  "#64748B",
  "#334155",
  "#111827",
  "#070F24",
  "#2563EB",
  "#00C8FF",
  "#22C7D7",
  "#0F766E",
  "#22C55E",
  "#F59E0B",
  "#F97316",
  "#EF4444",
];

interface ColorTokenPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsv {
  h: number;
  s: number;
  v: number;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function parseColor(value: string): { rgb: Rgb; alpha: number } {
  const fallback = { rgb: { r: 37, g: 99, b: 235 }, alpha: 100 };
  const clean = value.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(clean)) return fallback;
  const rgb = {
    r: Number.parseInt(clean.slice(0, 2), 16),
    g: Number.parseInt(clean.slice(2, 4), 16),
    b: Number.parseInt(clean.slice(4, 6), 16),
  };
  const alpha = clean.length === 8 ? Math.round((Number.parseInt(clean.slice(6, 8), 16) / 255) * 100) : 100;
  return { rgb, alpha };
}

function rgbToHex(rgb: Rgb, alpha = 100) {
  const base = [rgb.r, rgb.g, rgb.b]
    .map((channel) => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  if (alpha >= 100) return `#${base}`;
  const alphaHex = Math.round((clamp(alpha, 0, 100) / 100) * 255).toString(16).padStart(2, "0").toUpperCase();
  return `#${base}${alphaHex}`;
}

function rgbToHsv({ r, g, b }: Rgb): Hsv {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === red) h = ((green - blue) / delta) % 6;
    else if (max === green) h = (blue - red) / delta + 2;
    else h = (red - green) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

function hsvToRgb({ h, s, v }: Hsv): Rgb {
  const chroma = v * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - chroma;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (h < 60) [red, green, blue] = [chroma, x, 0];
  else if (h < 120) [red, green, blue] = [x, chroma, 0];
  else if (h < 180) [red, green, blue] = [0, chroma, x];
  else if (h < 240) [red, green, blue] = [0, x, chroma];
  else if (h < 300) [red, green, blue] = [x, 0, chroma];
  else [red, green, blue] = [chroma, 0, x];

  return {
    r: Math.round((red + m) * 255),
    g: Math.round((green + m) * 255),
    b: Math.round((blue + m) * 255),
  };
}

function normalizeHex(value: string) {
  const clean = value.trim().replace("#", "");
  return /^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(clean) ? `#${clean.toUpperCase()}` : null;
}

export default function ColorTokenPicker({ label, value, onChange, className }: ColorTokenPickerProps) {
  const [open, setOpen] = useState(false);
  const [hexDraft, setHexDraft] = useState(value.toUpperCase().replace("#", ""));
  const pickerRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const parsed = useMemo(() => parseColor(value), [value]);
  const hsv = useMemo(() => rgbToHsv(parsed.rgb), [parsed.rgb]);
  const hueColor = rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }));
  const normalizedValue = rgbToHex(parsed.rgb, parsed.alpha);

  useEffect(() => {
    setHexDraft(normalizedValue.replace("#", ""));
  }, [normalizedValue]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  const commit = (nextHsv: Hsv, nextAlpha = parsed.alpha) => {
    onChange(rgbToHex(hsvToRgb(nextHsv), nextAlpha));
  };

  const updateSaturation = (clientX: number, clientY: number) => {
    const rect = saturationRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = clamp((clientX - rect.left) / rect.width);
    const v = clamp(1 - (clientY - rect.top) / rect.height);
    commit({ ...hsv, s, v });
  };

  const startSaturationDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    updateSaturation(event.clientX, event.clientY);
    const move = (moveEvent: PointerEvent) => updateSaturation(moveEvent.clientX, moveEvent.clientY);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const handleEyeDropper = async () => {
    const EyeDropperCtor = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!EyeDropperCtor) return;
    try {
      const result = await new EyeDropperCtor().open();
      onChange(result.sRGBHex.toUpperCase());
    } catch {
      // 사용자가 취소한 경우에는 현재 값을 유지합니다.
    }
  };

  return (
    <div ref={pickerRef} className={cn("relative flex-shrink-0", className)}>
      <button
        type="button"
        aria-label={`${label} 컬러 팔레트 열기`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/15 bg-black/20 p-0.5 transition-colors hover:border-cyan-300/45"
      >
        <span className="h-full w-full rounded-md" style={{ backgroundColor: value }} />
      </button>

      {open && (
        <div
          className="fixed right-6 top-24 z-[90] w-[320px] overflow-hidden rounded-2xl border border-cyan-200/12 bg-[#0b0d14] shadow-2xl shadow-black/60 ring-1 ring-white/[0.03]"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[11px] font-semibold text-white/85">Custom</span>
              <span className="text-[11px] text-white/35">Library</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button type="button" className="rounded-md p-1 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/75">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white/75"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="border-b border-white/[0.07] px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{label}</span>
              <span className="font-mono text-[10px] uppercase text-white/35">{normalizedValue}</span>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {[Grid2X2, Droplets, SlidersHorizontal, ImageIcon].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "flex h-7 items-center justify-center rounded-md border text-white/45 transition-colors",
                    index === 0 ? "border-cyan-300/25 bg-cyan-400/10 text-cyan-100" : "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.06]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 p-3">
            <div
              ref={saturationRef}
              role="slider"
              aria-label={`${label} saturation value`}
              tabIndex={0}
              onPointerDown={startSaturationDrag}
              className="relative h-44 cursor-crosshair overflow-hidden rounded-xl border border-white/10"
              style={{
                background: `linear-gradient(0deg, #000 0%, transparent 100%), linear-gradient(90deg, #fff 0%, ${hueColor} 100%)`,
              }}
            >
              <span
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_10px_rgba(0,0,0,0.55)]"
                style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: normalizedValue }}
              />
            </div>

            <div className="grid grid-cols-[24px_1fr] items-center gap-3">
              <button
                type="button"
                onClick={handleEyeDropper}
                disabled={typeof window !== "undefined" && !(window as unknown as { EyeDropper?: unknown }).EyeDropper}
                title="스포이드"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/55 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Crosshair className="h-4 w-4" />
              </button>
              <input
                type="range"
                min={0}
                max={360}
                value={Math.round(hsv.h)}
                onChange={(event) => commit({ ...hsv, h: Number(event.target.value) })}
                className="color-hue-slider h-3 w-full appearance-none rounded-full"
              />
            </div>

            <div className="grid grid-cols-[24px_1fr] items-center gap-3">
              <div className="h-8 w-8 rounded-lg border border-white/[0.06]" style={{ backgroundColor: normalizedValue }} />
              <input
                type="range"
                min={0}
                max={100}
                value={parsed.alpha}
                onChange={(event) => commit(hsv, Number(event.target.value))}
                className="color-alpha-slider h-3 w-full appearance-none rounded-full"
                style={{ "--alpha-color": rgbToHex(parsed.rgb) } as CSSProperties}
              />
            </div>

            <div className="grid grid-cols-[74px_1fr_72px] overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.04]">
              <select className="border-r border-white/[0.07] bg-transparent px-2 text-xs text-white/70 outline-none">
                <option className="bg-[#0b0d14]">Hex</option>
              </select>
              <input
                value={hexDraft}
                onChange={(event) => {
                  const next = event.target.value.toUpperCase().replace("#", "");
                  setHexDraft(next);
                  const normalized = normalizeHex(next);
                  if (normalized) onChange(normalized);
                }}
                onBlur={() => setHexDraft(normalizedValue.replace("#", ""))}
                spellCheck={false}
                className="min-w-0 bg-transparent px-3 py-2 font-mono text-xs uppercase text-white/80 outline-none"
              />
              <div className="flex items-center border-l border-white/[0.07]">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={parsed.alpha}
                  onChange={(event) => commit(hsv, Number(event.target.value))}
                  className="min-w-0 flex-1 bg-transparent py-2 text-right text-xs text-white/75 outline-none"
                />
                <span className="px-2 text-xs text-white/35">%</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-white/55">On this page</span>
                <Minus className="h-3.5 w-3.5 text-white/30" />
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {[...PAGE_SWATCHES, ...COLOR_SWATCHES.slice(0, 8)].map((color, index) => {
                  const selected = normalizedValue.slice(0, 7).toUpperCase() === color.toUpperCase();
                  return (
                    <button
                      key={`${color}-${index}`}
                      type="button"
                      aria-label={`${color} 적용`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onChange(color);
                      }}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md border transition-transform hover:scale-105",
                        selected ? "border-white/75" : "border-white/[0.08]",
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {selected && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-8 gap-1.5">
              {COLOR_SWATCHES.slice(0, 16).map((color) => {
                const selected = normalizedValue.slice(0, 7).toUpperCase() === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`${color} 적용`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange(color);
                  }}
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md border transition-transform hover:scale-105",
                    selected ? "border-white/75" : "border-white/[0.08]",
                  )}
                  style={{ backgroundColor: color }}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                </button>
              );
            })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
