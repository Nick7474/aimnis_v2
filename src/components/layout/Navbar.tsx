"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, LayoutDashboard, Database, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHomeStore } from "@/store/homeStore";

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

  // 로고 클릭 → 홈 Step 1으로 복귀 (AI 인터뷰 상태 초기화)
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWorking(false);
    router.push("/home");
  };

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

        {/* 로고 영역 — 에디터와 동일한 Aimnis_Symbol.svg 24px + text-sm font-semibold */}
        <a
          href="/home"
          onClick={handleLogoClick}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            width: 220, flexShrink: 0, textDecoration: "none",
            borderRight: "1px solid var(--border)",
            paddingRight: 16, height: 47, cursor: "pointer",
          }}
        >
          {/* 에디터와 동일: Aimnis_Symbol.svg h-[24px] w-[24px] drop-shadow-xl */}
          <img
            src="/img/Aimnis_Symbol.svg"
            alt="AIMNIS Logo"
            style={{ width: 24, height: 24, objectFit: "contain", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.5))" }}
          />
          {/* 에디터와 동일: text-sm(14px) font-semibold */}
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
