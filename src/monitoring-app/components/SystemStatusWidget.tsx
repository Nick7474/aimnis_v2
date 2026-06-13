import { ArrowRight } from 'lucide-react';

interface MonitoringWidgetBrand {
  surfaceColor: string;
  borderColor: string;
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
  successColor: string;
}

const DEFAULT_BRAND: MonitoringWidgetBrand = {
  surfaceColor: '#111827',
  borderColor: '#1f2937',
  textStrongColor: '#f8fafc',
  textColor: '#cbd5e1',
  textSoftColor: '#94a3b8',
  successColor: '#10b981',
};

const mockData = [
  { item: 'AIoT 수집 서버', status: '정상', response: '18 ms', availability: 99.8 },
  { item: '데이터 처리 서버', status: '정상', response: '21 ms', availability: 99.8 },
  { item: 'DB 서버', status: '정상', response: '16 ms', availability: 99.8 },
  { item: '네트워크', status: '정상', response: '9 ms', availability: 99.8 },
];

export default function SystemStatusWidget({ brand = DEFAULT_BRAND }: { brand?: MonitoringWidgetBrand }) {
  const rowDivider = `${brand.borderColor}80`;
  const mutedSurface = `${brand.borderColor}4D`;

  return (
    <div className="rounded-lg border p-5 flex flex-col h-full" style={{ backgroundColor: brand.surfaceColor, borderColor: brand.borderColor }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: brand.textStrongColor }}>시스템 상태</h3>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs text-left">
          <thead className="border-b" style={{ color: brand.textSoftColor, borderColor: brand.borderColor }}>
            <tr>
              <th className="pb-2 font-normal whitespace-nowrap">항목</th>
              <th className="pb-2 font-normal text-center w-16 whitespace-nowrap">상태</th>
              <th className="pb-2 font-normal text-center w-20 whitespace-nowrap">응답 시간</th>
              <th className="pb-2 font-normal pl-4 min-w-[120px] whitespace-nowrap">가용율(24h)</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((data, i) => (
              <tr key={i} className="transition-colors" style={{ borderBottom: `1px solid ${rowDivider}` }} onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = mutedSurface; }} onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = 'transparent'; }}>
                 <td className="py-2.5 font-medium whitespace-nowrap" style={{ color: brand.textColor }}>{data.item}</td>
                 <td className="py-2.5 text-center">
                   <div className="flex items-center justify-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brand.successColor }} />
                     <span className="text-[11px] whitespace-nowrap" style={{ color: brand.successColor }}>{data.status}</span>
                   </div>
                 </td>
                 <td className="py-2.5 text-center font-mono text-[11px] whitespace-nowrap" style={{ color: brand.textColor }}>{data.response}</td>
                 <td className="py-2.5 pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full h-1.5 rounded-full overflow-hidden max-w-[120px]" style={{ backgroundColor: mutedSurface }}>
                      <div className="h-full rounded-full" style={{ width: `${data.availability}%`, backgroundColor: brand.successColor }} />
                    </div>
                    <span className="text-[10px] w-[30px] whitespace-nowrap text-right" style={{ color: brand.textSoftColor }}>{data.availability}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center justify-center gap-1 mt-auto text-xs transition-colors w-full p-2 rounded" style={{ color: brand.textSoftColor, backgroundColor: mutedSurface }}>
        시스템 상태 상세 보기 <ArrowRight size={12}/>
      </button>
    </div>
  );
}
