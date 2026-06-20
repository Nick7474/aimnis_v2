# AIM Monitoring 상세 감사 기반 구현 계획

작성일: 2026-06-06
작성자: Codex
상태: 구현 전 기획/감사 단계
운영 기준: 3개월 정확도 우선 프로젝트

## 0. 이 문서의 목적

사용자의 목표는 단순히 AIM Monitoring 화면을 하나 더 만드는 것이 아니다.

목표는 다음과 같다.

1. 기존 AIM GUARD의 수많은 기능을 빠짐없이 파악한다.
2. AIM GUARD를 절대 깨뜨리지 않는다.
3. AIM Monitoring을 별도 솔루션으로 제작한다.
4. AIM GUARD가 제공하던 편집/설정/채팅/데이터 매핑/페이지 추가/퍼블리시/프로젝트 기능을 AIM Monitoring에도 기능 동등성 수준으로 구현한다.
5. AIM Monitoring만의 핵심 차별점인 `좌측 위젯 탭 + 20개 사업계획서 기반 위젯 + 12그리드 자유 배치/리사이즈 + 우측 위젯 편집`을 추가한다.

따라서 이 문서는 “바로 작업하는 TODO”가 아니라, 실작업에 들어가기 전 기능 누락을 막기 위한 감사 및 실행 기준 문서다.

## 1. 최우선 작업 원칙

### 1.1 AIM GUARD 불변 원칙

아래 파일과 폴더는 기본적으로 수정 금지다.

```txt
src/guard-app/**
src/solutions/guard/**
aim-guard/**
```

수정이 필요한 경우는 오직 다음 조건을 모두 만족할 때만 허용한다.

- AIM GUARD 버그 수정이 아니라 AIM Monitoring 등록을 위한 공통 플랫폼 최소 변경이어야 한다.
- 변경 전후 AIM GUARD 동작이 동일해야 한다.
- 변경 파일에 guard 전용 로직이 있다면 solution 분기를 통해 guard 결과가 기존과 같아야 한다.
- 변경 후 AIM GUARD 회귀 체크리스트를 통과해야 한다.

### 1.2 기능 동등성 원칙

AIM Monitoring은 AIM GUARD 코드를 무리하게 이식하지 않는다.

대신 다음 방식으로 간다.

- AIM GUARD를 기능 명세의 기준으로 사용한다.
- AIM Monitoring은 별도 컴포넌트와 별도 store로 구현한다.
- 공통 shell, route, project store 등 플랫폼 레벨만 최소 연결한다.
- “동일 기능”은 UX와 결과가 같다는 뜻이지, 내부 코드가 같다는 뜻이 아니다.

### 1.3 구현 시작 조건

아래 5개 감사 게이트가 완료되기 전에는 본격 구현을 시작하지 않는다.

1. AIM GUARD 기능 인벤토리 작성
2. 기능별 파일/상태/store/API 의존성 표 작성
3. AIM Monitoring 기능 동등성 매트릭스 작성
4. AIM Monitoring 별도 아키텍처 확정
5. AIM GUARD 회귀 테스트 체크리스트 확정

### 1.4 AIM Monitoring AI Studio 디자인 우선 원칙

AIM Monitoring 솔루션의 에디터/대시보드 화면은 새로 임의 디자인하지 않는다.

우선순위:
1. AI Studio로 제작된 AIM Monitoring 디자인 산출물을 source of truth로 사용한다.
2. 디자인이 HTML/React/CSS/assets/이미지 중 어떤 형태이든 먼저 위치와 구조를 확인한다.
3. 확인된 디자인의 레이아웃, 컬러, 컴포넌트 밀도, 위젯 배치 감각을 유지한다.
4. 기능 구현은 기존 디자인을 깨지 않는 범위에서 붙인다.
5. 디자인에 없는 좌측 위젯 탭, 12그리드 편집, 우측 위젯 인스펙터만 AIM Monitoring 톤에 맞춰 확장한다.

현재 로컬 프로젝트에서 확인된 상태:

```txt
AIM Monitoring/
  README.md
  index.html
  metadata.json
  package.json
  package-lock.json
  vite.config.ts
  tsconfig.json
  src/
    App.tsx
    main.tsx
    index.css
    components/
    pages/

src/components/monitoring-editor/
src/monitoring-app/
src/monitoring-app/widgets/
```

AI Studio 산출물은 다시 확인되었다.
따라서 AIM Monitoring 중앙 화면은 이 산출물을 source of truth로 사용한다.
세부 감사 결과는 `AIM_MONITORING_AI_STUDIO_ASSET_AUDIT.md`를 기준으로 한다.

중요:
- `AIM Monitoring/` 폴더는 원본 보관소로 유지한다.
- AIMNIS 본 앱에는 `src/monitoring-app/`, `src/components/monitoring-editor/`로 이식한다.
- 원본을 직접 고치며 기능을 붙이지 않는다.
- 현재 독립 빌드는 `vite: command not found`로 실패했다. 이는 하위 앱 의존성 미설치 상태로 판단한다.
- 본 구현 전 `AIM Monitoring` 독립 빌드 검증 또는 본 앱 포팅 빌드 검증 중 하나는 반드시 통과해야 한다.

### 1.5 대표님 지시사항 반영

이번 작업의 운영 기준은 다음과 같다.

1. 빠른 구현보다 정확한 기능 파악을 우선한다.
2. AIM GUARD의 모든 기존 기능은 절대 훼손하지 않는다.
3. AIM Monitoring은 별도 솔루션으로 제작한다.
4. AI Studio로 제작된 AIM Monitoring 디자인을 중앙 콘텐츠 기준으로 사용한다.
5. 첨부 사업계획서에서 핵심 위젯과 질문을 도출한다.
6. 구현은 감사 문서와 게이트가 준비된 뒤 시작한다.
7. 3개월 프로젝트로 보아도 무리 없는 단계별 검증 방식을 따른다.

현재 새로 분리한 상세 문서:

```txt
AIM_GUARD_FEATURE_AUDIT.md
AIM_GUARD_REGRESSION_CHECKLIST.md
AIM_MONITORING_AI_STUDIO_ASSET_AUDIT.md
AIM_MONITORING_AI_STUDIO_PORTING_MAP.md
AIM_MONITORING_ARCHITECTURE.md
AIM_MONITORING_WIDGET_SPEC.md
AIM_MONITORING_GRID_SPEC.md
AIM_MONITORING_STEP2_SCENARIO_SPEC.md
AIM_MONITORING_PROJECT_SNAPSHOT_SPEC.md
AIM_MONITORING_IMPLEMENTATION_GATE.md
```

## 2. 현재 파악한 프로젝트 구조

### 2.1 홈/Step2

```txt
src/components/home/HomeHero.tsx
src/components/home/HomePhase2.tsx
src/components/home/ChatArea.tsx
src/components/home/StitchInput.tsx
src/components/home/CreateHarnessBtn.tsx
src/components/home/LiveBlueprint.tsx
src/components/home/MagicSetupButton.tsx
src/components/home/SpecQuestionView.tsx
src/components/home/SpecGroupView.tsx
src/store/homeStore.ts
src/data/scenarios.ts
```

현재 구조:
- 홈 상단 채팅에서 시나리오 추천
- 솔루션 칩 선택
- 하단 솔루션 카드
- Step2에서 질문/답변/Blueprint 작성
- 전문가 추천세팅
- 하네스 생성 후 `/editor?solution=guard` 이동

중요 위험:
- `CreateHarnessBtn.tsx`가 현재 guard로 하드코딩되어 있다.
- `homeStore.ts`가 guard 성격의 질문/위젯/API Mapping을 기본값으로 가진다.
- `scenarios.ts`의 질문은 CCTV/보안 중심이라 AIM Monitoring에 그대로 쓰면 안 된다.

### 2.2 에디터 shell

```txt
src/app/editor/page.tsx
src/components/editor/EditorLayout.tsx
src/store/editorStore.ts
```

현재 구조:
- `/editor?solution=[id]`로 솔루션 manifest 로드
- `EditorLayout`에서 좌측 채팅, 중앙 monitor/mapping, 우측 설정 패널 구성
- `DndContext`가 전체 에디터를 감싼다.
- 상단에서 monitor/mapping 전환
- 저장, 확대, 퍼블리시
- 좌측 패널 리사이즈
- 우측 설정 패널 열림 시 좌측 패널 슬라이드/딤 처리
- 페이지 접근 보호 모달

중요 위험:
- `EditorLayout`이 AIM GUARD 중심으로 커져 있다.
- `MonitorWrapper`, `OverlayCanvas`, `RightSidebarDropZone`, `MappingCanvas`, `DynamicPanel` 모두 `editorStore`에 강하게 묶여 있다.
- AIM Monitoring을 이 안에 직접 끼워 넣으면 AIM GUARD가 깨질 가능성이 높다.

판단:
- `/editor?solution=monitoring`일 때는 기존 `EditorLayout`을 재사용하지 않고 `MonitoringEditorShell`로 분기하는 편이 안전하다.
- 단, 상단 shell의 시각적 패턴은 복제한다.

### 2.3 좌측 AI 채팅

```txt
src/components/editor/ChatPanel.tsx
src/lib/intentParser.ts
src/lib/brandAgent.ts
src/app/api/chat/route.ts
```

현재 기능:
- 메시지 리스트
- AI 스트리밍 응답
- 실행 로그 접기/펼치기
- 빠른 힌트 버튼
- 로컬 intent parser
  - 브랜드 프리셋
  - 고객사명 변경
  - 시스템 타이틀 변경
  - mapping/monitor 뷰 전환
  - 위젯 전체 삭제
- 브랜드 제안 카드
- API 응답의 `__WIDGET_JSON__` 파싱
- 위젯 1개 생성
- overlay widget 자동 배치

중요 위험:
- 현재 `/api/chat`의 위젯 타입은 guard용 6개뿐이다.
- 자연어 명령이 `useEditorStore`를 직접 조작한다.
- AIM Monitoring이 별도 store를 쓰면 ChatPanel을 그대로 쓰기 어렵다.

판단:
- `MonitoringChatTab`을 별도 제작한다.
- 기존 ChatPanel의 기능 계약은 복제하되 store와 지원 위젯 타입은 Monitoring 전용으로 만든다.
- `/api/chat`도 solution=monitoring일 때 20개 Monitoring 위젯 타입을 지원하도록 분기한다.

### 2.4 중앙 AIM GUARD 화면

```txt
src/components/editor/MonitorWrapper.tsx
src/components/editor/EditableSection.tsx
src/store/guardPagesStore.ts
src/guard-app/pages/Monitor.tsx
src/guard-app/pages/CctvDashboard.tsx
src/guard-app/pages/Events.tsx
src/guard-app/pages/Stats.tsx
src/guard-app/pages/admin/EventRules.tsx
src/guard-app/pages/admin/Settings.tsx
```

현재 기능:
- `MemoryRouter` 내부에서 guard-app 페이지를 렌더
- 자동 로그인
- Ant Design ConfigProvider 테마 연결
- 헤더/사이드바/컨텐츠/상태바
- 브랜드 토큰 적용
- EditableSection으로 헤더, 사이드바, 맵, 알람 패널, 플로어 상태 설정 진입
- 기본 페이지: Map 기반 모니터링
- 추가 페이지:
  - CCTV
  - 이벤트
  - 통계
  - 이벤트 규칙
  - 설정
- 페이지 추가 모달
  - Step 1 페이지 선택
  - Step 2 기능 설정 질문
  - 실시간 MD 미리보기
  - 페이지 생성
  - 생성 후 사이드바 추가
  - 추가 페이지 삭제
- 하단 상태바
- 알람 패널/플로어 상태 숨김 처리

중요 위험:
- `MonitorWrapper`는 AIM GUARD 앱과 강하게 결합되어 있다.
- 페이지 추가 질문과 페이지 종류가 guard 보안/CCTV 중심이다.
- 이 파일을 건드리면 AIM GUARD 회귀 위험이 가장 크다.

판단:
- AIM Monitoring은 `MonitoringAppWrapper`를 새로 만든다.
- 페이지 추가도 `monitoringPagesStore`와 `MonitoringPageAddModal`로 별도 구현한다.
- EditableSection은 공통 재사용 가능하지만 현재 `useEditorStore`를 직접 쓰므로 Monitoring용 `MonitoringEditableSection`을 별도 제작하는 편이 안전하다.

### 2.5 오버레이 위젯/우측 패널 드롭

```txt
src/components/editor/OverlayCanvas.tsx
src/components/editor/RightSidebarDropZone.tsx
src/components/editor/SmartGridEngine.ts
src/components/editor/widgets/*.tsx
src/store/editorStore.ts
```

현재 기능:
- AI가 만든 위젯을 중앙 모니터 위에 absolute overlay로 배치
- 픽셀 좌표 기반 위치 계산
- 드래그 핸들로 위젯 이동
- 위젯 선택 시 우측 widget inspector 표시
- 삭제 버튼
- LIVE 뱃지
- 위젯을 우측 패널로 드래그해서 패널 카드로 전환
- 우측 패널 내 정렬, 접기, 보이기/숨기기, 삭제
- 우측 패널 reset 시 중앙 overlay로 복원
- 기존 AIM GUARD 알람 패널/플로어 상태와 통합 표시

중요 위험:
- 현재 구조는 `12그리드`가 아니라 픽셀 overlay다.
- 위젯을 우측 AIM GUARD 패널로 보내는 기능은 Monitoring 요구와 다르다.
- Monitoring은 중앙 컨텐츠 안에서 자유 배치/스케일이 핵심이다.

판단:
- AIM Monitoring은 `MonitoringGridCanvas`로 새로 구현한다.
- 기존 overlay 기능의 UX는 참고하되, grid 기반 모델을 새로 둔다.
- 우측 패널 드롭은 Monitoring에서는 “데이터/인터랙션 inspector”로 의미를 바꾼다.

### 2.6 우측 설정 패널

```txt
src/components/editor/panels/DynamicPanel.tsx
src/components/editor/SettingsPanel.tsx
src/components/editor/BrandKitControls.tsx
src/components/editor/ColorTokenPicker.tsx
src/components/editor/MappingPanel.tsx
```

현재 기능:
- 활성 panelType에 따라 다른 inspector 표시
- 전체 브랜드 설정
- 헤더 브랜드/로고/서비스명 편집
- GIS 맵 스타일 편집
- 알람 패널 severity 색상/밀도 편집
- 네비게이션 메뉴 톤/밀도/radius 편집
- 위젯 개별 속성 편집
- 데이터 매핑 스튜디오 열기
- 컬러 토큰 피커
- 브랜드 프리셋 저장/복원

중요 위험:
- `DynamicPanel`은 guard 섹션 타입과 editorStore에 묶여 있다.
- Monitoring 위젯 20개의 설정 필드는 완전히 다르다.

판단:
- `MonitoringInspectorPanel`을 별도로 만든다.
- 단, 사용자 경험은 동일하게 유지한다.
  - 선택 요소 라벨
  - 브랜드/데이터/스타일/인터랙션 탭
  - 타이틀/색상/폰트/데이터 소스/임계값 편집

### 2.7 데이터 매핑

```txt
src/components/editor/MappingCanvas.tsx
src/components/editor/mappingUtils.ts
src/components/editor/mapping-nodes/DataSourceNode.tsx
src/components/editor/mapping-nodes/WidgetTargetNode.tsx
```

현재 기능:
- ReactFlow 기반 Data Mapping Studio
- demo/file/folder/api 데이터 소스 생성
- 파일 드롭 파싱
- API endpoint 추가
- core panel target + overlay widget target 표시
- source field와 target property 연결
- 기본 바인딩 자동 생성
- edge 클릭 삭제
- 연결 시 mock data를 위젯에 반영

중요 위험:
- core target이 AIM GUARD 전용이다.
  - Map 기반 모니터링
  - 우측 알람 패널
  - Floor Status
  - CCTV 인프라
  - 작업자 안전
  - 공기질/센서 상태
- 데이터 connector도 guard 성격이다.

판단:
- `MonitoringMappingCanvas`를 별도 구현한다.
- Monitoring core target:
  - 설비 종합 상태
  - 센서 스트림
  - AI 이상탐지
  - 예지보전 예측
  - 작업자 생체 안전
  - SOP/리포트
- 데이터 소스:
  - ultrasonic
  - vibration
  - thermal
  - gas
  - worker-bio
  - location
  - ai-diagnosis
  - sop-events

### 2.8 프로젝트/퍼블리시

```txt
src/store/projectStore.ts
src/components/projects/ProjectsGrid.tsx
src/app/projects/page.tsx
```

현재 기능:
- publish 시 localStorage persist
- version 자동 증가
- brandSnapshot, sectionStylesSnapshot, systemTitle 저장
- 프로젝트 카드 리스트
- edit/open/delete/copy URL
- 현재 실행 버튼 라벨은 AIM GUARD로 하드코딩
- open route는 `/${project.solution}?project=...`

중요 위험:
- solution type 주석이 `"guard" | "eco"`로 좁게 설명되어 있다.
- ProjectsGrid의 실행 버튼이 AIM GUARD 하드코딩이다.
- `/monitoring` route가 아직 없다.

판단:
- 프로젝트 store는 공통 사용 가능.
- Monitoring publish 시 grid layout, widget config, page list snapshot까지 저장해야 한다.
- ProjectsGrid는 solution별 라벨/색상/route 분기 필요.

## 3. AIM GUARD 기능 동등성 매트릭스

| 기능군 | 현재 AIM GUARD 기능 | AIM Monitoring 동등 구현 방향 | 구현 방식 | 위험도 |
|---|---|---|---|---|
| 홈 솔루션 선택 | AIM GUARD 칩/카드 선택 | AIM Monitoring 칩/카드 추가 | 공통 HomeHero 최소 수정 | 중 |
| 자연어 시나리오 추천 | `/api/home`이 3개 시나리오 추천 | Monitoring 키워드/시나리오 추천 | API 프롬프트 solution 분기 | 중 |
| Step2 질문 | guard 중심 질문/Blueprint | 사업계획서 기반 질문/Blueprint | `monitoringScenarios.ts` 신규 | 중 |
| 전문가 추천세팅 | scenarioMap.defaultSpecs | monitoring defaultSpecs | 별도 데이터 세트 | 낮음 |
| 하네스 생성 | session/localStorage 저장 후 guard editor | monitoring metadata 저장 후 monitoring editor | CreateHarnessBtn 분기 | 중 |
| 에디터 shell | 3패널, 상단 메뉴, 저장/확대/퍼블리시 | 동일 UX | MonitoringEditorShell 신규 | 중 |
| 접근 보호 | FlowGuardModal | 동일 정책 적용 | 공통 모달 재사용 가능 | 낮음 |
| 좌측 채팅 | 자연어 명령/위젯/브랜드/로그 | 동일 + 위젯 탭 추가 | MonitoringLeftPanel 신규 | 높음 |
| 자연어 즉시 실행 | intentParser가 editorStore 조작 | monitoring intent parser | 별도 parser 또는 adapter | 중 |
| AI 위젯 생성 | 6개 guard widget type | 20개 monitoring widget type | `/api/chat` solution 분기 | 높음 |
| 중앙 화면 | AIM GUARD MemoryRouter app | AIM Monitoring app | MonitoringAppWrapper 신규 | 높음 |
| EditableSection | guard 섹션 선택/우측 패널 | monitoring 섹션 선택/우측 패널 | MonitoringEditableSection 신규 | 중 |
| 브랜드 설정 | 전역/섹션별 색상/로고/서비스명 | 동일 수준 | monitoring store + inspector | 높음 |
| 데이터 매핑 | ReactFlow mapping studio | monitoring data mapping studio | MonitoringMappingCanvas 신규 | 높음 |
| 오버레이 위젯 | 픽셀 기반 absolute overlay | 12그리드 기반 배치 | MonitoringGridCanvas 신규 | 높음 |
| 위젯 리사이즈 | 기존은 명시적 12그리드 리사이즈 없음 | 핵심 신규 기능 | 별도 grid engine | 높음 |
| 우측 위젯 편집 | title/color/value/dataSource 등 | 20개 위젯별 옵션 | MonitoringWidgetInspector 신규 | 높음 |
| 우측 패널 드롭 | 중앙 위젯을 우측 패널로 전환 | Monitoring에서는 inspector 중심 | 필요 시 별도 처리 | 중 |
| 페이지 추가 | 5개 guard 페이지 + 질문 + MD preview | monitoring 페이지 + 질문 + MD preview | MonitoringPageAddModal 신규 | 높음 |
| 추가 페이지 삭제 | 사이드바 hover 삭제 | 동일 | monitoringPagesStore 신규 | 중 |
| 풀스크린 | monitor/mapping fullscreen | 동일 | shell에서 구현 | 낮음 |
| 퍼블리시 | projectStore 저장 | layout/widgets/pages/config 저장 | project schema 확장 | 중 |
| 프로젝트 실행 | `/guard` | `/monitoring` | 신규 route | 중 |
| AIM GUARD 실행 화면 | `/guard` | `/monitoring` preview/runtime | 신규 app route | 중 |

## 4. AIM Monitoring 별도 아키텍처 제안

### 4.1 파일 구조

```txt
src/solutions/monitoring/
  manifest.json
  harness-schema.json
  templates/default.json
  widgets/index.json

src/data/monitoringScenarios.ts

src/store/monitoringEditorStore.ts
src/store/monitoringPagesStore.ts

src/monitoring-app/
  MonitoringApp.tsx
  MonitoringLayout.tsx
  MonitoringDashboard.tsx
  pages/
    AssetHealth.tsx
    SensorStreams.tsx
    AiDiagnosis.tsx
    WorkerSafety.tsx
    SopCenter.tsx
    Reports.tsx
    Settings.tsx
  mock/
    data.ts
  monitoring.css

src/components/editor/monitoring/
  MonitoringEditorShell.tsx
  MonitoringTopbar.tsx
  MonitoringLeftPanel.tsx
  MonitoringChatTab.tsx
  MonitoringWidgetTab.tsx
  MonitoringWidgetCard.tsx
  MonitoringCanvas.tsx
  MonitoringGridCanvas.tsx
  MonitoringGridUtils.ts
  MonitoringEditableSection.tsx
  MonitoringInspectorPanel.tsx
  MonitoringMappingCanvas.tsx
  MonitoringPageAddModal.tsx
  MonitoringPublishModal.tsx

src/components/editor/widgets/monitoring/
  MonitoringWidgetFrame.tsx
  ...20개 위젯
```

### 4.2 store 분리

`editorStore`를 공유하지 않고 Monitoring 전용 store를 만든다.

필요 상태:

```ts
interface MonitoringEditorState {
  centerView: "dashboard" | "mapping";
  showRightPanel: boolean;
  selectedElement: MonitoringSelectedElement | null;

  brand: MonitoringBrandSettings;
  sectionStyles: Record<string, Partial<MonitoringBrandSettings>>;
  systemTitle: string;

  chatMessages: ChatMessage[];
  isStreaming: boolean;

  widgets: MonitoringGridWidget[];
  selectedWidgetId: string | null;
  addWidget: (widget: MonitoringGridWidget) => void;
  moveWidget: (id: string, grid: GridRect) => void;
  resizeWidget: (id: string, grid: GridRect) => void;
  updateWidgetConfig: (id: string, partial: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;

  mappingSources: MonitoringMappingSource[];
  mappingEdges: MonitoringMappingEdge[];

  pages: MonitoringPage[];
  addPage: (key: string, config: unknown) => void;
  removePage: (key: string) => void;

  publishSnapshot: () => MonitoringProjectSnapshot;
}
```

### 4.3 공통 재사용 가능/불가능 판단

재사용 가능:
- `FlowGuardModal`
- `ColorTokenPicker`
- `AiChatInput`
- `AIMILoader`
- `projectStore` 일부
- `solutionLoader`
- `brandPresets`의 일부 개념
- lucide/antd/framer-motion/dnd-kit/reactflow/recharts

직접 재사용 주의:
- `EditorLayout`: guard 결합이 강하므로 monitoring 분기 shell 권장
- `ChatPanel`: editorStore 직접 의존
- `DynamicPanel`: guard section/editorStore 직접 의존
- `MonitorWrapper`: guard-app 직접 의존
- `MappingCanvas`: guard core targets 직접 의존
- `OverlayCanvas`: pixel overlay라 monitoring 12grid와 다름
- `RightSidebarDropZone`: AIM GUARD 우측 패널 구조와 결합

재사용 금지에 가까움:
- `src/guard-app/**`
- `src/solutions/guard/**`
- `aim-guard/**`

## 5. AIM Monitoring 사업계획서 기반 위젯 설계

이미지의 차트 종류는 내용 참고 대상이 아니다.
이미지는 오직 좌측 라이브러리 구조, 2열 카드, 중앙 드롭 감각, 우측 설정 패널 구조만 참고한다.

| 번호 | 위젯 | 사업계획서 근거 | 기본 크기 | 주요 설정 |
|---|---|---|---|---|
| 1 | 설비 종합 상태 KPI | 설비 고장진단/예방정비 | 3x2 | 설비군, 기준 기간, 상태 기준 |
| 2 | 이상 조기 감지 점수 | Autoencoder 이상탐지 | 3x4 | 임계값, F1/F2 모드 |
| 3 | FFT 주파수 스펙트럼 | 진동 FFT, 1X/2X/3X | 5x5 | RPM, 피크 기준, 주파수 라벨 |
| 4 | 진동 시계열 | 3축 진동/가속도 | 5x4 | 축 선택, smoothing, 샘플링 |
| 5 | 초음파 아크 감지 | 40kHz 초음파/아크 | 4x4 | 중심 주파수, dB 기준 |
| 6 | 열/열화상 과열 맵 | 접점 온도/열화상 | 5x5 | ΔT, hotspot 기준 |
| 7 | 가스 농도 복합 카드 | CO/CH4/H2/C2H2 | 4x4 | 가스 종류, ppm 기준 |
| 8 | 작업자 생체 안전 | SpO2/맥파 | 4x4 | SpO2 기준, 작업자 그룹 |
| 9 | 쓰러짐/자세 변화 감지 | 가속도 SVM/Tilt | 4x4 | 민감도, 확인 지연 |
| 10 | 실내외 위치 맵 | UWB/IMU/GPS | 6x6 | 위치 소스, 구역/층 |
| 11 | 설비 잔여수명 예측 | LSTM/CNN-LSTM | 5x4 | 예측 기간, 신뢰구간 |
| 12 | 처방형 유지보수 추천 | Prescriptive Maintenance | 5x4 | 추천 톤, 액션 유형 |
| 13 | SOP 자동 실행 패널 | SOP 자동 실행 | 4x5 | SOP 템플릿, 승인 여부 |
| 14 | 알람 이벤트 타임라인 | 긴급 알람/원격 통보 | 5x4 | 이벤트 유형, 심각도 |
| 15 | 통신/데이터 동기화 상태 | BLE/LTE/Wi-Fi/LoRa/RS-485 | 4x3 | 통신 방식, retry |
| 16 | 데이터 파이프라인 상태 | DBMS/파이프라인 | 5x4 | 단계, 지연 기준 |
| 17 | 하이브리드 저장소/DBMS | 하이브리드 저장 전략 | 4x4 | retention, 저장 위치 |
| 18 | 예지보전 리포트 | 리포트 자동 생성 | 4x5 | 주기, 섹션, 다운로드 |
| 19 | F1/F2 모델 성능 비교 | F1/F2 기준 개발 | 5x4 | 모델 모드, 목표 점수 |
| 20 | 현장 실증/인증 진행률 | 2026~2028 실증/인증 | 5x4 | 마일스톤, 완료율 |

## 6. 단계별 실행 계획

### Phase 0. 감사 고도화

목표: 구현 전 현재 기능을 완전히 표로 만든다.

작업:
1. AIM GUARD 기능 인벤토리 문서 작성
2. 각 기능의 파일/상태/API/UI 이벤트 연결 정리
3. 수정 금지 파일과 공통 수정 가능 파일 분류
4. AIM Monitoring 동등 구현 여부 표시
5. 우선순위와 위험도 지정

산출물:
- `AIM_GUARD_FEATURE_AUDIT.md`
- `AIM_MONITORING_PARITY_MATRIX.md`

완료 조건:
- 기능 누락 의심 항목이 “미확인”으로 남아 있지 않을 것
- 남는 경우 “실작업 전 확인 필요”로 별도 목록화

### Phase 1. 안전한 스캐폴딩

목표: AIM GUARD를 건드리지 않고 Monitoring 뼈대만 세운다.

작업:
1. `src/solutions/monitoring` 생성
2. `src/data/monitoringScenarios.ts` 생성
3. `src/store/monitoringEditorStore.ts` 생성
4. `src/store/monitoringPagesStore.ts` 생성
5. `src/monitoring-app` 생성
6. `src/components/editor/monitoring` 생성

완료 조건:
- 신규 파일 중심
- guard 폴더 변경 없음
- build가 기존과 동일하게 통과

### Phase 2. 홈/Step2 연결

목표: AIM Monitoring 선택과 상담/하네스 생성 플로우 구현.

작업:
1. `marketplace.json`에 monitoring 등록
2. HomeHero에 AIM Monitoring 칩/카드 추가
3. AIM OPS 삭제
4. monitoring intent 추천 추가
5. Step2 질문/Blueprint solution 분기
6. CreateHarnessBtn solution 분기

완료 조건:
- AIM GUARD 홈 플로우 유지
- AIM Monitoring 홈 플로우 별도 작동

### Phase 3. Monitoring 에디터 shell

목표: `/editor?solution=monitoring` 진입 시 별도 에디터 표시.

작업:
1. `EditorPage`에서 solution 분기
2. `MonitoringEditorShell` 제작
3. 상단 메뉴/저장/확대/퍼블리시 UI 구현
4. 좌측/중앙/우측 패널 기본 배치
5. mapping/dashboard view 전환

완료 조건:
- `/editor`와 `/editor?solution=guard`는 기존 `EditorLayout`
- `/editor?solution=monitoring`은 새 shell

### Phase 4. Monitoring 중앙 앱

목표: AIM Monitoring 홈 대시보드와 설정 가능 영역 구현.

작업:
1. MonitoringLayout
2. MonitoringDashboard
3. 기본 페이지 라우팅
4. MonitoringEditableSection
5. 헤더/사이드바/주요 카드/상태바 선택 가능

완료 조건:
- AIM GUARD와 다른 제품 정체성
- 사업계획서 기반 설비/센서/AI/SOP 중심 화면

### Phase 5. 좌측 채팅/위젯 탭

목표: 기존 채팅 기능 동등성 + 신규 위젯 탭.

작업:
1. MonitoringLeftPanel
2. Chat tab
3. Widget tab
4. 위젯 20개 2열 라이브러리
5. drag ghost
6. 채팅 자연어 명령

완료 조건:
- 채팅 탭에서 기존 명령군 동등 처리
- 위젯 탭에서 20개 위젯 드래그 가능

### Phase 6. 12그리드 캔버스

목표: Monitoring 핵심 기능 구현.

작업:
1. 12 column grid
2. row height/gap
3. drop snap
4. drag move
5. resize handle
6. collision detection
7. widget config persistence

완료 조건:
- 위젯이 자유롭게 배치/크기조절 가능
- 작은/큰 크기에서 레이아웃 깨짐 없음

### Phase 7. 위젯 20개 제작

목표: placeholder가 아니라 사업계획서 기반 고품질 위젯.

작업:
1. 공통 frame
2. 20개 위젯 컴포넌트
3. mock 데이터
4. responsive rendering
5. inspector config 연결

완료 조건:
- 각 위젯이 독립적으로 의미가 있음
- 사업계획서 내용이 화면에서 드러남

### Phase 8. 우측 인스펙터/데이터 매핑

목표: 선택한 섹션/위젯을 우측에서 편집.

작업:
1. MonitoringInspectorPanel
2. 브랜드 설정
3. 섹션별 스타일 설정
4. 위젯별 데이터/스타일/인터랙션 설정
5. MonitoringMappingCanvas
6. API/file/demo data source

완료 조건:
- AIM GUARD의 우측 설정 경험과 동등
- Monitoring 데이터 구조에 맞는 매핑 제공

### Phase 9. 페이지 추가 하네스

목표: AIM GUARD 페이지 추가 기능을 Monitoring식으로 별도 구현.

Monitoring 추가 페이지 후보:
- 설비 자산 관리
- 센서 스트림
- AI 진단
- 작업자 안전
- SOP 센터
- 예지보전 리포트
- 데이터 파이프라인
- 시스템 설정

각 페이지는:
- 페이지 선택
- 기능 설정 질문 3개
- 실시간 MD 미리보기
- 페이지 생성
- 사이드바 추가
- 삭제 가능

완료 조건:
- AIM GUARD PageAddModal과 UX 동등
- 내용은 Monitoring 전용

### Phase 10. 퍼블리시/프로젝트/런타임

목표: 저장/프로젝트 실행까지 완성.

작업:
1. publish snapshot schema 확장
2. Monitoring project 저장
3. `/monitoring` route 생성
4. ProjectsGrid solution별 라벨/색/실행 route 분기
5. 저장된 layout/widget/page config 복원

완료 조건:
- 프로젝트 목록에서 AIM Monitoring 실행 가능
- guard project와 monitoring project가 섞여도 정상

### Phase 11. 회귀 테스트

목표: AIM GUARD가 그대로 살아 있는지 확인.

검증:
- 홈 AIM GUARD 선택
- AIM GUARD Step2
- 전문가 추천세팅
- 하네스 생성
- AIM GUARD editor
- 좌측 채팅
- 위젯 생성
- 브랜드 프리셋
- 데이터 매핑
- 우측 패널 설정
- 페이지 추가
- CCTV/Events/Stats/Rules/Settings
- 퍼블리시
- 프로젝트 실행
- `/guard`

## 7. 실작업 전 추가로 확인할 것

아직 완전히 확인하지 못한 영역:

1. `src/components/editor/SettingsPanel.tsx`
2. `src/components/editor/BrandKitControls.tsx`
3. `src/components/editor/FloatingToolbar.tsx`
4. `src/components/editor/CanvasPanel.tsx`
5. `src/components/editor/MappingPanel.tsx`
6. `src/guard-app/pages/admin/*` 전체 세부 기능
7. `/app/api/harness/route.ts`의 최종 harness 생성 구조
8. `src/data/projects.json` 정적 프로젝트 구조
9. `src/lib/brandPresets.ts` 전체 토큰 구조
10. 실제 브라우저에서 AIM GUARD 인터랙션 시각 확인

이 항목은 구현 전에 추가 감사해야 한다.

## 8. 구현 방식 의사결정

### 선택지 A. 기존 EditorLayout에 solution 분기 추가

장점:
- 빠르다.
- 기존 기능 일부를 바로 재사용할 수 있다.

단점:
- AIM GUARD 회귀 위험이 크다.
- editorStore 충돌 가능성이 높다.
- Monitoring 12그리드와 guard pixel overlay가 섞인다.

판단:
- 기각.

### 선택지 B. Monitoring 별도 EditorShell 제작

장점:
- AIM GUARD 보호에 가장 안전하다.
- Monitoring 전용 12그리드/위젯/store 설계가 쉽다.
- 기능 동등성을 명확히 관리할 수 있다.

단점:
- 시간이 더 걸린다.
- AIM GUARD 기능을 하나씩 재구현해야 한다.

판단:
- 채택.

## 9. 예상 난이도

가장 어려운 부분:
1. AIM GUARD 기능 누락 없이 전체 감사
2. 좌측 채팅 자연어 명령 동등 구현
3. 20개 위젯 품질
4. 12그리드 배치/리사이즈/충돌 처리
5. 데이터 매핑 studio 동등 구현
6. 페이지 추가 하네스 동등 구현
7. 프로젝트 publish/restore

중간 난이도:
- 홈/Step2 분기
- solution manifest 등록
- 기본 Monitoring dashboard 제작
- 프로젝트 카드 라벨/라우트 분기

낮은 난이도:
- AIM OPS 삭제
- AIM Monitoring 카드 추가
- 기본 route 생성

## 10. 내가 실제로 작업할 때의 운영 방식

작업은 천천히 하되 다음 순서로 진행한다.

1. 감사 문서 작성
2. 사용자가 방향 확인
3. 스캐폴딩만 먼저 구현
4. AIM GUARD 회귀 확인
5. 홈/Step2 연결
6. AIM GUARD 회귀 확인
7. Monitoring shell 구현
8. AIM GUARD 회귀 확인
9. 위젯/그리드 구현
10. AIM GUARD 회귀 확인
11. 데이터 매핑/페이지 추가/퍼블리시 구현
12. 전체 QA

각 단계는 작은 단위로 끝내고, 끝날 때마다 다음을 보고한다.

- 변경한 파일
- AIM GUARD에 영향 가능성이 있는 파일
- 통과한 검증
- 남은 위험
- 다음 단계

## 11. 3개월 기준 실행 로드맵

사용자는 이 작업을 3개월 과제로 보고 있다.
따라서 이 프로젝트는 단기 데모 패치가 아니라 `정확도 우선 제품화 작업`으로 운영한다.

핵심 원칙:
- 빨리 만드는 것보다 빠뜨리지 않는 것이 우선이다.
- 매주 산출물을 남긴다.
- 매 단계마다 AIM GUARD 회귀를 확인한다.
- 기능이 애매하면 구현하지 않고 먼저 명세를 확정한다.
- Monitoring은 처음부터 별도 제품으로 설계한다.

### Month 1. 감사, 구조 분리, 홈/Step2

목표:
- AIM GUARD 기능 전체를 기능 단위로 파악한다.
- AIM Monitoring의 별도 구조를 만든다.
- 홈/Step2/하네스 진입까지 안정적으로 연결한다.

#### Week 1. AIM GUARD 전체 기능 감사

작업:
- AIM GUARD 기능 인벤토리 작성
- 화면별 기능 목록 작성
- store/API/컴포넌트 의존성 추적
- 수정 금지 파일 확정
- 회귀 테스트 체크리스트 작성

산출물:
- `AIM_GUARD_FEATURE_AUDIT.md`
- `AIM_GUARD_REGRESSION_CHECKLIST.md`

완료 기준:
- 기능을 “대충 알고 있음” 상태에서 벗어난다.
- 각 기능마다 현재 파일 위치와 Monitoring 대응 방향이 기록된다.

#### Week 2. AIM Monitoring 아키텍처 확정

작업:
- Monitoring 별도 shell/store/page/widget 구조 확정
- AI Studio로 제작된 AIM Monitoring 에디터/대시보드 산출물 위치 확인
- `AIM_MONITORING_AI_STUDIO_ASSET_AUDIT.md` 작성
- 기존 디자인을 그대로 사용할 부분과 기능 확장으로 제작할 부분 구분
- project snapshot schema 설계
- monitoringScenarios 질문 확정
- 20개 위젯 데이터 모델 확정
- 12그리드 모델 확정

산출물:
- `AIM_MONITORING_ARCHITECTURE.md`
- `AIM_MONITORING_WIDGET_SPEC.md`
- `AIM_MONITORING_GRID_SPEC.md`
- `AIM_MONITORING_AI_STUDIO_ASSET_AUDIT.md`

완료 기준:
- 구현자가 바뀌어도 만들 수 있을 정도로 구조가 명확해야 한다.
- AIM GUARD와 공유할 것/분리할 것이 명확해야 한다.
- AI Studio 디자인 산출물을 찾았고, 어떤 파일을 그대로 사용할지 명확해야 한다.

#### Week 3. 스캐폴딩 및 홈 연결

작업:
- `src/solutions/monitoring` 생성
- `src/store/monitoringEditorStore.ts` 생성
- `src/store/monitoringPagesStore.ts` 생성
- HomeHero에 AIM Monitoring 추가
- AIM OPS 삭제
- monitoring Step2 진입 연결

완료 기준:
- 홈에서 AIM Monitoring을 선택할 수 있다.
- AIM GUARD 홈 플로우는 변하지 않는다.
- `/editor?solution=monitoring` 진입 준비가 된다.

#### Week 4. Monitoring Step2/하네스

작업:
- 사업계획서 기반 질문 구현
- 전문가 추천세팅 구현
- monitoring blueprint 생성
- 하네스 저장 payload에 solution 포함
- 생성 버튼 monitoring route 분기

완료 기준:
- AIM Monitoring Step2가 AIM GUARD와 명확히 다르다.
- 사업계획서의 센서/AI/SOP/리포트 맥락이 반영된다.
- AIM GUARD Step2는 기존 그대로 작동한다.

Month 1 게이트:
- 홈과 Step2까지 동작한다.
- 아직 완성된 에디터가 없어도 된다.
- AIM GUARD 회귀가 없어야 한다.

### Month 2. Monitoring 에디터, 위젯, 12그리드

목표:
- AIM Monitoring 별도 에디터를 실제로 만든다.
- 20개 위젯과 12그리드 배치를 핵심 품질로 구현한다.

#### Week 5. MonitoringEditorShell

작업:
- `/editor?solution=monitoring` 분기
- MonitoringEditorShell 제작
- 상단 메뉴/저장/확대/퍼블리시 기본 UI
- 좌측/중앙/우측 레이아웃
- dashboard/mapping view 전환

완료 기준:
- guard는 기존 EditorLayout, monitoring은 새 shell을 탄다.
- AIM GUARD 코드가 오염되지 않는다.

#### Week 6. Monitoring 중앙 앱

작업:
- AI Studio 디자인 산출물을 기준으로 MonitoringLayout 제작
- AI Studio 디자인 산출물을 기준으로 MonitoringDashboard 제작
- 설비/환경/작업자/AI/SOP 요약 화면 제작
- MonitoringEditableSection 제작
- section 선택 및 우측 inspector 연결

완료 기준:
- 중앙 화면이 AIM GUARD가 아니라 AIM Monitoring 제품처럼 보인다.
- 새 디자인을 임의로 만들지 않고 AI Studio의 AIM Monitoring 디자인을 따른다.
- 주요 영역을 클릭해 설정할 수 있다.

#### Week 7. 좌측 채팅/위젯 탭

작업:
- MonitoringLeftPanel
- MonitoringChatTab
- MonitoringWidgetTab
- 20개 위젯 라이브러리
- 위젯 카드 2열 구조
- 자연어 명령 기본 처리

완료 기준:
- 채팅 탭과 위젯 탭이 모두 작동한다.
- 위젯 내용은 이미지가 아니라 사업계획서 기반이다.

#### Week 8. 12그리드 드래그/리사이즈

작업:
- MonitoringGridCanvas
- drop snap
- drag move
- resize handles
- collision handling
- responsive constraints
- 선택 위젯 floating control

완료 기준:
- 위젯을 12그리드에 배치할 수 있다.
- 가로/세로 스케일 조절이 된다.
- 레이아웃이 깨지지 않는다.

Month 2 게이트:
- AIM Monitoring 에디터의 핵심 경험이 보인다.
- 아직 데이터 매핑/페이지 추가가 완성되지 않아도 된다.
- 위젯과 그리드는 품질 타협 없이 간다.

### Month 3. 기능 동등성, 퍼블리시, QA

목표:
- AIM GUARD가 제공하던 세부 기능을 AIM Monitoring에도 닫는다.
- 프로젝트 저장/실행과 QA까지 끝낸다.

#### Week 9. 우측 인스펙터 고도화

작업:
- 브랜드 설정
- 섹션별 스타일 설정
- 위젯별 데이터/스타일/인터랙션 설정
- 타이틀, 색상, 폰트, 임계값, 단위, 데이터 소스 편집
- 선택 위젯 상태 동기화

완료 기준:
- 선택한 위젯은 우측 패널에서 실질적으로 편집 가능하다.
- 변경 사항이 즉시 중앙 화면에 반영된다.

#### Week 10. 데이터 매핑 Studio

작업:
- MonitoringMappingCanvas
- monitoring core target 정의
- 센서 데이터 소스 정의
- file/API/demo source 추가
- source field와 widget property 연결
- 연결 시 mock data 반영

완료 기준:
- AIM GUARD 데이터 매핑과 UX 동등
- 데이터 내용은 Monitoring 전용

#### Week 11. 페이지 추가/퍼블리시/프로젝트

작업:
- MonitoringPageAddModal
- Monitoring 페이지 후보 8개
- 질문 3개 + MD 미리보기
- 사이드바 추가/삭제
- publish snapshot 저장
- `/monitoring` route
- ProjectsGrid solution별 실행 분기

완료 기준:
- AIM Monitoring 프로젝트를 저장하고 실행할 수 있다.
- 페이지 추가 하네스가 AIM GUARD와 같은 수준으로 작동한다.

#### Week 12. 전체 QA/회귀/폴리싱

작업:
- AIM GUARD 전체 회귀
- AIM Monitoring 전체 플로우 QA
- 1440/1920/노트북 뷰포트 확인
- lint/build
- 사용 시나리오 리허설
- 누락 기능 리스트 최종 정리

완료 기준:
- AIM GUARD 기존 기능 유지
- AIM Monitoring end-to-end 데모 가능
- 치명적 UI 겹침/오작동 없음

Month 3 게이트:
- 데모 가능한 수준이 아니라, 반복 시연 가능한 수준이어야 한다.
- 프로젝트 저장 후 다시 열어도 핵심 구성이 유지되어야 한다.

## 12. 일정 운영 방식

3개월 동안 매주 다음 형식으로 진행한다.

```txt
이번 주 목표:
작업한 파일:
AIM GUARD 영향 가능성:
완료한 기능:
검증 결과:
남은 위험:
다음 주 작업:
```

작업 속도 기준:
- 기능 하나를 빨리 끝내는 것보다, 기능 하나의 의존성과 회귀 위험을 정확히 닫는다.
- 애매한 구현은 임시로 넣지 않는다.
- “일단 되게”보다 “나중에 안 무너지게”를 우선한다.

## 13. 현재 결론

사용자가 우려한 대로, AIM GUARD의 모든 기능을 AIM Monitoring에 “그대로” 구현하는 것은 단순 작업이 아니다.

하지만 불가능한 작업은 아니다.

성공 조건은 속도가 아니라 다음이다.

- 기존 기능을 먼저 정확히 파악한다.
- AIM GUARD 코드를 직접 건드리지 않는다.
- Monitoring을 별도 제품으로 만든다.
- 기능 동등성 매트릭스를 기준으로 하나씩 닫는다.
- 매 단계마다 AIM GUARD 회귀를 확인한다.

현재 `AIM_GUARD_FEATURE_AUDIT.md` 1차 문서는 작성되었다.
현재 `AIM_MONITORING_WIDGET_SPEC.md` 1차 문서도 사업계획서 기반으로 작성되었다.
현재 `AIM_GUARD_REGRESSION_CHECKLIST.md` 1차 문서도 작성되었다.
현재 `AIM_MONITORING_GRID_SPEC.md` 1차 문서도 작성되었다.
현재 `AIM_MONITORING_ARCHITECTURE.md` 1차 문서도 작성되었다.
현재 `AIM_MONITORING_STEP2_SCENARIO_SPEC.md` 1차 문서도 작성되었다.
현재 `AIM_MONITORING_PROJECT_SNAPSHOT_SPEC.md` 1차 문서도 작성되었다.
현재 `AIM_MONITORING_AI_STUDIO_PORTING_MAP.md` 1차 문서도 작성되었다.
현재 `AIM_MONITORING_IMPLEMENTATION_GATE.md` 1차 문서도 작성되었다.

다음 실제 작업은 코드 구현이 아니라 아래 문서와 기준을 더 닫는 것이다.

```txt
1. AIM GUARD 회귀 체크리스트를 실제 실행 가능한 테스트 순서로 보강
2. Month 1 Week 3 스캐폴딩 작업 범위 확정
3. 첫 구현 PR/작업 단위의 파일 변경 범위 확정
4. 빌드/검증 명령 확정
5. AIM Monitoring 하위 앱 의존성 설치/독립 빌드 검증 여부 결정
```

이 5개가 닫히면 Month 1 Week 3의 스캐폴딩으로 넘어간다.
