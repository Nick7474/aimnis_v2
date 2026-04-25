import { NextRequest } from "next/server";

const GEMINI_MODEL  = "gemini-2.5-flash-lite-preview-06-17";
const HAIKU_MODEL   = "claude-haiku-4-5-20251001";
const SONNET_MODEL  = "claude-sonnet-4-6";
const OPUS_MODEL    = "claude-opus-4-6";

const SYSTEM_PROMPT = `당신은 AIMNIS 엔터프라이즈 AI 플랫폼의 하네스 설계 전문가입니다.
사용자의 요구사항을 분석하여 해당 도메인에 최적화된 대시보드 하네스를 설계합니다.

규칙:
- 사용자가 요청한 업종/현장에 실제로 필요한 지표와 위젯만 선택할 것
- 위젯명과 설명은 반드시 요구사항의 맥락을 반영할 것 (절대 generic 금지)
- KPI 카드·라인 차트·알람 패널·게이지만 반복하지 말고 실제 업무에 맞는 이름 사용
- 3~5개 위젯, 각 설명은 실제 데이터 포인트/단위 포함

출력 형식 (반드시 준수):
[요구사항을 반영한 구체적 한 줄 제목 — 20자 이내]

• [도메인 맞춤 위젯명] — [실제 측정 지표 및 단위 포함 설명]
• [도메인 맞춤 위젯명] — [실제 측정 지표 및 단위 포함 설명]
• [도메인 맞춤 위젯명] — [실제 측정 지표 및 단위 포함 설명]

→ 하네스 생성 완료. 에디터에서 확인하세요.

예시 — "배터리공장 화재 감지 모니터링":
배터리공장 화재 감지 하네스

• 셀 온도 히트맵 — 배터리팩 구역별 온도 분포 (정상 25°C / 경보 60°C↑)
• 열폭주 경보 패널 — 위험 구역 즉시 알람 및 자동 차단 이력
• 충방전 전류 추이 — 팩별 충방전 전류값 실시간 라인 차트 (A 단위)
• SOC 잔량 KPI — 배터리 충전 상태(State of Charge) % 실시간 표시

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
