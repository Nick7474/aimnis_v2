"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Map,
  Palette,
  Navigation,
  Bell,
  Settings2,
  Layers,
  Zap,
  SlidersHorizontal,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import MappingPanel from "../MappingPanel";
import SettingsPanel from "../SettingsPanel";
import type { SolutionWidget } from "@/lib/solutionLoader";

// ── panelType → 탭 메타데이터 ────────────────────────────────
const PANEL_META = {
  mapping: {
    icon: Link2,
    label: "API 매핑",
    color: "purple",
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
    label: "프로젝트 설정",
    color: "slate",
  },
} as const;

type PanelKey = keyof typeof PANEL_META;

interface DynamicPanelProps {
  dataConnectors: string[];
  widgets: SolutionWidget[];
}

// ── 브랜드 패널 stub ─────────────────────────────────────────
function BrandPanel() {
  const { brand, updateBrand } = useEditorStore();
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
        브랜드 설정
      </p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-white/50">주 컬러</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brand.primaryColor}
              onChange={(e) => updateBrand({ primaryColor: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="font-mono text-xs text-white/40">{brand.primaryColor}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-white/50">보조 컬러</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brand.secondaryColor}
              onChange={(e) => updateBrand({ secondaryColor: e.target.value })}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
            />
            <span className="font-mono text-xs text-white/40">{brand.secondaryColor}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-white/50">폰트</label>
          <select
            value={brand.fontFamily}
            onChange={(e) => updateBrand({ fontFamily: e.target.value })}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 focus:outline-none"
          >
            {["Inter", "Noto Sans KR", "Roboto", "Pretendard"].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ── GIS 패널 stub ────────────────────────────────────────────
function GisPanel() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
        GIS 설정
      </p>
      <div className="flex flex-col gap-2">
        {[
          { label: "위성 레이어", on: true },
          { label: "CCTV 마커", on: true },
          { label: "센서 마커", on: true },
          { label: "알람 마커", on: true },
          { label: "구역 경계선", on: false },
        ].map((layer) => (
          <div
            key={layer.label}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/3 px-3 py-2"
          >
            <span className="text-xs text-white/60">{layer.label}</span>
            <div
              className={cn(
                "h-4 w-7 rounded-full transition-colors",
                layer.on ? "bg-teal-500" : "bg-white/10"
              )}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        <label className="text-[11px] text-white/50">기본 줌 레벨</label>
        <input
          type="range"
          min={10}
          max={20}
          defaultValue={15}
          className="w-full accent-teal-500"
        />
      </div>
    </div>
  );
}

// ── 알람 패널 stub ───────────────────────────────────────────
function AlarmRulesPanel() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
        알람 규칙
      </p>
      <div className="flex flex-col gap-2">
        {[
          { level: "CRITICAL", color: "#DC2626", label: "긴급" },
          { level: "WARNING", color: "#F59E0B", label: "경고" },
          { level: "INFO", color: "#3B82F6", label: "정보" },
        ].map((rule) => (
          <div
            key={rule.level}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/3 px-3 py-2.5"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: rule.color, boxShadow: `0 0 6px ${rule.color}` }}
            />
            <span className="flex-1 text-xs text-white/70">{rule.label}</span>
            <span className="text-[10px] text-white/30">{rule.level}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-1.5">
        <label className="text-[11px] text-white/50">최대 표시 개수</label>
        <input
          type="number"
          defaultValue={50}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 focus:outline-none"
        />
      </div>
    </div>
  );
}

// ── 네비게이션 패널 stub ─────────────────────────────────────
function NavigationPanel() {
  const items = [
    "Map 기반 모니터링",
    "영상모니터링",
    "이벤트",
    "통계",
    "이벤트 규칙",
    "설정",
  ];
  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
        메뉴 구성
      </p>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/3 px-3 py-2"
          >
            <span className="h-1 w-3 rounded bg-white/20" />
            <span className="flex-1 text-xs text-white/60">{item}</span>
            <SlidersHorizontal className="h-3 w-3 text-white/20" />
          </div>
        ))}
      </div>
      <button className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 py-2 text-xs text-white/30 hover:border-white/20 hover:text-white/50 transition-colors">
        + 메뉴 추가
      </button>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
export default function DynamicPanel({ dataConnectors, widgets }: DynamicPanelProps) {
  const { rightPanel, setRightPanel, selectedElement } = useEditorStore();

  const current = PANEL_META[rightPanel as PanelKey] ?? PANEL_META.settings;
  const Icon = current.icon;

  return (
    <div className="flex h-full flex-col">
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

      {/* 보조 탭 — mapping / settings는 상시 노출 */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setRightPanel("mapping")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors",
            rightPanel === "mapping"
              ? "border-b-2 border-purple-500 text-purple-300"
              : "text-white/30 hover:text-white/50"
          )}
        >
          <Link2 className="h-3 w-3" />
          API 매핑
        </button>
        <button
          onClick={() => setRightPanel("settings")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors",
            rightPanel === "settings"
              ? "border-b-2 border-purple-500 text-purple-300"
              : "text-white/30 hover:text-white/50"
          )}
        >
          <Settings2 className="h-3 w-3" />
          세팅
        </button>
      </div>

      {/* panelType 전용 탭 — mapping/settings 외 타입이 선택됐을 때만 노출 */}
      <AnimatePresence>
        {rightPanel !== "mapping" && rightPanel !== "settings" && (
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
      <div className="flex-1 overflow-y-auto">
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
