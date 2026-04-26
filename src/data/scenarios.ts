export type ScenarioId = "energy" | "manufacturing" | "smartcity";

export type SpecQuestionId =
  | "facility_type"
  | "area_size"
  | "op_hours"
  | "zone_count"
  | "cctv_count"
  | "vms_solution"
  | "resolution"
  | "network"
  | "threat_types"
  | "vuln_zones"
  | "incident_freq"
  | "alarm_level"
  | "notification"
  | "retention_period"
  | "storage_type"
  | "compliance"
  | "staff_count"
  | "it_capability"
  | "purpose"
  | "budget";

export interface DefaultSpecs {
  facility_type?: string;
  area_size?: string;
  op_hours?: string;
  zone_count?: string;
  cctv_count?: string;
  vms_solution?: string;
  resolution?: string[];
  network?: string;
  threat_types?: string[];
  vuln_zones?: string[];
  incident_freq?: string;
  alarm_level?: string;
  notification?: string[];
  [key: string]: any;
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  subLabel: string;
  icon: string;
  color: string;
  defaultSpecs: DefaultSpecs;
}

export interface SpecQuestion {
  id: SpecQuestionId;
  label: string;
  required: boolean;
  multiple?: boolean;
  options: string[];
}

export interface SpecGroup {
  id: string;
  label: string;
  icon: string;
  color: string;
  questions: SpecQuestion[];
}

// ── 3개 시나리오 ─────────────────────────────────────────────
export const scenarios: Scenario[] = [
  {
    id: "energy",
    label: "국가 에너지 관제",
    subLabel: "KEPCO",
    icon: "Zap",
    color: "#735FE9",
    defaultSpecs: {
      facility_type: "데이터센터",
      area_size: "20,000㎡ 이상",
      op_hours: "24시간/365일",
      zone_count: "30개 이상",
      cctv_count: "500대 이상",
      vms_solution: "없음 / 자체 개발",
      resolution: ["열화상 카메라", "PTZ 카메라", "4K UHD"],
      network: "완전 IP 기반",
      threat_types: ["무단 침입·불법 출입", "화재·안전사고", "내부자 위협·정보유출"],
      vuln_zones: ["서버실·전산실", "출입구·정문", "옥상·외부 경계"],
      incident_freq: "상시 모니터링 필요",
      alarm_level: "관제센터 상황 파악 후 조치",
      notification: ["관제 화면 팝업", "모바일 앱 푸시", "SMS 문자 메시지"],
      retention_period: "90일 이상",
      storage_type: "하이브리드",
      compliance: "개인정보보호법 준수",
      staff_count: "4~10명",
      it_capability: "전담 IT팀 보유",
      purpose: "사고 예방·억제",
      budget: "2억원 이상",
    },
  },
  {
    id: "manufacturing",
    label: "하이테크 제조 관제",
    subLabel: "대기업",
    icon: "Factory",
    color: "#7c3aed",
    defaultSpecs: {
      facility_type: "제조 공장",
      area_size: "5,000~20,000㎡",
      op_hours: "2교대 운영",
      zone_count: "16~30개 구역",
      cctv_count: "201~500대",
      vms_solution: "Hanwha Wisenet",
      resolution: ["Full HD(1080p)", "열화상 카메라", "PTZ 카메라"],
      network: "완전 IP 기반",
      threat_types: ["물리적 파손·반달리즘", "화재·안전사고", "무단 침입·불법 출입"],
      vuln_zones: ["창고·자재실", "출입구·정문", "주차장"],
      incident_freq: "자주 있음 (월 1회 이상)",
      alarm_level: "관제센터 상황 파악 후 조치",
      notification: ["관제 화면 팝업", "모바일 앱 푸시", "메신저(슬랙/팀즈)"],
      retention_period: "30일",
      storage_type: "온프레미스 NVR/서버",
      compliance: "개인정보보호법 준수",
      staff_count: "2~5명",
      it_capability: "중간 수준 (IT 담당자 있음)",
      purpose: "사고 예방·억제",
      budget: "5천만~2억원",
    },
  },
  {
    id: "smartcity",
    label: "스마트시티 재난 대응",
    subLabel: "지자체",
    icon: "Building2",
    color: "#059669",
    defaultSpecs: {
      facility_type: "쇼핑몰/상업시설",
      area_size: "20,000㎡ 이상",
      op_hours: "24시간/365일",
      zone_count: "30개 이상",
      cctv_count: "500대 이상",
      vms_solution: "Milestone XProtect",
      resolution: ["Full HD(1080p)", "4K UHD", "PTZ 카메라"],
      network: "아날로그+IP 혼합",
      threat_types: ["절도 및 도난", "화재·안전사고", "무단 침입·불법 출입"],
      vuln_zones: ["출입구·정문", "주차장", "엘리베이터·계단"],
      incident_freq: "상시 모니터링 필요",
      alarm_level: "유관기관(경찰/소방) 자동 신고",
      notification: ["관제 화면 팝업", "SMS 문자 메시지", "모바일 앱 푸시"],
      retention_period: "90일 이상",
      storage_type: "클라우드 연동",
      compliance: "개인정보보호법 준수",
      staff_count: "11명 이상",
      it_capability: "전담 IT팀 보유",
      purpose: "실시간 대응 강화",
      budget: "2억원 이상",
    },
  },
];

// ── 설문 그룹 및 문항 데이터 ───────────────────────────────────────────
export const specGroups: SpecGroup[] = [
  {
    id: "environment",
    label: "현장 환경",
    icon: "Factory",
    color: "oklch(65% 0.16 200)",
    questions: [
      {
        id: "facility_type",
        label: "시설 유형은 무엇인가요?",
        required: true,
        options: ["제조 공장", "물류창고/배송센터", "오피스 빌딩", "데이터센터", "병원/의료시설", "쇼핑몰/상업시설", "교육기관"]
      },
      {
        id: "area_size",
        label: "현장 면적 규모는 어느 정도인가요?",
        required: true,
        options: ["500㎡ 미만", "500~2,000㎡", "2,000~5,000㎡", "5,000~20,000㎡", "20,000㎡ 이상"]
      },
      {
        id: "op_hours",
        label: "시설 운영 시간대는 어떻게 되나요?",
        required: true,
        options: ["24시간/365일", "평일 주간 (09~18시)", "2교대 운영", "3교대 운영", "계절·시즌별 상이"]
      },
      {
        id: "zone_count",
        label: "보안 관리가 필요한 구역 수는?",
        required: true,
        options: ["1~5개 구역", "6~15개 구역", "16~30개 구역", "30개 이상"]
      }
    ]
  },
  {
    id: "cctv",
    label: "CCTV 인프라",
    icon: "Camera",
    color: "oklch(65% 0.16 145)",
    questions: [
      {
        id: "cctv_count",
        label: "현재 운영 중인 CCTV 수량은?",
        required: true,
        options: ["10대 미만", "11~50대", "51~200대", "201~500대", "500대 이상"]
      },
      {
        id: "vms_solution",
        label: "현재 사용 중인 VMS 솔루션은?",
        required: true,
        options: ["Milestone XProtect", "Genetec Security Center", "Hanwha Wisenet", "아이디스", "없음/자체 개발"]
      },
      {
        id: "resolution",
        label: "카메라 해상도 수준은?",
        required: true,
        multiple: true,
        options: ["Full HD(1080p)", "4K UHD", "PTZ 카메라", "열화상 카메라", "FHD 혼합 운영"]
      },
      {
        id: "network",
        label: "카메라 네트워크 구성은?",
        required: true,
        options: ["완전 IP 기반", "아날로그+IP 혼합", "아날로그 전용", "PoE스위치 기반", "무선(WiFi) 포함"]
      }
    ]
  },
  {
    id: "threats",
    label: "보안 위협 유형",
    icon: "AlertTriangle",
    color: "oklch(68% 0.18 55)",
    questions: [
      {
        id: "threat_types",
        label: "주요 보안 위협 유형은? (복수 선택)",
        required: true,
        multiple: true,
        options: ["무단 침입·불법 출입", "절도 및 도난", "내부자 위협·정보유출", "화재·안전사고", "물리적 파손·반달리즘", "폭발물·위험물"]
      },
      {
        id: "vuln_zones",
        label: "보안 취약 구역은 어디인가요? (복수 선택)",
        required: true,
        multiple: true,
        options: ["출입구·정문", "주차장", "서버실·전산실", "창고·자재실", "옥상·외부 경계", "엘리베이터·계단"]
      },
      {
        id: "incident_freq",
        label: "연간 보안 사고 발생 빈도는?",
        required: true,
        options: ["거의 없음 (0~2건)", "가끔 있음 (3~10건)", "자주 있음 (월 1회 이상)", "상시 모니터링 필요"]
      }
    ]
  },
  {
    id: "alarms",
    label: "알람 정책",
    icon: "Bell",
    color: "oklch(58% 0.22 25)",
    questions: [
      {
        id: "alarm_level",
        label: "알람 발생 시 우선 대응 단계는?",
        required: true,
        options: ["경비 인력 즉시 현장 출동", "관제센터 상황 파악 후 조치", "유관기관(경찰/소방) 자동 신고", "안내 방송 경고"]
      },
      {
        id: "notification",
        label: "알람 통보 방식은? (복수 선택)",
        required: true,
        multiple: true,
        options: ["관제 화면 팝업", "메신저(슬랙/팀즈)", "모바일 앱 푸시", "SMS 문자 메시지", "이메일 발송"]
      }
    ]
  },
  {
    id: "data",
    label: "데이터 관리",
    icon: "HardDrive",
    color: "oklch(60% 0.20 285)",
    questions: [
      {
        id: "retention_period",
        label: "영상 보존 기간은 얼마나 필요한가요?",
        required: true,
        options: ["7일", "15일", "30일", "60일", "90일 이상"]
      },
      {
        id: "storage_type",
        label: "저장 인프라 형태는?",
        required: true,
        options: ["온프레미스 NVR/DVR", "엣지 서버", "클라우드 연동", "하이브리드"]
      },
      {
        id: "compliance",
        label: "규정 준수 요건이 있나요?",
        required: false,
        options: ["개인정보보호법 준수", "PCI DSS", "ISO 27001", "해당 없음"]
      }
    ]
  },
  {
    id: "operations",
    label: "운영 인력",
    icon: "Users",
    color: "oklch(70% 0.14 230)",
    questions: [
      {
        id: "staff_count",
        label: "보안 담당 인원은 몇 명인가요?",
        required: true,
        options: ["1명 (전담)", "2~5명", "6~15명", "16명 이상", "외주 위탁"]
      },
      {
        id: "it_capability",
        label: "내부 IT 역량 수준은?",
        required: true,
        options: ["전담 IT팀 보유", "기초 IT 지식 보유", "IT 담당 없음", "외주 IT 관리"]
      },
      {
        id: "purpose",
        label: "도입 주요 목적은?",
        required: true,
        options: ["사고 예방·억제", "사후 증거 확보", "규정·감사 대응", "운영 효율화", "비용 절감"]
      },
      {
        id: "budget",
        label: "연간 보안 예산 규모는?",
        required: false,
        options: ["1천만원 미만", "1천~5천만원", "5천만~2억원", "2억원 이상", "미정"]
      }
    ]
  }
];

// ── 헬퍼 ──────────────────────────────────────────────────────
export const scenarioMap = Object.fromEntries(
  scenarios.map((s) => [s.id, s])
) as Record<ScenarioId, Scenario>;

export const REQUIRED_QUESTIONS: SpecQuestionId[] = specGroups
  .flatMap(g => g.questions)
  .filter(q => q.required)
  .map(q => q.id);

export const specQuestionMap = Object.fromEntries(
  specGroups.flatMap(g => g.questions).map(q => [q.id, q])
) as Record<SpecQuestionId, SpecQuestion>;
