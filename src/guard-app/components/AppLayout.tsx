import React, { useState, useEffect, useRef, useMemo, type CSSProperties } from 'react';
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
import { useEditorStore } from '@/store/editorStore';
import { brandToAntToken, brandToCssVars, type BrandSettings } from '@/lib/brandPresets';

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

function buildGuardTheme(brand: BrandSettings) {
  return {
    algorithm: theme.darkAlgorithm,
    token: brandToAntToken(brand),
  };
}

function renderProductName(productName: string, primaryColor: string) {
  const [first, ...rest] = productName.split(' ');
  if (!first) return null;
  return (
    <>
      <span style={{ color: primaryColor }}>{first}</span>
      {rest.length > 0 ? ` ${rest.join(' ')}` : null}
    </>
  );
}

const AppLayout: React.FC = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const alarms      = useAlarmStore((s) => s.alarms);
  const { user, logout } = useAuthStore();
  const unacked     = alarms.length;
  const brand       = useEditorStore((s) => s.brand);
  const sectionStyles = useEditorStore((s) => s.sectionStyles);
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
  const guardTheme = useMemo(() => buildGuardTheme(brand), [brand]);
  const guardVars = brandToCssVars(brand) as CSSProperties;

  // sectionStyles 오버라이드 — 에디터에서 변경한 섹션별 색상을 실제 뷰에 반영
  const headerStyle  = sectionStyles.header   ?? {};
  const sidebarStyle = sectionStyles.sidebar  ?? {};
  const alarmStyle   = sectionStyles['alarm-panel'] ?? {};

  const headerInlineStyle: CSSProperties = {
    ...(headerStyle.surfaceColor  && { background: headerStyle.surfaceColor }),
    ...(headerStyle.borderColor   && { borderBottomColor: headerStyle.borderColor }),
  };
  const sidebarInlineStyle: CSSProperties = {
    ...(sidebarStyle.surfaceColor && { background: sidebarStyle.surfaceColor }),
    ...(sidebarStyle.borderColor  && { borderRightColor: sidebarStyle.borderColor }),
  };

  return (
    <ConfigProvider theme={guardTheme}>
      <div className="app-layout" style={{ ...guardVars, background: 'var(--guard-color-bg)', fontFamily: 'var(--guard-font-family)' }}>

        {/* ── Header ── */}
        <header className="app-header" style={headerInlineStyle}>
          <div className="header-brand" onClick={() => navigate('/monitor')} style={{ cursor: 'pointer' }}>
            <AimGuardLogo size={brand.logoSize} src={brand.logoUrl} alt={`${brand.tenantName} logo`} />
            <div className="header-brand-text">
              <span className="header-brand-product">{renderProductName(brand.productName, brand.primaryColor)}</span>
            </div>
          </div>

          <span className="header-subtitle">{brand.serviceName}</span>
          <div className="header-spacer" />

          <Tooltip title={`미확인 알람 ${unacked}건`}>
            <Badge count={unacked} overflowCount={99}
              styles={{ indicator: { background: 'var(--guard-color-danger)', boxShadow: '0 0 6px var(--guard-color-danger)' } }}>
              <Button type="text" icon={<BellOutlined />}
                style={{ color: unacked > 0 ? 'var(--guard-color-danger)' : 'var(--guard-color-text-soft)' }}
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
            <Button type="text" icon={<UserOutlined />} style={{ color: 'var(--guard-color-text-soft)' }}>
              {user?.name ?? '사용자'}
            </Button>
          </Dropdown>
        </header>

        <div className="app-body">
          {/* ── Sidebar ── */}
          <aside style={{
            width: sidebarOpen ? 200 : 56,
            flexShrink: 0,
            background: sidebarStyle.surfaceColor ?? 'var(--guard-color-surface)',
            borderRight: `1px solid ${sidebarStyle.borderColor ?? 'var(--guard-color-border)'}`,
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
                  style={{ color: 'var(--guard-color-text-soft)', padding: '0 4px', height: 20, minWidth: 20 }} />
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
                        <div style={{ height: 1, background: 'var(--guard-color-border)', margin: '4px 10px' }} />
                      )}
                      <Tooltip title={item.label} placement="right">
                        <div
                          onClick={() => navigate(item.key)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            height: 40, margin: '2px 9px', borderRadius: 8, cursor: 'pointer',
                            background: selectedKey === item.key ? 'color-mix(in srgb, var(--guard-color-primary) 22%, transparent)' : 'transparent',
                            color: selectedKey === item.key ? 'var(--guard-color-accent)' : 'var(--guard-color-text-faint)',
                            fontSize: 16, transition: 'background 0.15s, color 0.15s',
                          }}
                          onMouseEnter={e => { if (selectedKey !== item.key) (e.currentTarget as HTMLDivElement).style.background = 'color-mix(in srgb, var(--guard-color-primary) 10%, transparent)'; }}
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
              borderTop: '1px solid var(--guard-color-border)', flexShrink: 0,
            }}>
              <Tooltip title={sidebarOpen ? '' : '페이지 추가'} placement="right">
                <button
                  onClick={() => setBuilderOpen(true)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: sidebarOpen ? 8 : 0, justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    padding: sidebarOpen ? '8px 10px' : '8px 0',
                    borderRadius: 8, cursor: 'pointer',
                    border: '1px dashed color-mix(in srgb, var(--guard-color-primary) 42%, transparent)',
                    background: 'color-mix(in srgb, var(--guard-color-primary) 8%, transparent)',
                    color: 'var(--guard-color-accent)', fontSize: 12, fontWeight: 500,
                    transition: 'all .15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--guard-color-primary) 16%, transparent)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'color-mix(in srgb, var(--guard-color-primary) 68%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--guard-color-primary) 8%, transparent)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'color-mix(in srgb, var(--guard-color-primary) 42%, transparent)';
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
                padding: '0 16px', fontSize: 10, color: 'var(--guard-color-muted)',
                borderTop: '1px solid var(--guard-color-border)', letterSpacing: 1, whiteSpace: 'nowrap',
              }}>
                {brand.productName} v1.0.0-mockup
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
          <span><span className="live-dot" style={{ background: 'var(--guard-color-success)' }} />Senstar-1F: 연결</span>
          <span><span className="live-dot" style={{ background: 'var(--guard-color-success)' }} />ADAM-1F: 연결</span>
          <span><span className="live-dot" style={{ background: 'var(--guard-color-danger)', animationDuration: '.6s' }} />출입-A: 끊김</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--guard-color-text-soft)' }}>
            <WifiOutlined style={{ color: 'var(--guard-color-accent)' }} />
            WS:&nbsp;<span style={{ color: 'var(--guard-color-success)' }}>● 연결됨</span>
          </span>
          <span style={{ color: 'var(--guard-color-accent)' }}>{new Date().toLocaleTimeString('ko-KR')}</span>
        </footer>
      </div>
    </ConfigProvider>
  );
};

export default AppLayout;
