/**
 * intentParser.ts
 * 에디터 ChatPanel 자연어 → 즉시 실행 명령 파싱
 * API 호출 없이 클라이언트 사이드에서 처리
 */

export type IntentType =
  | "brand_preset"    // 브랜드 프리셋 전환
  | "brand_color"     // 단일 색상 변경
  | "system_title"    // 시스템 타이틀 변경
  | "tenant_name"     // 고객사명 변경
  | "view_mapping"    // 매핑 뷰 전환
  | "view_monitor"    // 모니터 뷰 전환
  | "clear_widgets"   // 위젯 전체 삭제
  | "unknown";        // 처리 불가 → API로 넘김

export interface ParsedIntent {
  type: IntentType;
  params: Record<string, string>;
  /** 사용자에게 보여줄 즉시 응답 메시지 */
  ackMessage: string;
}

// ── 브랜드 프리셋 매핑 ────────────────────────────────────────
const PRESET_RULES: Array<{ keywords: string[]; presetId: string; title?: string; ack: string }> = [
  {
    keywords: ["posco", "포스코", "납품 톤", "포스코 스타일"],
    presetId: "posco-smart-safety",
    title: "포스코 통합관제",
    ack: "포스코 납품 톤으로 변경했습니다. 고객사도 '포스코'로 설정됐습니다.",
  },
  {
    keywords: ["kepco", "한전", "화이트 톤", "kepco 스타일"],
    presetId: "kepco-energy-control",
    title: "KEPCO 관제센터",
    ack: "KEPCO 화이트 톤으로 변경했습니다.",
  },
  {
    keywords: ["그레이", "gray", "설비 관제 톤", "그레이 톤"],
    presetId: "twinx-industrial-gray",
    title: undefined,
    ack: "그레이 설비 관제 톤으로 변경했습니다.",
  },
  {
    keywords: ["다크", "dark", "어두운", "어두운 톤"],
    presetId: "aim-guard-default",
    title: undefined,
    ack: "다크 톤으로 변경했습니다.",
  },
];

// ── 뷰 전환 매핑 ────────────────────────────────────────────
const VIEW_RULES: Array<{ keywords: string[]; view: "mapping" | "monitor"; ack: string }> = [
  {
    keywords: ["데이터 연결", "매핑", "센서 연결", "데이터 매핑"],
    view: "mapping",
    ack: "데이터 연결 화면으로 이동했습니다.",
  },
  {
    keywords: ["모니터링", "모니터", "맵으로", "맵 보기", "돌아가"],
    view: "monitor",
    ack: "모니터링 화면으로 이동했습니다.",
  },
];

// ── 위젯 초기화 ─────────────────────────────────────────────
const CLEAR_KEYWORDS = ["모두 지워", "전부 지워", "초기화", "위젯 삭제", "다 지워", "비워줘"];

// ── 메인 파서 ────────────────────────────────────────────────
export function parseIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase().trim();

  // 1. 브랜드 프리셋
  for (const rule of PRESET_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return {
        type: "brand_preset",
        params: { presetId: rule.presetId, ...(rule.title ? { title: rule.title } : {}) },
        ackMessage: rule.ack,
      };
    }
  }

  // 2. 고객사명 변경 — "고객사를 X로" / "X 고객사로"
  const tenantMatch = text.match(/고객사(?:를|을|명)?\s*['""]?([가-힣A-Za-z0-9]+)['""]?(?:로|으로|로\s*바꿔|으로\s*설정)/);
  if (tenantMatch?.[1]) {
    const name = tenantMatch[1];
    return {
      type: "tenant_name",
      params: { name },
      ackMessage: `고객사를 '${name}'(으)로 설정했습니다.`,
    };
  }

  // 3. 시스템 타이틀 변경 — "시스템 이름을 X로" / "제목을 X로"
  const titleMatch = text.match(/(?:시스템\s*이름|시스템명|제목)(?:을|를)?\s*['""]?([가-힣A-Za-z0-9\s]+)['""]?(?:로|으로|로\s*바꿔|으로\s*설정)/);
  if (titleMatch?.[1]) {
    const title = titleMatch[1].trim();
    return {
      type: "system_title",
      params: { title },
      ackMessage: `시스템 이름을 '${title}'(으)로 변경했습니다.`,
    };
  }

  // 4. 뷰 전환
  for (const rule of VIEW_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return {
        type: rule.view === "mapping" ? "view_mapping" : "view_monitor",
        params: { view: rule.view },
        ackMessage: rule.ack,
      };
    }
  }

  // 5. 위젯 초기화
  if (CLEAR_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()))) {
    return {
      type: "clear_widgets",
      params: {},
      ackMessage: "위젯을 모두 지웠습니다.",
    };
  }

  // 처리 불가 → API 호출로 넘김
  return { type: "unknown", params: {}, ackMessage: "" };
}
