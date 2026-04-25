"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Save, Maximize2, Globe, X, Check, FileCode2 } from "lucide-react";
import Link from "next/link";
import { DndContext, DragOverlay, type DragEndEvent } from "@dnd-kit/core";
import { useEditorStore } from "@/store/editorStore";
import type { OverlayWidget } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import ChatPanel from "./ChatPanel";
import CanvasPanel from "./CanvasPanel";
import FloatingToolbar from "./FloatingToolbar";
import DynamicPanel from "./panels/DynamicPanel";
import RightSidebarDropZone from "./RightSidebarDropZone";

const MonitorWrapper = dynamic(() => import("./MonitorWrapper"), { ssr: false });
const OverlayCanvas = dynamic(() => import("./OverlayCanvas"), { ssr: false });
import type { SolutionManifest, SolutionTemplate, SolutionWidget } from "@/lib/solutionLoader";

const LS_KEY = "aimnis_harness_draft";

interface EditorLayoutProps {
  solution: SolutionManifest;
  template: SolutionTemplate | null; // 유지 (호환성)
  widgets: SolutionWidget[];
}

export default function EditorLayout({ solution, template, widgets }: EditorLayoutProps) {
  const { rightPanel, setRightPanel, brand, isFullscreen, setFullscreen, publishedUrl, setPublishedUrl,
          addToRightPanel, insertToRightPanel, updateOverlayWidgetPosition, reorderRightPanel } = useEditorStore();

  const [activeDragWidget, setActiveDragWidget] = useState<OverlayWidget | null>(null);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over, active, delta } = event;

      // 우측 패널 내부 정렬 (rp-card → rp-card)
      if (
        active.id.toString().startsWith("rp-card-") &&
        over?.id.toString().startsWith("rp-card-")
      ) {
        const activeWidgetId = active.id.toString().replace("rp-card-", "");
        const overWidgetId = over.id.toString().replace("rp-card-", "");
        reorderRightPanel(activeWidgetId, overWidgetId);
        setActiveDragWidget(null);
        return;
      }

      const widget = active.data.current?.overlayWidget as OverlayWidget | undefined;
      setActiveDragWidget(null);

      if (!widget) return;

      if (over?.id.toString().startsWith("rp-slot-")) {
        const index = parseInt(over.id.toString().replace("rp-slot-", ""), 10);
        insertToRightPanel(widget, index);
      } else if (
        over?.id === "right-sidebar-dropzone" ||
        over?.id.toString().startsWith("rp-card-")
      ) {
        addToRightPanel(widget);
      } else {
        // 캔버스에서 드롭 → 위치 이동
        updateOverlayWidgetPosition(widget.id, widget.x + delta.x, widget.y + delta.y);
      }
    },
    [addToRightPanel, insertToRightPanel, updateOverlayWidgetPosition, reorderRightPanel]
  );
  const [saved, setSaved] = useState(false);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [harnessBadge, setHarnessBadge] = useState<string | null>(null);

  // localStorage에서 harness 데이터 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY) ?? sessionStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw) as { md: string; scenario: string; savedAt: number };
        // 24시간 이내 데이터만 사용
        if (Date.now() - data.savedAt < 86_400_000 && data.scenario) {
          setHarnessBadge(data.scenario);
        }
      }
    } catch {
      // 파싱 오류 무시
    }
  }, []);

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
    <DndContext
      onDragStart={(e) => setActiveDragWidget(e.active.data.current?.overlayWidget ?? null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragWidget(null)}
    >
    <div className="flex h-screen flex-col overflow-hidden bg-[#080810]">
      {/* 전역 플로팅 툴바 — portal로 body에 마운트 */}
      <FloatingToolbar />

      {/* 상단 툴바 */}
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0a14] px-4">
        {/* 좌측: 로고 + 솔루션명 */}
        <div className="flex items-center gap-3">
          <Link href="/home" className="flex items-center gap-2.5">
            <img src="/img/Aimnis_Symbol.svg" alt="AIMNIS Logo" className="h-[24px] w-[24px] object-contain drop-shadow-xl" />
            <span className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>AIMNIS</span>
          </Link>
          <span className="text-white/15">/</span>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center">
              <Shield className="h-4 w-4 text-[#94a3b8]" />
            </div>
            <span className="text-xs font-medium text-white/80">{solution.name}</span>
          </div>
          {/* Harness 뱃지 */}
          <AnimatePresence>
            {harnessBadge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-md border border-brand-500/20 bg-brand-500/10 px-2 py-0.5"
              >
                <FileCode2 className="h-2.5 w-2.5 text-brand-400" />
                <span className="text-[9px] text-brand-400">{harnessBadge} 하네스 로드됨</span>
              </motion.div>
            )}
          </AnimatePresence>

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

        {/* 중앙 캔버스 flex-1 — 빈 영역 클릭 시 선택 해제 */}
        <main
          className="relative flex-1 overflow-hidden"
          onClick={() => useEditorStore.getState().setSelectedElement(null)}
        >
          <MonitorWrapper />
          <OverlayCanvas />
          <RightSidebarDropZone />
        </main>

        {/* 우측 패널 320px */}
        <aside className="flex w-[320px] flex-shrink-0 flex-col border-l border-white/5 bg-[#0a0a14]">
          <DynamicPanel dataConnectors={solution.dataConnectors} widgets={widgets} />
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
            <MonitorWrapper />
            <OverlayCanvas />
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

    {/* 드래그 고스트 — 실제 위젯 카드 모양 */}
    <DragOverlay dropAnimation={null}>
      {activeDragWidget && (
        <div
          style={{
            width: activeDragWidget.w,
            height: activeDragWidget.h,
            background: "rgba(7,15,36,0.88)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(0,212,255,0.45)",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,255,0.15)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            cursor: "grabbing",
          }}
        >
          <span className="text-xs font-semibold text-brand-300">{activeDragWidget.title}</span>
          <span className="rounded-md bg-brand-500/10 px-2 py-0.5 text-[9px] text-brand-400/70">
            {activeDragWidget.type}
          </span>
          <span className="text-[8px] text-white/20">우측 패널로 드롭 또는 캔버스에서 이동</span>
        </div>
      )}
    </DragOverlay>
    </DndContext>
  );
}
