"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Activity, ArrowLeft, Edit2 } from "lucide-react";
import type { SolutionWidget } from "@/lib/solutionLoader";
import type { BrandSettings } from "@/lib/brandPresets";
import { useProjectStore } from "@/store/projectStore";
import MonitoringLayoutCanvas, {
  DEFAULT_MONITORING_ELEMENT_CONFIGS,
  type MonitoringElementConfigs,
} from "./MonitoringLayoutCanvas";
import { useMonitoringPagesStore } from "@/store/monitoringPagesStore";

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
  elements?: MonitoringElementConfigs;
  brand?: { settings?: BrandSettings };
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const { addedPages } = useMonitoringPagesStore();

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

  const snapshot = (activeProject?.monitoringSnapshot as MonitoringSnapshot | undefined) ?? draftSnapshot;
  const elementConfigs = snapshot?.elements ?? DEFAULT_MONITORING_ELEMENT_CONFIGS;
  const runtimeWidgets = snapshot?.widgets.items ?? [];

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

      {/* 저장된 12-grid 스냅샷을 에디터/풀스크린과 동일한 캔버스로 렌더 */}
      <main className="absolute inset-0 pt-12">
        <MonitoringLayoutCanvas
          canvasRef={canvasRef}
          customWidgets={runtimeWidgets}
          widgetById={widgetById}
          elementConfigs={elementConfigs}
          brand={snapshot?.brand?.settings}
          selectedWidgetId={null}
          selectedElementId={null}
          isDraggingWidget={false}
          interactionActive={false}
          layoutPriorityId={null}
          onDragOver={() => {}}
          onDrop={() => {}}
          onSelectWidget={() => {}}
          onSelectElement={() => {}}
          onStartWidgetInteraction={() => {}}
          addedPages={addedPages}
        />
      </main>
    </div>
  );
}
