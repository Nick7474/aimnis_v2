import { ArrowRight } from 'lucide-react';

const mockData = [
  { time: '10:22:14', typeStr: '위험', content: '고압 순환펌프 P-102 진동 RMS 초과', location: '설비동 1층' },
  { time: '10:19:35', typeStr: '경고', content: '배연 탈황 설비 SO2 농도 상승 (28ppm)', location: '환경동 2층' },
  { time: '10:16:59', typeStr: '경고', content: '정비동 A구역 3번 작업자 체온 경고', location: '정비동 A구역' },
  { time: '10:13:12', typeStr: '주의', content: '복수처리 설비 3호 pH 편차 증가', location: '수처리동 1층' },
];

export default function RealtimeAlertList() {
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
      <h3 className="text-sm font-bold text-slate-200 mb-4">실시간 알림</h3>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-[11px] text-left">
          <thead className="text-slate-400 border-b border-[#1f2937]">
            <tr>
              <th className="pb-2 font-normal w-[70px] whitespace-nowrap">시간</th>
              <th className="pb-2 font-normal w-[50px] text-center whitespace-nowrap">유형</th>
              <th className="pb-2 font-normal min-w-[200px]">내용</th>
              <th className="pb-2 font-normal text-right w-[100px] whitespace-nowrap">위치</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]/50">
            {mockData.map((item, i) => (
              <tr key={i} className="hover:bg-[#1e293b]/30">
                <td className="py-3 text-slate-400 font-mono tracking-wider">{item.time}</td>
                <td className="py-3 text-center">
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] tracking-tighter ${getRiskColor(item.typeStr)}`}>{item.typeStr}</span>
                </td>
                <td className="py-3 text-slate-300">{item.content}</td>
                <td className="py-3 text-right text-slate-400 tracking-tighter">{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center justify-center gap-1 mt-auto text-xs text-slate-400 hover:text-slate-200 transition-colors w-full p-2 bg-[#1e293b]/30 rounded">
        전체 알림 보기 <ArrowRight size={12}/>
      </button>
    </div>
  );
}
