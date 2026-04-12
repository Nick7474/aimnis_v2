"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Save, Maximize2, Globe, Link2, Settings2, X, Check } from "lucide-react";
import Link from "next/link";
import { useEditorStore } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import ChatPanel from "./ChatPanel";
import CanvasPanel from "./CanvasPanel";
import MappingPanel from "./MappingPanel";
import SettingsPanel from "./SettingsPanel";
import type { SolutionManifest, SolutionTemplate, SolutionWidget } from "@/lib/solutionLoader";

interface EditorLayoutProps {
  solution: SolutionManifest;
  template: SolutionTemplate | null; // 유지 (호환성)
  widgets: SolutionWidget[];
}

export default function EditorLayout({ solution, template, widgets }: EditorLayoutProps) {
  const { rightPanel, setRightPanel, brand, isFullscreen, setFullscreen, publishedUrl, setPublishedUrl } =
    useEditorStore();
  const [saved, setSaved] = useState(false);
  const [showPublishToast, setShowPublishToast] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePublish = () => {
    const random = Math.random().toString(36).slice(2, 8);
    const url = `https://${solution.id}.aimnis.ai/${random}`;
    setPublishedUrl(url);
    setShowPublishToast(true);
    setTimeout(() => setShowPublishToast(false), 4000);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#080810]">
      {/* 상단 툴바 */}
      <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0a14] px-4">
        {/* 좌측: 로고 + 솔루션명 */}
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-xs">AIMNIS</span>
          </Link>
          <span className="text-white/15">/</span>
          <div className="flex items-center gap-2">
            <div
              className="h-5 w-5 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${solution.color}20` }}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: solution.color }} />
            </div>
            <span className="text-xs font-medium text-white/80">{solution.name}</span>
          </div>
          {/* 저장 상태 */}
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-[10px] text-emerald-400"
              >
                <Check className="h-3 w-3" /> 저장됨
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* 우측: 액션 버튼 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            <Save className="h-3 w-3" />
            저장
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            <Maximize2 className="h-3 w-3" />
            확대
          </button>
          <button
            onClick={handlePublish}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
          >
            <Globe className="h-3 w-3" />
            퍼블리시
          </button>
        </div>
      </header>

      {/* 3패널 본문 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 채팅 패널 280px */}
        <aside className="flex w-[280px] flex-shrink-0 flex-col border-r border-white/5 bg-[#0a0a14]">
          <div className="border-b border-white/5 px-4 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">AI 어시스턴트</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel solutionId={solution.id} />
          </div>
        </aside>

        {/* 중앙 캔버스 flex-1 */}
        <main className="relative flex-1 overflow-hidden">
          <CanvasPanel />
        </main>

        {/* 우측 패널 320px */}
        <aside className="flex w-[320px] flex-shrink-0 flex-col border-l border-white/5 bg-[#0a0a14]">
          {/* 패널 탭 */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setRightPanel("mapping")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                rightPanel === "mapping" ? "border-b-2 border-purple-500 text-purple-300" : "text-white/30 hover:text-white/50"
              )}
            >
              <Link2 className="h-3 w-3" />
              API 매핑
            </button>
            <button
              onClick={() => setRightPanel("settings")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                rightPanel === "settings" ? "border-b-2 border-purple-500 text-purple-300" : "text-white/30 hover:text-white/50"
              )}
            >
              <Settings2 className="h-3 w-3" />
              세팅
            </button>
          </div>

          {/* 패널 콘텐츠 */}
          <div className="flex-1 overflow-hidden">
            {rightPanel === "mapping" ? (
              <MappingPanel dataConnectors={solution.dataConnectors} />
            ) : (
              <SettingsPanel widgets={widgets} />
            )}
          </div>
        </aside>
      </div>

      {/* 풀스크린 모달 (F-012) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#080810]"
          >
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={() => setFullscreen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CanvasPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 퍼블리시 토스트 (F-012) */}
      <AnimatePresence>
        {showPublishToast && publishedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-500/20 bg-[#0d1f2a] px-4 py-3 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-white">퍼블리시 완료!</p>
                <p className="mt-0.5 font-mono text-[10px] text-emerald-400">{publishedUrl}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
