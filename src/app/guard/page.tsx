"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";

const GUARD_URL = "http://localhost:3001";

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

      {/* AIM GUARD iframe — 풀스크린 */}
      <iframe
        src={GUARD_URL}
        className="h-full w-full border-0"
        title="AIM GUARD"
        allow="same-origin"
      />
    </div>
  );
}
