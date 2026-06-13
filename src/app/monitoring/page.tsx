import { Suspense } from "react";
import { loadSolutionWidgets } from "@/lib/solutionLoader";
import MonitoringRuntimeView from "@/components/monitoring-editor/MonitoringRuntimeView";

export default function MonitoringPage() {
  const widgets = loadSolutionWidgets("monitoring");

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050814] text-sm text-white/50">
          AIM Monitoring을 불러오는 중입니다.
        </div>
      }
    >
      <MonitoringRuntimeView widgets={widgets} />
    </Suspense>
  );
}
