// AIM Monitoring — 모의 데이터
// FFT 기준: 1800RPM → 1X=30Hz, 2X=60Hz, 3X=90Hz
// 가스 진단: CO+CH4=열적과열, C2H2+H2=아크/방전
// SpO2: <90% → 작업투입불가
// 낙하감지: SVM+Tilt 4단계

// ─── 진동 데이터 ──────────────────────────────────────────

export interface FftPoint {
  freq: number;
  amplitude: number;
}

export interface VibrationData {
  timestamp: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  rms: number;
  peak: number;
  fft: FftPoint[];
}

/** FFT 참조선 (1800RPM 기준) */
export const FFT_REFERENCE_LINES = [
  { freq: 30, label: "1X", color: "#06b6d4" },
  { freq: 60, label: "2X", color: "#f59e0b" },
  { freq: 90, label: "3X", color: "#ef4444" },
];

/** ISO 10816 진동 임계값 (mm/s) */
export const ISO_10816_THRESHOLDS = {
  good: 2.8,
  acceptable: 7.1,
  alert: 11.2,
  danger: 18.0,
};

function generateFft(baseAmplitude: number): FftPoint[] {
  const points: FftPoint[] = [];
  for (let f = 5; f <= 200; f += 2.5) {
    let amp = baseAmplitude * 0.05 * Math.random();
    // 1X, 2X, 3X 피크
    if (Math.abs(f - 30) < 3) amp = baseAmplitude * (0.8 + Math.random() * 0.2);
    if (Math.abs(f - 60) < 3) amp = baseAmplitude * (0.45 + Math.random() * 0.15);
    if (Math.abs(f - 90) < 3) amp = baseAmplitude * (0.25 + Math.random() * 0.1);
    points.push({ freq: parseFloat(f.toFixed(1)), amplitude: parseFloat(amp.toFixed(3)) });
  }
  return points;
}

export function generateVibrationHistory(count = 30): VibrationData[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const rms = 3 + Math.sin(i * 0.4) * 2 + Math.random() * 0.8;
    return {
      timestamp: now - (count - i) * 2000,
      accel_x: parseFloat((Math.sin(i * 0.3) * 0.5 + Math.random() * 0.2).toFixed(3)),
      accel_y: parseFloat((Math.cos(i * 0.3) * 0.4 + Math.random() * 0.2).toFixed(3)),
      accel_z: parseFloat((9.81 + Math.random() * 0.05).toFixed(3)),
      rms: parseFloat(rms.toFixed(2)),
      peak: parseFloat((rms * 2.8 + Math.random() * 0.5).toFixed(2)),
      fft: generateFft(rms),
    };
  });
}

// ─── 가스 데이터 ──────────────────────────────────────────

export interface GasData {
  timestamp: number;
  co: number;    // ppm
  ch4: number;   // ppm
  h2: number;    // ppm
  c2h2: number;  // ppm
}

export type GasDiagnosisCode =
  | "normal"
  | "thermal_overheating"
  | "arc_discharge"
  | "partial_discharge"
  | "unknown";

export interface GasDiagnosis {
  code: GasDiagnosisCode;
  label: string;
  severity: "normal" | "warning" | "critical";
  detail: string;
}

/** 가스 진단 로직 */
export function diagnoseGas(d: GasData): GasDiagnosis {
  const totalCo = d.co + d.ch4;
  const totalArc = d.c2h2 + d.h2;

  if (d.c2h2 > 50 && d.h2 > 100) {
    return {
      code: "arc_discharge",
      label: "아크/방전",
      severity: "critical",
      detail: `C₂H₂=${d.c2h2}ppm + H₂=${d.h2}ppm → 아크방전 의심`,
    };
  }
  if (d.co > 200 && d.ch4 > 50) {
    return {
      code: "thermal_overheating",
      label: "열적 과열",
      severity: "critical",
      detail: `CO=${d.co}ppm + CH₄=${d.ch4}ppm → 열적 과열 진단`,
    };
  }
  if (d.c2h2 > 10 || totalArc > 80) {
    return {
      code: "partial_discharge",
      label: "부분방전",
      severity: "warning",
      detail: `C₂H₂=${d.c2h2}ppm → 부분방전 주의`,
    };
  }
  return {
    code: "normal",
    label: "정상",
    severity: "normal",
    detail: "이상 없음",
  };
}

export function generateGasHistory(count = 30): GasData[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: now - (count - i) * 2000,
    co: parseFloat((15 + Math.random() * 10).toFixed(1)),
    ch4: parseFloat((8 + Math.random() * 5).toFixed(1)),
    h2: parseFloat((12 + Math.random() * 8).toFixed(1)),
    c2h2: parseFloat((2 + Math.random() * 3).toFixed(1)),
  }));
}

// ─── 작업자 안전 데이터 ───────────────────────────────────

export type WorkEligibility = "가능" | "주의" | "투입불가";

export interface WorkerVitalData {
  workerId: string;
  name: string;
  timestamp: number;
  spo2: number;        // %
  heart_rate: number;  // bpm
  skin_temp: number;   // °C
  fall_event: boolean;
  fall_stage: FallStage;
  location: string;
  battery: number;
}

export type FallStage = "normal" | "tilt" | "impact" | "motionless" | "confirmed_fall";

/** SpO2 기반 작업투입 가능 여부 */
export function evaluateWorkEligibility(spo2: number, heart_rate: number): WorkEligibility {
  if (spo2 < 90) return "투입불가";
  if (spo2 < 95 || heart_rate > 120) return "주의";
  return "가능";
}

/** 낙하감지 단계 레이블 (SVM+Tilt 알고리즘) */
export const FALL_STAGE_LABELS: Record<FallStage, { label: string; color: string }> = {
  normal:         { label: "정상", color: "#10b981" },
  tilt:           { label: "기울임 감지", color: "#f59e0b" },
  impact:         { label: "충격 감지", color: "#f97316" },
  motionless:     { label: "무동작", color: "#ef4444" },
  confirmed_fall: { label: "낙상 확인", color: "#dc2626" },
};

export const MOCK_WORKERS: WorkerVitalData[] = [
  {
    workerId: "W001", name: "김철수", timestamp: Date.now(),
    spo2: 97, heart_rate: 72, skin_temp: 36.5,
    fall_event: false, fall_stage: "normal",
    location: "A구역-1F", battery: 82,
  },
  {
    workerId: "W002", name: "이영희", timestamp: Date.now(),
    spo2: 93, heart_rate: 85, skin_temp: 36.8,
    fall_event: false, fall_stage: "tilt",
    location: "B구역-2F", battery: 61,
  },
  {
    workerId: "W003", name: "박민준", timestamp: Date.now(),
    spo2: 88, heart_rate: 110, skin_temp: 37.4,
    fall_event: true, fall_stage: "confirmed_fall",
    location: "C구역-B1", battery: 45,
  },
];

// ─── 통신 상태 ────────────────────────────────────────────

export type CommProtocol = "BLE" | "LTE" | "LoRa" | "RS-485";

export interface CommStatus {
  protocol: CommProtocol;
  rssi: number;
  link_quality: number; // 0-100
  packet_loss: number;  // %
  status: "online" | "degraded" | "offline";
}

export function getRssiLabel(protocol: CommProtocol, rssi: number): string {
  if (protocol === "RS-485") return rssi >= 0 ? "정상" : "오류"; // wired
  if (rssi >= -70) return "강함";
  if (rssi >= -85) return "보통";
  return "약함";
}

export const MOCK_COMM_STATUS: CommStatus[] = [
  { protocol: "BLE",    rssi: -65, link_quality: 88, packet_loss: 0.5,  status: "online" },
  { protocol: "LTE",    rssi: -72, link_quality: 74, packet_loss: 1.2,  status: "online" },
  { protocol: "LoRa",   rssi: -88, link_quality: 62, packet_loss: 3.8,  status: "degraded" },
  { protocol: "RS-485", rssi: 0,   link_quality: 99, packet_loss: 0.0,  status: "online" },
];

// ─── AI 모델 배지 ─────────────────────────────────────────

export type AiModelType = "Autoencoder" | "LSTM" | "CNN-LSTM";

export interface AiModelBadge {
  type: AiModelType;
  target: string;
  accuracy: number;
  color: string;
}

export const AI_MODEL_BADGES: AiModelBadge[] = [
  { type: "Autoencoder", target: "이상 탐지",   accuracy: 96.2, color: "#06b6d4" },
  { type: "LSTM",         target: "고장 예측",   accuracy: 93.8, color: "#8b5cf6" },
  { type: "CNN-LSTM",     target: "FFT 분류",    accuracy: 97.1, color: "#10b981" },
];

// ─── 고장 예측 단계 ───────────────────────────────────────

export interface FaultStage {
  stage: number;
  label: string;
  probability: number;
  days_remaining: number;
  sensors: string[];
  action: string;
}

export const FAULT_STAGES: FaultStage[] = [
  {
    stage: 1, label: "초기 이상",   probability: 25,
    days_remaining: 90,
    sensors: ["vibration", "temperature"],
    action: "월간 정기 점검 유지",
  },
  {
    stage: 2, label: "이상 징후",   probability: 55,
    days_remaining: 30,
    sensors: ["vibration", "ultrasound", "temperature"],
    action: "2주 내 정밀 점검 권고",
  },
  {
    stage: 3, label: "고장 임박",   probability: 80,
    days_remaining: 7,
    sensors: ["vibration", "ultrasound", "gas", "temperature"],
    action: "즉시 점검 및 부품 준비",
  },
  {
    stage: 4, label: "고장",        probability: 97,
    days_remaining: 0,
    sensors: ["vibration", "ultrasound", "gas", "temperature", "worker-safety"],
    action: "설비 즉시 중단 및 긴급 수리",
  },
];

// ─── 장비 목록 ────────────────────────────────────────────

export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  health: number;   // 0-100
  status: "normal" | "warning" | "critical" | "offline";
  lastMaintenance: string;
  faultStage: number; // 0-4
}

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: "EQ001", name: "압축기 #1", type: "Compressor",
    location: "A동 1층", health: 78,
    status: "warning", lastMaintenance: "2026-03-15", faultStage: 2,
  },
  {
    id: "EQ002", name: "펌프 #3", type: "Pump",
    location: "B동 지하", health: 92,
    status: "normal", lastMaintenance: "2026-05-01", faultStage: 0,
  },
  {
    id: "EQ003", name: "모터 #7", type: "Motor",
    location: "C동 2층", health: 45,
    status: "critical", lastMaintenance: "2026-01-20", faultStage: 3,
  },
  {
    id: "EQ004", name: "변압기 T2", type: "Transformer",
    location: "변전실", health: 88,
    status: "normal", lastMaintenance: "2026-04-10", faultStage: 1,
  },
];

// ─── 알람 이벤트 ──────────────────────────────────────────

export type AlarmSeverity = "info" | "warning" | "critical";

export interface AlarmEvent {
  id: string;
  timestamp: number;
  severity: AlarmSeverity;
  equipmentId: string;
  message: string;
  acknowledged: boolean;
}

export const MOCK_ALARMS: AlarmEvent[] = [
  {
    id: "AL001", timestamp: Date.now() - 300000,
    severity: "critical", equipmentId: "EQ003",
    message: "모터 #7 진동 RMS 임계값 초과 (12.4mm/s > 11.2mm/s)",
    acknowledged: false,
  },
  {
    id: "AL002", timestamp: Date.now() - 900000,
    severity: "critical", equipmentId: "EQ001",
    message: "W003 낙상 감지 — C구역 B1 즉시 대응 필요",
    acknowledged: false,
  },
  {
    id: "AL003", timestamp: Date.now() - 1800000,
    severity: "warning", equipmentId: "EQ001",
    message: "압축기 #1 베어링 온도 상승 (72°C)",
    acknowledged: true,
  },
  {
    id: "AL004", timestamp: Date.now() - 3600000,
    severity: "info", equipmentId: "EQ002",
    message: "LoRa 링크 품질 저하 (62%)",
    acknowledged: true,
  },
];
