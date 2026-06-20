"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Activity, ArrowLeft, Edit2 } from "lucide-react";
import type { SolutionWidget } from "@/lib/solutionLoader";
import { useProjectStore } from "@/store/projectStore";
import { useMonitoringRuntimeStore } from "@/store/monitoringRuntimeStore";
import MonitoringApp from "@/monitoring-app/MonitoringApp";

interface MonitoringRuntimeViewProps {
  widgets: SolutionWidget[];
}

type WidgetOptionValue = string | number | boolean;

interface RuntimeWidgetInstance {
  instanceId: string;
  widgetId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  options: Record<string, WidgetOptionValue>;
}

interface MonitoringSnapshot {
  schemaVersion: "monitoring.snapshot.v1";
  widgets: {
    grid: { columns: number; rowHeight: number };
    items: RuntimeWidgetInstance[];
  };
}

export default function MonitoringRuntimeView({ widgets }: MonitoringRuntimeViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const projects = useProjectStore((state) => state.projects);
  const [draftSnapshot, setDraftSnapshot] = useState<MonitoringSnapshot | null>(null);
  const { setRuntime, clearRuntime } = useMonitoringRuntimeStore();

  // widgetId → SolutionWidget 맵
  const widgetById = useMemo(
    () => Object.fromEntries(widgets.map((w) => [w.id, w])) as Record<string, SolutionWidget>,
    [widgets]
  );

  // draft 로드 (projectId 없을 때만)
  useEffect(() => {
    if (projectId) return;
    const raw = window.localStorage.getItem("aimnis_monitoring_editor_draft");
    if (!raw) return;
    try {
      const snap = JSON.parse(raw) as MonitoringSnapshot;
      if (snap.schemaVersion === "monitoring.snapshot.v1") setDraftSnapshot(snap);
    } catch {
      window.localStorage.removeItem("aimnis_monitoring_editor_draft");
    }
  }, [projectId]);

  // 활성 프로젝트 조회
  const activeProject = useMemo(() => {
    const list = projects.filter((p) => p.solution === "monitoring");
    return projectId ? list.find((p) => p.id === projectId) ?? null : list[0] ?? null;
  }, [projectId, projects]);

  // snapshot → 런타임 스토어에 주입 (mount) / 정리 (unmount)
  useEffect(() => {
    const snapshot = (activeProject?.monitoringSnapshot as MonitoringSnapshot | undefined) ?? draftSnapshot;
    const items = snapshot?.widgets.items ?? [];
    setRuntime(items, widgetById);
    return () => clearRuntime();
  }, [activeProject, draftSnapshot, widgetById, setRuntime, clearRuntime]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050814] text-white">
      {/* 런타임 헤더 */}
      <header className="absolute inset-x-0 top-0 z-40 flex h-12 items-center justify-between border-b border-white/10 bg-[#07101f]/90 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-300" />
            <span className="text-xs font-semibold">{activeProject?.name ?? "AIM Monitoring"}</span>
          </div>
        </div>
        <Link
          href={`/editor?solution=monitoring${activeProject ? `&project=${activeProject.id}` : ""}`}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white/60 hover:text-white"
        >
          <Edit2 className="h-3.5 w-3.5" />
          에디터
        </Link>
      </header>

      {/* MonitoringApp — 커스텀 위젯은 Dashboard 안에서 렌더링됨 */}
      <main className="absolute inset-0 pt-12">
        <MonitoringApp runtimeMode={true} />
      </main>
    </div>
  );
}
