"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    router.push("/home");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0f]">
      {/* Aurora 배경 애니메이션 */}
      <AuroraBackground />

      {/* 로그인 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm px-4"
      >
        <div className="glass-card p-8">
          {/* 로고 */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AIMNIS
            </h1>
            <p className="mt-1 text-xs text-purple-300/70">
              Enterprise AI Platform
            </p>
          </motion.div>

          {/* 폼 */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-purple-200/80 text-xs">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@aimnis.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-purple-500/20 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-purple-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-purple-200/80 text-xs">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-purple-500/20 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-purple-500/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white"
                  />
                  접속 중…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  플랫폼 접속
                </span>
              )}
            </Button>
          </motion.form>

          {/* 데모 안내 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-[11px] text-white/20"
          >
            Demo — 아무 값이나 입력 후 접속하세요
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Aurora 배경 ─────────────────────────────────────────────

function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 퍼플 오브 */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[80px]"
      />
      {/* 인디고 오브 */}
      <motion.div
        animate={{
          x: [0, -40, 20, 0],
          y: [0, 30, -30, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-indigo-600/20 blur-[80px]"
      />
      {/* 시안 미세 오브 */}
      <motion.div
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -20, 40, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute bottom-1/4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-600/10 blur-[60px]"
      />
      {/* 그리드 오버레이 */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.8) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
