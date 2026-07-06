import { NextRequest } from "next/server";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

// ─── Claude용 시스템 프롬프트 (JSON 스키마 포함 상세 버전) ──────────
function buildClaudeSystem(solution: string): string {
  return `당신은 AIMNIS 에이전트입니다. 
현재 편집 중인 솔루션: ${solution}

역할: 산업 현장 전문가이자 AIMNIS 플랫폼 컨설턴트
- 사용자의 '가장 마지막(최신) 메시지'에서 "너는 누구니?" 또는 "무슨 모델을 쓰니?"라고 명시적으로 물어볼 때만 "저는 Claude(Anthropic) 기반의 AIMNIS 에이전트입니다"라고 대답하세요. 이전 대화 기록에 있더라도 현재 질문이 아니면 절대 모델명을 언급하지 마세요.
- 어떤 질문에도 명확하고 전문적으로 한국어로 답변
- [절대 규칙] 위젯 생성 요청 시, 요청된 위젯 정확히 1개만 생성하세요. 절대 2개 이상 만들지 마세요.

[위젯 생성 요청 시 출력 형식]
질문하거나 되묻지 말고, 곧바로 아래 형식에 맞춰 위젯을 정확히 1개만 생성하세요.
__WIDGET_JSON__
{"action":"add_widget","widget":{"widgetId":"w-001","type":"kpi","title":"위젯제목","data":{"value":"수치","unit":"단위","trend":"증감","trendUp":true,"color":"#hex"}}}

지원되는 type 및 data 구조:
1. kpi: {"value":"99","unit":"%","trend":"+1%","trendUp":true,"color":"#14b8a6"}
2. chart-line: {"color":"#14b8a6","chartData":[{"name":"레이블","value":10}]}
3. chart-bar: {"color":"#14b8a6","chartData":[{"name":"구역","value":10}]}
4. chart-donut: {"chartData":[{"name":"항목","value":10}]}
5. gauge: {"gaugeValue":80,"gaugeMax":100,"unit":"%","color":"#14b8a6"}
6. alert-panel: {"alerts":[{"level":"critical","msg":"메시지"}]}

규칙: 일반 질문은 __WIDGET_JSON__ 없이 텍스트만. 위젯 추가 요청시 무조건 데이터를 임의로 생성해서라도 즉시 위젯 1개를 출력할 것. 절대로 2개 이상의 위젯을 만들지 말 것.`;
}

// ─── Claude 생성 ─────────────────────────────────────────────────
async function handleClaude(
  messages: { role: string; content: string }[],
  solution: string,
  model: string = HAIKU_MODEL
): Promise<{ stream: ReadableStream<Uint8Array>; inputTokens: number; outputTokens: number }> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || undefined });

  const resp = await client.messages.create({
    model,
    max_tokens: 600,
    system: buildClaudeSystem(solution),
    messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  });

  const fullText = resp.content[0]?.type === "text" ? resp.content[0].text : "";
  const inputTokens = resp.usage?.input_tokens ?? 0;
  const outputTokens = resp.usage?.output_tokens ?? 0;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(fullText));
      controller.close();
    },
  });

  return { stream, inputTokens, outputTokens };
}

export async function POST(req: NextRequest) {
  const { messages, solution } = await req.json();
  const sol = (solution as string) ?? "guard";

  // ─── 핵심: 프론트에서 온 메시지 배열 중 마지막 user 메시지 1개만 추출 ───
  // 과거 대화 기록을 AI에게 주면 이전 위젯 요청을 다시 만드는 버그가 발생하므로
  // 무조건 현재 요청 1건만 전달합니다.
  let lastUserContent = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user" && messages[i].content?.trim()) {
      lastUserContent = messages[i].content.trim();
      break;
    }
  }

  if (!lastUserContent) {
    return new Response("메시지가 비어있습니다.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  const singleMessage = [{ role: "user", content: lastUserContent }];

  try {
    const { stream, inputTokens, outputTokens } = await handleClaude(singleMessage, sol, HAIKU_MODEL);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Usage-Input": String(inputTokens),
        "X-Usage-Output": String(outputTokens),
        "X-Usage-Model": HAIKU_MODEL,
      },
    });
  } catch (e: any) {
    console.error("[Claude chat error]", e);
    return new Response(`API 연결 오류가 발생했습니다: ${e.message || "알 수 없는 오류"}`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
