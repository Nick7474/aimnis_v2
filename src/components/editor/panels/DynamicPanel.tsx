"use client";

import { useRef } from "react";
import type { ChangeEvent, ComponentType, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Map,
  Palette,
  Navigation,
  Bell,
  Settings2,
  SlidersHorizontal,
  ImagePlus,
  Type,
  Radar,
  ListChecks,
  LayoutGrid,
  RotateCcw,
  ChevronLeft,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { WidgetProperties } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import MappingPanel from "../MappingPanel";
import SettingsPanel from "../SettingsPanel";
import ColorTokenPicker from "../ColorTokenPicker";
import type { SolutionWidget } from "@/lib/solutionLoader";
import { getBrandTextDefaults, type BrandDensity, type BrandMapTone, type BrandRadius } from "@/lib/brandPresets";

// ── panelType → 탭 메타데이터 ────────────────────────────────
const PANEL_META = {
  mapping: {
    icon: Link2,
    label: "연결 상태",
    color: "emerald",
  },
  brand: {
    icon: Palette,
    label: "브랜드",
    color: "pink",
  },
  gis: {
    icon: Map,
    label: "GIS 설정",
    color: "teal",
  },
  alarm: {
    icon: Bell,
    label: "알람 규칙",
    color: "amber",
  },
  navigation: {
    icon: Navigation,
    label: "메뉴 구성",
    color: "sky",
  },
  settings: {
    icon: Settings2,
    label: "화이트 라벨",
    color: "slate",
  },
  widget: {
    icon: LayoutGrid,
    label: "위젯 편집",
    color: "violet",
  },
} as const;

const WIDGET_PROPS: Record<
  string,
  Array<{
    key: keyof WidgetProperties;
    label: string;
    type: "text" | "color" | "range" | "select";
    min?: number;
    max?: number;
    options?: string[];
  }>
> = {
  kpi: [
    { key: "title", label: "타이틀", type: "text" },
    { key: "themeColor", label: "강조 색상", type: "color" },
  ],
  "chart-line": [
    { key: "title", label: "타이틀", type: "text" },
    { key: "themeColor", label: "라인 색상", type: "color" },
    { key: "dataSource", label: "데이터 소스", type: "select", options: ["energy-sensor", "cctv", "air-quality", "worker-safety"] },
    { key: "refreshInterval", label: "갱신 주기", type: "range", min: 500, max: 5000 },
  ],
  "chart-bar": [
    { key: "title", label: "타이틀", type: "text" },
    { key: "themeColor", label: "막대 색상", type: "color" },
    { key: "dataSource", label: "데이터 소스", type: "select", options: ["energy-sensor", "cctv", "air-quality", "worker-safety"] },
  ],
  "chart-donut": [
    { key: "title", label: "타이틀", type: "text" },
    { key: "themeColor", label: "세그먼트 색상", type: "color" },
  ],
  gauge: [
    { key: "title", label: "타이틀", type: "text" },
    { key: "themeColor", label: "게이지 색상", type: "color" },
    { key: "value", label: "현재값", type: "range", min: 0, max: 100 },
    { key: "threshold", label: "임계값", type: "range", min: 0, max: 100 },
  ],
  "alert-panel": [
    { key: "title", label: "타이틀", type: "text" },
    { key: "label", label: "레이블", type: "text" },
  ],
};

type PanelKey = keyof typeof PANEL_META;

interface DynamicPanelProps {
  dataConnectors: string[];
  widgets: SolutionWidget[];
}

// ── 브랜드 패널 stub ─────────────────────────────────────────
function BrandPanel() {
  const { brand, sectionStyles, updateBrand, updateSectionStyle, resetSectionStyle, setSystemTitle, selectedElement } = useEditorStore();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerStyle = sectionStyles.header ?? {};
  const headerTextDefaults = getBrandTextDefaults({ ...brand, backgroundColor: headerStyle.surfaceColor ?? brand.backgroundColor });

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
    <InspectorFrame
      eyebrow="Header Inspector"
      title={selectedElement?.label ?? "헤더"}
      description="고객사 로고와 서비스명을 먼저 바꾸면 납품형 화면이라는 인상이 가장 빠르게 생깁니다."
    >
      <InspectorSection icon={ImagePlus} title="Logo">
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
        <NumberControl
          label="로고 크기"
          value={brand.logoSize}
          min={20}
          max={44}
          unit="px"
          onChange={(logoSize) => updateBrand({ logoSize })}
        />
      </InspectorSection>

      <InspectorSection icon={Type} title="Identity">
        <TextControl label="고객사" value={brand.tenantName} onChange={(tenantName) => updateBrand({ tenantName })} />
        <TextControl
          label="서비스명"
          value={brand.serviceName}
          onChange={(serviceName) => {
            updateBrand({ serviceName });
            setSystemTitle(serviceName);
          }}
        />
        <TextControl label="제품명" value={brand.productName} onChange={(productName) => updateBrand({ productName })} />
      </InspectorSection>

      <InspectorSection icon={Palette} title="Header Tone">
        <ColorControl label="헤더 배경" value={headerStyle.surfaceColor ?? brand.surfaceColor} onChange={(surfaceColor) => updateSectionStyle("header", { surfaceColor })} />
        <ColorControl label="보더" value={headerStyle.borderColor ?? brand.borderColor} onChange={(borderColor) => updateSectionStyle("header", { borderColor })} />
        <ColorControl label="강조 색상" value={headerStyle.accentColor ?? brand.accentColor} onChange={(accentColor) => updateSectionStyle("header", { accentColor, primaryColor: accentColor })} />
        <ColorControl label="제목 텍스트" value={headerStyle.textStrongColor ?? brand.textStrongColor ?? headerTextDefaults.textStrongColor} onChange={(textStrongColor) => updateSectionStyle("header", { textStrongColor })} />
        <ColorControl label="보조 텍스트" value={headerStyle.textSoftColor ?? brand.textSoftColor ?? headerTextDefaults.textSoftColor} onChange={(textSoftColor) => updateSectionStyle("header", { textSoftColor })} />
      </InspectorSection>

      <SectionResetButton label="헤더를 브랜드 테마로 복원" onClick={() => resetSectionStyle("header")} />

      <SuggestionCard items={["로고와 서비스명을 먼저 맞추기", "헤더 배경은 Surface 토큰과 연결", "전체 프리셋 저장은 브랜드 설정 탭에서 관리"]} />
    </InspectorFrame>
  );
}

// ── GIS 패널 stub ────────────────────────────────────────────
function GisPanel() {
  const { brand, sectionStyles, updateSectionStyle, resetSectionStyle, selectedElement } = useEditorStore();
  const mapStyle = sectionStyles.map ?? {};
  const mapTextDefaults = getBrandTextDefaults({ ...brand, backgroundColor: mapStyle.backgroundColor ?? brand.backgroundColor });
  return (
    <InspectorFrame
      eyebrow="Map Inspector"
      title={selectedElement?.label ?? "맵 영역"}
      description="맵은 관제 화면의 중심입니다. 톤과 마커 컬러만 바꿔도 고객사 맞춤형 느낌이 강해집니다."
    >
      <InspectorSection icon={Map} title="Map Style">
        <SelectControl
          label="맵 톤"
          value={mapStyle.mapTone ?? brand.mapTone}
          options={[
            { value: "deep", label: "Deep" },
            { value: "blueprint", label: "Blueprint" },
            { value: "satellite", label: "Satellite" },
            { value: "mono", label: "Mono" },
          ]}
          onChange={(mapTone) => updateSectionStyle("map", { mapTone: mapTone as BrandMapTone })}
        />
        <ColorControl label="맵 배경" value={mapStyle.backgroundColor ?? brand.backgroundColor} onChange={(backgroundColor) => updateSectionStyle("map", { backgroundColor })} />
        <ColorControl label="맵 패널 배경" value={mapStyle.surfaceColor ?? brand.surfaceColor} onChange={(surfaceColor) => updateSectionStyle("map", { surfaceColor })} />
        <ColorControl label="맵 라인" value={mapStyle.borderColor ?? brand.borderColor} onChange={(borderColor) => updateSectionStyle("map", { borderColor })} />
        <ColorControl label="맵 텍스트" value={mapStyle.textStrongColor ?? brand.textStrongColor ?? mapTextDefaults.textStrongColor} onChange={(textStrongColor) => updateSectionStyle("map", { textStrongColor })} />
        <ColorControl label="맵 보조 텍스트" value={mapStyle.textSoftColor ?? brand.textSoftColor ?? mapTextDefaults.textSoftColor} onChange={(textSoftColor) => updateSectionStyle("map", { textSoftColor })} />
        <ColorControl label="구역/마커" value={mapStyle.primaryColor ?? brand.primaryColor} onChange={(primaryColor) => updateSectionStyle("map", { primaryColor })} />
      </InspectorSection>

      <InspectorSection icon={Radar} title="Markers & Legend">
        <ColorControl label="CCTV / 주요 포인트" value={mapStyle.secondaryColor ?? brand.secondaryColor} onChange={(secondaryColor) => updateSectionStyle("map", { secondaryColor })} />
        <ColorControl label="정상 Zone" value={mapStyle.successColor ?? brand.successColor} onChange={(successColor) => updateSectionStyle("map", { successColor })} />
        <ColorControl label="주의 구역" value={mapStyle.warningColor ?? brand.warningColor} onChange={(warningColor) => updateSectionStyle("map", { warningColor })} />
      </InspectorSection>

      <SectionResetButton label="맵 영역을 브랜드 테마로 복원" onClick={() => resetSectionStyle("map")} />

      <SuggestionCard items={["Map tone은 납품 산업별 분위기 전환용", "위험 구역은 Warning/Danger 토큰과 연결", "범례와 마커는 동일 토큰을 공유"]} />
    </InspectorFrame>
  );
}

// ── 알람 패널 stub ───────────────────────────────────────────
function AlarmRulesPanel() {
  const { brand, sectionStyles, updateSectionStyle, resetSectionStyle, selectedElement } = useEditorStore();
  const alarmStyle = sectionStyles["alarm-panel"] ?? {};
  const alarmTextDefaults = getBrandTextDefaults({ ...brand, backgroundColor: alarmStyle.surfaceColor ?? brand.backgroundColor });
  return (
    <InspectorFrame
      eyebrow="Alarm Inspector"
      title={selectedElement?.label ?? "알람 패널"}
      description="VC 데모에서는 위험/주의/정상 색상이 고객사 브랜드 안에서 일관되게 움직이는 것이 중요합니다."
    >
      <InspectorSection icon={Bell} title="Severity Tokens">
        <ColorControl label="Critical" value={alarmStyle.dangerColor ?? brand.dangerColor} onChange={(dangerColor) => updateSectionStyle("alarm-panel", { dangerColor })} />
        <ColorControl label="Warning" value={alarmStyle.warningColor ?? brand.warningColor} onChange={(warningColor) => updateSectionStyle("alarm-panel", { warningColor })} />
        <ColorControl label="Normal" value={alarmStyle.successColor ?? brand.successColor} onChange={(successColor) => updateSectionStyle("alarm-panel", { successColor })} />
      </InspectorSection>

      <InspectorSection icon={ListChecks} title="Panel Style">
        <SelectControl
          label="카드 밀도"
          value={alarmStyle.density ?? brand.density}
          options={[
            { value: "compact", label: "Compact" },
            { value: "standard", label: "Standard" },
            { value: "spacious", label: "Spacious" },
          ]}
          onChange={(density) => updateSectionStyle("alarm-panel", { density: density as BrandDensity })}
        />
        <ColorControl label="패널 배경" value={alarmStyle.surfaceColor ?? brand.surfaceColor} onChange={(surfaceColor) => updateSectionStyle("alarm-panel", { surfaceColor })} />
        <ColorControl label="패널 라인" value={alarmStyle.borderColor ?? brand.borderColor} onChange={(borderColor) => updateSectionStyle("alarm-panel", { borderColor })} />
        <ColorControl label="주요 텍스트" value={alarmStyle.textStrongColor ?? brand.textStrongColor ?? alarmTextDefaults.textStrongColor} onChange={(textStrongColor) => updateSectionStyle("alarm-panel", { textStrongColor })} />
        <ColorControl label="보조 텍스트" value={alarmStyle.textSoftColor ?? brand.textSoftColor ?? alarmTextDefaults.textSoftColor} onChange={(textSoftColor) => updateSectionStyle("alarm-panel", { textSoftColor })} />
      </InspectorSection>

      <SectionResetButton label="알람 패널을 브랜드 테마로 복원" onClick={() => resetSectionStyle("alarm-panel")} />

      <SuggestionCard items={["Critical/Warning/Normal은 알람 배지와 범례에 동시 적용", "카드 밀도는 반복 관제 업무의 스캔 속도에 영향", "고급 필드 편집은 추후 TODO 범위"]} />
    </InspectorFrame>
  );
}

// ── 네비게이션 패널 stub ─────────────────────────────────────
function NavigationPanel() {
  const { brand, sectionStyles, updateSectionStyle, resetSectionStyle, selectedElement } = useEditorStore();
  const sidebarStyle = sectionStyles.sidebar ?? {};
  const sidebarTextDefaults = getBrandTextDefaults({ ...brand, backgroundColor: sidebarStyle.surfaceColor ?? brand.backgroundColor });
  return (
    <InspectorFrame
      eyebrow="Navigation Inspector"
      title={selectedElement?.label ?? "사이드바"}
      description="메뉴는 사용자가 매일 보는 영역입니다. 활성 컬러와 밀도를 고객사 운영 습관에 맞춥니다."
    >
      <InspectorSection icon={Navigation} title="Navigation Tone">
        <ColorControl label="활성 메뉴" value={sidebarStyle.primaryColor ?? brand.primaryColor} onChange={(primaryColor) => updateSectionStyle("sidebar", { primaryColor })} />
        <ColorControl label="아이콘/강조" value={sidebarStyle.accentColor ?? brand.accentColor} onChange={(accentColor) => updateSectionStyle("sidebar", { accentColor })} />
        <ColorControl label="사이드바 배경" value={sidebarStyle.surfaceColor ?? brand.surfaceColor} onChange={(surfaceColor) => updateSectionStyle("sidebar", { surfaceColor })} />
        <ColorControl label="라인 컬러" value={sidebarStyle.borderColor ?? brand.borderColor} onChange={(borderColor) => updateSectionStyle("sidebar", { borderColor })} />
        <ColorControl label="비활성 메뉴 텍스트" value={sidebarStyle.textColor ?? brand.textColor ?? sidebarTextDefaults.textColor} onChange={(textColor) => updateSectionStyle("sidebar", { textColor })} />
        <ColorControl label="섹션/버전 텍스트" value={sidebarStyle.textSoftColor ?? brand.textSoftColor ?? sidebarTextDefaults.textSoftColor} onChange={(textSoftColor) => updateSectionStyle("sidebar", { textSoftColor })} />
      </InspectorSection>

      <InspectorSection icon={SlidersHorizontal} title="Menu Feel">
        <SelectControl
          label="메뉴 밀도"
          value={sidebarStyle.density ?? brand.density}
          options={[
            { value: "compact", label: "Compact" },
            { value: "standard", label: "Standard" },
            { value: "spacious", label: "Spacious" },
          ]}
          onChange={(density) => updateSectionStyle("sidebar", { density: density as BrandDensity })}
        />
        <SelectControl
          label="선택 radius"
          value={sidebarStyle.radius ?? brand.radius}
          options={[
            { value: "sharp", label: "Sharp" },
            { value: "soft", label: "Soft" },
            { value: "rounded", label: "Rounded" },
          ]}
          onChange={(radius) => updateSectionStyle("sidebar", { radius: radius as BrandRadius })}
        />
      </InspectorSection>

      <SectionResetButton label="사이드바를 브랜드 테마로 복원" onClick={() => resetSectionStyle("sidebar")} />

      <SuggestionCard items={["메뉴명/순서 편집은 기존 페이지 추가 흐름과 연결 예정", "현 Phase에서는 토큰 기반 톤 편집에 집중", "활성 메뉴 색상은 버튼/탭 포인트와 공유"]} />
    </InspectorFrame>
  );
}

function WidgetInspectorPanel() {
  const {
    selectedElement,
    activeWidgets,
    overlayWidgets,
    brand,
    sectionStyles,
    updateSectionStyle,
    resetSectionStyle,
    updateWidgetProperty,
    setCenterView,
    setRightPanel,
  } = useEditorStore();

  const widget = overlayWidgets.find((item) => item.id === selectedElement?.sectionId);
  const active = activeWidgets.find((item) => item.id === selectedElement?.sectionId);

  if (selectedElement?.type === "floor-status") {
    const floorStyle = sectionStyles["floor-status"] ?? {};
    const floorTextDefaults = getBrandTextDefaults({ ...brand, backgroundColor: floorStyle.surfaceColor ?? brand.backgroundColor });
    return (
      <InspectorFrame
        eyebrow="Panel Inspector"
        title="플로어 상태"
        description="우측 상태 패널도 같은 브랜드 토큰을 사용합니다. 관제 정보 밀도와 포인트 컬러를 빠르게 조정합니다."
      >
        <InspectorSection icon={LayoutGrid} title="Panel Tone">
          <ColorControl label="패널 배경" value={floorStyle.surfaceColor ?? brand.surfaceColor} onChange={(surfaceColor) => updateSectionStyle("floor-status", { surfaceColor })} />
          <ColorControl label="상태 강조" value={floorStyle.secondaryColor ?? brand.secondaryColor} onChange={(secondaryColor) => updateSectionStyle("floor-status", { secondaryColor, accentColor: secondaryColor })} />
          <ColorControl label="패널 라인" value={floorStyle.borderColor ?? brand.borderColor} onChange={(borderColor) => updateSectionStyle("floor-status", { borderColor })} />
          <ColorControl label="주요 텍스트" value={floorStyle.textStrongColor ?? brand.textStrongColor ?? floorTextDefaults.textStrongColor} onChange={(textStrongColor) => updateSectionStyle("floor-status", { textStrongColor })} />
          <ColorControl label="보조 텍스트" value={floorStyle.textSoftColor ?? brand.textSoftColor ?? floorTextDefaults.textSoftColor} onChange={(textSoftColor) => updateSectionStyle("floor-status", { textSoftColor })} />
        </InspectorSection>
        <InspectorSection icon={SlidersHorizontal} title="Density">
          <SelectControl
            label="정보 밀도"
            value={floorStyle.density ?? brand.density}
            options={[
              { value: "compact", label: "Compact" },
              { value: "standard", label: "Standard" },
              { value: "spacious", label: "Spacious" },
            ]}
            onChange={(density) => updateSectionStyle("floor-status", { density: density as BrandDensity })}
          />
        </InspectorSection>
        <SectionResetButton label="플로어 상태를 브랜드 테마로 복원" onClick={() => resetSectionStyle("floor-status")} />
        <SuggestionCard items={["플로어 상태는 장비/CCTV 목록과 같은 Surface 토큰 사용", "밀도 변경은 반복 관제 업무의 스캔 속도를 보여주는 데모 포인트", "상세 컬럼 편집은 Tenant Profile 단계에서 확장 예정"]} />
      </InspectorFrame>
    );
  }

  if (!widget || !active) {
    return (
      <InspectorFrame
        eyebrow="Widget Inspector"
        title="위젯을 선택하세요"
        description="중앙 프리뷰에서 추가한 KPI, 차트, 게이지, 알람 위젯을 클릭하면 이곳에서 바로 편집합니다."
      >
        <SuggestionCard items={["좌측 AI Agent로 위젯 추가", "중앙 위젯 클릭 후 타이틀/색상/값 수정", "데이터 연결은 필요할 때만 매핑 스튜디오로 이동"]} />
      </InspectorFrame>
    );
  }

  const props = active.properties;
  const defs = WIDGET_PROPS[widget.type] ?? [
    { key: "title" as keyof WidgetProperties, label: "타이틀", type: "text" as const },
    { key: "themeColor" as keyof WidgetProperties, label: "색상", type: "color" as const },
  ];

  return (
    <InspectorFrame
      eyebrow="Widget Inspector"
      title={props.title ?? widget.title}
      description="선택한 위젯만 편집합니다. 전역 브랜드 토큰은 유지하면서 필요한 위젯 속성만 조정할 수 있습니다."
    >
      <InspectorSection icon={LayoutGrid} title="Widget Properties">
        {defs.map((def) => {
          const value = props[def.key];
          if (def.type === "color") {
            return (
              <ColorControl
                key={def.key}
                label={def.label}
                value={(value as string) ?? widget.data.color ?? brand.accentColor}
                onChange={(next) => updateWidgetProperty(widget.id, def.key, next)}
              />
            );
          }
          if (def.type === "range") {
            return (
              <RangeControl
                key={def.key}
                label={def.label}
                value={(value as number) ?? (def.key === "value" ? widget.data.gaugeValue : def.min) ?? 0}
                min={def.min ?? 0}
                max={def.max ?? 100}
                onChange={(next) => updateWidgetProperty(widget.id, def.key, next)}
              />
            );
          }
          if (def.type === "select") {
            return (
              <SelectControl
                key={def.key}
                label={def.label}
                value={(value as string) ?? def.options?.[0] ?? ""}
                options={(def.options ?? []).map((option) => ({ value: option, label: option }))}
                onChange={(next) => updateWidgetProperty(widget.id, def.key, next)}
              />
            );
          }
          return (
            <TextControl
              key={def.key}
              label={def.label}
              value={(value as string) ?? widget.title}
              onChange={(next) => updateWidgetProperty(widget.id, def.key, next)}
            />
          );
        })}
      </InspectorSection>

      <InspectorSection icon={Link2} title="Data Binding">
        <button
          type="button"
          onClick={() => {
            setCenterView("mapping");
            setRightPanel("mapping");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-xs font-semibold text-emerald-200 transition-colors hover:bg-emerald-500/15"
        >
          <Link2 className="h-3.5 w-3.5" />
          데이터 매핑 스튜디오 열기
        </button>
      </InspectorSection>

      <SuggestionCard items={["위젯 색상은 현재 브랜드 프리셋을 기본값으로 사용", "개별 색상을 바꾸면 해당 위젯만 오버라이드", "우측 패널로 이동해도 동일 설정 유지"]} />
    </InspectorFrame>
  );
}

function InspectorFrame({
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

function InspectorSection({
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

function SectionResetButton({ label, onClick }: { label: string; onClick: () => void }) {
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

function TextControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
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

function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="flex-shrink-0 text-xs text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const normalized = normalizeHex(event.target.value);
            if (normalized) onChange(normalized);
          }}
          className="w-[96px] rounded-md border border-white/[0.08] bg-black/20 px-2 py-1 text-right font-mono text-[10px] uppercase text-white/55 focus:border-cyan-300/35 focus:outline-none"
        />
        <ColorTokenPicker label={label} value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function NumberControl({
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
        <span className="font-mono text-[10px] text-white/35">{value}{unit}</span>
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

function RangeControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-white/60">{label}</span>
        <span className="font-mono text-[10px] text-white/40">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-brand-400"
      />
    </div>
  );
}

function SelectControl({
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
        className="bg-transparent text-right text-xs text-white/70 focus:outline-none"
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

function SuggestionCard({ items }: { items: string[] }) {
  return (
    <details className="rounded-xl border border-brand-400/15 bg-brand-500/[0.06] p-3">
      <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-brand-100/60">
        AI 제안 변경사항
      </summary>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-[10px] leading-relaxed text-white/35">
            {item}
          </li>
        ))}
      </ul>
    </details>
  );
}

function normalizeHex(value: string) {
  const clean = value.trim();
  const withHash = clean.startsWith("#") ? clean : `#${clean}`;
  return /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(withHash) ? withHash.toUpperCase() : null;
}

// ── 메인 ─────────────────────────────────────────────────────
export default function DynamicPanel({ dataConnectors, widgets }: DynamicPanelProps) {
  const { rightPanel, setRightPanel, selectedElement } = useEditorStore();

  const current = PANEL_META[rightPanel as PanelKey] ?? PANEL_META.settings;
  const Icon = current.icon;

  return (
    <div data-editor-inspector className="flex h-full flex-col">
      {/* 활성 패널 헤더 */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <Icon className="h-3.5 w-3.5 text-white/40" />
        <span className="text-[11px] font-semibold text-white/70">{current.label}</span>
        {selectedElement && (
          <span className="ml-auto rounded-md border border-brand-500/20 bg-brand-500/10 px-2 py-0.5 text-[9px] text-brand-400">
            {selectedElement.label}
          </span>
        )}
      </div>

      {/* 위젯 모드: 탭바 대신 위젯 전용 헤더 */}
      {rightPanel === "widget" ? (
        <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/5 px-3 py-2">
          <button
            onClick={() => setRightPanel("settings")}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/10 hover:text-white/60"
            title="전체 설정으로"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <LayoutGrid className="h-3 w-3 shrink-0 text-violet-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-300">
            위젯 설정
          </span>
          {selectedElement && (
            <span className="ml-auto max-w-[80px] truncate text-[9px] text-violet-400/70">
              {selectedElement.label}
            </span>
          )}
        </div>
      ) : (
        /* 일반 모드: 브랜드 설정 | 연결 탭바 */
        <div className="flex border-b border-white/5 bg-white/[0.015] p-1">
          <button
            onClick={() => setRightPanel("settings")}
            className={cn(
              "flex h-8 flex-[1.25] items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-semibold uppercase tracking-wider transition-colors",
              rightPanel === "settings"
                ? "border-violet-400/20 bg-violet-500/15 text-violet-200"
                : "text-white/35 hover:bg-white/[0.04] hover:text-white/55"
            )}
          >
            <Settings2 className="h-3 w-3 shrink-0" />
            브랜드 설정
          </button>
          <button
            onClick={() => setRightPanel("mapping")}
            className={cn(
              "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-semibold uppercase tracking-wider transition-colors",
              rightPanel === "mapping"
                ? "border-emerald-400/20 bg-emerald-500/12 text-emerald-200"
                : "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
            )}
          >
            <Link2 className="h-3 w-3 shrink-0" />
            연결
          </button>
        </div>
      )}

      {/* panelType 전용 탭 — widget/mapping/settings 외 타입 */}
      <AnimatePresence>
        {rightPanel !== "mapping" && rightPanel !== "settings" && rightPanel !== "widget" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b border-brand-500/20"
          >
            <div className="flex items-center gap-2 bg-brand-500/5 px-4 py-2">
              <Icon className="h-3 w-3 text-brand-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-400">
                {current.label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 패널 콘텐츠 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={rightPanel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="h-full"
          >
            {rightPanel === "mapping" && (
              <MappingPanel dataConnectors={dataConnectors} />
            )}
            {rightPanel === "settings" && (
              <SettingsPanel widgets={widgets} />
            )}
            {rightPanel === "brand" && <BrandPanel />}
            {rightPanel === "gis" && <GisPanel />}
            {rightPanel === "alarm" && <AlarmRulesPanel />}
            {rightPanel === "navigation" && <NavigationPanel />}
            {rightPanel === "widget" && <WidgetInspectorPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
