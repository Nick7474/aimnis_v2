import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GuardPage {
  key: string;       // route key e.g. "/cctv"
  label: string;
  icon: string;      // icon name (Ant Design icon)
  desc: string;      // one-line description for the builder
  addedAt: number;
}

// 추가 가능한 전체 페이지 목록 (Map 기반 모니터링은 항상 존재)
export const AVAILABLE_PAGES: Omit<GuardPage, "addedAt">[] = [
  {
    key: "/cctv",
    label: "영상 모니터링",
    icon: "VideoCameraOutlined",
    desc: "CCTV 채널별 실시간 영상 및 멀티뷰 모니터링",
  },
  {
    key: "/events",
    label: "이벤트",
    icon: "BellOutlined",
    desc: "보안 알람 이벤트 목록 및 처리 현황",
  },
  {
    key: "/stats",
    label: "통계",
    icon: "BarChartOutlined",
    desc: "구역별·시간대별 이벤트 통계 및 분석 차트",
  },
  {
    key: "/admin/event-rules",
    label: "이벤트 규칙",
    icon: "ThunderboltOutlined",
    desc: "알람 발생 조건 및 자동 대응 규칙 설정",
  },
  {
    key: "/admin/settings",
    label: "설정",
    icon: "SettingOutlined",
    desc: "시스템 환경 설정, 사용자 관리, 장치 연결",
  },
];

interface GuardPagesState {
  addedPages: GuardPage[];
  addPage: (key: string) => void;
  removePage: (key: string) => void;
  hasPage: (key: string) => boolean;
}

export const useGuardPagesStore = create<GuardPagesState>()(
  persist(
    (set, get) => ({
      addedPages: [],

      addPage: (key) => {
        if (get().hasPage(key)) return;
        const meta = AVAILABLE_PAGES.find((p) => p.key === key);
        if (!meta) return;
        set((s) => ({
          addedPages: [...s.addedPages, { ...meta, addedAt: Date.now() }],
        }));
      },

      removePage: (key) =>
        set((s) => ({ addedPages: s.addedPages.filter((p) => p.key !== key) })),

      hasPage: (key) => get().addedPages.some((p) => p.key === key),
    }),
    { name: "aimnis-guard-pages" }
  )
);
