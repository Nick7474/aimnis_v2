# AIM GUARD 기능 감사 및 AIM Monitoring 동등 구현 기준

작성일: 2026-06-06
작성자: Codex
상태: 1차 감사 문서

## 0. 목적

이 문서는 AIM Monitoring 구현 전에 기존 AIM GUARD 기능을 최대한 빠짐없이 파악하기 위한 기준 문서다.

대표님 지시사항의 핵심은 다음이다.

1. AIM GUARD는 절대 건드리지 않는다.
2. AIM Monitoring은 별도 솔루션으로 만든다.
3. AIM GUARD가 가진 기능 경험은 AIM Monitoring에도 동등하게 제공한다.
4. 단, AIM Monitoring은 좌측 위젯 탭, 20개 핵심 위젯, 12그리드 배치/리사이즈, 우측 위젯 편집이 핵심 차별점이다.

따라서 이 문서는 “복붙 대상 목록”이 아니라 “기능 동등성 계약서”다.

## 1. 절대 보호 대상

아래 영역은 기본적으로 수정 금지다.

```txt
src/guard-app/**
src/solutions/guard/**
src/components/editor/MonitorWrapper.tsx
src/components/editor/OverlayCanvas.tsx
src/components/editor/RightSidebarDropZone.tsx
src/components/editor/MappingCanvas.tsx
src/components/editor/panels/DynamicPanel.tsx
src/store/editorStore.ts
src/store/guardPagesStore.ts
```

예외적으로 플랫폼 연결을 위해 수정이 필요할 수 있는 영역:

```txt
src/app/editor/page.tsx
src/components/home/**
src/data/marketplace.json
src/lib/solutionLoader.ts
src/store/projectStore.ts
src/components/projects/**
src/components/layout/Navbar.tsx
src/styles/tokens.css
```

예외 수정 조건:

- guard 결과가 기존과 동일해야 한다.
- solution 분기는 `guard` 기본값을 유지해야 한다.
- 새 기능은 `monitoring` 경로와 store로 격리해야 한다.
- 수정 후 AIM GUARD 회귀 체크리스트를 통과해야 한다.

## 2. 현재 확인된 진입 흐름

### 2.1 홈 화면

관련 파일:

```txt
src/components/home/HomeHero.tsx
src/components/home/HomePhase2.tsx
src/components/home/CreateHarnessBtn.tsx
src/components/home/ActiveWorkspace.tsx
src/store/homeStore.ts
src/data/scenarios.ts
src/app/api/home/route.ts
src/app/api/interview/route.ts
```

현재 기능:

- 상단 자연어 채팅 입력
- 파일 첨부 후 분석 단계 표시
- 솔루션 칩 선택
- 3개 시나리오 칩 표시
- AI 응답에서 시나리오 추천 marker 파싱
- 시나리오 선택 시 Step2 진입
- 하단 솔루션 플랫폼 카드 표시
- 시작하기 버튼 클릭 시 Step2 또는 에디터 이동

현재 guard 결합:

- 기본 solution은 `guard`다.
- `CreateHarnessBtn.tsx`는 `/editor?solution=guard`로 하드코딩되어 있다.
- `ActiveWorkspace.tsx`도 guard 이동 경로를 가진다.
- `scenarios.ts`는 CCTV/보안 중심 질문을 포함한다.
- `HomeHero.tsx`의 roadmap에 `AIM OPS`가 있다.

AIM Monitoring 구현 기준:

- AIM GUARD 오른쪽에 AIM Monitoring 노출
- AIM OPS 삭제 후 총 6개 카드 유지
- AIM Monitoring은 `available`
- 자연어에서 monitoring 의도를 감지하면 activeSolution을 monitoring으로 전환
- 기존 3개 시나리오는 유지 가능하나 질문 내용은 Monitoring 전용으로 재해석
- Step2 진입 시 selectedSolution이 유지되어야 함
- 하네스 생성 시 `/editor?solution=monitoring&scenario=...` 이동

## 3. 에디터 shell 기능 감사

관련 파일:

```txt
src/app/editor/page.tsx
src/components/editor/EditorLayout.tsx
src/components/editor/FloatingToolbar.tsx
src/components/editor/ChatPanel.tsx
src/components/editor/MonitorWrapper.tsx
src/components/editor/OverlayCanvas.tsx
src/components/editor/RightSidebarDropZone.tsx
src/components/editor/MappingCanvas.tsx
src/components/editor/panels/DynamicPanel.tsx
src/store/editorStore.ts
```

현재 AIM GUARD editor 기능:

- 고정 3패널 레이아웃
- 상단 로고/솔루션명
- 모니터/데이터 매핑 전환
- 편집 패널 토글
- 저장 상태 표시
- 확대 모드
- 퍼블리시 모달
- 프로젝트 저장
- 프로젝트 보기 이동
- AIM GUARD 실행 이동
- 좌측 채팅 패널 폭 리사이즈
- 우측 패널 열림 시 좌측 패널 슬라이드
- 우측 패널 열림 시 좌측 패널 딤/닫기 핸들
- 접근 보호 모달
- 전체 화면 overflow 고정
- DnD context 기반 중앙/우측 드래그 처리

guard 결합 위험:

- `EditorLayout`이 `useEditorStore`를 직접 사용한다.
- top nav에 `/guard`가 직접 포함되어 있다.
- 퍼블리시 완료 후 `/guard`로 이동한다.
- 중앙 monitor는 `MonitorWrapper`, overlay는 `OverlayCanvas`로 고정되어 있다.
- mapping은 guard data connectors/core target 기준이다.

AIM Monitoring 구현 기준:

- `/editor?solution=monitoring`에서 `MonitoringEditorShell`로 분기
- 기존 `EditorLayout`은 guard 기본 흐름으로 유지
- 상단/좌측/우측 UX 패턴은 복제
- store는 `monitoringEditorStore` 사용
- 중앙은 AI Studio 포팅 앱 + 12그리드 편집 레이어
- 퍼블리시 완료 후 `/monitoring?project=...` 또는 저장된 프로젝트 보기 제공

## 4. 좌측 채팅 패널 기능 감사

관련 파일:

```txt
src/components/editor/ChatPanel.tsx
src/lib/intentParser.ts
src/lib/brandAgent.ts
src/app/api/chat/route.ts
src/store/editorStore.ts
```

현재 기능:

- welcome message
- 사용자 메시지 추가
- assistant streaming 표시
- 빠른 힌트 버튼
- 로컬 intent parser
- 브랜드 프리셋 제안
- 브랜드명/제품명/시스템 타이틀 변경
- mapping/monitor 전환
- 위젯 전체 삭제
- API chat 호출
- `__WIDGET_JSON__` 파싱
- 생성 위젯을 overlay widget으로 추가
- 로그/작업 상태 표시

guard 결합 위험:

- 위젯 타입이 guard용 6개 중심이다.
- `useEditorStore`에 직접 쓰기한다.
- overlay 좌표 기준으로 위젯을 생성한다.
- Monitoring 요구의 12그리드 배치 모델과 맞지 않는다.

AIM Monitoring 구현 기준:

- `MonitoringLeftPanel` 안에 `Chat` 탭과 `Widgets` 탭 구성
- `MonitoringChatTab`은 기존 ChatPanel UX를 복제하되 store 분리
- `MonitoringWidgetTab`은 2열 10행 구조
- 채팅에서 위젯 생성 시 Monitoring 20개 위젯 중 적절한 타입 생성
- 생성 위치는 12그리드의 빈 공간 자동 배치
- 기존 AIM GUARD ChatPanel은 수정하지 않거나, solution adapter를 만들더라도 guard 동작 불변 검증 후 적용

## 5. 중앙 AIM GUARD 화면 기능 감사

관련 파일:

```txt
src/components/editor/MonitorWrapper.tsx
src/components/editor/EditableSection.tsx
src/store/guardPagesStore.ts
src/guard-app/**
```

현재 기능:

- AIM GUARD 앱을 MemoryRouter로 에디터 안에 렌더링
- 자동 로그인
- Ant Design 테마 적용
- 헤더/사이드바/컨텐츠/상태바
- 브랜드 CSS 변수 적용
- header/sidebar/map/alarm/floor-status 편집 진입
- 페이지 추가 버튼
- PageAddModal
- 추가 페이지 생성/삭제
- CCTV/Events/Stats/Admin pages 연결
- 알람 패널/플로어 상태 숨김 처리

guard 결합 위험:

- guard CSS 변수와 guard pages에 강결합
- 페이지 추가 질문이 guard 업무 중심
- EditableSection이 editorStore와 panelType에 묶여 있음

AIM Monitoring 구현 기준:

- `MonitoringAppWrapper` 신규
- AI Studio `AIM Monitoring/src` 화면을 `src/monitoring-app`로 포팅
- `MonitoringEditableRegion` 신규
- header/sidebar/content/card/widget 선택 시 우측 inspector 열기
- 페이지 추가는 monitoring pages 기준으로 별도 구현
- 기존 `MonitorWrapper`는 수정하지 않음

## 6. 오버레이/위젯 기능 감사

관련 파일:

```txt
src/components/editor/OverlayCanvas.tsx
src/components/editor/RightSidebarDropZone.tsx
src/components/editor/widgets/**
src/components/editor/SmartGridEngine.ts
src/store/editorStore.ts
```

현재 기능:

- overlay widget 목록 표시
- 위젯 선택/삭제
- pixel 좌표 이동
- floating style
- LIVE 뱃지
- DragOverlay ghost
- 우측 패널로 이동
- 우측 패널 내부 순서 변경
- 우측 패널에서 숨김/삭제/복원

Monitoring 요구와의 차이:

- 기존은 pixel absolute overlay다.
- AIM Monitoring은 12그리드 기반 자유 배치/리사이즈가 핵심이다.
- 기존 우측 패널 드롭은 guard 우측 패널에 위젯을 보내는 개념이다.
- AIM Monitoring은 중앙 콘텐츠 컨테이너 안에서 위젯을 직접 편집한다.

AIM Monitoring 구현 기준:

- `MonitoringGridCanvas`
- `MonitoringGridItem`
- `MonitoringGridResizeHandles`
- `MonitoringWidgetFrame`
- 12 columns, row height 기준
- widget별 min/max grid size
- drag collision 처리
- resize collision 처리
- 빈 공간 자동 배치
- 선택 위젯 floating toolbar
- 우측 inspector에서 title/data/style/options 수정

## 7. 우측 설정 패널 기능 감사

관련 파일:

```txt
src/components/editor/panels/DynamicPanel.tsx
src/components/editor/SettingsPanel.tsx
src/components/editor/BrandKitControls.tsx
src/components/editor/ColorTokenPicker.tsx
src/components/editor/MappingPanel.tsx
```

현재 기능:

- 선택 요소에 따른 inspector 전환
- 브랜드 설정
- 헤더/로고/서비스명
- 사이드바 스타일
- 맵 스타일
- 알람 패널 severity 색상
- 위젯 속성
- 데이터 매핑 진입
- 컬러 토큰 선택
- 브랜드 프리셋 저장/복원

guard 결합 위험:

- section type이 guard 중심이다.
- panel type이 guard 섹션 중심이다.
- widget property가 6개 guard 위젯 기준이다.

AIM Monitoring 구현 기준:

- `MonitoringInspectorPanel` 신규
- 탭: `브랜드`, `데이터`, `스타일`, `옵션`, `인터랙션`
- 선택 대상: app shell, sidebar, header, page, card, grid widget
- 위젯별 schema 기반 inspector
- 공통 필드: title, subtitle, dataSource, refreshInterval, threshold, severity, color, displayMode
- 고급 필드: modelMetric, sensorChannel, sopPolicy, fallDetectionWindow, fScoreMode

## 8. 데이터 매핑 기능 감사

관련 파일:

```txt
src/components/editor/MappingCanvas.tsx
src/components/editor/mappingUtils.ts
src/components/editor/mapping-nodes/**
src/store/editorStore.ts
```

현재 기능:

- ReactFlow 기반 데이터 매핑
- demo/file/folder/api source
- 파일/폴더 drop parsing
- API endpoint source 생성
- source field와 target property 연결
- 연결 edge 삭제
- mock data를 widget에 반영
- core target 표시

guard 결합 위험:

- core target이 guard map/alarm/floor/CCTV 중심이다.
- mapping source 샘플도 guard 중심이다.

AIM Monitoring 구현 기준:

- `MonitoringMappingCanvas` 신규
- source categories:
  - ultrasonic
  - vibration
  - thermal
  - gas
  - worker-bio
  - imu
  - communication
  - ai-diagnosis
  - sop-events
  - field-validation
- target categories:
  - AI Studio dashboard cards
  - 20개 grid widgets
  - alerts/events
  - reports
  - SOP center
- mapping snapshot은 project publish에 포함

## 9. 페이지 추가 기능 감사

관련 파일:

```txt
src/components/editor/MonitorWrapper.tsx
src/store/guardPagesStore.ts
src/guard-app/pages/**
```

현재 기능:

- 좌측 메뉴 하단 페이지 추가 버튼
- 페이지 타입 선택
- 3개 질문 기반 설정
- MD 미리보기
- 페이지 생성
- 좌측 메뉴에 추가
- 추가 페이지 삭제

AIM Monitoring 구현 기준:

- `monitoringPagesStore` 신규
- `MonitoringPageAddModal` 신규
- 기본 페이지:
  - 홈
  - 통합 대시보드
  - 설비 진단
  - 환경 진단
  - 작업자 안전
  - 알림/이벤트
  - 리포트
  - 설정
- 추가 페이지 후보:
  - 설비별 상세
  - 센서 스트림
  - AI 모델 성능
  - SOP 실행센터
  - 현장 실증
  - 통신/게이트웨이
  - 예지보전 리포트
- 질문/MD는 사업계획서 도메인 기반

## 10. 프로젝트/퍼블리시 기능 감사

관련 파일:

```txt
src/store/projectStore.ts
src/components/projects/ProjectsGrid.tsx
src/components/layout/Navbar.tsx
src/app/guard/page.tsx
```

현재 기능:

- projectStore localStorage persist
- solution별 version 자동 증가
- name/client/description/versionNote 저장
- brandSnapshot 저장
- sectionStylesSnapshot 저장
- systemTitle 저장
- 프로젝트 목록
- 수정/실행/삭제/URL 복사
- guard 실행 라벨과 route

guard 결합 위험:

- 실행 버튼 라벨이 AIM GUARD로 고정되어 있다.
- `/monitoring` route가 없다.
- Monitoring grid/widget/page/mapping snapshot 필드가 없다.

AIM Monitoring 구현 기준:

- project solution에 `monitoring` 허용
- Monitoring publish snapshot:
  - brand
  - section styles
  - system title
  - page list
  - active page
  - grid layout
  - widget config
  - mapping sources/edges
  - AI Studio app config
- 프로젝트 실행 버튼은 solution label 기반
- `/monitoring?project={id}` route 신규

## 11. 기능 동등성 체크리스트

| 기능군 | AIM GUARD 현재 기능 | AIM Monitoring 구현 상태 기준 | 위험도 |
|---|---|---|---|
| 홈 솔루션 선택 | chip/card | monitoring chip/card 추가 | 중 |
| 자연어 안내 | scenario 추천 | monitoring 의도 감지 | 중 |
| Step2 질문 | guard 질문 | monitoring 질문 세트 | 중 |
| 전문가 추천 | defaultSpecs | monitoring defaultSpecs | 낮음 |
| 하네스 생성 | guard route | monitoring route | 중 |
| 에디터 shell | 3패널 | MonitoringEditorShell | 중 |
| 좌측 채팅 | 채팅/위젯 생성 | Chat + Widget tabs | 높음 |
| 위젯 생성 | 6개 overlay | 20개 12grid | 높음 |
| 중앙 앱 | guard app | AI Studio app 포팅 | 높음 |
| 편집 진입 | floating settings | 동일 UX | 중 |
| 우측 inspector | guard panels | monitoring panels | 높음 |
| 데이터 매핑 | guard targets | monitoring targets | 높음 |
| 페이지 추가 | guard pages | monitoring pages | 높음 |
| 퍼블리시 | projectStore | snapshot 확장 | 중 |
| 프로젝트 실행 | /guard | /monitoring | 중 |
| 회귀 안정성 | 현 상태 유지 | guard no regression | 최고 |

## 12. 구현 전 게이트

본격 구현은 아래가 완료된 뒤 시작한다.

- [ ] AIM GUARD 회귀 체크리스트 작성
- [ ] AIM Monitoring solution manifest 설계
- [ ] Monitoring editor shell 설계 확정
- [ ] Monitoring store schema 확정
- [ ] AI Studio 포팅 대상 파일 목록 확정
- [ ] 20개 위젯 spec 확정
- [ ] 12그리드 엔진 설계 확정
- [ ] project snapshot schema 확정
- [ ] Step2 질문/Blueprint 문구 확정
- [ ] 독립 빌드 또는 본 앱 포팅 빌드 검증 계획 확정

## 13. 회귀 테스트 기준

구현 단계마다 아래를 확인한다.

1. `/home`에서 AIM GUARD 시작하기가 기존처럼 동작한다.
2. 자연어 guard 시나리오 추천이 기존처럼 동작한다.
3. Step2 guard 질문과 Blueprint가 기존처럼 동작한다.
4. `현장 맞춤 솔루션 생성하기`가 guard editor로 이동한다.
5. `/editor?solution=guard`가 기존 editor를 렌더링한다.
6. guard 채팅 패널에서 기존 위젯 생성이 동작한다.
7. guard overlay drag가 동작한다.
8. guard right panel drop이 동작한다.
9. guard 데이터 매핑이 동작한다.
10. guard 페이지 추가가 동작한다.
11. guard 브랜드/컬러/폰트 설정이 동작한다.
12. guard 퍼블리시가 projectStore에 저장된다.
13. `/guard` 실행 화면이 기존처럼 동작한다.

## 14. 현재 결론

모든 AIM GUARD 기능을 그대로 “코드 이식”하는 것은 위험하다.
하지만 모든 AIM GUARD 기능을 “사용자 경험과 결과 기준으로 동등 구현”하는 것은 가능하다.

가장 안전한 방식은 다음이다.

1. guard 코드는 보존한다.
2. monitoring 전용 shell/store/components를 만든다.
3. 필요한 플랫폼 연결만 solution 분기로 최소 수정한다.
4. 각 단계마다 guard 회귀 체크를 실행한다.
