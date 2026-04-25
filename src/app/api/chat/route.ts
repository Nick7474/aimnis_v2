import { NextRequest } from "next/server";

// ─── 설정 ───────────────────────────────────────────────────────
const LLM_PROVIDER = process.env.LLM_PROVIDER ?? "gemma";
const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma4";

// Haiku: 빠른 자연어 응답 (토큰 절약)
const HAIKU_MODEL = "claude-haiku-4-5-20251001";

// ─── 시스템 프롬프트 (캐시 대상) ────────────────────────────────
const NARRATIVE_SYSTEM = `당신은 AIMNIS 엔터프라이즈 플랫폼의 AI 어시스턴트입니다.
사용자가 위젯 추가/수정/삭제 등 대시보드 편집을 요청하면 한국어로 1-2문장 간결하게 응답하세요.
위젯 JSON은 별도 엔진이 생성합니다 — 당신은 자연어 설명만 담당합니다.
예시: "에너지 소비 KPI 카드를 캔버스에 추가했습니다. 실시간 센서 데이터와 연동됩니다."`;


// ─── Ollama 스트리밍 ─────────────────────────────────────────────
async function ollamaStream(systemPrompt: string, userText: string): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, system: systemPrompt, prompt: userText, stream: true }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  return res.body!;
}

// ─── Mock 위젯 (위젯 JSON은 결정론적으로 생성) ────────────────────
function generateMockWidget(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("kpi") || lower.includes("수치") || lower.includes("에너지") || lower.includes("현황")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `kpi-${Date.now()}`, type: "kpi", title: lower.includes("에너지") ? "에너지 소비량" : lower.includes("온도") ? "평균 온도" : "KPI 지표", data: { value: (Math.random() * 100).toFixed(1), unit: lower.includes("에너지") ? "kWh" : lower.includes("온도") ? "°C" : "%", trend: `+${(Math.random() * 5).toFixed(1)}%`, trendUp: true, color: "#14b8a6" } } });
  }
  if (lower.includes("라인") || lower.includes("차트") || lower.includes("그래프") || lower.includes("추이")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `line-${Date.now()}`, type: "chart-line", title: "실시간 추이 차트", data: { color: "#6366f1", chartData: Array.from({ length: 7 }, (_, i) => ({ name: `${i + 1}일`, value: Math.floor(Math.random() * 60 + 20) })) } } });
  }
  if (lower.includes("바") || lower.includes("막대") || lower.includes("비교")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `bar-${Date.now()}`, type: "chart-bar", title: "구역별 비교", data: { color: "#8b5cf6", chartData: [{ name: "A구역", value: 42 }, { name: "B구역", value: 67 }, { name: "C구역", value: 31 }, { name: "D구역", value: 89 }] } } });
  }
  if (lower.includes("게이지") || lower.includes("온도") || lower.includes("압력")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `gauge-${Date.now()}`, type: "gauge", title: lower.includes("온도") ? "실내 온도" : "게이지 모니터", data: { gaugeValue: Math.floor(Math.random() * 70 + 10), gaugeMax: 100, unit: "%", color: "#f59e0b" } } });
  }
  if (lower.includes("알람") || lower.includes("알림") || lower.includes("경보")) {
    return JSON.stringify({ action: "add_widget", widget: { widgetId: `alert-${Date.now()}`, type: "alert-panel", title: "실시간 알람 패널", data: { alerts: [{ level: "critical", msg: "배터리실 온도 임계값 초과 (87°C)" }, { level: "warning", msg: "B구역 에너지 소비 급증 감지" }, { level: "info", msg: "야간 점검 스케줄 시작" }] } } });
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

// ─── Claude Haiku 스트리밍 (자연어 응답) ─────────────────────────
// Advisor 전략: Haiku → 빠른 자연어 / widget JSON → 결정론적 생성으로 토큰 절약
async function handleClaude(
  messages: { role: string; content: string }[],
  solution: string,
  userText: string
): Promise<ReadableStream<Uint8Array>> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  // 위젯 JSON은 결정론적 mock (LLM 토큰 불필요)
  const widgetJsonStr = generateMockWidget(userText);

  return new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        // Haiku로 자연어 스트리밍 (prompt caching으로 시스템 프롬프트 재사용)
        const stream = await client.messages.create({
          model: HAIKU_MODEL,
          max_tokens: 200,
          system: [
            {
              type: "text",
              text: `${NARRATIVE_SYSTEM}\n현재 솔루션: ${solution}`,
                  cache_control: { type: "ephemeral" },
            },
          ],
          messages: messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          stream: true,
        });

        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(enc.encode(chunk.delta.text));
          }
        }
      } catch {
        controller.enqueue(enc.encode(generateMockNarrative(userText)));
      }

      controller.enqueue(enc.encode(`\n__WIDGET_JSON__\n${widgetJsonStr}`));
      controller.close();
    },
  });
}

// ─── POST 핸들러 ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { messages, solution, provider } = await req.json();
  const userText = (messages[messages.length - 1]?.content as string) ?? "";
  const sol = (solution as string) ?? "guard";

  // 클라이언트 선택 provider가 있으면 우선 적용 (claude-haiku → claude 모드)
  const effectiveProvider = provider === "claude-haiku" ? "claude" : (LLM_PROVIDER as string);

  if (effectiveProvider === "claude") {
    const stream = await handleClaude(messages, sol, userText).catch(() => null);
    if (stream) {
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
      });
    }
  }

  // Gemma(Ollama) 기본 경로
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();

      const [widgetJson, narrativeStream] = await Promise.all([
        generateMockWidget(userText),
        ollamaStream(`${NARRATIVE_SYSTEM}\n현재 솔루션: ${sol}`, userText).catch(() => null),
      ]);

      if (narrativeStream) {
        try {
          const reader = narrativeStream.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = decoder.decode(value).split("\n").filter(Boolean);
            for (const line of lines) {
              try {
                const parsed = JSON.parse(line) as { response?: string };
                if (parsed.response) controller.enqueue(enc.encode(parsed.response));
              } catch { /* skip */ }
            }
          }
        } catch {
          controller.enqueue(enc.encode(generateMockNarrative(userText)));
        }
      } else {
        controller.enqueue(enc.encode(generateMockNarrative(userText)));
      }

      controller.enqueue(enc.encode(`\n__WIDGET_JSON__\n${widgetJson}`));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
  });
}
