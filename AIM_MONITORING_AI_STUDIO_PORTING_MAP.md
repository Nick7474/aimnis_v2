# AIM Monitoring AI Studio 포팅 매핑표

작성일: 2026-06-06
작성자: Codex
상태: 1차 포팅 계획

## 0. 목적

`AIM Monitoring/` 폴더는 AI Studio가 생성한 원본이다.
이 원본을 직접 수정하지 않고 AIMNIS 본 앱 구조에 맞게 `src/monitoring-app/`로 포팅한다.

## 1. 포팅 원칙

1. 원본 보존
2. 본 앱 React 18/Next 14 기준으로 호환
3. Tailwind 4 전용 설정은 가져오지 않음
4. Vite entry는 가져오지 않음
5. 컴포넌트 이름 충돌 방지
6. AIM GUARD 파일과 store는 건드리지 않음

## 2. 사용하지 않는 원본 파일

아래 파일은 참고만 하고 본 앱에 직접 넣지 않는다.

| 원본 | 이유 |
|---|---|
| `AIM Monitoring/index.html` | Vite entry |
| `AIM Monitoring/src/main.tsx` | Next app에서는 사용하지 않음 |
| `AIM Monitoring/vite.config.ts` | 본 앱 설정과 무관 |
| `AIM Monitoring/tsconfig.json` | 본 앱 tsconfig 사용 |
| `AIM Monitoring/package.json` | 의존성 참고만 |
| `AIM Monitoring/package-lock.json` | 본 앱 dependency 직접 변경 전 검토 |
| `AIM Monitoring/src/index.css` | 필요한 스타일만 scoped CSS로 이식 |

## 3. 포팅 대상 매핑

| 원본 | 대상 | 처리 |
|---|---|---|
| `AIM Monitoring/src/App.tsx` | `src/monitoring-app/MonitoringApp.tsx` | currentPage state 유지, props로 snapshot 대응 |
| `AIM Monitoring/src/components/Sidebar.tsx` | `src/monitoring-app/MonitoringSidebar.tsx` | 이름 변경, 로고/route 정리 |
| `AIM Monitoring/src/components/Header.tsx` | `src/monitoring-app/MonitoringHeader.tsx` | 이름 변경, title/system status props화 |
| `AIM Monitoring/src/components/Dashboard.tsx` | `src/monitoring-app/MonitoringDashboard.tsx` | 기본 홈 대시보드 |
| `AIM Monitoring/src/pages/IntegratedDashboard.tsx` | `src/monitoring-app/pages/IntegratedDashboard.tsx` | 그대로 포팅 후 import 경로 수정 |
| `AIM Monitoring/src/pages/EquipmentDiagnosis.tsx` | `src/monitoring-app/pages/EquipmentDiagnosis.tsx` | 그대로 포팅 후 import 경로 수정 |
| `AIM Monitoring/src/pages/EnvironmentDiagnosis.tsx` | `src/monitoring-app/pages/EnvironmentDiagnosis.tsx` | 그대로 포팅 후 import 경로 수정 |
| `AIM Monitoring/src/pages/WorkerSafety.tsx` | `src/monitoring-app/pages/WorkerSafety.tsx` | 그대로 포팅 후 import 경로 수정 |
| `AIM Monitoring/src/pages/AlertsEvents.tsx` | `src/monitoring-app/pages/AlertsEvents.tsx` | 그대로 포팅 후 import 경로 수정 |
| `AIM Monitoring/src/pages/Report.tsx` | `src/monitoring-app/pages/Report.tsx` | 그대로 포팅 후 import 경로 수정 |
| `AIM Monitoring/src/pages/Settings.tsx` | `src/monitoring-app/pages/Settings.tsx` | 그대로 포팅 후 import 경로 수정 |
| `AIM Monitoring/src/components/*Widget.tsx` | `src/monitoring-app/components/*` | 기존 AI Studio 화면 구성 위젯 |
| `AIM Monitoring/src/lib/utils.ts` | 기존 `src/lib/utils.ts` 사용 | 중복 생성 금지 |

## 4. 스타일 포팅

원본:

```txt
AIM Monitoring/src/index.css
```

대상:

```txt
src/monitoring-app/monitoring.css
```

처리:

- `@import "tailwindcss";`는 가져오지 않는다.
- 필요한 scrollbar, dark panel, animation utility만 class로 정리한다.
- 전역 body/html style은 넣지 않는다.
- `.monitoring-app` root 아래 scoped selector를 우선한다.

예:

```css
.monitoring-app {
  --monitoring-bg: #0b1120;
  --monitoring-surface: #111827;
  --monitoring-border: #1f2937;
  --monitoring-primary: #2563eb;
}
```

## 5. import 변환 규칙

원본:

```ts
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
```

대상:

```ts
import MonitoringSidebar from './MonitoringSidebar';
import MonitoringDashboard from './MonitoringDashboard';
```

상대 경로는 본 앱 구조 기준으로 정리한다.

## 6. 의존성 호환성

원본 package:

```txt
React 19
Tailwind 4
Recharts 3
lucide-react 0.546
motion 12
```

본 앱:

```txt
React 18
Tailwind 3
Recharts 2
lucide-react 0.468
framer-motion 11
```

판단:

- React 19 전용 API는 현재 1차 확인 범위에서 없음
- Recharts 사용 패턴은 대체로 v2 호환 가능성이 높음
- `motion` 직접 import 흔적은 현재 크지 않음
- lucide 아이콘은 본 앱 버전에서 없는 아이콘이 있는지 빌드로 확인

## 7. 데이터/mock 처리

AI Studio 컴포넌트 내부 mock data는 1차 포팅 때 유지할 수 있다.
단, 2차에서 아래로 분리한다.

```txt
src/data/monitoringMockData.ts
```

분리 대상:

- summary cards data
- chart series
- alert list
- worker list
- equipment list
- gas/thermal/sensor data

## 8. editor와 runtime 차이

`MonitoringApp`은 두 모드로 동작해야 한다.

```ts
type MonitoringAppMode = "editor" | "runtime";
```

editor mode:

- editable regions 활성
- grid canvas overlay 가능
- section hover settings 가능

runtime mode:

- editor controls 숨김
- 저장된 snapshot 기준 렌더
- 사용자용 모니터링 화면

## 9. 포팅 순서

1. 빈 `MonitoringApp.tsx` 생성
2. `Sidebar/Header/Dashboard` 3개부터 포팅
3. 본 앱 build 확인
4. 나머지 pages 포팅
5. components 포팅
6. CSS scoped 정리
7. mock data 분리
8. editor wrapper 연결
9. runtime route 연결

## 10. 검증 기준

- `/editor?solution=monitoring`에서 중앙에 AIM Monitoring 화면이 나온다.
- `/monitoring`에서 runtime 화면이 나온다.
- console error가 없다.
- 기존 `/editor?solution=guard`에는 영향이 없다.
- 본 앱 build가 통과한다.

## 11. 보류 항목

아래는 포팅 1차 이후 처리한다.

- AI Studio 기존 카드의 widget entity 승격
- 모든 차트 data externalization
- live data binding
- tenant별 theme token 완전 통합
- runtime 권한/사용자 관리
