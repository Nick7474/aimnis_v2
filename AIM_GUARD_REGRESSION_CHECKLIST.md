# AIM GUARD 회귀 체크리스트

작성일: 2026-06-06
작성자: Codex
상태: 1차 기준

## 0. 목적

AIM Monitoring 작업의 가장 큰 원칙은 기존 AIM GUARD를 절대 훼손하지 않는 것이다.

이 체크리스트는 AIM Monitoring 구현 중 공통 파일을 건드릴 때마다 수행한다.
특히 아래 파일을 수정한 경우 반드시 실행한다.

```txt
src/app/editor/page.tsx
src/components/home/**
src/data/marketplace.json
src/store/projectStore.ts
src/components/projects/**
src/components/layout/Navbar.tsx
src/styles/tokens.css
```

## 1. 기본 실행 체크

- [ ] `npm run build` 또는 현재 프로젝트의 권장 빌드 명령이 통과한다.
- [ ] TypeScript 오류가 새로 발생하지 않는다.
- [ ] 콘솔에 guard 관련 runtime error가 없다.
- [ ] `/home` 진입이 정상이다.
- [ ] `/editor?solution=guard` 직접 진입이 정상이다.
- [ ] `/guard` 실행 화면이 정상이다.
- [ ] `/projects` 진입이 정상이다.

## 2. 홈 화면 회귀

대상:

```txt
src/components/home/HomeHero.tsx
src/components/home/HomePhase2.tsx
src/components/home/CreateHarnessBtn.tsx
src/store/homeStore.ts
src/data/scenarios.ts
```

체크:

- [ ] AIM GUARD 솔루션 칩이 기존처럼 표시된다.
- [ ] AIM GUARD 카드가 기존 위치와 내용으로 표시된다.
- [ ] AIM GUARD 시작하기 버튼이 작동한다.
- [ ] 기존 3개 시나리오 칩이 표시된다.
- [ ] 기존 guard 자연어 예시가 이상하게 바뀌지 않는다.
- [ ] 파일 업로드 분석 UI가 동작한다.
- [ ] 파일 분석 완료 후 guard 에디터 열기 버튼이 정상 경로로 이동한다.
- [ ] AI 응답에서 guard 시나리오 추천이 정상 표시된다.

## 3. Step2 회귀

대상:

```txt
src/components/home/HomePhase2.tsx
src/components/home/ChatArea.tsx
src/components/home/StitchInput.tsx
src/components/home/LiveBlueprint.tsx
src/components/home/MagicSetupButton.tsx
src/components/home/CreateHarnessBtn.tsx
src/app/api/interview/route.ts
```

체크:

- [ ] Step2 화면의 3열/2열 레이아웃이 깨지지 않는다.
- [ ] 좌측 채팅 입력이 동작한다.
- [ ] AI 답변이 채팅 영역에 추가된다.
- [ ] Blueprint가 갱신된다.
- [ ] 전문가 추천세팅이 기존 guard defaultSpecs를 반영한다.
- [ ] 현장 맞춤 솔루션 생성하기 버튼이 guard editor로 이동한다.
- [ ] `selectedScenario`가 guard 질문 세트에 정상 반영된다.

## 4. Guard editor shell 회귀

대상:

```txt
src/app/editor/page.tsx
src/components/editor/EditorLayout.tsx
src/store/editorStore.ts
```

체크:

- [ ] `/editor?solution=guard`에서 기존 `EditorLayout`이 렌더링된다.
- [ ] 상단 AIMNIS 로고와 솔루션명이 표시된다.
- [ ] 모니터/데이터 매핑 토글이 작동한다.
- [ ] 편집 버튼으로 우측 패널이 열린다.
- [ ] 우측 패널이 열릴 때 좌측 채팅 패널이 기존처럼 슬라이드된다.
- [ ] 저장 버튼 클릭 시 저장됨 표시가 나온다.
- [ ] 확대 버튼이 작동한다.
- [ ] 퍼블리시 모달이 열린다.
- [ ] 퍼블리시 후 projectStore에 guard 프로젝트가 저장된다.
- [ ] 퍼블리시 완료 화면의 AIM GUARD 실행 버튼이 `/guard`로 이동한다.

## 5. Guard 좌측 채팅 회귀

대상:

```txt
src/components/editor/ChatPanel.tsx
src/lib/intentParser.ts
src/lib/brandAgent.ts
src/app/api/chat/route.ts
src/store/editorStore.ts
```

체크:

- [ ] welcome message가 표시된다.
- [ ] 사용자 메시지를 전송할 수 있다.
- [ ] assistant streaming 또는 응답 표시가 동작한다.
- [ ] 빠른 힌트 버튼이 동작한다.
- [ ] 브랜드명 변경 intent가 동작한다.
- [ ] 시스템 타이틀 변경 intent가 동작한다.
- [ ] 모니터/데이터 매핑 전환 intent가 동작한다.
- [ ] 위젯 생성 응답이 overlay widget으로 추가된다.
- [ ] 위젯 전체 삭제 intent가 기존처럼 동작한다.

## 6. Guard 중앙 모니터 회귀

대상:

```txt
src/components/editor/MonitorWrapper.tsx
src/components/editor/EditableSection.tsx
src/guard-app/**
src/store/guardPagesStore.ts
```

체크:

- [ ] AIM GUARD 중앙 화면이 렌더링된다.
- [ ] 헤더가 표시된다.
- [ ] 좌측 guard sidebar가 표시된다.
- [ ] 기본 모니터링 화면이 표시된다.
- [ ] 알람 패널이 표시된다.
- [ ] 플로어/장비 상태 영역이 표시된다.
- [ ] 하단 상태바가 표시된다.
- [ ] 헤더 hover/edit 설정 버튼이 작동한다.
- [ ] sidebar hover/edit 설정 버튼이 작동한다.
- [ ] map/content hover/edit 설정 버튼이 작동한다.
- [ ] alarm panel edit이 우측 패널로 연결된다.
- [ ] floor-status edit이 우측 패널로 연결된다.

## 7. Guard overlay/widget 회귀

대상:

```txt
src/components/editor/OverlayCanvas.tsx
src/components/editor/RightSidebarDropZone.tsx
src/components/editor/widgets/**
src/store/editorStore.ts
```

체크:

- [ ] 생성된 overlay widget이 중앙에 표시된다.
- [ ] 위젯을 클릭하면 선택된다.
- [ ] 선택 위젯 테두리/설정 상태가 표시된다.
- [ ] 위젯 삭제가 작동한다.
- [ ] 위젯 드래그 이동이 작동한다.
- [ ] 우측 패널 드롭존으로 위젯을 보낼 수 있다.
- [ ] 우측 패널에서 위젯 순서 변경이 작동한다.
- [ ] 우측 패널에서 위젯 숨김/삭제가 작동한다.
- [ ] reset 시 중앙 overlay로 복원된다.

## 8. Guard 데이터 매핑 회귀

대상:

```txt
src/components/editor/MappingCanvas.tsx
src/components/editor/mappingUtils.ts
src/components/editor/mapping-nodes/**
src/store/editorStore.ts
```

체크:

- [ ] 데이터 매핑 화면으로 전환된다.
- [ ] demo data source가 표시된다.
- [ ] file source 추가가 동작한다.
- [ ] folder source 추가가 동작한다.
- [ ] API source 추가가 동작한다.
- [ ] source field와 target property 연결이 가능하다.
- [ ] edge 삭제가 가능하다.
- [ ] 연결 시 widget/mock data 반영이 동작한다.
- [ ] guard core target 목록이 기존처럼 표시된다.

## 9. Guard 우측 설정 패널 회귀

대상:

```txt
src/components/editor/panels/DynamicPanel.tsx
src/components/editor/BrandKitControls.tsx
src/components/editor/ColorTokenPicker.tsx
src/components/editor/MappingPanel.tsx
```

체크:

- [ ] settings 기본 패널이 표시된다.
- [ ] 브랜드 설정이 표시된다.
- [ ] 브랜드 컬러 변경이 중앙 guard 화면에 반영된다.
- [ ] 로고/서비스명/시스템 타이틀 변경이 반영된다.
- [ ] header 설정이 작동한다.
- [ ] sidebar/navigation 설정이 작동한다.
- [ ] map/gis 설정이 작동한다.
- [ ] alarm 설정이 작동한다.
- [ ] widget 설정이 작동한다.
- [ ] ColorTokenPicker가 동작한다.

## 10. Guard 페이지 추가 회귀

대상:

```txt
src/components/editor/MonitorWrapper.tsx
src/store/guardPagesStore.ts
src/guard-app/pages/**
```

체크:

- [ ] 좌측 메뉴 하단 페이지 추가 버튼이 보인다.
- [ ] 페이지 추가 모달이 열린다.
- [ ] 페이지 타입 선택이 가능하다.
- [ ] 질문 단계가 진행된다.
- [ ] MD 미리보기가 표시된다.
- [ ] 페이지 생성이 가능하다.
- [ ] 생성된 페이지가 좌측 메뉴에 추가된다.
- [ ] 추가된 페이지로 이동할 수 있다.
- [ ] 추가된 페이지 삭제가 가능하다.
- [ ] 기본 guard 페이지는 삭제되지 않는다.

## 11. 프로젝트/퍼블리시 회귀

대상:

```txt
src/store/projectStore.ts
src/components/projects/ProjectsGrid.tsx
src/app/projects/page.tsx
src/app/guard/page.tsx
```

체크:

- [ ] guard 프로젝트가 저장된다.
- [ ] 프로젝트 목록에 guard 카드가 표시된다.
- [ ] 프로젝트명/고객사/버전 메모가 표시된다.
- [ ] 실행 버튼이 guard 실행으로 연결된다.
- [ ] 수정 버튼이 guard editor로 연결된다.
- [ ] URL 복사가 동작한다.
- [ ] 삭제가 동작한다.
- [ ] 저장된 brandSnapshot이 깨지지 않는다.

## 12. 완료 판정

공통 파일을 수정한 PR/작업 단위는 아래 기준을 모두 만족해야 한다.

- [ ] AIM GUARD 핵심 플로우가 통과했다.
- [ ] AIM Monitoring 변경 사항이 guard store를 오염시키지 않았다.
- [ ] localStorage key 충돌이 없다.
- [ ] solution 기본값은 여전히 guard다.
- [ ] guard-only route는 기존 동작을 유지한다.
- [ ] 새 monitoring route가 guard route를 대체하지 않는다.

## 13. 원칙

회귀 체크 중 하나라도 실패하면 Monitoring 구현을 계속하지 않는다.
먼저 guard 회귀를 복구한 뒤 다음 단계로 진행한다.
