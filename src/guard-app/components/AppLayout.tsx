import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Badge, Button, ConfigProvider, Dropdown, Menu, theme, Tooltip } from 'antd';
import {
  MonitorOutlined, BellOutlined, BarChartOutlined,
  UserOutlined, LogoutOutlined, SettingOutlined, WifiOutlined,
  VideoCameraOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useAlarmStore, useAuthStore, processAlarmEvent } from '../stores';
import AimGuardLogo from './AimGuardLogo';

const MENU_ITEMS = [
  { key: '/monitor',              icon: <MonitorOutlined />,     label: 'Map 기반 모니터링' },
  { key: '/cctv',                 icon: <VideoCameraOutlined />, label: '영상모니터링' },
  { key: '/events',               icon: <BellOutlined />,        label: '이벤트' },
  { key: '/stats',                icon: <BarChartOutlined />,    label: '통계' },
  { type: 'divider' as const },
  { key: '/admin/event-rules',    icon: <ThunderboltOutlined />, label: '이벤트 규칙' },
  { key: '/admin/settings',       icon: <SettingOutlined />,     label: '설정' },
];

const AIM_DARK_THEME = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#2563EB',
    colorBgBase: '#070F24',
    colorBgContainer: '#0C1733',
    colorBgElevated: '#0F1E3D',
    colorBorder: '#1E3A5F',
    colorText: '#e2e8f0',
    colorTextSecondary: '#94a3b8',
    borderRadius: 6,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif",
  },
};

const AppLayout: React.FC = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const alarms     = useAlarmStore((s) => s.alarms);
  const { user, logout } = useAuthStore();
  const unacked    = alarms.length;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* ── 이벤트 엔진: 새 알람 발생 시 EventRule 매칭 실행 ── */
  const prevLenRef = useRef(alarms.length);
  useEffect(() => {
    if (alarms.length > prevLenRef.current) {
      processAlarmEvent(alarms[0]);
    }
    prevLenRef.current = alarms.length;
  }, [alarms]);

  const adminPaths = ['/admin/event-rules', '/admin/settings', '/admin/maps',
                      '/admin/zones', '/admin/devices', '/admin/vms', '/admin/users'];
  const selectedKey = adminPaths.includes(location.pathname)
    ? location.pathname
    : location.pathname;

  return (
    <ConfigProvider theme={AIM_DARK_THEME}>
      <div className="app-layout">

        {/* ── Header ── */}
        <header className="app-header">
          <div className="header-brand" onClick={() => navigate('/monitor')}
            style={{ cursor: 'pointer' }}>
            <AimGuardLogo size={32} />
            <div className="header-brand-text">
              <span className="header-brand-product">
                <span>AIM</span>&nbsp;GUARD
              </span>
            </div>
          </div>

          <span className="header-subtitle">통합 보안 모니터링 시스템</span>

          <div className="header-spacer" />

          <Tooltip title={`미확인 알람 ${unacked}건`}>
            <Badge count={unacked} overflowCount={99}
              styles={{ indicator: { background: '#DC2626', boxShadow: '0 0 6px #DC2626' } }}>
              <Button
                type="text"
                icon={<BellOutlined />}
                style={{ color: unacked > 0 ? '#FCA5A5' : '#94a3b8' }}
                onClick={() => navigate('/events?ackStatus=UNACKED')}
              />
            </Badge>
          </Tooltip>

          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <SettingOutlined />, label: '내 정보' },
                { type: 'divider' },
                {
                  key: 'logout', icon: <LogoutOutlined />, label: '로그아웃',
                  onClick: () => { logout(); navigate('/login'); },
                },
              ],
            }}
          >
            <Button type="text" icon={<UserOutlined />} style={{ color: '#94a3b8' }}>
              {user?.name ?? '사용자'}
            </Button>
          </Dropdown>
        </header>

        <div className="app-body">
          {/* ── Sidebar ── */}
          <aside style={{
            width: sidebarOpen ? 200 : 56,
            flexShrink: 0,
            background: '#0C1733',
            borderRight: '1px solid #1E3A5F',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.22s ease',
          }}>
            {/* 로고 영역 */}
            <div className="sidebar-logo-area" style={{
              justifyContent: sidebarOpen ? 'space-between' : 'center',
              padding: sidebarOpen ? '0 16px' : '0',
            }}>
              {sidebarOpen && <span>모니터링 시스템</span>}
              <Tooltip title={sidebarOpen ? '메뉴 접기' : '메뉴 펼치기'}>
                <Button
                  type="text"
                  size="small"
                  icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                  onClick={() => setSidebarOpen((v) => !v)}
                  style={{ color: '#94a3b8', padding: '0 4px', height: 20, minWidth: 20 }}
                />
              </Tooltip>
            </div>

            {/* 메뉴 */}
            {sidebarOpen ? (
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={({ key }) => navigate(key)}
                style={{ flex: 1, borderRight: 0, background: 'transparent', minWidth: 0 }}
                items={MENU_ITEMS.map((item) => {
                  if (item.type === 'divider') return { type: 'divider' };
                  return { key: item.key, icon: item.icon, label: item.label };
                })}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                {MENU_ITEMS.map((item, idx) => {
                  if (item.type === 'divider') {
                    return <div key={idx} style={{ height: 1, background: '#1E3A5F', margin: '4px 10px' }} />;
                  }
                  const active = selectedKey === item.key;
                  return (
                    <Tooltip key={item.key} title={item.label} placement="right">
                      <div
                        onClick={() => navigate(item.key!)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          height: 40, margin: '2px 9px', borderRadius: 8, cursor: 'pointer',
                          background: active ? 'rgba(37,99,235,0.22)' : 'transparent',
                          boxShadow: active ? '0 0 0 1px rgba(37,99,235,0.55)' : 'none',
                          color: active ? '#60A5FA' : '#64748b',
                          fontSize: 16,
                          transition: 'background 0.15s, color 0.15s',
                          filter: active ? 'drop-shadow(0 0 4px rgba(96,165,250,0.6))' : 'none',
                        }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'rgba(37,99,235,0.10)'; }}
                        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                      >
                        {item.icon}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            )}

            {/* 버전 */}
            {sidebarOpen && (
              <div style={{
                height: 38, flexShrink: 0,
                display: 'flex', alignItems: 'center',
                padding: '0 16px', fontSize: 10, color: '#64748b',
                borderTop: '1px solid #1E3A5F', letterSpacing: 1,
                whiteSpace: 'nowrap',
              }}>
                AIM GUARD v1.0.0-mockup
              </div>
            )}
          </aside>

          {/* ── Content ── */}
          <main className="app-content">
            <Outlet />
          </main>
        </div>

        {/* ── StatusBar ── */}
        <footer className="app-status-bar">
          <span>
            <span className="live-dot" style={{ background: '#16A34A' }} />
            Senstar-1F: 연결
          </span>
          <span>
            <span className="live-dot" style={{ background: '#16A34A' }} />
            ADAM-1F: 연결
          </span>
          <span>
            <span className="live-dot" style={{ background: '#DC2626', animationDuration: '.6s' }} />
            출입-A: 끊김
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
            <WifiOutlined style={{ color: '#60A5FA' }} />
            WS:&nbsp;
            <span style={{ color: '#16A34A' }}>● 연결됨</span>
          </span>
          <span style={{ color: '#60A5FA' }}>
            {new Date().toLocaleTimeString('ko-KR')}
          </span>
        </footer>
      </div>
    </ConfigProvider>
  );
};

export default AppLayout;
