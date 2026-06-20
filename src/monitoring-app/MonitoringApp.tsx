"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MonitoringPageBuilder from "./components/MonitoringPageBuilder";
import Dashboard from "./components/Dashboard";
import IntegratedDashboard from "./pages/IntegratedDashboard";
import EquipmentDiagnosis from "./pages/EquipmentDiagnosis";
import EnvironmentDiagnosis from "./pages/EnvironmentDiagnosis";
import WorkerSafety from "./pages/WorkerSafety";
import AlertsEvents from "./pages/AlertsEvents";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import { useMonitoringPagesStore, type MonitoringPageConfig } from "@/store/monitoringPagesStore";

const PAGE_KEY_LABELS: Record<string, string> = {
  integrated: "통합 대시보드",
  equipment: "설비 진단",
  environment: "환경 진단",
  worker: "작업자 안전",
  alerts: "알림·이벤트",
  report: "리포트",
  settings: "설정",
};

export default function MonitoringApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("홈");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const { addedPages, addPage, removePage } = useMonitoringPagesStore();

  const addedPageKeys = new Set(addedPages.map((p) => p.key));

  const handleCreatePage = (key: string, config: MonitoringPageConfig) => {
    addPage(key, config);
    const label = config.pageTitle || PAGE_KEY_LABELS[key] || key;
    setCurrentPage(label);
    setIsBuilderOpen(false);
  };

  const renderPage = () => {
    if (currentPage === "홈") return <Dashboard />;

    // Match by dynamic page title first
    const matchedPage = addedPages.find(
      (p) => (p.config.pageTitle || p.label) === currentPage
    );

    if (matchedPage) {
      switch (matchedPage.key) {
        case "integrated":
          return <IntegratedDashboard setCurrentPage={setCurrentPage} />;
        case "equipment":
          return <EquipmentDiagnosis />;
        case "environment":
          return <EnvironmentDiagnosis />;
        case "worker":
          return <WorkerSafety />;
        case "alerts":
          return <AlertsEvents />;
        case "report":
          return <Report />;
        case "settings":
          return <Settings />;
      }
    }

    return (
      <div className="flex h-full flex-col items-center justify-center text-slate-500">
        <h2 className="mb-2 text-xl">{currentPage}</h2>
        <p>페이지를 준비 중입니다.</p>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0b1120] font-sans text-slate-300">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        addedPages={addedPages}
        onOpenPageBuilder={() => setIsBuilderOpen(true)}
        onRemovePage={(key) => {
          if (currentPage !== "홈") {
            const page = addedPages.find((p) => p.key === key);
            if (page && (page.config.pageTitle || page.label) === currentPage) {
              setCurrentPage("홈");
            }
          }
          removePage(key);
        }}
      />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="custom-scrollbar relative flex-1 overflow-y-auto px-[20px] pb-[20px] pt-4 lg:pt-6">
          {renderPage()}
        </main>

        {/* Page Builder — absolute within content area (좌사이드바·탑메뉴 제외) */}
        <AnimatePresence>
          {isBuilderOpen && (
            <MonitoringPageBuilder
              addedPageKeys={addedPageKeys}
              onClose={() => setIsBuilderOpen(false)}
              onCreatePage={handleCreatePage}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
