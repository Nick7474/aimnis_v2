"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    router.push("/home");
  };

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
      {/* ── Aurora 보라색 배경 (홈화면과 동일) ── */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        {/* 홈과 동일한 aurora orbs */}
        <div style={{ position: "absolute", left: "-10rem", top: "33%", width: 600, height: 600, borderRadius: "50%", background: "rgba(124,58,237,0.08)", filter: "blur(140px)" }} />
        <div style={{ position: "absolute", right: "-10rem", top: "25%", width: 500, height: 500, borderRadius: "50%", background: "rgba(79,70,229,0.10)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", bottom: "25%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: "rgba(124,58,237,0.06)", filter: "blur(100px)" }} />
      </div>
      {/* ── MeshBg (Redesign.html 그리드+오브) ── */}
      <MeshBg />

      {/* ── 상단 로고 바 (홈화면 Navbar와 동일 디자인) ── */}
      <div style={{
        position: "relative", zIndex: 10,
        height: 48, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 24px",
        background: "var(--s1)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img
            src="/img/Aimnis_Symbol.svg"
            alt="AIMNIS Logo"
            style={{ width: 24, height: 24, objectFit: "contain", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.5))" }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)", letterSpacing: "0.01em" }}>
            AIMNIS
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            padding: "2px 6px", borderRadius: 4,
            background: "oklch(60% 0.20 285 / .15)",
            color: "var(--primary)",
            border: "1px solid oklch(60% 0.20 285 / .25)",
            textTransform: "uppercase" as const,
          }}>
            Enterprise
          </span>
        </div>
      </div>

      {/* ── 본문 좌우 분할 ── */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", overflow: "hidden" }}>

      {/* ── 좌측 브랜드 패널 (46%) ── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          flex: "0 0 46%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "48px 64px",
          borderRight: "1px solid var(--border)",
          background: "oklch(100% 0 0 / .015)",
        }}
      >
        {/* 배지 */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
          padding: "6px 14px", border: "1px solid var(--border2)", borderRadius: 20,
          fontSize: 11, color: "var(--t3)", letterSpacing: "0.05em",
          width: "fit-content",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: "var(--cyan)",
            display: "inline-block", animation: "pulse 2s infinite", flexShrink: 0,
          }} />
          AI-Powered Enterprise Platform
        </div>

        {/* 헤드라인 */}
        <h1 style={{
          fontSize: 44, fontWeight: 700, lineHeight: 1.1,
          letterSpacing: "-0.025em", marginBottom: 20,
          background: "linear-gradient(135deg, var(--t1) 0%, oklch(70% 0.14 285) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          산업 현장에 맞는<br />AI 하네스를<br />즉시 구성하세요
        </h1>

        {/* 서브텍스트 */}
        <p style={{ fontSize: 15, color: "var(--t2)", lineHeight: 1.7, maxWidth: 340 }}>
          현장 환경을 입력하면 AI가 맞춤 솔루션을 자동 설계합니다.
          AIM GUARD부터 AIM ECO까지, 엔터프라이즈급 모니터링을 손쉽게 구현하세요.
        </p>

        {/* 스탯 */}
        <div style={{ display: "flex", gap: 36, marginTop: 48 }}>
          {[
            ["2+",    "산업 솔루션"],
            ["500+",  "AI 위젯"],
            ["99.9%", "업타임 보장"],
          ].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--t1)", letterSpacing: "-0.02em", fontFamily: "var(--mono)" }}>
                {num}
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 3, letterSpacing: "0.02em" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* 솔루션 태그 */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 48 }}>
          {["AIM GUARD", "AIM ECO", "Gemma AI"].map((tag) => (
            <span key={tag} style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* 수직 강조선 (우측 테두리) */}
        <div style={{
          position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)",
          width: 1, height: "40%",
          background: "linear-gradient(transparent, var(--primary), transparent)",
          opacity: 0.4,
        }} />
      </motion.div>

      {/* ── 우측 로그인 폼 (54%) ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 40,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{ width: "100%", maxWidth: 400 }}
        >
          {/* 폼 카드 */}
          <div style={{
            background: "oklch(100% 0 0 / .045)",
            border: "1px solid var(--border2)",
            borderRadius: 18,
            padding: 36,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 32px 80px oklch(0% 0 0 / .4), 0 1px 0 oklch(100% 0 0 / .08) inset",
          }}>
            {/* 카드 상단 로고 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <img
                src="/img/Aimnis_Symbol.svg"
                alt="AIMNIS"
                style={{ width: 24, height: 24, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>계정에 로그인</span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6, color: "var(--t1)" }}>
                안녕하세요
              </h2>
              <p style={{ fontSize: 13, color: "var(--t3)" }}>
                조직 이메일로 계속하세요
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 이메일 */}
              <div>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase" as const, color: "var(--t3)", marginBottom: 8,
                }}>
                  이메일
                </label>
                <FormInput
                  type="email"
                  placeholder="admin@aimnis.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* 비밀번호 */}
              <div>
                <label style={{
                  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase" as const, color: "var(--t3)", marginBottom: 8,
                }}>
                  비밀번호
                </label>
                <FormInput
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  width: "100%", padding: "13px",
                  borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
                  background: "linear-gradient(135deg, var(--primary), oklch(52% 0.20 295))",
                  color: "white", fontSize: 14, fontWeight: 600,
                  fontFamily: "var(--font)", letterSpacing: "0.01em",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 4px 16px oklch(55% 0.22 285 / .35)",
                  opacity: loading ? 0.7 : 1,
                  transition: "all .2s",
                }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      style={{
                        display: "inline-block", width: 14, height: 14, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white",
                      }}
                    />
                    접속 중…
                  </>
                ) : (
                  <>
                    <Sparkles style={{ width: 14, height: 14 }} />
                    플랫폼 접속
                  </>
                )}
              </button>
            </form>

            {/* 데모 안내 */}
            <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "var(--t4)" }}>
              Demo — 아무 값이나 입력 후 접속하세요
            </p>
          </div>
        </motion.div>
      </div>
      </div>{/* 본문 분할 래퍼 닫기 */}
    </div>
  );
}

// ─── 인풋 컴포넌트 ─────────────────────────────────────────────
function FormInput({
  type, placeholder, value, onChange,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      border: `1px solid ${focused ? "oklch(60% 0.20 285 / .6)" : "var(--border2)"}`,
      borderRadius: 10,
      background: focused ? "oklch(100% 0 0 / .04)" : "oklch(100% 0 0 / .025)",
      transition: "all .2s",
      boxShadow: focused
        ? "0 0 0 3px oklch(60% 0.20 285 / .12), inset 0 1px 0 oklch(100% 0 0 / .05)"
        : "inset 0 1px 0 oklch(100% 0 0 / .04)",
    }}>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "13px 14px",
          background: "transparent", border: "none", outline: "none",
          color: "var(--t1)", fontSize: 14,
          fontFamily: "var(--font)", letterSpacing: "0.01em",
        }}
      />
    </div>
  );
}

// ─── MeshBg (Redesign.html MeshBg 패턴) ────────────────────────
function MeshBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
      {/* 그리드 라인 */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(oklch(100% 0 0 / .025) 1px, transparent 1px),
          linear-gradient(90deg, oklch(100% 0 0 / .025) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />
      {/* 퍼플 오브 (좌상단) */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.25, 0.18] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          left: "10%", top: "-10%",
          background: "radial-gradient(circle, oklch(45% 0.22 285 / .18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* 인디고 오브 (우하단) */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.14, 0.2, 0.14] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          right: "5%", bottom: "-5%",
          background: "radial-gradient(circle, oklch(40% 0.18 325 / .14) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* 시안 오브 (중앙) */}
      <motion.div
        animate={{ x: [0, 20, -10, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        style={{
          position: "absolute", width: 300, height: 300, borderRadius: "50%",
          left: "40%", top: "30%",
          background: "radial-gradient(circle, oklch(60% 0.14 210 / .08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
