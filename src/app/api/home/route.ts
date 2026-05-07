import { NextRequest } from "next/server";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";

// ── 시나리오 발견 전용 프롬프트 ──────────────────────────────────
function buildSystemPrompt(): string {
  return `당신은 AIMI입니다. AIMNIS 플랫폼의 산업 현장 전문 컨설턴트입니다.
사용자의 현장 환경을 파악하고 가장 적합한 솔루션을 추천합니다.

[AIMNIS 솔루션 3가지]
- energy: 에너지 시설 통합 관제
  현장: 발전소, 변전소, 데이터센터, 에너지 플랜트, 전력 시설, 태양광, KEPCO 관련
  특징: 실시간 전력 모니터링, 장비 이상 감지, 에너지 소비 최적화

- manufacturing: 스마트 제조 이상 감지
  현장: 공장, 제조 라인, 생산 설비, 창고, 품질 검사, 작업자 안전, 물류
  특징: 생산 라인 이상 감지, 작업자 안전 알람, CCTV 기반 품질 관리

- smartcity: 스마트시티 안전 관제
  현장: 도심, 지자체, 공공시설, 상업시설, 학교, 주차장, 공원, 스마트빌딩
  특징: 도시 전역 카메라 통합, 긴급 상황 자동 신고, 실시간 위험 구역 관제

[응답 규칙 — 반드시 준수]
1. 사용자 현장을 분석하여 솔루션 1개를 추천한다.
2. 추천 이유를 2~3문장으로 명확하게 설명한다. (한국어, 이모지 없음, ~합니다 어조)
3. 응답 마지막 줄에 반드시 __SCENARIO__{"id":"솔루션ID"} 를 포함한다.
4. 현장이 불분명하면 추가 질문을 1개만 한다. (이때는 __SCENARIO__ 없음)
5. 플랫폼 소개나 AIMNIS가 뭔지 물어보면: 어떤 현장인지 물어본 뒤 추천으로 연결한다.

[응답 예시]
사용자: "공장 CCTV 관리하고 싶어요"
응답: "제조 현장의 이상 감지와 안전 관제에는 스마트 제조 이상 감지 솔루션이 적합합니다. 공장 구역별 센서 연동, 작업자 안전 알람, 생산 라인 이상 징후를 실시간으로 통합 관리할 수 있습니다."
__SCENARIO__{"id":"manufacturing"}

사용자: "뭘 할 수 있어요?"
응답: "어떤 현장 환경인지 알려주시면 딱 맞는 솔루션을 추천해 드립니다. 공장, 발전소, 도심 건물 등 어떤 현장을 관리하고 계신가요?"`;
}

// ── Claude 비스트리밍 (usage 캡처 가능) ──────────────────────────
async function claudeCompletion(
  model: string,
  prompt: string
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || undefined });

  const resp = await client.messages.create({
    model,
    max_tokens: 400,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content[0]?.type === "text" ? resp.content[0].text : "";
  return {
    text,
    inputTokens: resp.usage?.input_tokens ?? 0,
    outputTokens: resp.usage?.output_tokens ?? 0,
  };
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const userText = (prompt as string) ?? "";
  if (!userText.trim()) {
    return new Response("입력이 비어있습니다.", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  try {
    const { text, inputTokens, outputTokens } = await claudeCompletion(HAIKU_MODEL, userText);

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
