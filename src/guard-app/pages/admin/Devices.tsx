import React, { useState } from 'react';
import {
  Button, Drawer, Form, Input, InputNumber,
  Modal, Select, Space, Switch, Table, Tag, Tooltip, Badge, message,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined,
  DownOutlined, RightOutlined, NodeIndexOutlined,
  RadiusSettingOutlined, EnvironmentOutlined, LineOutlined,
  PartitionOutlined, WifiOutlined, AlertOutlined, CheckCircleOutlined,
  ThunderboltOutlined, BellOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useDeviceStore, useAlarmStore,
  type Device, type Sensor, type MapPlacement,
} from '../../stores';
import type { Alarm } from '../../mock/data';

/* plugin defaults */
const PLUGIN_DEFAULTS: Record<string, { channelCount?: number; cableLength?: number; mapPlacement: MapPlacement }> = {
  AdamModbus:       { channelCount: 8,    mapPlacement: 'POINT' },
  SenstarFlexZone:  { cableLength: 1000,  mapPlacement: 'LINE'  },
  AccessControl:    { channelCount: 1,    mapPlacement: 'POINT' },
};

const PLACEMENT_LABELS: Record<MapPlacement, { label: string; color: string; icon: React.ReactNode }> = {
  LINE:  { label: '\uc120 (LINE)',  color: '#2563EB', icon: <LineOutlined /> },
  ZONE:  { label: '\uba74 (ZONE)',  color: '#7C3AED', icon: <RadiusSettingOutlined /> },
  POINT: { label: '\uc810 (POINT)', color: '#059669', icon: <EnvironmentOutlined /> },
  NONE:  { label: '\ubbf8\uc124\uc815',  color: '#475569', icon: <NodeIndexOutlined /> },
};

const STATUS_COLOR: Record<string, 'success' | 'error' | 'warning' | 'processing'> = {
  CONNECTED: 'success', DISCONNECTED: 'error', RECONNECTING: 'warning',
};

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#DC2626', HIGH: '#EA580C', MEDIUM: '#CA8A04', LOW: '#2563EB',
};

function makeDefaultSensors(device: Omit<Device, 'sensors'>): Sensor[] {
  const sensors: Sensor[] = [];
  if (device.pluginType === 'AdamModbus') {
    const count = device.channelCount ?? 8;
    for (let i = 1; i <= count; i++) {
      sensors.push({
        id: `${device.id}-di${i}`, deviceId: device.id,
        channel: i, label: `DI-${i}`, description: `\uc811\uc810 \uc785\ub825 ${i}\ubc88`,
        channelType: 'DI',
        mapPlacement: 'POINT', mapPlaced: false, active: true,
      });
    }
    for (let i = 1; i <= 4; i++) {
      sensors.push({
        id: `${device.id}-do${i}`, deviceId: device.id,
        channel: i, label: `DO-${i}`, description: `\ub9b4\ub808\uc774 \ucd9c\ub825 ${i}\ubc88`,
        channelType: 'DO',
        mapPlacement: 'NONE', mapPlaced: false, active: true,
        relayState: 'OFF', relayMode: 'LATCH', pulseDurationSec: 5,
      });
    }
  } else if (device.pluginType === 'SenstarFlexZone') {
    const cable = device.cableLength ?? 1000;
    const zoneCount = 3;
    const step = Math.floor(cable / zoneCount);
    for (let i = 1; i <= zoneCount; i++) {
      sensors.push({
        id: `${device.id}-ch${i}A`, deviceId: device.id,
        channel: i, label: `CH${i}-A`, description: `${i}\ubc88 \ucc44\ub110 A\uce21`,
        channelType: 'DI',
        mapPlacement: 'LINE', mapPlaced: false, active: true,
        startMeter: (i - 1) * step, endMeter: i * step, side: 'A',
      });
      sensors.push({
        id: `${device.id}-ch${i}B`, deviceId: device.id,
        channel: i, label: `CH${i}-B`, description: `${i}\ubc88 \ucc44\ub110 B\uce21`,
        channelType: 'DI',
        mapPlacement: 'LINE', mapPlaced: false, active: true,
        startMeter: (i - 1) * step, endMeter: i * step, side: 'B',
      });
    }
  } else if (device.pluginType === 'AccessControl') {
    sensors.push({
      id: `${device.id}-s1`, deviceId: device.id,
      channel: 1, label: '\ucd9c\uc785\ubb38 \uc13c\uc11c', description: '\ucd9c\uc785\ubb38 \uc811\uc810',
      channelType: 'DI',
      mapPlacement: 'POINT', mapPlaced: false, active: true,
    });
  }
  return sensors;
}

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: '#0C1733', border: '1px solid #1E3A5F', borderRadius: 8, padding: '16px 18px', ...style }}>
    {children}
  </div>
);

interface SenstarDiag {
  aSideFail: boolean; bSideFail: boolean; mismatch: boolean;
  tamper: boolean;    offline: boolean;
}
interface AdamDiag {
  diStates: Record<number, 'SECURE' | 'ALARM' | 'SUPERVISION'>;
  doStates: Record<number, 'ON' | 'OFF'>;
}
function initSenstarDiag(): SenstarDiag {
  return { aSideFail: false, bSideFail: false, mismatch: false, tamper: false, offline: false };
}
function initAdamDiag(device: Device): AdamDiag {
  return {
    diStates: Object.fromEntries(device.sensors.filter((s) => s.channelType === 'DI').map((s) => [s.channel, 'SECURE'])),
    doStates: Object.fromEntries(device.sensors.filter((s) => s.channelType === 'DO').map((s) => [s.channel, s.relayState === 'ON' ? 'ON' : 'OFF'])),
  };
}

const DevicesPage: React.FC = () => {
  const { devices, addDevice, updateDevice, deleteDevice } = useDeviceStore();
  const { alarms, addAlarm, ackAlarm } = useAlarmStore();

  const [devModal, setDevModal]       = useState(false);
  const [editingDev, setEditingDev]   = useState<Device | null>(null);
  const [devForm]                     = Form.useForm();
  const [sensorDrawer, setSensorDrawer]     = useState(false);
  const [drawerDeviceId, setDrawerDeviceId] = useState<string | null>(null);
  const drawerDevice = drawerDeviceId ? (devices.find((d) => d.id === drawerDeviceId) ?? null) : null;
  const [sensorModal, setSensorModal]   = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [sensorForm]                    = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [senstarDiag, setSenstarDiag]   = useState<Record<string, SenstarDiag>>({});
  const [adamDiag,    setAdamDiag]      = useState<Record<string, AdamDiag>>({});
  /** Mock: click cable to set intrusion meter per channel/side; null = no mock hit */
  const [senstarMockMeter, setSenstarMockMeter] = useState<Record<string, number | null>>({});
  /** Senstar test alarm step per device */
  const [senstarTestStep, setSenstarTestStep] = useState<Record<string, number>>({});
  const [adamTestStep, setAdamTestStep] = useState<Record<string, number>>({});

  const senstarCommStoreKey = (deviceId: string, ch: number) => `${deviceId}-ch${ch}-comm`;
  const getSenstarCommDiag = (deviceId: string, ch: number) =>
    senstarDiag[senstarCommStoreKey(deviceId, ch)] ?? initSenstarDiag();
  const patchSenstarComm = (deviceId: string, ch: number, patch: Partial<SenstarDiag>) => {
    const k = senstarCommStoreKey(deviceId, ch);
    setSenstarDiag((p) => ({ ...p, [k]: { ...(p[k] ?? initSenstarDiag()), ...patch } }));
  };

  const getAdamDiag    = (device: Device) => adamDiag[device.id]    ?? initAdamDiag(device);
  const patchAdamDiag  = (id: string, patch: Partial<AdamDiag>) => {
    const dev = devices.find((d) => d.id === id); if (!dev) return;
    setAdamDiag((p) => ({ ...p, [id]: { ...(p[id] ?? initAdamDiag(dev)), ...patch } }));
  };

  const senstarMockKey = (deviceId: string, ch: number, side: 'A' | 'B') => `${deviceId}-ch${ch}-${side}`;

  const saveDev = () => {
    devForm.validateFields().then((vals) => {
      if (editingDev) {
        updateDevice({ ...editingDev, ...vals });
      } else {
        const newDev: Device = {
          id: `dev-${Date.now()}`, status: 'DISCONNECTED', sensors: [],
          channelCount: PLUGIN_DEFAULTS[vals.pluginType]?.channelCount,
          cableLength:  PLUGIN_DEFAULTS[vals.pluginType]?.cableLength,
          ...vals,
        };
        newDev.sensors = makeDefaultSensors(newDev);
        addDevice(newDev);
      }
      setDevModal(false);
    });
  };

  const openSensorDrawer = (device: Device) => { setDrawerDeviceId(device.id); setSensorDrawer(true); };

  const saveSensor = () => {
    if (!drawerDevice) return;
    sensorForm.validateFields().then((vals) => {
      if (editingSensor) {
        updateDevice({ ...drawerDevice, sensors: drawerDevice.sensors.map((s) => s.id === editingSensor.id ? { ...s, ...vals } : s) });
      } else {
        const newSensor: Sensor = {
          id: `${drawerDevice.id}-s${Date.now()}`, deviceId: drawerDevice.id,
          channel: drawerDevice.sensors.length + 1, mapPlaced: false, active: true, ...vals,
        };
        updateDevice({ ...drawerDevice, sensors: [...drawerDevice.sensors, newSensor] });
      }
      setSensorModal(false);
    });
  };

  const deleteSensor = (sensor: Sensor) => {
    const device = devices.find((d) => d.id === sensor.deviceId); if (!device) return;
    Modal.confirm({
      title: `'${sensor.label}' \uc0ad\uc81c`, okType: 'danger',
      onOk: () => updateDevice({ ...device, sensors: device.sensors.filter((s) => s.id !== sensor.id) }),
    });
  };

  const deviceColumns: ColumnsType<Device> = [
    {
      title: '\uc7a5\ube44\uba85', dataIndex: 'deviceName', width: 150,
      render: (v: string, r: Device) => {
        const cnt = alarms.filter((a) => a.deviceName === r.deviceName && a.ackStatus === 'UNACKED').length;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <b style={{ color: '#e2e8f0' }}>{v}</b>
              {cnt > 0 && <Badge count={cnt} size="small" style={{ background: '#DC2626', fontSize: 9 }} />}
            </div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{r.pluginType}</div>
          </div>
        );
      },
    },
    {
      title: '\uc885\ub958', dataIndex: 'deviceType', width: 130,
      render: (v: string) => {
        const colors: Record<string, string> = { PERIMETER: 'orange', IO_MODULE: 'blue', ACCESS_CONTROL: 'purple' };
        return <Tag color={colors[v] ?? 'default'} style={{ fontSize: 11 }}>{v}</Tag>;
      },
    },
    { title: 'IP', dataIndex: 'ip', width: 130 },
    { title: 'Port', dataIndex: 'port', width: 70 },
    {
      title: '\uc124\uc815', width: 120,
      render: (_: unknown, r: Device) => (
        r.pluginType === 'AdamModbus'
          ? <span style={{ fontSize: 11, color: '#94a3b8' }}>{`\uc811\uc810 ${r.channelCount ?? 8}\ucc44\ub110`}</span>
          : r.pluginType === 'SenstarFlexZone'
            ? <span style={{ fontSize: 11, color: '#94a3b8' }}>{`\ucf00\uc774\ube14 ${r.cableLength ?? 0}m`}</span>
            : <span style={{ fontSize: 11, color: '#475569' }}>-</span>
      ),
    },
    {
      title: '\uc13c\uc11c', width: 80,
      render: (_: unknown, r: Device) => (
        <Tag color="geekblue" style={{ fontSize: 11, cursor: 'pointer' }} onClick={() => openSensorDrawer(r)}>
          {r.sensors.length}\uac1c \u2192
        </Tag>
      ),
    },
    {
      title: '\uc0c1\ud0dc', dataIndex: 'status', width: 120,
      render: (v: string) => (
        <Badge status={STATUS_COLOR[v] as 'success' | 'error' | 'warning' | 'processing'}
          text={<span style={{ fontSize: 11 }}>{v}</span>} />
      ),
    },
    {
      title: '\uc561\uc158', width: 130,
      render: (_: unknown, r: Device) => (
        <Space size={4}>
          <Tooltip title={'\uc7ac\uc5f0\uacb0'}>
          <Button size="small" icon={<SyncOutlined />}
              onClick={() => updateDevice({ ...r, status: r.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED' })} />
          </Tooltip>
          <Tooltip title={'\uc13c\uc11c \uad00\ub9ac'}>
            <Button size="small" icon={<PartitionOutlined />} onClick={() => openSensorDrawer(r)} />
          </Tooltip>
          <Tooltip title={'\ud3b8\uc9d1'}>
            <Button size="small" icon={<EditOutlined />}
              onClick={() => { setEditingDev(r); devForm.setFieldsValue(r); setDevModal(true); }} />
          </Tooltip>
          <Tooltip title={'\uc0ad\uc81c'}>
          <Button size="small" danger icon={<DeleteOutlined />}
              onClick={() => Modal.confirm({
                title: '\uc7a5\ube44 \uc0ad\uc81c', okType: 'danger',
                content: '\ud558\uc704 \uc13c\uc11c\ub3c4 \ubaa8\ub450 \uc0ad\uc81c\ub429\ub2c8\ub2e4.',
                onOk: () => deleteDevice(r.id),
              })} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const sensorColumns: ColumnsType<Sensor> = [
    { title: 'CH', dataIndex: 'channel', width: 50, render: (v: number) => <span style={{ color: '#64748b', fontWeight: 700, fontSize: 12 }}>{v}</span> },
    { title: '\uc13c\uc11c \uc774\ub984', dataIndex: 'label', render: (v: string) => <b style={{ color: '#e2e8f0' }}>{v}</b> },
    { title: '\uc124\uba85', dataIndex: 'description', ellipsis: true, render: (v: string) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span> },
    {
      title: '\ub9f5 \ubc30\uce58 \ud0c0\uc785', dataIndex: 'mapPlacement', width: 130,
      render: (v: MapPlacement) => {
        const p = PLACEMENT_LABELS[v];
        return <Tag style={{ fontSize: 11, color: p.color, borderColor: `${p.color}66`, background: `${p.color}18` }}>{p.icon} {p.label}</Tag>;
      },
    },
    {
      title: '\ub9f5 \ubc30\uce58', dataIndex: 'mapPlaced', width: 80,
      render: (v: boolean) => v
        ? <Tag color="success" style={{ fontSize: 10 }}>{'\ubc30\uce58\ub428'}</Tag>
        : <Tag color="default" style={{ fontSize: 10 }}>{'\ubbf8\ubc30\uce58'}</Tag>,
    },
    {
      title: '\uad6c\uac04 (Senstar)', width: 160,
      render: (_: unknown, r: Sensor) =>
        r.startMeter != null
          ? <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>
              {r.startMeter}m ~ {r.endMeter}m ({r.side + '\uce21'})
            </span>
          : <span style={{ color: '#475569' }}>-</span>,
    },
    {
      title: '\ud65c\uc131', dataIndex: 'active', width: 60,
      render: (v: boolean, r: Sensor) => {
        const device = devices.find((d) => d.id === r.deviceId);
        return <Switch size="small" checked={v} onChange={(checked) => {
          if (!device) return;
          updateDevice({ ...device, sensors: device.sensors.map((s) => s.id === r.id ? { ...s, active: checked } : s) });
        }} />;
      },
    },
    {
      title: '\uc561\uc158', width: 80,
      render: (_: unknown, r: Sensor) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />} onClick={() => { setEditingSensor(r); sensorForm.setFieldsValue(r); setSensorModal(true); }} />
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteSensor(r)} />
        </Space>
      ),
    },
  ];

  const connected    = devices.filter((d) => d.status === 'CONNECTED').length;
  const disconnected = devices.filter((d) => d.status === 'DISCONNECTED').length;
  const totalSensors = devices.reduce((a, d) => a + d.sensors.length, 0);
  const totalUnacked = alarms.filter((a) => a.ackStatus === 'UNACKED').length;

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0' }}>{'\uc7a5\ube44 \uad00\ub9ac'}</div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{'\uc7a5\ube44\ub97c \ub4f1\ub85d\ud558\uace0 \ucc44\ub110 \uc0c1\ud0dc \ubc0f \uc2e4\uc2dc\uac04 \uc774\ubca4\ud2b8\ub97c \ud655\uc778\ud558\uc138\uc694'}</div>
        </div>
        <Space>
          <Button icon={<SyncOutlined />} onClick={() => devices.forEach((d) => updateDevice({ ...d, status: 'CONNECTED' }))}>
            {'\uc804\uccb4 \uc7ac\uc5f0\uacb0'}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingDev(null); devForm.resetFields(); setDevModal(true); }}>
            {'\uc7a5\ube44 \ucd94\uac00'}
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: '\uc5f0\uacb0\ub428',    value: connected,     color: '#16A34A' },
          { label: '\ub04a\uae40', value: disconnected,  color: '#DC2626' },
          { label: '\uc804\uccb4 \uc7a5\ube44', value: devices.length, color: '#2563EB' },
          { label: '\ubbf8\ucc98\ub9ac \uc54c\ub78c',      value: totalUnacked,  color: '#EA580C' },
          { label: '\ub4f1\ub85d \uc13c\uc11c',   value: totalSensors,  color: '#7C3AED' },
        ].map((item) => (
          <div key={item.label} style={{
            background: '#0C1733', border: `1px solid ${item.color}44`,
            borderLeft: `3px solid ${item.color}`, borderRadius: 7, padding: '10px 16px', minWidth: 100,
          }}>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: item.color, lineHeight: 1.3 }}>{item.value}</div>
          </div>
        ))}
      </div>

      <Panel>
      <Table
          rowKey="id" dataSource={devices} columns={deviceColumns}
          size="small" pagination={false} className="stats-table"
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpand: (expanded, record) =>
              setExpandedKeys(expanded ? [...expandedKeys, record.id] : expandedKeys.filter((k) => k !== record.id)),
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button type="text" size="small"
                icon={expanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
                onClick={(e) => onExpand(record, e)} style={{ color: '#475569' }} />
            ),
            expandedRowRender: (device: Device) => {
              const devAlarms     = alarms.filter((a) => a.deviceName === device.deviceName);
              const unackedAlarms = devAlarms.filter((a) => a.ackStatus === 'UNACKED');
              const alarmByCh = new Map<string, Alarm>();
              const byTime = [...unackedAlarms].sort(
                (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
              );
              byTime.forEach((a) => {
                if (a.channelNo == null) return;
                const k = `${a.channelNo}-${a.side ?? 'A'}`;
                if (!alarmByCh.has(k)) alarmByCh.set(k, a);
              });
              const alarmByDi = new Map<number, Alarm>();
              unackedAlarms.forEach((a) => { if (a.diChannel != null && !alarmByDi.has(a.diChannel)) alarmByDi.set(a.diChannel, a); });

              return (
                <div style={{ margin: '4px 32px 8px', background: '#070F24', border: '1px solid #1E3A5F', borderRadius: 6, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PartitionOutlined style={{ color: '#2563EB' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
                        {device.deviceName} &mdash; {'\ucc44\ub110 \ud604\ud669'}
                      </span>
                      {unackedAlarms.length > 0 && (
                        <Tag color="red" style={{ fontSize: 10 }}>&#x26A0; {'\ubbf8\ucc98\ub9ac'} {unackedAlarms.length}{'\uac74'}</Tag>
                      )}
                    </div>
                    <Space size={6}>
                      {device.pluginType === 'SenstarFlexZone' && (
                        <Tooltip title={'\ud074\ub9ad \uc2dc \uc54c\ub78c\uc774 \ubc1c\uc0dd\ud569\ub2c8\ub2e4 (\ucc44\ub110/\uce21 \uc21c\ud658)'}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<BellOutlined />}
                            onClick={() => {
                              const cable = device.cableLength ?? 1000;
                              const channels = Array.from(new Set(device.sensors.map((s) => s.channel))).sort((a, b) => a - b);
                              if (channels.length === 0) {
                                message.warning({ content: '\uc13c\uc11c\uac00 \uc5c6\uc5b4 \ud14c\uc2a4\ud2b8 \uc54c\ub78c\uc744 \uc8fc\uc785\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.' });
                                return;
                              }
                              const pairs: { ch: number; side: 'A' | 'B' }[] = [];
                              channels.forEach((ch) => {
                                pairs.push({ ch, side: 'A' });
                                pairs.push({ ch, side: 'B' });
                              });
                              const step = senstarTestStep[device.id] ?? 0;
                              const { ch, side } = pairs[step % pairs.length];
                              setSenstarTestStep((p) => ({ ...p, [device.id]: step + 1 }));
                              const sensor = device.sensors.find((s) => s.channel === ch && s.side === side);
                              const sm = sensor?.startMeter ?? 0;
                              const em = sensor?.endMeter ?? cable;
                              const span = Math.max(1, em - sm);
                              const meter = Math.min(em, Math.max(sm, sm + Math.floor(span * 0.55)));
                              const sevs = ['HIGH', 'MEDIUM', 'CRITICAL'] as const;
                              const sev = sevs[step % sevs.length];
                              const ts = Date.now();
                              addAlarm({
                                eventId: `test-senstar-${device.id}-${ts}`,
                                zoneId: `z-test-${ch}-${side}-${ts}`,
                                zoneName: `${device.deviceName} CH${ch} ${side + '\uce21'}`,
                                deviceName: device.deviceName,
                                severity: sev,
                                alarmColor: SEV_COLOR[sev],
                                occurredAt: new Date().toISOString(),
                                ackStatus: 'UNACKED',
                                channelNo: ch,
                                side,
                                meter,
                                eventType: 'INTRUSION',
                              });
                              message.success({
                                content: `\ud14c\uc2a4\ud2b8 \uc54c\ub78c \ubc1c\uc0dd: CH${ch} ${side}\uce21 ${meter}m (${sev})`,
                              });
                            }}
                          >
                            {'\ud14c\uc2a4\ud2b8 \uc54c\ub78c \ubc1c\uc0dd'}
                          </Button>
                        </Tooltip>
                      )}
                      {device.pluginType === 'AdamModbus' && (
                        <Tooltip title={'\ud074\ub9ad \uc2dc DI \uc54c\ub78c\uc774 \ubc1c\uc0dd\ud569\ub2c8\ub2e4'}>
                          <Button
                            type="primary"
        size="small"
                            icon={<BellOutlined />}
                            onClick={() => {
                              const diSensors = device.sensors.filter((s) => s.channelType === 'DI');
                              if (diSensors.length === 0) {
                                message.warning({ content: 'DI \uc13c\uc11c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.' });
                                return;
                              }
                              const step = adamTestStep[device.id] ?? 0;
                              const s = diSensors[step % diSensors.length];
                              setAdamTestStep((p) => ({ ...p, [device.id]: step + 1 }));
                              const ts = Date.now();
                              addAlarm({
                                eventId: `test-adam-${device.id}-${ts}`,
                                zoneId: `z-di-${s.channel}-${ts}`,
                                zoneName: `${device.deviceName} ${s.label}`,
                                deviceName: device.deviceName,
                                severity: 'MEDIUM',
                                alarmColor: SEV_COLOR.MEDIUM,
                                occurredAt: new Date().toISOString(),
                                ackStatus: 'UNACKED',
                                diChannel: s.channel,
                                eventType: 'DI_INPUT',
                              });
                              message.success({
                                content: `\ud14c\uc2a4\ud2b8 \uc54c\ub78c \ubc1c\uc0dd: DI-${s.channel}`,
                              });
                            }}
                          >
                            {'\ud14c\uc2a4\ud2b8 \uc54c\ub78c \ubc1c\uc0dd'}
                          </Button>
                        </Tooltip>
                      )}
                      <Button size="small" type="dashed" icon={<PlusOutlined />}
                        onClick={() => { setDrawerDeviceId(device.id); setEditingSensor(null); sensorForm.resetFields(); setSensorModal(true); }}>
                        {'\uc13c\uc11c \ucd94\uac00'}
                      </Button>
                    </Space>
                  </div>

                  {/* Senstar channel view */}
                  {device.pluginType === 'SenstarFlexZone' && (() => {
                    const cable = device.cableLength ?? 1000;
                    const channels = Array.from(new Set(device.sensors.map((s) => s.channel))).sort((a, b) => a - b);
                    const CABLE_BLUE = '#3B82F6';
                    const SEGMENT_LEN_M = 50;
                    const COMM_ITEMS = [
                      { key: 'aSideFail' as const, label: 'A Side Fail' },
                      { key: 'bSideFail' as const, label: 'B Side Fail' },
                      { key: 'mismatch' as const,  label: 'Mismatch' },
                      { key: 'tamper' as const,    label: 'Tamper' },
                      { key: 'offline' as const,   label: 'Offline' },
                    ];
                    return (
                      <div>
                        {channels.map((ch) => {
                          const commDiag = getSenstarCommDiag(device.id, ch);
                          const aSensor = device.sensors.find((s) => s.channel === ch && s.side === 'A');
                          const bSensor = device.sensors.find((s) => s.channel === ch && s.side === 'B');
                          const aAlarm  = alarmByCh.get(`${ch}-A`);
                          const bAlarm  = alarmByCh.get(`${ch}-B`);
                          const mockA = senstarMockMeter[senstarMockKey(device.id, ch, 'A')] != null;
                          const mockB = senstarMockMeter[senstarMockKey(device.id, ch, 'B')] != null;
                          const chAlarms = unackedAlarms.filter((a) => a.channelNo === ch);
                          const chHasAlarm = !!aAlarm || !!bAlarm || mockA || mockB;
                          return (
                            <div key={ch} style={{ background: '#0C1733', border: `1px solid ${chHasAlarm ? '#DC262655' : '#1E3A5F'}`, borderLeft: `3px solid ${chHasAlarm ? '#DC2626' : '#2563EB'}`, borderRadius: 6, marginBottom: 8, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: chHasAlarm ? '#DC262610' : '#070F2466', borderBottom: '1px solid #1E3A5F' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: chHasAlarm ? '#DC2626' : '#2563EB' }}>CH {ch}</span>
                                <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{aSensor?.startMeter ?? 0}m ~ {aSensor?.endMeter ?? 0}m</span>
                                {chHasAlarm && <Tag color="red" style={{ fontSize: 9, padding: '0 4px', margin: 0 }}>&#x26A0; ALARM</Tag>}
                                {chAlarms.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#DC2626' }}>{'\uc774\ubca4\ud2b8'} {chAlarms.length}{'\uac74'}</span>}
                              </div>
                              <div
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                                  padding: '6px 12px', background: '#070F2488', borderBottom: '1px solid #1E3A5F',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <WifiOutlined style={{ color: '#EA580C', fontSize: 11 }} />
                                <span style={{ fontSize: 10, color: '#64748b', marginRight: 2 }}>
                                  {`\ud1b5\uc2e0 \uc0c1\ud0dc`}
                                </span>
                                {COMM_ITEMS.map(({ key, label }) => {
                                  const isSet = commDiag[key];
                                  return (
                                    <div
                                      key={key}
                                      onClick={() => patchSenstarComm(device.id, ch, { [key]: !isSet })}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '2px 7px', borderRadius: 3, fontSize: 10,
                                        background: isSet ? '#DC262618' : 'transparent', border: `1px solid ${isSet ? '#DC2626' : '#1E3A5F'}`,
                                        color: isSet ? '#DC2626' : '#475569', fontWeight: isSet ? 700 : 400, transition: 'all 0.2s',
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: 8, height: 8, borderRadius: 1,
                                          background: isSet ? '#DC2626' : 'transparent',
                                          border: `1.5px solid ${isSet ? '#DC2626' : '#475569'}`,
                                        }}
                                      />
                                      {label}
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {([
                                  { side: 'A' as const, sensor: aSensor, alarm: aAlarm },
                                  { side: 'B' as const, sensor: bSensor, alarm: bAlarm },
                                ]).map(({ side, sensor, alarm }) => {
                                  if (!sensor) return null;
                                  const mKey = senstarMockKey(device.id, ch, side);
                                  const mockM = senstarMockMeter[mKey] ?? null;
                                  const hasStore = !!alarm;
                                  const hasMock = mockM != null;
                                  const activeHit = hasStore || hasMock;
                                  const sm = sensor.startMeter ?? 0;
                                  const em = sensor.endMeter ?? cable;
                                  const midMeter = Math.round((sm + em) / 2);
                                  const hitMeter = hasStore
                                    ? (alarm!.meter != null ? alarm!.meter : midMeter)
                                    : (hasMock ? mockM! : null);
                                  const leftPct = (sm / cable) * 100;
                                  const widthPct = ((em - sm) / cable) * 100;
                                  const hitLeftPct = hitMeter != null ? (hitMeter / cable) * 100 : 0;
                                  const spanM = Math.max(1, em - sm);
                                  const segmentCount = Math.max(1, Math.ceil(spanM / SEGMENT_LEN_M));
                                  const segments: { from: number; to: number }[] = [];
                                  for (let i = 0; i < segmentCount; i++) {
                                    const from = sm + i * SEGMENT_LEN_M;
                                    const to = i === segmentCount - 1 ? em : Math.min(em, sm + (i + 1) * SEGMENT_LEN_M);
                                    if (from >= em) break;
                                    segments.push({ from, to });
                                  }
                                  const nSeg = segments.length;
                                  const ledColor = activeHit ? '#DC2626' : (sensor.active ? CABLE_BLUE : '#475569');
                                  const onCableClick = (e: React.MouseEvent<HTMLDivElement>) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                                    let meter = Math.round(pct * cable);
                                    meter = Math.max(sm, Math.min(em, meter));
                                    setSenstarMockMeter((prev) => {
                                      const cur = prev[mKey];
                                      const tol = Math.max(8, Math.round((em - sm) * 0.04));
                                      if (cur != null && Math.abs(cur - meter) <= tol) {
                                        return { ...prev, [mKey]: null };
                                      }
                                      return { ...prev, [mKey]: meter };
                                    });
                                  };
                                  return (
                                    <div key={side} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <div style={{ width: 46, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <div
                                          style={{
                                            width: 7, height: 7, borderRadius: '50%',
                                            background: ledColor,
                                            boxShadow: activeHit ? '0 0 5px #DC2626' : 'none',
                                            animation: activeHit ? 'senstar-hit-blink 0.7s step-end infinite' : 'none',
                                          }}
                                        />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: activeHit ? '#DC2626' : CABLE_BLUE }}>{side + '\uce21'}</span>
                                      </div>
                                        <div
                                          role="presentation"
                                          onClick={onCableClick}
                                          title={'\ud2b8\ub799 \ud074\ub9ad: \ubaa9\uc5c5 \uce68\uc785 \uc704\uce58 / \uac00\uae4c\uc6b4 \uc704\uce58 \ub2e4\uc2dc \ud074\ub9ad \ud574\uc81c'}
                                          style={{
                                            flex: 1, position: 'relative', minHeight: 40, cursor: 'pointer',
                                            borderRadius: 4,
                                          }}
                                        >
                                          <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, height: 3, background: '#1E3A5F', borderRadius: 2, pointerEvents: 'none' }} />
                                          <div
                                            style={{
                                              position: 'absolute',
                                              left: `${leftPct}%`,
                                              width: `${widthPct}%`,
                                              top: 2,
                                              bottom: 12,
                                              display: 'flex',
                                              gap: 3,
                                              alignItems: 'stretch',
                                            }}
                                          >
                                            {segments.map((seg, segIdx) => {
                                              const w = (seg.to - seg.from) / spanM;
                                              const hitInSeg =
                                                hitMeter != null
                                                && hitMeter >= seg.from
                                                && (segIdx === segments.length - 1 ? hitMeter <= seg.to : hitMeter < seg.to);
                                              const segAlarm = activeHit && hitInSeg;
                                              const lenM = Math.round(seg.to - seg.from);
                                              const tip = (
                                                <div style={{ maxWidth: 220 }}>
                                                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{`CH${ch} ${side + '\uce21'}`}</div>
                                                  <div>{`\uad6c\uac04: ${seg.from}\u2013${seg.to} m`}</div>
                                                  <div>{`\uae38\uc774: ${lenM} m`}</div>
                                                  <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 12 }}>{`\uc804\uccb4 \ucf00\uc774\ube14 0\u2014${cable} m`}</div>
                                                  {segAlarm ? (
                                                    <div style={{ marginTop: 6, color: '#FCA5A5', fontWeight: 600 }}>
                                                      {'\uc774 \uad6c\uac04\uc5d0 \uce68\uc785 \uc54c\ub78c\uc774 \uc788\uc2b5\ub2c8\ub2e4'}
                                                    </div>
                                                  ) : null}
                                                </div>
                                              );
                                              const narrow = seg.to - seg.from < 28;
                                              return (
                                                <Tooltip key={`${mKey}-seg-${seg.from}`} title={tip} placement="top">
                                                  <div
                                                    style={{
                                                      flex: `${w * 10000} 1 0`,
                                                      minWidth: 6,
                                                      display: 'flex',
                                                      flexDirection: 'column',
                                                      alignItems: 'stretch',
                                                      gap: 3,
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        fontSize: narrow ? 6 : 7,
                                                        color: '#94a3b8',
                                                        fontWeight: 600,
                                                        textAlign: 'center',
                                                        lineHeight: 1.05,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        minHeight: narrow ? 8 : 10,
                                                      }}
                                                    >
                                                      {narrow ? `${seg.from}` : `${seg.from}\u2013${seg.to}`}
                                                      {!narrow ? <span style={{ fontSize: 6, color: '#64748b' }}>m</span> : null}
                                                    </div>
                                                    <div
                                                      style={{
                                                        flex: 1,
                                                        minHeight: 14,
                                                        borderRadius: 2,
                                                        background: segAlarm ? 'linear-gradient(180deg,#EF4444,#B91C1C)' : `${CABLE_BLUE}cc`,
                                                        border: `1px solid ${segAlarm ? '#FCA5A5' : CABLE_BLUE}`,
                                                        boxShadow: segAlarm ? '0 0 6px rgba(220,38,38,.6)' : 'none',
                                                        animation: segAlarm ? 'senstar-hit-blink 0.55s step-end infinite' : 'none',
                                                      }}
                                                    />
                                                  </div>
                                                </Tooltip>
                                              );
                                            })}
                                          </div>
                                          {activeHit && hitMeter != null && (
                                            <div
                                              style={{
                                                position: 'absolute',
                                                left: `calc(${hitLeftPct}% - 11px)`,
                                                top: 0,
                                                padding: '0 3px',
                                                height: 14,
                                                borderRadius: 3,
                                                background: '#1e293b',
                                                border: '1px solid #FCA5A5',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 3,
                                                pointerEvents: 'none',
                                              }}
                                            >
                                              <span style={{ fontSize: 7, color: '#FCA5A5', fontWeight: 800, whiteSpace: 'nowrap', lineHeight: 1 }}>
                                                {hitMeter}m
                                              </span>
                                            </div>
                                          )}
                                          <span style={{ position: 'absolute', left: 0, bottom: 0, fontSize: 8, color: '#475569', pointerEvents: 'none' }}>0</span>
                                          <span style={{ position: 'absolute', right: 0, bottom: 0, fontSize: 8, color: '#475569', pointerEvents: 'none' }}>{cable}m</span>
                                        </div>
                                      <Tooltip
                                        title={`${sm}~${em}m / ${SEGMENT_LEN_M}m / ${nSeg}` + '\uac1c \uad6c\uac04'}
                                      >
                                        <div
                                          style={{
                                            minWidth: 72,
                                            flexShrink: 0,
                                            textAlign: 'center',
                                            padding: '4px 6px',
                                            borderRadius: 4,
                                            background: '#0C1733',
                                            border: '1px solid #1E3A5F',
                                            fontSize: 10,
                                            fontWeight: 700,
                                            color: '#94a3b8',
                                            lineHeight: 1.2,
                                            cursor: 'default',
                                          }}
                                        >
                                          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>{nSeg}{'\uac1c'}</div>
                                          <div style={{ fontSize: 9, color: '#64748b' }}>{'\uad6c\uac04'}</div>
                                        </div>
                                      </Tooltip>
                                    </div>
                                  );
                                })}
                              </div>
                              {chAlarms.length > 0 && (
                                <div style={{ borderTop: '1px solid #1E3A5F44', padding: '5px 12px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                  {chAlarms.slice(0, 5).map((a) => (
                                    <div key={a.eventId} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                                      <span style={{ width: 52, textAlign: 'center', borderRadius: 3, padding: '1px 4px', flexShrink: 0, background: `${SEV_COLOR[a.severity]}22`, color: SEV_COLOR[a.severity], fontWeight: 700 }}>{a.severity}</span>
                                      <span style={{ color: '#94a3b8', flex: 1 }}>{(a.side ?? '') + '\uce21'} {a.meter != null ? `${a.meter}m` : ''} &mdash; {a.zoneName}</span>
                                      <span style={{ color: '#475569', flexShrink: 0 }}>{new Date(a.occurredAt).toLocaleTimeString('ko-KR')}</span>
                                      <Button type="link" size="small" style={{ fontSize: 9, padding: 0, height: 'auto', color: '#475569' }} onClick={() => ackAlarm(a.eventId)}>{'\ud655\uc778'}</Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* ADAM DI/DO */}
                  {device.pluginType === 'AdamModbus' && (() => {
                    const diSensors = device.sensors.filter((s) => s.channelType === 'DI');
                    const doSensors = device.sensors.filter((s) => s.channelType === 'DO');
                    const diag = getAdamDiag(device);
                    const SC: Record<string, string> = { SECURE: '#22c55e', ALARM: '#DC2626', SUPERVISION: '#CA8A04', ON: '#2563EB', OFF: '#475569' };
                    const nextDi: Record<string, 'SECURE'|'ALARM'|'SUPERVISION'> = { SECURE: 'ALARM', ALARM: 'SUPERVISION', SUPERVISION: 'SECURE' };
                    return (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1, background: '#0C1733', border: '1px solid #1E3A5F', borderTop: '2px solid #22c55e', borderRadius: 6, padding: '10px 12px' }}>
                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <CheckCircleOutlined style={{ color: '#22c55e' }} /> Input Point Status (DI)
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                            {diSensors.map((s) => {
                              const fromAlarm = alarmByDi.has(s.channel);
                              const st    = fromAlarm ? 'ALARM' : (diag.diStates[s.channel] ?? 'SECURE');
                              const alarm = alarmByDi.get(s.channel);
                              const color = SC[st];
                              return (
                                <Tooltip key={s.id} title={<div><div style={{ fontWeight: 700 }}>CH {s.channel}: {s.label}</div>{alarm && <div style={{ color: '#DC2626', fontSize: 11, marginTop: 2 }}>&#x26A0; {alarm.zoneName} &mdash; {new Date(alarm.occurredAt).toLocaleTimeString('ko-KR')}</div>}{!fromAlarm && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{'\ud074\ub9ad\ud574 \uc0c1\ud0dc \uc21c\ud658'}</div>}</div>}>
                                  <div onClick={() => !fromAlarm && patchAdamDiag(device.id, { diStates: { ...diag.diStates, [s.channel]: nextDi[st] } })}
                                    style={{ textAlign: 'center', cursor: fromAlarm ? 'default' : 'pointer', padding: '6px 2px', border: `1px solid ${color}44`, borderRadius: 5, background: `${color}12`, animation: fromAlarm ? 'blink 0.8s step-end infinite' : 'none' }}>
                                    <div style={{ fontSize: 13, color, marginBottom: 1 }}>{st === 'ALARM' ? <AlertOutlined /> : <CheckCircleOutlined />}</div>
                                    <div style={{ fontSize: 9, color: '#94a3b8' }}>CH{s.channel}</div>
                                    <div style={{ fontSize: 8, color, fontWeight: 700 }}>{st === 'SECURE' ? 'SEC' : st === 'ALARM' ? 'ALM' : 'SUP'}</div>
                                  </div>
                                </Tooltip>
                              );
                            })}
                          </div>
                          {unackedAlarms.filter((a) => a.diChannel != null).length > 0 && (
                            <div style={{ marginTop: 8, borderTop: '1px solid #1E3A5F', paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {unackedAlarms.filter((a) => a.diChannel != null).map((a) => (
                                <div key={a.eventId} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                                  <span style={{ width: 40, textAlign: 'center', borderRadius: 3, padding: '1px 3px', flexShrink: 0, background: `${SEV_COLOR[a.severity]}22`, color: SEV_COLOR[a.severity], fontWeight: 700 }}>{a.severity}</span>
                                  <span style={{ color: '#94a3b8', flex: 1 }}>DI-{a.diChannel} {a.zoneName}</span>
                                  <span style={{ color: '#475569' }}>{new Date(a.occurredAt).toLocaleTimeString('ko-KR')}</span>
                                  <Button type="link" size="small" style={{ fontSize: 9, padding: 0, height: 'auto', color: '#475569' }} onClick={() => ackAlarm(a.eventId)}>{'\ud655\uc778'}</Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, background: '#0C1733', border: '1px solid #1E3A5F', borderTop: '2px solid #2563EB', borderRadius: 6, padding: '10px 12px' }}>
                          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <ThunderboltOutlined style={{ color: '#2563EB' }} /> Output Point Status (DO {'\ub9b4\ub808\uc774'})
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
                            {doSensors.map((s) => {
                              const st = diag.doStates[s.channel] ?? 'OFF';
                              const color = SC[st];
                              return (
                                <Tooltip key={s.id} title={`DO ${s.channel}: ${s.label} \u2014 ON/OFF ${'\ud1a0\uae00'}`}>
                                  <div onClick={() => {
                                    const next = st === 'ON' ? 'OFF' : 'ON';
                                    patchAdamDiag(device.id, { doStates: { ...diag.doStates, [s.channel]: next } });
                                    updateDevice({ ...device, sensors: device.sensors.map((sen) => sen.channelType === 'DO' && sen.channel === s.channel ? { ...sen, relayState: next } : sen) });
                                  }} style={{ textAlign: 'center', cursor: 'pointer', padding: '6px 2px', border: `1px solid ${color}44`, borderRadius: 5, background: `${color}12` }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, margin: '0 auto 2px', boxShadow: st === 'ON' ? `0 0 6px ${color}` : 'none' }} />
                                    <div style={{ fontSize: 9, color: '#94a3b8' }}>DO{s.channel}</div>
                                    <div style={{ fontSize: 8, color, fontWeight: 700 }}>{st}</div>
                                  </div>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* AccessControl */}
                  {device.pluginType === 'AccessControl' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {unackedAlarms.length === 0
                        ? <span style={{ fontSize: 12, color: '#475569' }}>{'\uc815\uc0c1 \u2014 \ubbf8\ucc98\ub9ac \uc54c\ub78c \uc5c6\uc74c'}</span>
                        : unackedAlarms.map((a) => (
                          <div key={a.eventId} style={{ background: '#0C1733', border: `1px solid ${SEV_COLOR[a.severity]}44`, borderLeft: `3px solid ${SEV_COLOR[a.severity]}`, borderRadius: 5, padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{a.zoneName}</div>
                              <div style={{ fontSize: 10, color: '#64748b' }}>{new Date(a.occurredAt).toLocaleString('ko-KR')}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <Tag style={{ fontSize: 10, color: SEV_COLOR[a.severity], borderColor: `${SEV_COLOR[a.severity]}55`, background: `${SEV_COLOR[a.severity]}18` }}>{a.severity}</Tag>
                              <Button size="small" onClick={() => ackAlarm(a.eventId)} style={{ fontSize: 10 }}>{'\ud655\uc778'}</Button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      </Panel>

      {/* device modal */}
      <Modal open={devModal} onCancel={() => setDevModal(false)} onOk={saveDev} title={editingDev ? '\uc7a5\ube44 \ud3b8\uc9d1' : '\uc7a5\ube44 \ucd94\uac00'} okText={'\uc800\uc7a5'} cancelText={'\ucde8\uc18c'} width={520}>
        <Form form={devForm} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="deviceName" label={'\uc7a5\ube44\uba85'} style={{ flex: 1 }} rules={[{ required: true, message: '\uc7a5\ube44\uba85\uc744 \uc785\ub825\ud558\uc138\uc694' }]}>
              <Input placeholder={'\uc608: ADAM-1, Senstar-1F-A'} />
          </Form.Item>
            <Form.Item name="deviceType" label={'\uc7a5\ube44 \uc885\ub958'} style={{ flex: 1 }} initialValue="IO_MODULE">
            <Select options={[
                { label: 'PERIMETER (\uc9f8\uc785\uac10\uc9c0)', value: 'PERIMETER' },
                { label: 'IO_MODULE (I/O \ubaa8\ub4c8)', value: 'IO_MODULE' },
                { label: 'ACCESS_CONTROL (\ucd9c\uc785\ud1b5\uc81c)', value: 'ACCESS_CONTROL' },
            ]} />
          </Form.Item>
          </Space>
          <Form.Item name="pluginType" label={'\ud50c\ub7ec\uadf8\uc778'} initialValue="AdamModbus">
            <Select options={[
              { label: 'AdamModbus \u2014 ADAM I/O \ubaa8\ub4c8', value: 'AdamModbus' },
              { label: 'SenstarFlexZone \u2014 \uc13c\uc2a4\ud0c0 \uce68\uc785\uac10\uc9c0', value: 'SenstarFlexZone' },
              { label: 'AccessControl \u2014 \ucd9c\uc785\ud1b5\uc81c', value: 'AccessControl' },
            ]} />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="ip" label={'IP \uc8fc\uc18c'} style={{ flex: 1 }} rules={[{ required: true, message: 'IP\ub97c \uc785\ub825\ud558\uc138\uc694' }]}>
              <Input placeholder="192.168.1.x" />
            </Form.Item>
            <Form.Item name="port" label={'\ud3ec\ud2b8'} style={{ width: 110 }}>
              <InputNumber min={1} max={65535} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.pluginType !== cur.pluginType}>
            {({ getFieldValue }) => {
              const plugin = getFieldValue('pluginType');
              if (plugin === 'AdamModbus') return (
                <Form.Item name="channelCount" label={'\uc811\uc810 \ucc44\ub110 \uc218'} initialValue={8}>
                  <Select options={[4, 8, 16, 32].map((v) => ({ label: `${v}\ucc44\ub110`, value: v }))} />
                </Form.Item>
              );
              if (plugin === 'SenstarFlexZone') return (
                <Form.Item name="cableLength" label={'\ucf00\uc774\ube14 \ucd1d \uae38\uc774 (m)'} initialValue={1000}>
                  <InputNumber min={1} max={10000} style={{ width: '100%' }} addonAfter="m" />
                </Form.Item>
              );
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* sensor drawer */}
      <Drawer open={sensorDrawer} onClose={() => setSensorDrawer(false)}
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PartitionOutlined style={{ color: '#2563EB' }} /><span>{`${drawerDevice?.deviceName ?? ''} \u2014 \uc13c\uc11c \uad00\ub9ac`}</span><Tag color="geekblue">{`${drawerDevice?.sensors.length ?? 0}\uac1c`}</Tag></div>}
        width={780}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingSensor(null); sensorForm.resetFields(); setSensorModal(true); }}>{'\uc13c\uc11c \ucd94\uac00'}</Button>}>
        {drawerDevice && (
          <>
            <div style={{ padding: '8px 12px', marginBottom: 12, background: '#070F24', borderRadius: 6, border: '1px solid #1E3A5F', fontSize: 12, color: '#64748b', display: 'flex', gap: 16 }}>
              <span>{'\ud50c\ub7ec\uadf8\uc778'}: <b style={{ color: '#e2e8f0' }}>{drawerDevice.pluginType}</b></span>
              {drawerDevice.channelCount && <span>{'\ucc44\ub110 \uc218'}: <b style={{ color: '#2563EB' }}>{drawerDevice.channelCount}</b></span>}
              {drawerDevice.cableLength && <span>{'\ucf00\uc774\ube14'}: <b style={{ color: '#2563EB' }}>{drawerDevice.cableLength}m</b></span>}
            </div>
            <Table rowKey="id" dataSource={drawerDevice.sensors} columns={sensorColumns} size="small" pagination={false} className="stats-table" />
          </>
        )}
      </Drawer>

      {/* sensor modal */}
      <Modal open={sensorModal} onCancel={() => setSensorModal(false)} onOk={saveSensor}
        title={editingSensor ? '\uc13c\uc11c \ud3b8\uc9d1' : `\uc13c\uc11c \ucd94\uac00 \u2014 ${drawerDevice?.deviceName ?? ''}`}
        okText={'\uc800\uc7a5'} cancelText={'\ucde8\uc18c'} width={500}>
        <Form form={sensorForm} layout="vertical" style={{ marginTop: 16 }}>
          {drawerDevice?.pluginType === 'SenstarFlexZone' ? (
            <>
              <div style={{ background: '#070F24', border: '1px solid #2563EB44', borderLeft: '3px solid #2563EB', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: '#64748b' }}>
                <b style={{ color: '#2563EB' }}>Senstar FlexZone</b>{' \u2014 \ucc44\ub110 \ubc88\ud638\uc640 Side(A/B)\ub85c \uad6c\uac04\uc744 \uc815\uc758\ud569\ub2c8\ub2e4.'}
              </div>
              <Space style={{ width: '100%' }} size="middle">
                <Form.Item name="channel" label={'\ucc44\ub110 \ubc88\ud638'} style={{ width: 110 }} initialValue={1} rules={[{ required: true }]}>
                  <InputNumber min={1} max={64} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="side" label="Side" style={{ width: 100 }} initialValue="A" rules={[{ required: true }]}>
                  <Select options={[{ label: 'A\uce21', value: 'A' }, { label: 'B\uce21', value: 'B' }]} />
                </Form.Item>
                <Form.Item name="startMeter" label={'\uc2dc\uc791 (m)'} style={{ flex: 1 }} rules={[{ required: true, message: '\uc2dc\uc791 \ubbf8\ud130\ub97c \uc785\ub825\ud558\uc138\uc694' }]}>
                  <InputNumber min={0} max={drawerDevice.cableLength ?? 9999} style={{ width: '100%' }} addonAfter="m" />
                </Form.Item>
                <Form.Item name="endMeter" label={'\ub05d (m)'} style={{ flex: 1 }} rules={[{ required: true, message: '\ub05d \ubbf8\ud130\ub97c \uc785\ub825\ud558\uc138\uc694' }]}>
                  <InputNumber min={0} max={drawerDevice.cableLength ?? 9999} style={{ width: '100%' }} addonAfter="m" />
                </Form.Item>
              </Space>
              <Form.Item name="label" label={'Zone \uc774\ub984'} rules={[{ required: true }]}>
                <Input placeholder={'\uc608: CH1-A'} />
              </Form.Item>
              <Form.Item name="mapPlacement" initialValue="LINE" hidden><Input /></Form.Item>
            </>
          ) : (
            <>
              <Space style={{ width: '100%' }} size="middle">
                <Form.Item name="label" label={'\uc13c\uc11c \uc774\ub984'} style={{ flex: 1 }} rules={[{ required: true }]}>
                  <Input placeholder={'\uc608: DI-1'} />
                </Form.Item>
                <Form.Item name="channel" label={'\ucc44\ub110 \ubc88\ud638'} style={{ width: 110 }} rules={[{ required: true }]}>
                  <InputNumber min={1} max={64} style={{ width: '100%' }} />
                </Form.Item>
              </Space>
              <Form.Item name="description" label={'\uc124\uba85'}>
                <Input placeholder={'\uc608: \uc815\ubb38 \uc6b0\uce21 \uc811\uc810'} />
              </Form.Item>
              <Form.Item name="mapPlacement" label={'\ub9f5 \ubc30\uce58 \ud0c0\uc785'} initialValue="POINT">
                <Select options={[
                  { label: '\uc810 (POINT) \u2014 \ub2e8\uc77c \uc704\uce58', value: 'POINT' },
                  { label: '\uba74 (ZONE) \u2014 \uad6c\uc5ed \uac10\uc9c0',  value: 'ZONE'  },
                ]} />
              </Form.Item>
            </>
          )}
          <Form.Item name="active" label={'\ud65c\uc131'} valuePropName="checked" initialValue={true} style={{ marginTop: 4 }}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default DevicesPage;
