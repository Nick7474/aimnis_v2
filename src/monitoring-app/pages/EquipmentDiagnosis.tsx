import { useState } from 'react';
import { Search, Settings, Activity, AlertTriangle, ChevronRight, Volume2, Thermometer, Wind, CheckCircle2, History } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { BrandSettings } from '@/lib/brandPresets';

interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  status: '정상' | '주의' | '위험';
  mainIssue: string;
  healthScore: number;
  lastUpdated: string;
  actionStatus: '미조치' | '점검 중' | '완료';
  sensorData: {
    ultrasound: { value: number; status: '정상' | '주의' | '위험' };
    vibration: { value: number; status: '정상' | '주의' | '위험' };
    temperature: { value: number; status: '정상' | '주의' | '위험' };
    thermal: { value: number; status: '정상' | '주의' | '위험' };
    gas: { value: number; status: '정상' | '주의' | '위험' };
  };
}

const mockAssets: Asset[] = [
  { id: 'P-102', name: '1호 보일러 급수펌프 P-102', type: '회전기기', location: '1호기 / 보일러동', status: '위험', mainIssue: '진동 증가', healthScore: 92, lastUpdated: '2024-05-21 10:22', actionStatus: '미조치', sensorData: { ultrasound: { value: 45, status: '정상' }, vibration: { value: 8.5, status: '위험' }, temperature: { value: 78, status: '주의' }, thermal: { value: 80, status: '정상' }, gas: { value: 0, status: '정상' } } },
  { id: 'P-202', name: '2호 냉각수펌프 P-202', type: '회전기기', location: '2호기 / 터빈동', status: '주의', mainIssue: '베어링 온도 상승', healthScore: 68, lastUpdated: '2024-05-21 10:20', actionStatus: '점검 중', sensorData: { ultrasound: { value: 50, status: '주의' }, vibration: { value: 4.2, status: '정상' }, temperature: { value: 85, status: '위험' }, thermal: { value: 82, status: '주의' }, gas: { value: 0, status: '정상' } } },
  { id: 'G-101', name: '1호 발전기 G-101', type: '회전기기', location: '1호기 / 발전기동', status: '정상', mainIssue: '이상 없음', healthScore: 12, lastUpdated: '2024-05-21 10:20', actionStatus: '완료', sensorData: { ultrasound: { value: 20, status: '정상' }, vibration: { value: 1.5, status: '정상' }, temperature: { value: 45, status: '정상' }, thermal: { value: 46, status: '정상' }, gas: { value: 0, status: '정상' } } },
  { id: 'A-01', name: '배전반 A-01', type: '전기설비', location: '공통 / 전기실', status: '주의', mainIssue: '부분 방전 발생', healthScore: 55, lastUpdated: '2024-05-21 10:18', actionStatus: '미조치', sensorData: { ultrasound: { value: 75, status: '위험' }, vibration: { value: 0.2, status: '정상' }, temperature: { value: 50, status: '정상' }, thermal: { value: 55, status: '주의' }, gas: { value: 5, status: '정상' } } },
];

const mockTrendData = Array.from({ length: 20 }, (_, i) => ({
  time: `10:${i.toString().padStart(2, '0')}`,
  value: Math.random() * 2 + 6 + (i > 10 ? i * 0.2 : 0)
}));

const mockHistory = [
  { id: 1, date: '2024-05-20 09:15', type: '진동 증가', level: '위험', action: '베어링 교체 및 정렬 조정', user: '기계설비부', status: '완료' },
  { id: 2, date: '2024-05-18 14:32', type: '온도 상승', level: '주의', action: '윤활 상태 점검 및 보충', user: '기계설비부', status: '완료' },
];

interface Props {
  brand?: BrandSettings;
}

export default function EquipmentDiagnosis({ brand }: Props) {
  const bg         = brand?.backgroundColor ?? '#0b1120';
  const surface    = brand?.surfaceColor     ?? '#111827';
  const border     = brand?.borderColor      ?? '#1f2937';
  const primary    = brand?.primaryColor     ?? '#2563EB';
  const textStrong = brand?.textStrongColor  ?? '#F8FAFC';
  const textMuted  = brand?.textSoftColor    ?? '#94A3B8';

  function hexLum(hex: string) {
    const h = hex.replace('#', '');
    return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
  }
  const isLight = hexLum(bg) > 0.5;
  const th = {
    tableHead:   isLight ? '#EEF1F7'         : 'rgba(30,41,59,.5)',
    rowSelected: isLight ? `${primary}1a`    : '#1e293b',
    rowDivider:  border,
    chartGrid:   isLight ? 'rgba(0,0,0,.08)' : '#334155',
    tooltipBg:   surface,
    tooltipBd:   border,
  };

  const [activeTab, setActiveTab] = useState('전체 설비');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '정상': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case '주의': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case '위험': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case '미조치': return 'text-red-400 border-red-500/30';
      case '점검 중': return 'text-yellow-400 border-yellow-500/30';
      case '완료': return 'text-blue-400 border-blue-500/30';
      default: return 'text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header & Tabs */}
      <div className="shrink-0 mb-4 lg:mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: textStrong }}>
          설비 진단
        </h2>
        <div className="flex items-center gap-6 border-b" style={{ borderColor: border }}>
          {['전체 설비', '위험 설비', '점검 이력'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedAsset(null); }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors`}
              style={activeTab === tab ? { color: primary, borderColor: primary } : { color: textMuted, borderColor: 'transparent' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6 flex-1 overflow-auto pb-[20px] pr-2 custom-scrollbar">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="border rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 w-full" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
               <Settings size={24} className="text-blue-400" />
            </div>
            <div className="flex flex-col">
               <div className="text-sm font-medium" style={{ color: textMuted }}>전체 설비</div>
               <div className="text-3xl font-bold mt-0.5" style={{ color: textStrong }}>156 <span className="text-sm font-normal" style={{ color: textMuted }}>대</span></div>
            </div>
          </div>
          <div className="border rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 w-full" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
               <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div className="flex flex-col">
               <div className="text-sm font-medium" style={{ color: textMuted }}>정상 설비</div>
               <div className="text-3xl font-bold mt-0.5" style={{ color: textStrong }}>112 <span className="text-sm font-normal" style={{ color: textMuted }}>대</span></div>
            </div>
          </div>
          <div className="border rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 w-full" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
               <AlertTriangle size={24} className="text-yellow-500" />
            </div>
            <div className="flex flex-col">
               <div className="text-sm font-medium" style={{ color: textMuted }}>주의/위험 설비</div>
               <div className="text-3xl font-bold mt-0.5" style={{ color: textStrong }}>28 <span className="text-sm font-normal" style={{ color: textMuted }}>대</span></div>
            </div>
          </div>
          <div className="border rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 w-full" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center shrink-0">
               <History size={24} className="text-slate-400" />
            </div>
            <div className="flex flex-col">
               <div className="text-sm font-medium" style={{ color: textMuted }}>미점검 설비</div>
               <div className="text-3xl font-bold mt-0.5" style={{ color: textStrong }}>16 <span className="text-sm font-normal" style={{ color: textMuted }}>대</span></div>
            </div>
          </div>
        </div>

        {activeTab === '점검 이력' ? (
          <div className="border rounded-xl flex flex-col overflow-hidden min-h-[400px]" style={{ background: surface, borderColor: border }}>
             <div className="px-4 py-3 border-b text-sm font-bold" style={{ borderColor: border, color: textStrong }}>
               최근 점검 이력
             </div>
             <div className="p-4 flex-1" style={{ background: bg }}>
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-slate-500 border-b" style={{ borderColor: border }}>
                    <tr>
                      <th className="pb-2 font-medium">점검 일시</th>
                      <th className="pb-2 font-medium">이상 유형</th>
                      <th className="pb-2 font-medium">위험 등급</th>
                      <th className="pb-2 font-medium">조치 내역</th>
                      <th className="pb-2 font-medium text-center">조치자 (부서)</th>
                      <th className="pb-2 font-medium text-center">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockHistory.map(h => (
                      <tr key={h.id} style={{ borderBottom: `1px solid ${th.rowDivider}` }}>
                        <td className="py-2.5 text-slate-400">{h.date}</td>
                        <td className="py-2.5 text-slate-200">{h.type}</td>
                        <td className="py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] border ${getStatusColor(h.level)}`}>{h.level}</span></td>
                        <td className="py-2.5 text-slate-400">{h.action}</td>
                        <td className="py-2.5 text-center text-slate-500">{h.user}</td>
                        <td className="py-2.5 text-center" style={{ color: primary }}>{h.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        ) : (
          <>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="설비명을 입력하세요"
              className="border rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 outline-none w-[240px]"
              style={{ background: surface, borderColor: border }}
            />
          </div>

          <select className="border rounded-lg px-3 py-2 text-sm text-slate-300 outline-none min-w-[120px]" style={{ background: surface, borderColor: border }}>
            <option>위치: 전체</option>
            <option>1호기 / 보일러동</option>
            <option>2호기 / 터빈동</option>
          </select>

          <div className="flex items-center border rounded-lg p-1" style={{ background: surface, borderColor: border }}>
            {['전체', '정상', '주의', '위험'].map(s => (
               <button
                 key={s}
                 className={`px-3 py-1 text-sm rounded ${s === '전체' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                 style={s === '전체' ? { backgroundColor: primary } : undefined}
               >
                 {s}
               </button>
            ))}
          </div>

          <div className="flex items-center border rounded-lg p-1 ml-auto" style={{ background: surface, borderColor: border }}>
             <div className="px-3 text-xs text-slate-500 mr-2">센서 유형:</div>
            {['전체', '초음파', '진동', '온도', '열화상', '가스'].map(s => (
               <button
                 key={s}
                 className={`px-3 py-1 text-sm rounded ${s === '전체' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                 style={s === '전체' ? { backgroundColor: primary } : undefined}
               >
                 {s}
               </button>
            ))}
          </div>

          <select className="border rounded-lg px-3 py-2 text-sm text-slate-300 outline-none" style={{ background: surface, borderColor: border }}>
            <option>조치 상태: 전체</option>
            <option>미조치</option>
            <option>점검 중</option>
            <option>완료</option>
          </select>
        </div>

        {/* Content Area (List + Detail) */}
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 flex-1 min-h-[500px]">
          {/* Enhanced List */}
          <div
            className={`border rounded-xl flex flex-col overflow-hidden transition-all duration-300 ${selectedAsset ? 'xl:w-[60%] shrink-0' : 'w-full'}`}
            style={{ background: surface, borderColor: border }}
          >
            <div className="px-4 py-3 border-b text-sm font-bold" style={{ borderColor: border, color: textStrong }}>
              설비 목록
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs border-b" style={{ background: th.tableHead, borderColor: border, color: textMuted }}>
                  <tr>
                    <th className="px-4 py-3 font-medium">상태</th>
                    <th className="px-4 py-3 font-medium">설비명</th>
                    <th className="px-4 py-3 font-medium">위치</th>
                    <th className="px-4 py-3 font-medium">주요 이상</th>
                    <th className="px-4 py-3 font-medium text-center">이상 점수</th>
                    <th className="px-4 py-3 font-medium">최근 측정 시간</th>
                    <th className="px-4 py-3 font-medium text-center">조치 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === '위험 설비' ? mockAssets.filter(a => a.status === '주의' || a.status === '위험') : mockAssets).map((asset) => (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: `1px solid ${th.rowDivider}`, background: selectedAsset?.id === asset.id ? th.rowSelected : undefined }}
                    >
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(asset.status)}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: textStrong }}>{asset.name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: textMuted }}>{asset.location}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: textMuted }}>{asset.mainIssue}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${asset.healthScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>{asset.healthScore}</span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: textMuted }}>{asset.lastUpdated}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs border px-2 py-0.5 rounded-full ${getActionStatusColor(asset.actionStatus)}`}>{asset.actionStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-slate-500" style={{ borderColor: border }}>
               <span>전체 156건</span>
               <div className="flex gap-1">
                 <button className="px-2 py-1 rounded">이전</button>
                 <button className="px-2 py-1 rounded" style={{ backgroundColor: `${primary}33`, color: primary }}>1</button>
                 <button className="px-2 py-1 rounded">다음</button>
               </div>
            </div>
          </div>

          {/* Details Panel */}
          {selectedAsset && (
            <div
              className="border rounded-xl flex flex-col w-full xl:w-[40%] shrink-0 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 fade-in duration-200"
              style={{ background: surface, borderColor: border }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between sticky top-0 z-10" style={{ background: surface, borderColor: border }}>
                <span className="text-sm font-bold" style={{ color: textStrong }}>설비 상세</span>
                <button onClick={() => setSelectedAsset(null)} className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1">
                  닫기 <ChevronRight size={14} />
                </button>
              </div>

              <div className="p-4 flex flex-col gap-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                   <div className="col-span-2">
                     <div className="text-xs text-slate-500 mb-1">설비명</div>
                     <div className="font-bold text-slate-200">{selectedAsset.name}</div>
                   </div>
                   <div>
                     <div className="text-xs text-slate-500 mb-1">설비 ID</div>
                     <div className="text-slate-300">{selectedAsset.id}</div>
                   </div>
                   <div>
                     <div className="text-xs text-slate-500 mb-1">최근 측정 시간</div>
                     <div className="text-slate-300">{selectedAsset.lastUpdated}</div>
                   </div>
                   <div>
                     <div className="text-xs text-slate-500 mb-1">위치</div>
                     <div className="text-slate-300">{selectedAsset.location}</div>
                   </div>
                   <div>
                     <div className="text-xs text-slate-500 mb-1">현재 상태</div>
                     <span className={`px-2 py-0.5 rounded text-xs font-medium border inline-block ${getStatusColor(selectedAsset.status)}`}>
                        {selectedAsset.status}
                     </span>
                   </div>
                </div>

                {/* Sensor Status Grid */}
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-3 border-b pb-1" style={{ borderColor: border }}>센서 상태별 요약</div>
                  <div className="grid grid-cols-2 gap-3">
                     {[
                       { label: '초음파', icon: Volume2, key: 'ultrasound' },
                       { label: '진동', icon: Activity, key: 'vibration' },
                       { label: '온도', icon: Thermometer, key: 'temperature' },
                       { label: '열화상', icon: Thermometer, key: 'thermal' },
                       { label: '가스', icon: Wind, key: 'gas' },
                     ].map(sensor => (
                       <div
                         key={sensor.key}
                         className="flex items-center justify-between border p-2.5 rounded-lg"
                         style={{ background: bg, borderColor: border }}
                       >
                         <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <sensor.icon size={14} className="text-slate-500" /> {sensor.label}
                         </div>
                         <span className={`text-[11px] px-1.5 py-0.5 border rounded ${getStatusColor((selectedAsset.sensorData as any)[sensor.key].status)}`}>
                           {(selectedAsset.sensorData as any)[sensor.key].status}
                         </span>
                       </div>
                     ))}
                  </div>
                </div>

                {/* Trend Chart (Focus on Main Issue) */}
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-3 border-b pb-1 flex justify-between items-end" style={{ borderColor: border }}>
                     <span>주요 이상 추이 ({selectedAsset.mainIssue})</span>
                  </div>
                  <div className="h-40 border rounded-lg p-3" style={{ background: bg, borderColor: border }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={th.chartGrid} vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                        <Tooltip contentStyle={{ backgroundColor: th.tooltipBg, borderColor: th.tooltipBd, fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                        <Line type="monotone" dataKey="value" stroke={selectedAsset.status === '위험' ? '#ef4444' : primary} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Action Info */}
                <div className="border rounded-lg p-3" style={{ background: isLight ? `${primary}0a` : 'rgba(30,41,59,0.3)', borderColor: border }}>
                  <div className="text-xs font-bold text-slate-300 mb-2">권장 조치</div>
                  <p className="text-sm text-slate-400 mb-4">{selectedAsset.mainIssue}이(가) 지속적으로 감지되고 있습니다. 즉시 점검을 수행하여 이상 유무를 확인하세요.</p>
                  <button
                    className="w-full text-white text-sm font-medium py-2 rounded-lg transition-colors hover:opacity-90"
                    style={{ backgroundColor: primary }}
                  >
                    조치 등록
                  </button>
                </div>

                {/* History */}
                <div>
                   <div className="text-xs font-bold text-slate-400 mb-3 border-b pb-1" style={{ borderColor: border }}>최근 점검 이력</div>
                   <div className="flex flex-col gap-2">
                     {mockHistory.map(history => (
                       <div key={history.id} className="border rounded-lg p-3 text-sm" style={{ background: bg, borderColor: border }}>
                         <div className="flex items-center justify-between mb-1.5">
                           <span className="text-xs text-slate-500">{history.date}</span>
                           <span className={`text-[10px] px-1.5 py-0.5 border rounded ${getStatusColor(history.level)}`}>{history.level}</span>
                         </div>
                         <div className="flex items-center gap-2 mb-1 text-slate-200 font-medium">
                           {history.type}
                         </div>
                         <div className="text-xs text-slate-400 mb-2">{history.action}</div>
                         <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: border }}>
                            <span className="text-slate-500">{history.user}</span>
                            <span style={{ color: primary }}>{history.status}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
