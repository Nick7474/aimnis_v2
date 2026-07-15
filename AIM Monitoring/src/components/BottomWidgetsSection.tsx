import { MoreVertical, ArrowRight, AlertTriangle, Info, CheckCircle2, Thermometer, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';

export default function BottomWidgetsSection() {
  return (
    <>
      
      {/* Environment widget */}
      <div className="md:col-span-6 xl:col-span-3 bg-[#111827] rounded-lg border border-[#1f2937] p-4 lg:p-5 flex flex-col gap-3 shadow-sm h-full">
        <div className="flex items-center justify-between shrink-0 mb-1">
          <h3 className="text-sm font-bold text-slate-200">환경 진단</h3>
          <MoreVertical size={16} className="text-slate-500 cursor-pointer hover:text-slate-300" />
        </div>
        <div className="flex gap-4 flex-1">
          {/* Gas */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-[11px] text-slate-500 mb-2">가스 농도 (ppm)</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">CO</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">12</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">정상</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">H₂S</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">0.8</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">정상</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">CH₄</span>
               <div className="flex items-center gap-2">
                <span className="font-medium text-yellow-500">15</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">주의</span>
              </div>
            </div>
             <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">VOC</span>
               <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">0.6</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">정상</span>
              </div>
            </div>
          </div>

          <div className="w-px bg-[#1f2937]" />

          {/* Temp & Zones */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-6 mb-2">
                 <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1"><Thermometer size={12}/> 온도</span>
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-1">26.5<span className="text-[10px] text-slate-500 font-normal">°C</span></span>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1"><Droplets size={12}/> 습도</span>
                    <span className="text-sm font-bold text-slate-200 flex items-center gap-1">54<span className="text-[10px] text-slate-500 font-normal">%</span></span>
                 </div>
              </div>
               <div className="text-[10px] text-slate-500 mt-2 mb-1">추세 (24h)</div>
               <div className="w-full h-4 relative">
                  <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full text-blue-500/50">
                    <polyline fill="none" stroke="currentColor" strokeWidth="1" points="0,15 10,12 20,18 30,5 40,16 50,2 60,15 70,8 80,18 90,4 100,10" />
                    <circle cx="100" cy="10" r="2" fill="#3b82f6" />
                  </svg>
               </div>
            </div>
            
            <div className="space-y-1 mt-auto pt-2">
              <div className="text-[10px] text-slate-500 mb-1">유해 구역 상태</div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">가스 누출 구역</span>
                <span className="text-yellow-500 font-medium">1 개</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">고온 주의 구역</span>
                <span className="text-yellow-500 font-medium">2 개</span>
              </div>
               <div className="flex justify-between text-xs">
                <span className="text-slate-400">출입 제한 구역</span>
                <span className="text-emerald-500 font-medium">0 개</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-auto pt-1">
          <button className="text-[10px] text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors">상세 환경 보기 <ArrowRight size={10}/></button>
        </div>
      </div>

      {/* Alarms widget */}
      <div className="md:col-span-6 xl:col-span-3 bg-[#111827] rounded-lg border border-[#1f2937] p-4 lg:p-5 flex flex-col gap-3 shadow-sm h-full">
        <div className="flex items-center justify-between shrink-0 mb-1">
          <h3 className="text-sm font-bold text-slate-200">실시간 알림</h3>
          <button className="text-[10px] text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors">전체 알림 보기 <ArrowRight size={10}/></button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
          {/* item */}
          <div className="flex gap-3 items-start">
            <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">10:23:12</span>
            <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">A동 2층 펌프 P-102</p>
              <p className="text-[10px] text-slate-500 truncate">베어링 진동 위험 (경고 상위 5%)</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">위험</span>
          </div>
          {/* item */}
          <div className="flex gap-3 items-start">
            <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">10:22:44</span>
            <AlertTriangle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">B동 3층 가스 센서 GS-12</p>
              <p className="text-[10px] text-slate-500 truncate">가스 농도 상승 (H₂S: 15ppm)</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shrink-0">경고</span>
          </div>
          {/* item */}
          <div className="flex gap-3 items-start">
            <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">10:21:09</span>
            <Info size={14} className="text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">A동 3층 냉각기 C-101</p>
              <p className="text-[10px] text-slate-500 truncate">온도 상승 (냉각수 41°C)</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shrink-0">주의</span>
          </div>
          {/* item */}
          <div className="flex gap-3 items-start">
            <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">10:18:33</span>
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">B동 1층 환경 센서 ENV-07</p>
              <p className="text-[10px] text-slate-500 truncate">온도 변화 복귀 (내부 26.5°C)</p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">정상</span>
          </div>
        </div>
      </div>

      {/* Task widget */}
      <div className="md:col-span-6 xl:col-span-3 bg-[#111827] rounded-lg border border-[#1f2937] p-4 lg:p-5 flex flex-col gap-3 shadow-sm h-full">
        <div className="flex items-center justify-between shrink-0 mb-1">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1">점검·조치 현황 <span className="p-0.5 rounded bg-slate-700 text-slate-300 ml-1"><Info size={10}/></span></h3>
          <MoreVertical size={16} className="text-slate-500 cursor-pointer hover:text-slate-300" />
        </div>
        <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-slate-500">
                <tr>
                    <th className="font-normal pb-2">작업 내용</th>
                    <th className="font-normal pb-2 text-center w-16">예정/기한</th>
                    <th className="font-normal pb-2 text-right">진행 상태</th>
                </tr>
            </thead>
            <tbody className="space-y-3">
                <tr className="border-b border-transparent group">
                    <td className="py-2 text-slate-300">펌프 P-02 베어링 교체</td>
                    <td className="py-2 text-slate-400 text-center text-[10px]">05.21 (화)</td>
                    <td className="py-2 flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                            <div className="w-[75%] h-full bg-blue-500 rounded-full" />
                        </div>
                        <span className="text-[10px] text-slate-500 w-6 text-right">75%</span>
                    </td>
                </tr>
                <tr className="border-b border-transparent group">
                    <td className="py-2 text-slate-300">모터 M-205 절연 점검</td>
                    <td className="py-2 text-slate-400 text-center text-[10px]">05.22 (수)</td>
                    <td className="py-2 flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                            <div className="w-[50%] h-full bg-blue-500 rounded-full" />
                        </div>
                        <span className="text-[10px] text-slate-500 w-6 text-right">50%</span>
                    </td>
                </tr>
                <tr className="border-b border-transparent group">
                    <td className="py-2 text-slate-300">압축기 C-301 밸브 점검</td>
                    <td className="py-2 text-slate-400 text-center text-[10px]">05.22 (수)</td>
                    <td className="py-2 flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                            <div className="w-[25%] h-full bg-blue-500 rounded-full" />
                        </div>
                        <span className="text-[10px] text-slate-500 w-6 text-right">25%</span>
                    </td>
                </tr>
                <tr className="border-b border-transparent group">
                    <td className="py-2 text-slate-300">냉각기 C-101 필터 교체</td>
                    <td className="py-2 text-slate-400 text-center text-[10px]">05.23 (목)</td>
                    <td className="py-2 flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                            <div className="w-0 h-full bg-blue-500 rounded-full" />
                        </div>
                        <span className="text-[10px] text-slate-500 w-6 text-right">0%</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <div className="flex justify-end mt-auto pt-1">
          <button className="text-[10px] text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors">전체 일정 보기 <ArrowRight size={10}/></button>
        </div>
      </div>

      {/* System Status widget */}
      <div className="md:col-span-6 xl:col-span-3 bg-[#111827] rounded-lg border border-[#1f2937] p-4 lg:p-5 flex flex-col shadow-sm h-full">
        <div className="flex items-center justify-between shrink-0 mb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1">시스템 상태 <span className="p-0.5 rounded bg-slate-700 text-slate-300 ml-1"><Info size={10}/></span></h3>
          <MoreVertical size={16} className="text-slate-500 cursor-pointer hover:text-slate-300" />
        </div>
        
        <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">데이터 수집</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> 정상
                </div>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">IoT 게이트웨이</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> 정상
                </div>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">클라우드 연결</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> 정상
                </div>
            </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">DB 상태</span>
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> 정상
                </div>
            </div>
        </div>

        <div className="mt-auto pt-3 border-t border-[#1f2937]">
             <div className="text-[10px] text-slate-500 mb-2">데이터 수집 전송률 (최근 1시간)</div>
             <div className="flex items-end justify-between gap-4">
                <div className="text-2xl font-bold text-white leading-none">99.6<span className="text-sm">%</span></div>
                <div className="flex-1 mb-1">
                    <div className="w-full h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                        <div className="w-[99.6%] h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                </div>
             </div>
        </div>
        <div className="flex justify-end mt-auto pt-2 text-[10px] text-slate-500">
             <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> 대시보드 <span className="ml-2 border-l border-[#334155] pl-2">v1.0</span>
            </div>
        </div>
      </div>
    </>
  );
}
