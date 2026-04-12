"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import dynamic from "next/dynamic";

const GuardApp = dynamic(() => import("@/components/guard/GuardApp"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070F24]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
    </div>
  ),
});

export default function GuardPage() {
  const router = useRouter();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020817]">
      {/* 오버레이 — 에디터로 돌아가기 버튼 */}
      <div className="absolute left-4 top-4 z-50 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-teal-500/20 bg-[#020817]/80 px-3 py-2 backdrop-blur-md">
          <Shield className="h-3.5 w-3.5 text-teal-400" />
          <span className="text-xs font-bold text-white">AIM GUARD</span>
        </div>
        <button
          onClick={() => router.push("/editor?solution=guard")}
          className="flex items-center gap-1.5 rounded-xl border border-teal-500/20 bg-[#020817]/80 px-3 py-2 text-xs text-teal-300 backdrop-blur-md hover:bg-teal-500/10 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          에디터로 돌아가기
        </button>
      </div>

      {/* AIM GUARD — 풀스크린 직접 렌더링 */}
      <div className="h-full w-full">
        <GuardApp />
      </div>
    </div>
  );
}
