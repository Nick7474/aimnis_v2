"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Terminal, Sparkles, Palette, Check } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { WidgetData } from "@/store/editorStore";
import AiChatInput from "@/components/shared/AiChatInput";
import { cn } from "@/lib/utils";
import { computeNextPosition, getWidgetSize } from "./SmartGridEngine";
import { detectBrandSuggestion, encodeBrandSuggestion, parseBrandSuggestion } from "@/lib/brandAgent";
import type { BrandAgentSuggestion } from "@/lib/brandAgent";
import { parseIntent } from "@/lib/intentParser";

const LOGS = [
  "✓ solution loader initialized",
  "✓ harness-schema.json loaded",
  "✓ SmartGridEngine ready",
  "✓ intent engine v2 ready (API-free)",
  "✓ Sonnet+Opus advisor connected",
  "→ waiting for user input...",
];

// 빠른 예시 버튼 — 단어 하나로도 작동함을 보여주는 예시
const QUICK_HINTS = [
  { label: "KPI",       prompt: "kpi" },
  { label: "라인 차트", prompt: "라인차트" },
  { label: "게이지",    prompt: "게이지" },
  { label: "알람 패널", prompt: "알람" },
  { label: "바 차트",   prompt: "바차트" },
  { label: "도넛 차트", prompt: "도넛" },
  { label: "테이블",    prompt: "테이블" },
  { label: "POSCO 톤",  prompt: "포스코" },
  { label: "KEPCO 화이트", prompt: "kepco" },
  { label: "데이터 매핑",  prompt: "매핑" },
];

interface ChatPanelProps {
  solutionId: string;
}

function extractDisplayText(content: string): string {
  const widgetIdx = content.indexOf("__WIDGET_JSON__");
  const brandIdx  = content.indexOf("__BRAND_SUGGESTION__");
  const markers   = [widgetIdx, brandIdx].filter((idx) => idx !== -1);
  if (markers.length === 0) return content;
  return content.slice(0, Math.min(...markers)).trim();
}

function WidgetBadge({ type, title }: { type: string; title: string }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="mt-2 flex items-center gap-1.5 rounded-lg bg-purple-500/15 px-2 py-1 ring-1 ring-purple-500/25"
    >
      <Sparkles className="h-3 w-3 text-purple-400" />
      <span className="text-[10px] font-medium text-purple-300">
        {title} <span className="text-purple-400/60">({type})</span>
      </span>
    </motion.div>
  );
}

function BrandSuggestionCard({ suggestion, applied, onApply }: { suggestion: BrandAgentSuggestion; applied: boolean; onApply: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.08] p-2.5"
    >
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-400/10">
          <Palette className="h-3.5 w-3.5 text-cyan-200" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-cyan-100">{suggestion.label}</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-white/40">{suggestion.summary}</p>
          <div className="mt-2 space-y-1">
            {suggestion.changes.map((change) => (
              <div key={change} className="flex items-center gap-1.5 text-[10px] text-white/35">
                <span className="h-1 w-1 rounded-full bg-cyan-300/70" />
                {change}
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onApply}
        disabled={applied}
        className={cn(
          "mt-2 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border text-[11px] font-semibold transition-colors",
          applied
            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
            : "border-cyan-400/25 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25"
        )}
      >
        {applied ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
        {applied ? "프리셋 적용됨" : "프리셋 적용"}
      </button>
    </motion.div>
  );
}

export default function ChatPanel({ solutionId }: ChatPanelProps) {
  const {
    messages, isStreaming, addMessage, updateLastMessage, setStreaming,
    setLastCommand, overlayWidgets, addOverlayWidget, canvasSize,
    selectBrandPreset, setRightPanel,
  } = useEditorStore();

  const [input, setInput]                   = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [logsOpen, setLogsOpen]             = useState(false);
  const [widgetBadges, setWidgetBadges]     = useState<Record<string, { type: string; title: string }>>({});
  const [appliedBrandIds, setAppliedBrandIds] = useState<Set<string>>(new Set());
  const messageScrollRef  = useRef<HTMLDivElement>(null);
  const processedJsonIds  = useRef<Set<string>>(new Set());

  // 첫 방문 안내
  useEffect(() => {
    const KEY = "aimi_editor_welcomed_v2";
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, "1");
      setTimeout(() => {
        addMessage({
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content:
            "안녕하세요! 저는 에임이입니다.\n단어 하나만 입력해도 바로 실행됩니다.\n\n위젯 추가\n• kpi / 게이지 / 라인차트\n• 알람 / 바차트 / 도넛 / 테이블\n\n브랜드\n• 포스코 / kepco / 그레이 / 다크\n\n화면\n• 매핑 / 모니터\n\n그 외 복잡한 요청은 자연어로 말씀해 주세요!",
        });
      }, 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = messageScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // 위젯 캔버스에 추가
  const addWidgetOverlay = useCallback((payload: { widgetId: string; type: string; title: string; data: WidgetData }) => {
    const { w, h } = getWidgetSize(payload.type);
    const existing = overlayWidgets.map(ow => ({ x: ow.x, y: ow.y, w: ow.w, h: ow.h }));
    const { x, y } = computeNextPosition(canvasSize.w, canvasSize.h, existing, payload.type);
    addOverlayWidget({ id: payload.widgetId, type: payload.type, title: payload.title, data: payload.data, x, y, w, h });
  }, [overlayWidgets, canvasSize, addOverlayWidget]);

  // ── 공통 메시지 처리 (빠른 경로 → API) ───────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg = { id: Date.now().toString(), role: "user" as const, content: text };
    addMessage(userMsg);
    const aiId = (Date.now() + 1).toString();

    // ── 빠른 경로: intentParser (API 불필요) ──────────────────
    const intent = parseIntent(text);
    if (intent.type !== "unknown") {
      const store = useEditorStore.getState();
      switch (intent.type) {
        case "brand_preset":
          store.selectBrandPreset(intent.params.presetId);
          if (intent.params.title) store.setSystemTitle(intent.params.title);
          break;
        case "tenant_name":
          store.updateBrand({ tenantName: intent.params.name });
          break;
        case "system_title":
          store.setSystemTitle(intent.params.title);
          break;
        case "view_mapping":
          store.setCenterView("mapping");
          store.setRightPanel("mapping");
          break;
        case "view_monitor":
          store.setCenterView("monitor");
          break;
        case "clear_widgets":
          store.overlayWidgets.forEach(w => store.removeOverlayWidget(w.id));
          break;
        // 위젯 생성 (7종) — 즉시 실행
        case "add_kpi":
        case "add_chart_line":
        case "add_chart_bar":
        case "add_chart_donut":
        case "add_gauge":
        case "add_alert_panel":
        case "add_table": {
          if (intent.widgetTemplate) {
            const tpl = intent.widgetTemplate;
            const wId = `w-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            addWidgetOverlay({ widgetId: wId, type: tpl.type, title: tpl.title, data: tpl.data as WidgetData });
            setWidgetBadges(prev => ({ ...prev, [aiId]: { type: tpl.type, title: tpl.title } }));
          }
          break;
        }
      }
      addMessage({ id: aiId, role: "assistant", content: intent.ackMessage });
      return;
    }

    // ── 브랜드 제안 카드 ──────────────────────────────────────
    const brandSuggestion = detectBrandSuggestion(text);
    if (brandSuggestion) {
      const response = [
        `${brandSuggestion.tenantName} 납품형 브랜드 프리셋을 찾았습니다.`,
        "아래 항목을 확인한 뒤 적용하면 중앙 프리뷰와 우측 설정이 함께 전환됩니다.",
        encodeBrandSuggestion(brandSuggestion),
      ].join("\n");
      addMessage({ id: aiId, role: "assistant", content: response });
      setLastCommand({ userText: text, aiResponse: response, timestamp: Date.now() });
      setRightPanel("settings");
      return;
    }

    // ── API 경로 (복잡한 요청) ────────────────────────────────
    addMessage({ id: aiId, role: "assistant", content: "", streaming: true });
    setStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }], solution: solutionId }),
      });
      const reader  = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          updateLastMessage(full);
        }
      }
      setLastCommand({ userText: text, aiResponse: full, timestamp: Date.now() });

      // __WIDGET_JSON__ 파싱 (API 경로 위젯 생성)
      if (!processedJsonIds.current.has(aiId)) {
        let widgetJson: Record<string, unknown> | null = null;
        const markerIdx = full.indexOf("__WIDGET_JSON__");
        if (markerIdx !== -1) {
          const after = full.slice(markerIdx + "__WIDGET_JSON__".length).trim();
          try { const m = after.match(/\{[\s\S]*\}/); if (m) widgetJson = JSON.parse(m[0]); } catch { /* ignore */ }
        }
        if (!widgetJson) {
          try { const m = full.match(/\{\s*"action"\s*:\s*"add_widget[s]?"[\s\S]*?\}[\s\S]*?\}/); if (m) widgetJson = JSON.parse(m[0]); } catch { /* ignore */ }
        }
        if (widgetJson) {
          processedJsonIds.current.add(aiId);
          let single: Record<string, unknown> | null = null;
          if (widgetJson.action === "add_widget" && widgetJson.widget) single = widgetJson.widget as Record<string, unknown>;
          else if (widgetJson.action === "add_widgets" && Array.isArray(widgetJson.widgets) && widgetJson.widgets.length > 0) single = widgetJson.widgets[0];
          if (single) {
            const wId = `w-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            single.widgetId = wId;
            addWidgetOverlay({ widgetId: wId, type: single.type as string, title: single.title as string, data: single.data as WidgetData });
            setWidgetBadges(prev => ({ ...prev, [aiId]: { type: single!.type as string, title: single!.title as string } }));
          }
        }
      }
    } catch {
      updateLastMessage("⚠️ API 연결 오류. ANTHROPIC_API_KEY를 확인하세요.");
    } finally {
      setStreaming(false);
    }
  }, [isStreaming, addMessage, addWidgetOverlay, setLastCommand, setRightPanel, setStreaming, updateLastMessage, solutionId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text && attachedImages.length === 0) return;
    setInput("");
    setAttachedImages([]);
    await sendMessage(text);
  };

  const handleSendText = (text: string) => {
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-full flex-col">
      {/* 메시지 목록 */}
      <div ref={messageScrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const displayText    = extractDisplayText(msg.content);
            const badge          = widgetBadges[msg.id];
            const brandSuggestion = parseBrandSuggestion(msg.content);
            const applied        = appliedBrandIds.has(msg.id);
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start items-start")}
              >
                {msg.role === "assistant" && (
                  <img src="/img/ch6.png" alt="에임이" className="h-6 w-6 flex-shrink-0 rounded-full object-cover ring-1 ring-violet-500/20 mt-1" />
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap",
                    msg.role === "user" ? "bg-purple-500/20 text-purple-100" : "bg-white/5 text-white/80"
                  )}
                >
                  {displayText ? (
                    displayText
                  ) : !msg.content ? (
                    <span className="flex items-center gap-1.5 text-white/30">
                      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }}>●</motion.span>
                      생각 중…
                    </span>
                  ) : (
                    <span className="text-purple-300/80 italic text-[10px]">위젯 생성 완료</span>
                  )}
                  {badge && <WidgetBadge type={badge.type} title={badge.title} />}
                  {brandSuggestion && (
                    <BrandSuggestionCard
                      suggestion={brandSuggestion}
                      applied={applied}
                      onApply={() => {
                        selectBrandPreset(brandSuggestion.presetId);
                        setRightPanel("settings");
                        setAppliedBrandIds(prev => { const next = new Set(prev); next.add(msg.id); return next; });
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 실행 로그 */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setLogsOpen(v => !v)}
          className="flex w-full items-center gap-1.5 px-4 py-2 text-[10px] text-white/25 hover:text-white/50 transition-colors"
        >
          <Terminal className="h-3 w-3" />
          실행 로그
          {logsOpen ? <ChevronDown className="h-3 w-3 ml-auto" /> : <ChevronRight className="h-3 w-3 ml-auto" />}
        </button>
        <AnimatePresence>
          {logsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 pb-2"
            >
              {LOGS.map((log, i) => (
                <p key={i} className="font-mono text-[10px] text-white/20">{log}</p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 빠른 예시 버튼 */}
      <div className="flex flex-wrap gap-1.5 px-3 pt-2 pb-1">
        {QUICK_HINTS.map((hint) => (
          <button
            key={hint.label}
            onClick={() => handleSendText(hint.prompt)}
            className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[10px] text-white/25 transition-all hover:border-white/15 hover:bg-white/[0.07] hover:text-white/50"
          >
            {hint.label}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div className="border-t border-white/5 p-3">
        <AiChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          isLoading={isStreaming}
          placeholder="단어 하나로도 OK — kpi, 게이지, 알람, 포스코..."
          attachedImages={attachedImages}
          onImagesChange={setAttachedImages}
        />
      </div>
    </div>
  );
}
