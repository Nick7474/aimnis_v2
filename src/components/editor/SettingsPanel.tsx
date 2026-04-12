"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { SolutionWidget } from "@/lib/solutionLoader";

const FONTS = ["Inter", "Pretendard", "Noto Sans KR", "IBM Plex Sans", "JetBrains Mono"];

interface SettingsPanelProps {
  widgets: SolutionWidget[];
}

export default function SettingsPanel({ widgets }: SettingsPanelProps) {
  const { brand, updateBrand } = useEditorStore();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateBrand({ logoUrl: url });
  };

  return (
    <div className="overflow-y-auto custom-scrollbar p-4 space-y-5">
      {/* 브랜드 컬러 */}
      <section>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-white/40">브랜드 컬러</p>
        <div className="space-y-3">
          <ColorPicker
            label="주 컬러"
            value={brand.primaryColor}
            onChange={(v) => {
              updateBrand({ primaryColor: v });
              document.documentElement.style.setProperty("--guard-color-primary", v);
            }}
          />
          <ColorPicker
            label="보조 컬러"
            value={brand.secondaryColor}
            onChange={(v) => {
              updateBrand({ secondaryColor: v });
              document.documentElement.style.setProperty("--guard-color-accent", v);
            }}
          />
        </div>
      </section>

      {/* 로고 업로드 */}
      <section>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-white/40">로고</p>
        <button
          onClick={() => logoInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] py-4 text-xs text-white/30 hover:border-purple-500/30 hover:text-white/50 transition-all"
        >
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt="logo" className="h-8 object-contain" />
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              로고 업로드 (PNG, SVG)
            </>
          )}
        </button>
        <input
          ref={logoInputRef}
          type="file"
          accept=".png,.svg,.jpg"
          className="hidden"
          onChange={handleLogoChange}
        />
      </section>

      {/* 폰트 */}
      <section>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-white/40">폰트</p>
        <div className="grid grid-cols-1 gap-1">
          {FONTS.map((font) => (
            <button
              key={font}
              onClick={() => updateBrand({ fontFamily: font })}
              className={`rounded-lg px-3 py-2 text-left text-xs transition-all ${
                brand.fontFamily === font
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/30"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
              style={{ fontFamily: font }}
            >
              {font}
            </button>
          ))}
        </div>
      </section>

      {/* 기능 모듈 토글 */}
      <section>
        <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-white/40">
          기능 모듈
        </p>
        <div className="space-y-2">
          {widgets.map((widget) => (
            <WidgetToggle key={widget.id} widget={widget} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-xs text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-white/40">{value}</span>
        <label className="cursor-pointer">
          <div
            className="h-6 w-6 rounded-lg border border-white/20 shadow-sm"
            style={{ backgroundColor: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}

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
