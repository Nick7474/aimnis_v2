import { ArrowRight } from 'lucide-react';

export default function WorkerSafetyWidget({ setCurrentPage }: any) {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-200 mb-4">작업자 안전</h3>
      <div className="flex flex-1 gap-4 mb-2">
         {/* Status */}
         <div className="w-1/2 flex flex-col">
            <div className="text-xs text-slate-400 mb-2">작업자 현황</div>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-[#1f2937]/50">
                <tr className="border-t border-[#1f2937]/50">
                  <td className="py-2.5 text-slate-400">전체</td>
                  <td className="py-2.5 text-right"><span className="text-slate-200 font-bold">35</span> <span className="text-slate-500 text-[10px]">명</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 text-emerald-400 font-medium tracking-tighter">정상</td>
                  <td className="py-2.5 text-right whitespace-nowrap"><span className="text-emerald-400 font-bold">30</span> <span className="text-slate-500 text-[10px]">명</span> <span className="text-slate-500 text-[10px] tracking-tighter ml-1">(86%)</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 text-yellow-500 font-medium tracking-tighter">주의</td>
                  <td className="py-2.5 text-right whitespace-nowrap"><span className="text-yellow-500 font-bold">4</span> <span className="text-slate-500 text-[10px]">명</span> <span className="text-slate-500 text-[10px] tracking-tighter col-[1] ml-1">(11%)</span></td>
                </tr>
                <tr>
                  <td className="py-2.5 text-red-500 font-medium tracking-tighter">위험</td>
                  <td className="py-2.5 text-right whitespace-nowrap"><span className="text-red-500 font-bold">1</span> <span className="text-slate-500 text-[10px]">명</span> <span className="text-slate-500 text-[10px] tracking-tighter ml-1">(3%)</span></td>
                </tr>
              </tbody>
            </table>
         </div>
         {/* Top 3 */}
         <div className="w-1/2 flex flex-col border-l border-[#1f2937]/50 pl-4">
            <div className="text-xs text-slate-400 mb-2 whitespace-nowrap">주의 필요 작업자 TOP 3</div>
            <div className="flex flex-col gap-2 mt-1">
               {[
                 { rank: 1, name: '김서부 (A-01)', measure: '38.6', unit: '°C' },
                 { rank: 2, name: '이안전 (B-03)', measure: '37.9', unit: '°C' },
                 { rank: 3, name: '박현장 (C-02)', measure: '37.7', unit: '°C' },
               ].map((item, i) => (
                  <div key={i} className="flex flex-col text-[11px] py-1.5 border-b border-[#1f2937]/50 h-10 justify-center">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5 max-w-[90px] overflow-hidden whitespace-nowrap">
                           <span className="text-slate-500 shrink-0">{item.rank}</span>
                           <span className="text-slate-300 text-ellipsis overflow-hidden" title={item.name}>{item.name}</span>
                         </div>
                         <div className="text-orange-400 font-bold whitespace-nowrap shrink-0">{item.measure} <span className="text-[10px] font-normal">{item.unit}</span></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
      <button onClick={() => setCurrentPage?.('작업자 안전')} className="flex justify-end items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors mt-auto pt-2">
        상세 보기 <ArrowRight size={10}/>
      </button>
    </div>
  );
}
