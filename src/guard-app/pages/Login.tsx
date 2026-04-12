import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, ConfigProvider, Form, Input, theme } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores';
import AimGuardLogo from '../components/AimGuardLogo';

const AIM_DARK = {
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
  },
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login    = useAuthStore((s) => s.login);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: { username: string; password: string }) => {
    setLoading(true);
    const users: Record<string, { name: string; role: 'ADMIN' | 'OPERATOR' | 'VIEWER' }> = {
      admin:     { name: '관리자', role: 'ADMIN' },
      operator1: { name: '김운영', role: 'OPERATOR' },
      viewer1:   { name: '박조회', role: 'VIEWER' },
    };
    setTimeout(() => {
      const user = users[values.username];
      if (user && values.password === 'password') {
        login({ id: values.username, ...user });
        navigate('/monitor', { replace: true });
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <ConfigProvider theme={AIM_DARK}>
      <div className="login-page">
        {/* 배경 그리드 */}
        <div className="login-grid-bg" />

        <div className="login-wrap">
          {/* 브랜드 */}
          <div className="login-brand">
            <AimGuardLogo size={62} />
            <div className="login-brand-product">
              <span>AIM</span> GUARD
            </div>
            <div className="login-brand-tagline">
              Integrated Security Monitoring System
            </div>
          </div>

          {/* 로그인 카드 */}
          <div className="login-card" style={{
            background: '#0C1733',
            border: '1px solid #1E3A5F',
            borderRadius: 12,
            padding: 32,
            width: 380,
            boxShadow: '0 24px 60px rgba(0,0,0,.7)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8',
                           marginBottom: 20, textAlign: 'center', letterSpacing: 1 }}>
              시스템 로그인
            </div>

            <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
              <Form.Item name="username" rules={[{ required: true, message: '아이디를 입력하세요' }]}>
                <Input
                  prefix={<UserOutlined style={{ color: '#475569' }} />}
                  placeholder="아이디"
                  size="large"
                  autoFocus
                />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '비밀번호를 입력하세요' }]}>
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#475569' }} />}
                  placeholder="비밀번호"
                  size="large"
                />
              </Form.Item>

              {error && (
                <Alert
                  type="error"
                  message={error}
                  style={{ marginBottom: 16, fontSize: 12 }}
                  showIcon
                />
              )}

              <Button
                type="primary"
                htmlType="submit"
                block size="large"
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #1E40AF, #2563EB)',
                  border: 'none',
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                로그인
              </Button>
            </Form>

            {/* 목업 계정 안내 */}
            <div style={{
              marginTop: 20, padding: '10px 12px',
              background: '#070F24', borderRadius: 6,
              border: '1px solid #1E3A5F',
              fontSize: 11, color: '#475569', lineHeight: 2,
            }}>
              <span style={{ color: '#00C8FF', fontWeight: 600 }}>목업 계정</span><br />
              <code style={{ color: '#94a3b8' }}>admin</code> / password &nbsp;— ADMIN<br />
              <code style={{ color: '#94a3b8' }}>operator1</code> / password — OPERATOR<br />
              <code style={{ color: '#94a3b8' }}>viewer1</code> / password &nbsp;— VIEWER
            </div>
          </div>

          {/* 하단 카피라이트 */}
          <div style={{ fontSize: 11, color: '#1E3A5F', letterSpacing: 1 }}>
            © 2026 AIM OMNIS Corp. All rights reserved.
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;
