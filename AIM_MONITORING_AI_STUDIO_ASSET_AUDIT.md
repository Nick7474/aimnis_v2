# AIM Monitoring AI Studio 산출물 감사

작성일: 2026-06-06
상태: 1차 확인 완료

## 1. 결론

AI Studio로 제작된 AIM Monitoring 산출물이 다시 프로젝트에 들어왔다.

이 산출물은 단순 이미지가 아니라 `Vite + React + Tailwind` 기반의 독립 실행형 앱이다.
따라서 AIM Monitoring 중앙 대시보드/페이지 디자인의 source of truth로 사용할 수 있다.

중요:
- AIM Monitoring 중앙 화면은 이 산출물을 기준으로 이식한다.
- 새로 임의 디자인하지 않는다.
- AIM GUARD 디자인을 복제하지 않는다.
- AIM GUARD 파일을 직접 수정하지 않는다.

## 2. 산출물 위치

```txt
AIM Monitoring/
  README.md
  index.html
  metadata.json
  package.json
  package-lock.json
  vite.config.ts
  tsconfig.json
  fix.ts
  scripts/check-image.js
  public/test-logo.html
  assets/.aistudio/.gitignore
  src/
    App.tsx
    main.tsx
    index.css
    lib/utils.ts
    components/
    pages/
```

프로젝트 안에 아래 빈 대상 폴더도 존재한다.

```txt
src/components/monitoring-editor/
src/monitoring-app/
src/monitoring-app/widgets/
```

현재 판단:
- `AIM Monitoring/`은 AI Studio 원본 보관 위치로 유지한다.
- AIMNIS 본 앱에 이식할 때는 `src/monitoring-app/`과 `src/components/monitoring-editor/`로 옮겨 온다.
- 원본은 최대한 수정하지 않는다.

## 3. 기술 스택

AI Studio 산출물:

```json
{
  "framework": "Vite",
  "react": "19.0.1",
  "tailwind": "4.1.14",
  "recharts": "3.8.1",
  "lucide-react": "0.546.0",
  "motion": "12.23.24"
}
```

AIMNIS 본 앱:

```json
{
  "framework": "Next.js 14.2.29",
  "react": "^18",
  "tailwind": "^3.4.1",
  "recharts": "^2.15.3",
  "lucide-react": "^0.468.0",
  "framer-motion": "^11.18.2"
}
```

호환성 판단:
- Tailwind class 대부분은 본 앱에서도 사용 가능하다.
- `@import "tailwindcss";` 방식은 본 앱의 `globals.css` 구조와 다르므로 그대로 가져오지 않는다.
- React 19 전용 API는 현재 확인된 범위에서는 보이지 않는다.
- Recharts 3 기준으로 작성되었지만 사용 패턴은 대체로 Recharts 2에서도 동작 가능성이 높다. 이식 시 실제 빌드로 확인 필요.
- `motion` 패키지는 package에는 있으나 현재 `src`에서 직접 import된 흔적은 확인되지 않았다.
- `@google/genai`도 package에는 있으나 현재 UI 코드에서 직접 사용 흔적은 확인되지 않았다.

## 4. 빌드 확인

실행 명령:

```bash
cd "AIM Monitoring"
npm run build
```

결과:

```txt
> react-example@0.0.0 build
> vite build

sh: vite: command not found
```

판단:
- 코드 빌드 오류가 아니라 `AIM Monitoring/node_modules`가 설치되지 않은 상태로 보인다.
- package-lock은 있으므로 독립 앱으로 검증하려면 `AIM Monitoring` 안에서 `npm install`이 필요하다.
- 네트워크/의존성 설치 전에는 독립 빌드 검증이 불가하다.
- 본 앱으로 이식할 때는 본 앱의 기존 의존성을 최대한 사용하고, 필요한 경우에만 버전 차이를 조정한다.

## 5. 화면 구조

`AIM Monitoring/src/App.tsx` 기준 페이지:

| 메뉴명 | 파일 | 설명 |
|---|---|---|
| 홈 | `components/Dashboard.tsx` | 메인 대시보드 |
| 통합 대시보드 | `pages/IntegratedDashboard.tsx` | 통합 관제 대시보드 |
| 설비 진단 | `pages/EquipmentDiagnosis.tsx` | 설비/센서 진단 |
| 환경 진단 | `pages/EnvironmentDiagnosis.tsx` | 가스/온도/구역 환경 진단 |
| 작업자 안전 | `pages/WorkerSafety.tsx` | SpO2/심박/낙상/작업자 상태 |
| 알림/이벤트 | `pages/AlertsEvents.tsx` | 이벤트 목록/상세/조치 |
| 리포트 | `pages/Report.tsx` | 리포트/이슈/조치 이력 |
| 설정 | `pages/Settings.tsx` | 사용자/권한/시스템 설정 |

전체 레이아웃:
- 좌측 `Sidebar`
- 상단 `Header`
- 우측/중앙 main content
- dark industrial monitoring theme
- 카드, 테이블, 차트, 상태 배지 중심

## 6. 컴포넌트 목록

`AIM Monitoring/src/components`:

```txt
ActionProgressWidget.tsx
BottomWidgetsSection.tsx
Dashboard.tsx
EnvironmentStatusWidget.tsx
EquipmentStatusWidget.tsx
Header.tsx
IntegratedSummaryCards.tsx
MainChartSection.tsx
Modal.tsx
PriorityRiskTable.tsx
RealtimeAlertList.tsx
RiskTimelineChart.tsx
Sidebar.tsx
SummaryCards.tsx
SystemStatusWidget.tsx
WorkerSafetySection.tsx
WorkerSafetyWidget.tsx
```

`AIM Monitoring/src/pages`:

```txt
AlertsEvents.tsx
EnvironmentDiagnosis.tsx
EquipmentDiagnosis.tsx
IntegratedDashboard.tsx
Report.tsx
Settings.tsx
WorkerSafety.tsx
```

## 7. 디자인 특성

주요 색상:
- 배경: `#0b1120`
- 카드: `#111827`
- 보더: `#1f2937`
- 보조 표면: `#1e293b`
- Primary: `#2563eb`
- 위험: red 계열
- 주의: yellow/orange 계열
- 정상: emerald 계열
- 정보/센서: blue/cyan 계열

UI 특성:
- enterprise monitoring dashboard 느낌
- 카드 radius는 대체로 `rounded-lg`, `rounded-xl`
- 대시보드는 12-grid 기반 레이아웃 사용
- 테이블/필터/상세 패널이 많아 운영형 제품에 가깝다.
- 사업계획서의 설비/환경/작업자 안전 축이 이미 반영되어 있다.

## 8. 사업계획서 반영 상태

이미 반영된 축:
- 설비 진단
- 환경 진단
- 작업자 안전
- 알림/이벤트
- 리포트
- 시스템 설정
- 통합 대시보드
- 진동, 온도, 가스, SpO2, 낙상, 조치 상태 등의 도메인

추가로 보강할 축:
- 초음파 아크 감지
- FFT 1X/2X/3X 스펙트럼
- Autoencoder 이상탐지 점수
- LSTM/CNN-LSTM 잔여수명 예측
- SOP 자동 실행 세부 플로우
- 하이브리드 저장/DBMS 상태
- BLE/LTE/Wi-Fi/LoRa/RS-485 통신 상태
- F1/F2 모델 성능 비교
- 현장 실증/인증 진행률

## 9. 이식 전략

### 9.1 원본 보존

`AIM Monitoring/`은 AI Studio 원본으로 보존한다.

원본을 직접 수정하지 않고, 이식 대상 폴더에 복사/변환한다.

대상:

```txt
src/monitoring-app/
src/components/monitoring-editor/
```

### 9.2 이식 우선순위

1. `Sidebar`, `Header`, `App` 구조 분석
2. `Dashboard` 및 주요 페이지를 `src/monitoring-app`으로 이식
3. Tailwind 4 import 방식 제거
4. import alias 조정
5. Next client component 규칙 반영
6. Recharts 2 호환성 확인
7. AIMNIS 에디터 shell에 중앙 preview로 연결
8. Editable section overlay 연결
9. 좌측 위젯 탭/12그리드/우측 inspector 연결

### 9.3 Next.js 이식 시 주의

각 이식 컴포넌트 상단에는 필요 시 `"use client";`를 추가한다.

Vite entry는 사용하지 않는다.

사용하지 않을 파일:

```txt
AIM Monitoring/src/main.tsx
AIM Monitoring/index.html
AIM Monitoring/vite.config.ts
```

참고만 할 파일:

```txt
AIM Monitoring/package.json
AIM Monitoring/metadata.json
AIM Monitoring/README.md
```

본 앱에 이식할 파일:

```txt
AIM Monitoring/src/App.tsx
AIM Monitoring/src/components/**
AIM Monitoring/src/pages/**
AIM Monitoring/src/lib/utils.ts
```

CSS:
- `AIM Monitoring/src/index.css`의 custom-scrollbar는 본 앱 CSS에 맞춰 별도 scope로 이식한다.
- Tailwind import는 가져오지 않는다.

## 10. AIM Monitoring 에디터와의 관계

AI Studio 산출물은 `중앙 AIM Monitoring 앱/대시보드 디자인`으로 사용한다.

AIMNIS 에디터에서 새로 만들어야 하는 부분:
- 상단 AIMNIS editor toolbar
- 좌측 AIMI 채팅/위젯 탭
- 위젯 라이브러리 20개
- 12그리드 편집 캔버스
- 위젯 선택 floating toolbar
- 우측 widget inspector
- 데이터 매핑 studio
- 페이지 추가 하네스
- 퍼블리시/프로젝트 저장

즉:
- 중앙 컨텐츠 디자인은 AI Studio 산출물을 유지
- 편집 기능은 AIMNIS 에디터 기능으로 별도 부착

## 11. 발견된 리스크

1. 하위 앱 의존성 미설치
- 독립 빌드가 아직 안 된다.
- `vite`가 `node_modules/.bin`에 없다.

2. Tailwind 버전 차이
- AI Studio는 Tailwind 4 방식
- 본 앱은 Tailwind 3 방식
- class 대부분은 가능하지만 CSS entry는 변환 필요

3. React/Recharts 버전 차이
- AI Studio는 React 19/Recharts 3
- 본 앱은 React 18/Recharts 2
- 차트 동작은 이식 후 검증 필요

4. 현재 UI 코드에 mock data가 많음
- 실시간성은 시각적으로 표현되어 있으나 실제 데이터 store와는 연결되지 않았다.
- AIMNIS 데이터 매핑과 연결하려면 별도 adapter 필요

5. 일부 mock 데이터가 `Math.random()`으로 렌더 시점마다 바뀜
- Next hydration에서 문제가 될 수 있으므로 client component로 제한하거나 deterministic mock으로 바꿔야 한다.

6. 절대 색상 class가 많음
- 브랜드 설정 기능과 연결하려면 CSS variable adapter가 필요하다.
- 초기 이식에서는 원 디자인 보존을 우선하고, 이후 단계에서 토큰화한다.

## 12. 다음 작업

1. AIM GUARD 기능 감사 계속
2. AI Studio 산출물 독립 실행 검증 여부 결정
   - 필요 시 `AIM Monitoring` 하위에서 `npm install`
3. AIM Monitoring 이식 계획 수립
4. `src/monitoring-app`에 원본 보존형 복사
5. Next/React18 호환성 조정
6. 중앙 preview로 띄우기

## 13. 현재 판단

AIM Monitoring 디자인 산출물은 충분히 쓸 수 있다.

오히려 기대보다 상태가 좋다.
이미 제품의 핵심 페이지와 도메인 화면이 들어 있으므로, 이제 작업 방향은 “새로 디자인”이 아니라 “AI Studio 디자인을 안전하게 이식하고, AIMNIS 에디터 기능을 얹는 것”이다.
