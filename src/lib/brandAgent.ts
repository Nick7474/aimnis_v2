import { BRAND_PRESETS, type BrandPreset } from "./brandPresets";

export interface BrandAgentSuggestion {
  presetId: string;
  label: string;
  tenantName: string;
  serviceName: string;
  summary: string;
  changes: string[];
}

const BRAND_MATCHERS: Array<{
  presetId: string;
  keywords: string[];
  summary: string;
  changes: string[];
}> = [
  {
    presetId: "posco-smart-safety",
    keywords: ["포스코", "posco", "제조", "스마트팩토리", "팩토리", "산업 안전", "철강"],
    summary: "제조 현장 안전 관제 톤으로 전환할 수 있습니다.",
    changes: ["스틸 블루/틸 중심 컬러", "위험 이벤트 레드 오렌지", "컴팩트 관제 밀도", "블루프린트 맵 톤"],
  },
  {
    presetId: "samsung-digital-campus",
    keywords: ["삼성", "samsung", "반도체", "캠퍼스", "디지털"],
    summary: "캠퍼스/반도체 보안 관제 톤으로 전환할 수 있습니다.",
    changes: ["딥 블루 브랜드 톤", "시안 액센트", "표준 관제 밀도", "딥 맵 톤"],
  },
  {
    presetId: "hyundai-mobility-guard",
    keywords: ["현대", "hyundai", "모빌리티", "자동차", "공장"],
    summary: "모빌리티 운영 관제 톤으로 전환할 수 있습니다.",
    changes: ["네이비 기반 헤더", "시안 포인트 컬러", "운영 장비 중심 톤", "블루프린트 맵"],
  },
  {
    presetId: "kepco-energy-control",
    keywords: ["한전", "kepco", "전력", "에너지", "화이트", "밝게", "클린"],
    summary: "화이트 기반 에너지 관제 톤으로 전환할 수 있습니다.",
    changes: ["화이트 엔터프라이즈 배경", "인디고/청록 포인트", "여유 있는 밀도", "모노 맵 톤"],
  },
  {
    presetId: "twinx-industrial-gray",
    keywords: ["그레이", "gray", "grey", "twin", "twin-x", "설비", "오렌지"],
    summary: "그레이 산업 설비 관제 톤으로 전환할 수 있습니다.",
    changes: ["다크 그레이 베이스", "오렌지 액션 컬러", "샤프한 radius", "컴팩트 밀도"],
  },
  {
    presetId: "public-neutral",
    keywords: ["공공", "기관", "지자체", "neutral", "기본", "차분"],
    summary: "공공기관용 중립 관제 톤으로 전환할 수 있습니다.",
    changes: ["중립 슬레이트 팔레트", "절제된 시안 포인트", "넓은 카드 밀도", "모노 맵 톤"],
  },
];

const BRAND_INTENT = ["브랜드", "화이트", "프리셋", "로고", "톤", "바꿔", "변경", "납품", "처럼"];

export function detectBrandSuggestion(text: string): BrandAgentSuggestion | null {
  const normalized = text.toLowerCase();
  const hasBrandIntent = BRAND_INTENT.some((keyword) => normalized.includes(keyword));
  const matched = BRAND_MATCHERS.find((matcher) =>
    matcher.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))
  );

  if (!matched || !hasBrandIntent) return null;

  const preset = BRAND_PRESETS.find((item) => item.id === matched.presetId);
  if (!preset) return null;

  return toSuggestion(preset, matched.summary, matched.changes);
}

export function encodeBrandSuggestion(suggestion: BrandAgentSuggestion) {
  return `__BRAND_SUGGESTION__${JSON.stringify(suggestion)}`;
}

export function parseBrandSuggestion(content: string): BrandAgentSuggestion | null {
  const marker = "__BRAND_SUGGESTION__";
  const index = content.indexOf(marker);
  if (index === -1) return null;

  try {
    return JSON.parse(content.slice(index + marker.length).trim()) as BrandAgentSuggestion;
  } catch {
    return null;
  }
}

function toSuggestion(preset: BrandPreset, summary: string, changes: string[]): BrandAgentSuggestion {
  return {
    presetId: preset.id,
    label: preset.label,
    tenantName: preset.tenantName,
    serviceName: preset.serviceName,
    summary,
    changes,
  };
}
