import { ArrowRight } from 'lucide-react';

const mockData = [
  { item: '설비 점검', total: 35, inProgress: 12, completed: 23, rate: 65 },
  { item: '환경 점검', total: 18, inProgress: 6, completed: 12, rate: 67 },
  { item: '작업자 안전 점검', total: 42, inProgress: 9, completed: 33, rate: 79 },
  { item: '조치 요청', total: 28, inProgress: 4, completed: 24, rate: 86 },
];

export default function ActionProgressWidget() {
  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-200 mb-4">점검 · 조치 현황</h3>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs text-left">
          <thead className="text-slate-400 border-b border-[#1f2937]">
            <tr>
              <th className="pb-2 font-normal whitespace-nowrap">항목</th>
              <th className="pb-2 font-normal text-center whitespace-nowrap w-12">전체</th>
              <th className="pb-2 font-normal text-center whitespace-nowrap w-16">진행 중</th>
              <th className="pb-2 font-normal text-center whitespace-nowrap w-12">완료</th>
              <th className="pb-2 font-normal pl-4 min-w-[80px]">완료율</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]/50">
            {mockData.map((data, i) => (
              <tr key={i} className="hover:bg-[#1e293b]/30">
                <td className="py-2.5 text-slate-300 font-medium whitespace-nowrap">{data.item}</td>
                <td className="py-2.5 text-center text-slate-300">{data.total}</td>
                <td className="py-2.5 text-center text-emerald-400">{data.inProgress}</td>
                <td className="py-2.5 text-center text-slate-300">{data.completed}</td>
                <td className="py-2.5 pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-[#1e293b] h-1.5 rounded-full overflow-hidden max-w-[120px]">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${data.rate}%` }} />
                    </div>
                    <span className="text-slate-400 text-[10px] w-6 text-right whitespace-nowrap">{data.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center justify-center gap-1 mt-auto text-xs text-slate-400 hover:text-slate-200 transition-colors w-full pt-4">
        전체 보기 <ArrowRight size={12}/>
      </button>
    </div>
  );
}
