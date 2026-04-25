import { NextRequest } from "next/server";

const GEMINI_MODEL  = "gemini-2.5-flash-lite-preview-06-17";
const HAIKU_MODEL   = "claude-haiku-4-5-20251001";
const SONNET_MODEL  = "claude-sonnet-4-6";
const OPUS_MODEL    = "claude-opus-4-6";

const SYSTEM_PROMPT = `당신은 AIMNIS 엔터프라이즈 AI 플랫폼의 하네스 생성 엔진입니다.
사용자가 요구사항을 입력하면 아래 형식으로 한국어로 응답하세요.

응답 형식 (반드시 이 구조 유지):
1. 한 줄 요약 (20자 이내)
2. 빈 줄
3. 구성 위젯 목록 (• 위젯명 — 설명, 3~5개)
4. 빈 줄
5. "→ 하네스 생성 완료. 에디터에서 확인하세요."`;

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

  // Gemini 경로
  if (provider === "gemini-flash-lite") {
    try {
      const stream = await geminiStream(userText);
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
