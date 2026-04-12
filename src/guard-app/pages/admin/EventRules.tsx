import React, { useState } from 'react';
import {
  Button, Form, Input, Modal, Select, Space, Switch, Table, Tag, Tabs,
  Checkbox, Tooltip, Popconfirm,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  ThunderboltOutlined, VideoCameraOutlined,
  AimOutlined, NodeIndexOutlined, SwapOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useEventRuleStore, useDeviceStore, type Device } from '../../stores';
import {
  MOCK_CAMERAS, MOCK_MAPS, MOCK_PRESETS, MOCK_ZONES, EVENT_TYPES,
  type EventRule, type EventAction, type EventTrigger, type SeverityLevel,
} from '../../mock/data';

/* ── 심각도 / 이벤트 타입 옵션 ── */
const SEV_OPTIONS: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'CRITICAL', label: 'CRITICAL', color: '#DC2626' },
  { value: 'HIGH',     label: 'HIGH',     color: '#EA580C' },
  { value: 'MEDIUM',   label: 'MEDIUM',   color: '#CA8A04' },
  { value: 'LOW',      label: 'LOW',      color: '#2563EB' },
];

const ACTION_ICONS: Record<string, React.ReactNode> = {
  SHOW_CCTV_POPUP: <VideoCameraOutlined />,
  PTZ_PRESET:      <AimOutlined />,
  RELAY_CONTROL:   <ThunderboltOutlined />,
  SWITCH_MAP:      <NodeIndexOutlined />,
};

const ACTION_LABELS: Record<string, string> = {
  SHOW_CCTV_POPUP: 'CCTV 팝업',
  PTZ_PRESET:      'PTZ 프리셋 이동',
  RELAY_CONTROL:   '릴레이 제어',
  SWITCH_MAP:      '맵 전환',
};

/* ── 빈 트리거 초기값 ── */
const emptyTrigger = (): EventTrigger => ({
  sensorIds: [], zoneIds: [], eventTypes: [], severities: [],
});

/* ══════════════════════════════════════
   액션 편집 카드
══════════════════════════════════════ */
const ActionCard: React.FC<{
  action: EventAction;
  idx: number;
  onChange: (idx: number, action: EventAction) => void;
  onRemove: (idx: number) => void;
  devices: Device[];
}> = ({ action, idx, onChange, onRemove, devices }) => {
  const adamDevices = devices.filter((d) => d.pluginType === 'AdamModbus');
  const ptzCameras  = MOCK_CAMERAS.filter((c) => c.supportsPtz);

  return (
    <div style={{
      background: '#070F24', border: '1px solid #1E3A5F', borderRadius: 6,
      padding: '10px 12px', marginBottom: 8, position: 'relative',
    }}>
      {/* 액션 타입 라벨 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
        color: '#60a5fa', fontWeight: 700, fontSize: 12,
      }}>
        {ACTION_ICONS[action.type]}
        {ACTION_LABELS[action.type]}
        <button
          onClick={() => onRemove(idx)}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: '#475569', cursor: 'pointer', fontSize: 14, padding: 0,
            lineHeight: 1,
          }}
        >✕</button>
      </div>

      {/* CCTV 팝업 */}
      {action.type === 'SHOW_CCTV_POPUP' && (
        <Space direction="vertical" style={{ width: '100%' }} size={6}>
          <Select
            size="small" placeholder="카메라 선택" style={{ width: '100%' }}
            value={action.cameraId || undefined}
            onChange={(v) => onChange(idx, { ...action, cameraId: v })}
            options={MOCK_CAMERAS.map((c) => ({ value: c.id, label: `${c.cameraName} (${c.channelId})` }))}
          />
          <Select
            size="small" placeholder="초기 프리셋 (선택)" style={{ width: '100%' }}
            allowClear value={action.presetToken || undefined}
            onChange={(v) => onChange(idx, { ...action, presetToken: v })}
            disabled={!MOCK_CAMERAS.find((c) => c.id === action.cameraId)?.supportsPtz}
            options={MOCK_PRESETS.map((p) => ({ value: p.presetToken, label: p.presetName }))}
          />
        </Space>
      )}

      {/* PTZ 프리셋 이동 */}
      {action.type === 'PTZ_PRESET' && (
        <Space direction="vertical" style={{ width: '100%' }} size={6}>
          <Select
            size="small" placeholder="PTZ 카메라 선택" style={{ width: '100%' }}
            value={action.cameraId || undefined}
            onChange={(v) => onChange(idx, { ...action, cameraId: v })}
            options={ptzCameras.map((c) => ({ value: c.id, label: `${c.cameraName} (${c.channelId})` }))}
          />
          <Select
            size="small" placeholder="프리셋 선택" style={{ width: '100%' }}
            value={action.presetToken || undefined}
            onChange={(v) => onChange(idx, { ...action, presetToken: v })}
            options={MOCK_PRESETS.map((p) => ({ value: p.presetToken, label: p.presetName }))}
          />
        </Space>
      )}

      {/* 릴레이 제어 */}
      {action.type === 'RELAY_CONTROL' && (
        <Space direction="vertical" style={{ width: '100%' }} size={6}>
          <Select
            size="small" placeholder="ADAM 장비" style={{ width: '100%' }}
            value={action.deviceId || undefined}
            onChange={(v) => onChange(idx, { ...action, deviceId: v, doChannel: 1 })}
            options={adamDevices.map((d) => ({ value: d.id, label: d.deviceName }))}
          />
          <Space style={{ width: '100%' }} size={6}>
            <Select
              size="small" placeholder="DO 채널" style={{ width: 100 }}
              value={action.doChannel || undefined}
              onChange={(v) => onChange(idx, { ...action, doChannel: v })}
              options={[1, 2, 3, 4].map((n) => ({ value: n, label: `DO-${n}` }))}
            />
            <Select
              size="small" style={{ width: 90 }}
              value={action.mode}
              onChange={(v) => onChange(idx, { ...action, mode: v })}
              options={[
                { value: 'LATCH', label: 'LATCH' },
                { value: 'PULSE', label: 'PULSE' },
              ]}
            />
            {action.mode === 'PULSE' && (
              <Space size={4}>
                <Input
                  size="small" type="number" style={{ width: 60 }}
                  value={action.pulseSec ?? 5}
                  onChange={(e) => onChange(idx, { ...action, pulseSec: Number(e.target.value) })}
                />
                <span style={{ color: '#64748b', fontSize: 11 }}>초</span>
              </Space>
            )}
          </Space>
        </Space>
      )}

      {/* 맵 전환 */}
      {action.type === 'SWITCH_MAP' && (
        <Select
          size="small" placeholder="이동할 맵 선택" style={{ width: '100%' }}
          value={action.mapId || undefined}
          onChange={(v) => onChange(idx, { ...action, mapId: v })}
          options={MOCK_MAPS.map((m) => ({ value: m.id, label: m.mapName }))}
        />
      )}
    </div>
  );
};

/* ══════════════════════════════════════
   메인 페이지
══════════════════════════════════════ */
const EventRulesPage: React.FC = () => {
  const { rules, addRule, updateRule, deleteRule, toggleRule } = useEventRuleStore();
  const { devices } = useDeviceStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<EventRule | null>(null);
  const [activeTab, setActiveTab] = useState('trigger');

  /* 편집 폼 상태 */
  const [name,     setName]     = useState('');
  const [enabled,  setEnabled]  = useState(true);
  const [trigger,  setTrigger]  = useState<EventTrigger>(emptyTrigger());
  const [actions,  setActions]  = useState<EventAction[]>([]);

  const openCreate = () => {
    setEditing(null);
    setName(''); setEnabled(true);
    setTrigger(emptyTrigger()); setActions([]);
    setActiveTab('trigger');
    setModalOpen(true);
  };

  const openEdit = (rule: EventRule) => {
    setEditing(rule);
    setName(rule.name); setEnabled(rule.enabled);
    setTrigger({ ...rule.trigger }); setActions([...rule.actions]);
    setActiveTab('trigger');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const rule: EventRule = {
      id:      editing?.id ?? `rule-${Date.now()}`,
      name, enabled, trigger, actions,
    };
    if (editing) updateRule(rule); else addRule(rule);
    setModalOpen(false);
  };

  const addAction = (type: EventAction['type']) => {
    const defaults: Record<EventAction['type'], EventAction> = {
      SHOW_CCTV_POPUP: { type: 'SHOW_CCTV_POPUP', cameraId: '' },
      PTZ_PRESET:      { type: 'PTZ_PRESET', cameraId: '', presetToken: '' },
      RELAY_CONTROL:   { type: 'RELAY_CONTROL', deviceId: '', doChannel: 1, mode: 'PULSE', pulseSec: 5 },
      SWITCH_MAP:      { type: 'SWITCH_MAP', mapId: '' },
    };
    setActions((prev) => [...prev, defaults[type]]);
  };

  const updateAction = (idx: number, action: EventAction) => {
    setActions((prev) => prev.map((a, i) => i === idx ? action : a));
  };

  const removeAction = (idx: number) => {
    setActions((prev) => prev.filter((_, i) => i !== idx));
  };

  /* 트리거 요약 텍스트 */
  const summarizeTrigger = (t: EventTrigger) => {
    const parts: string[] = [];
    if (t.zoneIds.length > 0) parts.push(`Zone ${t.zoneIds.length}개`);
    if (t.eventTypes.length > 0) parts.push(t.eventTypes.join('/'));
    if (t.severities.length > 0) parts.push(t.severities.join('+'));
    return parts.join(' · ') || '(미설정)';
  };

  const columns: ColumnsType<EventRule> = [
    {
      title: '규칙명', dataIndex: 'name', width: 200,
      render: (v, r) => (
        <span style={{ fontWeight: 600, color: r.enabled ? '#e2e8f0' : '#475569' }}>{v}</span>
      ),
    },
    {
      title: '트리거', key: 'trigger',
      render: (_, r) => (
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{summarizeTrigger(r.trigger)}</span>
      ),
    },
    {
      title: '액션', key: 'actions', width: 200,
      render: (_, r) => (
        <Space size={4} wrap>
          {r.actions.map((a, i) => (
            <Tag key={i} icon={ACTION_ICONS[a.type]} style={{ fontSize: 10, margin: 0 }}>
              {ACTION_LABELS[a.type]}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '활성', dataIndex: 'enabled', width: 70, align: 'center',
      render: (v, r) => (
        <Switch
          size="small" checked={v}
          onChange={() => toggleRule(r.id)}
        />
      ),
    },
    {
      title: '관리', width: 90, align: 'center',
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="편집">
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          </Tooltip>
          <Popconfirm title="삭제하시겠습니까?" okText="삭제" cancelText="취소" okType="danger"
            onConfirm={() => deleteRule(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-title">이벤트 규칙 관리</span>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>규칙 추가</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={rules}
        columns={columns}
        size="small"
        pagination={false}
        rowClassName={(r) => r.enabled ? '' : 'row-disabled'}
        style={{ opacity: 1 }}
      />

      {/* ── 편집 모달 ── */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        title={editing ? '이벤트 규칙 편집' : '이벤트 규칙 추가'}
        okText="저장" cancelText="취소"
        width={600}
        styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
      >
        {/* 기본 정보 */}
        <Space style={{ width: '100%', marginBottom: 16 }} size={12}>
          <Form.Item label="규칙명" style={{ margin: 0, flex: 1 }}>
            <Input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="규칙 이름 입력"
            />
          </Form.Item>
          <Form.Item label="활성" style={{ margin: 0 }}>
            <Switch checked={enabled} onChange={setEnabled} />
          </Form.Item>
        </Space>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          items={[
            {
              key: 'trigger',
              label: '트리거 조건',
              children: (
                <Space direction="vertical" style={{ width: '100%' }} size={14}>

                  {/* Zone 선택 */}
                  <Form.Item label="Zone 선택" style={{ margin: 0 }}>
                    <Select
                      mode="multiple" placeholder="감시할 Zone 선택 (비어있으면 전체)"
                      style={{ width: '100%' }}
                      value={trigger.zoneIds}
                      onChange={(v) => setTrigger((t) => ({ ...t, zoneIds: v }))}
                      options={MOCK_ZONES.map((z) => ({ value: z.id, label: `${z.zoneName} (${z.zoneType})` }))}
                    />
                  </Form.Item>

                  {/* 이벤트 유형 */}
                  <Form.Item label="이벤트 유형" style={{ margin: 0 }}>
                    <div style={{
                      background: '#070F24', border: '1px solid #1E3A5F',
                      borderRadius: 6, padding: '8px 12px',
                    }}>
                      <Checkbox.Group
                        value={trigger.eventTypes}
                        onChange={(v) => setTrigger((t) => ({ ...t, eventTypes: v as string[] }))}
                      >
                        <Space wrap size={[12, 8]}>
                          {EVENT_TYPES.map((et) => (
                            <Checkbox key={et.value} value={et.value} style={{ fontSize: 12 }}>
                              {et.label}
                            </Checkbox>
                          ))}
                        </Space>
                      </Checkbox.Group>
                    </div>
                  </Form.Item>

                  {/* 심각도 */}
                  <Form.Item label="심각도" style={{ margin: 0 }}>
                    <div style={{
                      background: '#070F24', border: '1px solid #1E3A5F',
                      borderRadius: 6, padding: '8px 12px',
                      display: 'flex', gap: 16,
                    }}>
                      {SEV_OPTIONS.map((sev) => (
                        <label key={sev.value} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={trigger.severities.includes(sev.value)}
                            onChange={(e) => {
                              setTrigger((t) => ({
                                ...t,
                                severities: e.target.checked
                                  ? [...t.severities, sev.value]
                                  : t.severities.filter((s) => s !== sev.value),
                              }));
                            }}
                          />
                          <span style={{ color: sev.color, fontWeight: 700, fontSize: 12 }}>{sev.label}</span>
                        </label>
                      ))}
                    </div>
                  </Form.Item>
                </Space>
              ),
            },
            {
              key: 'actions',
              label: `액션 (${actions.length})`,
              children: (
                <div>
                  {actions.map((action, idx) => (
                    <ActionCard
                      key={idx}
                      action={action}
                      idx={idx}
                      onChange={updateAction}
                      onRemove={removeAction}
                      devices={devices}
                    />
                  ))}

                  {actions.length === 0 && (
                    <div style={{
                      textAlign: 'center', color: '#475569', padding: '24px 0',
                      fontSize: 12,
                    }}>
                      액션이 없습니다. 아래에서 추가하세요.
                    </div>
                  )}

                  {/* 액션 추가 버튼 */}
                  <div style={{
                    display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap',
                  }}>
                    {(Object.keys(ACTION_LABELS) as EventAction['type'][]).map((type) => (
                      <Button
                        key={type} size="small" icon={ACTION_ICONS[type]}
                        onClick={() => addAction(type)}
                        style={{ fontSize: 11 }}
                      >
                        {ACTION_LABELS[type]}
                      </Button>
                    ))}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <style>{`
        .row-disabled td { opacity: 0.45; }
      `}</style>
    </div>
  );
};

export default EventRulesPage;
