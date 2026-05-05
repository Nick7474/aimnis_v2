"use client";

import React, { lazy, Suspense, useEffect, useMemo } from "react";
import { MemoryRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { ConfigProvider, Spin, theme } from "antd";
import { useEditorStore } from "@/store/editorStore";
import { useAlarmStore, useAuthStore } from "@/guard-app/stores";
import AppLayout from "@/guard-app/components/AppLayout";
import { brandToAntToken, type BrandSettings } from "@/lib/brandPresets";
import "@/guard-app/aim-guard.css";

function buildGuardTheme(brand: BrandSettings) {
  const lightSurface = isLightBrandSurface(brand.backgroundColor);
  return {
    algorithm: lightSurface ? theme.defaultAlgorithm : theme.darkAlgorithm,
    token: brandToAntToken(brand),
  };
}

function isLightBrandSurface(hex: string) {
  const clean = hex.replace("#", "").slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return false;
  const [r, g, b] = [0, 2, 4].map((index) => Number.parseInt(clean.slice(index, index + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.72;
}

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
  const brand = useEditorStore((s) => s.brand);
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
      CRITICAL: brand.dangerColor, HIGH: brand.warningColor, MEDIUM: brand.accentColor, LOW: brand.primaryColor,
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
  }, [lastCommand, addAlarm, brand]);

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
const GuardApp: React.FC = () => {
  const brand = useEditorStore((s) => s.brand);
  const guardTheme = useMemo(() => buildGuardTheme(brand), [brand]);

  return (
    <ConfigProvider theme={guardTheme}>
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
};

export default GuardApp;
