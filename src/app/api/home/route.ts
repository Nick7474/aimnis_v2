import { NextRequest } from "next/server";

const GEMINI_MODEL  = "gemini-2.5-flash-lite-preview-06-17";
const HAIKU_MODEL   = "claude-haiku-4-5-20251001";
const SONNET_MODEL  = "claude-sonnet-4-6";
const OPUS_MODEL    = "claude-opus-4-6";

const SYSTEM_PROMPT = `당신은 AIMNIS 엔터프라이즈 AI 플랫폼의 전문 AI 에이전트입니다.
풍부한 산업 현장 지식을 갖춘 영업/기술 컨설턴트로서 사용자의 모든 질문에 명확하고 도움이 되는 답변을 제공합니다.

AIMNIS 플랫폼 소개:
- AIMNIS는 산업 현장에 최적화된 엔터프라이즈 AI 플랫폼입니다
- AIM GUARD: 보안·안전 통합 모니터링 솔루션 (CCTV AI 분석, 침입 감지, 화재 감지)
- AIM ECO: 탄소 중립·에너지 효율화 ESG 관리 솔루션
- 하네스(Harness): 현장 맞춤형 AI 대시보드를 자동 구성하는 핵심 기능

응답 규칙:
1. 일반 질문, 소개 요청, 기능 문의 → 자연스럽고 전문적인 한국어로 명확하게 답변
2. 대시보드·하네스·위젯 생성 요청 → 아래 하네스 형식으로만 출력
3. 어떤 질문이든 성실하고 구체적으로 답변 (앵무새처럼 동일한 답변 절대 금지)

[하네스 생성 형식 — 생성 요청 시에만 사용]
[현장 맞춤 제목 20자 이내]

• [업종 맞춤 위젯명] — [실제 데이터 포인트·단위 포함 설명]
(3~5개, 요청 맥락에 정확히 맞는 위젯만)

→ 하네스 생성 완료. 에디터에서 확인하세요.`;

function mockResponse(userText: string): string {
  return `${userText.slice(0, 20)} 하네스\n\n• KPI 카드 — 핵심 수치 실시간 표시\n• 라인 차트 — 시계열 데이터 추이\n• 알람 패널 — 이상 감지 이벤트 목록\n• 게이지 — 현재 상태 수치화\n\n→ 하네스 생성 완료. 에디터에서 확인하세요.`;
}

// ─── Gemini 스트리밍 ─────────────────────────────────────────────
async function geminiStream(prompt: string): Promise<ReadableStream<Uint8Array>> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await model.generateContentStream(prompt);

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

// ─── Claude 스트리밍 ─────────────────────────────────────────────
async function claudeStream(model: string, prompt: string): Promise<ReadableStream<Uint8Array>> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  const stream = await client.messages.create({
    model,
    max_tokens: 512,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(enc.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });
}

export async function POST(req: NextRequest) {
  const { prompt, provider = "gemini-flash-lite" } = await req.json();
  const userText = (prompt as string) ?? "";

  // Gemini 경로 — GOOGLE_API_KEY 없으면 Claude Haiku로 자동 fallback
  if (provider === "gemini-flash-lite") {
    if (process.env.GOOGLE_API_KEY) {
      try {
        const stream = await geminiStream(userText);
        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
        });
      } catch { /* Gemini 실패 시 Claude fallback */ }
    }
    // Google API 키 없으면 Claude Haiku로 대체
    try {
      const stream = await claudeStream(HAIKU_MODEL, userText);
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
      });
    } catch {
      return new Response(mockResponse(userText), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  // Claude 경로
  const claudeModel =
    provider === "claude-opus"   ? OPUS_MODEL   :
    provider === "claude-sonnet" ? SONNET_MODEL :
    HAIKU_MODEL;

  try {
    const stream = await claudeStream(claudeModel, userText);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
    });
  } catch {
    return new Response(mockResponse(userText), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
