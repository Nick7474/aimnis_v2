"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";

const GuardApp = dynamic(() => import("@/components/guard/GuardApp"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070F24]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
    </div>
  ),
});

export default function GuardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#020817]">
      {/* AIMNIS 공통 상단 네비게이션 (홈/에디터와 동일) */}
      <Navbar />

      {/* AIM GUARD 앱 — Navbar 높이(48px) 아래 전체 차지 */}
      <div className="flex-1 overflow-hidden">
        <GuardApp />
      </div>
    </div>
  );
}
