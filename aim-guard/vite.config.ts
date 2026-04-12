import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // 모든 NIC 허용 (로컬: localhost:3004, 내부망: 192.168.0.73:3004)
    port: 3004,
    hmr: {
      // 포트포워딩 환경: 라우터가 외부 14.51.233.143:9009 → 내부 192.168.0.73:3004 로 중계
      // Vite 터미널 출력에는 내부 주소(3004)만 표시되는 게 정상
      // 브라우저의 HMR WebSocket은 아래 외부 주소로 연결됨
      host: '14.51.233.143',
      clientPort: 9009,
    },
  },
});
