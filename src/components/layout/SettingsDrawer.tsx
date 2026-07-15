"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Trash2, RefreshCw, LogOut, CheckCircle2, AlertCircle, ChevronRight, Layout, Database } from "lucide-react";
import { useLLMStore, PROVIDER_META, type LLMProvider } from "@/store/llmStore";
import { useProjectStore } from "@/store/projectStore";
import { useHomeStore } from "@/store/homeStore";
import { useUsageStore } from "@/store/usageStore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

// 솔루션 목록 (LS 키 및 표시용)
const RESET_SOLUTIONS = [
  { id: "guard",      label: "AIM Guard" },
  { id: "monitoring", label: "Monitoring" },
] as const;
type ResetScope = "all" | "guard" | "monitoring";

// ── API 연결 상태 ─────────────────────────────────────────────
function ApiStatusBadge() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span className="text-[11px] text-emerald-400">Claude API 연결됨</span>
    </div>
  );
}

// ── 섹션 헤더 ─────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
      {label}
    </p>
  );
}

// ── 범위 선택 포함 확인 Row ──────────────────────────────────
function ScopedConfirmRow({
  label,
  desc,
  icon: Icon,
  onConfirm,
  danger = false,
  showScope = false,
}: {
  label: string;
  desc: string;
  icon: React.ElementType;
  onConfirm: (scope: ResetScope) => void;
  danger?: boolean;
  showScope?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [scope, setScope] = useState<ResetScope>("all");

  if (confirming) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-3 space-y-2.5">
        <p className="text-xs text-red-300">정말 초기화하시겠어요?</p>
        {showScope && (
          <div className="flex gap-1.5">
            <button
              onClick={() => setScope("all")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                scope === "all"
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/35 hover:bg-white/8"
              )}
            >
              전체
            </button>
            {RESET_SOLUTIONS.map(sol => (
              <button
                key={sol.id}
                onClick={() => setScope(sol.id as ResetScope)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                  scope === sol.id
                    ? "bg-white/15 text-white"
                    : "bg-white/5 text-white/35 hover:bg-white/8"
                )}
              >
                {sol.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <button
            onClick={() => { onConfirm(scope); setConfirming(false); }}
            className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
          >
            확인
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-white/40 hover:text-white/60 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-all text-left",
        danger
          ? "border-white/[0.06] bg-white/[0.02] hover:border-red-500/20 hover:bg-red-500/5"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 flex-shrink-0", danger ? "text-red-400/60" : "text-white/30")} />
      <div className="min-w-0">
        <p className={cn("text-xs font-medium", danger ? "text-red-300/80" : "text-white/70")}>{label}</p>
        <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="ml-auto h-3 w-3 flex-shrink-0 text-white/20" />
    </button>
  );
}

// ── 기존 단순 확인 Row ─────────────────────────────────────────
function ConfirmRow({
  label,
  desc,
  icon: Icon,
  onConfirm,
}: {
  label: string;
  desc: string;
  icon: React.ElementType;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2.5">
        <span className="text-xs text-red-300">정말 초기화하시겠어요?</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => { onConfirm(); setConfirming(false); }}
            className="rounded-lg bg-red-500/20 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
          >
            확인
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] text-white/40 hover:text-white/60 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    );
  }
  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-all text-left hover:border-white/10 hover:bg-white/[0.04]"
    >
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/30" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-white/70">{label}</p>
        <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="ml-auto h-3 w-3 flex-shrink-0 text-white/20" />
    </button>
  );
}

// ── 모니터링 draft 부분 초기화 헬퍼 ─────────────────────────
const MONITORING_DRAFT_KEY = "aimnis_monitoring_editor_draft";

function resetMonitoringLayout() {
  try {
    const raw = localStorage.getItem(MONITORING_DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    localStorage.setItem(MONITORING_DRAFT_KEY, JSON.stringify({
      ...draft,
      canvasWidgets: [],
      brand: { name: "AIM Monitoring", primaryColor: "#2563eb", logoUrl: null },
      elementConfigs: {},
      addedPages: [],
    }));
  } catch { /* ignore */ }
}

function resetMonitoringData() {
  try {
    const raw = localStorage.getItem(MONITORING_DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    localStorage.setItem(MONITORING_DRAFT_KEY, JSON.stringify({
      ...draft,
      connectedSourceIds: [],
      monitoringMappingEdges: [],
    }));
  } catch { /* ignore */ }
}

function clearHarnessDraft(solutionId?: string) {
  const keys = solutionId
    ? [`aimnis_harness_draft_${solutionId}`]
    : ["aimnis_harness_draft_guard", "aimnis_harness_draft_monitoring", "aimnis_harness_draft"];
  keys.forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const { provider, setProvider } = useLLMStore();
  const { projects, remove } = useProjectStore();
  const { reset: resetHome, resetSolutionSlot, resetAllSlots } = useHomeStore();
  const { todayUsage, totalInputTokens, totalOutputTokens, totalCostUsd, last7Days, clearAll: clearUsage } = useUsageStore();
  const router = useRouter();
  const [resetDone, setResetDone] = useState<string | null>(null);

  const today = todayUsage();
  const sevenDays = last7Days();
  const maxTokens = Math.max(...sevenDays.map(d => d.inputTokens + d.outputTokens), 1);
  const DAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

  const showFeedback = (msg: string) => {
    setResetDone(msg);
    setTimeout(() => setResetDone(null), 2500);
  };

  // ── 화면 초기화 (레이아웃·브랜드·설문, 데이터 연결 유지) ──
  const handleResetScreen = (scope: ResetScope) => {
    if (scope === "all" || scope === "guard") {
      clearHarnessDraft("guard");
      resetSolutionSlot("guard");
    }
    if (scope === "all" || scope === "monitoring") {
      resetMonitoringLayout();
      resetSolutionSlot("monitoring");
    }
    if (scope === "all") {
      sessionStorage.removeItem("aimnis_active_editor");
      resetHome();
    }
    showFeedback(
      scope === "all"
        ? "전체 화면이 초기화됐습니다. 데이터 연결은 유지됩니다."
        : `${scope === "guard" ? "AIM Guard" : "AIM Monitoring"} 화면이 초기화됐습니다.`
    );
  };

  // ── 데이터 초기화 (매핑 연결·프로젝트, 레이아웃 유지) ──────
  const handleResetData = (scope: ResetScope) => {
    if (scope === "all" || scope === "monitoring") {
      resetMonitoringData();
    }
    // 프로젝트는 전역 (솔루션 무관)
    if (scope === "all") {
      projects.forEach(p => remove(p.id));
    }
    showFeedback(
      scope === "all"
        ? "데이터 연결과 프로젝트가 초기화됐습니다. 위젯 배치는 유지됩니다."
        : `${scope === "monitoring" ? "AIM Monitoring" : "AIM Guard"} 데이터 연결이 초기화됐습니다.`
    );
  };

  // ── 에임이 인사 초기화 ────────────────────────────────────
  const handleResetGreeting = () => {
    localStorage.removeItem("aimi_editor_welcomed");
    showFeedback("에임이 인사를 초기화했습니다. 에디터 재접속 시 첫 인사가 표시됩니다.");
  };

  const handleLogout = () => {
    resetHome();
    onClose();
    router.push("/");
  };

  const PROVIDERS: LLMProvider[] = ["claude-haiku", "claude-sonnet", "gemini-flash-lite", "claude-opus"];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[998] bg-black/50"
            onClick={onClose}
          />

          {/* 드로어 */}
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 z-[999] flex h-full w-[320px] flex-col border-l border-white/[0.07] bg-[#0d0d18]"
            style={{ boxShadow: "-24px 0 64px rgba(0,0,0,0.6)" }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white/90">플랫폼 설정</h2>
                <p className="mt-0.5 text-[10px] text-white/30">AIMNIS Enterprise</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-white/30 transition-colors hover:border-white/15 hover:text-white/60"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 스크롤 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* 피드백 토스트 */}
              <AnimatePresence>
                {resetDone && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                    <p className="text-[11px] text-emerald-300 leading-relaxed">{resetDone}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── 플랫폼 정보 ── */}
              <section>
                <SectionHeader label="플랫폼 정보" />
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40">버전</span>
                    <span className="text-[11px] font-mono text-white/60">v1.0.0-mvp</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40">라이선스</span>
                    <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                      Enterprise
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5 border-t border-white/[0.05]">
                    <span className="text-[11px] text-white/40">API 상태</span>
                    <ApiStatusBadge />
                  </div>
                </div>
              </section>

              {/* ── API 사용량 대시보드 ── */}
              <section>
                <SectionHeader label="API 사용량" />
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                      <p className="text-[10px] text-white/30 mb-1">오늘</p>
                      <p className="text-[13px] font-bold text-white/80">
                        {today ? ((today.inputTokens + today.outputTokens) / 1000).toFixed(1) + "K" : "0"}
                      </p>
                      <p className="text-[10px] text-white/25 mt-0.5">
                        ≈ ${today ? today.costUsd.toFixed(4) : "0.0000"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
                      <p className="text-[10px] text-white/30 mb-1">누적</p>
                      <p className="text-[13px] font-bold text-white/80">
                        {((totalInputTokens() + totalOutputTokens()) / 1000).toFixed(1)}K
                      </p>
                      <p className="text-[10px] text-white/25 mt-0.5">
                        ≈ ${totalCostUsd().toFixed(3)}
                      </p>
                    </div>
                  </div>

                  {/* 7일 바 차트 */}
                  <div>
                    <p className="text-[10px] text-white/25 mb-1.5">최근 7일</p>
                    <div className="flex items-end gap-1 h-10">
                      {sevenDays.map((d) => {
                        const tokens = d.inputTokens + d.outputTokens;
                        const pct = maxTokens > 0 ? (tokens / maxTokens) * 100 : 0;
                        const dayLabel = DAYS_KO[new Date(d.date + "T00:00:00").getDay()];
                        const isToday = d.date === new Date().toISOString().split("T")[0];
                        return (
                          <div key={d.date} className="flex flex-col items-center gap-0.5 flex-1">
                            <div
                              className="w-full rounded-sm transition-all"
                              style={{
                                height: `${Math.max(pct, 2)}%`,
                                background: isToday ? "rgba(139,92,246,0.8)" : "rgba(255,255,255,0.12)",
                                minHeight: 2,
                              }}
                            />
                            <span className="text-[8px] text-white/20">{dayLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <a
                    href="https://console.anthropic.com/settings/usage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors pt-1 border-t border-white/[0.05]"
                  >
                    <span>Anthropic Console에서 전체 현황 보기</span>
                    <span>↗</span>
                  </a>
                </div>
              </section>

              {/* ── AI 모델 선택 ── */}
              <section>
                <SectionHeader label="AI 모델" />
                <div className="space-y-1.5">
                  {PROVIDERS.map((p) => {
                    const meta = PROVIDER_META[p];
                    const isActive = provider === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setProvider(p)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                          isActive
                            ? "border-violet-500/30 bg-violet-500/10"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                        )}
                      >
                        <Cpu className={cn("h-3.5 w-3.5 flex-shrink-0", isActive ? "text-violet-400" : "text-white/25")} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className={cn("text-xs font-medium", isActive ? "text-violet-200" : "text-white/65")}>
                              {meta.name}
                            </p>
                            {meta.badge && (
                              <span className="rounded px-1 py-0.5 text-[9px] font-bold bg-emerald-500/15 text-emerald-400">
                                {meta.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/25 mt-0.5">{meta.desc}</p>
                        </div>
                        {isActive && <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400" />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-white/20 leading-relaxed px-1">
                  선택한 모델은 에임이 채팅과 하네스 생성에 사용됩니다.
                </p>
              </section>

              {/* ── 데모 관리 ── */}
              <section>
                <SectionHeader label="데모 관리" />
                <div className="space-y-2">
                  <ScopedConfirmRow
                    label="화면 초기화"
                    desc="위젯 배치·브랜드·설문 초기화 (데이터 연결 유지)"
                    icon={Layout}
                    onConfirm={handleResetScreen}
                    showScope
                  />
                  <ScopedConfirmRow
                    label="데이터 초기화"
                    desc="매핑 연결·프로젝트 삭제 (위젯 배치 유지)"
                    icon={Database}
                    onConfirm={handleResetData}
                    danger
                    showScope
                  />
                  <ConfirmRow
                    label="에임이 인사 초기화"
                    desc="에디터 첫 방문 인사를 다시 표시"
                    icon={RefreshCw}
                    onConfirm={handleResetGreeting}
                  />
                </div>

                {/* 범례 */}
                <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <Layout className="h-3 w-3 flex-shrink-0 text-white/25 mt-0.5" />
                    <p className="text-[10px] text-white/30 leading-relaxed">
                      <span className="text-white/50 font-medium">화면</span> — 배치·브랜드 초기화, 연결 데이터 보존
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Database className="h-3 w-3 flex-shrink-0 text-white/25 mt-0.5" />
                    <p className="text-[10px] text-white/30 leading-relaxed">
                      <span className="text-white/50 font-medium">데이터</span> — 매핑·프로젝트 삭제, 배치 보존
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2.5">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400/70 mt-0.5" />
                  <p className="text-[10px] text-amber-300/60 leading-relaxed">
                    시연 전 초기화하면 처음 방문 경험을 다시 보여줄 수 있습니다.
                  </p>
                </div>
              </section>

              {/* ── 계정 ── */}
              <section>
                <SectionHeader label="계정" />
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/[0.05]">
                    <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                      A
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/80">Admin</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Enterprise 플랜</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-3 flex w-full items-center gap-2.5 text-left text-xs text-white/35 transition-colors hover:text-red-400"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    로그아웃
                  </button>
                </div>
              </section>
            </div>

            {/* 하단 고정 */}
            <div className="border-t border-white/[0.05] px-5 py-3 flex items-center gap-2">
              <img src="/img/ch6.png" alt="에임이" className="h-5 w-5 rounded-full object-cover opacity-40" />
              <p className="text-[10px] text-white/20">에임이 · AIMNIS Platform © 2026</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
