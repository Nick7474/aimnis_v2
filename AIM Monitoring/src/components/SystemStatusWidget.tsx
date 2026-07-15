import { ArrowRight } from 'lucide-react';

const mockData = [
  { item: 'AIoT 수집 서버', status: '정상', response: '18 ms', availability: 99.8 },
  { item: '데이터 처리 서버', status: '정상', response: '21 ms', availability: 99.8 },
  { item: 'DB 서버', status: '정상', response: '16 ms', availability: 99.8 },
  { item: '네트워크', status: '정상', response: '9 ms', availability: 99.8 },
];

export default function SystemStatusWidget() {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-200 mb-4">시스템 상태</h3>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs text-left">
          <thead className="text-slate-400 border-b border-[#1f2937]">
            <tr>
              <th className="pb-2 font-normal whitespace-nowrap">항목</th>
              <th className="pb-2 font-normal text-center w-16 whitespace-nowrap">상태</th>
              <th className="pb-2 font-normal text-center w-20 whitespace-nowrap">응답 시간</th>
              <th className="pb-2 font-normal pl-4 min-w-[120px] whitespace-nowrap">가용율(24h)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]/50">
            {mockData.map((data, i) => (
              <tr key={i} className="hover:bg-[#1e293b]/30">
                 <td className="py-2.5 text-slate-300 font-medium whitespace-nowrap">{data.item}</td>
                 <td className="py-2.5 text-center">
                   <div className="flex items-center justify-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                     <span className="text-emerald-400 text-[11px] whitespace-nowrap">{data.status}</span>
                   </div>
                 </td>
                 <td className="py-2.5 text-center text-slate-300 font-mono text-[11px] whitespace-nowrap">{data.response}</td>
                 <td className="py-2.5 pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden max-w-[120px]">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${data.availability}%` }} />
                    </div>
                    <span className="text-slate-400 text-[10px] w-[30px] whitespace-nowrap text-right">{data.availability}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center justify-center gap-1 mt-auto text-xs text-slate-400 hover:text-slate-200 transition-colors w-full p-2 bg-[#1e293b]/30 rounded">
        시스템 상태 상세 보기 <ArrowRight size={12}/>
      </button>
    </div>
  );
}
