import { MoreVertical, ArrowRight, User } from 'lucide-react';
import { cn } from '../lib/utils';

const workers = [
  { id: 1, name: '홍길동', role: '안전팀', location: 'A동 2층', spo2: 97, hr: 72, fall: '정상', status: '정상', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 2, name: '이영희', role: '설비팀', location: 'B동 1층', spo2: 94, hr: 98, fall: '정상', status: '주의', statusColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 3, name: '박민수', role: '전기팀', location: 'A동 3층', spo2: 100, hr: 104, fall: '정상', status: '주의', statusColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 4, name: '김지훈', role: '설비팀', location: 'B동 2층', spo2: null, hr: null, fall: '낙상 감지', status: '위험', statusColor: 'bg-red-500/10 text-red-400 border-red-500/20', fallDanger: true },
  { id: 5, name: '최현우', role: '유지보수', location: 'C동 1층', spo2: 98, hr: 80, fall: '정상', status: '정상', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 6, name: '강석기', role: '기계팀', location: '현장 외곽', spo2: 96, hr: 85, fall: '정상', status: '정상', statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
];

export default function WorkerSafetySection() {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="px-4 py-3 lg:px-5 lg:py-4 border-b border-[#1f2937]/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-wide">작업자 안전 현황</h2>
          <button className="text-slate-500 hover:text-slate-300 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
        
        {/* Summary Numbers */}
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-slate-500">전체 작업자</div>
            <div className="text-xl font-bold text-blue-400">35<span className="text-[10px] font-normal text-slate-400 ml-1">명</span></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-slate-500">정상</div>
            <div className="text-xl font-bold text-emerald-400">30<span className="text-[10px] font-normal text-slate-500 ml-1">(86%)</span></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-slate-500">주의</div>
            <div className="text-xl font-bold text-yellow-500">4<span className="text-[10px] font-normal text-slate-500 ml-1">(11%)</span></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] text-slate-500">위험</div>
            <div className="text-xl font-bold text-red-500">1<span className="text-[10px] font-normal text-slate-500 ml-1">(3%)</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 lg:p-5 flex flex-col gap-5">

          {/* Map Area Placeholder */}
           <div className="border border-[#1f2937] bg-[#0b1120] rounded-lg overflow-hidden flex flex-col shrink-0">
            <div className="p-2 px-3 border-b border-[#1f2937] flex justify-between items-center bg-[#111827]">
                <span className="text-xs font-medium text-slate-300">위치 / 구역 맵</span>
                <select className="bg-[#1e293b] text-xs text-slate-300 border border-[#334155] rounded px-2 py-0.5 outline-none">
                    <option>A동 2층</option>
                    <option>A동 3층</option>
                    <option>B동 1층</option>
                </select>
            </div>
            <div className="relative h-32 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-[#0b1120]">
                {/* Grid lines */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                {/* Structural lines mock */}
                <div className="absolute top-4 left-4 w-1/2 h-1/2 border-2 border-slate-700/50 rounded-sm"></div>
                <div className="absolute top-4 right-4 w-1/3 h-2/3 border-2 border-slate-700/50 rounded-sm"></div>
                
                {/* Map Dots */}
                <div className="absolute top-10 left-12 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <div className="absolute bottom-8 left-20 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <div className="absolute top-6 right-16 w-3 h-3 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse" />
                <div className="absolute bottom-10 right-10 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_12px_rgba(239,68,68,1)] animate-ping" />
                <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full m-1" />
            </div>
             <div className="bg-[#111827] p-2 px-3 flex justify-end gap-3 text-[10px] text-slate-400">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/>정상</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"/>주의</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"/>위험</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-slate-500 rounded-full"/>오프라인</div>
            </div>
          </div>

          {/* Worker List */}
          <div className="flex flex-col gap-2 shrink-0 p-1">
            <div className="flex justify-between items-end">
              <h3 className="text-sm font-medium text-slate-300">작업자 상태</h3>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="text-slate-500 border-b border-[#1f2937]">
                <tr>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">작업자</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">위치</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">SpO2</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">심박수</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">낙상 감지</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap text-center">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]/50">
                {workers.map((w) => (
                  <tr key={w.id} className="text-slate-300">
                    <td className="py-2.5 px-1 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                          <User size={12} className="text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-200">{w.name}</span>
                          <span className="text-[9px] text-slate-500">{w.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-1 whitespace-nowrap text-slate-400">{w.location}</td>
                    <td className="py-2.5 px-1 whitespace-nowrap">
                      {w.spo2 ? (
                        <div className="flex items-center gap-1">
                          <span className={cn("text-[10px] px-1 rounded-sm", w.spo2 >= 95 ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-500")}>{w.spo2}</span>
                        </div>
                      ) : <span className="text-slate-600">-</span>}
                    </td>
                    <td className="py-2.5 px-1 whitespace-nowrap text-slate-400">{w.hr ? `${w.hr} bpm` : '-'}</td>
                    <td className={cn("py-2.5 px-1 whitespace-nowrap", w.fallDanger ? "text-red-400 font-medium" : "text-slate-400")}>{w.fall}</td>
                    <td className="py-2.5 px-1 whitespace-nowrap text-center">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", w.statusColor)}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="text-[10px] text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors mt-2">전체 작업자 보기 <ArrowRight size={10}/></button>
          </div>

        </div>
      </div>
    </div>
  );
}
