import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

// ─── 클라이언트 초기화 ──────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const googleAI = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

// ─── 시스템 프롬프트 ────────────────────────────────────────────

const SONNET_SYSTEM = `당신은 AIMNIS 엔터프라이즈 플랫폼의 AI 어시스턴트입니다.
사용자가 위젯 추가/수정/삭제 등 대시보드 편집을 요청하면 한국어로 1-2문장 간결하게 응답하세요.
Gemma 엔진이 위젯 JSON을 별도로 생성합니다 — 당신은 자연어 설명만 담당합니다.
예시: "에너지 소비 KPI 카드를 캔버스에 추가했습니다. 실시간 센서 데이터와 연동됩니다."`;

const GEMMA_SYSTEM = `You are a widget layout engine for AIMNIS enterprise platform.
When given a user request, output ONLY a valid JSON object — no markdown, no explanation.

Widget types: kpi | chart-line | chart-bar | chart-donut | gauge | alert-panel | table | map

JSON schema:
{
  "action": "add_widget" | "remove_widget" | "update_widget" | "none",
  "widget": {
    "widgetId": string,
    "type": string,
    "title": string,
    "data": {
      "value"?: string,
      "unit"?: string,
      "trend"?: string,
      "trendUp"?: boolean,
      "color"?: string,
      "chartData"?: Array<{ name: string; value: number }>,
      "gaugeValue"?: number,
      "gaugeMax"?: number,
      "alerts"?: Array<{ level: "critical"|"warning"|"info"; msg: string }>,
      "description"?: string
    }
  }
}

If no widget action needed, set "action": "none" and omit "widget". Korean titles only.`;

// ─── Gemma4 위젯 JSON 생성 ──────────────────────────────────────

async function generateWidgetJson(
  userText: string,
  solution: string
): Promise<string | null> {
  if (!googleAI) {
    return generateMockWidget(userText);
  }

  try {
    const model = googleAI.getGenerativeModel({
      model: process.env.GEMMA_MODEL ?? "gemma-2.0-flash",
      systemInstruction: `${GEMMA_SYSTEM}\nCurrent solution: ${solution}`,
    });

    const result = await model.generateContent(userText);
    const text = result.response.text().trim();

    const jsonMatch =
      text.match(/```json\s*([\s\S]*?)\s*```/) ??
      text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : text;

    JSON.parse(jsonStr); // validation
    return jsonStr;
  } catch {
    return generateMockWidget(userText);
  }
}

// ─── Mock 위젯 (API 키 없을 때) ─────────────────────────────────

function generateMockWidget(userText: string): string {
  const lower = userText.toLowerCase();

  if (
    lower.includes("kpi") ||
    lower.includes("수치") ||
    lower.includes("현황") ||
    lower.includes("에너지")
  ) {
    return JSON.stringify({
      action: "add_widget",
      widget: {
        widgetId: `kpi-${Date.now()}`,
        type: "kpi",
        title: lower.includes("에너지")
          ? "에너지 소비량"
          : lower.includes("온도")
          ? "평균 온도"
          : "KPI 지표",
        data: {
          value: (Math.random() * 100).toFixed(1),
          unit: lower.includes("에너지") ? "kWh" : lower.includes("온도") ? "°C" : "%",
          trend: `+${(Math.random() * 5).toFixed(1)}%`,
          trendUp: true,
          color: "#14b8a6",
        },
      },
    });
  }

  if (
    lower.includes("차트") ||
    lower.includes("그래프") ||
    lower.includes("추이") ||
    lower.includes("라인")
  ) {
    return JSON.stringify({
      action: "add_widget",
      widget: {
        widgetId: `line-${Date.now()}`,
        type: "chart-line",
        title: lower.includes("에너지") ? "에너지 소비 추이" : "실시간 추이 차트",
        data: {
          color: "#6366f1",
          chartData: Array.from({ length: 7 }, (_, i) => ({
            name: `${i + 1}일`,
            value: Math.floor(Math.random() * 60 + 20),
          })),
        },
      },
    });
  }

  if (lower.includes("바") || lower.includes("bar") || lower.includes("막대")) {
    return JSON.stringify({
      action: "add_widget",
      widget: {
        widgetId: `bar-${Date.now()}`,
        type: "chart-bar",
        title: "구역별 비교",
        data: {
          color: "#8b5cf6",
          chartData: [
            { name: "A구역", value: 42 },
            { name: "B구역", value: 67 },
            { name: "C구역", value: 31 },
            { name: "D구역", value: 89 },
          ],
        },
      },
    });
  }

  if (
    lower.includes("게이지") ||
    lower.includes("gauge") ||
    lower.includes("온도") ||
    lower.includes("압력")
  ) {
    return JSON.stringify({
      action: "add_widget",
      widget: {
        widgetId: `gauge-${Date.now()}`,
        type: "gauge",
        title: lower.includes("온도") ? "실내 온도" : lower.includes("압력") ? "배관 압력" : "게이지 모니터",
        data: {
          gaugeValue: Math.floor(Math.random() * 70 + 10),
          gaugeMax: 100,
          unit: lower.includes("온도") ? "°C" : "%",
          color: "#f59e0b",
        },
      },
    });
  }

  if (
    lower.includes("알람") ||
    lower.includes("경보") ||
    lower.includes("알림") ||
    lower.includes("이벤트")
  ) {
    return JSON.stringify({
      action: "add_widget",
      widget: {
        widgetId: `alert-${Date.now()}`,
        type: "alert-panel",
        title: "실시간 알람 패널",
        data: {
          alerts: [
            { level: "critical", msg: "배터리실 온도 임계값 초과 (87°C)" },
            { level: "warning", msg: "B구역 에너지 소비 급증 감지" },
            { level: "info", msg: "야간 점검 스케줄 시작" },
          ],
        },
      },
    });
  }

  if (
    lower.includes("도넛") ||
    lower.includes("비율") ||
    lower.includes("분포") ||
    lower.includes("파이")
  ) {
    return JSON.stringify({
      action: "add_widget",
      widget: {
        widgetId: `donut-${Date.now()}`,
        type: "chart-donut",
        title: "위험도 분포",
        data: {
          chartData: [
            { name: "정상", value: 68 },
            { name: "주의", value: 22 },
            { name: "위험", value: 10 },
          ],
        },
      },
    });
  }

  // 기본: KPI 카드
  return JSON.stringify({
    action: "add_widget",
    widget: {
      widgetId: `kpi-default-${Date.now()}`,
      type: "kpi",
      title: "모니터링 지표",
      data: {
        value: "99.8",
        unit: "%",
        trend: "+0.2%",
        trendUp: true,
        color: "#14b8a6",
        description: "시스템 가동률",
      },
    },
  });
}

// ─── Sonnet 자연어 생성 (API 키 없으면 mock) ────────────────────

function generateMockNarrative(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("kpi") || lower.includes("수치") || lower.includes("에너지"))
    return "KPI 카드 위젯을 캔버스에 추가했습니다. 실시간 데이터와 연동됩니다.";
  if (lower.includes("차트") || lower.includes("그래프") || lower.includes("라인"))
    return "라인 차트 위젯을 추가했습니다. 시계열 데이터를 시각화합니다.";
  if (lower.includes("바") || lower.includes("막대"))
    return "바 차트 위젯을 추가했습니다. 구역별 비교 데이터를 표시합니다.";
  if (lower.includes("게이지") || lower.includes("온도") || lower.includes("압력"))
    return "게이지 위젯을 추가했습니다. 현재 수치를 실시간으로 모니터링합니다.";
  if (lower.includes("알람") || lower.includes("알림") || lower.includes("경보"))
    return "알람 패널 위젯을 추가했습니다. 실시간 이벤트를 모니터링합니다.";
  if (lower.includes("도넛") || lower.includes("비율") || lower.includes("분포"))
    return "도넛 차트 위젯을 추가했습니다. 비율 분포를 시각화합니다.";
  return "위젯을 캔버스에 추가했습니다. 좌측 채팅으로 추가 요청이 가능합니다.";
}

// ─── POST 핸들러 ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { messages, solution } = await req.json();
  const userText = messages[messages.length - 1]?.content ?? "";

  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

  // Gemma4 + Sonnet 병렬 실행 (Sonnet은 API 키 없으면 mock으로 대체)
  const [widgetJsonStr, sonnetStreamOrNull] = await Promise.all([
    generateWidgetJson(userText, solution ?? "guard"),
    hasAnthropicKey
      ? (async () => {
          try {
            return anthropic.messages.stream({
              model: "claude-sonnet-4-6",
              max_tokens: 256,
              system: `${SONNET_SYSTEM}\n현재 솔루션: ${solution ?? "guard"}`,
              tools: [
                {
                  type: "advisor_20260301",
                  name: "advisor",
                  model: "claude-opus-4-6",
                  max_uses: 2,
                } as unknown as Anthropic.Tool,
              ],
              messages: messages.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              })),
            });
          } catch {
            return null;
          }
        })()
      : Promise.resolve(null),
  ]);

  // 스트리밍 응답: [Sonnet 자연어 or mock] + __WIDGET_JSON__\n[JSON]
  const readable = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();

      if (sonnetStreamOrNull) {
        // Sonnet 스트리밍
        try {
          for await (const chunk of sonnetStreamOrNull) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(enc.encode(chunk.delta.text));
            }
          }
        } catch {
          // 스트리밍 중간 오류 → mock으로 fallback
          controller.enqueue(enc.encode(generateMockNarrative(userText)));
        }
      } else {
        // API 키 없음 → mock 자연어
        controller.enqueue(enc.encode(generateMockNarrative(userText)));
      }

      // 위젯 JSON 전달
      if (widgetJsonStr) {
        controller.enqueue(enc.encode(`\n__WIDGET_JSON__\n${widgetJsonStr}`));
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
