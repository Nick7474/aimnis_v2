import { ArrowRight } from 'lucide-react';

interface WidgetBrand {
  surfaceColor: string;
  borderColor: string;
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
}

export default function WorkerSafetyWidget({ setCurrentPage, brand }: { setCurrentPage?: (page: string) => void; brand?: Partial<WidgetBrand> }) {
  const surface    = brand?.surfaceColor    ?? '#111827';
  const border     = brand?.borderColor     ?? '#1f2937';
  const textStrong = brand?.textStrongColor ?? '#E2E8F0';
  const textMuted  = brand?.textSoftColor   ?? '#94A3B8';

  return (
    <div className="rounded-lg p-5 flex flex-col h-full" style={{ background: surface, borderWidth: 1, borderStyle: 'solid', borderColor: border }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: textStrong }}>작업자 안전</h3>
      <div className="flex flex-1 gap-4 mb-2">
        {/* Status */}
        <div className="w-1/2 flex flex-col">
          <div className="text-xs mb-2" style={{ color: textMuted }}>작업자 현황</div>
          <table className="w-full text-xs">
            <tbody>
              <tr style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: `${border}80` }}>
                <td className="py-2.5" style={{ color: textMuted }}>전체</td>
                <td className="py-2.5 text-right"><span className="font-bold" style={{ color: textStrong }}>35</span> <span className="text-[10px]" style={{ color: textMuted }}>명</span></td>
              </tr>
              <tr style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: `${border}80` }}>
                <td className="py-2.5 text-emerald-400 font-medium tracking-tighter">정상</td>
                <td className="py-2.5 text-right whitespace-nowrap"><span className="text-emerald-400 font-bold">30</span> <span className="text-[10px]" style={{ color: textMuted }}>명</span> <span className="text-[10px] tracking-tighter ml-1" style={{ color: textMuted }}>(86%)</span></td>
              </tr>
              <tr style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: `${border}80` }}>
                <td className="py-2.5 text-yellow-500 font-medium tracking-tighter">주의</td>
                <td className="py-2.5 text-right whitespace-nowrap"><span className="text-yellow-500 font-bold">4</span> <span className="text-[10px]" style={{ color: textMuted }}>명</span> <span className="text-[10px] tracking-tighter ml-1" style={{ color: textMuted }}>(11%)</span></td>
              </tr>
              <tr style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: `${border}80` }}>
                <td className="py-2.5 text-red-500 font-medium tracking-tighter">위험</td>
                <td className="py-2.5 text-right whitespace-nowrap"><span className="text-red-500 font-bold">1</span> <span className="text-[10px]" style={{ color: textMuted }}>명</span> <span className="text-[10px] tracking-tighter ml-1" style={{ color: textMuted }}>(3%)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Top 3 */}
        <div className="w-1/2 flex flex-col pl-4" style={{ borderLeftWidth: 1, borderLeftStyle: 'solid', borderLeftColor: `${border}80` }}>
          <div className="text-xs mb-2 whitespace-nowrap" style={{ color: textMuted }}>주의 필요 작업자 TOP 3</div>
          <div className="flex flex-col gap-2 mt-1">
            {[
              { rank: 1, name: '김서부 (A-01)', measure: '38.6', unit: '°C' },
              { rank: 2, name: '이안전 (B-03)', measure: '37.9', unit: '°C' },
              { rank: 3, name: '박현장 (C-02)', measure: '37.7', unit: '°C' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col text-[11px] py-1.5 h-10 justify-center" style={{ borderBottomWidth: 1, borderBottomStyle: 'solid', borderBottomColor: `${border}80` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 max-w-[90px] overflow-hidden whitespace-nowrap">
                    <span className="shrink-0" style={{ color: textMuted }}>{item.rank}</span>
                    <span className="text-ellipsis overflow-hidden" style={{ color: textStrong }} title={item.name}>{item.name}</span>
                  </div>
                  <div className="text-orange-400 font-bold whitespace-nowrap shrink-0">{item.measure} <span className="text-[10px] font-normal">{item.unit}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => setCurrentPage?.('작업자 안전')} className="flex justify-end items-center gap-1 text-[11px] transition-colors mt-auto pt-2" style={{ color: textMuted }}>
        상세 보기 <ArrowRight size={10} />
      </button>
    </div>
  );
}
