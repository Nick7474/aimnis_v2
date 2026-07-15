# AIM Monitoring UI Parity Audit

작성일: 2026-06-07

## 목적

AIM Monitoring은 AIM GUARD와 별도 솔루션으로 구현하되, 사용자가 체감하는 에디터 UI 언어는 AIM GUARD와 동일해야 한다. Monitoring에 새로 필요한 기능은 위젯 탭, 20개 Monitoring 위젯, 12컬럼 레이아웃 캔버스뿐이며, 그 외 조작 chrome은 AIM GUARD 기준을 따른다.

대표님 피드백에 따라 앞으로는 개별 지적 기반으로 수정하지 않고, AIM GUARD 기준 UI를 전수 감사한 뒤 Monitoring을 일괄 정렬한다.

## 원칙

1. AIM GUARD는 기준 제품이다.
2. AIM Monitoring은 AIM GUARD의 편집기 shell, panel, floating toolbar, selected state, inspector control 규격을 따른다.
3. AIM GUARD 파일은 직접 수정하지 않는다.
4. Monitoring 전용 기능만 별도 구현한다.
5. 더 좋아 보이는 UI라도 AIM GUARD와 다르면 기본값으로 채택하지 않는다.
6. 예외가 필요하면 이유와 적용 범위를 문서화한 뒤 진행한다.

## 기준 소스

| 영역 | AIM GUARD 기준 파일 | Monitoring 대응 파일 | 상태 |
|---|---|---|---|
| 에디터 shell | `src/components/editor/EditorLayout.tsx` | `src/components/monitoring-editor/MonitoringEditorShell.tsx` | 부분 정렬 |
| 선택/플로팅 UI | `src/components/editor/FloatingToolbar.tsx` | `src/components/monitoring-editor/MonitoringLayoutCanvas.tsx` | 1차 정렬 |
| 선택 가능 섹션 | `src/components/editor/EditableSection.tsx` | `src/components/monitoring-editor/MonitoringLayoutCanvas.tsx` | 1차 정렬 |
| 우측 inspector | `src/components/editor/panels/DynamicPanel.tsx` | `src/components/monitoring-editor/MonitoringEditorShell.tsx` | 미정렬 |
| 좌측 채팅 패널 | `src/components/editor/ChatPanel.tsx` | `src/components/monitoring-editor/MonitoringEditorShell.tsx` | 미정렬 |
| 위젯 라이브러리 | `src/components/editor/DraggableWidget.tsx` | Monitoring 위젯 탭 | Monitoring 전용, 스타일 정렬 필요 |
| 데이터 매핑 | `src/components/editor/MappingCanvas.tsx`, `MappingPanel.tsx` | Monitoring mapping view | 기능 미구현 |
| 브랜드 설정 | `BrandKitControls.tsx`, `DynamicPanel.tsx` | Monitoring element configs | 부분 구현 |
| 저장/퍼블리시 UI | `EditorLayout.tsx`, `projectStore.ts` | `MonitoringEditorShell.tsx` | 부분 정렬 |

## UI Parity 체크리스트

### 1. 에디터 전체 Shell

| 항목 | AIM GUARD 기준 | Monitoring 현재 | 조치 |
|---|---|---|---|
| 상단 바 높이 | AIM GUARD와 동일 | 유사하나 버튼 톤 차이 가능 | 비교 후 동일화 |
| 상단 버튼 radius/border/text | AIM GUARD 기준 | 일부 Monitoring 자체 스타일 | 공통 클래스 적용 |
| 좌측 패널 폭 | AIM GUARD 기준 | 300px 고정 | 기준값 확인 후 조정 |
| 우측 패널 폭 | AIM GUARD 기준 | 320px 고정 | 기준값 확인 후 조정 |
| center slide 동작 | AIM GUARD 기준 | 단순 flex resize | motion/transition 동일화 |
| 저장됨 toast | AIM GUARD 기준 | Monitoring 자체 pill/toast | 동일화 |

### 2. 선택 / Hover / Floating Toolbar

| 항목 | AIM GUARD 기준 | Monitoring 현재 | 조치 |
|---|---|---|---|
| hover outline | `1px dashed rgba(0,212,255,0.35)` | 일부 적용 | 전체 적용 |
| selected outline | `2px solid #00C8FF` | 1차 적용 | 전체 대상 확인 |
| outline offset | `-2px` | 1차 적용 | 유지 |
| selected label badge | 좌상단 cyan label | 1차 적용 | 커스텀 위젯/기본 위젯 모두 확인 |
| edit badge | 작은 cyan edit badge | 1차 적용 | icon/text 규격 추가 정리 |
| floating toolbar 위치 | selected rect 기반 portal | Monitoring은 inline badge 중심 | AIM GUARD 방식 도입 검토 |
| color picker/delete confirm | AIM GUARD widget toolbar 기능 | Monitoring 미구현 | Monitoring widget action으로 이식 |

### 3. 우측 Inspector

| 항목 | AIM GUARD 기준 | Monitoring 현재 | 조치 |
|---|---|---|---|
| panel header | `DynamicPanel` meta 구조 | 자체 header | 동일화 |
| section title | `InspectorSection` | 자체 card | 동일화 |
| text input | `TextControl` 스타일 | 자체 input | 동일화 |
| select input | `SelectControl` 스타일 | 자체 select | 동일화 |
| color input | `ColorControl` 스타일 | native color + text | 동일화 |
| toggle/slider | AIM GUARD controls | 자체 checkbox/number | 동일화 |
| reset button | `SectionResetButton` | 없음 | 추가 |
| data binding action | AIM GUARD mapping 연결 버튼 | 부분 없음 | 추가 |

### 4. 좌측 패널

| 항목 | AIM GUARD 기준 | Monitoring 현재 | 조치 |
|---|---|---|---|
| 채팅 패널 여백/톤 | `ChatPanel` 기준 | 자체 구현 | 동일화 |
| AIMI avatar/message card | `ChatPanel` 기준 | 유사하나 차이 | 동일화 |
| 탭 UI | Monitoring 신규 | 자체 구현 | AIM GUARD button tone 적용 |
| 위젯 카드 | Monitoring 신규 | 자체 구현 | AIM GUARD draggable card tone 적용 |
| widget category header | 신규 | 자체 구현 | AIM GUARD list typography 적용 |

### 5. 캔버스 / 12컬럼 레이아웃

| 항목 | AIM GUARD 기준 | Monitoring 현재 | 조치 |
|---|---|---|---|
| monitor frame tone | AIM GUARD editor center 기준 | AI Studio dashboard 삽입 | 외부 chrome만 동일화 |
| grid guide | Monitoring 신규 | 12컬럼 guide 구현 | 컨테이너/마진/거터 문서와 일치 유지 |
| drag preview | AIM GUARD DnD 감각 참고 | 미구현 | 추가 |
| collision/reflow | Monitoring 신규 | push-down 1차 | auto compact/preview 보강 |
| resize handle | Monitoring 신규 | 자체 handle | AIM GUARD selected style로 정렬 |

### 6. Runtime / Projects

| 항목 | AIM GUARD 기준 | Monitoring 현재 | 조치 |
|---|---|---|---|
| 프로젝트 카드 색상/라벨 | ProjectsGrid 기준 | 부분 반영 | 시각 규격 확인 |
| 프로젝트 클릭 이동 | AIM GUARD 흐름 | Monitoring runtime 추가 | 같은 UX 유지 |
| 퍼블리시 결과 표시 | AIM GUARD 기준 | 자체 표시 | 동일화 |

## 즉시 수정 완료

2026-06-07 1차:

- Monitoring 기본 위젯 selected outline을 AIM GUARD `EditableSection` 기준으로 변경
- Monitoring 신규 위젯 selected outline을 AIM GUARD 기준으로 변경
- 헤더/좌측 메뉴 설정 badge를 작은 cyan edit badge로 변경
- 큰 blue pill 설정 버튼 제거
- hover guide를 AIM GUARD 8px guide 느낌으로 적용

## 남은 핵심 과제

1. Monitoring 우측 inspector를 `DynamicPanel`의 `InspectorFrame`, `InspectorSection`, control 규격과 맞춘다.
2. Monitoring 좌측 패널을 AIM GUARD `ChatPanel` tone과 맞춘다.
3. Monitoring top bar 버튼, 저장/퍼블리시 피드백을 AIM GUARD와 맞춘다.
4. Monitoring 위젯 탭은 신규 기능이지만 draggable card chrome은 AIM GUARD 기준으로 맞춘다.
5. Monitoring custom widget floating action은 AIM GUARD `FloatingToolbar`의 portal 방식 도입 여부를 결정한다.
6. UI parity 완료 전에는 새로운 기능 확장을 멈추고, 현재 구현된 UI 불일치를 먼저 줄인다.

## 진행 게이트

다음 작업부터는 아래 게이트를 통과해야 한다.

```txt
Gate A: 기능이 AIM Monitoring 전용인가?
Gate B: UI chrome이 AIM GUARD와 동일한가?
Gate C: 다르다면 명시적 사유가 문서화되었는가?
Gate D: AIM GUARD 파일을 직접 수정하지 않았는가?
Gate E: /editor?solution=guard 라우트가 정상인가?
Gate F: /editor?solution=monitoring 라우트가 정상인가?
```

## 결론

대표님이 하나씩 지적하는 방식으로 가면 안 된다. AIM GUARD를 기준 UI로 삼아 Monitoring을 전수 대조하고, Monitoring만의 신규 기능 외 모든 에디터 UI는 AIM GUARD의 기존 조작 언어를 따른다.
