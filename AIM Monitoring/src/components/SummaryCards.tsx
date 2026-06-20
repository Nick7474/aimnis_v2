import { Activity, Wind, UserCheck, Bell, Info, MoreVertical, Triangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

const sparklineData1 = Array.from({ length: 15 }, () => ({ value: Math.random() * 20 + 80 }));
const sparklineData2 = Array.from({ length: 15 }, () => ({ value: Math.random() * 20 + 20 }));
const sparklineData3 = Array.from({ length: 15 }, () => ({ value: Math.random() * 20 + 20 }));
const sparklineData4 = Array.from({ length: 15 }, () => ({ value: Math.random() * 20 + 10 }));

function Card({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col shadow-sm h-[130px] justify-between transition-all hover:bg-[#1e293b]/50">
      <div className="flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
          <Icon size={16} className="text-slate-400 font-light" strokeWidth={1.5} />
          {title}
          <Info size={14} className="text-slate-500 cursor-pointer hover:text-slate-300 ml-1" />
        </div>
        <button className="text-slate-500 hover:text-slate-300 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}

export default function SummaryCards() {
  return (
    <>
      <div className="sm:col-span-6 xl:col-span-3">
        <Card title="전체 설비 상태" icon={Activity}>
          <div className="flex justify-between items-end flex-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-white leading-none">128</span>
                <span className="text-sm font-normal text-slate-400">/ 154 대</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Triangle size={10} className="fill-emerald-500 text-emerald-500" />
                <span className="text-emerald-500 font-medium">6 대</span>
                <span>(어제 대비)</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 w-28">
              <div className="w-full h-8">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={sparklineData1}>
                     <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">
                정상 92 (71%)
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="sm:col-span-6 xl:col-span-3">
        <Card title="환경 위험 상태" icon={Wind}>
           <div className="flex justify-between items-end flex-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-yellow-500 leading-none">주의</span>
                <span className="text-sm font-normal text-slate-400">(Yellow)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Triangle size={10} className="fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-500 font-medium">1 단계</span>
                <span>(어제 대비)</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 w-28">
              <div className="w-full h-8">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={sparklineData2}>
                     <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={1.5} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">
                주의 3 / 위험 1
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="sm:col-span-6 xl:col-span-3">
        <Card title="작업자 안전 상태" icon={UserCheck}>
          <div className="flex justify-between items-end flex-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-yellow-500 leading-none">주의</span>
                <span className="text-sm font-normal text-slate-400">(Yellow)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Triangle size={10} className="fill-yellow-500 text-yellow-500" />
                <span className="text-yellow-500 font-medium">2 명</span>
                <span>(어제 대비)</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 w-28">
              <div className="w-full h-8">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={sparklineData3}>
                     <Line type="monotone" dataKey="value" stroke="#eab308" strokeWidth={1.5} dot={false} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">
                주의 4 / 위험 1
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="sm:col-span-6 xl:col-span-3">
        <Card title="오늘의 알림 건수" icon={Bell}>
          <div className="flex justify-between items-end flex-1">
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-white leading-none">26</span>
                <span className="text-sm font-normal text-slate-400">건</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Triangle size={10} className="fill-red-500 text-red-500" />
                <span className="text-red-500 font-medium">10 건</span>
                <span>(어제 대비)</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 w-28">
              <div className="w-full h-8 flex items-end justify-between px-1">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={sparklineData4}>
                     <Bar dataKey="value" fill="#ef4444" radius={[2,2,0,0]} barSize={2} />
                   </BarChart>
                 </ResponsiveContainer>
              </div>
              <div className="text-red-500 border border-red-500/30 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap">
                위험 3 / 경고 7
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
