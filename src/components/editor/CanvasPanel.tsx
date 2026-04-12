"use client";

import dynamic from "next/dynamic";

// GuardApp은 antd/react-router-dom 의존성으로 SSR 비활성화
const GuardApp = dynamic(() => import("@/components/guard/GuardApp"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070F24]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
    </div>
  ),
});

export default function CanvasPanel() {
  return (
    <div className="h-full w-full">
      <GuardApp />
    </div>
  );
}
