import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AIMNIS — Enterprise AI Platform",
  description: "통합 엔터프라이즈 AI 플랫폼 — 앱스토어 구조의 산업 솔루션",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/img/Aimnis_Symbol.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.svg",
    apple: "/img/Aimnis_Symbol.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`aurora-bg min-h-screen antialiased ${plusJakartaSans.variable} ${dmMono.variable}`}
        style={{ fontFamily: "var(--font)" }}
      >
        {children}
      </body>
    </html>
  );
}
