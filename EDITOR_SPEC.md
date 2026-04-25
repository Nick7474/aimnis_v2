# AIMNIS Editor — 완벽한 통합관제 제작 명세서 v1.5

## Claude Code 지침
- 이 파일은 에디터 화면 구현의 완전한 설계서
- PHASE 3 작업 시 이 파일을 기준으로 구현
- aim-guard 폴더의 실제 컴포넌트를 활용할 것
- aim-guard 코드 직접 수정 금지 → 래핑 방식으로만

---

## 1. 핵심 아키텍처

### 1.1 하이브리드 캔버스 개념

```
기존 방식 (잘못된 방식)
→ iframe으로 aim-guard 화면 불러오기
→ 수정 불가, 연동 불가

올바른 방식 (이 스펙)
→ aim-guard 컴포넌트를 AIMNIS에 직접 import
→ EditableSection으로 각 섹션 감싸기
→ 클릭 → 선택 상태 → 우측 패널 연동
→ Gemma4가 빈 공간 계산 → 위젯 자연스럽게 주입
```

### 1.2 aim-guard 컴포넌트 구조

```
aim-guard/src/
├── pages/
│   ├── Monitor.tsx        ← 메인 맵 기반 모니터링 (기본 화면)
│   ├── CctvDashboard.tsx  ← CCTV 영상 모니터링
│   ├── Events.tsx         ← 이벤트/알람 목록
│   ├── Stats.tsx          ← 통계
│   └── admin/
│       ├── Settings.tsx   ← 전체 설정
│       ├── Zones.tsx      ← 구역 관리
│       ├── Vms.tsx        ← VMS 연결
│       ├── Devices.tsx    ← 장비 관리
│       ├── Users.tsx      ← 사용자 관리
│       ├── Maps.tsx       ← 맵 설정
│       └── EventRules.tsx ← 이벤트 규칙
└── components/
    ├── AppLayout.tsx      ← 전체 레이아웃 (헤더+사이드바)
    ├── AimGuardLogo.tsx   ← 로고
    └── SeverityBadge.tsx  ← 알람 뱃지
```

---

## 2. EditableSection 래핑 구조

### 2.1 Monitor.tsx 기준 래핑 대상

```tsx
// Monitor.tsx를 감쌀 때의 섹션 구분
const EDITABLE_SECTIONS = {
  'header': {
    type: 'header',
    label: '헤더',
    description: 'AIM GUARD 로고, 타이틀, 알람 버튼 영역',
    panelType: 'brand'         // 우측 패널: 브랜드 컬러/로고/타이틀
  },
  'sidebar': {
    type: 'sidebar',
    label: '사이드바',
    description: '모니터링 시스템 메뉴 네비게이션',
    panelType: 'navigation'    // 우측 패널: 메뉴 항목/아이콘/순서
  },
  'map': {
    type: 'map',
    label: '맵 영역',
    description: 'GIS 기반 위성 지도 + 마커',
    panelType: 'gis'           // 우측 패널: GIS 설정/마커 관리/레이어
  },
  'alarm-panel': {
    type: 'alarm-panel',
    label: '알람 패널',
    description: '이벤트 피드 및 장비-CCTV 상태',
    panelType: 'alarm'         // 우측 패널: 알람 규칙/우선순위/필터
  },
  'floor-status': {
    type: 'floor-status',
    label: '플로어 상태',
    description: 'FLOOR STATUS 요약 카드',
    panelType: 'widget'        // 우측 패널: 데이터 연결/색상/크기
  }
}
```

### 2.2 EditableSection 컴포넌트

```tsx
// src/components/editor/EditableSection.tsx

interface EditableSectionProps {
  sectionId: string
  type: 'header' | 'sidebar' | 'map' | 'alarm-panel' | 'floor-status' | 'widget'
  label: string
  children: React.ReactNode
}

// 동작:
// 1. hover → 8pt 그리드 가이드라인 노출 (수정 가능 암시)
// 2. click → 파란색 보더 + selectedElement 전역 상태 업데이트
// 3. click → 플로팅 툴바 해당 요소 상단에 팝업
// 4. click → 우측 패널 해당 type에 맞는 탭으로 전환
```

### 2.3 SelectState (Zustand)

```typescript
// editorStore.ts에 추가

interface SelectedElement {
  sectionId: string
  type: string
  label: string
  panelType: string
  position: { x: number; y: number }  // 플로팅 툴바 위치
}

selectedElement: SelectedElement | null
setSelectedElement: (el: SelectedElement | null) => void
```

---

## 3. 플로팅 컨텍스트 메뉴

### 3.1 Floating Toolbar 구조

```
섹션 클릭 시 해당 요소 상단에 즉시 팝업
Framer Motion: scale(0.8)→(1), opacity(0)→(1), 150ms

툴바 버튼 구성 (type별 다름):

type: 'map'
→ [🗺️ GIS 설정] [📍 마커 추가] [🗑️ 레이어 숨김]

type: 'header'
→ [🎨 색상 변경] [🖼️ 로고 교체] [✏️ 타이틀 수정]

type: 'sidebar'
→ [➕ 메뉴 추가] [🔀 순서 변경] [👁️ 숨김 처리]

type: 'alarm-panel'
→ [🔔 규칙 설정] [🔽 우선순위] [📊 데이터 연결]

type: 'widget'
→ [📊 데이터 연결] [🎨 색상 변경] [🗑️ 삭제]
```

### 3.2 Quick Action 동작

```
[데이터 연결] 클릭
→ 우측 패널 API 매핑 탭으로 포커스 이동

[색상 변경] 클릭
→ 인라인 컬러 피커 팝업 (우측 패널 이동 없이)

[삭제] 클릭
→ 확인 다이얼로그 → 해당 위젯 제거 애니메이션

[로고 교체] 클릭
→ 파일 업로드 다이얼로그 → 즉시 반영
```

---

## 4. 우측 패널 — 다이내믹 탭 스위칭

### 4.1 panelType별 탭 구성

```
panelType: 'widget' (위젯 클릭 시)
탭1: API 매핑
  - 데이터 소스 선택 (energy-sensor/cctv/air-quality/worker-safety)
  - AI 추천 필드 목록
  - 드래그로 위젯 필드에 연결
탭2: 차트 설정
  - 차트 타입 변경
  - 색상 커스터마이징
  - 데이터 범위 설정
탭3: 레이아웃
  - 크기 조절 (w, h)
  - 위치 조정

panelType: 'map' (맵 클릭 시)
탭1: GIS 설정
  - 지도 레이어 ON/OFF
  - 마커 타입 관리
  - 줌 레벨 기본값
탭2: 마커 관리
  - CCTV 마커 위치
  - 센서 마커 위치
  - 알람 마커 스타일
탭3: 데이터 연결
  - 마커 ↔ API 바인딩

panelType: 'brand' (헤더 클릭 시)
탭1: 브랜드
  - 주 컬러 피커 → 전체 즉시 반영
  - 보조 컬러 피커
  - 로고 업로드 (PNG/SVG)
  - 폰트 선택
탭2: 타이틀
  - 시스템 명칭 수정
  - 부제목 수정
탭3: 기능 모듈
  - 위젯별 ON/OFF 토글

panelType: 'navigation' (사이드바 클릭 시)
탭1: 메뉴 구성
  - 메뉴 항목 목록 (드래그로 순서 변경)
  - 항목 추가/삭제
  - 아이콘 변경
탭2: 스타일
  - 사이드바 배경색
  - 활성 메뉴 색상

panelType: 'alarm' (알람 패널 클릭 시)
탭1: 알람 규칙
  - 심각도 기준 설정
  - 알람 필터
탭2: 데이터 연결
  - 알람 소스 API 연결
탭3: 표시 설정
  - 최대 표시 개수
  - 자동 스크롤

panelType: 'empty' (빈 캔버스 클릭 시)
탭1: 프로젝트 설정
  - 프로젝트명
  - 설명
탭2: 디자인 토큰
  - 전체 컬러 시스템
  - 타이포그래피
```

### 4.2 패널 동기화

```
중앙에서 변경 → 우측 패널 수치 즉시 업데이트
우측에서 변경 → 중앙 UI 즉시 반영

Zustand로 단일 상태 관리
→ editorStore.selectedElement
→ editorStore.designTokens
→ editorStore.widgetBindings
```

---

## 5. 스마트 그리드 인젝션

### 5.1 그리드 분석 → Gemma4 전달

```typescript
// AI 채팅에서 위젯 추가 명령 시

// 1. 현재 캔버스 레이아웃 JSON 추출
const layoutJson = {
  gridSize: 12,
  occupied: [
    { id: 'map', x: 0, y: 0, w: 9, h: 12 },
    { id: 'alarm-panel', x: 9, y: 0, w: 3, h: 8 },
    { id: 'floor-status', x: 9, y: 8, w: 3, h: 4 }
  ],
  empty: [
    { x: 0, y: 12, w: 12, h: 4 }  // 하단 빈 공간
  ]
}

// 2. Gemma4에게 전달
// "현재 레이아웃에서 에너지 차트를 추가할 최적 위치를 알려줘"
// Gemma4 응답:
// { x: 0, y: 12, w: 6, h: 4, reason: "하단 좌측 빈 공간" }

// 3. 해당 위치에 위젯 주입
// Framer Motion: opacity(0) → (1), y(20) → (0), 300ms
```

### 5.2 인젝션 애니메이션

```
새 위젯이 빈 공간으로 '스르륵' 끼어 들어가는 효과
1. 타겟 위치에 점선 보더 미리보기 (0.5초)
2. 위젯이 위에서 아래로 부드럽게 착지
3. 완료 후 파란색 보더로 선택 상태 표시
```

---

## 6. 데이터 바인딩 시뮬레이션

### 6.1 API 노드 연결 시각화

```
위젯 클릭 → 우측 패널 API 매핑 탭 활성화

좌측: Widget 필드 목록
  - currentKw
  - peakKw
  - timeSeries
  - kpi

우측: 데이터 소스 필드
  - energy-sensor: voltage, current, timestamp
  - cctv: cameraId, status, location
  - air-quality: pm25, pm10, co2
  - worker-safety: workerId, zone, ppStatus

드래그 연결:
→ 연결선이 반짝거리며 그려짐
→ 데이터가 흐르는 애니메이션 (점선 이동)
→ 연결 완료 시 위젯 데이터 Mock으로 즉시 업데이트
```

### 6.2 실시간 Mock 시뮬레이션

```
API 연결 완료 시
→ 차트 데이터가 정적 → 동적으로 전환
→ 1초마다 랜덤 변화 (실제 데이터처럼 보임)
→ "실시간 연결됨" 뱃지 표시 (녹색 점 깜박임)
```

---

## 7. 전체 레이아웃 구조

```
/editor 페이지 레이아웃

┌────────────────────────────────────────────────────────┐
│  상단 툴바: AIMNIS / AIM GUARD | 저장 | 확대 | 퍼블리시  │
├──────────┬─────────────────────────────┬───────────────┤
│          │                             │               │
│  좌측    │   중앙: aim-guard 화면       │  우측 패널    │
│  패널    │   (EditableSection 래핑)     │  (동적 탭)    │
│  280px   │   클릭 → 파란 보더           │  320px        │
│          │   hover → 그리드 가이드      │               │
│  탭1:    │   플로팅 툴바 팝업           │  선택 없음:   │
│  AI 채팅  │                             │  → 프로젝트   │
│          │                             │    설정       │
│  탭2:    │                             │               │
│  페이지  │                             │  헤더 클릭:   │
│  목록    │                             │  → 브랜드 탭  │
│          │                             │               │
│  탭3:    │                             │  맵 클릭:     │
│  위젯    │                             │  → GIS 탭     │
│  라이브  │                             │               │
│  러리    │                             │  위젯 클릭:   │
│  (v1.1)  │                             │  → API 매핑탭 │
│          │                             │               │
└──────────┴─────────────────────────────┴───────────────┘
```

---

## 8. 파일 구조

```
src/
├── components/
│   └── editor/
│       ├── EditableSection.tsx      ← 래핑 컴포넌트
│       ├── FloatingToolbar.tsx      ← 플로팅 툴바
│       ├── SmartGridEngine.tsx      ← 그리드 분석 엔진
│       └── panels/
│           ├── DynamicPanel.tsx     ← 패널 스위처 (메인)
│           ├── WidgetPanel.tsx      ← 위젯 API 매핑
│           ├── MapPanel.tsx         ← GIS 설정
│           ├── BrandPanel.tsx       ← 브랜드/컬러
│           ├── NavigationPanel.tsx  ← 사이드바 메뉴
│           ├── AlarmPanel.tsx       ← 알람 규칙
│           └── ProjectPanel.tsx     ← 프로젝트 설정
├── guard-app/
│   └── (aim-guard 컴포넌트 통합본)
│       ├── pages/
│       │   ├── MonitorWrapper.tsx   ← Monitor.tsx + EditableSection
│       │   ├── CctvWrapper.tsx
│       │   └── ...
└── store/
    └── editorStore.ts               ← selectedElement 상태 추가
```

---

## 9. Claude Code 구현 순서

```
STEP 1. EditableSection.tsx 구현
  → hover 효과 (그리드 가이드라인)
  → click 효과 (파란 보더)
  → selectedElement 상태 업데이트

STEP 2. MonitorWrapper.tsx 구현
  → aim-guard/Monitor.tsx import
  → 각 섹션을 EditableSection으로 감싸기
  → header / sidebar / map / alarm-panel / floor-status

STEP 3. FloatingToolbar.tsx 구현
  → Framer Motion 팝업 애니메이션
  → type별 버튼 구성
  → Quick Action 연결

STEP 4. DynamicPanel.tsx 구현
  → selectedElement.panelType에 따라 패널 전환
  → 각 패널 컴포넌트 연결

STEP 5. SmartGridEngine.tsx 구현
  → 현재 레이아웃 JSON 추출
  → Gemma4에 전달
  → 응답 좌표로 위젯 인젝션 애니메이션

STEP 6. 데이터 바인딩 시뮬레이션
  → 드래그 연결선
  → Mock 실시간 데이터
  → 연결됨 뱃지

STEP 7. 전체 동기화 테스트
  → 중앙 변경 → 우측 반영
  → 우측 변경 → 중앙 반영
  → AI 채팅 → 위젯 인젝션
```

---

## 10. 디자인 기준

```
선택 상태 보더: 2px solid #00d4ff
hover 그리드: rgba(0,212,255,0.1) 점선
플로팅 툴바:
  - 배경: rgba(15,15,25,0.95) + blur(20px)
  - 보더: rgba(0,212,255,0.2)
  - 버튼 간격: 8px
  - 높이: 36px
인젝션 애니메이션:
  - 타겟 점선: rgba(0,212,255,0.3) 1px dashed
  - 착지 효과: y(20)→(0) + opacity(0)→(1) 300ms spring
실시간 연결 뱃지:
  - 녹색 점 (#00ff9d) 1초 주기 깜박임
```
