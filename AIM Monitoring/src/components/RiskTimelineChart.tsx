import { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { Calendar } from 'lucide-react';

const generateData = (date: string) => {
  // Use date to slightly alter the random seed (mock behavior)
  const isToday = date === new Date().toISOString().split('T')[0];
  
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    total: Math.random() * 50 + (isToday ? 20 : 30),
    equipment: Math.random() * 30 + 10,
    env: Math.random() * 20 + 5,
    worker: Math.random() * 15 + 2,
    avg: Math.random() * 10 + 30
  }));
};

export default function RiskTimelineChart() {
  const [filter, setFilter] = useState('전체');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const data = useMemo(() => generateData(date), [date]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1120] border border-[#1f2937] p-3 rounded-lg shadow-xl shadow-black/50 text-xs">
          <div className="font-bold text-slate-300 mb-2 border-b border-[#1f2937] pb-1">{date} {label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 justify-between mt-1.5 min-w-[120px]">
              <div className="flex items-center gap-1.5 text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>
                   {entry.dataKey === 'total' ? '전체 위험도' :
                    entry.dataKey === 'equipment' ? '설비 위험도' :
                    entry.dataKey === 'env' ? '환경 위험도' :
                    entry.dataKey === 'worker' ? '작업자 위험도' : '전체 평균'}
                </span>
              </div>
              <span className="font-medium" style={{ color: entry.color }}>
                {Number(entry.value).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-base font-bold text-slate-200">통합 위험도 타임라인</h3>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#1e293b] p-1 rounded-lg">
            {['전체', '설비', '환경', '작업자'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-[11px] font-medium rounded-md transition-all ${filter === f ? 'bg-blue-600 shadow text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-[#334155]'}`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5">
            <Calendar size={14} className="text-slate-400" />
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-[11px] font-medium text-slate-300 outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          <select className="bg-[#1e293b] border border-[#334155] rounded-lg text-[11px] font-medium text-slate-300 px-3 py-1.5 outline-none cursor-pointer">
            <option>위험 우선</option>
            <option>최신순</option>
          </select>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 text-[11px] font-medium text-slate-400 mb-6 lg:ml-8">
         {(filter === '전체' || filter === '설비') && <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm" />설비 위험도</div>}
         {(filter === '전체' || filter === '환경') && <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm" />환경 위험도</div>}
         {(filter === '전체' || filter === '작업자') && <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-sm" />작업자 위험도</div>}
         {filter === '전체' && <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-slate-500 border-t border-dashed border-slate-500" />전체 평균</div>}
      </div>

      <div className="h-[240px] w-full relative">
         <div className="absolute left-0 top-0 h-[210px] flex flex-col justify-between text-[11px] font-medium text-slate-500 py-1.5 z-10 w-8">
            <span className="text-red-400/70">위험</span>
            <span className="text-yellow-400/70">주의</span>
            <span className="text-blue-400/70">관심</span>
            <span className="text-emerald-400/70">정상</span>
         </div>
         <div className="w-full h-full pl-10">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
               <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  dy={15} 
                  minTickGap={30}
               />
               <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '3 3' }} />
               
               {/* Conditionally render lines based on filter */}
               {(filter === '전체' || filter === '설비') && <Line type="monotone" dataKey="equipment" stroke="#3b82f6" strokeWidth={filter === '설비' ? 3 : 2} dot={filter === '설비'} activeDot={{ r: 6 }} />}
               {(filter === '전체' || filter === '환경') && <Line type="monotone" dataKey="env" stroke="#10b981" strokeWidth={filter === '환경' ? 3 : 2} dot={filter === '환경'} activeDot={{ r: 6 }} />}
               {(filter === '전체' || filter === '작업자') && <Line type="monotone" dataKey="worker" stroke="#f97316" strokeWidth={filter === '작업자' ? 3 : 2} dot={filter === '작업자'} activeDot={{ r: 6 }} />}
               {filter === '전체' && <Line type="monotone" dataKey="avg" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} activeDot={{ r: 4 }} />}
               
             </LineChart>
           </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}
