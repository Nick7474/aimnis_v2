"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useHomeStore } from "@/store/homeStore";
import HomeHero from "./HomeHero";
import HomeV2 from "./HomeV2";
import type { SolutionManifest, AnalysisStep } from "@/lib/solutionLoader";

interface HomeWorkspaceProps {
  solutions: SolutionManifest[];
  analysisStepsMap: Record<string, AnalysisStep[]>;
}

export default function HomeWorkspace({ solutions, analysisStepsMap }: HomeWorkspaceProps) {
  const { isWorking } = useHomeStore();

  return (
    <AnimatePresence mode="wait">
      {!isWorking ? (
        <motion.div
          key="hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <HomeHero solutions={solutions} analysisStepsMap={analysisStepsMap} />
        </motion.div>
      ) : (
        <motion.div
          key="workspace"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="h-full"
        >
          <HomeV2 />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
