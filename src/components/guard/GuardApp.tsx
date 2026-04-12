"use client";

import React, { lazy, Suspense, useEffect } from "react";
import { MemoryRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ConfigProvider, Spin, theme } from "antd";
import { useEditorStore } from "@/store/editorStore";
import { useAlarmStore, useAuthStore } from "@/guard-app/stores";
import AppLayout from "@/guard-app/components/AppLayout";
import "@/guard-app/aim-guard.css";

// ── Ant Design 다크 테마 (AIM GUARD 브랜드) ──────────
const AIM_DARK_THEME = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#2563EB",
    colorBgBase: "#070F24",
    colorBgContainer: "#0C1733",
    colorBgElevated: "#0F1E3D",
    colorBorder: "#1E3A5F",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    borderRadius: 6,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif",
  },
};

// ── 레이지 로드 페이지 ────────────────────────────────
const MonitorPage    = lazy(() => import("@/guard-app/pages/Monitor"));
const EventsPage     = lazy(() => import("@/guard-app/pages/Events"));
const StatsPage      = lazy(() => import("@/guard-app/pages/Stats"));
const CctvDashboard  = lazy(() => import("@/guard-app/pages/CctvDashboard"));
const EventRulesPage = lazy(() => import("@/guard-app/pages/admin/EventRules"));
const SettingsPage   = lazy(() => import("@/guard-app/pages/admin/Settings"));

const Loading = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      flex: 1,
      background: "#070F24",
    }}
  >
    <Spin size="large" />
  </div>
);

// ── AI 명령 → 알람 브릿지 ────────────────────────────
const AlarmBridge: React.FC = () => {
  const lastCommand = useEditorStore((s) => s.lastCommand);
  const addAlarm    = useAlarmStore((s) => s.addAlarm);

  useEffect(() => {
    if (!lastCommand) return;

    // AI 응답에서 심각도 파싱 (없으면 HIGH 기본값)
    const text = lastCommand.aiResponse.toLowerCase();
    let severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "HIGH";
    if (text.includes("critical") || text.includes("위험")) severity = "CRITICAL";
    else if (text.includes("medium") || text.includes("중간")) severity = "MEDIUM";
    else if (text.includes("low") || text.includes("낮음"))   severity = "LOW";

    const SEV_COLOR: Record<string, string> = {
      CRITICAL: "#DC2626", HIGH: "#EA580C", MEDIUM: "#CA8A04", LOW: "#2563EB",
    };
    addAlarm({
      eventId:    `ai-${lastCommand.timestamp}`,
      zoneId:     "ai-zone",
      zoneName:   "AI 어시스턴트",
      deviceName: "AIMNIS AI",
      severity,
      alarmColor: SEV_COLOR[severity],
      occurredAt: new Date(lastCommand.timestamp).toLocaleString("ko-KR"),
      ackStatus:  "UNACKED",
      eventType:  "AI_COMMAND",
    });
  }, [lastCommand, addAlarm]);

  return null;
};

// ── 자동 로그인 (데모 전용) ───────────────────────────
const AutoLogin: React.FC = () => {
  const { user, login } = useAuthStore();

  useEffect(() => {
    if (!user) {
      login({ id: "demo", name: "데모 관리자", role: "ADMIN" });
    }
  }, [user, login]);

  return null;
};

// ── 보호된 라우트 래퍼 ───────────────────────────────
const Protected: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/monitor" replace />;
  return <Outlet />;
};

// ── 메인 GuardApp 컴포넌트 ──────────────────────────
const GuardApp: React.FC = () => (
  <ConfigProvider theme={AIM_DARK_THEME}>
    <MemoryRouter initialEntries={["/monitor"]}>
      <AutoLogin />
      <AlarmBridge />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<Protected />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/monitor" replace />} />
              <Route path="/monitor" element={<MonitorPage />} />
              <Route path="/cctv"    element={<CctvDashboard />} />
              <Route path="/events"  element={<EventsPage />} />
              <Route path="/stats"   element={<StatsPage />} />
              <Route path="/admin/event-rules" element={<EventRulesPage />} />
              <Route path="/admin/settings"    element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/monitor" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </MemoryRouter>
  </ConfigProvider>
);

export default GuardApp;
