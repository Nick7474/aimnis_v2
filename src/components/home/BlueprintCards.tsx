"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCode2, Circle, ListChecks, Boxes, Plug, LayoutTemplate, Info } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { scenarios } from "@/data/scenarios";

// ─── 섹션 파서 ────────────────────────────────────────────────
function parseSections(md: string): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let current = "";
  for (const line of md.split("\n")) {
    if (line.startsWith("## ")) {
      current = line.slice(3).trim();
      sections[current] = [];
    } else if (current && line.trim().startsWith("- ")) {
      const item = line.replace(/^[\s-]*(\[[ x]\])?\s*/, "").trim();
      if (item) sections[current].push(item);
    }
  }
  return sections;
}

function getTitle(md: string): string {
  const line = md.split("\n").find((l) => l.startsWith("# "));
  return line ? line.slice(2).trim() : "설계서";
}

// ─── 카드 정의 ────────────────────────────────────────────────
type IconFC = React.FC<{ className?: string; style?: React.CSSProperties }>;

const CARD_DEFS: { key: string; label: string; icon: IconFC; color: string }[] = [
  { key: "Requirements", label: "요구사항", icon: ListChecks as IconFC, color: "#735FE9" },
  { key: "Widgets", label: "위젯 구성", icon: Boxes as IconFC, color: "#7c3aed" },
  { key: "API Mapping", label: "API 연동", icon: Plug as IconFC, color: "#f59e0b" },
  { key: "Pages", label: "페이지 구성", icon: LayoutTemplate as IconFC, color: "#059669" },
];

// ─── 개별 카드 ────────────────────────────────────────────────
function BlueprintCard({
  label,
  icon: Icon,
  color,
  items,
  delay,
}: {
  label: string;
  icon: IconFC;
  color: string;
  items: string[];
  delay: number;
}) {
  const [highlight, setHighlight] = useState(false);
  const prevLen = useRef(0);

  useEffect(() => {
    if (items.length > prevLen.current) {
      setHighlight(true);
      const t = setTimeout(() => setHighlight(false), 800);
      prevLen.current = items.length;
      return () => clearTimeout(t);
    }
    prevLen.current = items.length;
  }, [items.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.03] p-3"
    >
      {/* 하이라이트 오버레이 */}
      <AnimatePresence>
        {highlight && (
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ backgroundColor: color + "15" }}
          />
        )}
      </AnimatePresence>

      {/* 카드 헤더 */}
      <div className="mb-2.5 flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ backgroundColor: color + "20", border: `1px solid ${color}30` }}
        >
          <Icon className="h-3 w-3" style={{ color }} />
        </div>
        <span className="text-[11px] font-semibold text-white/60">{label}</span>
        {items.length > 0 && (
          <span
            className="ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-medium"
            style={{ backgroundColor: color + "20", color }}
          >
            {items.length}
          </span>
        )}
      </div>

      {/* 카드 내용 */}
      {items.length === 0 ? (
        <div className="space-y-1.5">
          {[70, 50, 85].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full bg-white/5"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-1.5"
              >
                <div
                  className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: color + "80" }}
                />
                <span className="text-[11px] leading-relaxed text-white/55">{item}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function BlueprintCards() {
  const { blueprintMd, selectedScenario, turnCount } = useHomeStore();

  const sections = parseSections(blueprintMd);
  const title = getTitle(blueprintMd);
  const scenarioData = scenarios.find((s) => s.id === selectedScenario);

  const fileName =
    selectedScenario === "energy"
      ? "energy_control.md"
      : selectedScenario === "manufacturing"
      ? "manufacturing_vision.md"
      : selectedScenario === "smartcity"
      ? "smartcity_response.md"
      : "blueprint.md";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/[0.07] bg-black/30 backdrop-blur-sm overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          <FileCode2 className="h-3 w-3 text-brand-400/60" />
          <span className="text-[10px] text-white/40 font-mono">{fileName}</span>
        </div>
        {blueprintMd && (
          <div className="ml-auto flex items-center gap-1">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Circle className="h-1.5 w-1.5 fill-brand-400 text-brand-400" />
            </motion.div>
            <span className="text-[9px] text-brand-400/60">live</span>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {/* Project Info 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-500/10 border border-brand-500/20">
              <Info className="h-3 w-3 text-brand-400" />
            </div>
            <span className="text-[11px] font-semibold text-white/60">프로젝트 정보</span>
            {/* 진행 상태 바 */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[9px] text-white/25">{turnCount}/3</span>
              <div className="h-1 w-16 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  animate={{ width: `${(turnCount / 3) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/25 w-12">제목</span>
              <span className="text-[10px] text-white/55">{title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/25 w-12">도메인</span>
              <span className="text-[10px] font-medium" style={{ color: scenarioData?.color ?? "#fff" }}>
                {scenarioData?.label ?? "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/25 w-12">상태</span>
              <span className="text-[10px] text-white/40">
                {turnCount >= 3 ? "✅ 설계 완료" : `인터뷰 진행 중 (${turnCount}/3)`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 섹션 카드들 */}
        {CARD_DEFS.map((def, i) => (
          <BlueprintCard
            key={def.key}
            label={def.label}
            icon={def.icon}
            color={def.color}
            items={sections[def.key] ?? []}
            delay={0.1 + i * 0.07}
          />
        ))}
      </div>
    </div>
  );
}
