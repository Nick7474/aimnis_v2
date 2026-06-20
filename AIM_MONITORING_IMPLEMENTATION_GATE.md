# AIM Monitoring 구현 착수 게이트

작성일: 2026-06-06
작성자: Codex
상태: 1차 스캐폴딩 및 AI Studio 화면 포팅 완료

## 0. 목적

이 문서는 실제 코드 구현에 들어가기 전의 착수 조건을 정의한다.
대표님이 요구한 방향은 빠른 구현이 아니라 정확한 구현이다.

따라서 아래 조건을 만족해야 Month 1 Week 3 스캐폴딩을 시작한다.

## 1. 완료된 기획 문서

현재 1차 작성 완료:

```txt
AIM_MONITORING_DETAILED_AUDIT_PLAN.md
AIM_GUARD_FEATURE_AUDIT.md
AIM_GUARD_REGRESSION_CHECKLIST.md
AIM_MONITORING_AI_STUDIO_ASSET_AUDIT.md
AIM_MONITORING_AI_STUDIO_PORTING_MAP.md
AIM_MONITORING_ARCHITECTURE.md
AIM_MONITORING_WIDGET_SPEC.md
AIM_MONITORING_GRID_SPEC.md
AIM_MONITORING_STEP2_SCENARIO_SPEC.md
AIM_MONITORING_PROJECT_SNAPSHOT_SPEC.md
```

## 2. 구현 착수 조건

착수 가능:

- [x] AI Studio 원본 위치 확인
- [x] AIM GUARD 보호 원칙 확정
- [x] AIM GUARD 기능 감사 1차 완료
- [x] AIM GUARD 회귀 체크리스트 1차 완료
- [x] 20개 위젯 1차 spec 완료
- [x] 12그리드 1차 spec 완료
- [x] 별도 아키텍처 1차 완료
- [x] Step2 시나리오 1차 완료
- [x] 프로젝트 snapshot 1차 완료
- [x] AI Studio 포팅 매핑 1차 완료

착수 전 한 번 더 확인:

- [x] 현재 프로젝트의 정상 build 명령 확인
- [x] AIM Monitoring 하위 앱 의존성 설치 여부 결정
- [x] 첫 구현 범위가 guard 파일을 직접 수정하지 않는지 확인
- [x] `git status`에서 사용자/기존 변경을 구분

## 3. 첫 구현 단위

첫 구현은 작게 시작한다.

목표:

- AIM Monitoring을 플랫폼에 등록
- 홈 화면에 노출
- `/editor?solution=monitoring`이 기존 guard editor가 아닌 Monitoring 전용 shell로 분기
- Monitoring 전용 shell 중앙에 AI Studio 제작 AIM Monitoring 화면을 1차 연결
- AIM GUARD 기존 진입은 그대로 유지

1차 구현 파일:

```txt
src/solutions/monitoring/manifest.json
src/solutions/monitoring/harness-schema.json
src/solutions/monitoring/templates/default.json
src/solutions/monitoring/widgets/index.json
src/data/marketplace.json
src/components/monitoring-editor/MonitoringEditorShell.tsx
src/app/editor/page.tsx
```

가능한 홈 파일:

```txt
src/components/home/HomeHero.tsx
src/components/home/CreateHarnessBtn.tsx
src/store/homeStore.ts
```

1차에서는 아직 하지 않을 것:

- AI Studio 전체 포팅
- 20개 위젯 전체 구현
- 12그리드 리사이즈 구현
- projectStore 확장
- `/monitoring` runtime 완성

## 4. 수정 금지

1차 구현에서 건드리지 않는다.

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

## 5. 첫 구현 완료 기준

- `/home`에 AIM Monitoring이 표시된다.
- AIM OPS는 사라진다.
- AIM GUARD 카드/칩은 기존처럼 작동한다.
- AIM Monitoring 시작하기가 Step2 또는 editor 준비 흐름으로 연결된다.
- `/editor?solution=monitoring`에서 Monitoring shell이 뜬다.
- `/editor?solution=guard`는 기존 EditorLayout이 뜬다.
- build 또는 최소 type/lint 검증을 수행한다.
- AIM GUARD 회귀 체크리스트 중 기본 진입/홈/editor 항목이 통과한다.

## 6. 첫 구현 후 다음 단계

2차 구현:

- Monitoring Step2 질문 분기
- monitoringScenarios 데이터 파일
- CreateHarnessBtn solution 분기 완성
- expert recommended settings

3차 구현:

- AI Studio `MonitoringApp` 포팅
- central content 표시
- sidebar/header/dashboard 연결

4차 구현:

- Widget tab
- 20개 definition
- grid canvas 1차

## 7. 판단

현재 상태는 “구현해도 되는 상태에 가까워졌다”.
다만 첫 구현은 반드시 작아야 한다.

처음부터 20개 위젯과 AI Studio 전체 포팅을 동시에 하면 guard 회귀 위험과 디버깅 비용이 커진다.
따라서 첫 구현은 solution 등록과 editor 분리 shell까지만 닫는 것이 안전하다.

## 8. 1차 스캐폴딩 진행 상태

2026-06-06 기준 1차 스캐폴딩을 완료했다.

완료:

- [x] `src/solutions/monitoring` 생성
- [x] monitoring manifest/schema/template/widget registry 추가
- [x] marketplace 등록
- [x] AIM OPS roadmap card 제거
- [x] homeStore selectedSolution 추가
- [x] 하네스 생성 route solution 분기
- [x] `/editor?solution=monitoring` 전용 shell 분기
- [x] `/editor?solution=guard` 기존 shell 유지
- [x] `npm run build` 통과
- [x] `/home`, `/editor?solution=monitoring`, `/editor?solution=guard` HTTP 200 확인

세부 기록:

```txt
AIM_MONITORING_PROGRESS_LOG.md
```
