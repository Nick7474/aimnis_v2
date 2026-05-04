import { NextRequest } from "next/server";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

function buildSystemPrompt(): string {
  return `당신은 AIMNIS 엔터프라이즈 AI 플랫폼의 전문 AI 에이전트입니다.
풍부한 산업 현장 지식을 갖춘 영업/기술 컨설턴트로서 사용자의 모든 질문에 명확하고 도움이 되는 답변을 제공합니다.

AIMNIS 플랫폼 소개:
- AIMNIS는 산업 현장에 최적화된 엔터프라이즈 AI 플랫폼입니다
- AIM GUARD: 보안·안전 통합 모니터링 솔루션 (CCTV AI 분석, 침입 감지, 화재 감지)
- AIM ECO: 탄소 중립·에너지 효율화 ESG 관리 솔루션
- 하네스(Harness): 현장 맞춤형 AI 대시보드를 자동 구성하는 핵심 기능

응답 규칙:
1. 일반 질문, 소개 요청, 기능 문의 → 자연스럽고 전문적인 한국어로 명확하게 답변
2. 당신의 기반 모델 정보를 묻는 질문에는 당신은 Claude(Anthropic) 기반으로 동작하는 AIMNIS 에이전트라고 명확히 답변하세요.
3. 대시보드·하네스·위젯 생성 요청 → 아래 하네스 형식으로만 출력
4. 어떤 질문이든 성실하고 구체적으로 답변 (앵무새처럼 동일한 답변 절대 금지)

[하네스 생성 형식 — 생성 요청 시에만 사용]
[현장 맞춤 제목 20자 이내]

• [업종 맞춤 위젯명] — [실제 데이터 포인트·단위 포함 설명]
(3~5개, 요청 맥락에 정확히 맞는 위젯만)

→ 하네스 생성 완료. 에디터에서 확인하세요.`;
}

// ─── Claude 스트리밍 ─────────────────────────────────────────────
async function claudeStream(model: string, prompt: string): Promise<ReadableStream<Uint8Array>> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || undefined });

  const stream = await client.messages.create({
    model,
    max_tokens: 512,
    system: buildSystemPrompt(),
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
  const { prompt } = await req.json();
  const userText = (prompt as string) ?? "";

  try {
    const stream = await claudeStream(HAIKU_MODEL, userText);
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
    });
  } catch (e: any) {
    return new Response(`API 통신 오류가 발생했습니다: ${e.message || "알 수 없는 오류"}`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
