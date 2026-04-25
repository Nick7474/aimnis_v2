import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Badge, Button, ConfigProvider, Dropdown, Menu, theme, Tooltip } from 'antd';
import {
  MonitorOutlined, BellOutlined, BarChartOutlined,
  UserOutlined, LogoutOutlined, SettingOutlined, WifiOutlined,
  VideoCameraOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  ThunderboltOutlined, PlusOutlined,
} from '@ant-design/icons';
import { AnimatePresence } from 'framer-motion';
import { useAlarmStore, useAuthStore, processAlarmEvent } from '../stores';
import AimGuardLogo from './AimGuardLogo';
import PageBuilder from './PageBuilder';
import { useGuardPagesStore, AVAILABLE_PAGES } from '@/store/guardPagesStore';

const ICON_COMP: Record<string, React.ReactNode> = {
  MonitorOutlined:    <MonitorOutlined />,
  VideoCameraOutlined: <VideoCameraOutlined />,
  BellOutlined:       <BellOutlined />,
  BarChartOutlined:   <BarChartOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  SettingOutlined:    <SettingOutlined />,
};

// 항상 존재하는 기본 페이지
const BASE_MENU = [
  { key: '/monitor', icon: 'MonitorOutlined', label: 'Map 기반 모니터링' },
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
  const navigate    = useNavigate();
  const location    = useLocation();
  const alarms      = useAlarmStore((s) => s.alarms);
  const { user, logout } = useAuthStore();
  const unacked     = alarms.length;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const { addedPages } = useGuardPagesStore();

  /* ── 이벤트 엔진 ── */
  const prevLenRef = useRef(alarms.length);
  useEffect(() => {
    if (alarms.length > prevLenRef.current) processAlarmEvent(alarms[0]);
    prevLenRef.current = alarms.length;
  }, [alarms]);

  // 동적 메뉴 = 기본 + 추가된 페이지 (추가 순서 유지)
  const menuItems = [
    ...BASE_MENU,
    ...addedPages.map((p) => ({ key: p.key, icon: p.icon, label: p.label })),
  ];

  // 구분선이 필요한 admin 페이지
  const adminKeys = ['/admin/event-rules', '/admin/settings'];
  const hasAdmin = menuItems.some((m) => adminKeys.includes(m.key));
  const nonAdminItems = menuItems.filter((m) => !adminKeys.includes(m.key));
  const adminItems    = menuItems.filter((m) => adminKeys.includes(m.key));

  const buildAntMenu = (items: typeof menuItems) =>
    items.map((item) => ({ key: item.key, icon: ICON_COMP[item.icon] ?? null, label: item.label }));

  const antMenuItems = [
    ...buildAntMenu(nonAdminItems),
    ...(hasAdmin ? [{ type: 'divider' as const }, ...buildAntMenu(adminItems)] : []),
  ];

  const selectedKey = location.pathname;

  return (
    <ConfigProvider theme={AIM_DARK_THEME}>
      <div className="app-layout">

        {/* ── Header ── */}
        <header className="app-header">
          <div className="header-brand" onClick={() => navigate('/monitor')} style={{ cursor: 'pointer' }}>
            <AimGuardLogo size={32} />
            <div className="header-brand-text">
              <span className="header-brand-product"><span>AIM</span>&nbsp;GUARD</span>
            </div>
          </div>

          <span className="header-subtitle">통합 보안 모니터링 시스템</span>
          <div className="header-spacer" />

          <Tooltip title={`미확인 알람 ${unacked}건`}>
            <Badge count={unacked} overflowCount={99}
              styles={{ indicator: { background: '#DC2626', boxShadow: '0 0 6px #DC2626' } }}>
              <Button type="text" icon={<BellOutlined />}
                style={{ color: unacked > 0 ? '#FCA5A5' : '#94a3b8' }}
                onClick={() => navigate('/events?ackStatus=UNACKED')} />
            </Badge>
          </Tooltip>

          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <SettingOutlined />, label: '내 정보' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: '로그아웃',
                  onClick: () => { logout(); navigate('/login'); } },
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
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', transition: 'width 0.22s ease',
          }}>
            {/* 로고 영역 */}
            <div className="sidebar-logo-area" style={{
              justifyContent: sidebarOpen ? 'space-between' : 'center',
              padding: sidebarOpen ? '0 16px' : '0',
            }}>
              {sidebarOpen && <span>모니터링 시스템</span>}
              <Tooltip title={sidebarOpen ? '메뉴 접기' : '메뉴 펼치기'}>
                <Button type="text" size="small"
                  icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                  onClick={() => setSidebarOpen((v) => !v)}
                  style={{ color: '#94a3b8', padding: '0 4px', height: 20, minWidth: 20 }} />
              </Tooltip>
            </div>

            {/* 메뉴 */}
            {sidebarOpen ? (
              <Menu
                theme="dark" mode="inline"
                selectedKeys={[selectedKey]}
                onClick={({ key }) => navigate(key)}
                style={{ flex: 1, borderRight: 0, background: 'transparent', minWidth: 0 }}
                items={antMenuItems}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                {menuItems.map((item, idx) => {
                  const isAdmin = adminKeys.includes(item.key);
                  const prevIsNonAdmin = idx > 0 && !adminKeys.includes(menuItems[idx - 1].key);
                  return (
                    <React.Fragment key={item.key}>
                      {isAdmin && prevIsNonAdmin && (
                        <div style={{ height: 1, background: '#1E3A5F', margin: '4px 10px' }} />
                      )}
                      <Tooltip title={item.label} placement="right">
                        <div
                          onClick={() => navigate(item.key)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            height: 40, margin: '2px 9px', borderRadius: 8, cursor: 'pointer',
                            background: selectedKey === item.key ? 'rgba(37,99,235,0.22)' : 'transparent',
                            color: selectedKey === item.key ? '#60A5FA' : '#64748b',
                            fontSize: 16, transition: 'background 0.15s, color 0.15s',
                          }}
                          onMouseEnter={e => { if (selectedKey !== item.key) (e.currentTarget as HTMLDivElement).style.background = 'rgba(37,99,235,0.10)'; }}
                          onMouseLeave={e => { if (selectedKey !== item.key) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                        >
                          {ICON_COMP[item.icon] ?? null}
                        </div>
                      </Tooltip>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* 페이지 추가 버튼 */}
            <div style={{
              padding: sidebarOpen ? '10px 12px' : '10px 9px',
              borderTop: '1px solid #1E3A5F', flexShrink: 0,
            }}>
              <Tooltip title={sidebarOpen ? '' : '페이지 추가'} placement="right">
                <button
                  onClick={() => setBuilderOpen(true)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: sidebarOpen ? 8 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    padding: sidebarOpen ? '8px 10px' : '8px 0',
                    borderRadius: 8, cursor: 'pointer',
                    border: '1px dashed rgba(37,99,235,0.35)',
                    background: 'rgba(37,99,235,0.06)',
                    color: '#3b82f6', fontSize: 12, fontWeight: 500,
                    transition: 'all .15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(37,99,235,0.14)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(37,99,235,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(37,99,235,0.06)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(37,99,235,0.35)';
                  }}
                >
                  <PlusOutlined style={{ fontSize: 13 }} />
                  {sidebarOpen && '페이지 추가'}
                </button>
              </Tooltip>
            </div>

            {/* 버전 */}
            {sidebarOpen && (
              <div style={{
                height: 38, flexShrink: 0,
                display: 'flex', alignItems: 'center',
                padding: '0 16px', fontSize: 10, color: '#64748b',
                borderTop: '1px solid #1E3A5F', letterSpacing: 1, whiteSpace: 'nowrap',
              }}>
                AIM GUARD v1.0.0-mockup
              </div>
            )}
          </aside>

          {/* ── Content ── */}
          <main className="app-content" style={{ position: 'relative' }}>
            <Outlet />

            {/* 페이지 추가 패널 오버레이 */}
            <AnimatePresence>
              {builderOpen && (
                <>
                  {/* 배경 딤 */}
                  <div
                    onClick={() => setBuilderOpen(false)}
                    style={{
                      position: 'fixed', inset: 0, zIndex: 999,
                      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
                    }}
                  />
                  <PageBuilder
                    onClose={() => setBuilderOpen(false)}
                    onAdded={(key) => {
                      // 추가된 페이지로 이동
                      setTimeout(() => navigate(key), 950);
                    }}
                  />
                </>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* ── StatusBar ── */}
        <footer className="app-status-bar">
          <span><span className="live-dot" style={{ background: '#16A34A' }} />Senstar-1F: 연결</span>
          <span><span className="live-dot" style={{ background: '#16A34A' }} />ADAM-1F: 연결</span>
          <span><span className="live-dot" style={{ background: '#DC2626', animationDuration: '.6s' }} />출입-A: 끊김</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
            <WifiOutlined style={{ color: '#60A5FA' }} />
            WS:&nbsp;<span style={{ color: '#16A34A' }}>● 연결됨</span>
          </span>
          <span style={{ color: '#60A5FA' }}>{new Date().toLocaleTimeString('ko-KR')}</span>
        </footer>
      </div>
    </ConfigProvider>
  );
};

export default AppLayout;
