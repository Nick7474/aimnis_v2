import { NextRequest } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma4:e2b";

const SYSTEM_PROMPT = `당신은 20년 경력의 엔터프라이즈 서비스 아키텍트입니다.

역할:
- 사용자의 요구사항을 정확히 파악하기 위해 역질문합니다
- 한 번에 1~2개 질문만 합니다
- 친절하고 전문적인 톤을 유지합니다
- 설계를 너무 빨리 끝내지 않습니다
- 반드시 아래 JSON 형식으로만 응답합니다

응답 형식 (반드시 유효한 JSON만 출력, 마크다운 코드블록 금지):
{
  "message": "사용자에게 보여줄 메시지 (한국어)",
  "questions": ["질문1", "질문2"],
  "blueprintUpdate": {
    "section": "Requirements",
    "content": "추가할 MD 내용 (마크다운 형식)"
  },
  "collectedInfo": {
    "항목명": "수집된 값"
  },
  "isComplete": false
}

isComplete는 사용자가 requiredInfo의 모든 항목을 답변했을 때만 true로 설정합니다.
questions 배열이 비어있으면 안 됩니다 (isComplete=true일 때 제외).`;

function buildMockResponse(
  userText: string,
  scenario: string,
  collectedCount: number,
  totalRequired: number
): string {
  const isComplete = collectedCount >= totalRequired;

  const questionSets: Record<string, string[][]> = {
    energy: [
      ["관제할 발전소의 종류와 규모는 어떻게 되나요?"],
      ["실시간 데이터 수집 주기는 어느 정도로 설정할까요? (예: 100ms, 500ms)"],
      ["임계값 초과 시 경보 우선순위는 어떻게 설정하시겠어요?"],
    ],
    manufacturing: [
      ["동시에 관제할 CCTV 채널 수는 몇 개인가요?"],
      ["선호하는 화면 분할 레이아웃이 있으신가요? (4분할/9분할/16분할)"],
      ["비전 AI가 주로 인식해야 할 객체는 무엇인가요?"],
    ],
    smartcity: [
      ["GIS 기반 지도에서 마커 표시 우선순위는 어떻게 설정할까요?"],
      ["재난 단계별(1~5단계) 대시보드 모드 전환이 필요하신가요?"],
      ["연동할 공공 데이터 소스는 무엇인가요?"],
    ],
  };

  const qs = questionSets[scenario] ?? questionSets.energy;
  const nextQ = qs[Math.min(collectedCount, qs.length - 1)];

  if (isComplete) {
    return JSON.stringify({
      message: "모든 필수 정보가 수집되었습니다. 설계를 확정하겠습니다. 잠시만요...",
      questions: [],
      blueprintUpdate: {
        section: "Pages",
        content: "- 메인 대시보드\n- 상세 모니터링\n- 알람 관리\n",
      },
      collectedInfo: {},
      isComplete: true,
    });
  }

  return JSON.stringify({
    message: `${userText.slice(0, 30)}... 감사합니다. 다음 사항을 확인할게요.`,
    questions: nextQ,
    blueprintUpdate: {
      section: "Requirements",
      content: `- [ ] ${userText.slice(0, 50)}\n`,
    },
    collectedInfo: {},
    isComplete: false,
  });
}

export async function POST(req: NextRequest) {
  const { messages, scenario, collectedInfo } = await req.json();

  const collectedCount = Object.values(
    (collectedInfo as Record<string, string | null>) ?? {}
  ).filter((v) => v !== null && v !== "").length;

  const totalRequired = (() => {
    if (scenario === "energy") return 3;
    if (scenario === "manufacturing") return 3;
    if (scenario === "smartcity") return 3;
    return 3;
  })();

  const lastUserMsg =
    (messages as { role: string; content: string }[])
      .filter((m) => m.role === "user")
      .slice(-1)[0]?.content ?? "";

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();

      try {
        const res = await fetch(`${OLLAMA_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            system: SYSTEM_PROMPT,
            prompt: `시나리오: ${scenario}\n수집된 정보: ${JSON.stringify(collectedInfo)}\n사용자 메시지: ${lastUserMsg}\n\nJSON으로만 응답:`,
            stream: false,
          }),
        });

        if (!res.ok) throw new Error(`Ollama ${res.status}`);

        const json = await res.json() as { response?: string };
        let raw = (json.response ?? "").trim();

        // 코드블록 제거
        raw = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

        // JSON 파싱 검증
        JSON.parse(raw);
        controller.enqueue(enc.encode(raw));
      } catch {
        // Ollama 미연결 or 파싱 실패 → mock
        controller.enqueue(
          enc.encode(buildMockResponse(lastUserMsg, scenario, collectedCount, totalRequired))
        );
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
