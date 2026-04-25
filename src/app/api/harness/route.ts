import { NextRequest } from "next/server";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "gemma4";
const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const SONNET_MODEL = "claude-sonnet-4-6";

// ─── 하네스 생성 시스템 프롬프트 ────────────────────────────────
const HARNESS_SYSTEM = `당신은 AIMNIS 엔터프라이즈 AI 플랫폼의 수석 솔루션 아키텍트입니다.
고객이 입력한 현장 스펙을 분석하여 최적화된 맞춤 하네스 설계서를 생성합니다.

반드시 아래 마크다운 형식으로만 응답하세요 (코드블록 없이, 순수 마크다운):

# [시나리오명] 맞춤 하네스 설계서

## 프로젝트 정보
- 도메인: [시나리오명 (고객사 유형)]
- 생성일: [오늘 날짜]
- 상태: ✅ AI 설계 완료

## 현장 환경 요약
[선택된 스펙을 바탕으로 현장 특성 2-3줄 요약]

## 추천 위젯 구성
- [위젯명 (타입)]: [선택 이유 및 데이터 연동 방식]
(스펙 기반 5-8개, 구체적으로)

## API 연동 계획
- [API/프로토콜명]: [연동 목적 및 데이터 형식]
(인프라 스펙 기반 4-6개)

## 알람 정책 설계
- [알람 항목]: [임계값 및 대응 방식]
(위협 유형 및 알람 정책 스펙 기반 3-5개)

## 데이터 관리 계획
- 보존 기간: [선택값 기반]
- 저장 방식: [선택값 기반]
- 컴플라이언스: [선택값 기반, 없으면 해당없음]

## AI 종합 분석
[현장 특성 분석 및 핵심 권고사항 150자 이내]

규칙:
- 선택되지 않은 항목(null/빈값)은 "미선택" 또는 기본값으로 처리
- 구체적인 수치와 기준을 포함할 것
- 한국어로만 작성`;

// ─── 스펙 → 프롬프트 변환 ──────────────────────────────────────
function buildSpecPrompt(
  scenario: string,
  specs: Record<string, string | string[] | null>
): string {
  const fmt = (v: string | string[] | null) => {
    if (!v) return "미선택";
    if (Array.isArray(v)) return v.length > 0 ? v.join(", ") : "미선택";
    return v;
  };

  return `시나리오: ${scenario}

[현장 환경]
- 시설 유형: ${fmt(specs.facility_type)}
- 면적 규모: ${fmt(specs.area_size)}
- 운영 시간: ${fmt(specs.op_hours)}
- 보안 구역 수: ${fmt(specs.zone_count)}

[CCTV 인프라]
- CCTV 수량: ${fmt(specs.cctv_count)}
- VMS 솔루션: ${fmt(specs.vms_solution)}
- 카메라 해상도: ${fmt(specs.resolution)}
- 네트워크 구성: ${fmt(specs.network)}

[보안 위협 유형]
- 주요 위협: ${fmt(specs.threat_types)}
- 취약 구역: ${fmt(specs.vuln_zones)}
- 사고 빈도: ${fmt(specs.incident_freq)}

[알람 정책]
- 알람 대응: ${fmt(specs.alarm_level)}
- 알림 방식: ${fmt(specs.notification)}

[데이터 관리]
- 영상 보존 기간: ${fmt(specs.retention_period)}
- 저장 인프라: ${fmt(specs.storage_type)}
- 규제 준수: ${fmt(specs.compliance)}

[운영 인력]
- 보안 인원: ${fmt(specs.staff_count)}
- IT 역량: ${fmt(specs.it_capability)}
- 도입 목적: ${fmt(specs.purpose)}
- 예산 규모: ${fmt(specs.budget)}

위 스펙을 기반으로 최적화된 하네스 설계서를 생성하세요.`;
}

// ─── Ollama 스트리밍 ─────────────────────────────────────────────
async function ollamaStream(system: string, prompt: string): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: OLLAMA_MODEL, system, prompt, stream: true }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  return res.body!;
}

// ─── Claude 스트리밍 (Haiku / Sonnet) ───────────────────────────
async function claudeStream(
  model: string,
  system: string,
  prompt: string
): Promise<ReadableStream<Uint8Array>> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

  const stream = await client.messages.create({
    model,
    max_tokens: 2048,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
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

// ─── Ollama NDJSON → 순수 텍스트 스트림 변환 ──────────────────────
function ollamaToTextStream(rawStream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const reader = rawStream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        const lines = decoder.decode(value).split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line) as { response?: string; done?: boolean };
            if (parsed.response) controller.enqueue(encoder.encode(parsed.response));
          } catch { /* skip */ }
        }
      }
    },
  });
}

// ─── POST 핸들러 ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { scenario, specs, provider = "gemma4" } = await req.json();

  const specPrompt = buildSpecPrompt(scenario as string, specs as Record<string, string | string[] | null>);

  try {
    let rawStream: ReadableStream<Uint8Array>;

    if (provider === "claude-sonnet") {
      rawStream = await claudeStream(SONNET_MODEL, HARNESS_SYSTEM, specPrompt);
    } else if (provider === "claude-haiku") {
      rawStream = await claudeStream(HAIKU_MODEL, HARNESS_SYSTEM, specPrompt);
    } else {
      // Gemma4 (Ollama)
      const ollamaRaw = await ollamaStream(HARNESS_SYSTEM, specPrompt);
      rawStream = ollamaToTextStream(ollamaRaw);
    }

    return new Response(rawStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
    });
  } catch (err) {
    // fallback: 기본 blueprint 반환
    const today = new Date().toLocaleDateString("ko-KR");
    const fallback = `# ${scenario} 맞춤 하네스 설계서\n\n## 프로젝트 정보\n- 도메인: ${scenario}\n- 생성일: ${today}\n- 상태: ✅ 기본 설계 완료\n\n## 현장 환경 요약\n선택된 스펙을 기반으로 기본 하네스가 구성되었습니다.\nANTHROPIC_API_KEY를 설정하거나 Ollama를 실행하면 AI 맞춤 설계가 활성화됩니다.\n\n## 추천 위젯 구성\n- 실시간 KPI 카드: 핵심 지표 모니터링\n- CCTV 멀티뷰: 구역별 영상 표시\n- 알람 이벤트 패널: 실시간 경보 목록\n- 데이터 추이 차트: 시계열 분석\n\n## API 연동 계획\n- VMS WebSocket: 실시간 영상 스트림\n- 알람 API: 이벤트 수신 및 처리\n- 대시보드 API: 통계 데이터 조회\n`;
    return new Response(fallback, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
