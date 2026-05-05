import React, { useState } from 'react';
import {
  Button, DatePicker, Descriptions, Drawer, Input, Select, Space, Table, Tag
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_EVENTS } from '../mock/data';

const { RangePicker } = DatePicker;

type EventRow = typeof MOCK_EVENTS[0];

const EventListPage: React.FC = () => {
  const [selected, setSelected] = useState<EventRow | null>(null);
  const [filterAck, setFilterAck]           = useState<string | undefined>();
  const [search, setSearch]                 = useState('');

  const filtered = MOCK_EVENTS.filter((e) => {
    if (filterAck && e.ackStatus !== filterAck)           return false;
    if (search && !e.zoneName.includes(search) && !e.deviceName.includes(search)) return false;
    return true;
  });

  const columns: ColumnsType<EventRow> = [
    { title: '발생시간', dataIndex: 'occurredAt', width: 160 },
    { title: 'Zone', dataIndex: 'zoneName', width: 140 },
    { title: '장비',  dataIndex: 'deviceName', width: 120 },
    { title: '종류',  dataIndex: 'deviceType', width: 120,
      render: (v: string) => <Tag>{v}</Tag> },
    { title: '이벤트 타입', dataIndex: 'eventType', width: 130 },
    { title: '위치',
      render: (_, r) => r.meter != null ? `${r.meter}m ${r.side}측` : '-',
      width: 100 },
    { title: '확인 상태', dataIndex: 'ackStatus', width: 100,
      render: (v: string) => (
        <Tag color={v === 'UNACKED' ? 'red' : 'default'}>{v}</Tag>
      ) },
    { title: '액션', width: 80,
      render: (_, r) => (
        <Button size="small" onClick={() => setSelected(r)}>상세</Button>
      ) },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-title">이벤트 목록</span>
        <Space>
          <Button icon={<ReloadOutlined />}>새로고침</Button>
          <Button type="primary">CSV 내보내기</Button>
        </Space>
      </div>

      {/* 필터 영역 */}
      <Space wrap style={{ marginBottom: 16 }}>
        <RangePicker showTime
          style={{ borderColor: 'var(--guard-color-border)' }}
          placeholder={['시작일', '종료일']}
        />
        <Select
          placeholder="확인 상태"
          allowClear
          style={{ width: 130 }}
          value={filterAck}
          onChange={setFilterAck}
          options={[
            { label: '미확인', value: 'UNACKED' },
            { label: '확인됨', value: 'ACKED'   },
          ]}
        />
        <Select
          placeholder="장비 종류"
          allowClear
          style={{ width: 150 }}
          options={[
            { label: 'PERIMETER',       value: 'PERIMETER'       },
            { label: 'IO_MODULE',       value: 'IO_MODULE'       },
            { label: 'ACCESS_CONTROL',  value: 'ACCESS_CONTROL'  },
          ]}
        />
        <Input
          placeholder="Zone / 장비명 검색"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
      </Space>

      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `총 ${t}건` }}
        rowClassName={(r) => r.ackStatus === 'UNACKED' ? 'ant-table-row-unacked' : ''}
        onRow={(r) => ({ onClick: () => setSelected(r) })}
      />

      {/* 이벤트 상세 Drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="이벤트 상세"
        width={480}
      >
        {selected && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="이벤트 ID">{selected.id}</Descriptions.Item>
              <Descriptions.Item label="발생시간">{selected.occurredAt}</Descriptions.Item>
              <Descriptions.Item label="Zone">{selected.zoneName}</Descriptions.Item>
              <Descriptions.Item label="장비">{selected.deviceName}</Descriptions.Item>
              <Descriptions.Item label="장비 종류">{selected.deviceType}</Descriptions.Item>
              <Descriptions.Item label="이벤트 타입">{selected.eventType}</Descriptions.Item>
              {selected.meter != null && (
                <Descriptions.Item label="위치">{selected.meter}m {selected.side}측</Descriptions.Item>
              )}
              <Descriptions.Item label="확인 상태">
                <Tag color={selected.ackStatus === 'UNACKED' ? 'red' : 'default'}>
                  {selected.ackStatus}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* 연결 영상 */}
            <div style={{ marginTop: 16, fontWeight: 600, marginBottom: 8 }}>연결 영상</div>
            <div className="video-placeholder" style={{ height: 200 }}>
              <span style={{ fontSize: 32 }}>📷</span>
              <span>이벤트 전후 클립</span>
              <span style={{ fontSize: 11, color: 'var(--guard-color-text-faint)' }}>
                이벤트 발생 ±30초 구간
              </span>
              <Space>
                <Button size="small" type="primary">▶ 재생</Button>
                <Button size="small">다운로드</Button>
              </Space>
            </div>

            {/* 맵 위치 미니뷰 */}
            <div style={{ marginTop: 16, fontWeight: 600, marginBottom: 8 }}>맵 위치</div>
            <div style={{ height: 160, background: 'var(--guard-map-bg)', borderRadius: 6, display: 'flex',
                           alignItems: 'center', justifyContent: 'center', color: 'var(--guard-color-text-faint)', fontSize: 12,
                           border: '1px solid var(--guard-color-border)' }}>
              맵 위 Zone 위치 표시 (목업)
            </div>

            <Space style={{ marginTop: 16 }}>
              <Button type="primary">알람 확인 처리</Button>
              <Button>메모 추가</Button>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default EventListPage;
