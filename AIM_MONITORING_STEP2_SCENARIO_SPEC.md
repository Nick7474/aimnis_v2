# AIM Monitoring Home Step2 시나리오/질문 기획서

작성일: 2026-06-06
작성자: Codex
상태: 1차 상세 기획

## 0. 목적

AIM Monitoring은 기존 AIM GUARD Step2 형식을 유지하되, 질문과 Blueprint 내용은 사업계획서 기반으로 완전히 달라야 한다.

기존 3개 시나리오는 유지한다.
단, 의미를 AIM Monitoring에 맞게 재해석한다.

```txt
energy        -> 에너지/발전/ESS 설비의 예지보전 통합 관제
manufacturing -> 회전기기/생산설비의 AI 이상 감지
smartcity     -> 공공/지하/환경 시설과 작업자 안전 관제
```

## 1. Step2 공통 UX

기존 AIM GUARD와 동일하게 유지:

- 좌측 채팅 패널
- AI 역질문
- 우측 Live Blueprint
- 전문가 추천세팅
- MD 설계서 생성
- 현장 맞춤 솔루션 생성하기 버튼
- 생성 완료 후 `/editor?solution=monitoring&scenario={id}` 이동

달라져야 하는 것:

- 질문 내용
- 추천 defaultSpecs
- Blueprint 섹션 내용
- widget hints
- API/data mapping hints
- 최종 harness payload

## 2. Blueprint 섹션

AIM Monitoring Step2의 Blueprint는 아래 섹션을 권장한다.

```md
# AIM Monitoring Harness

## 현장/설비 범위
## 계측 센서 구성
## AI 진단 모델
## 작업자 안전 정책
## 데이터/통신 연동
## 대시보드 위젯
## SOP/알림 정책
## 리포트/실증 계획
```

기존 AIM GUARD의 CCTV, VMS, 보안구역 중심 Blueprint와 구분한다.

## 3. 공통 질문 그룹

### 3.1 현장/설비 범위

목적:
- 어떤 현장과 설비를 우선 모니터링할지 결정한다.

질문:

1. 우선 진단할 설비 유형은 무엇인가요?
   - 전기 설비
   - 회전기기
   - 펌프/팬/모터
   - ESS/배터리
   - 지하/환경 시설
   - 복합 설비

2. 운영 방식은 어떻게 되나요?
   - 24시간 상시
   - 주간 점검
   - 교대 운영
   - 이벤트 발생 시 점검
   - 실증/파일럿 운영

3. 계측 방식은 무엇이 적합한가요?
   - 휴대 점검형
   - 고정 설치형
   - 휴대/고정 겸용
   - 게이트웨이 통합형

### 3.2 계측 센서 구성

질문:

1. 우선 적용할 센서는 무엇인가요?
   - 초음파
   - 3축 진동
   - 열/온도
   - 가스
   - SpO2
   - IMU/Gyro
   - 전체 복합 센서

2. 설비 고장 초기 징후 중 가장 중요한 것은 무엇인가요?
   - 초음파 소음
   - 이상 진동
   - 미세 가스
   - 과열
   - 작업자 쓰러짐
   - 복합 징후

3. 데이터 수집 주기는 어느 수준이 필요한가요?
   - 초 단위
   - 분 단위
   - 점검 시 수동 수집
   - 이벤트 기반
   - 센서별 다르게

### 3.3 AI 진단 모델

질문:

1. AI 진단의 우선 목표는 무엇인가요?
   - 이상 조기 감지
   - 고장 원인 분류
   - 잔여수명 예측
   - 경보 오탐 감소
   - 미검출 최소화

2. 운영 기준은 무엇에 가까운가요?
   - F1-score 균형 운영
   - F2-score 안전 우선 운영
   - 설비별 혼합 운영

3. 사용할 분석 방식은 무엇인가요?
   - FFT 주파수 분석
   - Autoencoder 이상탐지
   - LSTM 예측
   - CNN-LSTM 스펙트로그램
   - 규칙 기반 + AI 혼합

### 3.4 작업자 안전 정책

질문:

1. 작업자 안전에서 우선 감지할 항목은 무엇인가요?
   - SpO2 저하
   - 쓰러짐 감지
   - 위험구역 진입
   - 유해가스 노출
   - 복합 위험

2. 긴급 상황 알림은 어떻게 운영할까요?
   - 관제 화면 팝업
   - 모바일 푸시
   - SMS
   - 현장 사운드/LED
   - SOP 자동 실행

3. 작업 배제 기준은 어떻게 둘까요?
   - SpO2 90 이하
   - 움직임 없음 1분
   - 유해가스 기준 초과
   - 관리자 승인 필요

### 3.5 데이터/통신 연동

질문:

1. 통신 방식은 무엇을 우선 지원해야 하나요?
   - BLE5.0
   - LTE
   - Wi-Fi
   - LoRa
   - RS-485
   - 혼합

2. 데이터 저장 위치는 어디가 적합한가요?
   - 로컬 장비
   - 모바일 앱
   - 관제 서버
   - 클라우드
   - 하이브리드

3. 연동할 시스템은 무엇인가요?
   - 설비관리시스템
   - MES
   - SCADA
   - 알림/메신저
   - 리포트 시스템
   - 아직 미정

## 4. 시나리오별 defaultSpecs

### 4.1 에너지 시설 통합 관제

ID: `energy`

추천 대상:
- 발전 설비
- ESS
- 전력/전기 설비
- 태양광/신재생 설비
- 변전/배전 설비

defaultSpecs:

```ts
{
  facility_type: "발전/ESS 전기 설비",
  monitoring_mode: "24시간 상시",
  device_mode: "휴대/고정 겸용",
  priority_sensors: ["초음파", "열/온도", "가스", "진동"],
  fault_signals: ["아크/코로나", "과열", "열화 가스", "이상 진동"],
  ai_models: ["Autoencoder", "LSTM", "규칙 기반"],
  model_policy: "F2-score 안전 우선",
  communication: ["LTE", "Wi-Fi", "LoRa"],
  alert_channels: ["관제 화면", "모바일 푸시", "SOP 자동 실행"],
  recommended_widgets: [
    "ultrasonic-arc-risk",
    "thermal-delta-map",
    "gas-decomposition-panel",
    "autoencoder-anomaly",
    "sop-auto-execution"
  ]
}
```

대표 질문:

1. 발전/ESS 설비 중 어떤 설비를 우선 진단할까요?
2. 아크/과열/가스/진동 중 미검출을 가장 줄여야 하는 위험은 무엇인가요?
3. 안전 우선 F2 운영으로 경보를 민감하게 가져가도 괜찮을까요?

### 4.2 스마트 제조 이상 감지

ID: `manufacturing`

추천 대상:
- 모터
- 펌프
- 팬
- 회전기기
- 생산설비

defaultSpecs:

```ts
{
  facility_type: "스마트 제조 회전기기",
  monitoring_mode: "교대 운영 + 이벤트 기반",
  device_mode: "고정 설치형 + 휴대 점검형",
  priority_sensors: ["3축 진동", "초음파", "열/온도", "가스"],
  fault_signals: ["1X/2X/3X FFT 피크", "비정렬", "마찰", "베어링 이상"],
  ai_models: ["FFT", "Autoencoder", "CNN-LSTM", "LSTM"],
  model_policy: "F1/F2 혼합",
  communication: ["RS-485", "Wi-Fi", "BLE5.0"],
  alert_channels: ["관제 화면", "설비관리 연동", "예지보전 리포트"],
  recommended_widgets: [
    "vibration-fft-spectrum",
    "cnn-lstm-spectrogram",
    "rul-lstm-forecast",
    "fault-progression-stage",
    "predictive-report"
  ]
}
```

대표 질문:

1. 회전기기 중 우선 진단할 대상은 모터, 펌프, 팬 중 무엇인가요?
2. FFT 기반 1X/2X/3X 피크 분석이 필요한 설비가 있나요?
3. 고장 예측 결과를 예지보전 리포트로 자동 생성할까요?

### 4.3 스마트시티 안전 관제

ID: `smartcity`

추천 대상:
- 공공 시설
- 지하 시설
- 도시 기반시설
- 위험 작업 구역
- 환경 안전 구역

defaultSpecs:

```ts
{
  facility_type: "공공/환경 안전 시설",
  monitoring_mode: "24시간 관제 + 현장 출동",
  device_mode: "휴대/고정 겸용",
  priority_sensors: ["가스", "온도", "SpO2", "IMU/Gyro"],
  fault_signals: ["유해가스", "과열", "작업자 쓰러짐", "위험구역 진입"],
  ai_models: ["규칙 기반", "작업자 컨텍스트 융합", "Autoencoder"],
  model_policy: "F2-score 안전 우선",
  communication: ["LTE", "LoRa", "BLE5.0"],
  alert_channels: ["모바일 푸시", "SMS", "현장 사운드/LED", "SOP 자동 실행"],
  recommended_widgets: [
    "worker-spo2-status",
    "worker-fall-detection",
    "worker-context-fusion",
    "hazard-zone-map",
    "gateway-communication"
  ]
}
```

대표 질문:

1. 환경 위험과 작업자 안전 중 어느 쪽을 우선 관제할까요?
2. 쓰러짐 감지 후 카운트다운/자동 신고 절차가 필요할까요?
3. 통신은 LTE, LoRa, BLE 중 어떤 현장 조건에 맞춰야 하나요?

## 5. 전문가 추천세팅 동작

기존 AIM GUARD와 동일한 UX:

- 클릭 시 defaultSpecs 자동 입력
- Blueprint 자동 보강
- 추천 위젯 목록 표시
- API Mapping 후보 표시
- 완료 상태로 전환 가능

Monitoring 전용 보강:

- 추천 위젯을 20개 widget definition에서 가져온다.
- 추천 데이터 소스를 sensor/ai/sop 중심으로 만든다.
- 추천 모델 정책은 F1/F2 선택을 포함한다.

## 6. `/api/interview` 분기 전략

기존 API에 solution을 추가한다.

요청:

```json
{
  "solution": "monitoring",
  "scenario": "manufacturing",
  "messages": []
}
```

응답:

```json
{
  "message": "확인했습니다. 회전기기 이상 감지를 중심으로 구성하겠습니다.",
  "question": "FFT 기반 1X/2X/3X 피크 분석이 필요한 설비가 있나요?",
  "blueprintUpdate": {
    "section": "AI 진단 모델",
    "content": "- FFT 주파수 분석\n- Autoencoder 이상탐지\n"
  },
  "isComplete": false
}
```

주의:

- guard 요청은 기존 prompt/mock을 유지한다.
- monitoring 요청만 monitoring question set을 사용한다.

## 7. Harness payload

Step2 완료 후 저장할 payload:

```ts
interface MonitoringHarnessDraft {
  solution: "monitoring";
  scenario: "energy" | "manufacturing" | "smartcity";
  specs: Record<string, unknown>;
  blueprintMd: string;
  recommendedWidgets: string[];
  recommendedDataSources: string[];
  modelPolicy: "f1" | "f2" | "mixed";
  createdAt: string;
}
```

session/localStorage key:

```txt
aimnis_harness_draft
```

기존 key를 쓰되 payload 안의 solution으로 분기한다.

## 8. 완료 기준

- AIM Monitoring Step2 질문이 AIM GUARD 질문과 명확히 다르다.
- 사업계획서의 설비/환경/작업자/AI/SOP 축이 반영된다.
- 기존 3개 시나리오는 유지하되 Monitoring에 맞게 재해석된다.
- 전문가 추천세팅이 monitoring defaultSpecs를 자동 반영한다.
- 생성 버튼이 monitoring editor로 이동한다.
- guard Step2는 기존 그대로 동작한다.
