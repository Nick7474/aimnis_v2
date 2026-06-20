# AIM Monitoring 12그리드 편집 엔진 기획서

작성일: 2026-06-06
작성자: Codex
상태: 2차 보정 기획

## 0. 목적

AIM Monitoring의 핵심 차별점은 좌측 위젯 탭에서 20개 위젯을 드래그해서 중앙 콘텐츠 컨테이너에 자유 배치하고, 가로/세로로 리사이즈하는 것이다.

기존 AIM GUARD의 overlay widget은 pixel absolute 기반이다.
AIM Monitoring은 12그리드 기반으로 별도 구현한다.

## 0.1 대표님 피드백에 따른 핵심 보정

2026-06-07 피드백:

- 12그리드는 격자선을 깔아놓는 개념이 아니다.
- 12그리드는 container, columns, margin, gutter로 구성되는 layout system이다.
- 위젯을 드래그하면 기존 콘텐츠 위젯 위에 얹히는 것이 아니라 기존 콘텐츠가 반응하며 위치가 조정되어야 한다.
- 현재 1차 구현은 overlay prototype에 가까우며 최종 방향으로 사용하면 안 된다.

결론:

- 현재 `MonitoringApp` 위에 absolute widget layer를 얹는 방식은 임시 기술 검증으로만 간주한다.
- 최종 AIM Monitoring editor는 AI Studio 대시보드의 기존 카드와 새로 추가한 위젯을 모두 같은 layout item으로 관리해야 한다.
- 기존 콘텐츠도 `grid item`으로 등록되어야 하며, 새 위젯 drop/resize/move 시 충돌 계산과 reflow 대상이 되어야 한다.
- 배경 grid visual은 선 격자가 아니라 column/margin/gutter guide로 표현해야 한다.

## 1. 기존 AIM GUARD 방식과 차이

| 항목 | AIM GUARD | AIM Monitoring |
|---|---|---|
| 배치 방식 | pixel x/y absolute | 12-grid x/y/w/h |
| 위젯 출처 | 채팅으로 생성 | 채팅 + 좌측 위젯 탭 |
| 위젯 수 | 6개 단순 타입 | 20개 도메인 위젯 |
| 리사이즈 | 명시적 grid resize 없음 | 가로/세로 resize 필수 |
| 드롭 영역 | 중앙 overlay 또는 우측 panel | 중앙 content grid |
| 우측 패널 | guard 섹션/위젯 설정 | selected monitoring widget inspector |
| store | `editorStore` | `monitoringEditorStore` |

기존 1차 결론:

- `OverlayCanvas.tsx`를 재사용하지 않는다.
- `SmartGridEngine.ts`는 참고만 한다.
- Monitoring 전용 grid engine을 만든다.

2차 보정 결론:

- Monitoring 전용 grid engine은 overlay engine이 아니라 document layout engine이어야 한다.
- `MonitoringApp`의 Dashboard를 그대로 배경으로 둔 채 overlay하는 방식은 폐기 대상이다.
- `Dashboard.tsx`의 `SummaryCards`, `MainChartSection`, `WorkerSafetySection`, `BottomWidgetsSection`를 editable grid item으로 분해해야 한다.
- AI Studio 원본 디자인은 유지하되 wrapper만 `MonitoringGridItem`으로 감싼다.

## 2. 기본 grid 모델

```ts
type GridUnit = number;

interface GridRect {
  x: GridUnit;
  y: GridUnit;
  w: GridUnit;
  h: GridUnit;
}

interface MonitoringGridWidget {
  id: string;
  type: MonitoringWidgetType;
  title: string;
  grid: GridRect;
  minGrid: { w: number; h: number };
  maxGrid?: { w: number; h: number };
  config: MonitoringWidgetConfig;
  dataBinding?: MonitoringWidgetBinding;
  locked?: boolean;
  hidden?: boolean;
}
```

grid 상수:

```ts
const MONITORING_GRID = {
  columns: 12,
  rowHeight: 36,
  marginX: 20,
  marginY: 20,
  gutter: 24,
  rowGap: 24,
  minRows: 12,
  maxRows: 200,
};
```

용어:

```txt
container: 실제 콘텐츠가 놓이는 최대 폭 영역
columns: container 내부의 12개 단
margin: container 좌우 내부 여백
gutter: column 사이 간격
rowGap: 위젯 row 사이 간격
rowHeight: vertical snap 단위
```

## 3. 좌표 변환

container pixel:

```ts
contentWidth = containerWidth - marginX * 2
columnWidth = (contentWidth - gutter * (columns - 1)) / columns
left = marginX + x * (columnWidth + gutter)
top = marginY + y * (rowHeight + rowGap)
width = w * columnWidth + (w - 1) * gutter
height = h * rowHeight + (h - 1) * rowGap
```

pointer to grid:

```ts
gridX = clamp(round((pointerX - marginX) / (columnWidth + gutter)), 0, columns - w)
gridY = max(0, round((pointerY - marginY) / (rowHeight + rowGap)))
```

주의:

- viewport width로 font size를 키우지 않는다.
- grid는 container 기준으로만 계산한다.
- text overflow는 위젯 내부 responsive density로 처리한다.
- guide visual은 전체 cell line이 아니라 12 column overlay와 양쪽 margin overlay로만 표현한다.

## 3.1 기존 AI Studio 콘텐츠의 grid item화

현재 AI Studio 홈 화면 기본 구성:

```txt
summary-equipment-status       x0  y0  w3  h3
summary-environment-risk       x3  y0  w3  h3
summary-worker-safety          x6  y0  w3  h3
summary-alert-count            x9  y0  w3  h3
equipment-anomaly-chart        x0  y3  w8  h8
worker-safety-overview         x8  y3  w4  h8
environment-diagnosis          x0  y11 w3  h4
realtime-alerts                x3  y11 w3  h4
action-progress                x6  y11 w3  h4
system-status                  x9  y11 w3  h4
```

이 기본 콘텐츠도 editor 내부에서는 다음처럼 등록한다.

```ts
interface MonitoringLayoutItem {
  id: string;
  source: "ai-studio-default" | "widget-library" | "chat-generated";
  componentKey: string;
  title: string;
  grid: GridRect;
  minGrid: { w: number; h: number };
  config: Record<string, unknown>;
  locked?: boolean;
}
```

원칙:

- AI Studio 기본 위젯도 새 위젯과 동일한 collision/reflow 대상이다.
- 사용자가 새 위젯을 기존 카드 위치에 drop하면 기존 카드는 아래 또는 가장 가까운 빈 슬롯으로 이동한다.
- 기존 카드 위에 겹쳐지는 동작은 허용하지 않는다.

## 4. 위젯 추가 플로우

### 4.1 좌측 위젯 탭에서 drag

1. 사용자가 widget library card를 drag 시작
2. `activeLibraryWidget` 설정
3. 중앙 content grid 위에 hover 시 ghost preview 표시
4. drop 시 widget definition의 default size 사용
5. 현재 pointer 위치를 grid 좌표로 변환
6. 충돌하면 가장 가까운 빈 공간으로 자동 보정
7. `monitoringEditorStore.addWidget()` 호출
8. 새 위젯 선택
9. 우측 inspector 자동 열림

보정:

- drop target은 overlay canvas가 아니라 layout container다.
- drop 순간 새 위젯의 candidate rect를 계산하고, 기존 layout items와 충돌을 검사한다.
- 충돌하면 `pushDownLayout()` 또는 `findNextAvailableSlot()`로 기존 item을 재배치한다.
- 사용자는 기존 콘텐츠가 자연스럽게 밀리는 것을 보아야 한다.

### 4.2 채팅에서 위젯 생성

1. 자연어 intent 또는 `/api/chat?solution=monitoring`
2. widget type 결정
3. widget config 생성
4. `findNextAvailableSlot()`으로 빈 공간 탐색
5. grid에 추가
6. assistant message에 수행 내역 표시

## 5. 충돌 처리

기본 원칙:

- 같은 grid cell을 두 위젯이 점유하면 안 된다.
- drop/resize 중에는 preview로 충돌 여부를 보여준다.
- 최종 구현은 push-away와 빈 공간 보정을 모두 제공한다.
- 기존 AI Studio 기본 위젯과 새 library widget을 같은 item 배열에서 처리한다.

충돌 검사:

```ts
function intersects(a: GridRect, b: GridRect) {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
}
```

빈 공간 탐색:

```ts
function findNextAvailableSlot(widgets, size, start = { x: 0, y: 0 }) {
  for y from start.y to maxRows:
    for x from 0 to columns - size.w:
      candidate = { x, y, w: size.w, h: size.h }
      if no collision: return candidate
}
```

필수 구현:

- collision 시 아래 위젯 push
- auto compact
- drop preview
- resize preview

향후 고도화:

- multi-select 이동
- lock/unlock

## 6. 드래그 이동

동작:

- 위젯 header 또는 frame drag handle에서 이동
- drag 중 원본은 opacity 0.5
- ghost는 grid snap preview
- drop 시 좌표 확정
- ESC 또는 drag cancel 시 원위치

필수 상태:

```ts
draggingWidgetId
dragStartGrid
dragPreviewGrid
isCollision
```

검증:

- x는 0 이상
- x + w는 12 이하
- y는 0 이상
- 다른 위젯과 충돌하지 않음

## 7. 리사이즈

resize handle:

- right
- bottom
- bottom-right
- left
- top은 1차 구현에서 제외 가능

1차 권장:

- bottom-right handle부터 구현
- 이후 right, bottom 추가

resize 규칙:

- minGrid보다 작아질 수 없음
- maxGrid보다 커질 수 없음
- columns를 넘을 수 없음
- 다른 위젯과 충돌하면 preview에서 빨간 상태
- drop 시 충돌이 있으면 마지막 정상 크기로 복구

위젯별 min size 예:

```txt
gauge/single metric: 3x3
table: 5x4
line chart: 5x4
heatmap: 5x4
timeline/flow: 5x5
report: 6x4
```

## 8. responsive density

위젯은 grid 크기에 따라 내부 밀도를 바꾼다.

```ts
function getWidgetDensity(grid: GridRect) {
  const area = grid.w * grid.h;
  if (area <= 12) return "compact";
  if (area <= 24) return "standard";
  return "expanded";
}
```

density 기준:

- compact: title, 핵심 수치 1개, 상태 badge
- standard: title, 수치, mini chart, trend
- expanded: chart/table, interpretation, action hints

이 원칙으로 글자가 UI 밖으로 튀지 않게 한다.

## 9. 선택/플로팅 툴바

위젯 선택 시:

- outline 표시
- 상단 floating toolbar 표시
- toolbar actions:
  - 설정
  - 복제
  - 잠금
  - 삭제

설정 클릭:

1. `selectedWidgetId` 설정
2. `selectedElement`를 widget으로 설정
3. `showRightPanel = true`
4. `rightPanel = "widget"`

## 10. 우측 inspector 연동

위젯 선택 시 우측 패널에서 편집할 상태:

```ts
interface MonitoringWidgetConfig {
  title: string;
  subtitle?: string;
  dataSourceId?: string;
  refreshIntervalSec: number;
  colorMode: "default" | "severity" | "custom";
  primaryColor?: string;
  thresholds?: Record<string, number>;
  unit?: string;
  displayMode?: string;
  options?: Record<string, unknown>;
}
```

업데이트:

```ts
updateWidgetConfig(id, partial)
updateWidgetGrid(id, nextGrid)
updateWidgetBinding(id, binding)
```

## 11. 저장/publish snapshot

project snapshot에 반드시 포함:

```ts
interface MonitoringProjectSnapshot {
  solution: "monitoring";
  version: string;
  activePageId: string;
  pages: MonitoringPage[];
  widgets: MonitoringGridWidget[];
  mappings: {
    sources: MonitoringMappingSource[];
    edges: MonitoringMappingEdge[];
  };
  brand: MonitoringBrandSettings;
  sectionStyles: Record<string, unknown>;
  systemTitle: string;
  createdAt: string;
  updatedAt: string;
}
```

## 12. 구현 파일 후보

```txt
src/components/monitoring-editor/MonitoringGridCanvas.tsx
src/components/monitoring-editor/MonitoringGridItem.tsx
src/components/monitoring-editor/MonitoringResizeHandle.tsx
src/components/monitoring-editor/MonitoringWidgetFrame.tsx
src/components/monitoring-editor/MonitoringDropPreview.tsx
src/components/monitoring-editor/monitoringGridUtils.ts
src/store/monitoringEditorStore.ts
```

## 13. 라이브러리 판단

현재 프로젝트는 `@dnd-kit/core`를 이미 사용한다.

권장:

- drag/drop은 `@dnd-kit/core` 사용
- grid snap/collision/resize는 직접 구현

이유:

- 기존 의존성을 늘리지 않는다.
- AIM GUARD와 다른 동작을 Monitoring 전용으로 통제할 수 있다.
- 12그리드/위젯별 min/max/inspector 연동을 세밀하게 제어할 수 있다.

## 14. 구현 단계

1차:

- grid utils
- widget add
- drag move
- bottom-right resize
- selected widget
- inspector 연결

2차:

- collision preview
- right/bottom resize
- auto slot
- duplicate/lock/delete
- density responsive

3차:

- layout snapshot
- restore from project
- compact layout
- keyboard movement
- multi page layouts

## 15. 완료 기준

- 좌측 위젯 탭에서 드래그해 중앙에 추가된다.
- 추가된 위젯은 12그리드에 snap된다.
- 위젯은 가로/세로 리사이즈된다.
- 선택 위젯은 우측 패널에서 편집된다.
- 저장 후 다시 열어도 위치/크기/설정이 유지된다.
- AIM GUARD overlay 기능은 기존 그대로 동작한다.
