import { ArrowRight, Settings, User, Leaf } from 'lucide-react';

const mockData = [
  { rank: 1, type: '설비', typeStr: '위험', icon: Settings, location: '고압 순환펌프 P-102', content: '진동 RMS 초과', risk: '위험', time: '10:22:14' },
  { rank: 2, type: '환경', typeStr: '경고', icon: Leaf, location: '배연 탈황 설비', content: 'SO2 농도 상승 (28ppm)', risk: '경고', time: '10:19:35' },
  { rank: 3, type: '작업자', typeStr: '경고', icon: User, location: '정비동 A구역 3번', content: '작업자 체온 경고', risk: '경고', time: '10:16:59' },
  { rank: 4, type: '설비', typeStr: '주의', icon: Settings, location: '복수처리 설비 3호', content: 'pH 편차 증가', risk: '주의', time: '10:13:12' },
  { rank: 5, type: '환경', typeStr: '주의', icon: Leaf, location: '대기 배출구 C-1', content: '미세먼지 농도 상승', risk: '주의', time: '10:11:45' },
];

export default function PriorityRiskTable() {
  const getRiskColor = (risk: string) => {
    switch(risk) {
      case '위험': return 'text-red-500 border-red-500/30';
      case '경고': return 'text-yellow-500 border-yellow-500/30';
      case '주의': return 'text-orange-400 border-orange-500/30';
      default: return 'text-slate-400 border-slate-600';
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-5 flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-200 mb-4">위험 우선순위 목록</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-left">
          <thead className="text-slate-400 border-b border-[#1f2937]">
            <tr>
              <th className="pb-2 font-normal text-center">순위</th>
              <th className="pb-2 font-normal text-center">유형</th>
              <th className="pb-2 font-normal min-w-[120px]">위치</th>
              <th className="pb-2 font-normal min-w-[140px]">내용</th>
              <th className="pb-2 font-normal text-center w-16">위험도</th>
              <th className="pb-2 font-normal text-center w-20">발생 시간</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]/50">
            {mockData.map((item) => (
              <tr key={item.rank} className="hover:bg-[#1e293b]/30">
                <td className="py-2 text-center text-slate-300">{item.rank}</td>
                <td className="py-2 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] tracking-tighter ${getRiskColor(item.typeStr)}`}>{item.typeStr}</span>
                    <item.icon size={12} className="text-slate-400"/>
                  </div>
                </td>
                <td className="py-2 text-slate-300 whitespace-nowrap">{item.location}</td>
                <td className="py-2 text-slate-300 whitespace-nowrap">{item.content}</td>
                <td className="py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] ${getRiskColor(item.risk)} bg-[#0b1120]`}>{item.risk}</span>
                </td>
                <td className="py-2 text-center text-slate-400 tracking-wider font-mono">{item.time}</td>
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
