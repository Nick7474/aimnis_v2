"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Activity, ArrowLeft, Edit2 } from "lucide-react";
import type { SolutionWidget } from "@/lib/solutionLoader";
import { useProjectStore } from "@/store/projectStore";
import MonitoringApp from "@/monitoring-app/MonitoringApp";
import MonitoringWidgetRenderer from "./MonitoringWidgetRenderer";

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
    grid: {
      columns: number;
      rowHeight: number;
    };
    items: RuntimeWidgetInstance[];
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  ultrasonic: "초음파",
  vibration: "진동",
  thermal: "열",
  gas: "가스",
  "worker-bio": "작업자",
  imu: "IMU",
  communication: "통신",
  "ai-diagnosis": "AI",
  "sop-events": "SOP",
  "sensor-fleet": "계측기",
  "field-validation": "실증",
};

export default function MonitoringRuntimeView({ widgets }: MonitoringRuntimeViewProps) {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const projects = useProjectStore((state) => state.projects);
  const [draftSnapshot, setDraftSnapshot] = useState<MonitoringSnapshot | null>(null);

  const widgetById = useMemo(() => {
    return Object.fromEntries(widgets.map((widget) => [widget.id, widget])) as Record<string, SolutionWidget>;
  }, [widgets]);

  useEffect(() => {
    if (projectId) return;
    const raw = window.localStorage.getItem("aimnis_monitoring_editor_draft");
    if (!raw) return;

    try {
      const snapshot = JSON.parse(raw) as MonitoringSnapshot;
      if (snapshot.schemaVersion === "monitoring.snapshot.v1") {
        setDraftSnapshot(snapshot);
      }
    } catch {
      window.localStorage.removeItem("aimnis_monitoring_editor_draft");
    }
  }, [projectId]);

  const activeProject = useMemo(() => {
    const monitoringProjects = projects.filter((project) => project.solution === "monitoring");
    return projectId ? monitoringProjects.find((project) => project.id === projectId) ?? null : monitoringProjects[0] ?? null;
  }, [projectId, projects]);

  const snapshot = (activeProject?.monitoringSnapshot as MonitoringSnapshot | undefined) ?? draftSnapshot;
  const items = snapshot?.widgets.items ?? [];
  const columns = snapshot?.widgets.grid.columns ?? 12;
  const rowHeight = snapshot?.widgets.grid.rowHeight ?? 44;

  // 에디터 MonitoringLayoutCanvas와 동일한 그리드 상수
  const GRID_GAP = 16;
  const GRID_PADDING = "20px 20px 20px 28px";

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050814] text-white">
      <header className="absolute inset-x-0 top-0 z-40 flex h-12 items-center justify-between border-b border-white/10 bg-[#07101f]/90 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
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

      <main className="absolute inset-0 pt-12">
        <MonitoringApp />
        {items.length > 0 && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-0"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridAutoRows: `${rowHeight}px`,
              columnGap: `${GRID_GAP}px`,
              rowGap: `${GRID_GAP}px`,
              padding: GRID_PADDING,
              alignContent: "start",
            }}
          >
            {items.map((instance) => {
              const meta = widgetById[instance.widgetId];
              if (!meta) return null;

              return (
                <div
                  key={instance.instanceId}
                  className="pointer-events-auto overflow-hidden rounded-lg"
                  style={{
                    gridColumn: `${instance.x + 1} / span ${instance.w}`,
                    gridRow: `${instance.y + 1} / span ${instance.h}`,
                  }}
                >
                  <MonitoringWidgetRenderer
                    title={instance.title}
                    widget={meta}
                    categoryLabel={
                      CATEGORY_LABELS[String(instance.options.dataSource ?? meta.dataSource ?? "")]
                      ?? String(instance.options.dataSource ?? meta.dataSource ?? "Monitoring")
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
