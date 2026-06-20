import SummaryCards from './SummaryCards';
import MainChartSection from './MainChartSection';
import WorkerSafetySection from './WorkerSafetySection';
import BottomWidgetsSection from './BottomWidgetsSection';
import { useMonitoringRuntimeStore } from '@/store/monitoringRuntimeStore';
import MonitoringWidgetRenderer from '@/components/monitoring-editor/MonitoringWidgetRenderer';

const CATEGORY_LABELS: Record<string, string> = {
  ultrasonic: "초음파",
  vibration: "진동",
  thermal: "열",
  gas: "가스",
  "worker-bio": "작업자",
  imu: "IMU",
  communication: "통신",
  "ai-diagnosis": "AI",
  "sop-events": "SOP",
  "sensor-fleet": "계측기",
  "field-validation": "실증",
};

// 에디터와 동일한 그리드 상수
const ROW_HEIGHT = 44;
const GRID_GAP = 16;

export default function Dashboard() {
  const { items, widgetMeta } = useMonitoringRuntimeStore();

  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full h-full">

      {/* 커스텀 위젯 행 — 에디터와 동일한 12컬럼 그리드, 사이드바 너비 변화에 자동 반응 */}
      {items.length > 0 && (
        <div
          className="grid grid-cols-12 shrink-0"
          style={{ gridAutoRows: `${ROW_HEIGHT}px`, gap: `${GRID_GAP}px` }}
        >
          {items.map((instance) => {
            const meta = widgetMeta[instance.widgetId];
            if (!meta) return null;
            const dataSource = String(instance.options.dataSource ?? meta.dataSource ?? "");
            return (
              <div
                key={instance.instanceId}
                style={{
                  gridColumn: `${instance.x + 1} / span ${instance.w}`,
                  gridRow: `${instance.y + 1} / span ${instance.h}`,
                }}
              >
                <MonitoringWidgetRenderer
                  title={instance.title}
                  widget={meta}
                  categoryLabel={CATEGORY_LABELS[dataSource] ?? (dataSource || "Monitoring")}
                />
              </div>
            );
          })}
        </div>
      )}

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
