import { MoreVertical, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const data = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, '0')}:00`,
  vibration: Math.random() * 20 + 20 + (i === 15 ? 40 : 0),
  temp: Math.random() * 15 + 30 + (i === 18 ? 30 : 0),
  thermal: Math.random() * 10 + 10,
  gas: Math.random() * 5 + 5 + (i === 8 ? 20 : 0),
}));

const tableData = [
  { id: 'EQ-021', name: '펌프 P-02', location: 'A동 2층', cases: 92, issue: '베어링 파열, 진동 상승', time: '10:23', color: 'bg-red-500' },
  { id: 'EQ-015', name: '모터 M-205', location: 'A동 3층', cases: 78, issue: '베어링 마모, 진동 이상', time: '10:21', color: 'bg-orange-500' },
  { id: 'EQ-007', name: '압축기 C-301', location: 'B동 1층', cases: 56, issue: '진동 증가', time: '10:22', color: 'bg-yellow-500' },
  { id: 'EQ-033', name: '팬 FAN-304', location: 'B동 3층', cases: 32, issue: '전류 불균형', time: '10:18', color: 'bg-emerald-500' },
  { id: 'EQ-018', name: '냉각기 C-101', location: 'A동 1층', cases: 28, issue: '정상 범위', time: '10:21', color: 'bg-emerald-500' },
  { id: 'EQ-045', name: '컨베이어 벨트 B-1', location: 'C동 1층', cases: 22, issue: '정상 범위', time: '10:15', color: 'bg-emerald-500' },
  { id: 'EQ-062', name: '항온항습기 H-05', location: 'A동 4층', cases: 18, issue: '필터 점검 요망', time: '10:05', color: 'bg-emerald-500' },
  { id: 'EQ-011', name: '발전기 G-01', location: '특고압실', cases: 5, issue: '정상 범위', time: '09:55', color: 'bg-emerald-500' },
  { id: 'EQ-084', name: '배기팬 V-02', location: 'B동 옥상', cases: 41, issue: '베어링 소음', time: '09:40', color: 'bg-yellow-500' },
];

interface BrandColors {
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
  borderColor: string;
  surfaceColor: string;
}

const DEFAULT_BRAND: BrandColors = {
  textStrongColor: '#f8fafc',
  textColor: '#cbd5e1',
  textSoftColor: '#94a3b8',
  borderColor: '#1f2937',
  surfaceColor: '#1e293b',
};

export default function MainChartSection({ brand, title }: { brand?: BrandColors; title?: string }) {
  const colors = brand ?? DEFAULT_BRAND;

  return (
    <div className="flex flex-col w-full h-full">
      <div
        className="px-4 py-3 lg:px-5 lg:py-4 border-b shrink-0"
        style={{ borderColor: colors.borderColor + '80' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold tracking-wide" style={{ color: colors.textStrongColor }}>{title ?? '설비 이상 현황'}</h2>
          <button style={{ color: colors.textSoftColor }}>
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 lg:p-5 gap-4 overflow-y-auto custom-scrollbar">
        {/* Chart Header / Legend */}
        <div className="flex flex-wrap items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs font-medium">
            <button className="px-3 py-1.5 rounded-md bg-blue-600 text-white shadow-sm">
              전체
            </button>
            <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
               <div className="w-2 h-2 rounded-full bg-blue-400" /> 측정값
            </div>
            <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
               <div className="w-2 h-2 rounded-full bg-orange-400" /> 진동
            </div>
            <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
               <div className="w-2 h-2 rounded-full bg-red-400" /> 온도
            </div>
            <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
               <div className="w-2 h-2 rounded-full bg-purple-400" /> 열화상
            </div>
            <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
               <div className="w-2 h-2 rounded-full bg-cyan-400" /> 가스
            </div>
          </div>
          <div className="text-xs flex justify-between w-full mt-2 lg:hidden" style={{ color: colors.textSoftColor }}>
            <span>이상 건수</span>
            <span>이상 건수</span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="w-full h-48 shrink-0 relative">
          <div className="absolute top-0 text-[10px] left-0 hidden lg:block" style={{ color: colors.textSoftColor }}>이상 건수<br/>100</div>
          <div className="absolute top-0 text-[10px] right-0 hidden lg:block" style={{ color: colors.textSoftColor }}>이상 건수<br/>100</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.borderColor} vertical={false} />
              <XAxis dataKey="time" stroke={colors.textSoftColor} fontSize={11} tickLine={false} axisLine={false} tickMargin={10} minTickGap={20} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: colors.surfaceColor, borderColor: colors.borderColor, color: colors.textStrongColor, borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: colors.textSoftColor, marginBottom: '4px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="vibration" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="thermal" stroke="#a855f7" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="gas" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Table Area */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-end shrink-0">
            <h3 className="text-sm font-bold" style={{ color: colors.textColor }}>
              설비 목록 <span className="text-[10px] font-normal" style={{ color: colors.textSoftColor }}>(단위: 대, 건수)</span>
            </h3>
            <button className="text-[10px] text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors">전체 항목 보기 <ArrowRight size={10}/></button>
          </div>
          <div className="w-full">
            <table className="w-full text-xs text-left">
              <thead style={{ color: colors.textSoftColor, borderBottom: `1px solid ${colors.borderColor}` }}>
                <tr>
                  <th className="font-normal py-1 px-2 whitespace-nowrap">설비 ID</th>
                  <th className="font-normal py-1 px-2 whitespace-nowrap">설비명</th>
                  <th className="font-normal py-1 px-2 whitespace-nowrap">위치</th>
                  <th className="font-normal py-1 px-2 text-center whitespace-nowrap">이상 건수</th>
                  <th className="font-normal py-1 px-2 whitespace-nowrap hidden sm:table-cell">주요 이상</th>
                  <th className="font-normal py-1 px-2 whitespace-nowrap text-right">최근 진단</th>
                </tr>
              </thead>
              <tbody>
                {tableData.slice(0, 4).map((row) => (
                  <tr key={row.id} style={{ color: colors.textColor, borderTop: `1px solid ${colors.borderColor}80` }}>
                    <td className="py-2 px-2 whitespace-nowrap" style={{ color: colors.textSoftColor }}>{row.id}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{row.name}</td>
                    <td className="py-2 px-2 whitespace-nowrap" style={{ color: colors.textSoftColor }}>{row.location}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2 justify-center">
                        <span className={row.cases > 50 ? 'text-red-400' : row.cases > 30 ? 'text-yellow-400' : 'text-emerald-400'}>{row.cases}</span>
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.borderColor }}>
                          <div className={`h-full ${row.color}`} style={{ width: `${row.cases}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 truncate hidden sm:table-cell max-w-[120px]" title={row.issue} style={{ color: colors.textSoftColor }}>{row.issue}</td>
                    <td className="py-2 px-2 whitespace-nowrap text-right" style={{ color: colors.textSoftColor }}>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
