# AIM GUARD Editor: Data Integration & Smart Swap Spec v2.3

## Claude Code 지침
- 이 파일은 에디터 고도화 2단계 설계서
- PHASE 3-D 작업 시 이 파일 기준으로 구현
- EDITOR_SPEC.md와 함께 참조
- 구현 순서: 1번(바인딩) → 2번(스왑) → 3번(Undo)
- 임의 판단 금지, 이 스펙 그대로 구현

---

## 1. 양방향 데이터 바인딩 (Two-way Binding)

### 1.1 개념

```
기존 방식 (단방향)
Settings 패널 값 변경 → 저장 버튼 → 반영

올바른 방식 (양방향)
Settings 패널 값 변경 → Zustand store 즉시 업데이트
                      → 캔버스 위젯 즉시 re-render
                      → 별도 저장/새로고침 불필요
```

### 1.2 Zustand Store 확장

```typescript
// editorStore.ts에 추가

interface WidgetProperties {
  // Gauge Widget
  value?: number
  min?: number
  max?: number
  threshold?: number
  themeColor?: string

  // CCTV Widget
  streamUrl?: string
  channelId?: string
  ptzControl?: boolean

  // Chart Widget
  dataSource?: string
  refreshInterval?: number
  title?: string

  // 공통
  label?: string
  visible?: boolean
}

interface ActiveWidget {
  id: string
  type: string
  properties: WidgetProperties
}

// Store 액션 추가
activeWidgets: ActiveWidget[]
updateWidgetProperty: (id: string, key: string, value: any) => void
// → 즉시 해당 위젯 re-render 트리거

// Global Config
systemTitle: string           // 헤더 시스템 명칭
setSystemTitle: (v: string) => void
// → GNB 전체 즉시 동기화

// Undo/Redo 히스토리
history: EditorState[]
historyIndex: number
pushHistory: (state: EditorState) => void
undo: () => void
redo: () => void
```

### 1.3 위젯별 바인딩 로직

```typescript
// Gauge Widget 바인딩
{
  id: 'gauge-001',
  type: 'gauge',
  properties: {
    value: 73,           // 우측 패널 슬라이더 → 즉시 게이지 값 변경
    min: 0,
    max: 100,
    threshold: 80,       // 임계값 초과 시 빨간색 자동 전환
    themeColor: '#00d4ff'
  }
}

// Chart Widget 바인딩
{
  id: 'chart-001',
  type: 'chart-line',
  properties: {
    dataSource: 'energy-sensor', // 드롭다운 변경 → 차트 데이터 즉시 교체
    refreshInterval: 1000,       // 슬라이더 → 갱신 주기 즉시 변경
    themeColor: '#7c3aed',
    title: '실시간 에너지'        // 인풋 수정 → 위젯 타이틀 즉시 변경
  }
}

// CCTV Widget 바인딩
{
  id: 'cctv-001',
  type: 'cctv',
  properties: {
    streamUrl: 'rtsp://...',
    channelId: 'CAM-A-01',
    ptzControl: true             // 토글 → PTZ 컨트롤 버튼 즉시 표시/숨김
  }
}
```

### 1.4 Settings 패널 컴포넌트 수정

```
우측 패널 세팅 탭의 모든 입력 요소에
onChange 즉시 반영 적용:

Input (텍스트)
→ onChange: updateWidgetProperty(id, 'title', value)

Slider (숫자)
→ onValueChange: updateWidgetProperty(id, 'value', value)

Toggle (불리언)
→ onCheckedChange: updateWidgetProperty(id, 'ptzControl', checked)

ColorPicker (색상)
→ onChange: updateWidgetProperty(id, 'themeColor', color)
   + CSS 변수 즉시 전체 반영

시스템 타이틀 Input
→ onChange: setSystemTitle(value)
   + GNB 헤더 텍스트 즉시 동기화
```

---

## 2. 스마트 드래그 앤 드롭 스왑

### 2.1 교체 대상

```
현재 우측 패널 (Target - 3개)
├── 알람 패널 (Alarm Panel)
├── 장비 상태 (Equipment Status)
└── CCTV 상태 (CCTV Status)

새로운 위젯 4종 (Source - 시나리오별)
에너지 시나리오:
├── 에너지 효율 카드
├── 발전량 실시간 차트
├── 설비 압력/온도 게이지
└── 이벤트 로그

제조 시나리오:
├── 인력 안전 현황
├── CCTV 채널 그리드
├── 환경 센서 (공기질)
└── 작업 이벤트 로그

스마트시티 시나리오:
├── GIS 재난 현황
├── 수위 센서 차트
├── 화재 감지 상태
└── 비상 대응 로그
```

### 2.2 드래그 앤 드롭 구현

```typescript
// dnd-kit 사용
// npm install @dnd-kit/core @dnd-kit/sortable

// DraggableWidget: 좌측 위젯 라이브러리의 카드
// DropZone: 우측 사이드바 컨테이너

// 드래그 진입 감지
onDragOver: (event) => {
  if (event.over?.id === 'right-sidebar-dropzone') {
    // 우측 사이드바 하이라이트
    // rgba(0,212,255,0.15) 오버레이
    // "여기에 드롭하여 교체" 텍스트 표시
  }
}

// 드롭 처리
onDrop: (event) => {
  event.preventDefault()
  // 히스토리 저장 (Undo 대비)
  pushHistory(currentState)
  // 스왑 실행
  swapRightPanel(newFourWidgets)
}
```

### 2.3 스왑 로직

```typescript
// editorStore.ts

swapRightPanel: (newWidgets: Widget[]) => {
  set((state) => {
    // 1. 기존 3개 위젯 ID 배열에서 제거
    const filtered = state.rightPanelWidgets.filter(
      w => !['alarm', 'equipment', 'cctv'].includes(w.type)
    )

    // 2. 새로운 4개 위젯 높이 자동 계산
    const autoHeight = 'calc(100% / 4)'
    const newWithLayout = newWidgets.map(w => ({
      ...w,
      height: autoHeight
    }))

    // 3. 상태 업데이트 → 애니메이션 트리거
    return {
      rightPanelWidgets: [...filtered, ...newWithLayout],
      swapAnimating: true
    }
  })
}
```

### 2.4 Framer Motion 애니메이션

```typescript
// Exit (기존 3개 패널 퇴장)
<AnimatePresence>
  {oldWidgets.map(widget => (
    <motion.div
      key={widget.id}
      exit={{
        x: 100,           // 우측으로 슬라이드 아웃
        opacity: 0,
        transition: { duration: 0.3 }
      }}
    />
  ))}
</AnimatePresence>

// Enter (새로운 4개 카드 순차 등장)
{newWidgets.map((widget, index) => (
  <motion.div
    key={widget.id}
    initial={{ y: -30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{
      duration: 0.3,
      delay: index * 0.08,   // 0, 0.08, 0.16, 0.24s 순차
      type: 'spring',
      stiffness: 300
    }}
  />
))}

// DropZone 하이라이트
<motion.div
  animate={{
    borderColor: isDraggingOver
      ? 'rgba(0,212,255,0.6)'
      : 'rgba(0,212,255,0.12)',
    backgroundColor: isDraggingOver
      ? 'rgba(0,212,255,0.08)'
      : 'transparent'
  }}
  transition={{ duration: 0.15 }}
/>
```

---

## 3. Undo / Redo

### 3.1 히스토리 스택

```typescript
// editorStore.ts

interface EditorSnapshot {
  overlayWidgets: OverlayWidget[]
  rightPanelWidgets: Widget[]
  designTokens: DesignTokens
  timestamp: number
}

history: EditorSnapshot[]        // 최대 20개
historyIndex: number              // 현재 위치

pushHistory: (snapshot) => {
  // historyIndex 이후 기록 삭제 (새 분기)
  // snapshot 추가
  // 20개 초과 시 가장 오래된 것 삭제
}

undo: () => {
  if (historyIndex > 0) {
    historyIndex -= 1
    // history[historyIndex] 상태로 복원
  }
}

redo: () => {
  if (historyIndex < history.length - 1) {
    historyIndex += 1
    // history[historyIndex] 상태로 복원
  }
}
```

### 3.2 Undo 트리거 시점

```
변경 시 히스토리 저장:
→ 위젯 추가/삭제
→ 드래그 앤 드롭 스왑
→ API 바인딩 연결/해제
→ 컬러/폰트 변경
→ 페이지 추가/삭제

저장 안 하는 것 (너무 잦음):
→ 슬라이더 드래그 중
→ 텍스트 입력 중 (blur 시에만 저장)
```

### 3.3 UI

```
상단 툴바에 추가:
← Undo (Cmd+Z)
→ Redo (Cmd+Shift+Z)

비활성 상태: opacity 0.3
활성 상태: opacity 1.0
```

---

## 4. 파일 구조

```
src/
├── components/
│   └── editor/
│       ├── DraggableWidget.tsx    ← 드래그 가능한 위젯 카드
│       ├── RightSidebarDropZone.tsx ← 드롭 타겟
│       └── panels/
│           └── SettingsPanel.tsx  ← 양방향 바인딩 적용
├── store/
│   └── editorStore.ts            ← 확장 (위 스펙 기준)
└── hooks/
    └── useEditorHistory.ts       ← Undo/Redo 훅
```

---

## 5. Claude Code 구현 순서

```
STEP 1 — 양방향 바인딩 (3~4일)
1. editorStore.ts에 activeWidgets, updateWidgetProperty 추가
2. SettingsPanel.tsx 모든 입력에 onChange 즉시 반영
3. OverlayCanvas.tsx 위젯이 properties 변경 감지하여 re-render
4. GNB 헤더 systemTitle 동기화 테스트

STEP 2 — 드래그 앤 드롭 스왑 (1주)
1. npm install @dnd-kit/core @dnd-kit/sortable
2. DraggableWidget.tsx 구현
3. RightSidebarDropZone.tsx 구현
4. swapRightPanel 로직 구현
5. Framer Motion Exit/Enter 애니메이션

STEP 3 — Undo/Redo (3~4일)
1. EditorSnapshot 타입 정의
2. pushHistory / undo / redo 액션 구현
3. 상단 툴바 버튼 추가
4. Cmd+Z / Cmd+Shift+Z 단축키 연결
5. 전체 테스트
```

---

## 6. 테스트 시나리오

```
양방향 바인딩 테스트:
1. KPI 카드 클릭 → 우측 패널 값 변경
2. 슬라이더로 value 조정 → 위젯 즉시 변경 확인
3. 색상 변경 → 전체 즉시 반영 확인
4. 시스템 타이틀 수정 → GNB 즉시 변경 확인

스왑 테스트:
1. 좌측 위젯 라이브러리에서 카드 4개 선택
2. 우측 사이드바로 드래그
3. 하이라이트 확인
4. 드롭 → 기존 3개 슬라이드 아웃
5. 새 4개 Staggered Fall 입장 확인
6. Auto-layout calc(100%/4) 확인

Undo 테스트:
1. 스왑 후 Cmd+Z
2. 기존 3개 패널 복원 확인
3. Cmd+Shift+Z 로 다시 스왑 확인
```
