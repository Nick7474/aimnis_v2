export type ScenarioId = "energy" | "manufacturing" | "smartcity";

export type SpecQuestionId =
  | "facility_type"
  | "device_mode"
  | "area_size"
  | "op_hours"
  | "zone_count"
  | "cctv_count"
  | "vms_solution"
  | "resolution"
  | "network"
  | "priority_sensors"
  | "fault_signals"
  | "data_interval"
  | "ai_goal"
  | "model_policy"
  | "analysis_method"
  | "worker_safety"
  | "alert_channels"
  | "safety_cutoff"
  | "communication"
  | "storage_location"
  | "system_integration"
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
    label: "에너지 시설 통합 관제",
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
    label: "스마트 제조 이상 감지",
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
    label: "스마트시티 안전 관제",
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

// ── AIM Monitoring 전용 시나리오/질문 세트 ─────────────────────────
// 기존 AIM GUARD export는 그대로 유지하고, Monitoring일 때만 아래 config를 사용한다.
export const monitoringScenarios: Scenario[] = [
  {
    id: "energy",
    label: "에너지 시설 통합 관제",
    subLabel: "발전·ESS·전기 설비",
    icon: "Zap",
    color: "#3b82f6",
    defaultSpecs: {
      facility_type: "발전/ESS 전기 설비",
      op_hours: "24시간 상시",
      device_mode: "휴대/고정 겸용",
      priority_sensors: ["초음파", "열/온도", "가스", "3축 진동"],
      fault_signals: ["아크/코로나", "과열", "열화 가스", "이상 진동"],
      data_interval: "이벤트 기반 + 분 단위",
      ai_goal: "이상 조기 감지",
      model_policy: "F2-score 안전 우선",
      analysis_method: ["Autoencoder 이상탐지", "LSTM 예측", "규칙 기반 + AI 혼합"],
      worker_safety: ["유해가스 노출", "위험구역 진입"],
      alert_channels: ["관제 화면 팝업", "모바일 푸시", "SOP 자동 실행"],
      safety_cutoff: "유해가스 기준 초과",
      communication: ["LTE", "Wi-Fi", "LoRa"],
      storage_location: "하이브리드",
      system_integration: ["SCADA", "설비관리시스템", "리포트 시스템"],
    },
  },
  {
    id: "manufacturing",
    label: "스마트 제조 이상 감지",
    subLabel: "회전기기·생산설비",
    icon: "Factory",
    color: "#06b6d4",
    defaultSpecs: {
      facility_type: "스마트 제조 회전기기",
      op_hours: "교대 운영",
      device_mode: "고정 설치형 + 휴대 점검형",
      priority_sensors: ["3축 진동", "초음파", "열/온도", "가스"],
      fault_signals: ["1X/2X/3X FFT 피크", "비정렬", "마찰", "베어링 이상"],
      data_interval: "초 단위",
      ai_goal: "고장 원인 분류",
      model_policy: "F1/F2 혼합",
      analysis_method: ["FFT 주파수 분석", "CNN-LSTM 스펙트로그램", "Autoencoder 이상탐지"],
      worker_safety: ["위험구역 진입", "쓰러짐 감지"],
      alert_channels: ["관제 화면 팝업", "설비관리 연동", "예지보전 리포트"],
      safety_cutoff: "관리자 승인 필요",
      communication: ["RS-485", "Wi-Fi", "BLE5.0"],
      storage_location: "관제 서버",
      system_integration: ["MES", "설비관리시스템", "리포트 시스템"],
    },
  },
  {
    id: "smartcity",
    label: "스마트시티 안전 관제",
    subLabel: "공공·지하·환경 시설",
    icon: "Building2",
    color: "#10b981",
    defaultSpecs: {
      facility_type: "공공/지하/환경 시설",
      op_hours: "24시간 상시",
      device_mode: "게이트웨이 통합형",
      priority_sensors: ["가스", "SpO2", "IMU/Gyro", "열/온도"],
      fault_signals: ["미세 가스", "작업자 쓰러짐", "위험구역 진입", "과열"],
      data_interval: "이벤트 기반",
      ai_goal: "미검출 최소화",
      model_policy: "F2-score 안전 우선",
      analysis_method: ["규칙 기반 + AI 혼합", "LSTM 예측", "Autoencoder 이상탐지"],
      worker_safety: ["SpO2 저하", "쓰러짐 감지", "유해가스 노출"],
      alert_channels: ["관제 화면 팝업", "모바일 푸시", "현장 사운드/LED", "SOP 자동 실행"],
      safety_cutoff: "SpO2 90 이하",
      communication: ["LTE", "BLE5.0", "Wi-Fi"],
      storage_location: "클라우드",
      system_integration: ["알림/메신저", "리포트 시스템", "설비관리시스템"],
    },
  },
];

export const monitoringSpecGroups: SpecGroup[] = [
  {
    id: "asset_scope",
    label: "현장/설비 범위",
    icon: "Factory",
    color: "oklch(65% 0.16 200)",
    questions: [
      {
        id: "facility_type",
        label: "우선 진단할 설비 유형은 무엇인가요?",
        required: true,
        options: ["전기 설비", "회전기기", "펌프/팬/모터", "ESS/배터리", "지하/환경 시설", "복합 설비"],
      },
      {
        id: "op_hours",
        label: "운영 방식은 어떻게 되나요?",
        required: true,
        options: ["24시간 상시", "주간 점검", "교대 운영", "이벤트 발생 시 점검", "실증/파일럿 운영"],
      },
      {
        id: "device_mode",
        label: "계측 방식은 무엇이 적합한가요?",
        required: true,
        options: ["휴대 점검형", "고정 설치형", "휴대/고정 겸용", "게이트웨이 통합형"],
      },
    ],
  },
  {
    id: "sensor_stack",
    label: "계측 센서",
    icon: "Activity",
    color: "oklch(65% 0.16 145)",
    questions: [
      {
        id: "priority_sensors",
        label: "우선 적용할 센서는 무엇인가요? (복수 선택)",
        required: true,
        multiple: true,
        options: ["초음파", "3축 진동", "열/온도", "가스", "SpO2", "IMU/Gyro", "전체 복합 센서"],
      },
      {
        id: "fault_signals",
        label: "가장 중요한 고장 초기 징후는 무엇인가요? (복수 선택)",
        required: true,
        multiple: true,
        options: ["초음파 소음", "이상 진동", "미세 가스", "과열", "작업자 쓰러짐", "복합 징후"],
      },
      {
        id: "data_interval",
        label: "데이터 수집 주기는 어느 수준이 필요한가요?",
        required: true,
        options: ["초 단위", "분 단위", "점검 시 수동 수집", "이벤트 기반", "센서별 다르게"],
      },
    ],
  },
  {
    id: "ai_diagnosis",
    label: "AI 진단 모델",
    icon: "Brain",
    color: "oklch(60% 0.20 285)",
    questions: [
      {
        id: "ai_goal",
        label: "AI 진단의 우선 목표는 무엇인가요?",
        required: true,
        options: ["이상 조기 감지", "고장 원인 분류", "잔여수명 예측", "경보 오탐 감소", "미검출 최소화"],
      },
      {
        id: "model_policy",
        label: "운영 기준은 무엇에 가까운가요?",
        required: true,
        options: ["F1-score 균형 운영", "F2-score 안전 우선", "설비별 혼합 운영"],
      },
      {
        id: "analysis_method",
        label: "사용할 분석 방식은 무엇인가요? (복수 선택)",
        required: true,
        multiple: true,
        options: ["FFT 주파수 분석", "Autoencoder 이상탐지", "LSTM 예측", "CNN-LSTM 스펙트로그램", "규칙 기반 + AI 혼합"],
      },
    ],
  },
  {
    id: "worker_safety",
    label: "작업자 안전",
    icon: "ShieldCheck",
    color: "oklch(58% 0.22 25)",
    questions: [
      {
        id: "worker_safety",
        label: "작업자 안전에서 우선 감지할 항목은 무엇인가요? (복수 선택)",
        required: true,
        multiple: true,
        options: ["SpO2 저하", "쓰러짐 감지", "위험구역 진입", "유해가스 노출", "복합 위험"],
      },
      {
        id: "alert_channels",
        label: "긴급 상황 알림은 어떻게 운영할까요? (복수 선택)",
        required: true,
        multiple: true,
        options: ["관제 화면 팝업", "모바일 푸시", "SMS", "현장 사운드/LED", "SOP 자동 실행"],
      },
      {
        id: "safety_cutoff",
        label: "작업 배제 기준은 어떻게 둘까요?",
        required: true,
        options: ["SpO2 90 이하", "움직임 없음 1분", "유해가스 기준 초과", "관리자 승인 필요"],
      },
    ],
  },
  {
    id: "data_integration",
    label: "데이터/통신",
    icon: "RadioTower",
    color: "oklch(70% 0.14 230)",
    questions: [
      {
        id: "communication",
        label: "통신 방식은 무엇을 우선 지원해야 하나요? (복수 선택)",
        required: true,
        multiple: true,
        options: ["BLE5.0", "LTE", "Wi-Fi", "LoRa", "RS-485", "혼합"],
      },
      {
        id: "storage_location",
        label: "데이터 저장 위치는 어디가 적합한가요?",
        required: true,
        options: ["로컬 장비", "모바일 앱", "관제 서버", "클라우드", "하이브리드"],
      },
      {
        id: "system_integration",
        label: "연동할 시스템은 무엇인가요? (복수 선택)",
        required: true,
        multiple: true,
        options: ["설비관리시스템", "MES", "SCADA", "알림/메신저", "리포트 시스템", "아직 미정"],
      },
    ],
  },
];

export interface ScenarioConfig {
  solutionId: "guard" | "monitoring";
  blueprintTitle: string;
  scenarios: Scenario[];
  specGroups: SpecGroup[];
  scenarioMap: Record<ScenarioId, Scenario>;
  requiredQuestions: SpecQuestionId[];
  specQuestionMap: Record<string, SpecQuestion>;
}

export const guardScenarioConfig: ScenarioConfig = {
  solutionId: "guard",
  blueprintTitle: "AIM GUARD 아키텍처 설계서",
  scenarios,
  specGroups,
  scenarioMap,
  requiredQuestions: REQUIRED_QUESTIONS,
  specQuestionMap,
};

export const monitoringScenarioMap = Object.fromEntries(
  monitoringScenarios.map((s) => [s.id, s])
) as Record<ScenarioId, Scenario>;

export const MONITORING_REQUIRED_QUESTIONS: SpecQuestionId[] = monitoringSpecGroups
  .flatMap(g => g.questions)
  .filter(q => q.required)
  .map(q => q.id);

export const monitoringSpecQuestionMap = Object.fromEntries(
  monitoringSpecGroups.flatMap(g => g.questions).map(q => [q.id, q])
) as Record<string, SpecQuestion>;

export const monitoringScenarioConfig: ScenarioConfig = {
  solutionId: "monitoring",
  blueprintTitle: "AIM Monitoring Harness 설계서",
  scenarios: monitoringScenarios,
  specGroups: monitoringSpecGroups,
  scenarioMap: monitoringScenarioMap,
  requiredQuestions: MONITORING_REQUIRED_QUESTIONS,
  specQuestionMap: monitoringSpecQuestionMap,
};

export function getScenarioConfig(solutionId?: string | null): ScenarioConfig {
  return solutionId === "monitoring" ? monitoringScenarioConfig : guardScenarioConfig;
}
