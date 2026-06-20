import type { BrandSettings } from '@/lib/brandPresets';
import IntegratedSummaryCards from '../components/IntegratedSummaryCards';
import RiskTimelineChart from '../components/RiskTimelineChart';
import PriorityRiskTable from '../components/PriorityRiskTable';
import ActionProgressWidget from '../components/ActionProgressWidget';
import EquipmentStatusWidget from '../components/EquipmentStatusWidget';
import EnvironmentStatusWidget from '../components/EnvironmentStatusWidget';
import WorkerSafetyWidget from '../components/WorkerSafetyWidget';
import RealtimeAlertList from '../components/RealtimeAlertList';
import SystemStatusWidget from '../components/SystemStatusWidget';

interface DashboardProps {
  setCurrentPage?: (page: string) => void;
  brand?: BrandSettings;
}

export default function Dashboard({ setCurrentPage, brand }: DashboardProps) {
  const tokens = {
    primaryColor:    brand?.primaryColor    ?? '#2563EB',
    surfaceColor:    brand?.surfaceColor    ?? '#111827',
    backgroundColor: brand?.backgroundColor ?? '#0b1120',
    borderColor:     brand?.borderColor     ?? '#1f2937',
    textStrongColor: brand?.textStrongColor ?? '#F8FAFC',
    textColor:       brand?.textColor       ?? '#CBD5E1',
    textSoftColor:   brand?.textSoftColor   ?? '#94A3B8',
    successColor:    brand?.successColor    ?? '#10B981',
    warningColor:    brand?.warningColor    ?? '#EAB308',
    dangerColor:     brand?.dangerColor     ?? '#EF4444',
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full h-full pb-[20px]">
      <IntegratedSummaryCards setCurrentPage={setCurrentPage} brand={tokens} />

      <RiskTimelineChart brand={tokens} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 shrink-0">
        <PriorityRiskTable brand={tokens} />
        <ActionProgressWidget brand={tokens} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 shrink-0">
        <EquipmentStatusWidget setCurrentPage={setCurrentPage} brand={tokens} />
        <EnvironmentStatusWidget setCurrentPage={setCurrentPage} brand={tokens} />
        <WorkerSafetyWidget setCurrentPage={setCurrentPage} brand={tokens} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 shrink-0">
        <RealtimeAlertList brand={tokens} />
        <SystemStatusWidget brand={tokens} />
      </div>
    </div>
  );
}
