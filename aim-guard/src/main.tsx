import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import koKR from 'antd/locale/ko_KR';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={koKR}
      theme={{
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
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
