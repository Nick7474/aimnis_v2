"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ComponentType } from "react";
import { BookmarkPlus, Check, ImagePlus, Palette, RotateCcw, Save, SlidersHorizontal, Trash2, Type } from "lucide-react";
import { BRAND_PRESETS, DEFAULT_BRAND, getBrandTextDefaults, type BrandDensity, type BrandMapTone, type BrandRadius, type BrandSettings } from "@/lib/brandPresets";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import ColorTokenPicker from "./ColorTokenPicker";

const FONTS = ["Noto Sans KR", "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", "Inter", "IBM Plex Sans"];
const RADIUS_OPTIONS: Array<{ value: BrandRadius; label: string }> = [
  { value: "sharp", label: "Sharp" },
  { value: "soft", label: "Soft" },
  { value: "rounded", label: "Rounded" },
];
const DENSITY_OPTIONS: Array<{ value: BrandDensity; label: string }> = [
  { value: "compact", label: "Compact" },
  { value: "standard", label: "Standard" },
  { value: "spacious", label: "Spacious" },
];
const MAP_TONE_OPTIONS: Array<{ value: BrandMapTone; label: string }> = [
  { value: "deep", label: "Deep" },
  { value: "blueprint", label: "Blueprint" },
  { value: "satellite", label: "Satellite" },
  { value: "mono", label: "Mono" },
];

interface BrandKitControlsProps {
  compact?: boolean;
}

export default function BrandKitControls({ compact = false }: BrandKitControlsProps) {
  const {
    brand,
    selectedBrandPresetId,
    brandPresetOverrides,
    customBrandPresets,
    updateBrand,
    saveCurrentBrandPreset,
    deleteCustomBrandPreset,
    selectBrandPreset,
    saveBrandPreset,
    resetBrandPreset,
    resetAllSectionStyles,
    systemTitle,
    setSystemTitle,
  } = useEditorStore();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [presetName, setPresetName] = useState("");
  const [slotLabel, setSlotLabel] = useState("");
  const editablePresets = useMemo(
    () => BRAND_PRESETS.map((preset) => brandPresetOverrides[preset.id] ?? preset),
    [brandPresetOverrides]
  );
  const activeSlot = editablePresets.find((preset) => preset.id === selectedBrandPresetId) ?? editablePresets[0];
  const textDefaults = getBrandTextDefaults(brand);
  const applyMasterTheme = (partial: Partial<BrandSettings>) => {
    resetAllSectionStyles();
    updateBrand(partial);
  };

  useEffect(() => {
    setSlotLabel(activeSlot?.label ?? "");
  }, [activeSlot?.label, activeSlot?.id]);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateBrand({ logoUrl: typeof reader.result === "string" ? reader.result : null });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      <section className="space-y-2">
        <SectionTitle icon={Palette} title="Brand Slots" />
        <div className="grid grid-cols-1 gap-2">
          {editablePresets.map((preset) => {
            const selected = selectedBrandPresetId === preset.id;
            const edited = Boolean(brandPresetOverrides[preset.id]);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  selectBrandPreset(preset.id);
                }}
                className={cn(
                  "group rounded-xl border p-3 text-left transition-all",
                  selected
                    ? "border-brand-400/50 bg-brand-500/12 shadow-[0_0_0_1px_rgba(124,58,237,0.18)]"
                    : "border-white/[0.07] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[preset.primaryColor, preset.secondaryColor, preset.dangerColor, preset.successColor].map((color) => (
                      <span
                        key={color}
                        className="h-4 w-4 rounded-full border border-black/35"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white/75">
                    {preset.label}
                  </span>
                  {edited && (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-200">
                      EDITED
                    </span>
                  )}
                  {selected && <Check className="h-3.5 w-3.5 text-brand-300" />}
                </div>
                <p className="mt-1.5 text-[10px] leading-relaxed text-white/35">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-brand-400/20 bg-brand-500/[0.06] p-2.5">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-brand-100/60">
            <Save className="h-3 w-3" />
            Save Selected Slot
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={slotLabel}
              onChange={(event) => setSlotLabel(event.target.value)}
              placeholder={activeSlot?.label ?? "Brand Slot"}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-xs text-white/75 placeholder:text-white/20 focus:border-brand-400/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => saveBrandPreset(slotLabel)}
              className="rounded-lg border border-brand-400/30 bg-brand-500/20 px-3 text-xs font-semibold text-brand-100 transition-colors hover:bg-brand-500/30"
            >
              슬롯 저장
            </button>
          </div>
          <button
            type="button"
            onClick={() => resetBrandPreset()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 text-[11px] font-medium text-white/40 transition-colors hover:border-white/15 hover:text-white/65"
          >
            <RotateCcw className="h-3 w-3" />
            선택 슬롯 기본값 복원
          </button>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/35">
            <BookmarkPlus className="h-3 w-3" />
            My Presets
          </div>
          {customBrandPresets.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {customBrandPresets.map((preset) => (
                <div key={preset.id} className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-black/15 p-2">
                  <button
                    type="button"
                  onClick={() => {
                    updateBrand({ ...preset });
                    setSystemTitle(preset.serviceName);
                    resetAllSectionStyles();
                  }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-xs font-semibold text-white/65">{preset.label}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-white/30">{preset.tenantName}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCustomBrandPreset(preset.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 transition-colors hover:bg-red-500/10 hover:text-red-200"
                    aria-label={`${preset.label} 삭제`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder={`${brand.tenantName} ${brand.productName}`}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-xs text-white/75 placeholder:text-white/20 focus:border-brand-400/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                saveCurrentBrandPreset(presetName);
                setPresetName("");
              }}
              className="rounded-lg border border-brand-400/30 bg-brand-500/15 px-3 text-xs font-semibold text-brand-100 transition-colors hover:bg-brand-500/25"
            >
              저장
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle icon={Type} title="Identity" />
        <TextRow label="고객사" value={brand.tenantName} onChange={(tenantName) => updateBrand({ tenantName })} />
        <TextRow
          label="서비스명"
          value={brand.serviceName}
          onChange={(serviceName) => {
            updateBrand({ serviceName });
            setSystemTitle(serviceName);
          }}
        />
        <TextRow label="제품명" value={brand.productName} onChange={(productName) => updateBrand({ productName })} />
        <TextRow label="헤더 타이틀" value={systemTitle} onChange={(value) => {
          setSystemTitle(value);
          updateBrand({ serviceName: value });
        }} />
      </section>

      <section className="space-y-2">
        <SectionTitle icon={ImagePlus} title="Logo" />
        <button
          type="button"
          onClick={() => logoInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-4 text-xs text-white/35 transition-all hover:border-brand-400/40 hover:text-white/60"
        >
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logoUrl} alt="Tenant logo" className="h-8 max-w-[180px] object-contain" />
          ) : (
            <>
              <ImagePlus className="h-3.5 w-3.5" />
              고객사 로고 업로드
            </>
          )}
        </button>
        <input ref={logoInputRef} type="file" accept=".png,.svg,.jpg,.jpeg" className="hidden" onChange={handleLogoChange} />
        <NumberRow
          label="로고 크기"
          value={brand.logoSize}
          min={20}
          max={44}
          unit="px"
          onChange={(logoSize) => updateBrand({ logoSize })}
        />
      </section>

      <section className="space-y-2">
        <SectionTitle icon={Palette} title="Color Tokens" />
        <ColorRow label="Primary" value={brand.primaryColor} onChange={(primaryColor) => applyMasterTheme({ primaryColor })} />
        <ColorRow label="Secondary" value={brand.secondaryColor} onChange={(secondaryColor) => applyMasterTheme({ secondaryColor })} />
        <ColorRow label="Accent" value={brand.accentColor} onChange={(accentColor) => applyMasterTheme({ accentColor })} />
        <ColorRow label="Success" value={brand.successColor} onChange={(successColor) => applyMasterTheme({ successColor })} />
        <ColorRow label="Warning" value={brand.warningColor} onChange={(warningColor) => applyMasterTheme({ warningColor })} />
        <ColorRow label="Danger" value={brand.dangerColor} onChange={(dangerColor) => applyMasterTheme({ dangerColor })} />
        {!compact && (
          <>
            <ColorRow label="Background" value={brand.backgroundColor} onChange={(backgroundColor) => applyMasterTheme({ backgroundColor })} />
            <ColorRow label="Surface" value={brand.surfaceColor} onChange={(surfaceColor) => applyMasterTheme({ surfaceColor })} />
            <ColorRow label="Border" value={brand.borderColor} onChange={(borderColor) => applyMasterTheme({ borderColor })} />
            <ColorRow label="Text Strong" value={brand.textStrongColor ?? textDefaults.textStrongColor} onChange={(textStrongColor) => applyMasterTheme({ textStrongColor })} />
            <ColorRow label="Text" value={brand.textColor ?? textDefaults.textColor} onChange={(textColor) => applyMasterTheme({ textColor })} />
            <ColorRow label="Text Soft" value={brand.textSoftColor ?? textDefaults.textSoftColor} onChange={(textSoftColor) => applyMasterTheme({ textSoftColor })} />
          </>
        )}
      </section>

      <section className="space-y-2">
        <SectionTitle icon={SlidersHorizontal} title="Style System" />
        <SelectRow label="Font" value={brand.fontFamily} options={FONTS} onChange={(fontFamily) => applyMasterTheme({ fontFamily })} />
        <SelectRow label="Radius" value={brand.radius} options={RADIUS_OPTIONS} onChange={(radius) => applyMasterTheme({ radius })} />
        <SelectRow label="Density" value={brand.density} options={DENSITY_OPTIONS} onChange={(density) => applyMasterTheme({ density })} />
        <SelectRow label="Map tone" value={brand.mapTone} options={MAP_TONE_OPTIONS} onChange={(mapTone) => applyMasterTheme({ mapTone })} />
      </section>

      <button
        type="button"
        onClick={resetAllSectionStyles}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.06] px-3 py-2.5 text-xs font-medium text-cyan-100/60 transition-colors hover:border-cyan-300/35 hover:text-cyan-50/80"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        모든 영역을 현재 브랜드 테마로 맞추기
      </button>

      <button
        type="button"
        onClick={() => {
          updateBrand({ ...DEFAULT_BRAND });
          setSystemTitle(DEFAULT_BRAND.serviceName);
          resetAllSectionStyles();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-white/45 transition-colors hover:border-white/15 hover:text-white/70"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        기본 AIM GUARD로 복원
      </button>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-white/30" />
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">{title}</p>
    </div>
  );
}

function TextRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="flex-shrink-0 text-xs text-white/60">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-0 flex-1 bg-transparent text-right text-xs text-white/80 placeholder:text-white/20 focus:outline-none"
      />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const commit = (next: string) => {
    const normalized = normalizeHex(next);
    setDraft(next);
    if (normalized) onChange(normalized);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="flex-shrink-0 text-xs text-white/60">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => commit(event.target.value)}
          onBlur={() => setDraft(normalizeHex(draft) ?? value)}
          spellCheck={false}
          className="w-[96px] rounded-md border border-white/[0.08] bg-black/20 px-2 py-1 text-right font-mono text-[10px] uppercase text-white/55 focus:border-cyan-300/35 focus:outline-none"
          placeholder="#2563EB"
        />
        <ColorTokenPicker label={label} value={value} onChange={commit} />
      </div>
    </div>
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-white/60">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(event) => onChange(clamp(Number(event.target.value) || min))}
            className="w-14 rounded-md border border-white/[0.08] bg-black/20 px-1.5 py-1 text-right text-[10px] text-white/60 focus:outline-none"
          />
          <span className="text-[10px] text-white/30">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className="w-full accent-brand-400"
      />
    </div>
  );
}

function normalizeHex(value: string) {
  const clean = value.trim();
  const withHash = clean.startsWith("#") ? clean : `#${clean}`;
  return /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(withHash) ? withHash.toUpperCase() : null;
}

function SelectRow<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<T | { value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="text-xs text-white/60">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="bg-transparent text-right text-xs text-white/70 focus:outline-none"
      >
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value} className="bg-[#0a0a14]">
              {item.label}
            </option>
          );
        })}
      </select>
    </div>
  );
}
