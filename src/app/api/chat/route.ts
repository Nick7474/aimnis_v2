import { NextRequest } from "next/server";

const LLM_PROVIDER = process.env.LLM_PROVIDER ?? "gemma";
const OLLAMA_URL   = process.env.OLLAMA_URL   ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma4";
const HAIKU_MODEL  = "claude-haiku-4-5-20251001";
const SONNET_MODEL = "claude-sonnet-4-6";

// ─── Claude 통합 시스템 프롬프트 (내러티브 + 위젯 JSON 동시 생성) ──
function buildClaudeSystem(solution: string): string {
  return `당신은 AIMNIS 엔터프라이즈 플랫폼의 AI 위젯 어시스턴트입니다.
현재 솔루션: ${solution}

사용자 요청에 따라 반드시 아래 형식으로 응답하세요:

[한국어 설명 1-2문장]
__WIDGET_JSON__
{"action":"add_widget","widget":{"widgetId":"[타입-타임스탬프]","type":"[타입]","title":"[한국어 제목]","data":{...}}}

위젯 타입별 data 스키마:
- kpi: {"value":"수치","unit":"단위","trend":"+X%","trendUp":true,"color":"#hex"}
- chart-line: {"color":"#hex","chartData":[{"name":"시간대","value":숫자} × 7]}
- chart-bar: {"color":"#hex","chartData":[{"name":"구역명","value":숫자} × 4-6]}
- chart-donut: {"chartData":[{"name":"항목","value":숫자} × 3-4]}
- gauge: {"gaugeValue":숫자,"gaugeMax":100,"unit":"단위","color":"#hex"}
- alert-panel: {"alerts":[{"level":"critical|warning|info","msg":"한국어 경보 메시지"} × 3]}

규칙:
- 데이터는 현실적이고 도메인에 맞는 수치 사용 (랜덤 금지)
- widgetId 형식: "kpi-001", "chart-line-002" 등
- JSON 앞뒤 마크다운 코드블록 절대 금지
- __WIDGET_JSON__ 구분자는 반드시 단독 줄에 위치`;
}

// ─── Ollama 스트리밍 ─────────────────────────────────────────────
async function ollamaStream(systemPrompt: string, userText: string): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, system: systemPrompt, prompt: userText, stream: true }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  return res.body!;
}

// ─── Mock fallback ──────────────────────────────────────────────
function generateMockWidget(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("kpi") || lower.includes("수치") || lower.includes("에너지") || lower.includes("현황")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `kpi-${Date.now()}`, type: "kpi", title: lower.includes("에너지") ? "에너지 소비량" : "KPI 지표", data: { value: "247.3", unit: lower.includes("에너지") ? "kWh" : "%", trend: "+3.2%", trendUp: true, color: "#14b8a6" } } });
  }
  if (lower.includes("라인") || lower.includes("차트") || lower.includes("그래프") || lower.includes("추이")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `line-${Date.now()}`, type: "chart-line", title: "실시간 추이", data: { color: "#6366f1", chartData: ["월","화","수","목","금","토","일"].map((d, i) => ({ name: d, value: 40 + i * 8 })) } } });
  }
  if (lower.includes("바") || lower.includes("막대") || lower.includes("비교")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `bar-${Date.now()}`, type: "chart-bar", title: "구역별 비교", data: { color: "#8b5cf6", chartData: [{ name: "A구역", value: 42 }, { name: "B구역", value: 67 }, { name: "C구역", value: 31 }, { name: "D구역", value: 89 }] } } });
  }
  if (lower.includes("게이지") || lower.includes("온도") || lower.includes("압력")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `gauge-${Date.now()}`, type: "gauge", title: "시스템 상태", data: { gaugeValue: 72, gaugeMax: 100, unit: "%", color: "#f59e0b" } } });
  }
  if (lower.includes("알람") || lower.includes("알림") || lower.includes("경보")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `alert-${Date.now()}`, type: "alert-panel", title: "실시간 알람", data: { alerts: [{ level: "critical", msg: "배터리실 온도 임계값 초과 (87°C)" }, { level: "warning", msg: "B구역 에너지 소비 급증 감지" }, { level: "info", msg: "야간 점검 스케줄 시작" }] } } });
  }
  if (lower.includes("도넛") || lower.includes("비율") || lower.includes("분포")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `donut-${Date.now()}`, type: "chart-donut", title: "위험도 분포", data: { chartData: [{ name: "정상", value: 68 }, { name: "주의", value: 22 }, { name: "위험", value: 10 }] } } });
  }
  return JSON.stringify({ action: "add_widget", widget: { widgetId: `kpi-${Date.now()}`, type: "kpi", title: "모니터링 지표", data: { value: "99.8", unit: "%", trend: "+0.2%", trendUp: true, color: "#14b8a6" } } });
}

function generateMockNarrative(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("kpi") || lower.includes("에너지")) return "KPI 카드 위젯을 캔버스에 추가했습니다.";
  if (lower.includes("차트") || lower.includes("라인")) return "라인 차트 위젯을 추가했습니다.";
  if (lower.includes("바") || lower.includes("막대")) return "바 차트 위젯을 추가했습니다.";
  if (lower.includes("게이지")) return "게이지 위젯을 추가했습니다.";
  if (lower.includes("알람") || lower.includes("알림")) return "알람 패널 위젯을 추가했습니다.";
  return "위젯을 캔버스에 추가했습니다.";
}

// ─── Claude 통합 생성 (내러티브 + 위젯 JSON 동시) ────────────────
async function handleClaude(
  messages: { role: string; content: string }[],
  solution: string,
  userText: string,
  model: string = HAIKU_MODEL
): Promise<ReadableStream<Uint8Array>> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  // 단일 호출로 내러티브 + 위젯 JSON 동시 생성 (토큰 효율 최대화)
  const resp = await client.messages.create({
    model,
    max_tokens: 512,
    system: [{ type: "text", text: buildClaudeSystem(solution), cache_control: { type: "ephemeral" } }],
    messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  });

  const fullText =
    resp.content[0]?.type === "text"
      ? resp.content[0].text
      : `${generateMockNarrative(userText)}\n__WIDGET_JSON__\n${generateMockWidget(userText)}`;

  // __WIDGET_JSON__ 구분자가 없으면 mock JSON 붙임
  const hasMarker = fullText.includes("__WIDGET_JSON__");
  const finalText = hasMarker ? fullText : `${fullText}\n__WIDGET_JSON__\n${generateMockWidget(userText)}`;

  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(finalText));
      controller.close();
    },
  });
}

// ─── POST 핸들러 ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { messages, solution, provider } = await req.json();
  const userText = (messages[messages.length - 1]?.content as string) ?? "";
  const sol = (solution as string) ?? "guard";

  const isClaude = provider === "claude-haiku" || provider === "claude-sonnet";
  const effectiveProvider = isClaude ? "claude" : (LLM_PROVIDER as string);
  const claudeModel = provider === "claude-sonnet" ? SONNET_MODEL : HAIKU_MODEL;

  if (effectiveProvider === "claude") {
    try {
      const stream = await handleClaude(messages, sol, userText, claudeModel);
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
      });
    } catch {
      // API 오류 시 mock fallback
      const fallback = `${generateMockNarrative(userText)}\n__WIDGET_JSON__\n${generateMockWidget(userText)}`;
      return new Response(fallback, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  // Gemma4 (Ollama) 경로
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const widgetJson = generateMockWidget(userText);

      const narrativeSystem = `당신은 AIMNIS 플랫폼 AI 어시스턴트입니다. 위젯 추가 요청에 한국어로 1-2문장 응답하세요.`;

      const narrativeStream = await ollamaStream(narrativeSystem, userText).catch(() => null);

      if (narrativeStream) {
        try {
          const reader = narrativeStream.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = decoder.decode(value).split("\n").filter(Boolean);
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line) as { response?: string };
                if (parsed.response) controller.enqueue(enc.encode(parsed.response));
              } catch { /* skip */ }
            }
          }
        } catch {
          controller.enqueue(enc.encode(generateMockNarrative(userText)));
        }
      } else {
        controller.enqueue(enc.encode(generateMockNarrative(userText)));
      }

      controller.enqueue(enc.encode(`\n__WIDGET_JSON__\n${widgetJson}`));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
  });
}
