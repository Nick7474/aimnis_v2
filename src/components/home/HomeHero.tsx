"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, Paperclip, X, CheckCircle2, ExternalLink, Bot, Zap, Camera, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SolutionManifest, AnalysisStep } from "@/lib/solutionLoader";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { useHomeStore } from "@/store/homeStore";
import { useLLMStore } from "@/store/llmStore";
import { useProjectStore } from "@/store/projectStore";
import { scenarios } from "@/data/scenarios";
import ParticleWaves from "./ParticleWaves";

interface HomeHeroProps {
  solutions: SolutionManifest[];
  analysisStepsMap: Record<string, AnalysisStep[]>;
}

const SCENARIO_ICONS = { Zap, Camera, Building2 } as Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>>;

export default function HomeHero({ solutions, analysisStepsMap }: HomeHeroProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [input, setInput] = useState("");
  const [activeSolution, setActiveSolution] = useState<string | null>(null);

  const { setIsWorking, setSelectedScenario } = useHomeStore();
  const { projects: savedProjects } = useProjectStore();
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);

  const filteredProjects = input.trim().length > 0
    ? savedProjects.filter(p =>
        p.name.toLowerCase().includes(input.toLowerCase()) ||
        p.client.toLowerCase().includes(input.toLowerCase())
      )
    : savedProjects.slice(0, 4);

  const handleScenarioChip = (sc: typeof scenarios[number]) => {
    setSelectedScenario(sc.id);
    setIsWorking(true);
  };

  // 파일 업로드 상태
  const [uploadState, setUploadState] = useState<"idle" | "analyzing" | "done">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // AI 응답 상태 — 대화 히스토리 유지
  const [aiState, setAiState] = useState<"idle" | "streaming" | "done">("idle");
  const [aiResponse, setAiResponse] = useState("");
  const [pendingSolution, setPendingSolution] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const historyScrollRef = useRef<HTMLDivElement>(null);

  // ─── AI 하네스 생성 ────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || aiState === "streaming") return;

    const solId = activeSolution ?? "guard";
    setPendingSolution(solId);
    setAiState("streaming");
    setAiResponse("");
    // 사용자 메시지를 히스토리에 추가
    setChatHistory(prev => [...prev, { role: "user", text }]);
    setInput("");

    try {
      const res = await fetch("/api/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, solution: solId }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setAiResponse(full);
        }
      }
    } catch {
      const errMsg = "하네스 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setAiResponse(errMsg);
      setChatHistory(prev => [...prev, { role: "ai" as const, text: errMsg }]);
    } finally {
      setAiState("done");
    }
  };

  // streaming 완료 시 히스토리에 저장
  const prevAiState = useRef(aiState);
  useEffect(() => {
    if (prevAiState.current === "streaming" && aiState === "done" && aiResponse) {
      setChatHistory(prev => [...prev, { role: "ai" as const, text: aiResponse }]);
    }
    prevAiState.current = aiState;
  }, [aiState, aiResponse]);

  // 히스토리 자동 스크롤
  useEffect(() => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
    }
  }, [chatHistory, aiResponse]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const resetAi = () => {
    setAiState("idle");
    setAiResponse("");
    setInput("");
  };

  // ─── 파일 업로드 ──────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploadState("analyzing");
    setCompletedSteps([]);
    setCurrentStep(0);

    const solutionId = activeSolution ?? "guard";
    const steps = analysisStepsMap[solutionId] ?? [];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, steps[i].duration));
      setCompletedSteps((prev) => [...prev, i]);
    }
    setUploadState("done");
  };

  const resetUpload = () => {
    setUploadState("idle");
    setFileName(null);
    setCurrentStep(0);
    setCompletedSteps([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const solutionId = activeSolution ?? "guard";
  const steps = analysisStepsMap[solutionId] ?? [];

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-28 relative">
      <ParticleWaves />
      <div className="relative z-10 w-full flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
          <Sparkles className="h-3 w-3" />
          AI-Powered Enterprise Platform
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          무엇을 만들어 드릴까요?
        </h1>
        <p className="mt-3 text-sm text-white/40">
          요구사항을 입력하거나 파일을 업로드하면 AI가 맞춤 하네스를 생성합니다
        </p>
      </motion.div>

      {/* AI 입력창 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        {/* 채팅 히스토리는 입력 폼 안에 통합됨 (아래 form 참고) */}

        {/* 파일 분석 UI */}
        <AnimatePresence>
          {(uploadState === "analyzing" || uploadState === "done") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 overflow-hidden p-4"
              style={{
                borderRadius: 16,
                border: "1px solid #2F2243",
                background: "rgba(135, 135, 178, 0.05)",
                backdropFilter: "blur(5px)",
                WebkitBackdropFilter: "blur(5px)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Paperclip className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">{fileName}</span>
                </div>
                {uploadState === "done" && (
                  <button onClick={resetUpload} className="text-white/30 hover:text-white/60 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {steps.map((step, i) => {
                  const isDone = completedSteps.includes(i);
                  const isActive = currentStep === i && !isDone;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2.5"
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                      ) : isActive ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-purple-500/30 border-t-purple-400"
                        />
                      ) : (
                        <div className="h-3.5 w-3.5 flex-shrink-0 rounded-full border border-white/10" />
                      )}
                      <span className={cn(
                        "text-xs transition-colors",
                        isDone ? "text-emerald-400/80" : isActive ? "text-white/80" : "text-white/20"
                      )}>
                        {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
              <AnimatePresence>
                {uploadState === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2"
                  >
                    <div className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                      ✓ harness.md 생성 완료
                    </div>
                    <button
                      onClick={() => router.push(`/editor?solution=${solutionId}`)}
                      className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-xs text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
                    >
                      에디터 열기
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 입력 폼 — 대화 히스토리 통합 */}
        <form onSubmit={handleSubmit}>
          <div
            className="relative shadow-2xl shadow-black/40 transition-colors"
            style={{
              borderRadius: 16,
              border: "1px solid #2F2243",
              background: "rgba(135, 135, 178, 0.05)",
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
            }}
          >
            {/* 대화 히스토리 — 내용 있을 때만 표시, 스크롤 가능 */}
            <AnimatePresence>
              {(chatHistory.length > 0 || aiState === "streaming") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-b border-white/5"
                >
                  <div
                    ref={historyScrollRef}
                    style={{ maxHeight: 320, overflowY: "auto", padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 10 }}
                    className="custom-scrollbar"
                  >
                    {/* 에임이 첫 메시지 — 히스토리 없을 때 */}
                    {chatHistory.length === 0 && aiState !== "streaming" && (
                      <div className="flex justify-start gap-2.5 mb-2">
                        <img src="/img/ch6.png" alt="에임이" className="h-7 w-7 flex-shrink-0 rounded-full object-cover ring-1 ring-violet-500/25 mt-0.5" />
                        <div className="max-w-[88%] rounded-xl rounded-tl-sm border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-sm text-white/80 leading-relaxed whitespace-pre-line">
                          {"안녕하세요! 저는 에임이예요 🦊\n보안·에너지·스마트시티, 어떤 현장이든\n맞춤 관제 시스템을 함께 만들어 드릴게요.\n\n어떤 현장을 구축하고 싶으신가요?"}
                        </div>
                      </div>
                    )}
                  {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "ai" && (
                          <img src="/img/ch6.png" alt="에임이" className="h-6 w-6 flex-shrink-0 rounded-full object-cover ring-1 ring-violet-500/20 mt-0.5" />
                        )}
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-purple-500/20 text-purple-100"
                            : "bg-white/5 text-white/80"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {aiState === "streaming" && (
                      <div className="flex justify-start">
                        <div className="max-w-[88%] rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                          {aiResponse}
                          <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}
                            className="ml-0.5 inline-block h-3 w-1.5 bg-purple-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 시나리오 칩 */}
            <div className="px-4 pt-4 pb-2 flex flex-wrap gap-1.5">
              <span className="self-center text-[10px] text-white/25 mr-1">시나리오:</span>
              {scenarios.map((sc) => {
                const Icon = SCENARIO_ICONS[sc.icon] ?? Zap;
                return (
                  <motion.button
                    key={sc.id}
                    type="button"
                    onClick={() => handleScenarioChip(sc)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all"
                    style={{ borderColor: sc.color + "40", backgroundColor: sc.color + "10", color: sc.color }}
                  >
                    <Icon className="h-3 w-3" style={{ color: sc.color }} />
                    {sc.label}
                  </motion.button>
                );
              })}
            </div>

            <div className="px-4 pb-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeSolution === "guard"
                  ? "예: 배터리공장 화재 감지 + 에너지 모니터링 대시보드 만들어줘"
                  : "솔루션을 선택하거나 요구사항을 직접 입력하세요"
              }
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none"
            />

            </div>{/* px-4 pb-2 wrapper 닫기 */}
            <div className="px-4 pb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* 파일 첨부 */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/40 hover:border-purple-500/30 hover:text-purple-300 transition-colors"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                </motion.button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.json,.yaml,.png,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />



                {/* 솔루션 칩 */}
                <SolutionChips
                  solutions={solutions}
                  active={activeSolution}
                  onSelect={(id) => setActiveSolution(id === activeSolution ? null : id)}
                />
              </div>

              {/* 전송 버튼 */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!input.trim() || aiState === "streaming"}
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all",
                  input.trim() && aiState !== "streaming"
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                    : "bg-white/5 text-white/20"
                )}
              >
                {aiState === "streaming" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white"
                  />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </motion.button>
            </div>
          </div>
        </form>

        <p className="mt-3 text-center text-[11px] text-white/20">
          Enter로 전송 · Shift+Enter 줄바꿈 · 파일 첨부 시 AI가 자동 분석
        </p>
      </motion.div>

      {/* 솔루션 카드 */}
      <SolutionCards solutions={solutions} />
      </div>
    </div>
  );
}

// ─── 솔루션 칩 ───────────────────────────────────────────────

function SolutionChips({
  solutions, active, onSelect,
}: {
  solutions: SolutionManifest[];
  active: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {solutions.map((sol) => {
        const IconComp = (
          (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[sol.icon] ??
          LucideIcons.Box
        ) as React.FC<LucideProps>;
        const isActive = active === sol.id;
        const isComingSoon = sol.status === "coming-soon";

        return (
          <motion.button
            key={sol.id}
            type="button"
            onClick={() => !isComingSoon && onSelect(sol.id)}
            whileHover={{ scale: isComingSoon ? 1 : 1.03 }}
            whileTap={{ scale: isComingSoon ? 1 : 0.97 }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all",
              isActive
                ? "border-purple-400/40 bg-purple-500/20 text-purple-200"
                : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70",
              isComingSoon && "cursor-not-allowed opacity-50"
            )}
          >
            <IconComp className="h-3 w-3" color={sol.color} />
            <span>{sol.name}</span>
            {isComingSoon && (
              <span className="rounded-full bg-white/10 px-1 py-0.5 text-[9px] text-white/40">예정</span>
            )}
            {isActive && (
              <motion.span layoutId="chip-dot" className="h-1.5 w-1.5 rounded-full bg-purple-400" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// 솔루션별 로고 이미지 매핑
const SOLUTION_LOGOS: Record<string, string> = {
  guard: "/img/00_AimGuard.png",
  eco:   "/img/01_AimEco.png",
};

// ─── 솔루션 카드 ─────────────────────────────────────────────

// 솔루션 ID → 시나리오 ID 매핑 (guard=manufacturing, eco=smartcity)
const SOLUTION_TO_SCENARIO: Record<string, string> = {
  guard: "manufacturing",
  eco:   "smartcity",
};

function SolutionCards({ solutions }: { solutions: SolutionManifest[] }) {
  const router = useRouter();
  const { setIsWorking, setSelectedScenario } = useHomeStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 w-full max-w-2xl pb-16"
    >
      <p className="mb-4 text-xs text-white/30 text-center">구독 중인 솔루션</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {solutions.map((sol, i) => {
          const isAvailable = sol.status === "available";
          const logoSrc = SOLUTION_LOGOS[sol.id];

          return (
            <motion.div
              key={sol.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="p-4 flex flex-col gap-3"
              style={{
                borderRadius: 16,
                border: "1px solid #2F2243",
                background: "rgba(135, 135, 178, 0.05)",
                backdropFilter: "blur(5px)",
                WebkitBackdropFilter: "blur(5px)",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  {logoSrc && (
                    <img
                      src={logoSrc}
                      alt={sol.name}
                      style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }}
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{sol.name}</p>
                    <p className="text-[10px] text-white/40 capitalize">{sol.category}</p>
                  </div>
                </div>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  isAvailable ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"
                )}>
                  {isAvailable ? "구독 중" : "출시 예정"}
                </span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{sol.description}</p>
              <div className="flex flex-wrap gap-1">
                {sol.features.slice(0, 3).map((f) => (
                  <span key={f} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30">{f}</span>
                ))}
              </div>
              <button
                onClick={() => {
                  if (!isAvailable) return;
                  const scenarioId = SOLUTION_TO_SCENARIO[sol.id];
                  if (scenarioId) {
                    // Step2로 이동 (스펙 설정 → 하네스 생성 → 에디터)
                    setSelectedScenario(scenarioId as "energy" | "manufacturing" | "smartcity");
                    setIsWorking(true);
                  } else {
                    router.push(`/editor?solution=${sol.id}`);
                  }
                }}
                disabled={!isAvailable}
                className={cn(
                  "mt-auto w-full rounded-lg py-2 text-xs font-medium transition-all",
                  isAvailable
                    ? "bg-gradient-to-r from-violet-600/80 to-indigo-600/80 text-white hover:from-violet-600 hover:to-indigo-600"
                    : "cursor-not-allowed bg-white/5 text-white/20"
                )}
              >
                {isAvailable ? "시작하기" : "출시 예정"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
