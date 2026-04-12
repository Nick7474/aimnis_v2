import React, { useState } from 'react';
import {
  Button, Form, Input, Modal, Radio, Space, Switch, Table, Tag, Upload,
} from 'antd';
import {
  PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload';
import { MOCK_MAPS } from '../../mock/data';

type MapRow = typeof MOCK_MAPS[0];

/* ── 이미지 미리보기 + 크기 감지 컴포넌트 ── */
const ImageUploadPreview: React.FC<{
  value?: string;
  onChange?: (url: string, w: number, h: number) => void;
}> = ({ value, onChange }) => {
  const [previewUrl, setPreviewUrl] = useState<string>(value ?? '');

  const handleFileChange = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPreviewUrl(url);
      onChange?.(url, img.naturalWidth, img.naturalHeight);
    };
    img.src = url;
    return false; // antd Upload의 자동 업로드 방지
  };

  return (
    <div>
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={(file) => { handleFileChange(file); return false; }}
      >
        <Button icon={<UploadOutlined />}>파일 선택</Button>
      </Upload>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, marginBottom: 8 }}>
        권장 해상도: 1920×1440 이상 / PNG, JPG
      </div>

      {previewUrl ? (
        <div style={{
          border: '1px solid #1E3A5F', borderRadius: 6, overflow: 'hidden',
          background: '#030810', marginTop: 4,
          maxHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img
            src={previewUrl}
            alt="미리보기"
            style={{ maxWidth: '100%', maxHeight: 260, objectFit: 'contain', display: 'block' }}
          />
        </div>
      ) : (
        <div style={{
          border: '1px dashed #1E3A5F', borderRadius: 6,
          background: '#070F24', height: 120,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8, color: '#334155',
        }}>
          <PictureOutlined style={{ fontSize: 28 }} />
          <span style={{ fontSize: 11 }}>이미지를 선택하면 미리보기가 표시됩니다</span>
        </div>
      )}
    </div>
  );
};

/* ── 메인 페이지 ── */
const MapsPage: React.FC = () => {
  const [maps, setMaps]           = useState<MapRow[]>(MOCK_MAPS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<MapRow | null>(null);
  const [form]                    = Form.useForm();
  const [mapType, setMapType]     = useState<'IMAGE' | 'NAVER'>('IMAGE');
  const [imgMeta, setImgMeta]     = useState<{ url: string; w: number; h: number } | null>(null);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setMapType('IMAGE');
    setImgMeta(null);
    setModalOpen(true);
  };

  const openEdit = (row: MapRow) => {
    setEditing(row);
    form.setFieldsValue(row);
    setMapType(row.mapType as 'IMAGE' | 'NAVER');
    setImgMeta(row.imageUrl ? { url: row.imageUrl, w: row.imageWidth, h: row.imageHeight } : null);
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const imageUrl    = imgMeta?.url    ?? editing?.imageUrl    ?? '';
      const imageWidth  = imgMeta?.w      ?? editing?.imageWidth  ?? 0;
      const imageHeight = imgMeta?.h      ?? editing?.imageHeight ?? 0;

      if (editing) {
        setMaps((prev) =>
          prev.map((m) => m.id === editing.id
            ? { ...m, ...values, mapType, imageUrl, imageWidth, imageHeight }
            : m
          )
        );
      } else {
        setMaps((prev) => [
          ...prev,
          {
            id: `map-${Date.now()}`,
            ...values, mapType, imageUrl, imageWidth, imageHeight,
            zoneCount: 0, isDefault: false,
          },
        ]);
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '맵을 삭제하시겠습니까?',
      content: '삭제된 맵의 Zone 데이터도 함께 삭제됩니다.',
      okType: 'danger',
      onOk: () => setMaps((prev) => prev.filter((m) => m.id !== id)),
    });
  };

  const columns: ColumnsType<MapRow> = [
    {
      title: '미리보기', key: 'preview', width: 80,
      render: (_: unknown, r: MapRow) => r.imageUrl ? (
        <img
          src={r.imageUrl}
          alt={r.mapName}
          style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 3,
                    border: '1px solid #1E3A5F', background: '#030810' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div style={{ width: 60, height: 40, borderRadius: 3,
                       border: '1px dashed #1E3A5F', background: '#070F24',
                       display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PictureOutlined style={{ color: '#334155', fontSize: 14 }} />
        </div>
      ),
    },
    { title: '맵 이름', dataIndex: 'mapName', key: 'mapName' },
    { title: '종류', dataIndex: 'mapType', key: 'mapType',
      render: (v: string) => <Tag color={v === 'NAVER' ? 'geekblue' : 'default'}>{v}</Tag> },
    { title: 'Zone 수', dataIndex: 'zoneCount', key: 'zoneCount',
      render: (v: number) => <Tag color="blue">{v}</Tag> },
    { title: '해상도', key: 'resolution',
      render: (_: unknown, r: MapRow) =>
        r.imageWidth ? `${r.imageWidth} × ${r.imageHeight}` : '-' },
    { title: '기본 맵', dataIndex: 'isDefault', key: 'isDefault',
      render: (v: boolean) => <Switch checked={v} size="small" disabled /> },
    { title: '액션', key: 'action', width: 120,
      render: (_: unknown, r: MapRow) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>편집</Button>
          <Button size="small" danger icon={<DeleteOutlined />}
            onClick={() => handleDelete(r.id)}>삭제</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-title">맵 관리</span>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          맵 추가
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={maps}
        columns={columns}
        size="small"
        pagination={false}
      />

      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        title={editing ? '맵 편집' : '맵 추가'}
        okText="저장"
        cancelText="취소"
        width={540}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="mapName" label="맵 이름"
            rules={[{ required: true, message: '맵 이름을 입력하세요' }]}>
            <Input placeholder="예: 1층 평면도" />
          </Form.Item>

          <Form.Item label="맵 종류">
            <Radio.Group
              value={mapType}
              onChange={(e) => setMapType(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="IMAGE">IMAGE (도면)</Radio.Button>
              <Radio.Button value="NAVER">NAVER (GPS)</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {mapType === 'IMAGE' && (
            <Form.Item label="이미지 업로드">
              <ImageUploadPreview
                value={imgMeta?.url}
                onChange={(url, w, h) => setImgMeta({ url, w, h })}
              />
              {imgMeta && (
                <div style={{
                  marginTop: 6, fontSize: 11, color: '#4ade80',
                  display: 'flex', gap: 12,
                }}>
                  <span>✓ 이미지 로드 완료</span>
                  <span style={{ color: '#94a3b8' }}>{imgMeta.w} × {imgMeta.h} px</span>
                </div>
              )}
            </Form.Item>
          )}

          <Form.Item name="isDefault" label="기본 맵으로 설정" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MapsPage;
