# AIM Monitoring 핵심 위젯 기획서

작성일: 2026-06-06
작성자: Codex
상태: 1차 상세 기획

## 0. 목적

이 문서는 AIM Monitoring 에디터의 좌측 위젯 탭에 들어갈 20개 핵심 위젯을 정의한다.

대표님 지시사항:

- 첨부 사업계획서 내용을 기반으로 위젯을 뽑는다.
- 참고 이미지는 구조만 참고한다.
- AIM GUARD에 가까운 보안/CCTV 위젯으로 만들지 않는다.
- AIM Monitoring의 핵심은 산업 설비 예방정비, AIoT 복합 계측, 환경 진단, 작업자 안전, AI 예지보전이다.
- 좌측 위젯 탭에서는 심플 카드로 보이고, 중앙 12그리드에 드롭되면 디테일한 운영형 위젯으로 렌더링한다.
- 선택된 위젯은 우측 패널에서 title, data, style, threshold, option 등을 편집한다.

## 1. 사업계획서 근거 요약

첨부 PDF에서 확인된 핵심 도메인:

- 산업 설비 예방정비용 AIoT 기반 휴대/고정 겸용 복합 계측기
- 설비 진단: 소음, 음파/초음파, 3축 진동, 열화 가스, 과열
- 환경 진단: 유해 가스
- 작업자 진단: SpO2, 움직임, 쓰러짐 감지
- 고장 초기 징후: 초음파 소음, 이상 진동, 미세 가스, 과열
- 비접촉 진단 대상: 아크, 누설, 절연, 과전류, 불평형
- 센서: 마이크로폰, 3축 가속도, 3축 Gyro, 온도 2채널, 가스 3종, 열화상, SpO2
- 통신: BLE5.0, LTE, Wi-Fi, LoRa, RS-485
- AI: FFT, Autoencoder, LSTM, CNN-LSTM
- 운영: 규칙 기반 진단 엔진, SOP 자동 실행, 예지보전 리포트
- 모델 평가: F1-score, F2-score
- 실증: 한국서부발전 태안 발전본부, 신재생설비, ESS, 사용자 의견 수렴

## 2. 위젯 설계 원칙

### 2.1 12그리드 기준

기본 grid:

```txt
columns: 12
rowHeight: 32px 또는 36px
gap: 12px
container: AIM Monitoring content area
```

위젯 크기 정책:

- small: 3x3 또는 3x4
- medium: 4x4 또는 4x5
- wide: 6x4 또는 6x5
- large: 8x6
- full: 12x5 이상

각 위젯은 다음 값을 가진다.

```ts
interface MonitoringWidgetDefinition {
  id: string;
  name: string;
  category: "equipment" | "environment" | "worker" | "ai" | "operation" | "system";
  summary: string;
  libraryPreview: "mini-card" | "mini-chart" | "mini-gauge" | "mini-table" | "mini-flow";
  defaultGrid: { x: number; y: number; w: number; h: number };
  minGrid: { w: number; h: number };
  maxGrid?: { w: number; h: number };
  dataFields: string[];
  editableOptions: string[];
}
```

### 2.2 좌측 위젯 탭 표현

좌측 패널:

- `Chat` 탭
- `Widgets` 탭

Widgets 탭 구조:

- 2열
- 10행
- 카테고리 필터 또는 섹션 라벨
- 각 카드에는 icon, title, mini visual, short metric 표시
- 드래그 시작 시 중앙 grid 위에 drop preview 표시

좌측 카드에는 복잡한 설명을 넣지 않는다.
드롭 후 중앙 위젯에서 전문적이고 디테일하게 표현한다.

### 2.3 중앙 위젯 표현

중앙 드롭 후:

- AIM Monitoring AI Studio 디자인 톤 유지
- 어두운 운영형 카드
- 타이틀/상태/수치/추세/알림/차트 포함
- 크기가 작아지면 정보 밀도 자동 축소
- 크기가 커지면 상세 차트, 테이블, 해석 문구, 추천 조치 표시

### 2.4 우측 패널 편집

공통 편집:

- 타이틀
- 부제
- 데이터 소스
- 갱신 주기
- 색상 테마
- 표시 모드
- 임계값
- 경보 등급
- 단위

위젯별 고급 편집:

- 센서 채널
- FFT band
- AI model
- F1/F2 mode
- SOP policy
- worker safety rule
- communication protocol
- report period

## 3. 20개 핵심 위젯 목록

| No | 위젯 ID | 이름 | 카테고리 | 기본 크기 | 핵심 목적 |
|---|---|---|---|---|---|
| 01 | `ultrasonic-arc-risk` | 초음파 아크 위험도 | 설비 | 4x4 | 미세 방전/코로나/아크 초기 징후 감지 |
| 02 | `vibration-fft-spectrum` | 진동 FFT 스펙트럼 | 설비 | 6x5 | 1X/2X/3X 피크 기반 회전기기 결함 분석 |
| 03 | `thermal-delta-map` | 과열 ΔT 히트맵 | 설비 | 6x4 | 접점/상간 온도 차이와 과열 위험 표시 |
| 04 | `gas-decomposition-panel` | 열화 가스 분해 패널 | 환경 | 4x5 | CO/CH4/H2/C2H2 등 가스 조합으로 원인 추정 |
| 05 | `multi-sensor-health` | 복합 센서 헬스 매트릭스 | 설비 | 6x4 | 초음파/진동/열/가스/전원 상태 통합 |
| 06 | `fault-progression-stage` | 고장 진행 단계 | 설비 | 4x4 | 잠복기-초기-진행기-가속기-파손기 단계 표시 |
| 07 | `autoencoder-anomaly` | Autoencoder 이상 점수 | AI | 4x4 | 재구성 오차 기반 이상 여부 판단 |
| 08 | `rul-lstm-forecast` | LSTM 잔여수명 예측 | AI | 6x5 | 열화 패턴과 예지보전 시점 예측 |
| 09 | `cnn-lstm-spectrogram` | CNN-LSTM 스펙트로그램 진단 | AI | 6x5 | 진동 스펙트로그램 이미지 기반 진단 |
| 10 | `fscore-model-tuning` | F1/F2 모델 운용 모드 | AI | 4x4 | 정확도/재현율 중심 운영 전략 선택 |
| 11 | `worker-spo2-status` | 작업자 SpO2 안전 | 작업자 | 4x4 | 산소포화도 기준 작업 배제/주의 판단 |
| 12 | `worker-fall-detection` | 쓰러짐 감지 플로우 | 작업자 | 4x5 | 충격-부동-카운트다운-신고 단계 표시 |
| 13 | `worker-context-fusion` | 작업자 컨텍스트 융합 | 작업자 | 6x4 | 생체/움직임/위치/환경 데이터 결합 판단 |
| 14 | `hazard-zone-map` | 유해 환경 구역 맵 | 환경 | 6x5 | 가스/온도/작업자 위험 구역 표시 |
| 15 | `gateway-communication` | 통신 게이트웨이 상태 | 시스템 | 4x4 | BLE/LTE/Wi-Fi/LoRa/RS-485 연결 상태 |
| 16 | `device-power-battery` | 계측기 전원/배터리 | 시스템 | 4x4 | AA/D급 배터리, 잔량, 예상 동작시간 표시 |
| 17 | `sop-auto-execution` | SOP 자동 실행 | 운영 | 6x5 | 경보 발생 후 표준조치 절차 진행률 |
| 18 | `predictive-report` | 예지보전 리포트 요약 | 운영 | 6x4 | 진단 결과, 원인, 조치, 다음 점검일 요약 |
| 19 | `field-validation-progress` | 현장 실증 진행률 | 운영 | 4x4 | 태안 발전본부 실증/사용자 의견/보완 현황 |
| 20 | `fleet-device-inventory` | 복합 계측기 배치 현황 | 시스템 | 6x4 | 휴대형/고정형 계측기 설치·운용 현황 |

## 4. 위젯별 상세 사양

### 4.1 초음파 아크 위험도

ID: `ultrasonic-arc-risk`

목적:
- 초음파 대역에서 아크/코로나/미세 방전 위험을 조기 표시한다.

표시:
- dB level
- baseline 대비 상승폭
- risk gauge
- 최근 10분 spark event
- “정밀 점검 필요” 판단

데이터 필드:

```txt
ultrasonicDb
baselineDb
deltaDb
frequencyBand
arcProbability
eventCount
```

우측 편집:

- 초음파 채널
- 기준 dB
- 위험 상승폭
- 표시 모드: gauge / sparkline / compact
- 경보 정책

### 4.2 진동 FFT 스펙트럼

ID: `vibration-fft-spectrum`

목적:
- 1X, 2X, 3X 피크를 기준으로 불균형, 비정렬, 커플링 문제를 보여준다.

표시:
- FFT spectrum chart
- 1X/2X/3X peak badge
- RPM 기준 주파수
- 결함 해석 문구

데이터 필드:

```txt
rpm
frequency
amplitude
peak1x
peak2x
peak3x
diagnosis
```

우측 편집:

- 기준 RPM
- FFT band
- peak threshold
- chart scale
- diagnosis rule

### 4.3 과열 ΔT 히트맵

ID: `thermal-delta-map`

목적:
- 접점/상간 온도 차이를 통해 과전류, 누설, 누전, 과열 위험을 표시한다.

표시:
- thermal mini map
- ΔT top list
- max temperature
- 위험 영역 highlight

데이터 필드:

```txt
temperatureA
temperatureB
temperatureC
deltaT
hotspot
thermalImageUrl
```

우측 편집:

- 온도 채널
- ΔT 임계값
- palette
- hotspot label
- 알림 등급

### 4.4 열화 가스 분해 패널

ID: `gas-decomposition-panel`

목적:
- CO, CO2, CH4, H2, C2H2 등 조합으로 열적 과열/아크/방전 원인을 추정한다.

표시:
- gas concentration bars
- 원인 추정 카드
- 안전 기준 초과 여부
- trend

데이터 필드:

```txt
co
co2
ch4
h2
c2h2
gasRisk
estimatedCause
```

우측 편집:

- gas sensor set
- 단위 ppm/%
- 기준값
- 원인 추정 rule
- 표시 가스 선택

### 4.5 복합 센서 헬스 매트릭스

ID: `multi-sensor-health`

목적:
- 복합 계측기의 센서 상태를 한눈에 보여준다.

표시:
- ultrasonic/vibration/thermal/gas/spo2/imu status
- calibration state
- last received
- fault count

데이터 필드:

```txt
sensorId
sensorType
status
lastSeen
calibrationStatus
battery
signalQuality
```

우측 편집:

- 표시 센서 선택
- status color
- 정렬 기준
- offline 기준 시간

### 4.6 고장 진행 단계

ID: `fault-progression-stage`

목적:
- 고장 진행 순서와 현재 설비 위치를 단계형으로 보여준다.

표시:
- 잠복기/초기/진행기/가속기/파손기
- 단계별 대표 센서
- 현재 단계
- 다음 조치

데이터 필드:

```txt
assetId
stage
primarySignal
confidence
recommendedAction
```

우측 편집:

- 단계 라벨
- 단계별 색상
- confidence threshold
- 조치 문구

### 4.7 Autoencoder 이상 점수

ID: `autoencoder-anomaly`

목적:
- 정상 데이터 기반 재구성 오차로 이상 정도를 보여준다.

표시:
- reconstruction error
- threshold line
- normal/anomaly status
- 최근 anomaly count

데이터 필드:

```txt
reconstructionError
threshold
modelVersion
anomalyScore
sampleWindow
```

우측 편집:

- model version
- threshold
- smoothing
- alert condition

### 4.8 LSTM 잔여수명 예측

ID: `rul-lstm-forecast`

목적:
- 시계열 진동/열화 패턴으로 잔여수명과 점검 시점을 예측한다.

표시:
- RUL days
- degradation curve
- recommended maintenance date
- confidence range

데이터 필드:

```txt
rulDays
degradationIndex
forecastSeries
confidenceLow
confidenceHigh
maintenanceDate
```

우측 편집:

- 예측 기간
- confidence 표시
- 점검 권고 기준
- chart mode

### 4.9 CNN-LSTM 스펙트로그램 진단

ID: `cnn-lstm-spectrogram`

목적:
- 진동 스펙트로그램 이미지와 시계열 특성을 결합한 진단 결과를 표시한다.

표시:
- spectrogram heat image
- model label
- top 3 diagnosis
- confidence

데이터 필드:

```txt
spectrogramUrl
diagnosisLabel
confidence
topClasses
modelVersion
```

우측 편집:

- model type
- class label
- heat palette
- confidence threshold

### 4.10 F1/F2 모델 운용 모드

ID: `fscore-model-tuning`

목적:
- 일반 공정 모니터링은 F1, 안전/사고 예방은 F2 중심으로 운영 전략을 보여준다.

표시:
- current mode
- precision/recall
- false alarm policy
- missed detection policy

데이터 필드:

```txt
mode
precision
recall
f1Score
f2Score
falseAlarmRate
missRate
```

우측 편집:

- F1/F2 mode
- false alarm tolerance
- recall priority
- scenario preset

### 4.11 작업자 SpO2 안전

ID: `worker-spo2-status`

목적:
- 작업자 산소포화도 상태를 기준으로 작업 지속/주의/배제를 판단한다.

표시:
- SpO2 value
- worker count by status
- below 90 count
- individual list

데이터 필드:

```txt
workerId
spo2
pulse
status
lastSeen
zone
```

우측 편집:

- SpO2 경고 기준
- 작업 배제 기준
- worker grouping
- pulse 표시 여부

### 4.12 쓰러짐 감지 플로우

ID: `worker-fall-detection`

목적:
- 충격, 비정상 움직임, 부동 상태, 카운트다운, 신고 단계를 표시한다.

표시:
- fall state timeline
- inactive duration
- countdown
- emergency status

데이터 필드:

```txt
workerId
impactG
motionPattern
inactiveSeconds
countdown
emergencyStatus
```

우측 편집:

- impact threshold
- inactive window
- countdown duration
- notification policy

### 4.13 작업자 컨텍스트 융합

ID: `worker-context-fusion`

목적:
- 생체 신호, 움직임, 위치, 환경 데이터를 결합해 실제 위험 상황인지 판단한다.

표시:
- bio/motion/location/environment score
- fused risk score
- context explanation

데이터 필드:

```txt
workerId
bioScore
motionScore
locationRisk
environmentRisk
fusionRisk
explanation
```

우측 편집:

- fusion weight
- context rule
- 표시 항목
- worker filter

### 4.14 유해 환경 구역 맵

ID: `hazard-zone-map`

목적:
- 가스, 온도, 작업자 위치를 조합해 위험 구역을 표시한다.

표시:
- zone map
- gas/temperature badges
- worker markers
- evacuation hint

데이터 필드:

```txt
zoneId
gasRisk
temperatureRisk
workerCount
evacuationStatus
```

우측 편집:

- zone source
- map mode
- hazard layers
- worker marker 표시

### 4.15 통신 게이트웨이 상태

ID: `gateway-communication`

목적:
- BLE5.0, LTE, Wi-Fi, LoRa, RS-485 등 통신 상태를 보여준다.

표시:
- protocol status
- latency
- packet loss
- gateway online count

데이터 필드:

```txt
protocol
gatewayId
status
latencyMs
packetLoss
lastSync
```

우측 편집:

- protocol filter
- offline 기준
- latency threshold
- 표시 방식

### 4.16 계측기 전원/배터리

ID: `device-power-battery`

목적:
- 휴대/고정 계측기의 전원 상태와 예상 동작 시간을 관리한다.

표시:
- battery level
- battery type
- estimated runtime
- replacement due

데이터 필드:

```txt
deviceId
batteryLevel
batteryType
runtimeHours
replacementDate
powerMode
```

우측 편집:

- battery type
- low battery threshold
- runtime display
- device filter

### 4.17 SOP 자동 실행

ID: `sop-auto-execution`

목적:
- 설비 고장/유해가스/과열/쓰러짐 발생 시 표준조치 절차를 자동 실행하고 진행률을 보여준다.

표시:
- SOP steps
- current step
- owner
- elapsed time
- completion rate

데이터 필드:

```txt
sopId
triggerEvent
currentStep
owner
elapsedSeconds
completionRate
status
```

우측 편집:

- SOP template
- 자동/수동 모드
- 단계별 SLA
- escalation policy

### 4.18 예지보전 리포트 요약

ID: `predictive-report`

목적:
- 진단 결과와 권장 조치, 다음 점검일을 운영자가 바로 확인하게 한다.

표시:
- report summary
- root cause
- recommended action
- next inspection
- export button state

데이터 필드:

```txt
reportId
assetId
rootCause
recommendation
nextInspection
riskScore
```

우측 편집:

- report period
- include sections
- risk threshold
- export format

### 4.19 현장 실증 진행률

ID: `field-validation-progress`

목적:
- 태안 발전본부 실증, 사용자 의견 수렴, 제품 수정·보완 현황을 보여준다.

표시:
- phase progress
- validation site
- feedback count
- unresolved issue

데이터 필드:

```txt
phase
site
progress
feedbackCount
openIssueCount
completedAction
```

우측 편집:

- phase labels
- site name
- progress source
- issue severity

### 4.20 복합 계측기 배치 현황

ID: `fleet-device-inventory`

목적:
- 휴대형/고정형 계측기의 배치, 상태, 센서 구성, 최근 진단 시간을 관리한다.

표시:
- device table
- fixed/mobile split
- online/offline
- last diagnosis
- sensor package

데이터 필드:

```txt
deviceId
deviceType
assetId
zone
status
sensorPackage
lastDiagnosisAt
```

우측 편집:

- device type filter
- columns
- status color
- sort field

## 5. 좌측 위젯 탭 배치안

2열 10행 순서:

```txt
1행: 초음파 아크 위험도      | 진동 FFT 스펙트럼
2행: 과열 ΔT 히트맵          | 열화 가스 분해 패널
3행: 복합 센서 헬스 매트릭스 | 고장 진행 단계
4행: Autoencoder 이상 점수   | LSTM 잔여수명 예측
5행: CNN-LSTM 진단           | F1/F2 모델 운용 모드
6행: 작업자 SpO2 안전        | 쓰러짐 감지 플로우
7행: 작업자 컨텍스트 융합    | 유해 환경 구역 맵
8행: 통신 게이트웨이 상태    | 계측기 전원/배터리
9행: SOP 자동 실행           | 예지보전 리포트 요약
10행: 현장 실증 진행률       | 복합 계측기 배치 현황
```

## 6. 기본 대시보드 추천 배치

초기 AIM Monitoring editor 진입 시 추천 layout:

```txt
row 1:
  multi-sensor-health      0,0,6,4
  autoencoder-anomaly      6,0,3,4
  worker-spo2-status       9,0,3,4

row 2:
  vibration-fft-spectrum   0,4,6,5
  thermal-delta-map        6,4,6,5

row 3:
  gas-decomposition-panel  0,9,4,5
  sop-auto-execution       4,9,4,5
  gateway-communication    8,9,4,5
```

사용자가 위젯 탭에서 추가하면 빈 grid에 자동 배치한다.

## 7. 구현 우선순위

1차 구현:

- 복합 센서 헬스 매트릭스
- 진동 FFT 스펙트럼
- 초음파 아크 위험도
- 과열 ΔT 히트맵
- 열화 가스 분해 패널
- 작업자 SpO2 안전
- SOP 자동 실행

2차 구현:

- Autoencoder 이상 점수
- LSTM 잔여수명 예측
- CNN-LSTM 스펙트로그램 진단
- 쓰러짐 감지 플로우
- 통신 게이트웨이 상태
- 예지보전 리포트 요약

3차 구현:

- F1/F2 모델 운용 모드
- 복합 계측기 배치 현황
- 고장 진행 단계
- 작업자 컨텍스트 융합
- 유해 환경 구역 맵
- 계측기 전원/배터리
- 현장 실증 진행률

## 8. 구현 전 결정 필요 사항

- 실제 차트 라이브러리는 본 앱의 `recharts@2` 기준으로 맞춘다.
- 12그리드 엔진은 직접 구현할지, `@dnd-kit` 기반 grid snap으로 만들지 결정해야 한다.
- resize handle은 직접 구현할 가능성이 높다.
- AI Studio 중앙 대시보드의 기존 카드와 새 20개 위젯의 관계를 정의해야 한다.
  - 기존 카드는 기본 화면으로 유지
  - 새 위젯은 편집 레이어에서 추가 가능
  - 나중에 기존 카드도 widget entity로 승격 가능
- mock data는 사업계획서 기반으로 별도 `monitoringMockData.ts`에 둔다.
- 모든 widget definition은 schema화해서 좌측 탭, 중앙 렌더러, 우측 inspector가 같은 정의를 참조하게 한다.

## 9. 결론

20개 위젯은 AIM GUARD의 CCTV/보안 중심 위젯이 아니라, 사업계획서의 복합 계측/예지보전/작업자 안전/AI 진단/실증 운영 축에서 추출한다.

이 위젯들이 AIM Monitoring의 핵심 차별점이다.
따라서 구현 단계에서도 단순 카드 나열이 아니라, 12그리드 배치와 우측 inspector까지 포함한 하나의 편집 가능한 제품 기능으로 만든다.
