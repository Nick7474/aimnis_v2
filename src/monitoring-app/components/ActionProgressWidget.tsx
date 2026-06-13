import { ArrowRight } from 'lucide-react';

interface MonitoringWidgetBrand {
  primaryColor: string;
  surfaceColor: string;
  borderColor: string;
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
  successColor: string;
}

const DEFAULT_BRAND: MonitoringWidgetBrand = {
  primaryColor: '#2563eb',
  surfaceColor: '#111827',
  borderColor: '#1f2937',
  textStrongColor: '#f8fafc',
  textColor: '#cbd5e1',
  textSoftColor: '#94a3b8',
  successColor: '#10b981',
};

const mockData = [
  { item: '설비 점검', total: 35, inProgress: 12, completed: 23, rate: 65 },
  { item: '환경 점검', total: 18, inProgress: 6, completed: 12, rate: 67 },
  { item: '작업자 안전 점검', total: 42, inProgress: 9, completed: 33, rate: 79 },
  { item: '조치 요청', total: 28, inProgress: 4, completed: 24, rate: 86 },
];

export default function ActionProgressWidget({ brand = DEFAULT_BRAND }: { brand?: MonitoringWidgetBrand }) {
  const rowDivider = `${brand.borderColor}80`;
  const mutedSurface = `${brand.borderColor}4D`;

  return (
    <div className="rounded-lg border p-5 flex flex-col h-full" style={{ backgroundColor: brand.surfaceColor, borderColor: brand.borderColor }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: brand.textStrongColor }}>점검 · 조치 현황</h3>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs text-left">
          <thead className="border-b" style={{ color: brand.textSoftColor, borderColor: brand.borderColor }}>
            <tr>
              <th className="pb-2 font-normal whitespace-nowrap">항목</th>
              <th className="pb-2 font-normal text-center whitespace-nowrap w-12">전체</th>
              <th className="pb-2 font-normal text-center whitespace-nowrap w-16">진행 중</th>
              <th className="pb-2 font-normal text-center whitespace-nowrap w-12">완료</th>
              <th className="pb-2 font-normal pl-4 min-w-[80px]">완료율</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((data, i) => (
              <tr key={i} className="transition-colors" style={{ borderBottom: `1px solid ${rowDivider}` }} onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = mutedSurface; }} onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; }}>
                <td className="py-2.5 font-medium whitespace-nowrap" style={{ color: brand.textColor }}>{data.item}</td>
                <td className="py-2.5 text-center" style={{ color: brand.textColor }}>{data.total}</td>
                <td className="py-2.5 text-center" style={{ color: brand.successColor }}>{data.inProgress}</td>
                <td className="py-2.5 text-center" style={{ color: brand.textColor }}>{data.completed}</td>
                <td className="py-2.5 pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-1.5 rounded-full overflow-hidden max-w-[120px]" style={{ backgroundColor: mutedSurface }}>
                      <div className="h-full rounded-full" style={{ width: `${data.rate}%`, backgroundColor: brand.primaryColor }} />
                    </div>
                    <span className="text-[10px] w-6 text-right whitespace-nowrap" style={{ color: brand.textSoftColor }}>{data.rate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center justify-center gap-1 mt-auto text-xs transition-colors w-full pt-4" style={{ color: brand.textSoftColor }}>
        전체 보기 <ArrowRight size={12}/>
      </button>
    </div>
  );
}
