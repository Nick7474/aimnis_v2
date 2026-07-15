import { NextRequest } from "next/server";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

// ── 솔루션·시나리오 동시 추천 프롬프트 ──────────────────────────
function buildSystemPrompt(): string {
  return `당신은 AIMI입니다. AIMNIS 플랫폼의 산업 현장 전문 컨설턴트입니다.
사용자의 현장을 파악하여 두 솔루션(AIM Guard / AIM Monitoring) 중 하나와 시나리오를 즉시 추천합니다.

[두 솔루션 판별 기준]

■ AIM Guard (id: guard) — CCTV·영상 기반 물리 보안 관제
  키워드: CCTV, 카메라, 영상, 보안, 침입, 출입통제, 영상분석, 관제실, 주차장 감시

■ AIM Monitoring (id: monitoring) — IoT 센서 기반 설비 이상 감지
  키워드: 진동, 소음, 초음파, 열화상, 가스, 베어링, 모터, 펌프, ESS, 발전소, 회전기기, 예지보전

[시나리오 3종]
- energy: 에너지/발전소/ESS 시설
- manufacturing: 제조 공장/생산 설비
- smartcity: 도심/공공시설/스마트빌딩

[결정 원칙 — 가장 중요]
- 단서가 조금이라도 있으면 즉시 추천하라. 질문을 최소화한다.
- 공장/설비/기계 맥락 → 기본값 monitoring + manufacturing
- 보안/감시/출입 맥락 → 기본값 guard + manufacturing
- 완전히 무관한 주제(날씨, 음식 등)일 때만 현장을 물어본다.

[응답 규칙]
1. 사용자 현장 분석 → 솔루션 1개 + 시나리오 1개를 바로 추천한다.
2. 추천 이유 1~2문장. (한국어, 이모지 없음, ~합니다 어조)
3. 응답 마지막에 두 마커를 반드시 포함한다:
   __SOLUTION__{"id":"guard 또는 monitoring"}
   __SCENARIO__{"id":"energy 또는 manufacturing 또는 smartcity"}
4. 현장과 전혀 무관한 입력일 때만 "어떤 현장인지 알려주시면 추천해드립니다."라고 묻는다. (마커 없음)

[예시]
"공장 안전" → monitoring + manufacturing (기계/설비 기본)
"공장 CCTV" → guard + manufacturing
"발전소" → monitoring + energy
"도심 감시" → guard + smartcity
"뭐할 수 있어?" → 현장 질문 (마커 없음)`;
}

// ── Claude 멀티턴 완성 (history 지원) ────────────────────────────
async function claudeCompletion(
  model: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || undefined });

  const resp = await client.messages.create({
    model,
    max_tokens: 350,
    system: buildSystemPrompt(),
    messages,
  });

  const text = resp.content[0]?.type === "text" ? resp.content[0].text : "";
  return {
    text,
    inputTokens: resp.usage?.input_tokens ?? 0,
    outputTokens: resp.usage?.output_tokens ?? 0,
  };
}

export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();
  const userText = (prompt as string) ?? "";
  if (!userText.trim()) {
    return new Response("입력이 비어있습니다.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // 최근 2턴(4메시지) 히스토리 + 현재 메시지
  const prevMessages: { role: "user" | "assistant"; content: string }[] =
    Array.isArray(history) ? history.slice(-4) : [];
  const messages = [...prevMessages, { role: "user" as const, content: userText }];

  try {
    const { text, inputTokens, outputTokens } = await claudeCompletion(HAIKU_MODEL, messages);

    // 텍스트를 청크로 전송 (UX: 타이핑 느낌)
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const enc = new TextEncoder();
        // 50자씩 나눠서 스트리밍 효과
        const words = text.split(" ");
        let buf = "";
        for (const word of words) {
          buf += (buf ? " " : "") + word;
          if (buf.length >= 30) {
            controller.enqueue(enc.encode(buf.includes(" ") ? buf + " " : buf));
            buf = "";
          }
        }
        if (buf) controller.enqueue(enc.encode(buf));
        controller.close();
      },
    });

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
    return new Response(`API 오류가 발생했습니다: ${e.message || "알 수 없는 오류"}`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
