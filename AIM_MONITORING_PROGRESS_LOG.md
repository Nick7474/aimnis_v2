# AIM Monitoring 진행 로그

## 2026-06-06 1차 스캐폴딩

### 목표

AIM GUARD를 건드리지 않고 AIM Monitoring을 별도 솔루션으로 등록하고, `/editor?solution=monitoring`이 기존 guard editor가 아닌 Monitoring 전용 shell로 진입하도록 만든다.

### 작업한 파일

신규:

```txt
src/solutions/monitoring/manifest.json
src/solutions/monitoring/harness-schema.json
src/solutions/monitoring/templates/default.json
src/solutions/monitoring/widgets/index.json
src/components/monitoring-editor/MonitoringEditorShell.tsx
```

수정:

```txt
src/data/marketplace.json
src/app/editor/page.tsx
src/store/homeStore.ts
src/components/home/HomeHero.tsx
src/components/home/CreateHarnessBtn.tsx
src/components/home/ActiveWorkspace.tsx
src/components/home/HomeV2.tsx
tsconfig.json
```

### 구현 내용

- AIM Monitoring solution manifest 추가
- monitoring harness schema 추가
- monitoring 기본 template 추가
- 사업계획서 기반 20개 widget registry 추가
- marketplace에 AIM Monitoring 등록
- AIM OPS roadmap card 제거
- homeStore에 `selectedSolution` 추가
- 홈에서 선택한 solution이 Step2와 하네스 생성까지 이어지도록 연결
- 하네스 payload에 `solution` 저장
- `/editor?solution=monitoring`을 `MonitoringEditorShell`로 분기
- `/editor?solution=guard`는 기존 `EditorLayout` 유지
- `AIM Monitoring/` AI Studio 원본 폴더를 Next 타입체크 대상에서 제외

### 검증

```txt
npm run build
```

결과:

- 통과
- 최초 샌드박스 실행은 `.next/trace` EPERM으로 실패
- 권한 승인 후 실제 빌드는 통과
- AI Studio 원본 폴더가 타입체크에 포함되어 실패했던 문제는 `tsconfig.json` exclude로 해결

HTTP 확인:

```txt
GET /home                         200
GET /editor?solution=monitoring   200
GET /editor?solution=guard        200
```

### AIM GUARD 영향

직접 수정하지 않은 영역:

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

guard 보호 방식:

- editor route에서 `solution.id === "monitoring"`일 때만 새 shell로 분기
- guard는 기존 `EditorLayout`으로 그대로 진입
- selectedSolution이 없으면 모든 하네스 생성 경로는 기존처럼 `guard` fallback

### 남은 위험

- AI Studio 실제 화면은 `src/monitoring-app`로 1차 포팅했고, `/editor?solution=monitoring` 중앙 콘텐츠에 연결했다.
- 현재 연결은 "원본 화면 표시" 단계이며, AIMNIS 에디터 선택/설정/저장 모델과의 세밀한 바인딩은 다음 단계다.
- Monitoring Step2 질문/시나리오/defaultSpecs는 코드에 1차 적용했다.
- `selectedSolution === "monitoring"`일 때만 Monitoring 전용 질문, 추천세팅, Blueprint 문맥을 사용한다.
- 20개 위젯은 registry만 등록했고 실제 draggable/renderer는 다음 단계다.
- 20개 위젯 registry를 좌측 위젯 탭의 drag source로 1차 연결했다.
- 중앙 AIM Monitoring 화면 위에 12그리드 overlay drop layer를 1차 구현했다.
- 배치된 위젯 선택, 타이틀 수정, 가로/세로 그리드 크기 편집, 삭제를 우측 설정 패널에 1차 연결했다.
- 20개 위젯별 전용 renderer를 1차 제작했다.
- 좌측 위젯 탭에 위젯 유형별 썸네일 프리뷰를 적용했다.
- 실제 마우스 이동과 리사이즈 핸들(right, bottom, bottom-right)을 1차 구현했다.
- 선택된 위젯의 우측 inspector에 위젯별 option schema/data binding을 1차 구현했다.
- 공통 옵션은 데이터 소스, 갱신 주기, 경보 기준, 표시 밀도, 위험 임계값이다.
- 위젯 도메인별 옵션은 초음파 기준 dB, FFT 대역/RPM, ΔT 기준, 가스 프로파일, SpO2 하한, 쓰러짐 신고 카운트다운, 통신 프로토콜, AI 모델/F1-F2 정책, SOP 실행 정책, 계측기 모드, 실증 현장 등으로 분기했다.
- in-app Browser 자동화 도구가 이 세션에 노출되지 않아 시각적 브라우저 스크린샷 검증은 수행하지 못했다.
- `npm run build` 통과 및 dev 서버 HTTP 체크는 완료했다.
- `/editor?solution=monitoring`, `/editor?solution=guard`, `/home` 모두 200 응답을 확인했다.
- Tailwind content 경로에 `src/monitoring-app`를 추가하여 AI Studio 화면의 12그리드/색상 클래스가 실제 CSS로 생성되도록 수정했다.

### 다음 단계

1. 중앙 AI Studio 섹션과 위젯 엔티티 선택/설정 연결
2. 프로젝트 저장 snapshot에 Monitoring layout/widgets/options 반영
3. 퍼블리싱/프로젝트 저장 후 AIM Monitoring 런타임 복원
4. grid 충돌 방지, 빈 공간 자동 보정, drop preview 고도화
5. 채팅 명령으로 위젯 추가/배치 자동화

## 2026-06-07 위젯 편집성 1차 고도화

### 목표

AIM Monitoring의 핵심 차별점인 좌측 위젯 탭 기반 자유 편집을 데모 수준에서 직접 조작 가능하도록 만든다.

### 구현 내용

- 중앙 12그리드 위젯 인스턴스에 `options` 상태 추가
- 위젯 추가 시 사업계획서 도메인별 기본 옵션 자동 생성
- 배치된 위젯을 마우스로 이동 가능하게 구현
- 선택 위젯에 right, bottom, bottom-right 리사이즈 핸들 제공
- 리사이즈 중 그리드 스냅과 canvas boundary clamp 적용
- 우측 inspector에서 위젯 타이틀, 가로/세로 그리드, 옵션, 삭제 편집 가능
- 데이터 소스 변경 시 위젯 카드의 category label도 즉시 반영

### 위젯별 옵션 예시

```txt
초음파: 기준 dB, 아크 판정
진동: FFT 대역, 기준 RPM
열: ΔT 기준, 열지도 팔레트
가스: 가스 프로파일, H2S 기준
작업자: SpO2 하한, 작업자 안전 정책
IMU: 신고 카운트다운, 자동 신고
통신: BLE/LTE/Wi-Fi/LoRa/RS-485, 지연 기준
AI 진단: Autoencoder/LSTM/CNN-LSTM/Hybrid, F1/F2 정책
SOP: 자동/승인/알림 정책, 조치 리포트
계측기: 휴대형/고정형/겸용, 배터리 주의 기준
실증: 태안/ESS/신재생 현장, 사용자 의견 반영
```

### 검증

```txt
npm run build
```

결과:

- 통과
- 최초 일반 sandbox 실행은 `.next/trace` EPERM으로 실패
- 권한 승인 후 실제 production build 통과

### AIM GUARD 영향

- 수정 파일은 Monitoring 전용 editor shell과 진행 문서다.
- 기존 AIM GUARD editor/store/panel 파일은 수정하지 않았다.

## 2026-06-07 프로젝트 저장/런타임 1차 연결

### 목표

퍼블리시 후 프로젝트 목록에 AIM Monitoring 프로젝트가 저장되고, 저장된 Monitoring 화면을 별도 런타임 URL에서 열 수 있도록 한다.

### 구현 내용

- `projectStore`에 optional `monitoringSnapshot` 필드 추가
- AIM GUARD 기존 project 필드는 삭제하거나 변경하지 않음
- Monitoring editor 저장 버튼은 `aimnis_monitoring_editor_draft` localStorage draft로 snapshot 저장
- Monitoring editor 퍼블리시 버튼은 `projectStore.publish()`로 프로젝트 생성
- snapshot에는 중앙 view, 좌측 탭, 우측 패널 상태, 선택 위젯, 12그리드 widgets/items/options 저장
- `editor?solution=monitoring&project=...` 진입 시 해당 project의 `monitoringSnapshot` 복원
- `project` 파라미터가 없으면 localStorage draft 복원
- `/monitoring` 런타임 페이지 추가
- `/monitoring?project=...`에서 저장된 Monitoring snapshot의 위젯 overlay를 AI Studio 화면 위에 렌더링
- ProjectsGrid에서 Monitoring 프로젝트 색상/라벨/실행 버튼 문구를 AIM GUARD와 분리

### 검증

```txt
npm run build
```

결과:

- 1차 빌드에서 `/monitoring`의 `useSearchParams()` Suspense boundary 누락 오류 확인
- `src/app/monitoring/page.tsx`에서 Suspense fallback 적용
- 재빌드 통과

HTTP 확인:

```txt
GET /home                         200
GET /editor?solution=monitoring   200
GET /editor?solution=guard        200
GET /monitoring                   200
```

### AIM GUARD 영향

- AIM GUARD editor/store 동작 로직은 건드리지 않았다.
- 공유 `projectStore`는 optional 필드만 추가했다.
- ProjectsGrid는 Monitoring 표시 분기를 추가했으며 Guard 프로젝트 실행 경로는 기존 `/guard?project=...` 그대로 유지된다.

## 2026-06-07 12그리드 방향 보정

### 대표님 피드백

현재 1차 위젯 배치 방식은 12그리드 layout system이라기보다 화면 위에 격자를 깔고 absolute widget을 올리는 overlay prototype에 가깝다.

대표님이 요구한 12그리드는 다음 개념이다.

```txt
container: 콘텐츠 폭
columns: 단 수
margin: 좌우 내부 여백
gutter: 단과 단 사이 간격
```

또한 드래그 앤 드롭 시 기존 콘텐츠 위젯 위에 새 위젯이 얹히면 안 된다.
기존 콘텐츠가 충돌을 인식하고 자연스럽게 이동/reflow되어야 한다.

### 판단

- 대표님 지적이 맞다.
- 현재 구현은 최종 방향이 아니다.
- 현재 구현은 좌측 위젯 탭, 위젯 renderer, 우측 inspector, snapshot 저장을 검증하기 위한 1차 기술 검증으로만 유지한다.
- 다음 구현 단계에서는 overlay layer를 layout engine으로 전환해야 한다.

### 수정된 방향

- `MonitoringApp`을 단순 배경으로 두지 않는다.
- AI Studio 기본 콘텐츠를 `MonitoringLayoutItem`으로 분해한다.
- 기본 콘텐츠와 새 위젯을 하나의 item 배열에서 관리한다.
- drop/move/resize 시 모든 item을 대상으로 collision/reflow를 계산한다.
- grid guide는 가로세로 셀 선이 아니라 column/margin/gutter guide로 표시한다.

### 다음 필수 작업

1. AI Studio 홈 화면 기본 카드들을 editable grid item으로 등록
2. `MonitoringEditableDashboard` 또는 `MonitoringLayoutCanvas` 생성
3. column/margin/gutter 기반 좌표 변환 함수 구현
4. drop preview 구현
5. collision detection 구현
6. push-down reflow 구현
7. auto compact 구현
8. 기존 overlay widget layer 제거

## 2026-06-07 Layout Canvas 1차 전환

### 목표

대표님 피드백에 따라 AIM Monitoring 에디터의 중앙 위젯 배치 방식을 absolute overlay prototype에서 12컬럼 layout item 방식으로 전환한다.

### 구현 내용

- `src/components/monitoring-editor/MonitoringLayoutCanvas.tsx` 신규 생성
- AI Studio 홈 화면의 주요 기본 콘텐츠를 layout item으로 등록
- 기본 등록 item:

```txt
summary-equipment-status
summary-environment-risk
summary-worker-safety
summary-alert-count
equipment-anomaly-chart
worker-safety-overview
environment-diagnosis
realtime-alerts
action-progress
system-status
```

- 신규 위젯과 AI Studio 기본 콘텐츠를 하나의 `LayoutItem[]`로 합산
- `resolveLayout()`로 item 충돌 시 아래로 밀리는 push-down reflow 1차 구현
- column guide를 가로세로 격자선이 아닌 12개 column overlay로 변경
- `MonitoringEditorShell`의 중앙 monitor view를 `MonitoringLayoutCanvas`로 교체
- 기존 absolute overlay layer 제거
- drop 좌표 계산을 `margin / gutter / columnWidth / rowGap` 기준으로 변경

### 현재 한계

- AI Studio 기본 콘텐츠는 클릭 시 floating 설정 버튼이 보이지만, 우측 inspector의 상세 설정 필드는 아직 custom widget 중심이다.
- 기본 콘텐츠의 title/color/data/visibility 설정 schema는 다음 단계에서 붙인다.
- top menu, left menu, header 영역의 editable entity 등록은 다음 단계다.
- reflow는 push-down 1차이며, 좌우 재탐색/auto compact/drag preview는 추가 구현이 필요하다.
- runtime `/monitoring`은 아직 이전 snapshot overlay 방식을 일부 사용하므로 editor layout snapshot과 맞추는 후속 작업이 필요하다.

### 검증

```txt
npm run build
GET /home                         200
GET /editor?solution=monitoring   200
GET /editor?solution=guard        200
```

결과:

- production build 통과
- dev 서버 재시작 후 주요 라우트 200 확인

### AIM GUARD 영향

- AIM GUARD editor 파일은 수정하지 않았다.
- 변경은 Monitoring 전용 컴포넌트와 Monitoring editor shell에 한정했다.

## 2026-06-07 UI Parity 방향 보정

### 대표님 피드백

- AIM Monitoring 위젯 기능은 만족도가 높다.
- 다만 AIM GUARD와 AIM Monitoring의 에디터 UI 디자인이 미세하게 다르다.
- 플로팅 설정 버튼만의 문제가 아니라, 전체 에디터 UI 스타일이 AIM GUARD와 일관되어야 한다.
- 대표님이 하나하나 지적하는 방식으로 진행하면 안 된다.

### 판단

이 피드백은 타당하다. Monitoring은 별도 솔루션으로 제작하되, 에디터 조작 chrome은 AIM GUARD를 기준으로 맞춰야 한다.

문제 원인:

- AIM Monitoring 전용 기능을 빠르게 검증하면서 일부 UI를 새로 작성했다.
- 이 과정에서 AIM GUARD의 기존 `FloatingToolbar`, `EditableSection`, `DynamicPanel`, `ChatPanel` 기준을 먼저 고정하지 못했다.
- 결과적으로 기능은 맞지만 선택 상태, 버튼 형태, inspector tone 등에서 제품 일관성이 깨질 수 있다.

### 즉시 조치

- `AIM_MONITORING_UI_PARITY_AUDIT.md` 신규 작성
- AIM GUARD 기준 파일과 Monitoring 대응 파일을 명시
- editor shell, floating toolbar, inspector, left panel, canvas, runtime 기준 체크리스트 작성
- Monitoring 기본 위젯/신규 위젯/헤더/사이드바의 설정 badge를 AIM GUARD의 작은 cyan edit badge 스타일로 1차 변경
- 큰 blue pill 설정 버튼 제거
- selected outline/hover guide를 AIM GUARD `EditableSection` 기준으로 1차 정렬

### 다음 우선순위

1. 신규 기능 확장보다 UI parity 정렬을 먼저 진행한다.
2. Monitoring 우측 inspector를 AIM GUARD `DynamicPanel` 계열 control 스타일로 맞춘다.
3. Monitoring 좌측 패널을 AIM GUARD `ChatPanel` tone으로 맞춘다.
4. Top bar, save/publish feedback, panel transition을 AIM GUARD `EditorLayout` 기준으로 비교한다.
5. Monitoring 위젯 탭은 신규 기능이지만 draggable card chrome은 AIM GUARD 스타일을 따른다.

### 검증

```txt
npm run build
```

결과:

- production build 통과
- 빌드 후 stale chunk 방지를 위해 dev 서버 재시작 완료
- dev server: http://localhost:3000

## 2026-06-07 21:45 UI Parity 2차 조치

### 대표님 피드백 반영

- 좌측 채팅 패널은 AIM GUARD처럼 추천 키워드, 첨부, 음성, 전송 입력이 작동해야 한다.
- 위젯/헤더/좌측 메뉴를 클릭하면 즉시 우측 패널이 열리는 구조가 아니라, 먼저 선택되고 floating 설정 버튼을 눌렀을 때 우측 패널이 열려야 한다.
- 우측 설정 패널은 AIM GUARD의 브랜드 설정, 연결, 슬롯 저장, 세부 inspector 흐름까지 기준으로 삼아야 한다.

### 이번 조치

- `MonitoringChatPanel`을 추가하고 AIM GUARD 공용 `AiChatInput`을 연결했다.
- Monitoring 채팅 탭에서 추천 키워드, 실행 로그, 첨부, 음성, 전송 입력이 보이도록 구성했다.
- `/api/chat` 호출 시 `solution: monitoring`을 전달해 기존 Claude API 라우트를 사용하도록 연결했다.
- 드롭/이동/리사이즈/위젯 클릭 시에는 선택 상태만 변경되도록 수정했다.
- 기본 위젯, 신규 위젯, 헤더, 좌측 메뉴의 floating `설정` 버튼을 눌렀을 때만 우측 inspector가 열리도록 분리했다.
- 헤더와 좌측 메뉴도 클릭 선택 대상에 포함했다.

### 검증

```txt
npm run build
GET /home                         200
GET /editor?solution=monitoring   200
GET /editor?solution=guard        200
Browser: Monitoring editor initial right panel closed
Browser: default widget click does not open right panel
Browser: selected widget setting button opens right panel
Browser: Monitoring chat textarea accepts input
```

결과:

- production build 통과
- dev server 재시작 완료: http://localhost:3000
- 기존 AIM GUARD editor route 200 확인

### 남은 핵심 작업

1. Monitoring 우측 패널을 AIM GUARD `DynamicPanel` 구조와 더 강하게 맞춘다.
2. 브랜드 설정, 연결, 브랜드 슬롯 저장, 헤더 inspector, 탑메뉴 inspector의 화면 흐름을 Monitoring 전용으로 이식한다.
3. 좌측 채팅 패널의 미세 UI를 AIM GUARD `ChatPanel` 기준으로 더 맞춘다.
4. 신규 위젯 탭은 Monitoring 고유 기능으로 유지하되, 버튼/hover/spacing/token은 AIM GUARD chrome을 기준으로 정렬한다.

## 2026-06-07 22:22 Chat-to-Widget 연결

### 대표님 피드백

- `초음파 아크` 추천 버튼을 눌러도 응답이 없었다.
- 자연어로 “초음파 아크 위젯 추가”를 입력하면 답변은 하지만 컨텐츠에 실제 위젯이 추가되지 않았다.
- Monitoring 컨텐츠 좌측 메뉴 높이가 짧아졌다.
- UI 디테일은 아직 갈 길이 있지만, 우선 큰 기능 축부터 진행해도 된다고 판단했다.

### 이번 조치

- Monitoring 채팅 명령 해석 테이블을 추가했다.
- “초음파 아크”, “진동 FFT”, “열화상”, “가스”, “작업자 안전”, “SOP 자동화” 등 핵심 키워드를 20개 Monitoring 위젯 ID와 매핑했다.
- `MonitoringChatPanel`에 `onWidgetCommand` 콜백을 추가했다.
- 추천 버튼이나 자연어 입력에 `추가/생성/배치/구성/넣기` 의도가 있으면 실제 `canvasWidgets`에 위젯 인스턴스를 추가하도록 연결했다.
- 드래그앤드롭과 채팅 추가가 같은 위젯 생성 경로를 사용하도록 정리했다.
- 중복 배치 시 다음 빈 12컬럼 위치를 찾아 들어가도록 1차 placement 함수를 추가했다.
- Monitoring AI Studio `Sidebar`에 `h-full min-h-0`을 부여해 에디터 높이를 따라가도록 수정했다.

### 검증

```txt
npm run build                                      통과
GET /editor?solution=monitoring                    200
GET /editor?solution=guard                         200
Browser: 초음파 아크 quick button click             위젯 추가됨
Browser: body includes 초음파 아크 위험도           true
Browser: chat includes 컨텐츠에 추가했습니다        true
Browser: Monitoring sidebar follows editor height  true
```

### 다음 우선순위

1. 자연어 명령 결과를 더 정교화해 “추천”과 “실제 추가”를 구분한다.
2. Claude 응답의 `__WIDGET_JSON__`도 편집 액션으로 흡수한다.
3. 우측 설정 패널과 floating toolbar UI를 AIM GUARD 기준으로 재정렬한다.
4. 좌측 채팅 UI의 버튼/간격/톤을 AIM GUARD `ChatPanel`과 맞춘다.

## 2026-06-07 22:45 Floating Toolbar Parity 1차

### 목표

- Monitoring 선택 UI를 AIM GUARD처럼 요소 내부 버튼이 아니라 선택 대상 위 floating toolbar 방식으로 정렬한다.
- 위젯/기본 카드/헤더/좌측 메뉴 클릭 시 먼저 선택하고, toolbar의 `설정`을 눌렀을 때 우측 패널을 연다.

### 이번 조치

- `MonitoringFloatingToolbar` 신규 추가
- 선택 대상 DOM에 `data-monitoring-selection-id` 부여
- 기본 대시보드 카드, 신규 위젯, 헤더, 좌측 메뉴 내부에 있던 개별 `설정` 버튼 제거
- 선택 이벤트를 `onPointerDown` 단계로 보강해 selection 안정성 개선
- toolbar 버튼에 `aria-label`을 부여해 `전체 설비 상태 설정`처럼 정확히 접근 가능하도록 개선
- 우측 패널과 좌측 패널에 outside-click 보호용 data marker 추가

### 검증

```txt
npm run build                                           통과
GET /editor?solution=monitoring                         200
GET /editor?solution=guard                              200
Browser: 기본 카드 클릭                                  floating toolbar 표시
Browser: 내부 embedded 설정 버튼                         0개
Browser: floating toolbar 설정 클릭                      우측 패널 오픈
Browser: 기본 대시보드 위젯 설정 inspector 표시          true
```

### 남은 작업

- toolbar 위치/애니메이션/버튼 간격을 AIM GUARD `FloatingToolbar`와 더 미세하게 맞춘다.
- 우측 Monitoring inspector를 AIM GUARD `DynamicPanel`의 브랜드 설정/연결 탭 구조와 통합한다.
- 현재 임시/레거시 inspector block을 정리해 우측 패널 중복 텍스트 가능성을 제거한다.
