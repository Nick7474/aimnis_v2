import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const SYSTEM_PROMPT = `당신은 AIMNIS 엔터프라이즈 플랫폼의 AI 어시스턴트입니다.
사용자가 대시보드 위젯 추가, 데이터 매핑, 레이아웃 변경 등을 요청하면 한국어로 간결하게 응답하세요.
위젯 추가 시에는 "위젯 추가: [위젯명]" 형식으로 시작하세요.
항상 구체적이고 실행 가능한 도움을 제공하세요.`;

export async function POST(req: NextRequest) {
  const { messages, solution } = await req.json();

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}\n현재 솔루션: ${solution ?? "guard"}`,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
