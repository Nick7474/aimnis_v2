"use client";

/**
 * MonitorWrapper — STEP 2
 *
 * aim-guard/Monitor.tsx를 직접 import하여
 * 각 섹션을 EditableSection으로 감싼다.
 *
 * 전략:
 * - Header / Sidebar → default 모드 (직접 래핑, 라우터 없이 시각 재현)
 * - Map / AlarmPanel / FloorStatus → overlay 모드 (Monitor 위 투명 레이어, 배지 클릭으로 선택)
 *
 * aim-guard 코드 수정 금지 — 래핑 방식으로만 연결.
 */

import React, { lazy, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfigProvider, Spin, theme } from "antd";
import {
  MonitorOutlined,
  VideoCameraOutlined,
  BellOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  UserOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { useAlarmStore, useAuthStore } from "@/guard-app/stores";
import { useEditorStore } from "@/store/editorStore";
import AimGuardLogo from "@/guard-app/components/AimGuardLogo";
import EditableSection from "./EditableSection";
import "@/guard-app/aim-guard.css";

// ── Ant Design 다크 테마 (aim-guard 브랜드 그대로) ───────────
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

// ── Monitor 레이지 로드 ──────────────────────────────────────
const MonitorPage = lazy(() => import("@/guard-app/pages/Monitor"));

// ── 자동 로그인 (데모 전용) ──────────────────────────────────
const AutoLogin: React.FC = () => {
  const { user, login } = useAuthStore();
  useEffect(() => {
    if (!user) login({ id: "demo", name: "데모 관리자", role: "ADMIN" });
  }, [user, login]);
  return null;
};

// ── 사이드바 메뉴 정의 ───────────────────────────────────────
const MENU = [
  { icon: <MonitorOutlined />, label: "Map 기반 모니터링", active: true },
  { icon: <VideoCameraOutlined />, label: "영상모니터링", active: false },
  { icon: <BellOutlined />, label: "이벤트", active: false },
  { icon: <BarChartOutlined />, label: "통계", active: false },
  { divider: true },
  { icon: <ThunderboltOutlined />, label: "이벤트 규칙", active: false },
  { icon: <SettingOutlined />, label: "설정", active: false },
];

// ── 메인 ────────────────────────────────────────────────────
export default function MonitorWrapper() {
  const alarms = useAlarmStore((s) => s.alarms);
  const unacked = alarms.length;
  const systemTitle = useEditorStore((s) => s.systemTitle);
  const hiddenMonitorPanels = useEditorStore((s) => s.hiddenMonitorPanels);

  return (
    <ConfigProvider theme={AIM_DARK_THEME}>
      <AutoLogin />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#070F24",
          overflow: "hidden",
        }}
      >
        {/* ── 헤더 (EditableSection: type=header) ── */}
        <EditableSection
          sectionId="header"
          type="header"
          label="헤더"
          panelType="brand"
          style={{ flexShrink: 0 }}
        >
          <header
            className="app-header"
            style={{
              display: "flex",
              alignItems: "center",
              height: 44,
              padding: "0 20px",
              background: "#0A1428",
              borderBottom: "1px solid #1E3A5F",
              gap: 12,
              userSelect: "none",
            }}
          >
            {/* 로고 + 브랜드 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AimGuardLogo size={28} />
              <div style={{ lineHeight: 1.2 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#e2e8f0",
                    letterSpacing: "0.04em",
                  }}
                >
                  <span style={{ color: "#2563EB" }}>AIM</span>&nbsp;GUARD
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: 11,
                color: "#475569",
                marginLeft: 8,
                borderLeft: "1px solid #1E3A5F",
                paddingLeft: 12,
              }}
            >
              {systemTitle}
            </span>

            <div style={{ flex: 1 }} />

            {/* 알람 배지 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 6,
                background: unacked > 0 ? "rgba(220,38,38,0.12)" : "transparent",
                border: unacked > 0 ? "1px solid rgba(220,38,38,0.3)" : "1px solid transparent",
              }}
            >
              <BellOutlined style={{ color: unacked > 0 ? "#FCA5A5" : "#94a3b8", fontSize: 14 }} />
              {unacked > 0 && (
                <span style={{ fontSize: 11, color: "#FCA5A5", fontWeight: 600 }}>
                  {unacked}건
                </span>
              )}
            </div>

            {/* 사용자 */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 12 }}>
              <UserOutlined />
              <span>데모 관리자</span>
            </div>
          </header>
        </EditableSection>

        {/* ── 바디 (사이드바 + 컨텐츠) ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── 사이드바 (EditableSection: type=sidebar) ── */}
          <EditableSection
            sectionId="sidebar"
            type="sidebar"
            label="사이드바"
            panelType="navigation"
            style={{ flexShrink: 0 }}
          >
            <aside
              style={{
                width: 200,
                background: "#0C1733",
                borderRight: "1px solid #1E3A5F",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                height: "100%",
              }}
            >
              {/* 로고 영역 */}
              <div
                style={{
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  fontSize: 11,
                  color: "#475569",
                  borderBottom: "1px solid #1E3A5F",
                  letterSpacing: "0.04em",
                  flexShrink: 0,
                }}
              >
                모니터링 시스템
              </div>

              {/* 메뉴 */}
              <nav style={{ flex: 1, padding: "8px 0" }}>
                {MENU.map((item, i) => {
                  if ("divider" in item && item.divider) {
                    return (
                      <div
                        key={i}
                        style={{
                          height: 1,
                          background: "#1E3A5F",
                          margin: "6px 16px",
                        }}
                      />
                    );
                  }
                  const m = item as { icon: React.ReactNode; label: string; active: boolean };
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 16px",
                        borderRadius: 6,
                        margin: "1px 8px",
                        background: m.active
                          ? "rgba(37,99,235,0.18)"
                          : "transparent",
                        color: m.active ? "#60A5FA" : "#94a3b8",
                        fontSize: 12,
                        fontWeight: m.active ? 600 : 400,
                        cursor: "pointer",
                        boxShadow: m.active
                          ? "inset 0 0 0 1px rgba(37,99,235,0.4)"
                          : "none",
                        transition: "background 0.12s",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{m.icon}</span>
                      <span>{m.label}</span>
                    </div>
                  );
                })}
              </nav>

              {/* 버전 */}
              <div
                style={{
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  fontSize: 10,
                  color: "#334155",
                  borderTop: "1px solid #1E3A5F",
                  letterSpacing: 1,
                }}
              >
                AIM GUARD v1.0.0-mockup
              </div>
            </aside>
          </EditableSection>

          {/* ── 컨텐츠 (Monitor + overlay 섹션들) ── */}
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

            {/* Monitor 실제 렌더링 */}
            <Suspense
              fallback={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    background: "#070F24",
                  }}
                >
                  <Spin size="large" />
                </div>
              }
            >
              <MonitorPage />
            </Suspense>

            {/* ── 맵 영역 overlay (Monitor 내부 left ~70%) ── */}
            <EditableSection
              sectionId="map"
              type="map"
              label="맵 영역"
              panelType="gis"
              variant="overlay"
              style={{
                top: 0,
                left: 0,
                right: 300, // 알람 패널 너비 제외
                bottom: 0,
              }}
            />

            {/* ── 알람 패널 overlay (Monitor 내부 right ~300px, 상단 60%) ── */}
            <EditableSection
              sectionId="alarm-panel"
              type="alarm-panel"
              label="알람 패널"
              panelType="alarm"
              variant="overlay"
              style={{
                top: 0,
                right: 0,
                width: 300,
                bottom: "40%",
              }}
            />

            {/* ── 플로어 상태 overlay (Monitor 내부 right ~300px, 하단 40%) ── */}
            <EditableSection
              sectionId="floor-status"
              type="floor-status"
              label="플로어 상태"
              panelType="widget"
              variant="overlay"
              style={{
                bottom: 0,
                right: 0,
                width: 300,
                height: "40%",
              }}
            />

            {/* ── hiddenMonitorPanels 커버 ── */}
            <AnimatePresence>
              {hiddenMonitorPanels.includes("alarm-panel") && (
                <motion.div
                  key="cover-alarm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    top: 0, right: 0, width: 300, bottom: "40%",
                    background: "#070F24",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderLeft: "1px solid #1E3A5F",
                  }}
                >
                  <span style={{ fontSize: 10, color: "#1E3A5F" }}>알람 패널 숨김</span>
                </motion.div>
              )}
              {hiddenMonitorPanels.includes("floor-status") && (
                <motion.div
                  key="cover-floor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: "absolute",
                    bottom: 0, right: 0, width: 300, height: "40%",
                    background: "#070F24",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderLeft: "1px solid #1E3A5F",
                    borderTop: "1px solid #1E3A5F",
                  }}
                >
                  <span style={{ fontSize: 10, color: "#1E3A5F" }}>장비·CCTV 숨김</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── 상태바 (재현) ── */}
        <footer
          style={{
            height: 24,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 16px",
            background: "#040B1C",
            borderTop: "1px solid #1E3A5F",
            fontSize: 10,
            color: "#475569",
          }}
        >
          {[
            { label: "Senstar-1F: 연결", color: "#16A34A" },
            { label: "ADAM-1F: 연결", color: "#16A34A" },
            { label: "출입-A: 끊김", color: "#DC2626" },
          ].map((s) => (
            <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: s.color,
                  boxShadow: `0 0 4px ${s.color}`,
                  display: "inline-block",
                }}
              />
              {s.label}
            </span>
          ))}
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <WifiOutlined style={{ color: "#60A5FA" }} />
            WS: <span style={{ color: "#16A34A" }}>● 연결됨</span>
          </span>
        </footer>
      </div>
    </ConfigProvider>
  );
}
