import { create } from 'zustand';
import {
  Alarm, MOCK_ALARMS, MOCK_CAMERAS, MOCK_DEVICES, MOCK_EVENT_RULES,
  type EventRule, type EventAction,
} from '../mock/data';
import type { SeverityLevel } from '../mock/data';

/* ══════════════════════════════════════════════
   Device / Sensor 공유 타입
══════════════════════════════════════════════ */
export type MapPlacement = 'LINE' | 'ZONE' | 'POINT' | 'NONE';
export type ChannelType  = 'DI' | 'DO';
export type RelayMode    = 'LATCH' | 'PULSE';

export interface Sensor {
  id: string;
  deviceId: string;
  channel: number;
  label: string;
  description: string;
  channelType: ChannelType;
  mapPlacement: MapPlacement;
  mapPlaced: boolean;
  active: boolean;
  startMeter?: number;
  endMeter?: number;
  side?: 'A' | 'B';
  /* DO 전용 */
  relayState?: 'ON' | 'OFF';
  relayMode?: RelayMode;
  pulseDurationSec?: number;
}

export interface Device {
  id: string;
  deviceName: string;
  deviceType: string;
  ip: string;
  port: number;
  status: string;
  pluginType: string;
  channelCount?: number;
  cableLength?: number;
  sensors: Sensor[];
}

function makeDefaultSensors(device: Omit<Device, 'sensors'>): Sensor[] {
  const sensors: Sensor[] = [];

  if (device.pluginType === 'AdamModbus') {
    const count = device.channelCount ?? 8;
    /* DI 채널 */
    for (let i = 1; i <= count; i++) {
      sensors.push({
        id: `${device.id}-di${i}`, deviceId: device.id,
        channel: i, label: `DI-${i}`, description: `접점 입력 ${i}번`,
        channelType: 'DI',
        mapPlacement: 'POINT', mapPlaced: false, active: true,
      });
    }
    /* DO 채널 (릴레이 출력 4개) */
    for (let i = 1; i <= 4; i++) {
      sensors.push({
        id: `${device.id}-do${i}`, deviceId: device.id,
        channel: i, label: `DO-${i}`, description: `릴레이 출력 ${i}번`,
        channelType: 'DO',
        mapPlacement: 'NONE', mapPlaced: false, active: true,
        relayState: 'OFF', relayMode: 'LATCH', pulseDurationSec: 5,
      });
    }
  } else if (device.pluginType === 'SenstarFlexZone') {
    const cable = device.cableLength ?? 1000;
    const zoneCount = 3;                          // 채널 수
    const step = Math.floor(cable / zoneCount);
    for (let i = 1; i <= zoneCount; i++) {
      /* 채널별 A측 */
      sensors.push({
        id: `${device.id}-ch${i}A`, deviceId: device.id,
        channel: i, label: `CH${i}-A`, description: `${i}번 채널 A측`,
        channelType: 'DI',
        mapPlacement: 'LINE', mapPlaced: false, active: true,
        startMeter: (i - 1) * step, endMeter: i * step,
        side: 'A',
      });
      /* 채널별 B측 */
      sensors.push({
        id: `${device.id}-ch${i}B`, deviceId: device.id,
        channel: i, label: `CH${i}-B`, description: `${i}번 채널 B측`,
        channelType: 'DI',
        mapPlacement: 'LINE', mapPlaced: false, active: true,
        startMeter: (i - 1) * step, endMeter: i * step,
        side: 'B',
      });
    }
  } else if (device.pluginType === 'AccessControl') {
    sensors.push({
      id: `${device.id}-s1`, deviceId: device.id,
      channel: 1, label: '출입문 센서', description: '출입문 접점',
      channelType: 'DI',
      mapPlacement: 'POINT', mapPlaced: false, active: true,
    });
  }
  return sensors;
}

const INIT_DEVICES: Device[] = MOCK_DEVICES.map((d) => {
  const base = {
    ...d,
    channelCount: d.pluginType === 'AdamModbus' ? 8 : d.pluginType === 'AccessControl' ? 1 : undefined,
    cableLength:  d.pluginType === 'SenstarFlexZone' ? 1000 : undefined,
    sensors: [] as Sensor[],
  };
  base.sensors = makeDefaultSensors(base);
  return base;
});

interface DeviceStore {
  devices: Device[];
  setDevices:       (devices: Device[]) => void;
  updateDevice:     (device: Device) => void;
  addDevice:        (device: Device) => void;
  deleteDevice:     (id: string) => void;
  updateSensor:     (deviceId: string, sensor: Sensor) => void;
  markSensorPlaced: (sensorId: string, placed: boolean) => void;
  setRelayState:    (deviceId: string, doChannel: number, state: 'ON' | 'OFF') => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  devices: INIT_DEVICES,
  setDevices: (devices) => set({ devices }),
  updateDevice: (device) => set((s) => ({
    devices: s.devices.map((d) => d.id === device.id ? device : d),
  })),
  addDevice: (device) => set((s) => ({ devices: [...s.devices, device] })),
  deleteDevice: (id) => set((s) => ({ devices: s.devices.filter((d) => d.id !== id) })),
  updateSensor: (deviceId, sensor) => set((s) => ({
    devices: s.devices.map((d) => d.id === deviceId
      ? { ...d, sensors: d.sensors.map((s) => s.id === sensor.id ? sensor : s) }
      : d),
  })),
  markSensorPlaced: (sensorId, placed) => set((s) => ({
    devices: s.devices.map((d) => ({
      ...d,
      sensors: d.sensors.map((sen) => sen.id === sensorId ? { ...sen, mapPlaced: placed } : sen),
    })),
  })),
  setRelayState: (deviceId, doChannel, state) => set((s) => ({
    devices: s.devices.map((d) => d.id === deviceId ? {
      ...d,
      sensors: d.sensors.map((sen) =>
        sen.channelType === 'DO' && sen.channel === doChannel
          ? { ...sen, relayState: state }
          : sen
      ),
    } : d),
  })),
}));

/* ══════════════════════════════════════════════
   이벤트 규칙 스토어
══════════════════════════════════════════════ */
interface EventRuleStore {
  rules: EventRule[];
  addRule:    (rule: EventRule) => void;
  updateRule: (rule: EventRule) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
}

export const useEventRuleStore = create<EventRuleStore>((set) => ({
  rules: MOCK_EVENT_RULES,
  addRule:    (rule) => set((s) => ({ rules: [...s.rules, rule] })),
  updateRule: (rule) => set((s) => ({ rules: s.rules.map((r) => r.id === rule.id ? rule : r) })),
  deleteRule: (id)   => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
  toggleRule: (id)   => set((s) => ({
    rules: s.rules.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r),
  })),
}));

/* ══════════════════════════════════════════════
   알람 스토어
══════════════════════════════════════════════ */
interface AlarmStore {
  alarms: Alarm[];
  addAlarm: (a: Alarm) => void;
  ackAlarm: (eventId: string) => void;
}

export const useAlarmStore = create<AlarmStore>((set) => ({
  alarms: MOCK_ALARMS,
  addAlarm: (a) => set((s) => ({ alarms: [a, ...s.alarms] })),
  ackAlarm: (id) => set((s) => ({ alarms: s.alarms.filter((a) => a.eventId !== id) })),
}));

/* ══════════════════════════════════════════════
   인증 스토어
══════════════════════════════════════════════ */
interface AuthStore {
  user: { id: string; name: string; role: 'ADMIN' | 'OPERATOR' | 'VIEWER' } | null;
  login:  (user: AuthStore['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  login:  (user) => set({ user }),
  logout: () => set({ user: null }),
}));

/* ══════════════════════════════════════════════
   VMS / CCTV 팝업 스토어
══════════════════════════════════════════════ */
export interface CctvPopup {
  id:           string;
  eventId:      string;
  cameraId:     string;
  cameraName:   string;
  channelId:    string;
  severity:     string;
  supportsPtz:  boolean;
  activePreset?: string;
}

interface VmsStore {
  popups: CctvPopup[];
  openPopup:       (p: Omit<CctvPopup, 'id'>) => void;
  closePopup:      (id: string) => void;
  setActivePreset: (id: string, presetToken: string) => void;
}

export const useVmsStore = create<VmsStore>((set) => ({
  popups: [],
  openPopup: (p) => set((s) => {
    if (s.popups.length >= 4) return s;
    if (s.popups.some((x) => x.eventId === p.eventId)) return s;
    const id = `popup-${Date.now()}`;
    return { popups: [...s.popups, { ...p, id }] };
  }),
  closePopup:      (id) => set((s) => ({ popups: s.popups.filter((p) => p.id !== id) })),
  setActivePreset: (id, presetToken) => set((s) => ({
    popups: s.popups.map((p) => p.id === id ? { ...p, activePreset: presetToken } : p),
  })),
}));

/* ══════════════════════════════════════════════
   맵 선택 스토어
══════════════════════════════════════════════ */
interface MapStore {
  selectedMapId: string;
  selectMap: (id: string) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedMapId: 'floor1',
  selectMap: (id) => set({ selectedMapId: id }),
}));

/* ══════════════════════════════════════════════
   맵 배치 공유 스토어 (Zone 편집 ↔ 모니터링)
══════════════════════════════════════════════ */
export interface ZonePlacedItem {
  id: string;
  kind: 'CAMERA' | 'DEVICE' | 'DOOR' | 'SENSOR';
  label: string;
  color: string;
  points: { x: number; y: number }[];
  iconType?: string;
  sensorId?: string;
  placementType?: string;
  direction?: number;
  fovAngle?: number;
  fovRange?: number;
  cameraId?: string;
  doorDeviceId?: string;
  deviceId?: string;
  devicePluginType?: string;
  size?: number;
  lineWidth?: number;
  labelVisible?: boolean;
}

interface MapPlacementStore {
  savedItems: Record<string, ZonePlacedItem[]>;
  saveMapItems: (mapId: string, items: ZonePlacedItem[]) => void;
  getMapItems: (mapId: string) => ZonePlacedItem[];
}

export const useMapPlacementStore = create<MapPlacementStore>((set, get) => ({
  savedItems: {},
  saveMapItems: (mapId, items) =>
    set((s) => ({ savedItems: { ...s.savedItems, [mapId]: items } })),
  getMapItems: (mapId) => get().savedItems[mapId] ?? [],
}));

/* ══════════════════════════════════════════════
   이벤트 엔진 — 알람 발생 시 규칙 매칭 & 액션 실행
══════════════════════════════════════════════ */
export function processAlarmEvent(alarm: Alarm): void {
  const rules   = useEventRuleStore.getState().rules;
  const vms     = useVmsStore.getState();
  const mapSt   = useMapStore.getState();
  const devSt   = useDeviceStore.getState();

  const matched = rules.filter((rule) => {
    if (!rule.enabled) return false;
    const { trigger } = rule;
    if (trigger.severities.length > 0 && !trigger.severities.includes(alarm.severity)) return false;
    if (trigger.zoneIds.length > 0 && !trigger.zoneIds.includes(alarm.zoneId)) return false;
    return true;
  });

  matched.forEach((rule) => {
    rule.actions.forEach((action: EventAction) => {
      if (action.type === 'SWITCH_MAP') {
        mapSt.selectMap(action.mapId);
      }

      if (action.type === 'SHOW_CCTV_POPUP') {
        const camera = MOCK_CAMERAS.find((c) => c.id === action.cameraId);
        if (camera) {
          vms.openPopup({
            eventId:     alarm.eventId,
            cameraId:    camera.id,
            cameraName:  camera.cameraName,
            channelId:   camera.channelId,
            severity:    alarm.severity,
            supportsPtz: camera.supportsPtz,
            activePreset: action.presetToken,
          });
        }
      }

      if (action.type === 'RELAY_CONTROL') {
        devSt.setRelayState(action.deviceId, action.doChannel, 'ON');
        if (action.mode === 'PULSE') {
          const sec = action.pulseSec ?? 5;
          setTimeout(() => {
            useDeviceStore.getState().setRelayState(action.deviceId, action.doChannel, 'OFF');
          }, sec * 1000);
        }
      }
    });
  });
}
