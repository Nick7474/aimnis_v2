"use client";

import type { ComponentType, ReactNode } from "react";
import { RotateCcw } from "lucide-react";

export function MonitoringInspectorHeader({
  icon: Icon,
  label,
  selectedLabel,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  selectedLabel?: string | null;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
      <Icon className="h-3.5 w-3.5 text-white/40" />
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      {selectedLabel && (
        <span className="ml-auto max-w-[120px] truncate rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] text-cyan-300">
          {selectedLabel}
        </span>
      )}
    </div>
  );
}

export function MonitoringInspectorFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">{eyebrow}</p>
        <h3 className="mt-1 text-sm font-semibold text-white/80">{title}</h3>
        <p className="mt-1 text-[10px] leading-relaxed text-white/30">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function MonitoringInspectorSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-white/30" />
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">{title}</p>
      </div>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

export function MonitoringTextControl({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="flex-shrink-0 text-xs text-white/60">{label}</span>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-0 flex-1 bg-transparent text-right text-xs text-white/80 placeholder:text-white/20 focus:outline-none"
      />
    </div>
  );
}

export function MonitoringSelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="text-xs text-white/60">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-[150px] bg-transparent text-right text-xs text-white/70 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0a0a14]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MonitoringNumberControl({
  label,
  value,
  min,
  max,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-white/60">{label}</span>
        <span className="font-mono text-[10px] text-white/35">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className="w-full accent-cyan-400"
      />
    </div>
  );
}

export function MonitoringToggleControl({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="text-xs text-white/60">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-cyan-400"
      />
    </label>
  );
}

export function MonitoringColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="flex-shrink-0 text-xs text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-[96px] rounded-md border border-white/[0.08] bg-black/20 px-2 py-1 text-right font-mono text-[10px] uppercase text-white/55 focus:border-cyan-300/35 focus:outline-none"
        />
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-7 rounded-md border border-white/[0.08] bg-black/20 p-1"
        />
      </div>
    </div>
  );
}

export function MonitoringResetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-white/45 transition-colors hover:border-white/15 hover:text-white/70"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
