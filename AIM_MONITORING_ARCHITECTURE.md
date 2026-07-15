# AIM Monitoring 별도 아키텍처 기획서

작성일: 2026-06-06
작성자: Codex
상태: 1차 구조 확정안

## 0. 목적

AIM Monitoring은 AIM GUARD를 확장해서 얹는 기능이 아니다.
별도 솔루션으로 제작하되, 사용자는 AIM GUARD와 같은 플랫폼 경험을 받아야 한다.

핵심 목표:

- AIM GUARD 기능 보호
- AIM Monitoring 별도 구현
- AI Studio 디자인 원본 활용
- 홈/Step2/에디터/프로젝트/퍼블리시 흐름 연결
- 20개 위젯 + 12그리드 + 우측 inspector 구현

## 1. 최상위 구조 원칙

```txt
guard 기존 경로 = 유지
monitoring 신규 경로 = 별도 생성
공통 플랫폼 경로 = 최소 solution 분기
```

수정 금지에 가까운 guard 영역:

```txt
src/guard-app/**
src/solutions/guard/**
src/components/editor/MonitorWrapper.tsx
src/components/editor/OverlayCanvas.tsx
src/components/editor/RightSidebarDropZone.tsx
src/components/editor/MappingCanvas.tsx
src/components/editor/panels/DynamicPanel.tsx
src/store/editorStore.ts
```

신규 Monitoring 영역:

```txt
src/solutions/monitoring/**
src/monitoring-app/**
src/components/monitoring-editor/**
src/store/monitoringEditorStore.ts
src/store/monitoringPagesStore.ts
src/data/monitoringScenarios.ts
```

## 2. route 설계

### 2.1 홈

기존:

```txt
/home
```

변경:

- `/home` 유지
- AIM Monitoring card/chip 추가
- AIM OPS card 삭제
- selectedSolution에 `monitoring` 허용

### 2.2 Step2

기존:

```txt
HomePhase2
selectedScenario
CreateHarnessBtn -> /editor?solution=guard&scenario=...
```

변경:

```txt
selectedSolution = "guard" | "monitoring" | ...
selectedScenario = "energy" | "manufacturing" | "smartcity"
CreateHarnessBtn -> /editor?solution={selectedSolution}&scenario={selectedScenario}
```

주의:

- guard 기본값은 그대로 `guard`
- monitoring 질문은 `monitoringScenarios.ts`에서 별도 관리

### 2.3 Editor

기존:

```tsx
return <EditorLayout solution={solution} template={template} widgets={widgets} />
```

변경:

```tsx
if (solution.id === "monitoring") {
  return <MonitoringEditorShell solution={solution} template={template} widgets={widgets} />;
}

return <EditorLayout solution={solution} template={template} widgets={widgets} />;
```

이 분기가 AIM GUARD 보호의 핵심이다.

### 2.4 Runtime

신규:

```txt
/monitoring
/monitoring?project={projectId}
```

목적:

- 퍼블리시된 AIM Monitoring 프로젝트 실행
- 저장된 snapshot을 읽어 Monitoring app 렌더링
- editor 기능 없이 runtime view만 제공

## 3. 파일 구조

권장 구조:

```txt
src/solutions/monitoring/
  manifest.json
  harness-schema.json
  templates/default.json
  widgets/index.json

src/data/
  monitoringScenarios.ts
  monitoringWidgetDefinitions.ts
  monitoringMockData.ts

src/store/
  monitoringEditorStore.ts
  monitoringPagesStore.ts

src/monitoring-app/
  MonitoringApp.tsx
  MonitoringLayout.tsx
  MonitoringSidebar.tsx
  MonitoringHeader.tsx
  MonitoringDashboard.tsx
  monitoring.css
  pages/
    IntegratedDashboard.tsx
    EquipmentDiagnosis.tsx
    EnvironmentDiagnosis.tsx
    WorkerSafety.tsx
    AlertsEvents.tsx
    Report.tsx
    Settings.tsx
  components/
    ...
  widgets/
    ...

src/components/monitoring-editor/
  MonitoringEditorShell.tsx
  MonitoringTopbar.tsx
  MonitoringLeftPanel.tsx
  MonitoringChatTab.tsx
  MonitoringWidgetTab.tsx
  MonitoringWidgetLibraryCard.tsx
  MonitoringAppWrapper.tsx
  MonitoringGridCanvas.tsx
  MonitoringGridItem.tsx
  MonitoringWidgetFrame.tsx
  MonitoringInspectorPanel.tsx
  MonitoringMappingCanvas.tsx
  MonitoringPageAddModal.tsx
  monitoringGridUtils.ts
```

AI Studio 원본:

```txt
AIM Monitoring/
```

원칙:

- 원본은 보존
- 본 앱 호환 코드만 `src/monitoring-app`로 포팅
- Vite entry, main.tsx, index.html은 본 앱에 직접 사용하지 않음

## 4. store 설계

### 4.1 monitoringEditorStore

```ts
interface MonitoringEditorState {
  centerView: "monitor" | "mapping";
  isFullscreen: boolean;
  showRightPanel: boolean;
  rightPanel: "settings" | "brand" | "data" | "style" | "widget" | "mapping" | "empty";

  selectedElement: MonitoringSelectedElement | null;
  selectedWidgetId: string | null;

  brand: MonitoringBrandSettings;
  sectionStyles: Record<string, Partial<MonitoringBrandSettings>>;
  systemTitle: string;

  messages: MonitoringChatMessage[];
  isStreaming: boolean;

  widgets: MonitoringGridWidget[];
  mappingSources: MonitoringMappingSource[];
  mappingEdges: MonitoringMappingEdge[];

  activePageId: string;

  setCenterView(view): void;
  setShowRightPanel(show): void;
  setSelectedElement(element): void;
  setSelectedWidget(id): void;

  addWidget(widget): void;
  updateWidgetGrid(id, grid): void;
  updateWidgetConfig(id, partial): void;
  removeWidget(id): void;
  duplicateWidget(id): void;

  addMappingSource(source): void;
  addMappingEdge(edge): void;
  removeMappingEdge(id): void;

  publishSnapshot(): MonitoringProjectSnapshot;
  hydrateFromSnapshot(snapshot): void;
}
```

localStorage key:

```txt
aimnis-monitoring-editor
```

절대 사용하지 말 것:

```txt
aimnis-editor
aimnis-guard-pages
```

### 4.2 monitoringPagesStore

```ts
interface MonitoringPage {
  id: string;
  label: string;
  icon: string;
  kind: "default" | "generated";
  routeKey: string;
  config: Record<string, unknown>;
  createdAt?: string;
}
```

localStorage key:

```txt
aimnis-monitoring-pages
```

## 5. solution manifest

신규:

```txt
src/solutions/monitoring/manifest.json
```

초안:

```json
{
  "id": "monitoring",
  "name": "AIM Monitoring",
  "version": "1.0.0",
  "description": "AIoT 복합 계측 기반 산업 설비·환경·작업자 안전 모니터링 솔루션",
  "category": "monitoring",
  "icon": "Activity",
  "color": "#2563eb",
  "route": "/monitoring",
  "status": "available",
  "pricing": {
    "monthly": 3900000,
    "currency": "KRW"
  },
  "features": [
    "복합 계측 센서 통합 모니터링",
    "초음파·진동·열·가스 기반 설비 진단",
    "SpO2·IMU 기반 작업자 안전 진단",
    "AI 이상탐지 및 예지보전",
    "SOP 자동 실행 및 리포트"
  ],
  "defaultTemplate": "templates/default.json",
  "widgetRegistry": "widgets/index.json",
  "harnessSchema": "harness-schema.json",
  "dataConnectors": [
    "ultrasonic",
    "vibration",
    "thermal",
    "gas",
    "worker-bio",
    "imu",
    "ai-diagnosis",
    "sop-events"
  ]
}
```

## 6. Home/Step2 데이터 모델

신규:

```txt
src/data/monitoringScenarios.ts
```

시나리오 유지 판단:

기존 3개 시나리오:

- 에너지 시설 통합 관제
- 스마트 제조 이상 감지
- 스마트시티 안전 관제

판단:

- 유지 가능
- 단, 질문과 defaultSpecs는 AIM Monitoring 관점으로 전면 재작성

예:

에너지 시설 통합 관제:

- 발전/ESS/전력 설비의 주요 진단 대상은 무엇인가?
- 초음파/진동/열/가스 중 우선 적용 센서는 무엇인가?
- 고장 미검출을 줄이기 위해 F2 중심으로 운영할 것인가?

스마트 제조 이상 감지:

- 회전기기, 펌프, 팬, 모터 중 우선 대상은 무엇인가?
- FFT 1X/2X/3X 분석이 필요한 설비가 있는가?
- 예지보전 리포트와 MES/설비관리 연동이 필요한가?

스마트시티 안전 관제:

- 지하/공공/환경 시설의 유해가스·온도·작업자 안전 중 우선순위는?
- 현장 작업자 쓰러짐 감지와 긴급 알림이 필요한가?
- 모바일/관제실/원격 서버 중 어떤 채널로 알림을 보낼 것인가?

## 7. AI Studio 포팅 전략

현재 원본:

```txt
AIM Monitoring/src/App.tsx
AIM Monitoring/src/components/*
AIM Monitoring/src/pages/*
AIM Monitoring/src/index.css
```

포팅 원칙:

- `App.tsx`의 currentPage state는 `MonitoringApp`로 이전
- `Sidebar`, `Header`는 `MonitoringSidebar`, `MonitoringHeader`로 이름 충돌 없이 이전 가능
- CSS는 global import 대신 scoped class 또는 monitoring.css로 정리
- 외부 이미지 URL은 로컬 자산 여부 확인 후 교체
- React 19 전용 문법이 있으면 React 18 호환으로 수정
- Recharts 3 차이가 있으면 Recharts 2 기준으로 조정

## 8. editor shell 구성

```txt
MonitoringEditorShell
  MonitoringTopbar
  MonitoringLeftPanel
    MonitoringChatTab
    MonitoringWidgetTab
  center
    MonitoringAppWrapper
      MonitoringApp
      MonitoringGridCanvas
    MonitoringMappingCanvas
  MonitoringInspectorPanel
```

좌측 패널:

- 편집 모드 아닐 때 전체 표시
- 우측 패널 열릴 때 기존 AIM GUARD처럼 좌측으로 슬라이드
- 최소/최대 폭은 guard editor와 유사

중앙:

- AI Studio 앱이 기본 배경/컨텐츠
- grid canvas는 content 영역 위에 편집 가능한 레이어로 동작
- 기존 AI Studio 카드도 향후 widget entity로 승격 가능

우측:

- 선택 요소가 없으면 settings
- 섹션 선택 시 section inspector
- 위젯 선택 시 widget inspector
- mapping view에서는 mapping inspector

## 9. API 설계

기존:

```txt
src/app/api/chat/route.ts
src/app/api/home/route.ts
src/app/api/interview/route.ts
```

선택지:

1. 기존 API에 `solution` 분기 추가
2. monitoring 전용 API route 추가

권장:

- home/interview는 기존 route에 solution 분기 추가
- editor chat은 `solution=monitoring` 분기를 추가하되, 위젯 타입 registry를 별도 파일에서 가져오게 한다.
- API route 자체는 공통이지만, prompt/data는 monitoring 전용으로 분리한다.

신규 데이터:

```txt
src/data/monitoringPrompts.ts
src/data/monitoringWidgetDefinitions.ts
```

## 10. projectStore 확장

현재 projectStore는 flexible object를 일부 받고 있지만 타입 주석은 guard/eco 중심이다.

확장 방향:

```ts
type SolutionId = "guard" | "monitoring" | "eco" | string;

interface PublishedProject {
  solution: SolutionId;
  monitoringSnapshot?: MonitoringProjectSnapshot;
}
```

주의:

- 기존 저장된 guard project를 깨면 안 된다.
- optional field로 확장한다.
- migration이 필요하면 read 단계에서 fallback한다.

## 11. 구현 순서

Phase 0. 문서/감사:

- AIM GUARD 기능 감사
- 회귀 체크리스트
- AI Studio 산출물 감사
- 위젯 spec
- grid spec
- architecture spec

Phase 1. 플랫폼 등록:

- `src/solutions/monitoring`
- marketplace 등록
- Home 카드/칩
- AIM OPS 제거
- CreateHarnessBtn solution 분기

Phase 2. Step2:

- monitoringScenarios
- monitoring 질문/Blueprint
- 전문가 추천세팅
- harness payload

Phase 3. Editor 분기:

- `/editor?solution=monitoring`
- MonitoringEditorShell
- monitoring store
- topbar/left/right layout

Phase 4. AI Studio 포팅:

- `src/monitoring-app`
- 화면/페이지/컴포넌트 이전
- 본 앱 build 검증

Phase 5. Widget/Grid:

- widget definitions
- widget tab
- grid canvas
- drag/drop/resize
- inspector

Phase 6. 기능 동등성:

- chat
- mapping
- page add
- publish
- project runtime

Phase 7. QA:

- AIM GUARD 회귀
- AIM Monitoring 전체 플로우
- build/lint
- viewport QA

## 12. 주요 위험과 대응

| 위험 | 설명 | 대응 |
|---|---|---|
| guard 오염 | 기존 editorStore/EditorLayout 직접 수정 | monitoring shell/store 분리 |
| AI Studio 호환성 | React/Tailwind/Recharts 버전 차이 | 원본 보존 후 본 앱 기준 포팅 |
| grid 복잡도 | drag/resize/collision이 어려움 | 직접 grid util + dnd-kit 최소 사용 |
| 위젯 품질 저하 | 20개가 단순 카드가 될 위험 | widget spec 기반 density 설계 |
| project 저장 누락 | 재실행 시 layout 소실 | monitoringSnapshot 정의 |
| Step2 혼선 | guard 질문과 monitoring 질문 섞임 | monitoringScenarios 분리 |
| 일정 압박 | 빠른 구현으로 회귀 발생 | 문서 게이트 후 구현 |

## 13. 결론

AIM Monitoring은 다음 구조로 가야 한다.

```txt
Home 공통 플랫폼
  -> selectedSolution monitoring
  -> Monitoring Step2
  -> /editor?solution=monitoring
  -> MonitoringEditorShell
  -> AI Studio Monitoring App
  -> 20 Widget Library
  -> 12 Grid Canvas
  -> Monitoring Inspector
  -> Publish Snapshot
  -> /monitoring runtime
```

이 구조라면 AIM GUARD를 보존하면서도 AIM Monitoring을 독립 제품으로 확장할 수 있다.
