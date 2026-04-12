import React, { useState } from 'react';
import {
  Badge, Button, Form, Input, InputNumber, Modal,
  Space, Switch, Table, Tag, Tooltip,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  CloudDownloadOutlined, LoadingOutlined,
  ApiOutlined, CameraOutlined, WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_CAMERAS } from '../../mock/data';

/* ── 타입 ─────────────────────────────────────── */
type CameraRow = typeof MOCK_CAMERAS[0] & { source?: 'vms' | 'manual'; vmsId?: string };

interface VmsServer {
  id: string;
  name: string;
  url: string;
  mediaMtxUrl: string;
  username: string;
  status: 'connected' | 'disconnected' | 'testing';
  cameraCount: number;
}

/* ── 목업 초기 데이터 ─────────────────────────── */
const INIT_VMS_SERVERS: VmsServer[] = [
  {
    id: 'vms-001', name: 'Main VMS',
    url: 'http://192.168.1.100:8080',
    mediaMtxUrl: 'http://192.168.1.100:8889',
    username: 'admin',
    status: 'connected', cameraCount: 4,
  },
];

/* VMS에서 가져올 수 있는 목업 카메라 목록 */
const VMS_DISCOVERED: Record<string, CameraRow[]> = {
  'vms-001': [
    { id: 'disc-001', channelId: 'CH-01', cameraName: '정문 우측', rtspUrl: 'rtsp://192.168.1.201/stream', supportsPtz: true,  vmsName: 'Main VMS', source: 'vms', vmsId: 'vms-001' },
    { id: 'disc-002', channelId: 'CH-02', cameraName: '정문 좌측', rtspUrl: 'rtsp://192.168.1.202/stream', supportsPtz: false, vmsName: 'Main VMS', source: 'vms', vmsId: 'vms-001' },
    { id: 'disc-003', channelId: 'CH-03', cameraName: '주차장 입구', rtspUrl: 'rtsp://192.168.1.203/stream', supportsPtz: true,  vmsName: 'Main VMS', source: 'vms', vmsId: 'vms-001' },
    { id: 'disc-004', channelId: 'CH-04', cameraName: '1층 복도', rtspUrl: 'rtsp://192.168.1.204/stream', supportsPtz: false, vmsName: 'Main VMS', source: 'vms', vmsId: 'vms-001' },
    { id: 'disc-005', channelId: 'CH-05', cameraName: '2층 계단', rtspUrl: 'rtsp://192.168.1.205/stream', supportsPtz: false, vmsName: 'Main VMS', source: 'vms', vmsId: 'vms-001' },
    { id: 'disc-006', channelId: 'CH-06', cameraName: '후문',      rtspUrl: 'rtsp://192.168.1.206/stream', supportsPtz: true,  vmsName: 'Main VMS', source: 'vms', vmsId: 'vms-001' },
  ],
};

/* ── 공통 패널 ────────────────────────────────── */
const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: '#0C1733', border: '1px solid #1E3A5F',
    borderRadius: 8, padding: '16px 18px', ...style,
  }}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ icon?: React.ReactNode; children: React.ReactNode; extra?: React.ReactNode }> = ({ icon, children, extra }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #1E3A5F',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
      <span style={{ width: 3, height: 14, background: '#2563EB', borderRadius: 2, display: 'inline-block' }} />
      {icon && <span style={{ color: '#2563EB' }}>{icon}</span>}
      {children}
    </div>
    {extra}
  </div>
);

/* ══════════════════════════════════════════════
   메인 컴포넌트
══════════════════════════════════════════════ */
const VmsPage: React.FC = () => {
  /* ── VMS 서버 상태 ── */
  const [vmsServers, setVmsServers]   = useState<VmsServer[]>(INIT_VMS_SERVERS);
  const [vmsModal, setVmsModal]       = useState(false);
  const [editingVms, setEditingVms]   = useState<VmsServer | null>(null);
  const [vmsForm]                     = Form.useForm();

  /* ── 카메라 상태 ── */
  const [cameras, setCameras]           = useState<CameraRow[]>(
    MOCK_CAMERAS.map((c) => ({ ...c, source: 'vms' as const, vmsId: 'vms-001' }))
  );
  const [camModal, setCamModal]         = useState(false);
  const [editingCam, setEditingCam]     = useState<CameraRow | null>(null);
  const [camForm]                       = Form.useForm();

  /* ── 가져오기 모달 ── */
  const [importModal, setImportModal]   = useState(false);
  const [importVmsId, setImportVmsId]   = useState<string>('');
  const [importLoading, setImportLoading] = useState(false);
  const [importDiscovered, setImportDiscovered] = useState<CameraRow[]>([]);
  const [importSelected, setImportSelected] = useState<string[]>([]);

  /* ── VMS 연결 테스트 ── */
  const testVms = (id: string) => {
    setVmsServers((prev) => prev.map((v) => v.id === id ? { ...v, status: 'testing' } : v));
    setTimeout(() => {
      setVmsServers((prev) => prev.map((v) =>
        v.id === id ? { ...v, status: Math.random() > 0.2 ? 'connected' : 'disconnected' } : v
      ));
    }, 1400);
  };

  /* ── VMS 저장 ── */
  const saveVms = () => {
    vmsForm.validateFields().then((vals) => {
      if (editingVms) {
        setVmsServers((prev) => prev.map((v) => v.id === editingVms.id ? { ...v, ...vals } : v));
      } else {
        setVmsServers((prev) => [...prev, {
          id: `vms-${Date.now()}`, status: 'disconnected', cameraCount: 0, ...vals,
        }]);
      }
      setVmsModal(false);
    });
  };

  /* ── 가져오기 열기 ── */
  const openImport = (vmsId: string) => {
    setImportVmsId(vmsId);
    setImportLoading(true);
    setImportDiscovered([]);
    setImportSelected([]);
    setImportModal(true);
    setTimeout(() => {
      setImportDiscovered(VMS_DISCOVERED[vmsId] ?? []);
      setImportLoading(false);
    }, 1200);
  };

  /* ── 가져오기 확인 ── */
  const confirmImport = () => {
    const toAdd = importDiscovered
      .filter((c) => importSelected.includes(c.id))
      .filter((c) => !cameras.some((existing) => existing.channelId === c.channelId));
    setCameras((prev) => [...prev, ...toAdd]);
    const vms = vmsServers.find((v) => v.id === importVmsId);
    if (vms) {
      setVmsServers((prev) => prev.map((v) =>
        v.id === importVmsId ? { ...v, cameraCount: v.cameraCount + toAdd.length } : v
      ));
    }
    setImportModal(false);
  };

  /* ── 카메라 수동 저장 ── */
  const saveCam = () => {
    camForm.validateFields().then((vals) => {
      if (editingCam) {
        setCameras((prev) => prev.map((c) => c.id === editingCam.id ? { ...c, ...vals } : c));
      } else {
        setCameras((prev) => [...prev, {
          id: `cam-${Date.now()}`, vmsName: '수동', source: 'manual', ...vals,
        }]);
      }
      setCamModal(false);
    });
  };

  /* ── VMS 서버 컬럼 ── */
  const vmsColumns: ColumnsType<VmsServer> = [
    {
      title: '상태', dataIndex: 'status', width: 90,
      render: (v: VmsServer['status']) => (
        v === 'testing'
          ? <Tag icon={<LoadingOutlined />} color="processing">확인 중</Tag>
          : v === 'connected'
            ? <Tag icon={<CheckCircleOutlined />} color="success">연결됨</Tag>
            : <Tag icon={<CloseCircleOutlined />} color="error">끊김</Tag>
      ),
    },
    { title: 'VMS 이름', dataIndex: 'name', render: (v: string) => <b style={{ color: '#e2e8f0' }}>{v}</b> },
    { title: 'URL', dataIndex: 'url', ellipsis: true },
    { title: 'MediaMTX URL', dataIndex: 'mediaMtxUrl', ellipsis: true },
    { title: '카메라', dataIndex: 'cameraCount', width: 80,
      render: (v: number) => <Tag color="blue">{v}대</Tag> },
    {
      title: '액션', width: 220,
      render: (_: unknown, r: VmsServer) => (
        <Space size={4}>
          <Tooltip title="카메라 목록 가져오기">
            <Button
              size="small" type="primary" ghost
              icon={<CloudDownloadOutlined />}
              disabled={r.status !== 'connected'}
              onClick={() => openImport(r.id)}
            >
              가져오기
            </Button>
          </Tooltip>
          <Button size="small" icon={<ApiOutlined />}
            loading={r.status === 'testing'}
            onClick={() => testVms(r.id)}>
            연결 테스트
          </Button>
          <Button size="small" icon={<EditOutlined />}
            onClick={() => { setEditingVms(r); vmsForm.setFieldsValue(r); setVmsModal(true); }} />
          <Button size="small" danger icon={<DeleteOutlined />}
            onClick={() => Modal.confirm({
              title: `'${r.name}' 삭제?`,
              content: '연결된 카메라 정보는 유지됩니다.',
              okType: 'danger',
              onOk: () => setVmsServers((prev) => prev.filter((v) => v.id !== r.id)),
            })} />
        </Space>
      ),
    },
  ];

  /* ── 카메라 컬럼 ── */
  const camColumns: ColumnsType<CameraRow> = [
    { title: '채널 ID', dataIndex: 'channelId', width: 110 },
    { title: '카메라 이름', dataIndex: 'cameraName',
      render: (v: string) => <span style={{ color: '#e2e8f0' }}>{v}</span> },
    { title: 'RTSP URL', dataIndex: 'rtspUrl', ellipsis: true },
    { title: 'PTZ', dataIndex: 'supportsPtz', width: 60,
      render: (v: boolean) => v
        ? <Tag color="green" style={{ fontSize: 10 }}>PTZ</Tag>
        : <span style={{ color: '#475569', fontSize: 11 }}>-</span> },
    {
      title: '출처', dataIndex: 'source', width: 90,
      render: (v: string, r: CameraRow) => v === 'manual'
        ? <Tag color="purple">수동</Tag>
        : <Tag color="blue">{r.vmsName}</Tag>,
    },
    {
      title: '액션', width: 90,
      render: (_: unknown, r: CameraRow) => (
        <Space size={4}>
          <Button size="small" icon={<EditOutlined />}
            onClick={() => { setEditingCam(r); camForm.setFieldsValue(r); setCamModal(true); }} />
          <Button size="small" danger icon={<DeleteOutlined />}
            onClick={() => Modal.confirm({
              title: '카메라 삭제?', okType: 'danger',
              onOk: () => setCameras((prev) => prev.filter((c) => c.id !== r.id)),
            })} />
        </Space>
      ),
    },
  ];

  /* ── 가져오기 모달 컬럼 ── */
  const importColumns: ColumnsType<CameraRow> = [
    { title: '채널', dataIndex: 'channelId', width: 90 },
    { title: '이름', dataIndex: 'cameraName' },
    { title: 'RTSP URL', dataIndex: 'rtspUrl', ellipsis: true },
    { title: 'PTZ', dataIndex: 'supportsPtz', width: 60,
      render: (v: boolean) => v ? <Tag color="green" style={{ fontSize: 10 }}>PTZ</Tag> : '-' },
    {
      title: '상태', width: 80,
      render: (_: unknown, r: CameraRow) => cameras.some((c) => c.channelId === r.channelId)
        ? <Tag color="default" style={{ fontSize: 10 }}>등록됨</Tag>
        : <Tag color="blue" style={{ fontSize: 10 }}>신규</Tag>,
    },
  ];

  /* ── 렌더 ── */
  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }}>

      {/* ── STEP 1: VMS 서버 ── */}
      <Panel>
        <SectionTitle
          icon={<ApiOutlined />}
          extra={
            <Button
              type="primary" size="small" icon={<PlusOutlined />}
              onClick={() => { setEditingVms(null); vmsForm.resetFields(); setVmsModal(true); }}
            >
              VMS 등록
            </Button>
          }
        >
          VMS 서버 관리
        </SectionTitle>

        {vmsServers.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 0', color: '#475569',
            border: '1px dashed #1E3A5F', borderRadius: 6,
          }}>
            <ApiOutlined style={{ fontSize: 32, marginBottom: 8, display: 'block' }} />
            <div>등록된 VMS 서버가 없습니다.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>VMS를 먼저 등록하면 카메라 목록을 자동으로 가져올 수 있습니다.</div>
            <Button type="primary" style={{ marginTop: 12 }} icon={<PlusOutlined />}
              onClick={() => { setEditingVms(null); vmsForm.resetFields(); setVmsModal(true); }}>
              VMS 등록
            </Button>
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={vmsServers}
            columns={vmsColumns}
            size="small"
            pagination={false}
            className="stats-table"
          />
        )}
      </Panel>

      {/* ── STEP 2: 카메라 목록 ── */}
      <Panel>
        <SectionTitle
          icon={<CameraOutlined />}
          extra={
            <Space size={6}>
              <span style={{ fontSize: 11, color: '#475569' }}>총 {cameras.length}대</span>
              <Button
                size="small" icon={<PlusOutlined />}
                onClick={() => { setEditingCam(null); camForm.resetFields(); setCamModal(true); }}
              >
                수동 추가
              </Button>
            </Space>
          }
        >
          카메라 목록
        </SectionTitle>

        {cameras.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '24px 0', color: '#475569',
            border: '1px dashed #1E3A5F', borderRadius: 6,
          }}>
            <CameraOutlined style={{ fontSize: 28, marginBottom: 8, display: 'block' }} />
            <div>등록된 카메라가 없습니다.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>VMS에서 가져오거나 수동으로 추가하세요.</div>
          </div>
        ) : (
          <Table
            rowKey="id"
            dataSource={cameras}
            columns={camColumns}
            size="small"
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `총 ${t}대` }}
            className="stats-table"
          />
        )}
      </Panel>

      {/* ══ VMS 등록/수정 모달 ══ */}
      <Modal
        open={vmsModal}
        onCancel={() => setVmsModal(false)}
        onOk={saveVms}
        title={editingVms ? 'VMS 서버 편집' : 'VMS 서버 등록'}
        okText="저장" cancelText="취소"
        width={520}
      >
        <Form form={vmsForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="VMS 이름" rules={[{ required: true, message: 'VMS 이름을 입력하세요' }]}>
            <Input placeholder="예: Main VMS" />
          </Form.Item>
          <Form.Item name="url" label="VMS API URL" rules={[{ required: true }]}>
            <Input placeholder="http://192.168.1.100:8080" />
          </Form.Item>
          <Form.Item name="mediaMtxUrl" label="MediaMTX URL">
            <Input placeholder="http://192.168.1.100:8889" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="username" label="사용자명" style={{ flex: 1 }}>
              <Input placeholder="admin" />
            </Form.Item>
            <Form.Item name="password" label="비밀번호" style={{ flex: 1 }}>
              <Input.Password placeholder="비밀번호" />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* ══ 카메라 가져오기 모달 ══ */}
      <Modal
        open={importModal}
        onCancel={() => setImportModal(false)}
        onOk={confirmImport}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloudDownloadOutlined style={{ color: '#2563EB' }} />
            VMS에서 카메라 가져오기
            <Badge
              count={importSelected.filter((id) => !cameras.some((c) =>
                importDiscovered.find((d) => d.id === id)?.channelId === c.channelId
              )).length}
              style={{ background: '#2563EB' }}
            />
          </div>
        }
        okText={`${importSelected.length}대 가져오기`}
        cancelText="취소"
        width={680}
        okButtonProps={{ disabled: importSelected.length === 0 }}
      >
        {importLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569' }}>
            <LoadingOutlined style={{ fontSize: 28, color: '#2563EB', marginBottom: 10, display: 'block' }} />
            VMS에서 카메라 목록을 가져오는 중...
          </div>
        ) : (
          <>
            <div style={{
              padding: '8px 12px', marginBottom: 12,
              background: '#070F24', borderRadius: 6, border: '1px solid #1E3A5F',
              fontSize: 12, color: '#64748b',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <WarningOutlined style={{ color: '#CA8A04' }} />
              이미 등록된 카메라는 가져오기에서 제외됩니다. 체크박스로 원하는 카메라를 선택하세요.
            </div>
            <Table
              rowKey="id"
              dataSource={importDiscovered}
              columns={importColumns}
              size="small"
              pagination={false}
              className="stats-table"
              rowSelection={{
                selectedRowKeys: importSelected,
                onChange: (keys) => setImportSelected(keys as string[]),
                getCheckboxProps: (r) => ({
                  disabled: cameras.some((c) => c.channelId === r.channelId),
                }),
              }}
            />
          </>
        )}
      </Modal>

      {/* ══ 카메라 수동 추가/편집 모달 ══ */}
      <Modal
        open={camModal}
        onCancel={() => setCamModal(false)}
        onOk={saveCam}
        title={editingCam ? '카메라 편집' : '카메라 수동 추가'}
        okText="저장" cancelText="취소"
        width={520}
      >
        <Form form={camForm} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="channelId" label="채널 ID" style={{ flex: 1 }} rules={[{ required: true }]}>
              <Input placeholder="예: CAM-A-01" />
            </Form.Item>
            <Form.Item name="cameraName" label="카메라 이름" style={{ flex: 2 }} rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="rtspUrl" label="RTSP URL" rules={[{ required: true }]}>
            <Input placeholder="rtsp://192.168.1.201/stream" />
          </Form.Item>
          <Form.Item name="supportsPtz" label="PTZ 지원" valuePropName="checked">
            <Switch />
          </Form.Item>
          <div style={{
            background: '#070F24', border: '1px solid #1E3A5F',
            borderRadius: 6, padding: 12, marginTop: 4,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12, color: '#64748b' }}>
              ONVIF 설정 (PTZ 카메라)
            </div>
            <Space style={{ width: '100%' }} size="middle">
              <Form.Item label="ONVIF IP" style={{ flex: 1, margin: 0 }}>
                <Input placeholder="192.168.1.201" />
              </Form.Item>
              <Form.Item label="Port" style={{ width: 90, margin: 0 }}>
                <InputNumber defaultValue={80} style={{ width: '100%' }} />
              </Form.Item>
            </Space>
            <Space style={{ width: '100%', marginTop: 8 }} size="middle">
              <Form.Item label="사용자명" style={{ flex: 1, margin: 0 }}>
                <Input placeholder="admin" />
              </Form.Item>
              <Form.Item label="비밀번호" style={{ flex: 1, margin: 0 }}>
                <Input.Password />
              </Form.Item>
            </Space>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default VmsPage;
