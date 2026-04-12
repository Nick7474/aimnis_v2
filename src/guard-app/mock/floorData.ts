// src/mock/floorData.ts — 층별 평면도 Zone/마커 배치 데이터
import type { SeverityLevel } from './data';

export interface FloorZone {
  id: string;
  label: string;
  type: 'LINE' | 'AREA' | 'POINT';
  severity: SeverityLevel;
  alarm: boolean;
  top: string; left: string; width?: string; height?: string;
}

/** Senstar 등 침입감지 센서 라인 */
export interface SensorLine {
  id: string;
  label: string;
  /** 맵 이미지 기준 % 좌표 배열 (최소 2점) */
  points: Array<{ x: number; y: number }>;
  alarm: boolean;
  severity: SeverityLevel;
}

export interface CctvMarker {
  id: string;
  label: string;
  top: string;
  left: string;
  channelId: string;
  supportsPtz: boolean;
  rtspUrl: string;
  location: string;
  /** 카메라가 바라보는 방향 (도, 0=오른쪽, 90=아래, 180=왼쪽, 270=위) */
  angle: number;
  /** 시야각 (도, FOV 콘 너비) */
  fov: number;
}

export interface DeviceMarker {
  id: string; label: string; type: string;
  top: string; left: string;
  status: 'CONNECTED' | 'DISCONNECTED';
}

export type DoorStatus = 'LOCKED' | 'UNLOCKED' | 'FORCED_OPEN' | 'HELD_OPEN' | 'ALARM';
export type AuthMethod = 'CARD' | 'PIN' | 'FACE' | 'CARD+PIN';

export interface AccessDoor {
  id: string;
  label: string;
  top: string;
  left: string;
  status: DoorStatus;
  authMethod: AuthMethod;
  direction: 'H' | 'V'; // 문 방향 (가로/세로)
  /** 최근 접근 로그 */
  recentLogs: Array<{
    time: string;
    userName: string;
    result: 'GRANTED' | 'DENIED';
    method: string;
  }>;
}

export interface FloorData {
  id: string;
  label: string;
  image: string;
  zones: FloorZone[];
  lines: SensorLine[];
  cctv: CctvMarker[];
  devices: DeviceMarker[];
  doors: AccessDoor[];
}

export const FLOOR_DATA: FloorData[] = [
  /* ══════════════ 포스코 ══════════════ */
  {
    id: 'floor1',
    label: '포스코',
    image: '/maps/map2.jpg',
    lines: [
      {
        id: 'l1-1', label: '정문 외벽 라인 (Senstar A)',
        alarm: false, severity: 'HIGH',
        points: [{ x: 69, y: 10 }, { x: 88, y: 10 }, { x: 91, y: 25 }, { x: 91, y: 55 }, { x: 88, y: 72 }],
      },
      {
        id: 'l1-2', label: '후문 외벽 라인 (Senstar B)',
        alarm: false, severity: 'MEDIUM',
        points: [{ x: 2, y: 20 }, { x: 2, y: 45 }, { x: 2, y: 68 }, { x: 8, y: 72 }, { x: 20, y: 72 }],
      },
      {
        id: 'l1-3', label: '화장실 복도 라인',
        alarm: false, severity: 'LOW',
        points: [{ x: 20, y: 72 }, { x: 45, y: 72 }, { x: 65, y: 72 }, { x: 88, y: 72 }],
      },
    ],
    zones: [
      { id: 'f1-z1', label: '출입구',    type: 'POINT', severity: 'HIGH',   alarm: true,
        top: '28%', left: '79%', width: '3%',  height: '5%' },
      { id: 'f1-z2', label: '민원여권과', type: 'AREA',  severity: 'MEDIUM', alarm: false,
        top: '18%', left: '22%', width: '46%', height: '52%' },
      { id: 'f1-z3', label: '후문',       type: 'POINT', severity: 'HIGH',   alarm: false,
        top: '48%', left: '2%',  width: '4%',  height: '6%' },
      { id: 'f1-z4', label: '남자화장실', type: 'AREA',  severity: 'LOW',    alarm: false,
        top: '74%', left: '15%', width: '10%', height: '12%' },
      { id: 'f1-z5', label: '여자화장실', type: 'AREA',  severity: 'LOW',    alarm: false,
        top: '74%', left: '26%', width: '10%', height: '12%' },
      { id: 'f1-z6', label: '계단(1)',    type: 'POINT', severity: 'MEDIUM', alarm: false,
        top: '4%',  left: '55%', width: '5%',  height: '8%' },
      { id: 'f1-z7', label: '계단(7)',    type: 'POINT', severity: 'MEDIUM', alarm: false,
        top: '38%', left: '2%',  width: '5%',  height: '8%' },
    ],
    cctv: [
      { id:'c1-1', channelId:'CAM-1F-01', supportsPtz:true,
        label:'출입구 정문 PTZ',    location:'정문 출입구 상단 (우측)',
        rtspUrl:'rtsp://192.168.1.201/stream1',
        top:'22%', left:'72%', angle:180, fov:70 },
      { id:'c1-2', channelId:'CAM-1F-02', supportsPtz:false,
        label:'민원여권과 내부 중앙', location:'민원여권과 천장 중앙',
        rtspUrl:'rtsp://192.168.1.202/stream1',
        top:'36%', left:'42%', angle:90, fov:90 },
      { id:'c1-3', channelId:'CAM-1F-03', supportsPtz:false,
        label:'후문 복도',           location:'후문 입구 복도',
        rtspUrl:'rtsp://192.168.1.203/stream1',
        top:'42%', left:'6%',  angle:0,  fov:80 },
      { id:'c1-4', channelId:'CAM-1F-04', supportsPtz:true,
        label:'계단(1) 입구 PTZ',    location:'1번 계단 앞 복도',
        rtspUrl:'rtsp://192.168.1.204/stream1',
        top:'8%',  left:'58%', angle:90, fov:70 },
      { id:'c1-5', channelId:'CAM-1F-05', supportsPtz:false,
        label:'계단(7) 입구',        location:'7번 계단 앞 복도',
        rtspUrl:'rtsp://192.168.1.205/stream1',
        top:'34%', left:'7%',  angle:0,  fov:80 },
      { id:'c1-6', channelId:'CAM-1F-06', supportsPtz:false,
        label:'화장실 복도',         location:'1층 화장실 앞 복도',
        rtspUrl:'rtsp://192.168.1.206/stream1',
        top:'68%', left:'22%', angle:270, fov:90 },
    ],
    devices: [
      { id:'d1-1', label:'Senstar-1',  type:'PERIMETER', top:'10%', left:'40%', status:'CONNECTED' },
      { id:'d1-2', label:'Senstar-2',  type:'PERIMETER', top:'72%', left:'50%', status:'CONNECTED' },
      { id:'d1-3', label:'ADAM-1',     type:'IO_MODULE', top:'55%', left:'60%', status:'CONNECTED' },
      { id:'d1-4', label:'출입-A',     type:'ACCESS_CONTROL', top:'31%', left:'77%', status:'DISCONNECTED' },
    ],
    doors: [
      {
        id: 'dr1-1', label: '정문 출입구', top: '30%', left: '73%',
        status: 'FORCED_OPEN', direction: 'V', authMethod: 'CARD+PIN',
        recentLogs: [
          { time: '09:30:12', userName: '미인식',  result: 'DENIED',  method: '카드' },
          { time: '09:28:45', userName: '김철수', result: 'GRANTED', method: '카드' },
          { time: '09:15:02', userName: '이영희', result: 'GRANTED', method: '카드+PIN' },
        ],
      },
      {
        id: 'dr1-2', label: '후문 출입구', top: '52%', left: '3%',
        status: 'LOCKED', direction: 'H', authMethod: 'CARD',
        recentLogs: [
          { time: '08:55:30', userName: '박민수', result: 'GRANTED', method: '카드' },
          { time: '08:30:10', userName: '박민수', result: 'GRANTED', method: '카드' },
          { time: '08:00:05', userName: '경비원',  result: 'GRANTED', method: '카드' },
        ],
      },
      {
        id: 'dr1-3', label: '민원여권과 입구', top: '21%', left: '21%',
        status: 'UNLOCKED', direction: 'H', authMethod: 'CARD',
        recentLogs: [
          { time: '09:25:00', userName: '담당자',  result: 'GRANTED', method: '카드' },
          { time: '09:10:30', userName: '방문객1', result: 'GRANTED', method: '카드' },
          { time: '08:58:00', userName: '방문객2', result: 'DENIED',  method: '카드' },
        ],
      },
      {
        id: 'dr1-4', label: '비상구 A', top: '68%', left: '69%',
        status: 'HELD_OPEN', direction: 'V', authMethod: 'PIN',
        recentLogs: [
          { time: '09:15:44', userName: '홍길동', result: 'GRANTED', method: 'PIN' },
          { time: '08:40:12', userName: '홍길동', result: 'GRANTED', method: 'PIN' },
          { time: '08:00:00', userName: '정비원',  result: 'GRANTED', method: 'PIN' },
        ],
      },
    ],
  },
];
