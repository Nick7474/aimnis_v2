import { useState } from 'react';
import { Search, Grid, ShieldCheck, AlertTriangle, Ban, ChevronRight, Wind, Thermometer, Droplets } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { BrandSettings } from '@/lib/brandPresets';

interface EnvironmentArea {
  id: string;
  name: string;
  location: string;
  status: '정상' | '주의' | '위험';
  mainIssue: string;
  currentValue: string;
  threshold: string;
  lastUpdated: string;
  accessStatus: '출입 가능' | '제한적 출입' | '출입 제한';
  actionStatus: '미조치' | '점검 중' | '조치 완료';
  data: {
    co: { value: number; threshold: 25; status: '정상' | '위험' };
    h2s: { value: number; threshold: 10; status: '정상' | '주의' };
    ch4: { value: number; threshold: 20; status: '정상' | '주의' };
    voc: { value: number; threshold: 5; status: '정상' | '주의' };
    temperature: { value: number; threshold: 60; status: '정상' | '주의' };
    humidity: { value: number; threshold: 80; status: '정상' };
  };
}

const mockAreas: EnvironmentArea[] = [
  { id: 'B-102', name: '보일러동 B-102', location: '발전소 1층', status: '위험', mainIssue: 'CO', currentValue: '35 ppm', threshold: '25 ppm', lastUpdated: '10:22:14', accessStatus: '출입 제한', actionStatus: '미조치', data: { co: { value: 35, threshold: 25, status: '위험' }, h2s: { value: 2, threshold: 10, status: '정상' }, ch4: { value: 12, threshold: 20, status: '정상' }, voc: { value: 1.2, threshold: 5, status: '정상' }, temperature: { value: 38.6, threshold: 60, status: '정상' }, humidity: { value: 56.2, threshold: 80, status: '정상' } } },
  { id: 'T-201', name: '탈황 설비 구역', location: '발전소 2층', status: '주의', mainIssue: 'H2S', currentValue: '8 ppm', threshold: '10 ppm', lastUpdated: '10:18:50', accessStatus: '제한적 출입', actionStatus: '점검 중', data: { co: { value: 5, threshold: 25, status: '정상' }, h2s: { value: 8, threshold: 10, status: '주의' }, ch4: { value: 5, threshold: 20, status: '정상' }, voc: { value: 0.5, threshold: 5, status: '정상' }, temperature: { value: 42.1, threshold: 60, status: '정상' }, humidity: { value: 60.5, threshold: 80, status: '정상' } } },
  { id: 'T-101', name: '터빈동 A-201', location: '발전소 1층', status: '정상', mainIssue: 'CO', currentValue: '2 ppm', threshold: '25 ppm', lastUpdated: '10:16:05', accessStatus: '출입 가능', actionStatus: '조치 완료', data: { co: { value: 2, threshold: 25, status: '정상' }, h2s: { value: 0, threshold: 10, status: '정상' }, ch4: { value: 0, threshold: 20, status: '정상' }, voc: { value: 0.1, threshold: 5, status: '정상' }, temperature: { value: 25.4, threshold: 60, status: '정상' }, humidity: { value: 45.2, threshold: 80, status: '정상' } } },
  { id: 'F-105', name: '연료 저장 탱크 구역', location: '발전소 외부', status: '주의', mainIssue: 'CH4', currentValue: '18 %LEL', threshold: '20 %LEL', lastUpdated: '10:14:30', accessStatus: '제한적 출입', actionStatus: '미조치', data: { co: { value: 0, threshold: 25, status: '정상' }, h2s: { value: 0, threshold: 10, status: '정상' }, ch4: { value: 18, threshold: 20, status: '주의' }, voc: { value: 1.5, threshold: 5, status: '정상' }, temperature: { value: 28.5, threshold: 60, status: '정상' }, humidity: { value: 50.1, threshold: 80, status: '정상' } } },
  { id: 'E-120', name: '배전실 1층', location: '발전소 1층', status: '위험', mainIssue: 'CO', currentValue: '30 ppm', threshold: '25 ppm', lastUpdated: '10:12:45', accessStatus: '출입 제한', actionStatus: '미조치', data: { co: { value: 30, threshold: 25, status: '위험' }, h2s: { value: 0, threshold: 10, status: '정상' }, ch4: { value: 0, threshold: 20, status: '정상' }, voc: { value: 0, threshold: 5, status: '정상' }, temperature: { value: 35.1, threshold: 60, status: '정상' }, humidity: { value: 40.5, threshold: 80, status: '정상' } } },
];

const mockTrendData = Array.from({ length: 20 }, (_, i) => ({
  time: `09:${(30 + i).toString().padStart(2, '0')}`,
  value: Math.random() * 10 + 20 + (i > 15 ? i * 2 : 0)
}));

const mockHistory = [
  { id: 1, date: '2024-05-21 10:22:14', area: '보일러동 B-102', issue: 'CO', value: '35 ppm', level: '위험', status: '미조치' },
  { id: 2, date: '2024-05-21 10:18:50', area: '탈황 설비 구역', issue: 'H2S', value: '8 ppm', level: '주의', status: '점검 중' },
  { id: 3, date: '2024-05-21 10:12:45', area: '배전실 1층', issue: 'CO', value: '30 ppm', level: '위험', status: '미조치' },
];

interface Props {
  brand?: BrandSettings;
}

export default function EnvironmentDiagnosis({ brand }: Props) {
  const bg         = brand?.backgroundColor ?? '#0b1120';
  const surface    = brand?.surfaceColor     ?? '#111827';
  const border     = brand?.borderColor      ?? '#1f2937';
  const primary    = brand?.primaryColor     ?? '#2563EB';
  const textStrong = brand?.textStrongColor  ?? '#F8FAFC';
  const textMuted  = brand?.textSoftColor    ?? '#94A3B8';

  const [activeTab, setActiveTab] = useState('전체 구역');
  const [selectedArea, setSelectedArea] = useState<EnvironmentArea | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '정상': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case '주의': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case '위험': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getAccessStatusColor = (status: string) => {
    switch (status) {
      case '출입 가능': return 'text-emerald-400 border-emerald-500/30';
      case '제한적 출입': return 'text-yellow-400 border-yellow-500/30';
      case '출입 제한': return 'text-red-400 border-red-500/30 font-bold bg-red-500/10';
      default: return 'text-slate-400 border-slate-500/30';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case '미조치': return 'text-red-400 border-red-500/30';
      case '점검 중': return 'text-yellow-400 border-yellow-500/30';
      case '조치 완료': return 'text-emerald-400 border-emerald-500/30';
      default: return 'text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header & Tabs */}
      <div className="shrink-0 mb-4 lg:mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          환경 진단
        </h2>
        <div className="flex items-center gap-6 border-b" style={{ borderColor: border }}>
          {['전체 구역', '위험 구역', '환경 알림 이력'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedArea(null); }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-b-2'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
              style={activeTab === tab ? { color: primary, borderColor: primary } : undefined}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6 flex-1 overflow-auto pb-[20px] pr-2 custom-scrollbar">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="border rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
               <Grid size={24} className="text-blue-400" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">전체 구역</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">48 <span className="text-sm font-normal text-slate-500">개소</span></div>
            </div>
          </div>
          <div className="border rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
               <ShieldCheck size={24} className="text-emerald-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">정상 구역</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">32 <span className="text-sm font-normal text-slate-500">개소</span></div>
            </div>
          </div>
          <div className="border rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
               <AlertTriangle size={24} className="text-yellow-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">주의/위험 구역</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">12 <span className="text-sm font-normal text-slate-500">개소</span></div>
            </div>
          </div>
          <div className="bg-[#111827] border border-red-500/30 rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
               <Ban size={24} className="text-red-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-red-400 text-sm font-bold">출입 제한 필요 구역</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">4 <span className="text-sm font-normal text-slate-500">개소</span></div>
            </div>
          </div>
        </div>

        {activeTab === '환경 알림 이력' ? (
          <div className="border rounded-xl overflow-hidden flex flex-col min-h-[400px]" style={{ background: surface, borderColor: border }}>
            <div className="px-4 py-3 border-b flex items-center justify-between text-sm font-bold text-slate-300" style={{ background: surface, borderColor: border }}>
              환경 알림 이력 목록
            </div>
            <div className="p-4 flex-1" style={{ background: bg }}>
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-[11px] text-slate-500 border-b" style={{ borderColor: border }}>
                    <tr>
                      <th className="pb-2 font-medium">발생 시간</th>
                      <th className="pb-2 font-medium">구역명</th>
                      <th className="pb-2 font-medium text-center">위험 항목</th>
                      <th className="pb-2 font-medium text-center">측정값</th>
                      <th className="pb-2 font-medium text-center">위험 등급</th>
                      <th className="pb-2 font-medium text-center">조치 상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]/50 text-xs">
                    {mockHistory.map(history => (
                      <tr key={history.id} className="hover:bg-[#1e293b]/50">
                        <td className="py-2.5 text-slate-400">{history.date}</td>
                        <td className="py-2.5 text-slate-300">{history.area}</td>
                        <td className="py-2.5 text-center text-slate-300">{history.issue}</td>
                        <td className="py-2.5 text-center text-slate-300">{history.value}</td>
                        <td className="py-2.5 text-center">
                           <span className={`px-1.5 py-0.5 rounded border ${getStatusColor(history.level)} text-[10px]`}>{history.level}</span>
                        </td>
                        <td className="py-2.5 text-center">
                           <span className="text-[10px] flex justify-center">
                              <span className={`px-2 py-0.5 rounded-sm border ${getActionStatusColor(history.status)}`}>{history.status}</span>
                           </span>
                        </td>
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
              placeholder="구역명을 입력하세요"
              className="border rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 outline-none w-[240px]"
              style={{ background: surface, borderColor: border }}
            />
          </div>

          <select className="border rounded-lg px-3 py-2 text-sm text-slate-300 outline-none min-w-[120px]" style={{ background: surface, borderColor: border }}>
            <option>위치: 전체</option>
            <option>발전소 1층</option>
            <option>발전소 2층</option>
            <option>발전소 외부</option>
          </select>

          <div className="flex items-center border rounded-lg p-1" style={{ background: surface, borderColor: border }}>
             <div className="px-3 text-xs text-slate-500 mr-1">상태:</div>
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
             <div className="px-3 text-xs text-slate-500 mr-1">항목:</div>
            {['CO', 'H2S', 'CH4', 'VOC', '온도', '습도'].map(s => (
               <button key={s} className="px-3 py-1 text-sm rounded text-slate-400 hover:text-slate-200 hover:bg-[#1f2937]">
                 {s}
               </button>
            ))}
          </div>
        </div>

        {/* Content Area (List + Detail) */}
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 flex-1 min-h-[500px]">
          {/* Enhanced List */}
          <div
            className={`border rounded-xl flex flex-col overflow-hidden transition-all duration-300 ${selectedArea ? 'xl:w-[50%] shrink-0' : 'w-full'}`}
            style={{ background: surface, borderColor: border }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between text-sm font-bold text-slate-300" style={{ borderColor: border }}>
              구역별 환경 상태
              <select className="border rounded text-xs px-2 py-1 outline-none text-slate-400" style={{ background: 'transparent', borderColor: '#334155' }}>
                <option>10개씩</option>
                <option>20개씩</option>
              </select>
            </div>
            <div className="overflow-x-auto flex-1 bg-[#0b1120]/50">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-400 bg-[#1e293b]/50 border-b" style={{ borderColor: border }}>
                  <tr>
                    <th className="px-4 py-3 font-medium">상태</th>
                    <th className="px-4 py-3 font-medium">구역명</th>
                    <th className="px-4 py-3 font-medium">위치</th>
                    <th className="px-4 py-3 font-medium text-center">주요 위험 항목</th>
                    <th className="px-4 py-3 font-medium text-center">현재 수치</th>
                    <th className="px-4 py-3 font-medium text-center hidden md:table-cell">기준값</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">최근 측정 시간</th>
                    <th className="px-4 py-3 font-medium text-center">출입 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {(activeTab === '위험 구역' ? mockAreas.filter(a => a.status === '주의' || a.status === '위험') : mockAreas).map((area) => (
                    <tr
                      key={area.id}
                      onClick={() => setSelectedArea(area)}
                      className={`cursor-pointer transition-colors ${selectedArea?.id === area.id ? 'bg-[#1e293b]' : 'hover:bg-[#1e293b]/50'}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(area.status)}`}>
                          {area.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">{area.name}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{area.location}</td>
                      <td className="px-4 py-3 text-center text-slate-300 text-xs">{area.mainIssue}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold ${area.status === '위험' ? 'text-red-400' : area.status === '주의' ? 'text-yellow-400' : 'text-emerald-400'}`}>{area.currentValue}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs text-center hidden md:table-cell">{area.threshold}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{area.lastUpdated}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[11px] border px-2 py-0.5 rounded-sm ${getAccessStatusColor(area.accessStatus)}`}>{area.accessStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-slate-500" style={{ borderColor: border }}>
               <span>전체 48건</span>
               <div className="flex gap-1">
                 <button className="px-2 py-1 rounded text-slate-400 hover:bg-[#1f2937]">&lt;</button>
                 <button className="px-2 py-1 rounded" style={{ backgroundColor: `${primary}33`, color: primary }}>1</button>
                 <button className="px-2 py-1 rounded hover:bg-[#1f2937]">2</button>
                 <button className="px-2 py-1 rounded hover:bg-[#1f2937]">3</button>
                 <button className="px-2 py-1 rounded text-slate-400 hover:bg-[#1f2937]">&gt;</button>
               </div>
            </div>
          </div>

          {/* Details Panel */}
          {selectedArea && (
            <div className="flex flex-col gap-4 lg:gap-6 w-full xl:w-[50%] shrink-0">
              <div className="border rounded-xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200" style={{ background: surface, borderColor: border }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ background: surface, borderColor: border }}>
                  <span className="text-sm font-bold text-slate-300">구역 상세</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#1e293b] text-slate-300 px-2 py-1 rounded">선택 구역: {selectedArea.name}</span>
                    <button onClick={() => setSelectedArea(null)} className="text-slate-500 hover:text-slate-300 ml-2">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-6" style={{ background: bg }}>
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm border rounded-lg p-4" style={{ background: surface, borderColor: border }}>
                     <div>
                       <div className="text-xs text-slate-500 mb-1">구역명</div>
                       <div className="font-bold text-slate-200">{selectedArea.name}</div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-500 mb-1">최근 측정 시간</div>
                       <div className="text-slate-300">{selectedArea.lastUpdated}</div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-500 mb-1">위치</div>
                       <div className="text-slate-300">{selectedArea.location}</div>
                     </div>
                     <div>
                       <div className="text-xs text-slate-500 mb-1">출입 가능 여부</div>
                       <span className={`px-2 py-0.5 rounded text-xs font-medium border inline-block ${getAccessStatusColor(selectedArea.accessStatus)}`}>
                          {selectedArea.accessStatus}
                       </span>
                     </div>
                     <div className="col-span-2">
                       <div className="text-xs text-slate-500 mb-1">현재 상태</div>
                       <span className={`px-2 py-0.5 rounded text-xs font-medium border inline-block ${getStatusColor(selectedArea.status)}`}>
                          {selectedArea.status}
                       </span>
                     </div>
                  </div>

                  {/* Sensor Data Grid */}
                  <div>
                    <table className="w-full text-sm text-left">
                       <thead className="text-xs text-slate-500 border-b border-dashed border-[#334155]">
                         <tr>
                           <th className="pb-2 font-medium">측정 항목</th>
                           <th className="pb-2 font-medium text-center">현재 수치</th>
                           <th className="pb-2 font-medium text-center">기준값</th>
                           <th className="pb-2 font-medium text-center">상태</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-[#1f2937] text-slate-300">
                         {Object.entries(selectedArea.data).map(([key, rawData]) => {
                           const data = rawData as { value: number; threshold: number; status: string };
                           const labels: Record<string, string> = { co: 'CO', h2s: 'H2S', ch4: 'CH4', voc: 'VOC', temperature: '온도', humidity: '습도' };
                           const units: Record<string, string> = { co: 'ppm', h2s: 'ppm', ch4: '%LEL', voc: 'ppm', temperature: '°C', humidity: '%' };
                           const isDanger = data.status === '위험';
                           const isWarning = data.status === '주의';

                           return (
                             <tr key={key}>
                               <td className="py-2.5">{labels[key]}</td>
                               <td className={`py-2.5 text-center font-bold ${isDanger ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-slate-200'}`}>
                                 {data.value} <span className="text-xs font-normal text-slate-500">{units[key]}</span>
                               </td>
                               <td className="py-2.5 text-center text-slate-500">{data.threshold} {units[key]}</td>
                               <td className="py-2.5 text-center">
                                 <span className={`text-[10px] px-1.5 py-0.5 border rounded ${getStatusColor(data.status)}`}>{data.status}</span>
                               </td>
                             </tr>
                           );
                         })}
                       </tbody>
                    </table>
                  </div>

                  {/* Action Info & Chart in a row */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="text-sm border rounded-lg p-3" style={{ background: surface, borderColor: border }}>
                        <div className="text-xs font-bold text-slate-400 mb-3">조치 정보</div>
                        <div className="flex flex-col gap-2">
                           <div className="flex justify-between">
                             <span className="text-slate-500 text-xs">환기 필요 여부</span>
                             <span className="text-slate-300 text-xs font-medium">{selectedArea.status !== '정상' ? '필요' : '정상'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-slate-500 text-xs">출입 제한 여부</span>
                             <span className="text-slate-300 text-xs font-medium">{selectedArea.accessStatus !== '출입 가능' ? '필요' : '정상'}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-slate-500 text-xs">점검 담당자</span>
                             <span className="text-slate-300 text-xs font-medium">안전팀 (010-1234-5678)</span>
                           </div>
                           <div className="flex justify-between items-center border-t border-[#334155] pt-2 mt-1">
                             <span className="text-slate-500 text-xs">조치 상태</span>
                             <span className={`text-[11px] px-2 py-0.5 border rounded ${getActionStatusColor(selectedArea.actionStatus)}`}>{selectedArea.actionStatus}</span>
                           </div>
                        </div>
                        <button
                          className="w-full mt-3 text-white text-xs font-medium py-2 rounded-lg transition-colors hover:opacity-90"
                          style={{ backgroundColor: primary }}
                        >
                          조치 등록
                        </button>
                     </div>

                     <div className="border rounded-lg p-3 flex flex-col justify-between" style={{ background: surface, borderColor: border }}>
                        <div className="text-xs font-bold text-slate-400 mb-2 flex justify-between">
                          주요 환경 추이 ({selectedArea.name})
                          <select className="border rounded outline-none text-slate-300 text-[10px]" style={{ background: 'transparent', borderColor: '#334155' }}>
                            <option>{selectedArea.mainIssue}</option>
                          </select>
                        </div>
                        <div className="flex-1 min-h-[100px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockTrendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} tickMargin={5} axisLine={false} tickLine={false} />
                              <YAxis stroke="#64748b" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={25} />
                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '10px' }} itemStyle={{ color: '#fff' }} />
                              <Line type="monotone" dataKey="value" stroke={selectedArea.status === '위험' ? '#ef4444' : '#f59e0b'} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                     </div>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="border rounded-xl overflow-hidden flex flex-col" style={{ background: surface, borderColor: border }}>
                <div className="px-4 py-3 border-b flex items-center justify-between text-sm font-bold text-slate-300" style={{ background: surface, borderColor: border }}>
                  환경 알림 이력
                </div>
                <div className="p-4" style={{ background: bg }}>
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="text-[11px] text-slate-500 border-b" style={{ borderColor: border }}>
                        <tr>
                          <th className="pb-2 font-medium">발생 시간</th>
                          <th className="pb-2 font-medium">구역명</th>
                          <th className="pb-2 font-medium text-center">위험 항목</th>
                          <th className="pb-2 font-medium text-center">측정값</th>
                          <th className="pb-2 font-medium text-center">위험 등급</th>
                          <th className="pb-2 font-medium text-center">조치 상태</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2937]/50 text-xs">
                        {mockHistory.map(history => (
                          <tr key={history.id}>
                            <td className="py-2.5 text-slate-400">{history.date}</td>
                            <td className="py-2.5 text-slate-300 truncate max-w-[100px]" title={history.area}>{history.area}</td>
                            <td className="py-2.5 text-center text-slate-300">{history.issue}</td>
                            <td className="py-2.5 text-center text-slate-300">{history.value}</td>
                            <td className="py-2.5 text-center">
                               <span className={`px-1.5 py-0.5 rounded border ${getStatusColor(history.level)} text-[10px]`}>{history.level}</span>
                            </td>
                            <td className="py-2.5 text-center">
                               <span className={`text-[10px] ${getActionStatusColor(history.status).split(' ')[0]}`}>{history.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3 text-center">
                      <button className="text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto">
                        더보기 <ChevronRight size={12} />
                      </button>
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
