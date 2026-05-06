"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, LayoutDashboard, Database, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHomeStore } from "@/store/homeStore";
import { useProjectStore } from "@/store/projectStore";
import { useState, useRef } from "react";
import SettingsDrawer from "./SettingsDrawer";
import FlowGuardModal, { type FlowGuardScenario } from "./FlowGuardModal";

const NAV_ITEMS = [
  { href: "/home",     label: "홈",        icon: LayoutDashboard },
  { href: "/editor",   label: "에디터",    icon: Shield },
  { href: "/projects", label: "프로젝트",  icon: Database },
  { href: "/guard",    label: "AIM GUARD", icon: Shield },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const setIsWorking = useHomeStore((s) => s.setIsWorking);
  const reset = useHomeStore((s) => s.reset);

  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guardModal, setGuardModal] = useState<FlowGuardScenario | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isComplete } = useHomeStore();
  const { projects } = useProjectStore();

  const hasHarness = typeof window !== "undefined"
    ? !!(sessionStorage.getItem("aimnis_harness_draft") || localStorage.getItem("aimnis_harness_draft"))
    : false;
  const hasPublish = projects.length > 0;

  /** GNB 클릭 인터셉터 — 접근 권한 체크 후 팝업 or 이동 */
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (href === "/home") return; // 홈은 항상 허용

    if (href === "/editor") {
      if (!isComplete) { e.preventDefault(); setGuardModal("editor-no-interview"); return; }
      if (!hasHarness && !hasPublish) { e.preventDefault(); setGuardModal("editor-no-harness"); return; }
      return;
    }

    if (href === "/projects") {
      if (!hasPublish) { e.preventDefault(); setGuardModal("projects-no-publish"); return; }
      return;
    }

    if (href === "/guard") {
      if (!hasPublish) { e.preventDefault(); setGuardModal("guard-no-publish"); return; }
      return;
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWorking(false);
    router.push("/home");
  };

  const handleLogout = () => {
    reset();
    router.push("/");
  };

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setAccountOpen(true);
  };

  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setAccountOpen(false), 120);
  };

  return (
    <>
    <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    <FlowGuardModal
      scenario={guardModal}
      onClose={() => setGuardModal(null)}
      hasHarness={hasHarness}
    />
    <nav
      style={{
        position: "fixed",
        top: 0,
        zIndex: 50,
        width: "100%",
        height: 48,
        display: "flex",
        alignItems: "center",
        background: "var(--s1)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", width: "100%", padding: "0 16px" }}>

        {/* 로고 — 분리선 없이 좌측 고정 */}
        <a
          href="/home"
          onClick={handleLogoClick}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            flexShrink: 0, textDecoration: "none",
            height: 47, cursor: "pointer",
            paddingRight: 20,
          }}
        >
          <img
            src="/img/Aimnis_Symbol.svg"
            alt="AIMNIS Logo"
            style={{ width: 24, height: 24, objectFit: "contain", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.5))" }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", letterSpacing: "0.01em" }}>
            AIMNIS
          </span>
          <span
            style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
              padding: "2px 6px", borderRadius: 4,
              background: "oklch(60% 0.20 285 / .15)",
              color: "var(--primary)",
              border: "1px solid oklch(60% 0.20 285 / .25)",
              textTransform: "uppercase" as const,
            }}
          >
            Enterprise
          </span>
        </a>

        {/* 네비게이션 탭 — 중앙 배치 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, height: 47, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(!isActive && "hover:opacity-70")}
                style={{
                  position: "relative",
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "0 12px", height: 47,
                  border: "none", background: "transparent", cursor: "pointer",
                  textDecoration: "none",
                  borderBottom: `2px solid ${isActive ? "var(--primary)" : "transparent"}`,
                  color: isActive ? "var(--t1)" : "var(--t3)",
                  fontSize: 12, fontFamily: "var(--font)",
                  fontWeight: isActive ? 600 : 400,
                  transition: "color .15s",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-bg"
                    style={{
                      position: "absolute", inset: "6px 4px",
                      borderRadius: 7,
                      background: "oklch(60% 0.20 285 / .1)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  style={{ position: "relative", width: 13, height: 13, flexShrink: 0 }}
                  color={isActive ? "var(--primary)" : "var(--t3)"}
                />
                <span style={{ position: "relative" }}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 우측 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 16 }}>
          <button
            onClick={() => setSettingsOpen(true)}
            title="플랫폼 설정"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid var(--border)", background: settingsOpen ? "oklch(60% 0.20 285 / .1)" : "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: settingsOpen ? "var(--primary)" : "var(--t3)", transition: "all .15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(60% 0.20 285 / .3)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--t2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = settingsOpen ? "var(--primary)" : "var(--t3)"; }}
          >
            <Settings style={{ width: 14, height: 14 }} />
          </button>

          {/* 계정 아바타 + 호버 드롭다운 */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            {/* 아바타 */}
            <div
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: accountOpen
                  ? "linear-gradient(135deg, oklch(52% 0.20 295), var(--primary))"
                  : "linear-gradient(135deg, var(--primary), oklch(52% 0.20 295))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, cursor: "pointer", color: "white",
                boxShadow: accountOpen
                  ? "0 4px 16px oklch(55% 0.22 285 / .5)"
                  : "0 2px 8px oklch(55% 0.22 285 / .3)",
                transition: "all .2s",
                outline: accountOpen ? "2px solid oklch(60% 0.20 285 / .4)" : "none",
                outlineOffset: 1,
              }}
            >
              A
            </div>

            {/* 드롭다운 */}
            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  onMouseEnter={openDropdown}
                  onMouseLeave={closeDropdown}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: 180,
                    background: "var(--s2)",
                    border: "1px solid var(--border2)",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 8px 24px oklch(0% 0 0 / .4), 0 1px 0 oklch(100% 0 0 / .06) inset",
                    zIndex: 200,
                  }}
                >
                  {/* 계정 정보 */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid var(--border)",
                      display: "flex", alignItems: "center", gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: "linear-gradient(135deg, var(--primary), oklch(52% 0.20 295))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, color: "white",
                      }}
                    >
                      A
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Admin
                      </div>
                      <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 1 }}>
                        Enterprise
                      </div>
                    </div>
                  </div>

                  {/* 로그아웃 버튼 */}
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px", border: "none", background: "transparent",
                      cursor: "pointer", textAlign: "left", transition: "background .15s",
                      color: "var(--t2)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "oklch(70% 0.14 210 / .1)";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--cyan)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--t2)";
                    }}
                  >
                    <LogOut style={{ width: 13, height: 13, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "var(--font)" }}>
                      로그아웃
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
