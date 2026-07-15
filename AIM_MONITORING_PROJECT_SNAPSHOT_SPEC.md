# AIM Monitoring 프로젝트 저장/Persist Snapshot 기획서

작성일: 2026-06-06
작성자: Codex
상태: 1차 상세 기획

## 0. 목적

AIM Monitoring 에디터에서 만든 결과는 퍼블리시 후 프로젝트에 저장되어야 한다.

저장되어야 하는 것:

- AIM Monitoring 페이지 구성
- AI Studio 기반 중앙 앱 상태
- 12그리드 위젯 위치/크기
- 위젯별 설정
- 데이터 매핑
- 브랜드/스타일
- 시스템 타이틀
- 생성된 페이지
- runtime 실행에 필요한 상태

기존 AIM GUARD projectStore를 깨지 않고 optional snapshot으로 확장한다.

## 1. 기존 projectStore 상태

현재 주요 필드:

```ts
interface PublishedProject {
  id: string;
  name: string;
  solution: string;
  status: "active" | "draft" | "archived";
  client: string;
  description: string;
  versionNote?: string;
  tags: string[];
  stats: { alerts: number; uptime: string; sensors: number };
  harnessFile: string | null;
  industry: string;
  brandSnapshot?: BrandSettings;
  sectionStylesSnapshot?: unknown;
  systemTitle?: string;
  publishedAt: string;
  updatedAt: string;
  version: number;
}
```

문제:

- guard/eco 중심 주석
- Monitoring 12그리드와 widget config 저장 필드 없음
- Monitoring page/mapping snapshot 없음

원칙:

- 기존 필드를 삭제하지 않는다.
- guard project가 기존 그대로 읽히도록 한다.
- monitoring 전용 필드는 optional로 추가한다.

## 2. 확장 타입

```ts
type SolutionId = "guard" | "monitoring" | "eco" | string;

interface PublishedProject {
  id: string;
  name: string;
  solution: SolutionId;
  status: "active" | "draft" | "archived";
  client: string;
  description: string;
  versionNote?: string;
  tags: string[];
  stats: { alerts: number; uptime: string; sensors: number };
  harnessFile: string | null;
  industry: string;
  brandSnapshot?: BrandSettings;
  sectionStylesSnapshot?: unknown;
  systemTitle?: string;
  monitoringSnapshot?: MonitoringProjectSnapshot;
  publishedAt: string;
  updatedAt: string;
  version: number;
}
```

## 3. MonitoringProjectSnapshot

```ts
interface MonitoringProjectSnapshot {
  schemaVersion: "monitoring.snapshot.v1";
  solution: "monitoring";
  scenario?: "energy" | "manufacturing" | "smartcity";

  app: MonitoringAppSnapshot;
  editor: MonitoringEditorSnapshot;
  pages: MonitoringPagesSnapshot;
  widgets: MonitoringWidgetsSnapshot;
  mappings: MonitoringMappingsSnapshot;
  brand: MonitoringBrandSnapshot;
  harness?: MonitoringHarnessSnapshot;

  createdAt: string;
  updatedAt: string;
}
```

## 4. App snapshot

```ts
interface MonitoringAppSnapshot {
  activePageId: string;
  sidebarCollapsed?: boolean;
  dashboardMode: "default" | "custom";
  aiStudioVersion?: string;
  runtimeView?: "operator" | "executive" | "maintenance";
}
```

목적:

- `/monitoring?project=...` runtime에서 어떤 화면을 먼저 보여줄지 결정
- AI Studio 기본 화면과 custom grid의 관계 저장

## 5. Editor snapshot

```ts
interface MonitoringEditorSnapshot {
  centerView: "monitor" | "mapping";
  zoom?: number;
  showRightPanel: boolean;
  selectedElement?: null;
  selectedWidgetId?: null;
  leftPanelTab: "chat" | "widgets";
  leftPanelWidth: number;
}
```

주의:

- runtime에서는 selected 상태를 복원하지 않아도 된다.
- editor 재진입 시에는 마지막 편집 상태 복원 가능.

## 6. Pages snapshot

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

interface MonitoringPagesSnapshot {
  activePageId: string;
  pages: MonitoringPage[];
}
```

기본 페이지:

```txt
home
integrated-dashboard
equipment-diagnosis
environment-diagnosis
worker-safety
alerts-events
report
settings
```

생성 페이지 예:

```txt
asset-detail
sensor-stream
ai-model-performance
sop-center
field-validation
gateway-status
predictive-maintenance-report
```

## 7. Widgets snapshot

```ts
interface MonitoringWidgetsSnapshot {
  grid: {
    columns: 12;
    rowHeight: number;
    gap: number;
  };
  items: MonitoringGridWidgetSnapshot[];
}

interface MonitoringGridWidgetSnapshot {
  id: string;
  type: string;
  title: string;
  pageId: string;
  grid: { x: number; y: number; w: number; h: number };
  minGrid: { w: number; h: number };
  maxGrid?: { w: number; h: number };
  config: MonitoringWidgetConfigSnapshot;
  binding?: MonitoringWidgetBindingSnapshot;
  locked?: boolean;
  hidden?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

config:

```ts
interface MonitoringWidgetConfigSnapshot {
  title: string;
  subtitle?: string;
  dataSourceId?: string;
  refreshIntervalSec?: number;
  colorMode?: "default" | "severity" | "custom";
  primaryColor?: string;
  thresholds?: Record<string, number>;
  unit?: string;
  displayMode?: string;
  options?: Record<string, unknown>;
}
```

## 8. Mapping snapshot

```ts
interface MonitoringMappingsSnapshot {
  sources: MonitoringMappingSourceSnapshot[];
  edges: MonitoringMappingEdgeSnapshot[];
}

interface MonitoringMappingSourceSnapshot {
  id: string;
  name: string;
  kind: "demo" | "file" | "folder" | "api" | "sensor" | "ai";
  domain:
    | "ultrasonic"
    | "vibration"
    | "thermal"
    | "gas"
    | "worker-bio"
    | "imu"
    | "communication"
    | "ai-diagnosis"
    | "sop-events"
    | "field-validation";
  endpoint?: string;
  method?: string;
  fields: MonitoringMappingFieldSnapshot[];
  createdAt: string;
}

interface MonitoringMappingFieldSnapshot {
  id: string;
  name: string;
  path: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "unknown";
  sample?: string;
}

interface MonitoringMappingEdgeSnapshot {
  id: string;
  sourceId: string;
  sourceField: string;
  targetWidgetId: string;
  targetProperty: string;
}
```

## 9. Brand snapshot

```ts
interface MonitoringBrandSnapshot {
  brand: MonitoringBrandSettings;
  sectionStyles: Record<string, Partial<MonitoringBrandSettings>>;
  systemTitle: string;
}
```

section style keys:

```txt
app
header
sidebar
content
card
widget
alert
report
```

## 10. Harness snapshot

```ts
interface MonitoringHarnessSnapshot {
  scenario: "energy" | "manufacturing" | "smartcity";
  specs: Record<string, unknown>;
  blueprintMd: string;
  recommendedWidgets: string[];
  recommendedDataSources: string[];
  modelPolicy: "f1" | "f2" | "mixed";
}
```

## 11. Publish flow

1. 사용자가 에디터 상단 `퍼블리시` 클릭
2. Monitoring publish modal 표시
3. name/client/versionNote 입력
4. `monitoringEditorStore.publishSnapshot()` 호출
5. projectStore.publish에 monitoringSnapshot 포함
6. 완료 화면 표시
7. 선택지:
   - 프로젝트 보기
   - AIM Monitoring 실행
   - 닫기

## 12. Runtime flow

`/monitoring?project={id}`

1. projectStore에서 project id 조회
2. project.solution이 `monitoring`인지 확인
3. monitoringSnapshot 확인
4. snapshot이 있으면 hydrate
5. snapshot이 없으면 기본 AI Studio Monitoring app 표시
6. runtime mode에서는 editor controls 숨김

## 13. ProjectsGrid 분기

기존 문제:

- 실행 버튼이 AIM GUARD로 고정될 수 있음

필요 로직:

```ts
const SOLUTION_RUNTIME: Record<string, { label: string; route: string }> = {
  guard: { label: "AIM GUARD 실행", route: "/guard" },
  monitoring: { label: "AIM Monitoring 실행", route: "/monitoring" },
};
```

주의:

- 기존 guard label은 바꾸지 않는다.
- unknown solution은 manifest route fallback.

## 14. localStorage key

기존:

```txt
aimnis-projects
```

유지:

- projectStore key는 그대로 둔다.
- project item 내부에 optional monitoringSnapshot을 넣는다.

신규:

```txt
aimnis-monitoring-editor
aimnis-monitoring-pages
```

금지:

- monitoring 상태를 `aimnis-guard-pages`에 쓰지 않는다.
- monitoring 상태를 `editorStore` persist에 섞지 않는다.

## 15. Migration 정책

현재 저장된 guard 프로젝트:

- monitoringSnapshot이 없음
- 기존 field만으로 정상 동작해야 함

읽기 로직:

```ts
if (project.solution === "monitoring" && project.monitoringSnapshot) {
  hydrateMonitoring(project.monitoringSnapshot);
} else if (project.solution === "monitoring") {
  renderDefaultMonitoringRuntime();
} else {
  renderGuardRuntime();
}
```

## 16. 완료 기준

- Monitoring 에디터에서 저장한 위젯 위치/크기/설정이 projectStore에 들어간다.
- `/projects`에서 AIM Monitoring 프로젝트가 AIM GUARD와 구분되어 표시된다.
- AIM Monitoring 실행 버튼은 `/monitoring?project={id}`로 이동한다.
- 저장된 프로젝트를 다시 열었을 때 12그리드 위젯이 복원된다.
- guard 프로젝트 저장/실행은 기존 그대로 작동한다.
