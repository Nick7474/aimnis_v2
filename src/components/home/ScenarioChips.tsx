"use client";

import { motion } from "framer-motion";
import { Zap, Camera, Building2 } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { scenarios } from "@/data/scenarios";
import { cn } from "@/lib/utils";

const ICONS = { Zap, Camera, Building2 } as Record<string, React.FC<{ className?: string }>>;

interface ScenarioChipsProps {
  onSelect: (injection: string) => void;
}

export default function ScenarioChips({ onSelect }: ScenarioChipsProps) {
  const { selectedScenario, setSelectedScenario } = useHomeStore();

  const handleClick = (s: (typeof scenarios)[number]) => {
    setSelectedScenario(s.id);
    onSelect(s.injection);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {scenarios.map((s) => {
        const Icon = ICONS[s.icon] ?? Zap;
        const isActive = selectedScenario === s.id;

        return (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => handleClick(s)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200",
              isActive
                ? "text-white"
                : "border-white/10 bg-white/5 text-white/50 hover:text-white/70"
            )}
            style={
              isActive
                ? {
                    borderColor: s.color + "60",
                    backgroundColor: s.color + "15",
                    color: s.color,
                    boxShadow: `0 0 12px ${s.color}40`,
                  }
                : undefined
            }
          >
            <Icon className="h-3 w-3" />
            {s.label}
            {isActive && (
              <motion.span
                layoutId="scenario-dot"
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
