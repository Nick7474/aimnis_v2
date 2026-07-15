import { ArrowRight } from 'lucide-react';

export default function EnvironmentStatusWidget({ setCurrentPage }: any) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-200 mb-4">환경 진단</h3>
      <div className="flex flex-1 gap-4 mb-2">
         {/* Key Indicators */}
         <div className="w-1/2 flex flex-col">
            <div className="text-xs text-slate-400 mb-2">주요 지표</div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-[#1f2937]/50">
                <tr className="border-t border-[#1f2937]/50">
                  <td className="py-2.5 text-slate-300">SO2</td>
                  <td className="py-2.5 text-right"><span className="text-yellow-500 font-bold">28</span> <span className="text-slate-500 text-[10px]">ppm</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-300">NOx</td>
                  <td className="py-2.5 text-right"><span className="text-yellow-500 font-bold">32</span> <span className="text-slate-500 text-[10px]">ppm</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-300">먼지</td>
                  <td className="py-2.5 text-right"><span className="text-emerald-400 font-bold">18</span> <span className="text-slate-500 text-[10px]">µg/m³</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 text-slate-300">온도</td>
                  <td className="py-2.5 text-right"><span className="text-slate-200 font-bold">26.5</span> <span className="text-slate-500 text-[10px]">°C</span></td>
                </tr>
              </tbody>
            </table>
         </div>
         {/* Zones */}
         <div className="w-1/2 flex flex-col border-l border-[#1f2937]/50 pl-4">
            <div className="text-xs text-slate-400 mb-2">구역별 상태</div>
            <div className="grid grid-cols-2 gap-2 h-full gap-y-3 pt-2 content-start">
               {/* Zone A */}
               <div className="flex flex-col items-center justify-center p-2 bg-[#1e293b]/30 rounded gap-1.5 border border-transparent min-w-[50px]">
                  <div className="text-[10px] text-slate-300">A구역</div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <div className="text-[10px] text-emerald-400">정상</div>
               </div>
               {/* Zone B */}
               <div className="flex flex-col items-center justify-center p-2 bg-[#1e293b]/30 rounded gap-1.5 border border-yellow-500/20 col-span-1">
                  <div className="text-[10px] text-slate-300">B구역</div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                  <div className="text-[10px] text-yellow-500">주의</div>
               </div>
               {/* Zone C */}
               <div className="flex flex-col items-center justify-center p-2 bg-[#1e293b]/30 rounded gap-1.5 border border-transparent col-span-2 mx-auto w-16">
                  <div className="text-[10px] text-slate-300">C구역</div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <div className="text-[10px] text-emerald-400">정상</div>
               </div>
            </div>
         </div>
      </div>
      <button onClick={() => setCurrentPage?.('환경 진단')} className="flex justify-end items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors mt-auto pt-2">
        상세 보기 <ArrowRight size={10}/>
      </button>
    </div>
  );
}
