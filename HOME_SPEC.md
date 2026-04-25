# AIMNIS Home — AI Architect Interview Engine Spec

## Claude Code 지침
이 파일은 홈 화면 구현의 완전한 설계서다.
PHASE 2 작업 시 이 파일을 기준으로 구현할 것.
임의 판단 금지. 이 스펙 그대로 구현.

---

## 1. 개요

**목적**
사용자가 선택한 도메인에 따라 AI가 20년차 아키텍트로서
역질문을 던지고, 그 답변을 바탕으로 실시간 설계도(MD)를
완성하는 기획 단계 구현.

**핵심 철학**
"AI가 묻고, 사용자는 답한다"
개발을 모르는 실무 담당자가 대화만으로 완성된 시스템 설계를 받는다.

**라우팅**
- 진입: `/home`
- 완료: `/editor?solution=aim-guard&scenario=[id]`

---

## 2. 레이아웃 구조

```
/home 전체 레이아웃 (3열)

┌─────────────────────────────────────────────────────┐
│                    상단 Navbar                        │
├──────────────────────┬──────────────────────────────┤
│                      │                               │
│   좌측: AI 채팅       │   우측: Live Blueprint        │
│   (Stitch Input +    │   (aim_guard_home.md          │
│    시나리오 칩 +      │    실시간 빌더)                │
│    대화 영역)         │                               │
│                      │                               │
│   width: 55%         │   width: 45%                  │
│                      │                               │
└──────────────────────┴──────────────────────────────┘
```

---

## 3. 시나리오 칩 (3 Golden Cases)

### 칩 구성
```tsx
const scenarios = [
  {
    id: 'energy',
    label: '국가 에너지 관제',
    icon: 'Zap',
    color: '#00d4ff',
    injection: '국가 주요 전력망의 실시간 발전량과 설비 압력/온도 데이터를 12그리드 기반으로 통합 관제하는 아키텍처를 설계해줘.',
    requiredInfo: [
      '발전소_종류_규모',
      '데이터_수집_주기',
      '경보_우선순위'
    ],
    interviewQuestions: [
      '관제할 발전소의 종류와 규모는 어떻게 되나요? (예: 원자력 2기, 화력 5기)',
      '실시간 데이터 수집 주기는 어느 정도로 설정할까요? (ms 단위)',
      '임계값 초과 시 경보 우선순위는 어떻게 설정하시겠어요? (예: 위험 > 경고 > 주의)'
    ]
  },
  {
    id: 'manufacturing',
    label: '제조 비전 관제',
    icon: 'Camera',
    color: '#7c3aed',
    injection: '대규모 제조 공정 내 지능형 CCTV와 연동하여 현장 인력의 안전 장구 착용 여부 및 작업 반경을 통합 관제하는 솔루션을 설계해줘.',
    requiredInfo: [
      'CCTV_채널_수',
      '분할_레이아웃',
      '객체_인식_대상'
    ],
    interviewQuestions: [
      '동시에 관제할 CCTV 채널 수는 몇 개인가요?',
      '선호하는 화면 분할 레이아웃이 있으신가요? (4분할 / 9분할 / 16분할)',
      '비전 AI가 주로 인식해야 할 객체는 무엇인가요? (예: 헬멧, 안전조끼, 작업자 위치)'
    ]
  },
  {
    id: 'smartcity',
    label: '스마트시티 대응',
    icon: 'Building2',
    color: '#059669',
    injection: '도시 내 주요 하천 수위 센서와 화재 감지 데이터를 연동하여 비상 상황 시 즉각 대응이 가능한 공공 통합 관제 센터를 설계해줘.',
    requiredInfo: [
      'GIS_마커_우선순위',
      '재난_단계_모드',
      '공공_데이터_소스'
    ],
    interviewQuestions: [
      'GIS 기반 지도에서 마커 표시 우선순위는 어떻게 설정할까요? (예: 화재 > 침수 > 교통)',
      '재난 단계별(1~5단계) 대시보드 모드 전환이 필요하신가요?',
      '연동할 공공 데이터 소스는 무엇인가요? (예: 기상청 API, 소방청 API, 국토부 GIS)'
    ]
  }
]
```

---

## 4. UI 컴포넌트 상세

### 4.1 시나리오 칩

```tsx
// 칩 클릭 동작
onClick(scenario) {
  1. selectedScenario = scenario.id 상태 변경
  2. textarea에 scenario.injection 문구를
     타이핑 효과(typewriter)로 삽입
     속도: 30ms/글자
  3. 칩 활성화 스타일 적용
     border-color: scenario.color
     glow: 0 0 12px scenario.color
}
```

### 4.2 Stitch Input (중앙 입력창)

```
스타일:
- 배경: rgba(255,255,255,0.04) 글라스
- 보더: rgba(0,212,255,0.2)
- 포커스 시 네온 글로우
- 높이: min 120px, auto expand

하단 버튼:
- 파일 첨부 (+) 버튼
- 시나리오 칩 3개
- 전송 버튼 (→)

파일 첨부 동작:
- MD/TXT → 기획서로 인식
- 이미지 → 로고/브랜드로 인식 → "로고로 적용할까요?"
- PDF → 문서 분석
- 기타 → "기획서나 이미지를 올려주세요"
```

### 4.3 AI 대화 영역

```
메시지 스타일:
- 사용자 메시지: 우측 정렬, 네온 배경
- AI 메시지: 좌측 정렬, 글라스 카드
- AI 아바타: AIMNIS 로고 아이콘

로딩 애니메이션 (thought 상태):
- "설계 분석 중..." 텍스트
- 3개 점 순차 애니메이션
- 글라스 카드에 pulse 효과
```

### 4.4 Live Blueprint (우측 패널)

```
스타일:
- 배경: rgba(0,0,0,0.3) 다크 글라스
- 상단 헤더: "aim_guard_home.md" 파일명 표시
- 실시간 타이핑 효과로 MD 내용 추가

MD 구조:
# [시나리오명] 아키텍처 설계서

## Project Info
- 도메인: [에너지/제조/스마트시티]
- 생성일: [날짜]
- 상태: 인터뷰 진행 중...

## Requirements
(사용자 답변 기반으로 실시간 추가)
- [ ] 요구사항 1
- [ ] 요구사항 2

## Widgets
(정보 수집되면서 실시간 추가)
- widget_type: LineChart
  label: 실시간 에너지 사용량
  data_source: energy_sensor_api

## API Mapping
(정보 수집되면서 실시간 추가)
- endpoint: /api/energy/realtime
  method: GET
  fields: [timestamp, voltage, current]

## Pages
(설계 확정 시 추가)
- 메인 대시보드
- 상세 모니터링
- 알람 관리
```

---

## 5. AI 인터뷰어 로직

### 5.1 시스템 프롬프트

```
당신은 20년 경력의 엔터프라이즈 서비스 아키텍트입니다.

역할:
- 사용자의 요구사항을 정확히 파악하기 위해 역질문합니다
- 한 번에 1~2개 질문만 합니다
- 친절하고 전문적인 톤을 유지합니다
- 설계를 너무 빨리 끝내지 않습니다

응답 형식 (JSON):
{
  "message": "사용자에게 보여줄 메시지",
  "questions": ["질문1", "질문2"],
  "blueprintUpdate": {
    "section": "Requirements | Widgets | API Mapping",
    "content": "추가할 MD 내용"
  },
  "collectedInfo": {
    "항목명": "수집된 값"
  },
  "isComplete": false
}

isComplete는 requiredInfo 항목이 모두 수집됐을 때만 true.
```

### 5.2 정보 수집 체크리스트

```typescript
// 에너지 시나리오
const requiredInfo = {
  energy: {
    '발전소_종류_규모': null,      // 예: "원자력 2기, 화력 5기"
    '데이터_수집_주기': null,      // 예: "100ms"
    '경보_우선순위': null          // 예: "위험 > 경고 > 주의"
  },
  manufacturing: {
    'CCTV_채널_수': null,          // 예: "16채널"
    '분할_레이아웃': null,         // 예: "16분할"
    '객체_인식_대상': null         // 예: "헬멧, 안전조끼"
  },
  smartcity: {
    'GIS_마커_우선순위': null,     // 예: "화재 > 침수 > 교통"
    '재난_단계_모드': null,        // 예: "5단계"
    '공공_데이터_소스': null       // 예: "기상청, 소방청"
  }
}

// 모든 항목이 null이 아니면 isComplete = true
```

### 5.3 대화 흐름

```
1단계: 첫 메시지 수신
→ AI: 환영 + 첫 번째 질문 1~2개
→ Blueprint: Project Info 섹션 작성 시작

2단계: 답변 수신마다
→ collectedInfo 업데이트
→ Blueprint: Requirements 섹션 실시간 추가
→ 다음 질문 또는 추가 확인 질문

3단계: 필수 정보 50% 수집
→ Blueprint: Widgets 섹션 초안 작성 시작

4단계: 필수 정보 100% 수집
→ AI: "설계를 확정하겠습니다. 잠시만요..."
→ Blueprint: 전체 섹션 완성
→ isComplete: true
→ Create Harness 버튼 활성화

```

---

## 6. Create Harness 버튼

```
상태:
- 비활성: isComplete === false
  → 회색, 클릭 불가, "인터뷰 진행 중..."

- 활성: isComplete === true
  → 네온 Sky Blue 글로우
  → 클릭 시 pulse 애니메이션

클릭 동작:
1. 생성된 MD 데이터를 sessionStorage에 저장
2. 로딩 애니메이션 (1.5초)
   "하네스를 생성하고 있습니다..."
3. /editor?solution=aim-guard&scenario=[id] 로 라우팅
4. 에디터에서 해당 시나리오 기반 캔버스 자동 로딩
```

---

## 7. 디자인 시스템

```
Grid: 8pt Spacing 시스템
- 패딩: 8, 16, 24, 32, 40, 48px

Colors:
- 배경: #0a0a0f
- 글라스: rgba(255,255,255,0.04)
- 보더: rgba(0,212,255,0.12)
- 에너지 칩: #00d4ff
- 제조 칩: #7c3aed
- 스마트시티 칩: #059669

Animation:
- 타이핑 효과: 30ms/글자
- thought 로딩: 3점 순차 (300ms 간격)
- 칩 hover: scale(1.02) + glow
- Create Harness 활성화: pulse 1회

Blueprint 실시간 업데이트:
- 새 내용 추가 시 하이라이트 효과 (1초)
- 배경: rgba(0,212,255,0.05) → 투명
```

---

## 8. 파일 구조

```
src/
├── app/
│   ├── home/
│   │   └── page.tsx              ← 홈 메인 페이지
│   └── api/
│       └── chat/
│           └── route.ts          ← AI 인터뷰어 API
├── components/
│   └── home/
│       ├── ScenarioChips.tsx     ← 칩 3개
│       ├── StitchInput.tsx       ← 중앙 입력창
│       ├── ChatArea.tsx          ← 대화 영역
│       ├── LiveBlueprint.tsx     ← 우측 MD 뷰어
│       └── CreateHarnessBtn.tsx  ← 하네스 생성 버튼
├── store/
│   └── homeStore.ts              ← Zustand 상태관리
│       상태: selectedScenario, messages,
│             collectedInfo, isComplete,
│             blueprintMd
└── data/
    └── scenarios.ts              ← 시나리오 데이터 (위 3개)
```

---

## 9. Zustand Store 구조

```typescript
interface HomeStore {
  // 시나리오
  selectedScenario: 'energy' | 'manufacturing' | 'smartcity' | null
  setSelectedScenario: (id: string) => void

  // 대화
  messages: Message[]
  addMessage: (message: Message) => void
  isThinking: boolean
  setIsThinking: (v: boolean) => void

  // 정보 수집
  collectedInfo: Record<string, string | null>
  updateCollectedInfo: (key: string, value: string) => void
  isComplete: boolean

  // Blueprint
  blueprintMd: string
  updateBlueprint: (section: string, content: string) => void

  // 리셋
  reset: () => void
}
```

---

## 10. Claude Code 구현 지침

```
1. scenarios.ts 먼저 생성 (데이터 파일)
2. homeStore.ts 생성 (상태 관리)
3. API route.ts 수정 (인터뷰어 시스템 프롬프트)
4. 컴포넌트 순서대로 구현
   ScenarioChips → StitchInput → ChatArea
   → LiveBlueprint → CreateHarnessBtn
5. page.tsx에서 조립
6. Gemma4(Ollama) 연동 확인
7. 전체 플로우 테스트
   칩 클릭 → 타이핑 → 전송 → AI 질문
   → 답변 → Blueprint 업데이트
   → 3회 후 Create Harness 활성화
   → 에디터 라우팅
```
