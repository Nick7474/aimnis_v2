/**
 * intentParser.ts v2 — 자연어 즉시 실행 엔진
 * API 호출 없이 클라이언트에서 처리
 * - 한국어 조사/어미 정규화
 * - 위젯 생성 7종 즉시 처리
 * - 대규모 키워드 시노님 테이블
 */

export type IntentType =
  | "brand_preset" | "brand_color" | "system_title" | "tenant_name"
  | "view_mapping" | "view_monitor" | "clear_widgets"
  | "add_kpi" | "add_chart_line" | "add_chart_bar" | "add_chart_donut"
  | "add_gauge" | "add_alert_panel" | "add_table"
  | "unknown";

export interface WidgetTemplate {
  type: string;
  title: string;
  data: {
    value?: string; unit?: string; trend?: string; trendUp?: boolean; color?: string;
    chartData?: Array<{ name: string; value: number }>;
    gaugeValue?: number; gaugeMax?: number;
    alerts?: Array<{ level: "critical" | "warning" | "info"; msg: string }>;
    description?: string;
  };
}

export interface ParsedIntent {
  type: IntentType;
  params: Record<string, string>;
  ackMessage: string;
  widgetTemplate?: WidgetTemplate;
}

// ── 텍스트 정규화 ──────────────────────────────────────────────
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/을|를|이|가|은|는|의|에서|에게|도|만|좀|요/g, " ")
    .replace(/로|으로/g, " ")
    .replace(/해줘|해주세요|해주실까|적용해|적용시켜|바꿔줘|바꿔|변경해|변경해줘|만들어줘|만들어|보여줘|보여|생성해|생성해줘|넣어줘|넣어|추가해|추가해줘|올려줘|띄워줘|열어줘|달아줘|켜줘|설정해|설정해줘|보고싶어|추가|생성|만들기|불러줘|띄워/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── 위젯 템플릿 풀 ─────────────────────────────────────────────
const KPI_TPLS: WidgetTemplate[] = [
  { type: "kpi", title: "실시간 가동률",   data: { value: "89.4", unit: "%",   trend: "+2.1%", trendUp: true,  color: "#14b8a6" } },
  { type: "kpi", title: "정상 설비 수",    data: { value: "124",  unit: "대",   trend: "+2",    trendUp: true,  color: "#10b981" } },
  { type: "kpi", title: "생산 효율",       data: { value: "94.2", unit: "%",   trend: "+0.8%", trendUp: true,  color: "#8b5cf6" } },
  { type: "kpi", title: "위험 감지 건수",  data: { value: "3",    unit: "건",   trend: "-1",    trendUp: false, color: "#ef4444" } },
  { type: "kpi", title: "누적 알람",       data: { value: "26",   unit: "건",   trend: "+3",    trendUp: false, color: "#f59e0b" } },
  { type: "kpi", title: "평균 온도",       data: { value: "72.4", unit: "°C",  trend: "+1.2°", trendUp: false, color: "#06b6d4" } },
  { type: "kpi", title: "월간 가동 시간",  data: { value: "698",  unit: "hr",  trend: "+12h",  trendUp: true,  color: "#3b82f6" } },
  { type: "kpi", title: "에너지 절감률",   data: { value: "12.8", unit: "%",   trend: "+1.4%", trendUp: true,  color: "#10b981" } },
];

const LINE_TPLS: WidgetTemplate[] = [
  { type: "chart-line", title: "실시간 온도 추이",   data: { color: "#14b8a6", chartData: [{ name: "00:00", value: 68 }, { name: "04:00", value: 65 }, { name: "08:00", value: 72 }, { name: "12:00", value: 84 }, { name: "16:00", value: 89 }, { name: "20:00", value: 76 }] } },
  { type: "chart-line", title: "가동률 추이 (주간)", data: { color: "#8b5cf6", chartData: [{ name: "월", value: 88 }, { name: "화", value: 91 }, { name: "수", value: 87 }, { name: "목", value: 93 }, { name: "금", value: 89 }, { name: "토", value: 85 }] } },
  { type: "chart-line", title: "진동 센서 트렌드",   data: { color: "#f59e0b", chartData: [{ name: "1h", value: 2.1 }, { name: "2h", value: 2.4 }, { name: "3h", value: 3.1 }, { name: "4h", value: 2.8 }, { name: "5h", value: 3.5 }, { name: "6h", value: 3.2 }] } },
  { type: "chart-line", title: "에너지 소비 추이",   data: { color: "#06b6d4", chartData: [{ name: "1월", value: 420 }, { name: "2월", value: 390 }, { name: "3월", value: 450 }, { name: "4월", value: 410 }, { name: "5월", value: 480 }, { name: "6월", value: 460 }] } },
];

const BAR_TPLS: WidgetTemplate[] = [
  { type: "chart-bar", title: "구역별 에너지 사용량", data: { color: "#3b82f6", chartData: [{ name: "A구역", value: 420 }, { name: "B구역", value: 380 }, { name: "C구역", value: 510 }, { name: "D구역", value: 290 }, { name: "E구역", value: 440 }] } },
  { type: "chart-bar", title: "월별 생산량 비교",    data: { color: "#10b981", chartData: [{ name: "1월", value: 1840 }, { name: "2월", value: 1720 }, { name: "3월", value: 1980 }, { name: "4월", value: 2100 }, { name: "5월", value: 2250 }, { name: "6월", value: 2180 }] } },
  { type: "chart-bar", title: "설비별 알람 발생 수", data: { color: "#ef4444", chartData: [{ name: "압축기", value: 12 }, { name: "펌프", value: 8 }, { name: "변압기", value: 5 }, { name: "차단기", value: 3 }, { name: "기타", value: 6 }] } },
];

const DONUT_TPLS: WidgetTemplate[] = [
  { type: "chart-donut", title: "설비 상태 구성",  data: { chartData: [{ name: "정상", value: 78 }, { name: "주의", value: 14 }, { name: "위험", value: 5 }, { name: "점검중", value: 3 }] } },
  { type: "chart-donut", title: "알람 유형 분포",  data: { chartData: [{ name: "온도", value: 42 }, { name: "진동", value: 28 }, { name: "가스", value: 18 }, { name: "기타", value: 12 }] } },
  { type: "chart-donut", title: "에너지 소비 비율", data: { chartData: [{ name: "생산라인", value: 55 }, { name: "공조", value: 22 }, { name: "조명", value: 13 }, { name: "기타", value: 10 }] } },
];

const GAUGE_TPLS: WidgetTemplate[] = [
  { type: "gauge", title: "설비 온도",   data: { gaugeValue: 72, gaugeMax: 100, unit: "°C",   color: "#f59e0b" } },
  { type: "gauge", title: "압력 수치",   data: { gaugeValue: 64, gaugeMax: 100, unit: "kPa",  color: "#ef4444" } },
  { type: "gauge", title: "시스템 부하", data: { gaugeValue: 81, gaugeMax: 100, unit: "%",    color: "#8b5cf6" } },
  { type: "gauge", title: "진동 레벨",   data: { gaugeValue: 43, gaugeMax: 100, unit: "mm/s", color: "#06b6d4" } },
  { type: "gauge", title: "CO 농도",     data: { gaugeValue: 28, gaugeMax: 100, unit: "ppm",  color: "#10b981" } },
  { type: "gauge", title: "전류 부하",   data: { gaugeValue: 67, gaugeMax: 100, unit: "A",    color: "#3b82f6" } },
  { type: "gauge", title: "배터리 잔량", data: { gaugeValue: 88, gaugeMax: 100, unit: "%",    color: "#14b8a6" } },
];

const ALERT_TPLS: WidgetTemplate[] = [
  { type: "alert-panel", title: "실시간 알람",  data: { alerts: [{ level: "critical", msg: "[A구역] 압축기 #A 온도 초과 (84°C)" }, { level: "warning", msg: "[B구역] 진동 센서 임계치 근접 (4.2mm/s)" }, { level: "info", msg: "[C구역] 정기 점검 예정 (15분 후)" }] } },
  { type: "alert-panel", title: "이상 감지 패널", data: { alerts: [{ level: "critical", msg: "[3층] CO 가스 농도 위험 (48ppm)" }, { level: "warning", msg: "[1층] 작업자 안전모 미착용 감지" }, { level: "info", msg: "시스템 정상 가동 중" }] } },
];

const TABLE_TPLS: WidgetTemplate[] = [
  { type: "table", title: "설비 현황 목록", data: { description: "table", chartData: [{ name: "압축기 #A", value: 89 }, { name: "순환펌프 #1", value: 94 }, { name: "메인 변압기", value: 72 }, { name: "차단기 패널", value: 98 }] } },
];

// 템플릿 순환 픽커
const _counters: Record<string, number> = {};
function pick<T>(key: string, arr: T[]): T {
  const idx = (_counters[key] ?? 0) % arr.length;
  _counters[key] = idx + 1;
  return arr[idx];
}

// ── 위젯 키워드 규칙 (우선순위 높은 것부터) ──────────────────────
interface WidgetRule { type: IntentType; kw: string[]; tpls: WidgetTemplate[]; ack: string; }

const WIDGET_RULES: WidgetRule[] = [
  {
    type: "add_alert_panel",
    kw: ["알람", "알림", "경보", "경고", "이벤트", "alert", "alarm", "위험알림", "긴급", "위험감지", "이상감지", "인시던트", "incident", "사고", "비상", "이상"],
    tpls: ALERT_TPLS,
    ack: "알람 패널을 추가했습니다.",
  },
  {
    type: "add_gauge",
    kw: ["게이지", "gauge", "계기", "계기판", "온도", "압력", "수준", "레벨", "level", "rpm", "부하", "농도", "진동", "습도", "전압", "전류", "유량", "수위", "적산", "계측", "미터", "meter"],
    tpls: GAUGE_TPLS,
    ack: "게이지 위젯을 추가했습니다.",
  },
  {
    type: "add_chart_donut",
    kw: ["도넛", "도넛차트", "파이", "파이차트", "원형", "구성비", "비율", "donut", "pie", "분포", "점유율", "퍼센트"],
    tpls: DONUT_TPLS,
    ack: "도넛 차트를 추가했습니다.",
  },
  {
    type: "add_chart_bar",
    kw: ["바차트", "바 차트", "막대", "막대차트", "막대 차트", "bar", "column", "컬럼", "비교차트", "비교 차트", "histogram", "히스토그램"],
    tpls: BAR_TPLS,
    ack: "바 차트를 추가했습니다.",
  },
  {
    type: "add_chart_line",
    kw: ["라인차트", "라인 차트", "선차트", "선 차트", "라인", "line", "추이", "추세", "트렌드", "trend", "시계열", "시간대별", "실시간차트", "실시간 차트", "그래프", "graph", "꺾은선", "리얼타임"],
    tpls: LINE_TPLS,
    ack: "라인 차트를 추가했습니다.",
  },
  {
    type: "add_table",
    kw: ["테이블", "표", "목록", "리스트", "table", "list", "이력", "현황표", "데이터표", "그리드", "grid", "로그", "log", "내역"],
    tpls: TABLE_TPLS,
    ack: "테이블 위젯을 추가했습니다.",
  },
  {
    type: "add_kpi",
    kw: ["kpi", "수치", "지표", "현황", "현황판", "통계", "스탯", "stat", "count", "카운트", "핵심지표", "메트릭", "metric", "숫자", "수량", "카드", "대시보드카드", "상태카드", "현황카드", "효율", "가동률", "생산량"],
    tpls: KPI_TPLS,
    ack: "KPI 카드를 추가했습니다.",
  },
];

// ── 브랜드 프리셋 규칙 ──────────────────────────────────────────
const PRESET_RULES = [
  { kw: ["posco", "포스코", "철강", "스틸", "스마트팩토리", "포스코스타일", "포스코납품", "제철"], presetId: "posco-smart-safety",    title: "포스코 통합관제", ack: "포스코 납품 톤으로 변경했습니다." },
  { kw: ["kepco", "한전", "화이트톤", "화이트 톤", "밝은톤", "흰색", "라이트", "전력", "white", "light", "화이트테마"], presetId: "kepco-energy-control", title: "KEPCO 관제센터",  ack: "KEPCO 화이트 톤으로 변경했습니다." },
  { kw: ["그레이", "gray", "grey", "회색", "설비관제", "산업", "인더스트리얼", "industrial", "그레이톤"],            presetId: "twinx-industrial-gray", title: undefined,         ack: "그레이 설비 관제 톤으로 변경했습니다." },
  { kw: ["다크", "dark", "어두운", "기본톤", "블루", "네이비", "navy", "디폴트", "기본"],                           presetId: "aim-guard-default",     title: undefined,         ack: "다크 블루 기본 톤으로 변경했습니다." },
  { kw: ["삼성", "samsung", "캠퍼스", "반도체", "딥블루"],                                                         presetId: "samsung-digital-campus", title: undefined,        ack: "삼성 딥블루 톤으로 변경했습니다." },
  { kw: ["현대", "hyundai", "모빌리티", "automotive", "자동차"],                                                   presetId: "hyundai-mobility-guard", title: undefined,        ack: "현대 모빌리티 네이비 톤으로 변경했습니다." },
  { kw: ["공공", "중립", "공공기관", "정부", "관공서"],                                                             presetId: "public-neutral",         title: undefined,        ack: "공공기관 중립 톤으로 변경했습니다." },
];

// ── 뷰 전환 규칙 ──────────────────────────────────────────────
const VIEW_RULES = [
  { kw: ["데이터연결", "매핑", "센서연결", "데이터매핑", "바인딩", "연결", "소스", "연동", "배선", "데이터소스", "mapping", "bind", "링크"], view: "mapping" as const, ack: "데이터 연결 화면으로 이동했습니다." },
  { kw: ["모니터링", "모니터", "맵", "맵보기", "돌아가", "화면", "대시보드", "뒤로", "monitor", "dashboard"], view: "monitor" as const, ack: "모니터링 화면으로 이동했습니다." },
];

// ── 위젯 초기화 ───────────────────────────────────────────────
const CLEAR_KW = ["모두지워", "전부지워", "초기화", "위젯삭제", "다지워", "비워", "클리어", "clear", "리셋", "reset", "전부삭제", "모두삭제", "다삭제", "싹지워"];

// ── 헬퍼: 토큰 매칭 ─────────────────────────────────────────
function matches(n: string, raw: string, keywords: string[]): boolean {
  return keywords.some(kw => {
    const k = kw.toLowerCase();
    return n.includes(k) || raw.includes(k);
  });
}

// ── 메인 파서 ─────────────────────────────────────────────────
export function parseIntent(text: string): ParsedIntent {
  const raw = text.toLowerCase().trim();
  const n   = normalize(text);

  // 1. 위젯 생성 (특수 키워드가 브랜드보다 먼저 체크)
  for (const rule of WIDGET_RULES) {
    if (matches(n, raw, rule.kw)) {
      const tpl = pick(rule.type, rule.tpls);
      return {
        type: rule.type,
        params: { widgetType: tpl.type, widgetTitle: tpl.title },
        ackMessage: `✓ ${rule.ack}`,
        widgetTemplate: tpl,
      };
    }
  }

  // 2. 브랜드 프리셋
  for (const rule of PRESET_RULES) {
    if (matches(n, raw, rule.kw)) {
      return {
        type: "brand_preset",
        params: { presetId: rule.presetId, ...(rule.title ? { title: rule.title } : {}) },
        ackMessage: `✓ ${rule.ack}`,
      };
    }
  }

  // 3. 고객사명 변경
  const tenantMatch = text.match(/고객사(?:를|을|명)?\s*['""]?([가-힣A-Za-z0-9]+)['""]?(?:로|으로|로\s*바꿔|으로\s*설정)/);
  if (tenantMatch?.[1]) {
    return { type: "tenant_name", params: { name: tenantMatch[1] }, ackMessage: `✓ 고객사를 '${tenantMatch[1]}'(으)로 설정했습니다.` };
  }

  // 4. 시스템 타이틀 변경
  const titleMatch = text.match(/(?:시스템\s*이름|시스템명|제목)(?:을|를)?\s*['""]?([가-힣A-Za-z0-9\s]+)['""]?(?:로|으로|로\s*바꿔|으로\s*설정)/);
  if (titleMatch?.[1]) {
    const title = titleMatch[1].trim();
    return { type: "system_title", params: { title }, ackMessage: `✓ 시스템 이름을 '${title}'(으)로 변경했습니다.` };
  }

  // 5. 뷰 전환
  for (const rule of VIEW_RULES) {
    if (matches(n, raw, rule.kw)) {
      return {
        type: rule.view === "mapping" ? "view_mapping" : "view_monitor",
        params: { view: rule.view },
        ackMessage: `✓ ${rule.ack}`,
      };
    }
  }

  // 6. 위젯 초기화
  if (CLEAR_KW.some(kw => n.includes(kw) || raw.includes(kw))) {
    return { type: "clear_widgets", params: {}, ackMessage: "✓ 위젯을 모두 지웠습니다." };
  }

  return { type: "unknown", params: {}, ackMessage: "" };
}
