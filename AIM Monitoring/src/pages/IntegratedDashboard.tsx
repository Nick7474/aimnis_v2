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
}

export default function Dashboard({ setCurrentPage }: DashboardProps) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 w-full h-full pb-[20px]">
       <IntegratedSummaryCards setCurrentPage={setCurrentPage} />
       
       <RiskTimelineChart />
       
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 shrink-0">
          <PriorityRiskTable />
          <ActionProgressWidget />
       </div>
       
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 shrink-0">
          <EquipmentStatusWidget setCurrentPage={setCurrentPage} />
          <EnvironmentStatusWidget setCurrentPage={setCurrentPage} />
          <WorkerSafetyWidget setCurrentPage={setCurrentPage} />
       </div>
       
       <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 shrink-0">
          <RealtimeAlertList />
          <SystemStatusWidget />
       </div>
    </div>
  );
}
