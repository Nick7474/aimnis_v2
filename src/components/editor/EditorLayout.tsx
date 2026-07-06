"use client";

import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Save, Maximize2, Globe, X, Check, LayoutDashboard, Database, Rocket, Monitor, Network, Edit3, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DndContext, DragOverlay, type DragEndEvent } from "@dnd-kit/core";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";
import { useRouter } from "next/navigation";
import type { OverlayWidget } from "@/store/editorStore";
import { cn } from "@/lib/utils";
import { brandToCssVars } from "@/lib/brandPresets";
import dynamic from "next/dynamic";
import ChatPanel from "./ChatPanel";
import FloatingToolbar from "./FloatingToolbar";
import DynamicPanel from "./panels/DynamicPanel";
import RightSidebarDropZone from "./RightSidebarDropZone";
import FlowGuardModal, { type FlowGuardScenario } from "@/components/layout/FlowGuardModal";
import { useHomeStore } from "@/store/homeStore";

const MonitorWrapper = dynamic(() => import("./MonitorWrapper"), { ssr: false });
const OverlayCanvas = dynamic(() => import("./OverlayCanvas"), { ssr: false });
const MappingCanvas = dynamic(() => import("./MappingCanvas"), { ssr: false });
import type { SolutionManifest, SolutionTemplate, SolutionWidget } from "@/lib/solutionLoader";

interface EditorLayoutProps {
  solution: SolutionManifest;
  template: SolutionTemplate | null; // 유지 (호환성)
  widgets: SolutionWidget[];
}

const EDITOR_NAV = [
  { href: "/home",     label: "홈",        Icon: LayoutDashboard },
  { href: "/editor",   label: "에디터",    Icon: Shield },
  { href: "/projects", label: "프로젝트",  Icon: Database },
  { href: "/guard",    label: "AIM GUARD", Icon: Shield },
];

const EDITOR_PANEL_MIN = 240;
const EDITOR_PANEL_MAX = 600;

function TopIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center leading-none"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      {children}
    </span>
  );
}

export default function EditorLayout({ solution, template, widgets }: EditorLayoutProps) {
  const pathname = usePathname();
  const [chatPanelWidth, setChatPanelWidth] = useState(280);
  const chatDragging = useRef(false);
  const chatDragStartX = useRef(0);
  const chatDragStartW = useRef(280);

  // 페이지 레벨 접근 보호 (URL 직접 입력 방어)
  const { isComplete } = useHomeStore();
  const [pageGuardModal, setPageGuardModal] = useState<FlowGuardScenario | null>(null);
  const routerForGuard = useRouter();
  useEffect(() => {
    const hasHarness = !!(
      sessionStorage.getItem("aimnis_harness_draft") ||
      localStorage.getItem("aimnis_harness_draft")
    );
    const hasPublish = useProjectStore.getState().projects.length > 0;
    if (!isComplete && !hasPublish) {
      setPageGuardModal("editor-no-interview");
      const t = setTimeout(() => routerForGuard.replace("/home"), 3500);
      return () => clearTimeout(t);
    }
    if (!hasHarness && !hasPublish) {
      setPageGuardModal("editor-no-harness");
      const t = setTimeout(() => routerForGuard.replace("/home"), 3500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlHeight = html.style.height;
    const previousBodyHeight = body.style.height;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.height = "100%";
    window.scrollTo(0, 0);

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      html.style.height = previousHtmlHeight;
      body.style.height = previousBodyHeight;
    };
  }, []);

  const handleChatPanelDrag = (e: React.MouseEvent) => {
    chatDragging.current = true;
    chatDragStartX.current = e.clientX;
    chatDragStartW.current = chatPanelWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (ev: MouseEvent) => {
      if (!chatDragging.current) return;
      const next = Math.min(EDITOR_PANEL_MAX, Math.max(EDITOR_PANEL_MIN, chatDragStartW.current + ev.clientX - chatDragStartX.current));
      setChatPanelWidth(next);
    };
    const onUp = () => {
      chatDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const { centerView, setCenterView, isFullscreen, setFullscreen, publishedUrl, setPublishedUrl,
          addToRightPanel, insertToRightPanel, updateOverlayWidgetPosition, reorderRightPanel, brand,
          showRightPanel, setShowRightPanel, selectedElement, sectionStyles, systemTitle } = useEditorStore();

  // 패널 열림/닫힘은 편집 버튼 단일 진입점으로만 제어
  const brandVars = brandToCssVars(brand) as CSSProperties;

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
  const router = useRouter();
  const publishProject = useProjectStore(s => s.publish);
  const [saved, setSaved] = useState(false);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({ name: "", client: "", versionNote: "" });
  const [publishDone, setPublishDone] = useState<{ id: string } | null>(null);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePublish = () => {
    // 퍼블리시 모달 열기 (기존 이름 미리 채우기)
    setPublishForm({ name: solution.name ?? "", client: "", versionNote: "" });
    setPublishDone(null);
    setShowPublishModal(true);
  };

  const handleConfirmPublish = () => {
    const project = publishProject({
      name: publishForm.name || solution.name,
      solution: solution.id,
      status: "active",
      client: publishForm.client || "미지정",
      description: solution.description ?? "",
      versionNote: publishForm.versionNote,
      tags: [],
      stats: { alerts: 0, uptime: "100%", sensors: 0 },
      harnessFile: null,
      industry: "enterprise",
      // 브랜드 스냅샷 — publish 시점 설정 보존
      brandSnapshot: { ...brand },
      sectionStylesSnapshot: { ...sectionStyles },
      systemTitle,
    });
    setPublishDone({ id: project.id });
    // 기존 publishedUrl도 세팅 (토스트 표시)
    const url = `https://${solution.id}.aimnis.ai/${project.id}`;
    setPublishedUrl(url);
  };

  return (
    <DndContext
      onDragStart={(e) => setActiveDragWidget(e.active.data.current?.overlayWidget ?? null)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragWidget(null)}
    >
    {/* 페이지 레벨 접근 보호 모달 */}
    <FlowGuardModal
      scenario={pageGuardModal}
      onClose={() => { setPageGuardModal(null); routerForGuard.replace("/home"); }}
    />

    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#080810]">
      {/* 전역 플로팅 툴바 — portal로 body에 마운트 */}
      <FloatingToolbar />

      {/* 상단 툴바 */}
      <header className="relative flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0a14] px-4">
        {/* 좌측: 로고 + 솔루션명 */}
        <div className="relative z-20 flex items-center gap-3">
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
          <div className="relative z-20 ml-1 flex h-8 shrink-0 items-center rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
            <button
              type="button"
              onClick={() => setCenterView("monitor")}
              className={cn(
                "flex h-7 w-[72px] shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-medium leading-none transition-colors",
                centerView === "monitor"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/[0.35] hover:text-white/60"
              )}
            >
              <TopIcon><Monitor className="h-3 w-3" /></TopIcon>
              <span className="block">모니터</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCenterView("mapping");
                useEditorStore.getState().setRightPanel("mapping");
              }}
              className={cn(
                "flex h-7 w-[92px] shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-[10px] font-medium leading-none transition-colors",
                centerView === "mapping"
                  ? "bg-emerald-500/15 text-emerald-200 shadow-sm ring-1 ring-emerald-400/20"
                  : "text-white/[0.35] hover:text-white/60"
              )}
            >
              <TopIcon><Network className="h-3 w-3" /></TopIcon>
              <span className="block">데이터 매핑</span>
            </button>
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
                <Check className="h-3 w-3 shrink-0" /> 저장됨
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* 중앙: 네비게이션 (홈과 동일) */}
        <div className="pointer-events-auto absolute left-1/2 z-0 flex h-14 -translate-x-1/2 items-center gap-1">
          {EDITOR_NAV.map(({ href, label, Icon }) => {
            const isActive = pathname === href || (href === "/editor" && pathname?.startsWith("/editor"));
            return (
              <Link key={href} href={href}
                className={cn(
                  "relative flex h-14 min-w-[78px] shrink-0 items-center justify-center gap-1.5 border-b-2 px-3 text-xs transition-colors",
                  isActive
                    ? "text-white border-violet-500"
                    : "text-white/40 border-transparent hover:text-white/70"
                )}
              >
                {isActive && (
                  <motion.span layoutId="editor-nav-active"
                    className="absolute inset-[6px_4px] rounded-md bg-purple-500/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="relative h-3.5 w-3.5 shrink-0" />
                <span className="relative whitespace-nowrap leading-none">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* 우측: 액션 버튼 */}
        <div className="relative z-20 flex items-center gap-1.5">
          {/* 편집 모드 토글 — 전체 브랜드 설정 진입점 */}
          <button
            onClick={() => {
              const next = !showRightPanel;
              setShowRightPanel(next);
              if (next) useEditorStore.getState().setRightPanel("settings");
            }}
            className={cn(
              "flex h-8 w-[64px] shrink-0 items-center justify-center gap-1.5 rounded-lg border text-xs leading-none transition-colors",
              showRightPanel
                ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                : "border-white/10 bg-white/5 text-white/50 hover:text-white/80"
            )}
          >
            <TopIcon><Edit3 className="h-3 w-3" /></TopIcon>
            <span className="block">편집</span>
          </button>
          <button
            onClick={handleSave}
            className="flex h-8 w-[64px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs leading-none text-white/50 transition-colors hover:text-white/80"
          >
            <TopIcon><Save className="h-3 w-3" /></TopIcon>
            <span className="block">저장</span>
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="flex h-8 w-[64px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 text-xs leading-none text-white/50 transition-colors hover:text-white/80"
          >
            <TopIcon><Maximize2 className="h-3 w-3" /></TopIcon>
            <span className="block">확대</span>
          </button>
          <button
            onClick={handlePublish}
            className="flex h-8 w-[86px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-xs leading-none text-white shadow-lg shadow-violet-500/20 transition-colors hover:from-violet-500 hover:to-indigo-500"
          >
            <TopIcon><Rocket className="h-3 w-3" /></TopIcon>
            <span className="block">퍼블리시</span>
          </button>
        </div>
      </header>

      {/* 3패널 본문 */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 좌측 채팅 패널 — 편집 모드 시 210px 왼쪽으로 이동 + 딤 오버레이 */}
        <motion.div
          animate={{ marginLeft: showRightPanel ? -(chatPanelWidth - 70) : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ position: "relative", display: "flex", flexShrink: 0, height: "100%", minHeight: 0, width: chatPanelWidth }}
        >
          <aside
            style={{ width: "100%", flexShrink: 0 }}
            className="flex min-h-0 flex-col overflow-hidden bg-[#0a0a14]"
          >
            {/* 에임이 아바타 헤더 */}
            <div className="flex items-center gap-2.5 border-b border-white/5 px-3 py-2">
              <img src="/img/ch6.png" alt="에임이" className="h-8 w-8 flex-shrink-0 rounded-full ring-1 ring-violet-500/25 object-cover" />
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white/80 leading-tight">에임이 · AIMI</p>
                <p className="text-[10px] text-white/30 leading-tight">에디터 어시스턴트</p>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ChatPanel solutionId={solution.id} />
            </div>
          </aside>

          {/* 딤 오버레이 — 보이는 70px 스트립에 화살표 우측 배치 */}
          <AnimatePresence>
            {showRightPanel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-10 flex cursor-pointer items-center justify-end bg-black/60 backdrop-blur-[1px] group"
                style={{ paddingRight: 14 }}
                onClick={() => setShowRightPanel(false)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <ChevronLeft className="h-5 w-5" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 드래그 핸들 — 편집 모드 아닐 때만 */}
          {!showRightPanel && (
            <div
              onMouseDown={handleChatPanelDrag}
              style={{
                position: "absolute", right: 0, top: 0, bottom: 0,
                width: 1, cursor: "col-resize",
                background: "rgba(255,255,255,0.05)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--primary)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            />
          )}
        </motion.div>

        {/* 중앙 캔버스 flex-1 — 빈 영역 클릭 시 선택 해제 + 우측 패널 닫기 */}
        <main
          className="relative h-full min-h-0 flex-1 overflow-hidden"
          onClick={() => useEditorStore.getState().setSelectedElement(null)}
        >
          {centerView === "monitor" ? (
            <>
              <MonitorWrapper />
              <OverlayCanvas />
              <RightSidebarDropZone />
            </>
          ) : (
            <MappingCanvas dataConnectors={solution.dataConnectors} solutionName={solution.name} />
          )}
        </main>

        {/* 우측 패널 — 컨텍스트 기반, 필요할 때만 슬라이드인 */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.aside
              key="right-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex h-full min-h-0 flex-shrink-0 flex-col overflow-hidden border-l border-white/5 bg-[#0a0a14]"
            >
              <DynamicPanel dataConnectors={solution.dataConnectors} widgets={widgets} />
            </motion.aside>
          )}
        </AnimatePresence>
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
            {centerView === "monitor" ? (
              <>
                <MonitorWrapper />
                <OverlayCanvas />
              </>
            ) : (
              <MappingCanvas dataConnectors={solution.dataConnectors} solutionName={solution.name} />
            )}
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

    {/* ── 퍼블리시 모달 ── */}
    <AnimatePresence>
      {showPublishModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f1a] p-6 shadow-2xl">

            {/* 헤더 */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  {publishDone ? "✅ 퍼블리시 완료" : "프로젝트 퍼블리시"}
                </h2>
                <p className="mt-0.5 text-xs text-white/40">
                  {publishDone ? "프로젝트가 등록됐습니다" : "프로젝트 정보를 입력하세요"}
                </p>
              </div>
              <button onClick={() => setShowPublishModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {!publishDone ? (
              <>
                {/* 폼 */}
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">프로젝트명</label>
                    <input value={publishForm.name} onChange={e => setPublishForm(p => ({ ...p, name: e.target.value }))}
                      placeholder={solution.name}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">고객사 (선택)</label>
                    <input value={publishForm.client} onChange={e => setPublishForm(p => ({ ...p, client: e.target.value }))}
                      placeholder="예: 삼성SDI, 현대제철..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">버전 메모 (선택)</label>
                    <input value={publishForm.versionNote} onChange={e => setPublishForm(p => ({ ...p, versionNote: e.target.value }))}
                      placeholder="변경 사항을 간략히 기록하세요"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                </div>

                {/* 솔루션 정보 */}
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
                  <Shield className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                  <span className="text-xs text-white/50">솔루션: <span className="text-white/70">{solution.name}</span></span>
                </div>

                <button onClick={handleConfirmPublish}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all">
                  <Rocket className="h-4 w-4" />
                  프로젝트에 배포하기
                </button>
              </>
            ) : (
              /* 완료 화면 */
              <div className="space-y-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  ✓ 프로젝트 DB에 등록 완료
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowPublishModal(false); router.push("/projects"); }}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-white/70 hover:text-white transition-colors">
                    프로젝트 보기
                  </button>
                  <button onClick={() => { setShowPublishModal(false); router.push("/guard"); }}
                    className="flex-1 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 py-2.5 text-xs font-bold text-white hover:from-teal-500 hover:to-cyan-500 transition-all">
                    AIM GUARD 실행
                  </button>
                </div>
                <button onClick={() => setShowPublishModal(false)}
                  className="w-full text-center text-xs text-white/30 hover:text-white/50 transition-colors py-1">
                  닫기
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 드래그 고스트 — 실제 위젯 카드 모양 */}
    <DragOverlay dropAnimation={null}>
      {activeDragWidget && (
        <div
          style={{
            width: activeDragWidget.w,
            height: activeDragWidget.h,
            ...brandVars,
            background: "color-mix(in srgb, var(--guard-color-surface) 88%, transparent)",
            backdropFilter: "blur(18px)",
            border: "1px solid color-mix(in srgb, var(--guard-color-secondary) 45%, transparent)",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px color-mix(in srgb, var(--guard-color-secondary) 15%, transparent)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            cursor: "grabbing",
          }}
        >
          <span className="text-xs font-semibold" style={{ color: "var(--guard-color-text-strong)" }}>
            {activeDragWidget.title}
          </span>
          <span
            className="rounded-md px-2 py-0.5 text-[9px]"
            style={{
              background: "color-mix(in srgb, var(--guard-color-primary) 10%, transparent)",
              color: "var(--guard-color-accent)",
            }}
          >
            {activeDragWidget.type}
          </span>
          <span className="text-[8px]" style={{ color: "var(--guard-color-text-faint)" }}>
            우측 패널로 드롭 또는 캔버스에서 이동
          </span>
        </div>
      )}
    </DragOverlay>
    </DndContext>
  );
}
