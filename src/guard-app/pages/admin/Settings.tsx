import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import {
  PictureOutlined, EditOutlined, ApiOutlined,
  VideoCameraOutlined, UserOutlined,
} from '@ant-design/icons';
import MapsPage    from './Maps';
import ZonesPage   from './Zones';
import DevicesPage from './Devices';
import VmsPage     from './Vms';
import UsersPage   from './Users';

const TAB_KEYS = ['maps', 'zones', 'devices', 'vms', 'users'] as const;
type TabKey = typeof TAB_KEYS[number];

const TAB_ITEMS = [
  { key: 'maps',    label: '맵 관리',   icon: <PictureOutlined />,     children: <MapsPage /> },
  { key: 'zones',   label: 'Zone 편집', icon: <EditOutlined />,        children: <ZonesPage /> },
  { key: 'devices', label: '장비 관리', icon: <ApiOutlined />,         children: <DevicesPage /> },
  { key: 'vms',     label: 'VMS/CCTV', icon: <VideoCameraOutlined />, children: <VmsPage /> },
  { key: 'users',   label: '사용자',    icon: <UserOutlined />,        children: <UsersPage /> },
];

const SettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = tabParam && TAB_KEYS.includes(tabParam) ? tabParam : 'maps';

  useEffect(() => {
    if (!tabParam || !TAB_KEYS.includes(tabParam as TabKey)) {
      navigate('/admin/settings?tab=maps', { replace: true });
    }
  }, [tabParam, navigate]);

  const handleTabChange = (key: string) => {
    navigate(`/admin/settings?tab=${key}`);
  };

  return (
    <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Tabs
        className="settings-tabs"
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        items={TAB_ITEMS.map(({ key, label, icon, children }) => ({
          key,
          label: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {icon}
              {label}
            </span>
          ),
          children,
        }))}
      />
    </div>
  );
};

export default SettingsPage;
