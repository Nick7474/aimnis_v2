"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import IntegratedDashboard from "./pages/IntegratedDashboard";
import EquipmentDiagnosis from "./pages/EquipmentDiagnosis";
import EnvironmentDiagnosis from "./pages/EnvironmentDiagnosis";
import WorkerSafety from "./pages/WorkerSafety";
import AlertsEvents from "./pages/AlertsEvents";
import Report from "./pages/Report";
import Settings from "./pages/Settings";

export default function MonitoringApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("홈");

  const renderPage = () => {
    switch (currentPage) {
      case "홈":
        return <Dashboard />;
      case "통합 대시보드":
        return <IntegratedDashboard setCurrentPage={setCurrentPage} />;
      case "설비 진단":
        return <EquipmentDiagnosis />;
      case "환경 진단":
        return <EnvironmentDiagnosis />;
      case "작업자 안전":
        return <WorkerSafety />;
      case "알림/이벤트":
        return <AlertsEvents />;
      case "리포트":
        return <Report />;
      case "설정":
        return <Settings />;
      default:
        return (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <h2 className="mb-2 text-xl">{currentPage}</h2>
            <p>페이지를 준비 중입니다.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0b1120] font-sans text-slate-300">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="custom-scrollbar relative flex-1 overflow-y-auto px-[20px] pb-[20px] pt-4 lg:pt-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
