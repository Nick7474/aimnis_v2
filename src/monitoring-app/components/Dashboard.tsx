import SummaryCards from './SummaryCards';
import MainChartSection from './MainChartSection';
import WorkerSafetySection from './WorkerSafetySection';
import BottomWidgetsSection from './BottomWidgetsSection';

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full h-full">
      {/* 12 Grid System - First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 lg:gap-6 shrink-0">
        <SummaryCards />
      </div>
      
      {/* 12 Grid System - Second Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6 shrink-0 h-[480px]">
        <div className="xl:col-span-8 flex flex-col bg-[#111827] rounded-lg border border-[#1f2937] shadow-sm h-full overflow-hidden">
          <MainChartSection />
        </div>
        <div className="xl:col-span-4 flex flex-col bg-[#111827] rounded-lg border border-[#1f2937] shadow-sm h-full overflow-hidden">
          <WorkerSafetySection />
        </div>
      </div>

      {/* 12 Grid System - Third Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 lg:gap-6 shrink-0">
        <BottomWidgetsSection />
      </div>
    </div>
  );
}
