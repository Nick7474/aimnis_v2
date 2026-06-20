import { ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: '위험', value: 8,  color: '#ef4444' },
  { name: '경고', value: 28, color: '#f59e0b' },
  { name: '주의', value: 26, color: '#3b82f6' },
  { name: '정상', value: 92, color: '#10b981' },
];

interface WidgetBrand {
  surfaceColor: string;
  backgroundColor: string;
  borderColor: string;
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
}

export default function EquipmentStatusWidget({ setCurrentPage, brand }: { setCurrentPage?: (page: string) => void; brand?: Partial<WidgetBrand> }) {
  const surface    = brand?.surfaceColor    ?? '#111827';
  const bg         = brand?.backgroundColor ?? '#0b1120';
  const border     = brand?.borderColor     ?? '#1f2937';
  const textStrong = brand?.textStrongColor ?? '#E2E8F0';
  const textMuted  = brand?.textSoftColor   ?? '#94A3B8';

  return (
    <div className="rounded-lg p-5 flex flex-col h-full" style={{ background: surface, borderWidth: 1, borderStyle: 'solid', borderColor: border }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: textStrong }}>설비 진단</h3>
      <div className="flex flex-1 gap-2 mb-2">
        {/* Pie Chart Area */}
        <div className="w-1/2 flex flex-col items-center justify-center relative">
          <div className="text-xs absolute top-0 left-0" style={{ color: textMuted }}>위험도 분포</div>
          <div className="w-24 h-24 relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={28} outerRadius={42} paddingAngle={2} dataKey="value" stroke="none">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 text-[10px] text-center font-bold" style={{ color: textStrong }}>
              총 154대
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-2 w-full px-2">
            {data.map((entry, i) => (
              <div key={i} className="flex flex-row items-center justify-between text-[10px] font-medium" style={{ color: textMuted }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span style={{ color: entry.color }}>{entry.name}</span>
                </div>
                <span className="text-right" style={{ color: textStrong }}>{entry.value} <span className="font-normal" style={{ color: textMuted }}>({Math.round((entry.value / 154) * 100)}%)</span></span>
              </div>
            ))}
          </div>
        </div>
        {/* Top 3 Area */}
        <div className="w-1/2 flex flex-col">
          <div className="text-xs mb-2" style={{ color: textMuted }}>위험 상위 설비 TOP 3</div>
          <div className="flex flex-col gap-2">
            {[
              { rank: 1, name: '고압 순환펌프 P-102', risk: '위험' },
              { rank: 2, name: '보일러 FAN-101',      risk: '경고' },
              { rank: 3, name: '정수제 펌프 P-302',   risk: '경고' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] p-2 rounded" style={{ background: `${bg}80` }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: textMuted }}>{item.rank}</span>
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]" style={{ color: textStrong }} title={item.name}>{item.name}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded border text-[10px] ${item.risk === '위험' ? 'text-red-500 border-red-500/30' : 'text-yellow-500 border-yellow-500/30'}`} style={{ background: bg }}>{item.risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => setCurrentPage?.('설비 진단')} className="flex justify-end items-center gap-1 text-[11px] transition-colors mt-2" style={{ color: textMuted }}>
        상세 보기 <ArrowRight size={10} />
      </button>
    </div>
  );
}
