"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sliders, LayoutGrid } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { SolutionWidget } from "@/lib/solutionLoader";
import type { WidgetProperties } from "@/store/editorStore";
import BrandKitControls from "./BrandKitControls";
import ColorTokenPicker from "./ColorTokenPicker";

interface SettingsPanelProps {
  widgets: SolutionWidget[];
}

// ── 위젯 타입별 편집 가능 프로퍼티 정의 ─────────────────────────

const WIDGET_PROPS: Record<
  string,
  Array<{ key: keyof WidgetProperties; label: string; type: "text" | "color" | "range" | "select" | "toggle"; min?: number; max?: number; options?: string[] }>
> = {
  kpi: [
    { key: "title",      label: "타이틀",    type: "text" },
    { key: "themeColor", label: "색상",      type: "color" },
  ],
  "chart-line": [
    { key: "title",           label: "타이틀",       type: "text" },
    { key: "themeColor",      label: "색상",         type: "color" },
    { key: "dataSource",      label: "데이터 소스",   type: "select", options: ["energy-sensor", "cctv", "air-quality", "worker-safety"] },
    { key: "refreshInterval", label: "갱신 주기 (ms)", type: "range", min: 500, max: 5000 },
  ],
  "chart-bar": [
    { key: "title",           label: "타이틀",       type: "text" },
    { key: "themeColor",      label: "색상",         type: "color" },
    { key: "dataSource",      label: "데이터 소스",   type: "select", options: ["energy-sensor", "cctv", "air-quality", "worker-safety"] },
    { key: "refreshInterval", label: "갱신 주기 (ms)", type: "range", min: 500, max: 5000 },
  ],
  "chart-donut": [
    { key: "title",      label: "타이틀", type: "text" },
    { key: "themeColor", label: "색상",   type: "color" },
  ],
  gauge: [
    { key: "title",      label: "타이틀",  type: "text" },
    { key: "themeColor", label: "색상",    type: "color" },
    { key: "value",      label: "현재값",  type: "range", min: 0, max: 100 },
    { key: "threshold",  label: "임계값",  type: "range", min: 0, max: 100 },
  ],
  "alert-panel": [
    { key: "title",  label: "타이틀",    type: "text" },
    { key: "label",  label: "레이블",    type: "text" },
  ],
};

// ── 서브 컴포넌트 ─────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.FC<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-white/30" />
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">{title}</p>
    </div>
  );
}

function ColorPickerRow({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <span className="text-xs text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-white/35">{value}</span>
        <ColorTokenPicker label={label} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function RangeRow({
  label, value, min = 0, max = 100, onChange,
}: { label: string; value: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <span className="font-mono text-[10px] text-white/40">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-purple-500"
      />
    </div>
  );
}

function TextRow({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <span className="flex-shrink-0 text-xs text-white/60">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-0 flex-1 bg-transparent text-right text-xs text-white/80 placeholder:text-white/20 focus:outline-none"
      />
    </div>
  );
}

function SelectRow({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
      <span className="text-xs text-white/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-right text-xs text-white/70 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0a0a14]">{o}</option>
        ))}
      </select>
    </div>
  );
}

// ── 선택 위젯 편집 섹션 ───────────────────────────────────────

function WidgetEditorSection() {
  const { selectedElement, activeWidgets, overlayWidgets, updateWidgetProperty } = useEditorStore();

  const widget = overlayWidgets.find((w) => w.id === selectedElement?.sectionId);
  const active = activeWidgets.find((aw) => aw.id === selectedElement?.sectionId);

  if (!widget || !active) return null;

  const props = active.properties;
  const defs = WIDGET_PROPS[widget.type] ?? [
    { key: "title" as keyof WidgetProperties, label: "타이틀", type: "text" as const },
    { key: "themeColor" as keyof WidgetProperties, label: "색상", type: "color" as const },
  ];

  return (
    <motion.section
      key={widget.id}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <SectionHeader icon={Sliders} title="위젯 설정" />
        <span className="ml-auto rounded-md border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 text-[9px] text-brand-400">
          {widget.title}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {defs.map((def) => {
          const val = props[def.key];

          if (def.type === "color") {
            return (
              <ColorPickerRow
                key={def.key}
                label={def.label}
                value={(val as string) ?? "#14b8a6"}
                onChange={(v) => {
                  updateWidgetProperty(widget.id, def.key, v);
                  // CSS 변수 즉시 반영
                  document.documentElement.style.setProperty("--widget-color", v);
                }}
              />
            );
          }
          if (def.type === "range") {
            return (
              <RangeRow
                key={def.key}
                label={def.label}
                value={(val as number) ?? def.min ?? 0}
                min={def.min}
                max={def.max}
                onChange={(v) => updateWidgetProperty(widget.id, def.key, v)}
              />
            );
          }
          if (def.type === "select") {
            return (
              <SelectRow
                key={def.key}
                label={def.label}
                value={(val as string) ?? (def.options?.[0] ?? "")}
                options={def.options ?? []}
                onChange={(v) => updateWidgetProperty(widget.id, def.key, v)}
              />
            );
          }
          // text (default)
          return (
            <TextRow
              key={def.key}
              label={def.label}
              value={(val as string) ?? ""}
              onChange={(v) => updateWidgetProperty(widget.id, def.key, v)}
            />
          );
        })}
      </div>

      <div className="h-px bg-white/5" />
    </motion.section>
  );
}

// ── 메인 ─────────────────────────────────────────────────────

export default function SettingsPanel({ widgets }: SettingsPanelProps) {
  const { selectedElement } = useEditorStore();

  const hasWidgetSelected =
    selectedElement?.type === "widget" && !!selectedElement.sectionId;

  return (
    <div className="overflow-y-auto custom-scrollbar p-4 space-y-5">

      {/* 선택 위젯 편집 (위젯 선택 시만 노출) */}
      <AnimatePresence>
        {hasWidgetSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <WidgetEditorSection />
          </motion.div>
        )}
      </AnimatePresence>

      <BrandKitControls />

      {/* 기능 모듈 요약 */}
      <section className="flex flex-col gap-2">
        <SectionHeader icon={LayoutGrid} title="기능 모듈" />
        <div className="rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/55">활성 위젯</span>
            <span className="rounded-md border border-emerald-400/15 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              {widgets.length}개
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {widgets.slice(0, 6).map((widget) => (
              <span
                key={widget.id}
                className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[10px] text-white/40"
              >
                {widget.name}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden">
          {widgets.map((widget) => (
            <WidgetToggle key={widget.id} widget={widget} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ── 기능 모듈 토글 ────────────────────────────────────────────

function WidgetToggle({ widget }: { widget: SolutionWidget }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
      <span className="text-xs text-white/50">{widget.name}</span>
      <button
        className="relative h-4 w-8 rounded-full bg-purple-600 transition-colors"
        role="switch"
        aria-checked="true"
      >
        <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform" />
      </button>
    </div>
  );
}
