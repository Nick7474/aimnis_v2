# AIM Monitoring 별도 제작 실행 계획서

작성일: 2026-06-06
작업자: Codex
목표: 기존 AIM GUARD 기능을 절대 훼손하지 않고, AIM Monitoring을 AIMNIS 플랫폼 안에 별도 솔루션으로 추가한다.

## 0. 최우선 원칙

이 작업의 가장 중요한 원칙은 `AIM GUARD를 건드리지 않는 것`이다.

금지:
- `src/guard-app/**` 직접 수정 금지
- `src/solutions/guard/**` 직접 수정 금지
- `aim-guard/**` 직접 수정 금지
- AIM GUARD 전용 페이지, 알람 패널, 페이지 추가 플로우, 기존 위젯 동작 변경 금지
- 기존 AIM GUARD UI를 AIM Monitoring 구현을 위해 재활용한다는 이유로 구조를 바꾸는 것 금지

허용:
- 홈, 프로젝트, 에디터 진입점처럼 플랫폼 공통 라우팅에 AIM Monitoring을 등록하기 위한 최소 수정
- 공통 컴포넌트에 solution 분기를 추가하는 최소 수정
- 단, guard 분기 결과는 기존과 100% 동일해야 한다.

구현 전략:
- AIM Monitoring은 별도 폴더/별도 컴포넌트/별도 store/별도 위젯으로 제작한다.
- AIM GUARD는 reference로만 읽고, 코드를 직접 바꾸지 않는다.
- 에디터는 공통 Shell만 사용하고, 중앙 화면/좌측 위젯 탭/12그리드/우측 인스펙터는 AIM Monitoring 전용으로 만든다.

## 1. 사업계획서 기반 AIM Monitoring 방향

첨부 PDF 핵심:
- 과제명: 산업 설비의 예방정비를 위한 AIoT 기반 휴대/고정 겸용 복합 계측기 개발
- 진단 대상: 설비, 환경, 작업자
- 센서: 음파/초음파, 3축 진동, 자이로, 접촉식 온도, 열화상, 가스(CO/CH4/H2/C2H2), SpO2, 맥파, UWB/IMU/GPS
- 통신: BLE5.0, LTE, Wi-Fi, LoRa, RS-485
- 분석: Rule-based, FFT, Autoencoder, LSTM, CNN-LSTM
- 서비스: 현장 관리자 앱, 관제실 웹, FCM 긴급 알림, SOP 자동 실행, 예지보전 리포트
- 실증: 한국서부발전 태안 발전본부, 발전소/ESS/태양광/전기·기계 설비

AIM Monitoring의 제품 포지션:
- AIM GUARD: 안전/보안/CCTV 중심
- AIM Monitoring: 산업 설비 예지보전, 복합 센서, AI 이상탐지, 유해환경, 작업자 생체 안전 중심

첨부 이미지 사용 기준:
- 이미지는 내용이 아니라 구조만 참고한다.
- 참고할 것: 좌측 위젯 탭 레이아웃, 2열 컴포넌트 라이브러리, 중앙 12그리드 드롭 감각, 선택 위젯 우측 편집 패널 구조
- 참고하지 않을 것: 이미지 안의 차트명, 차트 종류, AIM GUARD에 가까운 카드 내용
- 실제 위젯 내용은 반드시 사업계획서에서 뽑는다.

## 2. 신규 파일 구조

신규 생성 중심:

```txt
src/solutions/monitoring/
  manifest.json
  harness-schema.json
  templates/default.json
  widgets/index.json

src/monitoring-app/
  MonitoringApp.tsx
  MonitoringDashboard.tsx
  MonitoringLayout.tsx
  monitoring.css
  mock/
    data.ts

src/components/editor/monitoring/
  MonitoringEditorShell.tsx
  MonitoringCanvas.tsx
  MonitoringGridCanvas.tsx
  MonitoringLeftPanel.tsx
  MonitoringChatTab.tsx
  MonitoringWidgetTab.tsx
  MonitoringWidgetCard.tsx
  MonitoringWidgetRenderer.tsx
  MonitoringWidgetInspector.tsx
  MonitoringGridUtils.ts

src/components/editor/widgets/monitoring/
  MonitoringWidgetFrame.tsx
  AssetHealthKpiWidget.tsx
  AnomalyScoreGaugeWidget.tsx
  FftSpectrumWidget.tsx
  VibrationTrendWidget.tsx
  UltrasoundArcWidget.tsx
  ThermalHotspotWidget.tsx
  MultiGasWidget.tsx
  WorkerBioSafetyWidget.tsx
  FallDetectionWidget.tsx
  LocationMapWidget.tsx
  RulPredictionWidget.tsx
  MaintenancePrescriptionWidget.tsx
  SopRunnerWidget.tsx
  AlertTimelineWidget.tsx
  ConnectivityWidget.tsx
  DataPipelineWidget.tsx
  HybridStorageWidget.tsx
  PredictiveReportWidget.tsx
  ModelScoreWidget.tsx
  ValidationRoadmapWidget.tsx

src/store/monitoringEditorStore.ts
src/data/monitoringScenarios.ts
```

공통 파일 최소 수정:
- `src/data/marketplace.json`: monitoring 등록
- `src/components/home/HomeHero.tsx`: 홈 카드/칩 추가, AIM OPS 삭제
- `src/store/homeStore.ts`: selectedSolution 또는 solution별 Step2 데이터 지원
- `src/app/editor/page.tsx`: solution=monitoring이면 MonitoringEditorShell 렌더
- `src/components/projects/ProjectsGrid.tsx`: monitoring 프로젝트 실행 분기
- `src/components/layout/Navbar.tsx` 또는 에디터 nav: AIM Monitoring 링크 표시가 필요할 때만 최소 수정

## 3. 홈 화면 기획

상단 채팅 패널:
- AIM GUARD 오른쪽에 AIM Monitoring 칩 추가
- AIM Monitoring active 상태 지원
- 자연어 입력에 `모니터링`, `예지보전`, `설비`, `진동`, `가스`, `SpO2`, `발전소`, `ESS`, `태양광`, `초음파`, `열화상` 등이 포함되면 AIM Monitoring으로 유도

하단 솔루션 플랫폼:
- AIM GUARD 옆에 AIM Monitoring 카드 추가
- AIM OPS 삭제
- 총 6개 카드 구성 유지
- AIM Monitoring은 시작하기 활성

AIM Monitoring 카드 내용:
- 이름: AIM Monitoring
- 카테고리: Predictive Monitoring
- 설명: AIoT 복합 계측 데이터로 설비 이상, 유해환경, 작업자 안전을 실시간 분석하는 예지보전 모니터링 솔루션
- 태그: 복합 센서, AI 이상탐지, SOP 자동 실행
- 버튼: 시작하기

시나리오 판단:
- 기존 3개 시나리오는 유지한다.
- 단, AIM Monitoring에서는 질문과 Blueprint가 바뀐다.
- 이유: 사업계획서의 적용처가 에너지/제조/공공시설 모두에 걸쳐 있어 기존 3개 축이 자연스럽다.

## 4. Home Step2 기획

진입:
- 홈 상단 AIM Monitoring 칩 + 시나리오 클릭
- 자연어 상담에서 AIM Monitoring 추천 클릭
- AIM Monitoring 카드 시작하기 클릭

형식:
- AIM GUARD Step2와 같은 3열/채팅/Live Blueprint/전문가 추천세팅/하네스 생성 경험은 유지
- 구현은 guard 데이터를 수정하지 말고 `monitoringScenarios.ts`를 새로 만들어 분기

질문 그룹:

1. 현장/설비 범위
- 주 모니터링 현장은 어디인가요?
  - 발전소/변전소, ESS/태양광, 제조 공장, 산업단지/공공시설, 학교/시장/노후시설
- 관리 대상 설비는 무엇인가요?
  - 모터/펌프/팬, 변압기/배전반, ESS/PV 접속반, 로봇/생산설비, 구조물/노후시설
- 운영 방식은 어떻게 되나요?
  - 24시간 상시, 교대 운영, 이동 점검 중심, 고정 센서 중심, 혼합 운영

2. 센서/데이터
- 수집할 센서 데이터는 무엇인가요?
  - 음파/초음파, 3축 진동, 자이로/기울기, 접촉식 온도, 열화상, 가스, SpO2/맥파, 위치
- 통신 방식은 무엇인가요?
  - BLE5.0, LTE, Wi-Fi, LoRa, RS-485, 혼합
- 저장 방식은 무엇인가요?
  - 단말 저장, 관제 서버, 클라우드, 하이브리드, 통신 복구 후 자동 동기화

3. AI 진단/예측
- 분석 목적은 무엇인가요?
  - 이상 조기 감지, 고장 예측, 설비 효율 개선, 유해환경 감시, 작업자 위험 관리
- 적용할 분석 방식은 무엇인가요?
  - Rule-based, FFT, Autoencoder, LSTM, CNN-LSTM, 혼합
- 모델 기준은 어떻게 잡을까요?
  - F1 균형형, F2 안전 우선형, 오보 최소화, 미검출 최소화

4. 알람/SOP/리포트
- 알람 이벤트는 무엇인가요?
  - 초음파 급증, 2X 진동 피크, 과열, 유해가스, SpO2 90% 미만, 쓰러짐, 통신 장애
- 알림 채널은 무엇인가요?
  - 관제 팝업, FCM 푸시, SMS, 메신저, 사운드/LED, 외부 API
- 자동 후속 조치는 무엇인가요?
  - 정밀 점검 요청, 설비 정지 권고, 작업 배제, 담당자 배정, SOP 체크리스트, 리포트 생성

전문가 추천세팅:
- energy: 발전소/ESS/태양광, 변압기/배전반, 초음파+열+가스+진동, F2 안전 우선, SOP 자동 실행
- manufacturing: 모터/펌프/팬, 진동+FFT+LSTM, F1 균형형, 설비 효율/고장 예측
- smartcity: 공공시설/노후시설, 가스+온도+기울기+작업자 안전, 미검출 최소화

버튼:
- `현장 맞춤 솔루션 생성하기`
- 클릭 시 `/editor?solution=monitoring`

## 5. AIM Monitoring 에디터 기획

중요:
- AIM GUARD의 `MonitorWrapper`를 수정해서 억지로 Monitoring을 넣지 않는다.
- 새 `MonitoringEditorShell`을 만들고, `src/app/editor/page.tsx`에서 solution별로 분기한다.

에디터 구조:
- 상단: AIMNIS / AIM Monitoring / 저장 / 확대 / 퍼블리시
- 좌측: Monitoring 전용 패널
  - 탭 1: 채팅
  - 탭 2: 위젯
- 중앙: AIM Monitoring 대시보드 + 12그리드 편집 캔버스
- 우측: Monitoring 전용 설정/데이터 매핑 패널

좌측 위젯 탭:
- 첨부 이미지처럼 구조만 참고
- 2열 카드 그리드
- 카드에는 사업계획서 기반 위젯명, 미니 시각화, 센서/AI 태그 표시
- 드래그 시 중앙 그리드에 drop preview 표시

중앙 12그리드:
- 12 columns
- row height 40px
- gap 12px
- 위젯 이동/리사이즈 가능
- 충돌 방지
- 위젯별 최소/권장 크기 적용

우측 패널:
- 선택 위젯 편집
- 탭: 데이터, 스타일, 인터랙션
- 데이터 소스 선택, API 필드 매핑, 임계값, 표시 단위, refresh interval, 알람/SOP 연동 편집

## 6. 사업계획서 기반 20개 핵심 위젯

1. 설비 종합 상태 KPI
- 정상/주의/위험 설비 수, 설비군별 상태

2. 이상 조기 감지 점수
- Autoencoder reconstruction error, 이상 점수, 임계값

3. FFT 주파수 스펙트럼
- 1X/2X/3X 피크, 고주파 영역, 비정렬/비틀림 판단

4. 진동 시계열
- 3축 가속도, 속도(mm/s), trend, smoothing

5. 초음파 아크 감지
- 40kHz 대역, dB 급증, 잠재 아크 결함

6. 열/열화상 과열 맵
- hotspot, 접점 온도, ΔT

7. 가스 농도 복합 카드
- CO, CH4, H2/C2H2, 유해환경 등급

8. 작업자 생체 안전
- SpO2, 맥파, 작업 가능/배제 상태

9. 쓰러짐/자세 변화 감지
- 가속도 벡터합, Tilt 변화, 사고 판정

10. 실내외 위치 맵
- UWB/IMU/GPS 기반 작업자/장비 위치

11. 설비 잔여수명 예측
- LSTM 기반 열화 패턴, RUL, 고장 확률

12. 처방형 유지보수 추천
- 점검/보충/교체/정지 권고 액션

13. SOP 자동 실행 패널
- 이벤트별 체크리스트, 담당자, 처리율

14. 알람 이벤트 타임라인
- 위험/주의/정보 이벤트, 처리 상태

15. 통신/데이터 동기화 상태
- BLE/LTE/Wi-Fi/LoRa/RS-485, 오프라인 큐

16. 데이터 파이프라인 상태
- 수집, 전처리, 저장, 분석, 알림 단계

17. 하이브리드 저장소/DBMS
- Edge/Server/Cloud 저장량, 쿼리 지연, retention

18. 예지보전 리포트
- 자동 리포트 목록, 핵심 결론, 다운로드

19. F1/F2 모델 성능 비교
- 정확도, 재현율, F1/F2, 오보/미검출

20. 현장 실증/인증 진행률
- 2026~2028 개발/실증/GS 인증 마일스톤

## 7. 작업 순서

### Step 1. 안전장치와 스캐폴딩

1. git 상태 확인
2. AIM GUARD 금지 파일 목록 확인
3. `src/solutions/monitoring` 생성
4. `src/monitoring-app` 생성
5. `src/store/monitoringEditorStore.ts` 생성
6. `src/components/editor/monitoring` 생성

완료 기준:
- guard 관련 폴더 변경 없음
- monitoring 폴더만 신규 생성

### Step 2. 솔루션 등록과 홈 연결

1. `marketplace.json`에 monitoring 추가
2. `HomeHero.tsx`에 AIM Monitoring 카드/칩 추가
3. AIM OPS 삭제
4. AIM Monitoring 시작하기 활성화
5. 자연어 monitoring intent 처리

완료 기준:
- 홈에서 AIM Monitoring이 AIM GUARD 오른쪽에 보임
- AIM OPS가 사라짐
- AIM GUARD 카드 기존 동작 유지

### Step 3. Monitoring Step2 별도 질문

1. `src/data/monitoringScenarios.ts` 작성
2. homeStore에 solution별 Step2 상태 추가
3. monitoring 전문가 추천세팅 작성
4. monitoring blueprint/harness 문구 작성
5. 생성 버튼이 `/editor?solution=monitoring`으로 이동

완료 기준:
- AIM Monitoring Step2 질문이 AIM GUARD와 다름
- 사업계획서 기반 질문이 나옴
- AIM GUARD Step2는 기존 그대로

### Step 4. Monitoring 에디터 별도 Shell

1. `MonitoringEditorShell.tsx` 생성
2. `src/app/editor/page.tsx`에서 `solution=monitoring` 분기
3. guard는 기존 `EditorLayout` 그대로 렌더
4. monitoring만 새 Shell 렌더

완료 기준:
- `/editor?solution=guard` 또는 기본 `/editor`는 기존 그대로
- `/editor?solution=monitoring`은 새 화면

### Step 5. Monitoring 중앙 대시보드

1. `MonitoringApp.tsx`, `MonitoringDashboard.tsx` 제작
2. 사업계획서 기반 기본 대시보드 구성
3. 설비/환경/작업자/AI/SOP 요약 카드 배치
4. 브랜드 토큰은 별도 monitoring css 변수로 연결

완료 기준:
- AIM Monitoring 정체성이 중앙에 명확함
- AIM GUARD 화면과 시각적으로 구분됨

### Step 6. 좌측 채팅/위젯 탭

1. `MonitoringLeftPanel.tsx`
2. `MonitoringChatTab.tsx`
3. `MonitoringWidgetTab.tsx`
4. 20개 위젯 2열 카드 렌더
5. 구조는 첨부 이미지 참고, 내용은 사업계획서 기반

완료 기준:
- 채팅 탭/위젯 탭 전환 가능
- 위젯 탭에는 20개 핵심 위젯 표시

### Step 7. 12그리드 드래그/리사이즈

1. `MonitoringGridCanvas.tsx`
2. `MonitoringGridUtils.ts`
3. drag/drop
4. grid snap
5. resize handles
6. collision guard

완료 기준:
- 위젯을 중앙 12그리드에 자유 배치
- 가로/세로 리사이즈 가능
- 배치 후 선택 가능

### Step 8. 위젯 20개 실제 디자인

1. 공통 `MonitoringWidgetFrame`
2. 20개 위젯 컴포넌트 작성
3. 크기별 반응형 처리
4. 우측 인스펙터와 연결할 config 설계

완료 기준:
- 모든 위젯이 단순 placeholder가 아니라 사업계획서 맥락을 담음
- 작은 크기에서도 텍스트가 깨지지 않음

### Step 9. 우측 위젯 설정 패널

1. `MonitoringWidgetInspector.tsx`
2. 데이터/스타일/인터랙션 탭
3. 타이틀 수정
4. 데이터 소스/API 필드 매핑
5. 임계값/단위/알람/SOP 옵션

완료 기준:
- 선택 위젯의 타이틀 수정 가능
- 주요 옵션이 즉시 화면에 반영

### Step 10. 퍼블리시/프로젝트

1. monitoring project 저장
2. ProjectsGrid에서 AIM Monitoring 실행 버튼 분기
3. `/monitoring` 페이지가 필요하면 신규 생성
4. 저장된 monitoring 대시보드 복원

완료 기준:
- 퍼블리시 후 프로젝트 목록에 AIM Monitoring으로 저장
- 프로젝트 실행 시 AIM Monitoring 화면으로 이동

### Step 11. 검증

필수 검증:
- `npm run lint`
- `npm run build`
- `npm run dev`
- `/home`
- `/editor`
- `/editor?solution=monitoring`
- `/projects`

AIM GUARD 회귀 체크:
- 홈 AIM GUARD 카드 시작
- AIM GUARD Step2
- AIM GUARD 에디터
- AIM GUARD 브랜드 설정
- AIM GUARD 데이터 매핑
- AIM GUARD 페이지 추가
- AIM GUARD 퍼블리시/프로젝트 실행

## 8. 구현 메모

solution 분기 원칙:
- `if (solutionId === "monitoring") return <MonitoringEditorShell />`
- guard 쪽에 조건을 끼워 넣어 기능을 바꾸지 않는다.

store 원칙:
- AIM GUARD는 기존 `editorStore` 유지
- AIM Monitoring은 `monitoringEditorStore` 신규 작성
- 공통 store 공유가 꼭 필요할 때만 읽기 전용 수준으로 사용

디자인 원칙:
- AIM Monitoring은 산업 설비/AIoT/예지보전 제품처럼 보여야 한다.
- AIM GUARD처럼 CCTV/보안 중심으로 보이면 실패다.
- 첨부 이미지는 위젯 라이브러리의 구조 참고용이다.

## 9. 완료 정의

이 작업은 다음이 모두 만족되어야 완료다.

- AIM GUARD 관련 기존 기능이 모두 그대로 작동한다.
- AIM Monitoring이 홈에서 선택 가능하다.
- AIM Monitoring Step2가 사업계획서 기반 질문을 한다.
- AIM Monitoring 에디터가 별도 화면으로 열린다.
- 좌측 패널에 채팅/위젯 탭이 있다.
- 위젯 탭에 사업계획서 기반 20개 위젯이 있다.
- 20개 위젯을 12그리드 캔버스에 드래그 앤 드롭할 수 있다.
- 배치 위젯은 이동/리사이즈/선택/우측 편집이 가능하다.
- 퍼블리시와 프로젝트 저장/실행이 monitoring으로 분기된다.
- lint/build가 통과한다.
