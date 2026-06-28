import { MoreVertical, ArrowRight, User } from 'lucide-react';

const workers = [
  { id: 1, name: '홍길동', role: '안전팀', location: 'A동 2층', spo2: 97, hr: 72, fall: '정상', status: '정상' },
  { id: 2, name: '이영희', role: '설비팀', location: 'B동 1층', spo2: 94, hr: 98, fall: '정상', status: '주의' },
  { id: 3, name: '박민수', role: '전기팀', location: 'A동 3층', spo2: 100, hr: 104, fall: '정상', status: '주의' },
  { id: 4, name: '김지훈', role: '설비팀', location: 'B동 2층', spo2: null, hr: null, fall: '낙상 감지', status: '위험' },
  { id: 5, name: '최현우', role: '유지보수', location: 'C동 1층', spo2: 98, hr: 80, fall: '정상', status: '정상' },
  { id: 6, name: '강석기', role: '기계팀', location: '현장 외곽', spo2: 96, hr: 85, fall: '정상', status: '정상' },
];

interface BrandColors {
  textStrongColor: string;
  textColor: string;
  textSoftColor: string;
  borderColor: string;
  surfaceColor: string;
  backgroundColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  accentColor: string;
}

const DEFAULT_BRAND: BrandColors = {
  textStrongColor: '#f8fafc',
  textColor: '#cbd5e1',
  textSoftColor: '#94a3b8',
  borderColor: '#1f2937',
  surfaceColor: '#111827',
  backgroundColor: '#0b1120',
  successColor: '#10b981',
  warningColor: '#eab308',
  dangerColor: '#ef4444',
  accentColor: '#3b82f6',
};

export default function WorkerSafetySection({ brand, title }: { brand?: Partial<BrandColors>; title?: string }) {
  const colors = { ...DEFAULT_BRAND, ...brand };

  const getStatusStyle = (status: string) => {
    if (status === '정상') return { color: colors.successColor, backgroundColor: `${colors.successColor}1a`, borderColor: `${colors.successColor}40` };
    if (status === '주의') return { color: colors.warningColor, backgroundColor: `${colors.warningColor}1a`, borderColor: `${colors.warningColor}40` };
    if (status === '위험') return { color: colors.dangerColor, backgroundColor: `${colors.dangerColor}1a`, borderColor: `${colors.dangerColor}40` };
    return { color: colors.textSoftColor, backgroundColor: `${colors.borderColor}4D`, borderColor: colors.borderColor };
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="px-4 py-3 lg:px-5 lg:py-4 border-b shrink-0" style={{ borderColor: colors.borderColor + '80' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold tracking-wide" style={{ color: colors.textStrongColor }}>{title ?? '작업자 안전 현황'}</h2>
          <button style={{ color: colors.textSoftColor }}><MoreVertical size={18} /></button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <div className="text-[10px]" style={{ color: colors.textSoftColor }}>전체 작업자</div>
            <div className="text-xl font-bold" style={{ color: colors.accentColor }}>35<span className="text-[10px] font-normal ml-1" style={{ color: colors.textSoftColor }}>명</span></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px]" style={{ color: colors.textSoftColor }}>정상</div>
            <div className="text-xl font-bold" style={{ color: colors.successColor }}>30<span className="text-[10px] font-normal ml-1" style={{ color: colors.textSoftColor }}>(86%)</span></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px]" style={{ color: colors.textSoftColor }}>주의</div>
            <div className="text-xl font-bold" style={{ color: colors.warningColor }}>4<span className="text-[10px] font-normal ml-1" style={{ color: colors.textSoftColor }}>(11%)</span></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px]" style={{ color: colors.textSoftColor }}>위험</div>
            <div className="text-xl font-bold" style={{ color: colors.dangerColor }}>1<span className="text-[10px] font-normal ml-1" style={{ color: colors.textSoftColor }}>(3%)</span></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 lg:p-5 flex flex-col gap-5">
          <div className="rounded-lg overflow-hidden flex flex-col shrink-0 border" style={{ borderColor: colors.borderColor, backgroundColor: colors.backgroundColor }}>
            <div className="p-2 px-3 border-b flex justify-between items-center" style={{ borderColor: colors.borderColor, backgroundColor: colors.surfaceColor }}>
              <span className="text-xs font-medium" style={{ color: colors.textColor }}>위치 / 구역 맵</span>
              <select className="text-xs rounded px-2 py-0.5 outline-none border" style={{ backgroundColor: colors.surfaceColor, color: colors.textColor, borderColor: colors.borderColor }}>
                <option>A동 2층</option>
                <option>A동 3층</option>
                <option>B동 1층</option>
              </select>
            </div>
            <div className="relative h-32 w-full" style={{ backgroundColor: colors.backgroundColor }}>
              <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${colors.borderColor}60 1px, transparent 1px), linear-gradient(90deg, ${colors.borderColor}60 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
              <div className="absolute top-4 left-4 w-1/2 h-1/2 border-2 rounded-sm" style={{ borderColor: `${colors.borderColor}80` }} />
              <div className="absolute top-4 right-4 w-1/3 h-2/3 border-2 rounded-sm" style={{ borderColor: `${colors.borderColor}80` }} />
              <div className="absolute top-10 left-12 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.successColor, boxShadow: `0 0 8px ${colors.successColor}cc` }} />
              <div className="absolute bottom-8 left-20 w-3 h-3 rounded-full" style={{ backgroundColor: colors.successColor, boxShadow: `0 0 8px ${colors.successColor}cc` }} />
              <div className="absolute top-6 right-16 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: colors.warningColor, boxShadow: `0 0 8px ${colors.warningColor}cc` }} />
              <div className="absolute bottom-10 right-10 w-4 h-4 rounded-full animate-ping" style={{ backgroundColor: colors.dangerColor, boxShadow: `0 0 12px ${colors.dangerColor}` }} />
              <div className="absolute bottom-10 right-10 w-2 h-2 bg-white rounded-full m-1" />
            </div>
            <div className="p-2 px-3 flex justify-end gap-3 text-[10px]" style={{ backgroundColor: colors.surfaceColor, color: colors.textSoftColor }}>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.successColor }} />정상</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.warningColor }} />주의</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.dangerColor }} />위험</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />오프라인</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 p-1">
            <h3 className="text-sm font-medium" style={{ color: colors.textColor }}>작업자 상태</h3>
            <table className="w-full text-xs text-left">
              <thead style={{ color: colors.textSoftColor, borderBottom: `1px solid ${colors.borderColor}` }}>
                <tr>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">작업자</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">위치</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">SpO2</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">심박수</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap">낙상 감지</th>
                  <th className="font-normal py-1 px-1 whitespace-nowrap text-center">상태</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id} style={{ color: colors.textColor, borderTop: `1px solid ${colors.borderColor}80` }}>
                    <td className="py-2.5 px-1 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: colors.borderColor }}>
                          <User size={12} style={{ color: colors.textSoftColor }} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium" style={{ color: colors.textStrongColor }}>{w.name}</span>
                          <span className="text-[9px]" style={{ color: colors.textSoftColor }}>{w.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: colors.textSoftColor }}>{w.location}</td>
                    <td className="py-2.5 px-1 whitespace-nowrap">
                      {w.spo2 != null ? (
                        <span className="text-[10px] px-1 rounded-sm" style={w.spo2 >= 95 ? { color: colors.successColor, backgroundColor: `${colors.successColor}33` } : { color: colors.warningColor, backgroundColor: `${colors.warningColor}33` }}>
                          {w.spo2}
                        </span>
                      ) : <span style={{ color: colors.textSoftColor }}>-</span>}
                    </td>
                    <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: colors.textSoftColor }}>{w.hr ? `${w.hr} bpm` : '-'}</td>
                    <td className="py-2.5 px-1 whitespace-nowrap" style={{ color: w.fall === '낙상 감지' ? colors.dangerColor : colors.textSoftColor, fontWeight: w.fall === '낙상 감지' ? 600 : 400 }}>{w.fall}</td>
                    <td className="py-2.5 px-1 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border" style={getStatusStyle(w.status)}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="text-[10px] flex items-center gap-1 transition-colors mt-2" style={{ color: colors.accentColor }}>
              전체 작업자 보기 <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
