"use client";

import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useProjectStore } from "@/store/projectStore";
import { useEditorStore } from "@/store/editorStore";
import { ChevronDown, Shield } from "lucide-react";
import { useState, Suspense, useEffect } from "react";
import { GuardLoader } from "@/components/shared/AIMILoader";

const GuardApp = dynamic(() => import("@/components/guard/GuardApp"), {
  ssr: false,
  loading: () => <GuardLoader />,
});

function ProjectBadge() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { projects } = useProjectStore();
  const { updateBrand, updateSectionStyle, setSystemTitle } = useEditorStore();
  const [open, setOpen] = useState(false);

  // URL에서 projectId 읽기, 없으면 최신 guard 프로젝트
  const projectId = searchParams.get("project");
  const guardProjects = projects.filter(p => p.solution === "guard");
  const active = guardProjects.find(p => p.id === projectId) ?? guardProjects[0];

  // 활성 프로젝트의 brandSnapshot → editorStore에 주입
  useEffect(() => {
    if (!active) return;
    if (active.brandSnapshot) {
      updateBrand(active.brandSnapshot as Parameters<typeof updateBrand>[0]);
    }
    if (active.sectionStylesSnapshot) {
      (Object.entries(active.sectionStylesSnapshot) as [Parameters<typeof updateSectionStyle>[0], Parameters<typeof updateSectionStyle>[1]][])
        .forEach(([section, style]) => updateSectionStyle(section, style));
    }
    if (active.systemTitle) {
      setSystemTitle(active.systemTitle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id]);

  if (guardProjects.length === 0) return null;

  return (
    <div className="relative flex items-center">
      {/* 구분선 */}
      <div className="mx-3 h-4 w-px bg-white/10" />

      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:text-white transition-colors"
      >
        <Shield className="h-3 w-3 text-teal-400" />
        <span className="max-w-[140px] truncate">{active?.name ?? "프로젝트 선택"}</span>
        <ChevronDown className="h-3 w-3 text-white/30" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[200px] rounded-xl border border-white/10 bg-[#0f0f1a] py-1 shadow-2xl">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
              AIM GUARD 프로젝트
            </p>
            {guardProjects.map(p => (
              <button
                key={p.id}
                onClick={() => { router.push(`/guard?project=${p.id}`); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-white/5 ${active?.id === p.id ? "text-teal-400" : "text-white/60"}`}
              >
                <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${active?.id === p.id ? "bg-teal-400" : "bg-white/20"}`} />
                <span className="truncate">{p.name}</span>
                <span className="ml-auto flex-shrink-0 text-[10px] text-white/30">{p.version}</span>
              </button>
            ))}
            <div className="mx-3 my-1 h-px bg-white/5" />
            <button
              onClick={() => { router.push("/projects"); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              프로젝트 관리 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function GuardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#020817]">
      {/* AIMNIS 공통 상단 네비게이션 + 프로젝트 셀렉터 */}
      <div className="flex items-center" style={{ height: 48 }}>
        <Navbar />
        <Suspense fallback={null}>
          <div className="absolute right-[120px] top-0 flex h-12 items-center">
            <ProjectBadge />
          </div>
        </Suspense>
      </div>

      {/* AIM GUARD 앱 */}
      <div className="flex-1 overflow-hidden">
        <GuardApp />
      </div>
    </div>
  );
}
