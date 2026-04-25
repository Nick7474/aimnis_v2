"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, LayoutDashboard, Database, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home",     label: "홈",        icon: LayoutDashboard },
  { href: "/editor",   label: "에디터",    icon: Shield },
  { href: "/projects", label: "프로젝트",  icon: Database },
  { href: "/guard",    label: "AIM GUARD", icon: Shield },
];

function AimLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="var(--primary)" opacity="0.15" />
      <circle cx="20" cy="20" r="18" stroke="var(--primary)" strokeWidth="1.5" />
      <path d="M12 28L20 12L28 28" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 22.5H25.5" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2.5" fill="var(--primary)" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
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
      <div style={{ display: "flex", alignItems: "center", width: "100%", padding: "0 0 0 16px" }}>
        {/* 로고 — 220px 고정 (LeftPanel 정렬) */}
        <Link
          href="/home"
          style={{
            display: "flex", alignItems: "center", gap: 9,
            width: 220, flexShrink: 0, textDecoration: "none",
            borderRight: "1px solid var(--border)",
            paddingRight: 16, marginRight: 0, height: 47,
          }}
        >
          <AimLogo size={20} />
          <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", color: "var(--t1)" }}>
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
        </Link>

        {/* 네비게이션 탭 */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 12px", height: 47, flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: "1px solid var(--border)", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--t3)", transition: "all .15s",
            }}
          >
            <Settings style={{ width: 14, height: 14 }} />
          </button>
          <div
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, var(--primary), oklch(52% 0.20 295))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, cursor: "pointer", color: "white",
              boxShadow: "0 2px 8px oklch(55% 0.22 285 / .3)",
            }}
          >
            A
          </div>
        </div>
      </div>
    </nav>
  );
}
