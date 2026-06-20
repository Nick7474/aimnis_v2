import { ArrowRight, Settings, User, Leaf } from 'lucide-react';

const mockData = [
  { rank: 1, type: '설비', typeStr: '위험', icon: Settings, location: '고압 순환펌프 P-102', content: '진동 RMS 초과', risk: '위험', time: '10:22:14' },
  { rank: 2, type: '환경', typeStr: '경고', icon: Leaf, location: '배연 탈황 설비', content: 'SO2 농도 상승 (28ppm)', risk: '경고', time: '10:19:35' },
  { rank: 3, type: '작업자', typeStr: '경고', icon: User, location: '정비동 A구역 3번', content: '작업자 체온 경고', risk: '경고', time: '10:16:59' },
  { rank: 4, type: '설비', typeStr: '주의', icon: Settings, location: '복수처리 설비 3호', content: 'pH 편차 증가', risk: '주의', time: '10:13:12' },
  { rank: 5, type: '환경', typeStr: '주의', icon: Leaf, location: '대기 배출구 C-1', content: '미세먼지 농도 상승', risk: '주의', time: '10:11:45' },
];

interface WidgetBrand {
  surfaceColor: string;
  backgroundColor: string;
  borderColor: string;
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
}

export default function PriorityRiskTable({ brand }: { brand?: Partial<WidgetBrand> }) {
  const surface    = brand?.surfaceColor    ?? '#111827';
  const bg         = brand?.backgroundColor ?? '#0b1120';
  const border     = brand?.borderColor     ?? '#1f2937';
  const textStrong = brand?.textStrongColor ?? '#E2E8F0';
  const textMuted  = brand?.textSoftColor   ?? '#94A3B8';

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case '위험': return 'text-red-500 border-red-500/30';
      case '경고': return 'text-yellow-500 border-yellow-500/30';
      case '주의': return 'text-orange-400 border-orange-500/30';
      default: return 'text-slate-400 border-slate-600';
    }
  };

  return (
    <div className="rounded-lg p-5 flex flex-col h-full" style={{ background: surface, borderWidth: 1, borderStyle: 'solid', borderColor: border }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: textStrong }}>위험 우선순위 목록</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-left">
          <thead style={{ color: textMuted, borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: border }}>
            <tr>
              <th className="pb-2 font-normal text-center">순위</th>
              <th className="pb-2 font-normal text-center">유형</th>
              <th className="pb-2 font-normal min-w-[120px]">위치</th>
              <th className="pb-2 font-normal min-w-[140px]">내용</th>
              <th className="pb-2 font-normal text-center w-16">위험도</th>
              <th className="pb-2 font-normal text-center w-20">발생 시간</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((item) => (
              <tr key={item.rank} style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: `${border}80` }}>
                <td className="py-2 text-center" style={{ color: textStrong }}>{item.rank}</td>
                <td className="py-2 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded border text-[10px] tracking-tighter ${getRiskColor(item.typeStr)}`}>{item.typeStr}</span>
                    <item.icon size={12} style={{ color: textMuted }} />
                  </div>
                </td>
                <td className="py-2 whitespace-nowrap" style={{ color: textStrong }}>{item.location}</td>
                <td className="py-2 whitespace-nowrap" style={{ color: textStrong }}>{item.content}</td>
                <td className="py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] ${getRiskColor(item.risk)}`} style={{ background: bg }}>{item.risk}</span>
                </td>
                <td className="py-2 text-center tracking-wider font-mono" style={{ color: textMuted }}>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center justify-center gap-1 mt-auto text-xs transition-colors w-full pt-4" style={{ color: textMuted }}>
        전체 보기 <ArrowRight size={12} />
      </button>
    </div>
  );
}
