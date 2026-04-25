import { NextRequest } from "next/server";

const LLM_PROVIDER = process.env.LLM_PROVIDER ?? "gemini";

// Advisor 전략: Haiku(빠른 인터뷰 Q&A) + Opus(최종 설계 계획)
const HAIKU_MODEL  = "claude-haiku-4-5-20251001";
const SONNET_MODEL = "claude-sonnet-4-6";
const OPUS_MODEL   = "claude-opus-4-6";

// 캐싱 대상 시스템 프롬프트 (변경 빈도 낮음)
const SYSTEM_PROMPT = `당신은 20년 경력의 엔터프라이즈 서비스 아키텍트입니다.

역할:
- 사용자의 요구사항을 파악하기 위해 역질문합니다
- 한 번에 질문 1개만 합니다 (절대 2개 이상 금지)
- 친절하고 전문적인 톤을 유지합니다
- 반드시 아래 JSON 형식으로만 응답합니다 (마크다운 코드블록 금지)

응답 형식:
{
  "message": "사용자에게 보여줄 메시지 (한국어, 1~2문장)",
  "question": "다음 질문 1개 (isComplete=true면 빈 문자열)",
  "blueprintUpdate": {
    "section": "Requirements | Widgets | API Mapping | Pages",
    "content": "추가할 항목 (마크다운 리스트 형식, - 로 시작)"
  },
  "isComplete": false
}

isComplete는 turnCount >= 3 이거나 사용자가 '대충 해줘', '그냥 해줘' 등을 말할 때만 true.
isComplete=true면 question은 빈 문자열로 설정.`;

// OpusPlan 프롬프트 — 최종 아키텍처 계획 (extended thinking)
const OPUS_PLAN_SYSTEM = `당신은 AIMNIS 엔터프라이즈 플랫폼 최고 아키텍트입니다.
수집된 요구사항을 바탕으로 완전한 하네스 설계서를 작성합니다.
반드시 JSON 형식으로만 응답합니다.`;

interface MockQuestionSet {
  questions: string[];
  widgetHints: string[];
  apiHints: string[];
}

const MOCK_DATA: Record<string, MockQuestionSet> = {
  energy: {
    questions: [
      "관제할 발전소의 종류와 규모는 어떻게 되나요? (예: 원자력 2기, 화력 5기)",
      "실시간 데이터 수집 주기는 어느 정도로 설정할까요? (예: 100ms, 500ms, 1s)",
      "임계값 초과 시 경보 우선순위는 어떻게 설정하시겠어요? (예: 위험 > 경고 > 주의)",
    ],
    widgetHints: ["KPI 발전량 카드", "실시간 전력 차트", "경보 알림 패널"],
    apiHints: ["SCADA WebSocket", "기상청 API", "에너지관리공단 API"],
  },
  manufacturing: {
    questions: [
      "동시에 관제할 CCTV 채널 수는 몇 개인가요?",
      "선호하는 화면 분할 레이아웃이 있으신가요? (4분할 / 9분할 / 16분할)",
      "비전 AI가 주로 인식해야 할 객체는 무엇인가요? (예: 헬멧, 안전조끼, 작업자 위치)",
    ],
    widgetHints: ["CCTV 멀티뷰 위젯", "객체 감지 알림", "작업자 현황 KPI"],
    apiHints: ["ONVIF RTSP 스트림", "AI 비전 엔진 API", "MES 연동 API"],
  },
  smartcity: {
    questions: [
      "GIS 지도에서 마커 표시 우선순위는 어떻게 설정할까요? (예: 화재 > 침수 > 교통)",
      "재난 단계별(1~5단계) 대시보드 모드 전환이 필요하신가요?",
      "연동할 공공 데이터 소스는 무엇인가요? (예: 기상청 API, 소방청 API)",
    ],
    widgetHints: ["GIS 지도 위젯", "재난 단계 표시기", "실시간 센서 현황"],
    apiHints: ["기상청 Open API", "소방청 재난 API", "국토부 GIS API"],
  },
};

function buildMockResponse(
  scenario: string,
  turnCount: number,
  userText: string,
  isSkip: boolean
): string {
  const data = MOCK_DATA[scenario] ?? MOCK_DATA.energy;
  const isComplete = turnCount >= 3 || isSkip;

  if (isComplete) {
    return JSON.stringify({
      message: "필수 정보가 충분히 수집되었습니다. 설계서를 확정하겠습니다.",
      question: "",
      blueprintUpdate: {
        section: "Pages",
        content: "- 메인 대시보드\n- 실시간 모니터링\n- 알람 관리\n- 설정/관리\n",
      },
      isComplete: true,
    });
  }

  const q = data.questions[turnCount] ?? data.questions[2];
  let blueprintUpdate: { section: string; content: string };
  if (turnCount === 0) {
    blueprintUpdate = { section: "Requirements", content: `- ${userText.slice(0, 60)}\n` };
  } else if (turnCount === 1) {
    blueprintUpdate = { section: "Widgets", content: data.widgetHints.map((w) => `- ${w}`).join("\n") + "\n" };
  } else {
    blueprintUpdate = { section: "API Mapping", content: data.apiHints.map((a) => `- ${a}`).join("\n") + "\n" };
  }

  return JSON.stringify({ message: "확인했습니다. 추가로 여쭤볼게요.", question: q, blueprintUpdate, isComplete: false });
}

// ─── Claude Haiku 인터뷰 (빠른 Q&A) ─────────────────────────────
async function handleClaudeInterview(
  messages: { role: string; content: string }[],
  scenario: string,
  turnCount: number,
  lastUserMsg: string,
  isSkip: boolean,
  qaModel: string = HAIKU_MODEL
): Promise<string> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  const isComplete = turnCount >= 3 || isSkip;

  // 턴 >= 3이거나 완료 요청: Opus + extended thinking으로 최종 설계
  if (isComplete) {
    try {
      const resp = await client.messages.create({
        model: OPUS_MODEL,
        max_tokens: 8000,
        thinking: { type: "enabled", budget_tokens: 5000 },
        system: [
          {
            type: "text" as const,
            text: OPUS_PLAN_SYSTEM,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          {
            role: "user" as const,
            content: `시나리오: ${scenario}. 지금까지 수집된 요구사항으로 최종 하네스 설계서 JSON을 작성해주세요.`,
          },
        ],
      });

      const textBlock = resp.content.find((b) => b.type === "text");
      if (textBlock && textBlock.type === "text") {
        let raw = textBlock.text.trim().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        JSON.parse(raw); // validate
        return raw;
      }
    } catch {
      // Opus 실패 시 mock으로 fallback
    }
    return buildMockResponse(scenario, turnCount, lastUserMsg, isSkip);
  }

  // 일반 턴: Haiku로 빠른 Q&A (prompt caching)
  try {
    const resp = await client.messages.create({
      model: qaModel,
      max_tokens: 400,
      system: [
        {
          type: "text" as const,
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        {
          role: "user" as const,
          content: `시나리오: ${scenario}\n현재 턴: ${turnCount}/3\n사용자: ${lastUserMsg}\n\nJSON만 응답:`,
        },
      ],
    });

    const textBlock = resp.content.find((b) => b.type === "text");
    if (textBlock && textBlock.type === "text") {
      let raw = textBlock.text.trim().replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(raw);
      if (turnCount >= 3) parsed.isComplete = true;
      return JSON.stringify(parsed);
    }
  } catch {
    // Haiku 실패 시 mock
  }

  return buildMockResponse(scenario, turnCount, lastUserMsg, isSkip);
}

// ─── POST 핸들러 ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { messages, scenario, turnCount = 0, provider } = await req.json();
  const msgList = messages as { role: string; content: string }[];
  const lastUserMsg = msgList.filter((m) => m.role === "user").slice(-1)[0]?.content ?? "";
  const isSkip = lastUserMsg.includes("대충") || lastUserMsg.includes("그냥 해줘") || lastUserMsg.includes("건너뛰");

  // 프론트엔드 provider 선택이 항상 우선 (LLM_PROVIDER env 무시)
  const isClaudeProvider =
    provider === "claude-haiku" ||
    provider === "claude-sonnet" ||
    provider === "claude-opus";

  // Sonnet/Opus이면 Q&A도 해당 모델, 나머지는 Haiku
  const interviewModel =
    provider === "claude-opus"   ? OPUS_MODEL   :
    provider === "claude-sonnet" ? SONNET_MODEL :
    HAIKU_MODEL;

  if (isClaudeProvider) {
    try {
      const result = await handleClaudeInterview(msgList, scenario, turnCount, lastUserMsg, isSkip, interviewModel);
      return new Response(result, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    } catch {
      // fallback to mock
    }
  }

  // mock 기본 경로 (Gemini/Claude 미선택 시)
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      try {
        controller.enqueue(enc.encode(buildMockResponse(scenario, turnCount, lastUserMsg, isSkip)));
      } catch {
        controller.enqueue(enc.encode(buildMockResponse(scenario, turnCount, lastUserMsg, isSkip)));
      }
      controller.close();
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
