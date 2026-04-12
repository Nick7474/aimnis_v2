"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, LayoutDashboard, Database, Store, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "홈", icon: LayoutDashboard },
  { href: "/editor", label: "에디터", icon: Shield },
  { href: "/projects", label: "프로젝트", icon: Database },
  { href: "/guard", label: "AIM GUARD", icon: Store },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-purple-500/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-6">
        {/* 로고 */}
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">AIMNIS</span>
          <span className="hidden rounded-full border border-purple-500/30 bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-300 sm:block">
            Enterprise
          </span>
        </Link>

        {/* 네비게이션 */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-md bg-purple-500/15"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="relative h-3.5 w-3.5" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* 우측 영역 */}
        <div className="flex items-center gap-2">
          <button className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 hover:text-white/60 transition-colors">
            <Settings className="h-3.5 w-3.5" />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-[10px] font-bold text-white">
            A
          </div>
        </div>
      </div>
    </nav>
  );
}
