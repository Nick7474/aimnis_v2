// src/mock/data.ts — 목업용 정적 데이터

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';
export type DeviceType = 'PERIMETER' | 'IO_MODULE' | 'ACCESS_CONTROL';
export type ZoneType = 'LINE' | 'AREA' | 'POINT';
export type MapType = 'IMAGE' | 'NAVER';

export interface Alarm {
  eventId: string;
  zoneId: string;
  zoneName: string;
  deviceName: string;
  severity: SeverityLevel;
  alarmColor: string;
  occurredAt: string;
  ackStatus: 'UNACKED' | 'ACKED';
  /* Senstar 전용 — 채널/사이드 정보 */
  channelNo?: number;
  side?: 'A' | 'B';
  meter?: number;
  /* ADAM 전용 */
  diChannel?: number;
  eventType?: string;
}

/** 초기 미처리 알람 없음 — 장비 관리 등에서 「테스트 알람 발생」으로만 주입 */
export const MOCK_ALARMS: Alarm[] = [];

export const MOCK_EVENTS = [
  { id: 'evt-001', occurredAt: '2026-03-20 09:30:05', zoneName: '정문 구간',
    deviceName: 'Senstar-1', deviceType: 'PERIMETER', severity: 'HIGH' as SeverityLevel,
    eventType: 'INTRUSION', ackStatus: 'UNACKED', meter: 450, side: 'A' },
  { id: 'evt-002', occurredAt: '2026-03-20 09:28:10', zoneName: '출입문-A',
    deviceName: 'ADAM-1', deviceType: 'IO_MODULE', severity: 'MEDIUM' as SeverityLevel,
    eventType: 'DI_INPUT', ackStatus: 'UNACKED', meter: null, side: null },
  { id: 'evt-003', occurredAt: '2026-03-20 09:25:00', zoneName: '주차장 구역',
    deviceName: 'Senstar-1', deviceType: 'PERIMETER', severity: 'LOW' as SeverityLevel,
    eventType: 'INTRUSION', ackStatus: 'ACKED', meter: 120, side: 'B' },
  { id: 'evt-004', occurredAt: '2026-03-20 09:15:22', zoneName: '2층 복도',
    deviceName: '출입-A', deviceType: 'ACCESS_CONTROL', severity: 'MEDIUM' as SeverityLevel,
    eventType: 'ACCESS_DENIED', ackStatus: 'ACKED', meter: null, side: null },
  { id: 'evt-005', occurredAt: '2026-03-20 09:10:00', zoneName: '외곽 동편',
    deviceName: 'Senstar-2', deviceType: 'PERIMETER', severity: 'CRITICAL' as SeverityLevel,
    eventType: 'INTRUSION', ackStatus: 'ACKED', meter: 800, side: 'A' },
  /* 출입통제 이벤트 */
  { id: 'acc-001', occurredAt: '2026-03-20 09:30:12', zoneName: '정문 출입구',
    deviceName: 'ACR-1F-01', deviceType: 'ACCESS_CONTROL', severity: 'HIGH' as SeverityLevel,
    eventType: 'FORCED_OPEN', ackStatus: 'UNACKED', meter: null, side: null },
  { id: 'acc-002', occurredAt: '2026-03-20 09:29:55', zoneName: '본관연결통로 출입문',
    deviceName: 'ACR-2F-01', deviceType: 'ACCESS_CONTROL', severity: 'HIGH' as SeverityLevel,
    eventType: 'ACCESS_DENIED', ackStatus: 'UNACKED', meter: null, side: null },
  { id: 'acc-003', occurredAt: '2026-03-20 09:28:00', zoneName: '의회상황실 입구',
    deviceName: 'ACR-3F-02', deviceType: 'ACCESS_CONTROL', severity: 'MEDIUM' as SeverityLevel,
    eventType: 'ACCESS_DENIED', ackStatus: 'UNACKED', meter: null, side: null },
  { id: 'acc-004', occurredAt: '2026-03-20 09:15:44', zoneName: '비상구 A',
    deviceName: 'ACR-1F-04', deviceType: 'ACCESS_CONTROL', severity: 'MEDIUM' as SeverityLevel,
    eventType: 'DOOR_HELD_OPEN', ackStatus: 'UNACKED', meter: null, side: null },
  { id: 'acc-005', occurredAt: '2026-03-20 09:10:05', zoneName: '프레스센터 입구',
    deviceName: 'ACR-3F-05', deviceType: 'ACCESS_CONTROL', severity: 'LOW' as SeverityLevel,
    eventType: 'DOOR_HELD_OPEN', ackStatus: 'ACKED', meter: null, side: null },
  { id: 'acc-006', occurredAt: '2026-03-20 08:55:30', zoneName: '후문 출입구',
    deviceName: 'ACR-1F-02', deviceType: 'ACCESS_CONTROL', severity: 'LOW' as SeverityLevel,
    eventType: 'ACCESS_GRANTED', ackStatus: 'ACKED', meter: null, side: null },
];

export const MOCK_MAPS = [
  { id: 'floor1', mapName: '1층 평면도 (의사당)', mapType: 'IMAGE' as MapType,
    imageUrl: '/maps/floor1.png', imageWidth: 1200, imageHeight: 800, zoneCount: 7, isDefault: true },
  { id: 'floor2', mapName: '2층 평면도 (의사당)', mapType: 'IMAGE' as MapType,
    imageUrl: '/maps/floor2.png', imageWidth: 1200, imageHeight: 800, zoneCount: 7, isDefault: false },
  { id: 'floor3', mapName: '3층 평면도 (의사당)', mapType: 'IMAGE' as MapType,
    imageUrl: '/maps/floor3.png', imageWidth: 1200, imageHeight: 800, zoneCount: 11, isDefault: false },
  { id: 'map-ext', mapName: '외부 경계 펜스', mapType: 'NAVER' as MapType,
    imageUrl: '', imageWidth: 0, imageHeight: 0, zoneCount: 4, isDefault: false },
];

export const MOCK_ZONES = [
  { id: 'z-001', mapId: 'floor1', zoneName: '출입구', zoneType: 'POINT' as ZoneType,
    severity: 'HIGH' as SeverityLevel, alarmColor: '#fa8c16', active: true },
  { id: 'z-002', mapId: 'floor1', zoneName: '민원여권과', zoneType: 'AREA' as ZoneType,
    severity: 'MEDIUM' as SeverityLevel, alarmColor: '#fadb14', active: true },
  { id: 'z-003', mapId: 'floor1', zoneName: '후문', zoneType: 'POINT' as ZoneType,
    severity: 'HIGH' as SeverityLevel, alarmColor: '#fa8c16', active: true },
  { id: 'z-004', mapId: 'floor2', zoneName: '건축허가과', zoneType: 'AREA' as ZoneType,
    severity: 'MEDIUM' as SeverityLevel, alarmColor: '#fadb14', active: true },
  { id: 'z-005', mapId: 'floor2', zoneName: '공시지가상황실', zoneType: 'AREA' as ZoneType,
    severity: 'HIGH' as SeverityLevel, alarmColor: '#fa8c16', active: true },
  { id: 'z-006', mapId: 'floor3', zoneName: '의회상황실', zoneType: 'AREA' as ZoneType,
    severity: 'HIGH' as SeverityLevel, alarmColor: '#fa8c16', active: true },
  { id: 'z-007', mapId: 'floor3', zoneName: '통신실', zoneType: 'POINT' as ZoneType,
    severity: 'CRITICAL' as SeverityLevel, alarmColor: '#ff4d4f', active: true },
];

export const MOCK_DEVICES = [
  { id: 'dev-001', deviceName: 'Senstar-1', deviceType: 'PERIMETER', ip: '192.168.1.10',
    port: 5000, status: 'CONNECTED', pluginType: 'SenstarFlexZone' },
  { id: 'dev-002', deviceName: 'ADAM-1', deviceType: 'IO_MODULE', ip: '192.168.1.20',
    port: 502, status: 'CONNECTED', pluginType: 'AdamModbus' },
  { id: 'dev-003', deviceName: '출입-A', deviceType: 'ACCESS_CONTROL', ip: '192.168.1.30',
    port: 8080, status: 'DISCONNECTED', pluginType: 'AccessControl' },
  { id: 'dev-004', deviceName: 'Senstar-2', deviceType: 'PERIMETER', ip: '192.168.1.11',
    port: 5000, status: 'CONNECTED', pluginType: 'SenstarFlexZone' },
];

export const MOCK_CAMERAS = [
  { id: 'cam-001', channelId: 'CAM-A-01', cameraName: '정문 우측 CCTV',
    rtspUrl: 'rtsp://192.168.1.201/stream', supportsPtz: true, vmsName: 'Main VMS' },
  { id: 'cam-002', channelId: 'CAM-A-02', cameraName: '정문 좌측 CCTV',
    rtspUrl: 'rtsp://192.168.1.202/stream', supportsPtz: false, vmsName: 'Main VMS' },
  { id: 'cam-003', channelId: 'CAM-B-01', cameraName: '주차장 입구',
    rtspUrl: 'rtsp://192.168.1.203/stream', supportsPtz: true, vmsName: 'Main VMS' },
  { id: 'cam-004', channelId: 'CAM-B-02', cameraName: '1층 복도',
    rtspUrl: 'rtsp://192.168.1.204/stream', supportsPtz: false, vmsName: 'Main VMS' },
];

export const MOCK_USERS = [
  { id: 'u-001', name: '관리자', username: 'admin', email: 'admin@company.com',
    role: 'ADMIN' as UserRole, active: true },
  { id: 'u-002', name: '김운영', username: 'operator1', email: 'kim@company.com',
    role: 'OPERATOR' as UserRole, active: true },
  { id: 'u-003', name: '이운영', username: 'operator2', email: 'lee@company.com',
    role: 'OPERATOR' as UserRole, active: true },
  { id: 'u-004', name: '박조회', username: 'viewer1', email: 'park@company.com',
    role: 'VIEWER' as UserRole, active: false },
];

export const MOCK_STATS = {
  totalEvents: 1240,
  critical: 15,
  unacked: 42,
  ackRate: 96.6,
  byDeviceType: [
    { name: 'PERIMETER', value: 800 },
    { name: 'IO_MODULE', value: 320 },
    { name: 'ACCESS', value: 120 },
  ],
  topZones: [
    { name: '정문 구간', count: 320 },
    { name: '외곽 동편', count: 240 },
    { name: '주차장', count: 180 },
    { name: '후문 구간', count: 160 },
    { name: '출입문-A', count: 100 },
  ],
};

export const MOCK_PRESETS = [
  { presetToken: 'p1', presetName: '정문 전면', pan: 0.0, tilt: 0.0, zoom: 0.3 },
  { presetToken: 'p2', presetName: '좌측 입구', pan: -0.6, tilt: -0.1, zoom: 0.5 },
  { presetToken: 'p3', presetName: '주차장', pan: 0.8, tilt: -0.3, zoom: 0.2 },
];

/* ────────────────────────────────────────────
   이벤트 규칙 (Event Rule) 타입 및 Mock 데이터
──────────────────────────────────────────── */
export type RelayMode = 'LATCH' | 'PULSE';

export type EventAction =
  | { type: 'SHOW_CCTV_POPUP'; cameraId: string; presetToken?: string }
  | { type: 'PTZ_PRESET';      cameraId: string; presetToken: string }
  | { type: 'RELAY_CONTROL';   deviceId: string; doChannel: number; mode: RelayMode; pulseSec?: number }
  | { type: 'SWITCH_MAP';      mapId: string };

export interface EventTrigger {
  sensorIds:  string[];
  zoneIds:    string[];
  eventTypes: string[];
  severities: SeverityLevel[];
}

export interface EventRule {
  id:      string;
  name:    string;
  enabled: boolean;
  trigger: EventTrigger;
  actions: EventAction[];
}

export const EVENT_TYPES = [
  { value: 'INTRUSION',      label: '침입 감지' },
  { value: 'DI_INPUT',       label: 'DI 접점 입력' },
  { value: 'ACCESS_DENIED',  label: '출입 거부' },
  { value: 'FORCED_OPEN',    label: '강제 개방' },
  { value: 'DOOR_HELD_OPEN', label: '장시간 열림' },
  { value: 'ACCESS_GRANTED', label: '출입 허가' },
];

export const MOCK_EVENT_RULES: EventRule[] = [
  {
    id: 'rule-001',
    name: '정문 침입 감지',
    enabled: true,
    trigger: {
      sensorIds: [],
      zoneIds: ['z-001'],
      eventTypes: ['INTRUSION'],
      severities: ['HIGH', 'CRITICAL'],
    },
    actions: [
      { type: 'SHOW_CCTV_POPUP', cameraId: 'cam-001', presetToken: 'p1' },
      { type: 'PTZ_PRESET',      cameraId: 'cam-001', presetToken: 'p1' },
      { type: 'RELAY_CONTROL',   deviceId: 'dev-002', doChannel: 1, mode: 'PULSE', pulseSec: 5 },
      { type: 'SWITCH_MAP',      mapId: 'floor1' },
    ],
  },
  {
    id: 'rule-002',
    name: '출입 거부 알람',
    enabled: true,
    trigger: {
      sensorIds: [],
      zoneIds: ['z-003'],
      eventTypes: ['ACCESS_DENIED', 'FORCED_OPEN'],
      severities: ['MEDIUM', 'HIGH', 'CRITICAL'],
    },
    actions: [
      { type: 'SHOW_CCTV_POPUP', cameraId: 'cam-002' },
      { type: 'SWITCH_MAP',      mapId: 'floor1' },
    ],
  },
  {
    id: 'rule-003',
    name: '주차장 침입',
    enabled: false,
    trigger: {
      sensorIds: [],
      zoneIds: ['z-005'],
      eventTypes: ['INTRUSION'],
      severities: ['MEDIUM', 'HIGH', 'CRITICAL'],
    },
    actions: [
      { type: 'SHOW_CCTV_POPUP', cameraId: 'cam-003', presetToken: 'p3' },
      { type: 'SWITCH_MAP',      mapId: 'floor2' },
    ],
  },
];
