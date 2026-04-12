import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIMNIS — Enterprise AI Platform",
  description: "통합 엔터프라이즈 AI 플랫폼 — 앱스토어 구조의 산업 솔루션",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="aurora-bg min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
