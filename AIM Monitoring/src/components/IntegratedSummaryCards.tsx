import { Settings, Leaf, Shield, Bell } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const envData = Array.from({ length: 15 }, () => ({ value: Math.random() * 20 + 20 }));
const workerData = Array.from({ length: 15 }, () => ({ value: Math.random() * 20 + 20 }));
const alertData = Array.from({ length: 15 }, () => ({ value: Math.random() * 20 + 20 }));
const systemData = Array.from({ length: 15 }, () => ({ value: Math.random() * 20 + 50 }));

export default function IntegratedSummaryCards({ setCurrentPage }: { setCurrentPage?: (page: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {/* 1. 전체 설비 상태 */}
      <div 
        className="bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 flex flex-col justify-between cursor-pointer hover:bg-[#1e293b]/50 transition-colors h-[120px]"
        onClick={() => setCurrentPage?.('설비 진단')}
      >
        <div className="flex items-center gap-2 text-slate-300 text-[13px] font-medium">
          <Settings size={15} className="text-blue-400" />
          전체 설비 상태
        </div>
        <div className="flex justify-between items-end flex-1 mb-1">
           <div className="flex items-baseline gap-1.5">
             <span className="text-3xl font-bold text-white leading-none">128</span>
             <span className="text-xs text-slate-500">/ 154 대</span>
           </div>
           <div className="w-20 h-6">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={systemData}>
                 <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="flex items-center justify-between pt-2.5 text-[11px] border-t border-[#1f2937]">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> <span className="text-emerald-500 font-medium whitespace-nowrap">정상</span> <span className="text-slate-400 whitespace-nowrap">92 (71%)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"/> <span className="text-yellow-500 font-medium whitespace-nowrap">주의</span> <span className="text-slate-400 whitespace-nowrap">28 (21%)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> <span className="text-red-500 font-medium whitespace-nowrap">위험</span> <span className="text-slate-400 whitespace-nowrap">8 (8%)</span></div>
        </div>
      </div>

      {/* 2. 환경 위험 상태 */}
      <div 
        className="bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 flex flex-col justify-between cursor-pointer hover:bg-[#1e293b]/50 transition-colors h-[120px]"
        onClick={() => setCurrentPage?.('환경 진단')}
      >
        <div className="flex items-center gap-2 text-slate-300 text-[13px] font-medium">
          <Leaf size={15} className="text-emerald-400" />
          환경 위험 상태
        </div>
        <div className="flex items-end justify-between flex-1 mb-1">
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-bold text-yellow-500 leading-none">주의</span>
             <span className="text-xs text-slate-500">Yellow</span>
          </div>
          <div className="w-20 h-6">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={envData}>
                 <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={1.5} dot={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
        <div className="flex items-center gap-6 pt-2.5 text-[11px] border-t border-[#1f2937]">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"/> <span className="text-yellow-500 font-medium whitespace-nowrap">주의</span> <span className="text-slate-400 whitespace-nowrap">2 건</span></div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> <span className="text-red-500 font-medium whitespace-nowrap">위험</span> <span className="text-slate-400 whitespace-nowrap">1 건</span></div>
        </div>
      </div>

      {/* 3. 작업자 안전 상태 */}
      <div 
        className="bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 flex flex-col justify-between cursor-pointer hover:bg-[#1e293b]/50 transition-colors h-[120px]"
        onClick={() => setCurrentPage?.('작업자 안전')}
      >
        <div className="flex items-center gap-2 text-slate-300 text-[13px] font-medium">
          <Shield size={15} className="text-orange-400" />
          작업자 안전 상태
        </div>
        <div className="flex items-end justify-between flex-1 mb-1">
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-bold text-yellow-500 leading-none">주의</span>
             <span className="text-xs text-slate-500">Yellow</span>
          </div>
          <div className="w-20 h-6">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={workerData}>
                 <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
        <div className="flex items-center gap-6 pt-2.5 text-[11px] border-t border-[#1f2937]">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"/> <span className="text-yellow-500 font-medium whitespace-nowrap">주의</span> <span className="text-slate-400 whitespace-nowrap">4 명</span></div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> <span className="text-red-500 font-medium whitespace-nowrap">위험</span> <span className="text-slate-400 whitespace-nowrap">1 명</span></div>
        </div>
      </div>

      {/* 4. 실시간 알림 현황 */}
      <div className="bg-[#111827] border border-[#1f2937] rounded-lg px-4 py-3.5 flex flex-col justify-between h-[120px]">
        <div className="flex items-center gap-2 text-slate-300 text-[13px] font-medium">
          <Bell size={15} className="text-slate-400" />
          실시간 알림 현황
        </div>
        <div className="flex items-end justify-between flex-1 mb-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white leading-none">26</span>
            <span className="text-xs text-slate-500">건 (오늘)</span>
          </div>
          <div className="w-20 h-6">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={alertData}>
                 <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2.5 text-[11px] border-t border-[#1f2937]">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> <span className="text-red-500 font-medium whitespace-nowrap">위험</span> <span className="text-slate-200 whitespace-nowrap">7</span></div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"/> <span className="text-yellow-500 font-medium whitespace-nowrap">경고</span> <span className="text-slate-200 whitespace-nowrap">12</span></div>
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"/> <span className="text-blue-500 font-medium whitespace-nowrap">정보</span> <span className="text-slate-200 whitespace-nowrap">7</span></div>
        </div>
      </div>
    </div>
  );
}
