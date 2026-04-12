import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import AppLayout from './components/AppLayout';
import { useAuthStore } from './stores';

const LoginPage   = lazy(() => import('./pages/Login'));
const MonitorPage = lazy(() => import('./pages/Monitor'));
const EventsPage  = lazy(() => import('./pages/Events'));
const StatsPage   = lazy(() => import('./pages/Stats'));
const SettingsPage  = lazy(() => import('./pages/admin/Settings'));
const MapsPage    = lazy(() => import('./pages/admin/Maps'));
const ZonesPage   = lazy(() => import('./pages/admin/Zones'));
const DevicesPage = lazy(() => import('./pages/admin/Devices'));
const VmsPage     = lazy(() => import('./pages/admin/Vms'));
const UsersPage   = lazy(() => import('./pages/admin/Users'));
const EventRulesPage = lazy(() => import('./pages/admin/EventRules'));
const CctvDashboard  = lazy(() => import('./pages/CctvDashboard'));

const Loading = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                 height: '100%', flex: 1 }}>
    <Spin size="large" />
  </div>
);

const ProtectedRoute: React.FC<{ roles?: Array<'ADMIN' | 'OPERATOR' | 'VIEWER'> }> = ({ roles }) => {
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                     flexDirection: 'column', height: '100%', gap: 12 }}>
        <span style={{ fontSize: 48 }}>🚫</span>
        <h2>403 — 접근 권한 없음</h2>
        <p style={{ color: '#8c8c8c' }}>이 페이지에 접근할 권한이 없습니다.</p>
        <button onClick={() => navigate(-1)}>이전 페이지로</button>
      </div>
    );
  }
  return <Outlet />;
};

const App: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* 보호된 라우트 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/monitor" replace />} />
            <Route path="/monitor" element={<MonitorPage />} />
            <Route path="/cctv"    element={<CctvDashboard />} />
            <Route path="/events"  element={<EventsPage />} />
            <Route path="/stats"   element={<StatsPage />} />

            {/* Admin 전용 */}
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/event-rules" element={<EventRulesPage />} />
              <Route path="/admin/maps"    element={<Navigate to="/admin/settings?tab=maps"    replace />} />
              <Route path="/admin/zones"   element={<Navigate to="/admin/settings?tab=zones"   replace />} />
              <Route path="/admin/devices" element={<Navigate to="/admin/settings?tab=devices" replace />} />
              <Route path="/admin/vms"     element={<Navigate to="/admin/settings?tab=vms"     replace />} />
              <Route path="/admin/users"   element={<Navigate to="/admin/settings?tab=users"   replace />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/monitor" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
