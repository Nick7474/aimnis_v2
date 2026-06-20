import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MonitoringPageMeta {
  key: string;
  label: string;
  iconName: string;
  description: string;
  previewTags: string[];
}

export interface MonitoringPageConfig {
  primaryData: string;
  refreshInterval: string;
  pageTitle: string;
}

export interface MonitoringPage extends MonitoringPageMeta {
  addedAt: number;
  config: MonitoringPageConfig;
}

export const AVAILABLE_MONITORING_PAGES: MonitoringPageMeta[] = [
  {
    key: "integrated",
    label: "통합 대시보드",
    iconName: "LayoutDashboard",
    description: "설비·환경·작업자·알림 상태를 단일 화면에서 종합 모니터링합니다. 핵심 KPI와 실시간 이상 현황을 한눈에 파악할 수 있습니다.",
    previewTags: ["KPI 요약", "이상 현황", "알림 피드", "작업자 현황"],
  },
  {
    key: "equipment",
    label: "설비 진단",
    iconName: "Activity",
    description: "AI 기반 설비 이상 감지, RUL 예측, 실시간 센서 파형 분석을 제공합니다. Autoencoder·LSTM·CNN-LSTM 모델로 고장 선행 징후를 자동 탐지합니다.",
    previewTags: ["이상 점수", "잔여 수명", "FFT 스펙트럼", "열화상"],
  },
  {
    key: "environment",
    label: "환경 진단",
    iconName: "Wind",
    description: "PM2.5, CO2, 온·습도, 유해가스 농도를 실시간 모니터링합니다. 구역별 환경 위험도 지도와 연속 측정 이력을 제공합니다.",
    previewTags: ["대기질 지수", "가스 농도", "온습도", "위험 구역 맵"],
  },
  {
    key: "worker",
    label: "작업자 안전",
    iconName: "ShieldCheck",
    description: "작업자 위치, SpO2·심박수 생체신호, 안전모 착용률, 낙상 감지를 통합 관리합니다. SOS 알림과 SOP 자동 연동을 지원합니다.",
    previewTags: ["생체 신호", "안전모 착용률", "낙상 감지", "SOS 알림"],
  },
  {
    key: "alerts",
    label: "알림·이벤트",
    iconName: "Bell",
    description: "실시간 알람 피드, 이벤트 이력 조회, SOP 기반 자동 조치 현황을 제공합니다. 심각도별 필터링과 상세 분석 기능을 포함합니다.",
    previewTags: ["실시간 알람", "이벤트 이력", "SOP 연동", "조치 현황"],
  },
  {
    key: "report",
    label: "리포트",
    iconName: "FileText",
    description: "일별·주별·월별 종합 보고서와 AI 분석 인사이트를 제공합니다. 현장 실증 데이터를 기반으로 예지보전 성과를 수치화합니다.",
    previewTags: ["기간별 보고서", "AI 인사이트", "KPI 추이", "실증 성과"],
  },
  {
    key: "settings",
    label: "설정",
    iconName: "Settings",
    description: "시스템 파라미터, 사용자 권한, 알람 임계값, 데이터 연동 설정을 관리합니다.",
    previewTags: ["시스템 설정", "사용자 관리", "알람 임계값", "연동 설정"],
  },
];

export const PRIMARY_DATA_OPTIONS = [
  { value: "equipment-sensor", label: "설비 센서 데이터" },
  { value: "environment-sensor", label: "환경 IoT 센서" },
  { value: "worker-safety", label: "작업자 안전 시스템" },
  { value: "alerts-events", label: "알림·이벤트 스트림" },
  { value: "system-monitor", label: "시스템 헬스 모니터" },
  { value: "all", label: "전체 통합 (권장)" },
];

export const REFRESH_INTERVAL_OPTIONS = [
  { value: "1s", label: "실시간 (1초)" },
  { value: "5s", label: "운영 (5초)" },
  { value: "30s", label: "분석 (30초)" },
  { value: "5m", label: "리포트 (5분)" },
];

interface MonitoringPagesState {
  addedPages: MonitoringPage[];
  addPage: (key: string, config: MonitoringPageConfig) => void;
  removePage: (key: string) => void;
  hasPage: (key: string) => boolean;
}

export const useMonitoringPagesStore = create<MonitoringPagesState>()(
  persist(
    (set, get) => ({
      addedPages: [],
      addPage: (key, config) => {
        if (get().hasPage(key)) return;
        const meta = AVAILABLE_MONITORING_PAGES.find((p) => p.key === key);
        if (!meta) return;
        set((s) => ({
          addedPages: [...s.addedPages, { ...meta, addedAt: Date.now(), config }],
        }));
      },
      removePage: (key) => {
        set((s) => ({ addedPages: s.addedPages.filter((p) => p.key !== key) }));
      },
      hasPage: (key) => get().addedPages.some((p) => p.key === key),
    }),
    { name: "aimnis-monitoring-pages" }
  )
);
