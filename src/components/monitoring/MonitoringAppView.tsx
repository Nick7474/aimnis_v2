"use client";
import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import "@/monitoring-app/aim-monitoring.css";

// lazy 로드 — 앱 컴포넌트
const MonitoringApp = lazy(() => import("@/monitoring-app/MonitoringApp"));

function AppLoading() {
  return (
    <div className="flex items-center justify-center h-full gap-3 text-white/30">
      <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
      <span className="text-sm">AIM Monitoring 로딩 중...</span>
    </div>
  );
}

export default function MonitoringAppView() {
  return (
    <div className="w-full h-full overflow-hidden bg-[#0b1120]">
      <Suspense fallback={<AppLoading />}>
        <MonitoringApp />
      </Suspense>
    </div>
  );
}
