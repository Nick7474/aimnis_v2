import { NextRequest } from "next/server";

const GEMINI_MODEL  = "gemini-2.5-flash-lite-preview-06-17";
const HAIKU_MODEL   = "claude-haiku-4-5-20251001";
const SONNET_MODEL  = "claude-sonnet-4-6";
const OPUS_MODEL    = "claude-opus-4-6";

// ─── Claude 통합 시스템 프롬프트 ─────────────────────────────────
function buildClaudeSystem(solution: string): string {
  return `당신은 AIMNIS 엔터프라이즈 플랫폼의 AI 어시스턴트입니다.
현재 솔루션: ${solution}

[위젯 추가/생성 요청인 경우] 반드시 아래 형식으로 응답:
[한국어 설명 1-2문장]
__WIDGET_JSON__
{"action":"add_widget","widget":{"widgetId":"타입-001","type":"타입","title":"한국어 제목","data":{...}}}

위젯 타입별 data:
- kpi: {"value":"수치","unit":"단위","trend":"+X%","trendUp":true,"color":"#hex"}
- chart-line: {"color":"#hex","chartData":[{"name":"레이블","value":숫자} × 7개]}
- chart-bar: {"color":"#hex","chartData":[{"name":"구역","value":숫자} × 4-5개]}
- chart-donut: {"chartData":[{"name":"항목","value":숫자} × 3-4개]}
- gauge: {"gaugeValue":0-100,"gaugeMax":100,"unit":"단위","color":"#hex"}
- alert-panel: {"alerts":[{"level":"critical|warning|info","msg":"한국어 메시지"} × 3개]}

[일반 질문/대화인 경우] 한국어로 자연스럽게 답변. __WIDGET_JSON__ 없이 텍스트만.

공통 규칙:
- 데이터는 도메인에 맞는 현실적 수치 사용
- JSON 앞뒤 마크다운 코드블록 절대 금지`;
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

// ─── Gemini 스트리밍 ─────────────────────────────────────────────
async function handleGemini(
  systemPrompt: string,
  userText: string
): Promise<ReadableStream<Uint8Array>> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContentStream(userText);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) controller.enqueue(enc.encode(text));
      }
      controller.close();
    },
  });
}

// ─── Claude 생성 ─────────────────────────────────────────────────
async function handleClaude(
  messages: { role: string; content: string }[],
  solution: string,
  userText: string,
  model: string = HAIKU_MODEL
): Promise<ReadableStream<Uint8Array>> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

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

  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(fullText));
      controller.close();
    },
  });
}

// ─── POST 핸들러 ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { messages, solution, provider } = await req.json();
  const userText = (messages[messages.length - 1]?.content as string) ?? "";
  const sol = (solution as string) ?? "guard";

  // Gemini 경로
  if (provider === "gemini-flash-lite") {
    try {
      const system = buildClaudeSystem(sol); // 같은 시스템 프롬프트 재사용
      const stream = await handleGemini(system, userText);
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
      });
    } catch {
      const fallback = `${generateMockNarrative(userText)}\n__WIDGET_JSON__\n${generateMockWidget(userText)}`;
      return new Response(fallback, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  // Claude 모델 선택
  const claudeModel =
    provider === "claude-opus"   ? OPUS_MODEL   :
    provider === "claude-sonnet" ? SONNET_MODEL :
    HAIKU_MODEL;

  const isClaudeProvider =
    provider === "claude-haiku" ||
    provider === "claude-sonnet" ||
    provider === "claude-opus";

  if (isClaudeProvider) {
    try {
      const stream = await handleClaude(messages, sol, userText, claudeModel);
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
      });
    } catch {
      const fallback = `${generateMockNarrative(userText)}\n__WIDGET_JSON__\n${generateMockWidget(userText)}`;
      return new Response(fallback, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  // 알 수 없는 provider → mock
  const fallback = `${generateMockNarrative(userText)}\n__WIDGET_JSON__\n${generateMockWidget(userText)}`;
  return new Response(fallback, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
