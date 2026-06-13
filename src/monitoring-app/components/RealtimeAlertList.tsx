import { ArrowRight } from 'lucide-react';

interface MonitoringWidgetBrand {
  surfaceColor: string;
  borderColor: string;
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
  warningColor: string;
  dangerColor: string;
}

const DEFAULT_BRAND: MonitoringWidgetBrand = {
  surfaceColor: '#111827',
  borderColor: '#1f2937',
  textStrongColor: '#f8fafc',
  textColor: '#cbd5e1',
  textSoftColor: '#94a3b8',
  warningColor: '#eab308',
  dangerColor: '#ef4444',
};

const mockData = [
  { time: '10:22:14', typeStr: '위험', content: '고압 순환펌프 P-102 진동 RMS 초과', location: '설비동 1층' },
  { time: '10:19:35', typeStr: '경고', content: '배연 탈황 설비 SO2 농도 상승 (28ppm)', location: '환경동 2층' },
  { time: '10:16:59', typeStr: '경고', content: '정비동 A구역 3번 작업자 체온 경고', location: '정비동 A구역' },
  { time: '10:13:12', typeStr: '주의', content: '복수처리 설비 3호 pH 편차 증가', location: '수처리동 1층' },
];

export default function RealtimeAlertList({ brand = DEFAULT_BRAND }: { brand?: MonitoringWidgetBrand }) {
  const rowDivider = `${brand.borderColor}80`;
  const hoverSurface = `${brand.borderColor}4D`;

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case '위험': return { color: brand.dangerColor, borderColor: `${brand.dangerColor}55` };
      case '경고': return { color: brand.warningColor, borderColor: `${brand.warningColor}55` };
      case '주의': return { color: '#fb923c', borderColor: '#f9731655' };
      default: return { color: brand.textSoftColor, borderColor: brand.borderColor };
    }
  };

  return (
    <div className="rounded-lg border p-5 flex flex-col h-full" style={{ backgroundColor: brand.surfaceColor, borderColor: brand.borderColor }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: brand.textStrongColor }}>실시간 알림</h3>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-[11px] text-left">
          <thead className="border-b" style={{ color: brand.textSoftColor, borderColor: brand.borderColor }}>
            <tr>
              <th className="pb-2 font-normal w-[70px] whitespace-nowrap">시간</th>
              <th className="pb-2 font-normal w-[50px] text-center whitespace-nowrap">유형</th>
              <th className="pb-2 font-normal min-w-[200px]">내용</th>
              <th className="pb-2 font-normal text-right w-[100px] whitespace-nowrap">위치</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((item, i) => (
              <tr key={i} className="transition-colors" style={{ borderBottom: `1px solid ${rowDivider}` }} onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = hoverSurface; }} onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; }}>
                <td className="py-3 font-mono tracking-wider" style={{ color: brand.textSoftColor }}>{item.time}</td>
                <td className="py-3 text-center">
                    <span className="px-1.5 py-0.5 rounded border text-[10px] tracking-tighter" style={getRiskColor(item.typeStr)}>{item.typeStr}</span>
                </td>
                <td className="py-3" style={{ color: brand.textColor }}>{item.content}</td>
                <td className="py-3 text-right tracking-tighter" style={{ color: brand.textSoftColor }}>{item.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center justify-center gap-1 mt-auto text-xs transition-colors w-full p-2 rounded" style={{ color: brand.textSoftColor, backgroundColor: hoverSurface }}>
        전체 알림 보기 <ArrowRight size={12}/>
      </button>
    </div>
  );
}
