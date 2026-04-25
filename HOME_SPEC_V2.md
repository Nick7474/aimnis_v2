# AIMNIS Home — Interactive Spec Board v2.0

## Claude Code 지침
- 이 파일이 HOME_SPEC.md를 완전히 대체
- PHASE 2 작업 시 이 파일 기준으로 구현
- HOME_SPEC.md는 참조 금지
- 구현 순서: 레이아웃 → SpecBoard → Magic Default → MD 바인딩 → Create Harness
- 임의 판단 금지, 이 스펙 그대로 구현

---

## 1. 핵심 UX 철학

```
기존 방식 (AI 채팅)
→ AI가 질문 → 사용자가 타이핑 → AI 응답 대기
→ 느리고 불확실

새로운 방식 (전문가 답지 체크)
→ 미리 정의된 전문가 옵션이 즉시 펼쳐짐
→ 칩 클릭 → 우측 MD 실시간 채워짐
→ 빠르고 명확하고 압도적
```

**데모 멘트**
"Gemma 4가 질문을 던지기 전에,
제가 이미 설계의 핵심 축을 먼저 정의하겠습니다."

---

## 2. 레이아웃 구조

```
/home 전체 레이아웃

┌─────────────────────────────────────────────────────────┐
│                    상단 Navbar                            │
│  AIMNIS [Enterprise]  홈 | 에디터 | 프로젝트 | AIM GUARD  │
├──────────────────┬──────────────────────────────────────┤
│                  │                                       │
│  좌측 30%        │  우측 70%                              │
│                  │                                       │
│  AI 채팅 영역    │  Spec Board                            │
│  (보조 역할)     │  (메인 역할)                            │
│                  │                                       │
│  - 시나리오 칩   │  - 6대 카테고리 카드                    │
│  - 채팅 입력창   │  - 선택 칩들                            │
│  - AI 응답       │  - Live Blueprint MD                   │
│                  │  - 진행률 표시                          │
│                  │  - Create Harness 버튼                 │
│                  │                                       │
└──────────────────┴──────────────────────────────────────┘
```

---

## 3. 시나리오 칩 (좌측 상단)

```tsx
const scenarios = [
  {
    id: 'energy',
    label: '국가 에너지 관제',
    subLabel: 'KEPCO',
    icon: 'Zap',
    color: '#00d4ff',
    defaultSpecs: {
      scale: 'MW급 거점',
      data: 'IoT 센서',
      ai: '이상 징후',
      ui: 'Isometric Map',
      infra: '전용 폐쇄망',
      protocol: '자동 차단'
    }
  },
  {
    id: 'manufacturing',
    label: '하이테크 제조 관제',
    subLabel: '대기업',
    icon: 'Factory',
    color: '#7c3aed',
    defaultSpecs: {
      scale: '공장 전체',
      data: 'Vision AI',
      ai: '안전구 미착용',
      ui: 'Multi-Grid View',
      infra: 'Private 5G',
      protocol: '라인 정지'
    }
  },
  {
    id: 'smartcity',
    label: '스마트시티 재난 대응',
    subLabel: '지자체',
    icon: 'Building2',
    color: '#059669',
    defaultSpecs: {
      scale: '시 전체',
      data: 'GIS 연동',
      ai: '재난 분류',
      ui: 'GIS 위치 맵',
      infra: '광대역 자가망',
      protocol: '유관기관 전파'
    }
  }
]

// 클릭: 시나리오 선택 → SpecBoard 해당 칩들 활성화
// 더블클릭 or 길게 누름(500ms): Magic Default 즉시 실행 → Create Harness 활성화
```

---

## 4. SpecBoard 컴포넌트 (우측 메인)

### 4.1 6대 카테고리 구성

```tsx
const specCategories = [
  {
    id: 'scale',
    label: '01. 운영 규모',
    icon: 'BarChart3',
    required: true,   // 필수 항목
    options: {
      energy:        ['GW급 국가망', 'MW급 거점', '변전소/ESS'],
      manufacturing: ['라인 단위', '공장 전체', 'Global HQ'],
      smartcity:     ['동/구 단위', '시 전체', '광역 통합']
    }
  },
  {
    id: 'data',
    label: '02. 데이터 수집',
    icon: 'Database',
    required: true,   // 필수 항목
    options: {
      energy:        ['IoT 센서', 'SCADA 연동', '예측 데이터'],
      manufacturing: ['Vision AI', 'PLC 연동', 'Edge 기기'],
      smartcity:     ['복합 센서', 'GIS 연동', '공공 데이터']
    }
  },
  {
    id: 'ai',
    label: '03. AI 지능 분석',
    icon: 'Brain',
    required: false,
    options: {
      energy:        ['부하 예측', '이상 징후', '수명 진단'],
      manufacturing: ['안전구 미착용', '침입 탐지', '공정 이상'],
      smartcity:     ['재난 분류', '인파 밀집', '침수 분석']
    }
  },
  {
    id: 'ui',
    label: '04. 시각화 UI',
    icon: 'Monitor',
    required: false,
    options: {
      energy:        ['Isometric Map', '게이지 대시보드', 'Multi-Grid View'],
      manufacturing: ['Multi-Grid View', '3D Digital Twin', 'GIS 위치 맵'],
      smartcity:     ['GIS 위치 맵', 'SOP 상황판', 'Isometric Map']
    }
  },
  {
    id: 'infra',
    label: '05. 인프라망',
    icon: 'Network',
    required: false,
    options: {
      energy:        ['전용 폐쇄망', 'LTE-M', '위성 통신'],
      manufacturing: ['Private 5G', '고속 유선망', 'WiFi 6E'],
      smartcity:     ['공공 WiFi', 'LPWA', '광대역 자가망']
    }
  },
  {
    id: 'protocol',
    label: '06. 대응 프로토콜',
    icon: 'AlertTriangle',
    required: false,
    options: {
      energy:        ['자동 차단', '현장 출동', '원격 제어'],
      manufacturing: ['라인 정지', '관리자 호출', '경보 방송'],
      smartcity:     ['유관기관 전파', '대시민 재난문자', '현장 출동']
    }
  }
]
```

### 4.2 Selection Chip 스타일

```css
/* 기본 상태 */
.spec-chip {
  border: 1px solid #333;
  background: transparent;
  color: #7da8c0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

/* 선택 상태 */
.spec-chip.selected {
  border: 1px solid #00d4ff;
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
}

/* 호버 상태 */
.spec-chip:hover {
  border-color: rgba(0, 212, 255, 0.4);
  color: #f0f9ff;
}
```

### 4.3 진행률 표시 (상단)

```
필수 항목 완료 여부 표시:

운영규모 [✅] 데이터수집 [✅] AI분석 [⬜] UI [⬜] 인프라 [⬜] 프로토콜 [⬜]

2 / 6 항목 선택됨

필수(운영규모, 데이터수집) 완료 시
→ Create Harness 버튼 글로우 활성화
```

---

## 5. Magic Default 기능

### 5.1 ✨ Magic Setup 버튼

```
위치: 스펙보드 우측 상단
아이콘: ✨ (Sparkles)
레이블: "Magic Setup"

클릭 동작:
1. 현재 선택된 시나리오의 defaultSpecs 로드
2. Stagger Animation으로 칩 순차 선택
   - 카테고리별 0.1초 간격
   - 칩 선택 시 반짝임 효과
3. MD Blueprint 실시간 채워짐
4. Create Harness 버튼 활성화
```

### 5.2 Stagger Animation

```typescript
// Framer Motion staggerChildren

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1  // 카테고리별 0.1초 간격
    }
  }
}

const chipVariants = {
  hidden: { scale: 1, borderColor: '#333' },
  visible: {
    scale: [1, 1.05, 1],           // 살짝 커졌다 돌아옴
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    transition: { duration: 0.3 }
  }
}
```

### 5.3 One-Click 경로 (더블클릭/길게 누름)

```typescript
// 시나리오 칩 더블클릭 or 500ms 길게 누름

onDoubleClick || onLongPress(500ms): {
  1. Magic Default 즉시 실행 (애니메이션 생략)
  2. 모든 필수 칩 즉시 선택
  3. MD 즉시 완성
  4. Create Harness 버튼 즉시 활성화
  5. 0.5초 후 자동으로 에디터 진입 준비 상태
}
```

---

## 6. Live Blueprint MD 바인딩

### 6.1 실시간 MD 업데이트

```typescript
// Zustand store
interface HomeStore {
  selectedScenario: 'energy' | 'manufacturing' | 'smartcity' | null
  selectedSpecs: {
    scale: string | null
    data: string | null
    ai: string | null
    ui: string | null
    infra: string | null
    protocol: string | null
  }
  blueprintMd: string
  updateSpec: (category: string, value: string) => void
  applyMagicDefault: () => void
  isComplete: boolean  // scale + data 모두 선택 시 true
}

// MD 생성 (Template literal)
const generateMd = (specs, scenario) => `
# ${scenarioLabels[scenario]} 아키텍처 설계서

## 프로젝트 정보
- 도메인: ${scenarioLabels[scenario]}
- 생성일: ${new Date().toLocaleDateString('ko-KR')}
- 상태: ${specs.scale && specs.data ? '설계 확정' : '설계 중...'}

## 운영 규모
${specs.scale ? `- ✅ ${specs.scale}` : '- ⬜ 선택 대기 중...'}

## 데이터 수집
${specs.data ? `- ✅ ${specs.data}` : '- ⬜ 선택 대기 중...'}

## AI 지능 분석
${specs.ai ? `- ✅ ${specs.ai}` : '- ⬜ 선택 대기 중...'}

## 시각화 UI
${specs.ui ? `- ✅ ${specs.ui}` : '- ⬜ 선택 대기 중...'}

## 인프라망
${specs.infra ? `- ✅ ${specs.infra}` : '- ⬜ 선택 대기 중...'}

## 대응 프로토콜
${specs.protocol ? `- ✅ ${specs.protocol}` : '- ⬜ 선택 대기 중...'}

## Widgets
${specs.ui ? generateWidgets(specs) : '- 시각화 UI 선택 후 자동 생성'}

## API Mapping
${specs.data ? generateApiMapping(specs) : '- 데이터 수집 선택 후 자동 생성'}
`
```

### 6.2 Blueprint 패널 스타일

```
우측 하단 영역
- 배경: rgba(0,0,0,0.4) 다크 글라스
- 상단: "energy_control.md" 파일명 + LIVE 뱃지
- 내용: MD 텍스트 실시간 타이핑 효과
- 칩 선택 시: 해당 섹션 1초 하이라이트
  rgba(0,212,255,0.1) → transparent
```

---

## 7. Create Harness 버튼

```
비활성 상태 (scale 또는 data 미선택):
- 색상: #333
- 텍스트: "운영 규모와 데이터 수집을 선택해주세요"
- 클릭 불가

활성 상태 (scale + data 모두 선택):
- 글로우 애니메이션: 0 0 20px rgba(0,212,255,0.5)
- 텍스트: "Create Harness →"
- pulse 애니메이션 1회

클릭 동작:
1. 생성된 MD를 sessionStorage에 저장
2. 로딩 애니메이션 1.5초
   "하네스를 생성하고 있습니다..."
3. /editor?solution=aim-guard&scenario=[id] 라우팅
```

---

## 8. Adaptive UI (조건부 표시)

```
시나리오 미선택 상태:
→ SpecBoard: "시나리오를 선택하면 전문가 옵션이 펼쳐집니다"
→ 카테고리 카드: 흐릿하게 (opacity: 0.3)

시나리오 선택 후:
→ 카테고리 카드: Framer Motion으로 순차 등장
   stagger: 0.05초 간격
→ 해당 시나리오 옵션 칩들 표시

운영규모 + 데이터수집 선택 후:
→ 나머지 4개 카테고리 강조
→ Create Harness 버튼 활성화
→ "선택을 완료하거나 바로 하네스를 만들 수 있습니다" 안내
```

---

## 9. 파일 구조

```
src/
├── app/
│   └── home/
│       └── page.tsx                  ← 홈 메인 (레이아웃)
├── components/
│   └── home/
│       ├── ScenarioChips.tsx         ← 좌측 시나리오 칩 3개
│       ├── SpecBoard.tsx             ← 우측 메인 스펙 보드
│       ├── SpecCategory.tsx          ← 카테고리 카드 컴포넌트
│       ├── SpecChip.tsx              ← 선택 칩 컴포넌트
│       ├── MagicSetupButton.tsx      ← ✨ Magic Setup 버튼
│       ├── LiveBlueprint.tsx         ← MD 실시간 뷰어
│       ├── ProgressBar.tsx           ← 진행률 표시
│       └── CreateHarnessButton.tsx   ← 최종 트리거 버튼
├── store/
│   └── homeStore.ts                  ← selectedSpecs, blueprintMd 등
└── data/
    └── scenarios.ts                  ← 시나리오 + 카테고리 데이터
```

---

## 10. Zustand Store 구조

```typescript
interface HomeStore {
  // 시나리오
  selectedScenario: 'energy' | 'manufacturing' | 'smartcity' | null
  setSelectedScenario: (id: string) => void

  // 스펙 선택
  selectedSpecs: Record<string, string | null>
  updateSpec: (category: string, value: string) => void
  clearSpecs: () => void

  // Magic Default
  applyMagicDefault: () => void
  isMagicAnimating: boolean

  // Blueprint
  blueprintMd: string

  // 완료 여부
  isComplete: boolean  // scale + data 선택 시 true

  // 리셋
  reset: () => void
}
```

---

## 11. Claude Code 구현 순서

```
STEP 1. 데이터 파일 (scenarios.ts)
  → 3개 시나리오 + 6대 카테고리 + 옵션 데이터
  → defaultSpecs 정의

STEP 2. homeStore.ts
  → selectedSpecs, updateSpec, applyMagicDefault
  → blueprintMd 자동 생성 로직

STEP 3. SpecChip.tsx + SpecCategory.tsx
  → 칩 기본/선택 스타일
  → 클릭 → updateSpec 호출

STEP 4. SpecBoard.tsx
  → 6대 카테고리 카드 배치
  → 시나리오 선택 시 Framer Motion 순차 등장
  → 진행률 표시

STEP 5. MagicSetupButton.tsx
  → ✨ 클릭 → applyMagicDefault
  → Stagger Animation

STEP 6. LiveBlueprint.tsx
  → blueprintMd 실시간 렌더링
  → 칩 선택 시 해당 섹션 하이라이트

STEP 7. CreateHarnessButton.tsx
  → isComplete 기반 활성화
  → 글로우 애니메이션
  → 에디터 라우팅

STEP 8. page.tsx 조립
  → 좌측 30% / 우측 70% 레이아웃
  → ScenarioChips + SpecBoard 배치

STEP 9. 더블클릭/길게누름 One-Click 경로
  → onDoubleClick → applyMagicDefault → 자동 진행

STEP 10. 전체 플로우 테스트
  → 시나리오 선택 → 칩 클릭 → MD 실시간 업데이트
  → Magic Setup → Stagger 애니메이션
  → Create Harness → 에디터 이동
```

---

## 12. 디자인 기준

```
배경: #0a0a0f
좌측 패널: rgba(255,255,255,0.02) + 우측 보더
우측 패널: 투명 (배경 그대로)

카테고리 카드:
- 배경: rgba(255,255,255,0.04)
- 보더: rgba(255,255,255,0.08)
- border-radius: 12px
- padding: 16px

칩:
- 기본: border #333, color #7da8c0
- 선택: border #00d4ff, bg rgba(0,212,255,0.1), color #00d4ff
- 글로우: box-shadow 0 0 8px rgba(0,212,255,0.2)

진행률:
- 완료: #00d4ff
- 미완료: #333
- 필수: 별표(*) 표시

Create Harness (활성):
- background: linear-gradient(135deg, #00d4ff, #0066ff)
- box-shadow: 0 0 20px rgba(0,212,255,0.5)
- animation: pulse 2s infinite
```
