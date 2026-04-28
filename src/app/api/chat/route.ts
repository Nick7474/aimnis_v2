import { NextRequest } from "next/server";

// gemini-2.0-flash-lite: 안정적으로 광범위 지원, Flash-Lite 계열 중 권장
const GEMINI_MODEL  = "gemini-2.0-flash-lite";
const HAIKU_MODEL   = "claude-haiku-4-5-20251001";
const SONNET_MODEL  = "claude-sonnet-4-6";
const OPUS_MODEL    = "claude-opus-4-6";

// ─── Claude용 시스템 프롬프트 (JSON 스키마 포함 상세 버전) ──────────
function buildClaudeSystem(solution: string): string {
  return `당신은 AIMNIS 에이전트입니다. 실제 모델명(Claude, Gemini 등)은 절대 밝히지 않습니다.
현재 편집 중인 솔루션: ${solution}

역할: 산업 현장 전문가이자 AIMNIS 플랫폼 컨설턴트
- 어떤 질문에도 명확하고 전문적으로 한국어로 답변
- 위젯/대시보드/차트 추가 요청 시에만 아래 JSON 형식 사용

[위젯 생성 요청 시 출력 형식]
설명 1-2문장
__WIDGET_JSON__
{"action":"add_widget","widget":{"widgetId":"타입-001","type":"타입","title":"한국어","data":{...}}}

위젯 타입별 data:
kpi: {"value":"수치","unit":"단위","trend":"+X%","trendUp":true,"color":"#hex"}
chart-line: {"color":"#hex","chartData":[{"name":"레이블","value":숫자}]} (7개)
chart-bar: {"color":"#hex","chartData":[{"name":"구역","value":숫자}]} (4-5개)
chart-donut: {"chartData":[{"name":"항목","value":숫자}]} (3-4개)
gauge: {"gaugeValue":0-100,"gaugeMax":100,"unit":"단위","color":"#hex"}
alert-panel: {"alerts":[{"level":"critical|warning|info","msg":"메시지"}]} (3개)

규칙: 일반 질문은 __WIDGET_JSON__ 없이 텍스트만. JSON 앞뒤 코드블록 금지.`;
}

// ─── Gemini용 시스템 프롬프트 (단순화 버전 — Flash-Lite 호환) ──────
function buildGeminiSystem(solution: string): string {
  return `당신은 AIMNIS 에이전트입니다. 실제 모델명(Gemini, Claude 등)은 절대 밝히지 않습니다. 현재 솔루션: ${solution}

규칙:
1. 일반 질문 → 한국어로 자연스럽게 답변
2. "위젯 추가해줘", "차트 만들어줘" 등 위젯 생성 요청 → 아래 형식으로 응답:

[한국어 설명]
__WIDGET_JSON__
{"action":"add_widget","widget":{"widgetId":"w-001","type":"kpi","title":"제목","data":{"value":"99","unit":"%","trend":"+1%","trendUp":true,"color":"#14b8a6"}}}

중요: 위젯 요청이 아니면 __WIDGET_JSON__ 절대 출력하지 말 것.`;
}


// ─── Gemini 스트리밍 (대화 히스토리 포함) ───────────────────────────
async function handleGemini(
  messages: { role: string; content: string }[],
  solution: string
): Promise<ReadableStream<Uint8Array>> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: buildGeminiSystem(solution),
  });

  // 대화 히스토리를 Gemini 형식으로 변환
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
  const lastMessage = messages[messages.length - 1]?.content ?? "";

  const chat = model.startChat({ history });
  const result = await chat.sendMessageStream(lastMessage);

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
  model: string = HAIKU_MODEL
): Promise<ReadableStream<Uint8Array>> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  const resp = await client.messages.create({
    model,
    max_tokens: 600,
    system: [{ type: "text", text: buildClaudeSystem(solution), cache_control: { type: "ephemeral" } }],
    messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  });

  const fullText = resp.content[0]?.type === "text" ? resp.content[0].text : "";

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
  const sol = (solution as string) ?? "guard";

  // Gemini 경로
  if (provider === "gemini-flash-lite") {
    if (!process.env.GOOGLE_API_KEY) {
      // Google 키 없으면 Claude Haiku로 대체
      try {
        const stream = await handleClaude(messages, sol, HAIKU_MODEL);
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
      } catch {
        return new Response("API 오류가 발생했습니다. 다시 시도해주세요.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    }
    try {
      const stream = await handleGemini(messages, sol);
      return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
    } catch (e) {
      console.error("[Gemini chat error]", e);
      // Gemini 실패 시 Claude Haiku로 자동 전환
      try {
        const stream = await handleClaude(messages, sol, HAIKU_MODEL);
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
      } catch {
        return new Response("AI 연결 오류가 발생했습니다. 다시 시도해주세요.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    }
  }

  // Claude 경로
  const claudeModel =
    provider === "claude-opus"   ? OPUS_MODEL   :
    provider === "claude-sonnet" ? SONNET_MODEL :
    HAIKU_MODEL;

  if (provider === "claude-haiku" || provider === "claude-sonnet" || provider === "claude-opus") {
    try {
      const stream = await handleClaude(messages, sol, claudeModel);
      return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
    } catch (e) {
      console.error("[Claude chat error]", e);
      return new Response("Claude API 오류가 발생했습니다. 다시 시도해주세요.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  }

  // 미매칭 provider → 기본 Claude Haiku
  try {
    const stream = await handleClaude(messages, sol, HAIKU_MODEL);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
  } catch {
    return new Response("AI 연결 오류가 발생했습니다.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
