export interface Scenario {
  id: "energy" | "manufacturing" | "smartcity";
  label: string;
  icon: string;
  color: string;
  injection: string;
  requiredInfo: string[];
  interviewQuestions: string[];
}

export const scenarios: Scenario[] = [
  {
    id: "energy",
    label: "국가 에너지 관제",
    icon: "Zap",
    color: "#00d4ff",
    injection:
      "국가 주요 전력망의 실시간 발전량과 설비 압력/온도 데이터를 12그리드 기반으로 통합 관제하는 아키텍처를 설계해줘.",
    requiredInfo: ["발전소_종류_규모", "데이터_수집_주기", "경보_우선순위"],
    interviewQuestions: [
      "관제할 발전소의 종류와 규모는 어떻게 되나요? (예: 원자력 2기, 화력 5기)",
      "실시간 데이터 수집 주기는 어느 정도로 설정할까요? (ms 단위)",
      "임계값 초과 시 경보 우선순위는 어떻게 설정하시겠어요? (예: 위험 > 경고 > 주의)",
    ],
  },
  {
    id: "manufacturing",
    label: "제조 비전 관제",
    icon: "Camera",
    color: "#7c3aed",
    injection:
      "대규모 제조 공정 내 지능형 CCTV와 연동하여 현장 인력의 안전 장구 착용 여부 및 작업 반경을 통합 관제하는 솔루션을 설계해줘.",
    requiredInfo: ["CCTV_채널_수", "분할_레이아웃", "객체_인식_대상"],
    interviewQuestions: [
      "동시에 관제할 CCTV 채널 수는 몇 개인가요?",
      "선호하는 화면 분할 레이아웃이 있으신가요? (4분할 / 9분할 / 16분할)",
      "비전 AI가 주로 인식해야 할 객체는 무엇인가요? (예: 헬멧, 안전조끼, 작업자 위치)",
    ],
  },
  {
    id: "smartcity",
    label: "스마트시티 대응",
    icon: "Building2",
    color: "#059669",
    injection:
      "도시 내 주요 하천 수위 센서와 화재 감지 데이터를 연동하여 비상 상황 시 즉각 대응이 가능한 공공 통합 관제 센터를 설계해줘.",
    requiredInfo: ["GIS_마커_우선순위", "재난_단계_모드", "공공_데이터_소스"],
    interviewQuestions: [
      "GIS 기반 지도에서 마커 표시 우선순위는 어떻게 설정할까요? (예: 화재 > 침수 > 교통)",
      "재난 단계별(1~5단계) 대시보드 모드 전환이 필요하신가요?",
      "연동할 공공 데이터 소스는 무엇인가요? (예: 기상청 API, 소방청 API, 국토부 GIS)",
    ],
  },
];

export const requiredInfoMap: Record<string, string[]> = {
  energy: ["발전소_종류_규모", "데이터_수집_주기", "경보_우선순위"],
  manufacturing: ["CCTV_채널_수", "분할_레이아웃", "객체_인식_대상"],
  smartcity: ["GIS_마커_우선순위", "재난_단계_모드", "공공_데이터_소스"],
};
