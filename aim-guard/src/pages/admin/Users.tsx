import React, { useState } from 'react';
import {
  Button, Form, Input, Modal, Select, Space, Switch, Table, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MOCK_USERS } from '../../mock/data';
import type { UserRole } from '../../mock/data';
import { useAuthStore } from '../../stores';

type UserRow = typeof MOCK_USERS[0];

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'red',
  OPERATOR: 'blue',
  VIEWER: 'default',
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: '관리자',
  OPERATOR: '운영자',
  VIEWER: '뷰어',
};

const PERMISSION_MATRIX: { feature: string; ADMIN: boolean; OPERATOR: boolean; VIEWER: boolean }[] = [
  { feature: '모니터링 화면',     ADMIN: true, OPERATOR: true,  VIEWER: true  },
  { feature: '이벤트 알람 확인',  ADMIN: true, OPERATOR: true,  VIEWER: false },
  { feature: '이벤트 목록 조회',  ADMIN: true, OPERATOR: true,  VIEWER: true  },
  { feature: '통계 대시보드',      ADMIN: true, OPERATOR: true,  VIEWER: true  },
  { feature: 'CCTV 영상 팝업',    ADMIN: true, OPERATOR: true,  VIEWER: false },
  { feature: 'PTZ 제어',          ADMIN: true, OPERATOR: true,  VIEWER: false },
  { feature: '맵/Zone 편집',      ADMIN: true, OPERATOR: false, VIEWER: false },
  { feature: '장비 관리',          ADMIN: true, OPERATOR: false, VIEWER: false },
  { feature: '사용자 관리',        ADMIN: true, OPERATOR: false, VIEWER: false },
];

const UsersPage: React.FC = () => {
  const currentUser   = useAuthStore((s) => s.user);
  const isAdmin       = currentUser?.role === 'ADMIN';

  const [users, setUsers]         = useState<UserRow[]>(MOCK_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<UserRow | null>(null);
  const [pwModal, setPwModal]     = useState<UserRow | null>(null);
  const [form]                    = Form.useForm();
  const [pwForm]                  = Form.useForm();
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (row: UserRow) => {
    setEditing(row);
    form.setFieldsValue(row);
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editing.id ? { ...u, ...values } : u))
        );
      } else {
        setUsers((prev) => [...prev, { id: `u-${Date.now()}`, active: true, ...values }]);
      }
      setModalOpen(false);
    });
  };

  const columns: ColumnsType<UserRow> = [
    { title: '이름', dataIndex: 'name', width: 100 },
    { title: '아이디', dataIndex: 'username', width: 120 },
    { title: '이메일', dataIndex: 'email', ellipsis: true },
    { title: '역할', dataIndex: 'role', width: 100,
      render: (v: UserRole) => (
        <Tag color={ROLE_COLORS[v]}>{ROLE_LABELS[v]}</Tag>
      ) },
    { title: '활성', dataIndex: 'active', width: 70,
      render: (v: boolean) => <Switch checked={v} size="small" disabled /> },
    { title: '액션', width: 160,
      render: (_: unknown, r: UserRow) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}
            disabled={!isAdmin} onClick={() => openEdit(r)} />
          <Button size="small" icon={<KeyOutlined />}
            disabled={!isAdmin}
            onClick={() => { setPwModal(r); pwForm.resetFields(); }}
          />
          <Button size="small" danger icon={<DeleteOutlined />}
            disabled={!isAdmin || r.id === currentUser?.id}
            onClick={() =>
              Modal.confirm({
                title: '사용자 삭제?', okType: 'danger',
                onOk: () => setUsers((prev) => prev.filter((u) => u.id !== r.id)),
              })
            }
          />
        </Space>
      ) },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <span className="page-title">사용자 관리</span>
        <Button type="primary" icon={<PlusOutlined />}
          disabled={!isAdmin} onClick={openCreate}>
          사용자 추가
        </Button>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
        {([['users', '사용자 목록'], ['permissions', '권한 매트릭스']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '8px 16px', borderBottom: `2px solid ${activeTab === key ? '#1677ff' : 'transparent'}`,
              color: activeTab === key ? '#1677ff' : '#595959', fontWeight: activeTab === key ? 600 : 400,
              fontSize: 14,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'users' ? (
        <Table rowKey="id" dataSource={users} columns={columns} size="small" pagination={false} />
      ) : (
        <Table
          rowKey="feature"
          dataSource={PERMISSION_MATRIX}
          size="small"
          pagination={false}
          columns={[
            { title: '기능', dataIndex: 'feature', width: 200 },
            { title: 'ADMIN',    dataIndex: 'ADMIN',    width: 100,
              render: (v: boolean) => v ? '✅' : '❌' },
            { title: 'OPERATOR', dataIndex: 'OPERATOR', width: 100,
              render: (v: boolean) => v ? '✅' : '❌' },
            { title: 'VIEWER',   dataIndex: 'VIEWER',   width: 100,
              render: (v: boolean) => v ? '✅' : '❌' },
          ]}
        />
      )}

      {/* 사용자 생성/편집 모달 */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        title={editing ? '사용자 편집' : '사용자 추가'}
        okText="저장"
        cancelText="취소"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="name" label="이름" style={{ flex: 1 }}
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="username" label="아이디" style={{ flex: 1 }}
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Space>
          <Form.Item name="email" label="이메일"
            rules={[{ required: true }, { type: 'email', message: '이메일 형식' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="역할" initialValue="VIEWER">
            <Select options={[
              { label: '관리자 (ADMIN)', value: 'ADMIN' },
              { label: '운영자 (OPERATOR)', value: 'OPERATOR' },
              { label: '뷰어 (VIEWER)', value: 'VIEWER' },
            ]} />
          </Form.Item>
          {!editing && (
            <Form.Item name="password" label="초기 비밀번호"
              rules={[{ required: true, min: 8, message: '8자 이상' }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="active" label="활성화" valuePropName="checked" initialValue>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 비밀번호 초기화 모달 */}
      <Modal
        open={!!pwModal}
        onCancel={() => setPwModal(null)}
        onOk={() => { setPwModal(null); Modal.success({ content: '비밀번호가 초기화되었습니다.' }); }}
        title={`비밀번호 초기화 — ${pwModal?.name}`}
        okText="초기화"
        cancelText="취소"
      >
        <Form form={pwForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="newPassword" label="새 비밀번호"
            rules={[{ required: true, min: 8, message: '8자 이상' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirm" label="비밀번호 확인"
            dependencies={['newPassword']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
                },
              }),
            ]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
