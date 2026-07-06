import { useState } from 'react';
import { Search, MapPin, Phone, Users, ShieldCheck, AlertTriangle, AlertOctagon, Heart, ChevronRight, CheckCircle2, History } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { BrandSettings } from '@/lib/brandPresets';

interface Worker {
  id: string;
  name: string;
  team: string;
  location: string;
  status: '정상' | '주의' | '위험' | '통신 끊김';
  mainIssue: string;
  spo2: number | null;
  heartRate: number | null;
  fallDetection: '정상' | '감지' | '-';
  lastUpdated: string;
  actionStatus: '미조치' | '조치 중' | '대기 중' | '확인 필요' | '-';
  contactAvailable: boolean;
  moveStatus: '정상' | '비정상' | '-';
  dangerZone: '아니요' | '예' | '-';
  networkStatus: '정상' | '끊김';
}

const mockWorkers: Worker[] = [
  { id: 'W-001', name: '김민수', team: '기계정비팀', location: '보일러동 B-102', status: '위험', mainIssue: 'SpO2 저하', spo2: 82, heartRate: 112, fallDetection: '-', lastUpdated: '10:23:56', actionStatus: '미조치', contactAvailable: true, moveStatus: '정상', dangerZone: '아니요', networkStatus: '정상' },
  { id: 'W-002', name: '이재훈', team: '전기운전팀', location: '터빈동 T-203', status: '위험', mainIssue: '낙상 감지', spo2: 96, heartRate: 128, fallDetection: '감지', lastUpdated: '10:23:51', actionStatus: '미조치', contactAvailable: false, moveStatus: '비정상', dangerZone: '아니요', networkStatus: '정상' },
  { id: 'W-003', name: '박지현', team: '화학관리팀', location: '수처리동 W-101', status: '주의', mainIssue: '심박수 상승', spo2: 94, heartRate: 108, fallDetection: '-', lastUpdated: '10:23:48', actionStatus: '조치 중', contactAvailable: true, moveStatus: '정상', dangerZone: '아니요', networkStatus: '정상' },
  { id: 'W-004', name: '최영수', team: '기계정비팀', location: '냉각탑 C-01', status: '주의', mainIssue: '위험 구역 체류', spo2: 95, heartRate: 96, fallDetection: '-', lastUpdated: '10:23:45', actionStatus: '대기 중', contactAvailable: true, moveStatus: '정상', dangerZone: '예', networkStatus: '정상' },
  { id: 'W-005', name: '정우성', team: '전기운전팀', location: '발전기실 G-01', status: '정상', mainIssue: '이상 없음', spo2: 97, heartRate: 78, fallDetection: '-', lastUpdated: '10:23:42', actionStatus: '-', contactAvailable: true, moveStatus: '정상', dangerZone: '아니요', networkStatus: '정상' },
  { id: 'W-006', name: '한소희', team: '기계정비팀', location: '보일러동 B-105', status: '정상', mainIssue: '이상 없음', spo2: 98, heartRate: 74, fallDetection: '-', lastUpdated: '10:23:41', actionStatus: '-', contactAvailable: true, moveStatus: '정상', dangerZone: '아니요', networkStatus: '정상' },
  { id: 'W-007', name: '오세훈', team: '화학관리팀', location: '수처리동 W-102', status: '정상', mainIssue: '이상 없음', spo2: 97, heartRate: 76, fallDetection: '-', lastUpdated: '10:23:39', actionStatus: '-', contactAvailable: true, moveStatus: '정상', dangerZone: '아니요', networkStatus: '정상' },
  { id: 'W-008', name: '유지민', team: '전기운전팀', location: '배전실 P-01', status: '통신 끊김', mainIssue: '통신 끊김', spo2: null, heartRate: null, fallDetection: '-', lastUpdated: '10:20:11', actionStatus: '확인 필요', contactAvailable: false, moveStatus: '-', dangerZone: '-', networkStatus: '끊김' },
];

const mockTrendData = Array.from({ length: 20 }, (_, i) => ({
  time: `09:${(25 + i * 2).toString().padStart(2, '0')}`,
  spo2: Math.random() * 5 + 95 - (i > 15 ? (i - 15) * 5 : 0),
  heartRate: Math.random() * 10 + 70 + (i > 15 ? (i - 15) * 10 : 0)
}));

const mockHistory = [
  { id: 1, date: '2024-05-21 10:23:51', name: '이재훈', issue: '낙상 감지', value: '감지', level: '위험', status: '미조치' },
  { id: 2, date: '2024-05-21 10:23:48', name: '김민수', issue: 'SpO2 저하', value: '82 %', level: '위험', status: '미조치' },
  { id: 3, date: '2024-05-21 10:23:45', name: '박지현', issue: '심박수 상승', value: '108 bpm', level: '주의', status: '조치 중' },
  { id: 4, date: '2024-05-21 10:23:44', name: '최영수', issue: '위험 구역 체류', value: '2 분', level: '주의', status: '대기 중' },
  { id: 5, date: '2024-05-21 10:20:11', name: '유지민', issue: '통신 끊김', value: '-', level: '위험', status: '확인 필요' },
];

interface WorkerSafetyProps {
  brand?: BrandSettings;
}

export default function WorkerSafety({ brand }: WorkerSafetyProps) {
  const bg      = brand?.backgroundColor ?? '#0b1120';
  const surface = brand?.surfaceColor     ?? '#111827';
  const border  = brand?.borderColor      ?? '#1f2937';
  const primary = brand?.primaryColor     ?? '#2563EB';
  const textStrong = brand?.textStrongColor ?? '#F8FAFC';
  const textMuted  = brand?.textSoftColor   ?? '#94A3B8';

  const [activeTab, setActiveTab] = useState('전체 작업자');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(mockWorkers[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '정상': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case '주의': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case '위험': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case '통신 끊김': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case '미조치': return 'text-red-400 border-red-500/30';
      case '조치 중': return 'text-yellow-400 border-yellow-500/30';
      case '대기 중': return 'text-blue-400 border-blue-500/30';
      case '확인 필요': return 'text-slate-300 border-slate-500/30';
      default: return 'text-slate-500 border-transparent';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header & Tabs */}
      <div className="shrink-0 mb-4 lg:mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          작업자 안전
        </h2>
        <div className="flex items-center gap-6 border-b" style={{ borderColor: border }}>
          {['전체 작업자', '위험 작업자', '안전 알림 이력'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedWorker(tab === '전체 작업자' || tab === '위험 작업자' ? mockWorkers[0] : null); }}
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
          <div className="rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 border" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
               <Users size={24} className="text-blue-400" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">전체 작업자</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">128 <span className="text-sm font-normal text-slate-500">명</span></div>
            </div>
          </div>
          <div className="rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 border" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
               <ShieldCheck size={24} className="text-emerald-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">정상 작업자</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">98 <span className="text-sm font-normal text-slate-500">명</span></div>
            </div>
          </div>
          <div className="rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 border" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
               <AlertTriangle size={24} className="text-yellow-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">주의/위험 작업자</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">23 <span className="text-sm font-normal text-slate-500">명</span></div>
            </div>
          </div>
          <div className="rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]" style={{ background: surface }}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
               <AlertOctagon size={24} className="text-red-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-red-400 text-sm font-bold">긴급 조치 필요</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">7 <span className="text-sm font-normal text-slate-500">명</span></div>
            </div>
          </div>
        </div>

        {activeTab === '안전 알림 이력' ? (
          <div className="rounded-xl flex flex-col overflow-hidden min-h-[400px] border" style={{ background: surface, borderColor: border }}>
             <div className="px-4 py-3 border-b text-sm font-bold text-slate-300" style={{ borderColor: border }}>
               안전 알림 전체 이력
             </div>
             <div className="p-4 flex-1" style={{ background: bg }}>
                <table className="w-full text-left whitespace-nowrap text-sm">
                   <thead className="text-[11px] text-slate-500 border-b" style={{ borderColor: border }}>
                     <tr>
                        <th className="pb-2 font-medium">발생 시간</th>
                        <th className="pb-2 font-medium">작업자명</th>
                        <th className="pb-2 font-medium">이상 유형</th>
                        <th className="pb-2 font-medium text-center">측정값</th>
                        <th className="pb-2 font-medium text-center">위험 등급</th>
                        <th className="pb-2 font-medium text-center">조치 상태</th>
                     </tr>
                   </thead>
                   <tbody className="text-slate-300">
                      {mockHistory.map(row => (
                        <tr key={row.id} className="hover:bg-[#1e293b]/50 border-b border-[#1f2937]/50">
                           <td className="py-3 text-slate-400">{row.date}</td>
                           <td className="py-3 text-slate-200">{row.name}</td>
                           <td className="py-3">{row.issue}</td>
                           <td className="py-3 text-center">{row.value}</td>
                           <td className="py-3 text-center">
                             <span className={`px-2 py-0.5 rounded border ${getStatusColor(row.level)} text-[11px]`}>{row.level}</span>
                           </td>
                           <td className="py-3 text-center">
                              <span className={`text-[11px] border px-2 py-0.5 rounded-sm ${getActionStatusColor(row.status)}`}>{row.status}</span>
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
            <input type="text" placeholder="작업자명 입력하세요" className="rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 outline-none w-[200px] border" style={{ background: surface, borderColor: border }} />
          </div>

          <select className="rounded-lg px-3 py-2 text-sm text-slate-300 outline-none min-w-[120px] border" style={{ background: surface, borderColor: border }}>
            <option>소속/팀: 전체</option>
            <option>기계정비팀</option>
            <option>전기운전팀</option>
            <option>화학관리팀</option>
          </select>

          <select className="rounded-lg px-3 py-2 text-sm text-slate-300 outline-none min-w-[120px] border" style={{ background: surface, borderColor: border }}>
            <option>위치: 전체</option>
            <option>보일러동 B-102</option>
            <option>터빈동 T-203</option>
          </select>

          <div className="flex items-center rounded-lg p-1 border" style={{ background: surface, borderColor: border }}>
             <div className="px-3 text-xs text-slate-500 mr-1">상태:</div>
            {['전체', '정상', '주의', '위험'].map(s => (
               <button key={s} className={`px-3 py-1 text-sm rounded ${s === '전체' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                 style={s === '전체' ? { background: primary } : undefined}>
                 {s}
               </button>
            ))}
          </div>

          <div className="flex items-center rounded-lg p-1 ml-auto border" style={{ background: surface, borderColor: border }}>
             <div className="px-3 text-xs text-slate-500 mr-1">이상 유형:</div>
            {['SpO2', '심박수', '낙상', '위험 구역', '통신 끊김'].map(s => (
               <button key={s} className="px-3 py-1 text-sm rounded text-slate-400 hover:text-slate-200 hover:bg-[#1f2937]">
                 {s}
               </button>
            ))}
          </div>

          <select className="rounded-lg px-3 py-2 text-sm text-slate-300 outline-none border" style={{ background: surface, borderColor: border }}>
            <option>조치 상태: 전체</option>
            <option>미조치</option>
            <option>조치 중</option>
            <option>대기 중</option>
          </select>
        </div>

        {/* Content Area (Rows 3 and 4) */}

        {/* Row 3: List & Detail */}
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 shrink-0 min-h-[300px]">
          {/* List */}
          <div className="rounded-xl flex flex-col overflow-hidden w-full xl:w-[60%] border" style={{ background: surface, borderColor: border }}>
            <div className="px-4 py-3 border-b text-sm font-bold text-slate-300" style={{ borderColor: border }}>
              작업자 목록
            </div>
            <div className="overflow-x-auto flex-1 min-h-[220px]" style={{ background: `${bg}4D` }}>
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-[11px] text-slate-400 border-b bg-[#1e293b]/50" style={{ borderColor: border }}>
                  <tr>
                    <th className="px-4 py-2 font-medium">상태</th>
                    <th className="px-4 py-2 font-medium">작업자명</th>
                    <th className="px-4 py-2 font-medium">소속</th>
                    <th className="px-4 py-2 font-medium">현재 위치</th>
                    <th className="px-4 py-2 font-medium">주요 이상</th>
                    <th className="px-4 py-2 font-medium text-center">SpO2 (%)</th>
                    <th className="px-4 py-2 font-medium text-center">심박수 (bpm)</th>
                    <th className="px-4 py-2 font-medium text-center">낙상 감지</th>
                    <th className="px-4 py-2 font-medium">최근 측정 시간</th>
                    <th className="px-4 py-2 font-medium text-center">조치 상태</th>
                    <th className="px-4 py-2 font-medium text-center">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {(activeTab === '위험 작업자' ? mockWorkers.filter(w => w.status !== '정상') : mockWorkers).map((worker) => (
                    <tr
                      key={worker.id}
                      onClick={() => setSelectedWorker(worker)}
                      className={`cursor-pointer transition-colors text-[13px] ${selectedWorker?.id === worker.id ? 'bg-[#1e293b]' : 'hover:bg-[#1e293b]/50'}`}
                    >
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusColor(worker.status)}`}>
                          {worker.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-200">{worker.name}</td>
                      <td className="px-4 py-2.5 text-slate-400">{worker.team}</td>
                      <td className="px-4 py-2.5 text-slate-400">{worker.location}</td>
                      <td className="px-4 py-2.5 text-slate-300">{worker.mainIssue === '이상 없음' ? '-' : worker.mainIssue}</td>
                      <td className={`px-4 py-2.5 text-center font-bold ${(worker.spo2 && worker.spo2 < 90) ? 'text-red-400' : 'text-slate-300'}`}>
                        {worker.spo2 || '-'}
                      </td>
                      <td className={`px-4 py-2.5 text-center font-bold ${(worker.heartRate && worker.heartRate > 100) ? 'text-red-400' : 'text-slate-300'}`}>
                        {worker.heartRate || '-'}
                      </td>
                      <td className={`px-4 py-2.5 text-center font-bold ${worker.fallDetection === '감지' ? 'text-red-400' : 'text-slate-500'}`}>
                        {worker.fallDetection}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-[11px]">{worker.lastUpdated}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[11px] border px-2 py-0.5 rounded-sm ${getActionStatusColor(worker.actionStatus)}`}>{worker.actionStatus}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center text-slate-500">
                        <ChevronRight size={16} className="mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 border-t flex items-center justify-center text-xs text-slate-500" style={{ borderColor: border, background: surface }}>
               <div className="flex gap-1">
                 <button className="px-2 py-1 hover:bg-[#1f2937] rounded text-slate-400">&lt;&lt;</button>
                 <button className="px-2 py-1 hover:bg-[#1f2937] rounded text-slate-400">&lt;</button>
                 <button className="px-2 py-1 rounded text-white" style={{ background: `${primary}33`, color: primary }}>1</button>
                 <button className="px-2 py-1 hover:bg-[#1f2937] rounded">2</button>
                 <button className="px-2 py-1 hover:bg-[#1f2937] rounded">3</button>
                 <button className="px-2 py-1 hover:bg-[#1f2937] rounded">4</button>
                 <button className="px-2 py-1 hover:bg-[#1f2937] rounded">5</button>
                 <button className="px-2 py-1 hover:bg-[#1f2937] rounded text-slate-400">&gt;</button>
                 <button className="px-2 py-1 hover:bg-[#1f2937] rounded text-slate-400">&gt;&gt;</button>
                 <select className="bg-transparent border border-[#334155] rounded outline-none ml-2 text-slate-400">
                    <option>10 / 페이지</option>
                 </select>
               </div>
            </div>
          </div>

          {/* Details */}
          {selectedWorker ? (
            <div className="rounded-xl flex flex-col w-full xl:w-[40%] animate-in fade-in duration-200 border" style={{ background: surface, borderColor: border }}>
              <div className="px-4 py-3 border-b flex items-center justify-between text-sm font-bold text-slate-300" style={{ borderColor: border }}>
                작업자 상세
                <span className="text-[10px] text-slate-500 font-normal flex items-center gap-1"><History size={12}/> 10초 전 갱신</span>
              </div>
              <div className="p-4 flex flex-col gap-5 flex-1" style={{ background: bg }}>
                {/* Header Profile */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center border-2 border-[#334155] shrink-0">
                    <Heart size={24} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-slate-100">{selectedWorker.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(selectedWorker.status)}`}>{selectedWorker.status}</span>
                    </div>
                    <div className="text-sm text-slate-400 mb-1">{selectedWorker.team}</div>
                    <div className="text-xs text-slate-500">현재 위치: <span className="text-slate-300">{selectedWorker.location}</span></div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                    <div>최근 측정 <span className="text-slate-300">{selectedWorker.lastUpdated}</span></div>
                    <div>현상태 <span className="text-slate-300">{selectedWorker.mainIssue}</span></div>
                    <div className="flex items-center gap-1 mt-1">
                       연락 가능 여부
                       {selectedWorker.contactAvailable ? (
                         <span className="text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>연결 가능</span>
                       ) : (
                         <span className="text-slate-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-500"/>불가</span>
                       )}
                    </div>
                  </div>
                </div>

                {/* Biometrics */}
                <div className="rounded-lg p-3 border" style={{ background: surface, borderColor: border }}>
                  <div className="text-xs font-bold text-slate-400 mb-2 pb-1 border-b" style={{ borderColor: border }}>생체·안전 정보</div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 text-sm">SpO2</span>
                        <span className={`text-base font-bold ${(selectedWorker.spo2 && selectedWorker.spo2 < 90) ? 'text-red-400' : 'text-slate-200'}`}>{selectedWorker.spo2 || '-'} <span className="text-xs font-normal text-slate-500">%</span></span>
                     </div>
                     <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 text-sm">움직임 상태</span>
                        <span className={`text-sm ${selectedWorker.moveStatus === '정상' ? 'text-emerald-400' : selectedWorker.moveStatus === '비정상' ? 'text-red-400' : 'text-slate-500'}`}>{selectedWorker.moveStatus}</span>
                     </div>
                     <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 text-sm">심박수</span>
                        <span className={`text-base font-bold ${(selectedWorker.heartRate && selectedWorker.heartRate > 100) ? 'text-red-400' : 'text-slate-200'}`}>{selectedWorker.heartRate || '-'} <span className="text-xs font-normal text-slate-500">bpm</span></span>
                     </div>
                     <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 text-sm">위험 구역 체류</span>
                        <span className={`text-sm ${selectedWorker.dangerZone === '예' ? 'text-yellow-400' : selectedWorker.dangerZone === '아니요' ? 'text-emerald-400' : 'text-slate-500'}`}>{selectedWorker.dangerZone}</span>
                     </div>
                     <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 text-sm">낙상 감지</span>
                        <span className={`text-sm ${selectedWorker.fallDetection === '감지' ? 'text-red-400' : 'text-slate-500'}`}>{selectedWorker.fallDetection}</span>
                     </div>
                     <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 text-sm">통신 상태</span>
                        <span className={`text-sm ${selectedWorker.networkStatus === '정상' ? 'text-emerald-400' : 'text-red-400'}`}>{selectedWorker.networkStatus}</span>
                     </div>
                  </div>
                </div>

                {/* Action Info */}
                <div className="bg-[#1e293b]/30 rounded-lg p-3 border" style={{ borderColor: border }}>
                  <div className="text-xs font-bold text-slate-300 mb-1">권장 조치</div>
                  <p className="text-[13px] text-slate-400 leading-relaxed mb-4">
                    {selectedWorker.status === '위험' ? 'SpO2 수치가 정상 범위보다 낮습니다. 작업자에게 휴식 및 산소 공급을 권장하고 상태를 지속적으로 모니터링하십시오.' : '현재 특별한 조치가 필요하지 않거나 확인 중입니다.'}
                  </p>
                  <div className="flex gap-2">
                     <select className="rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none flex-1 border border-[#334155]" style={{ background: surface }}>
                        <option>담당자: 홍길동 (현장관리자)</option>
                     </select>
                     <select className="rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none w-32 border border-[#334155]" style={{ background: surface }}>
                        <option>미조치</option>
                        <option>조치 중</option>
                        <option>완료</option>
                     </select>
                     <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors">
                        조치 등록
                     </button>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="rounded-xl flex items-center justify-center w-[40%] text-slate-500 text-sm border" style={{ background: surface, borderColor: border }}>
               작업자를 선택해주세요
            </div>
          )}
        </div>

        {/* Row 4: Trend, Location, History */}
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 shrink-0 min-h-[250px]">

          {/* Biometric Trend */}
          <div className="rounded-xl flex flex-col w-full xl:w-1/3 border" style={{ background: surface, borderColor: border }}>
            <div className="px-4 py-3 border-b flex items-center justify-between text-sm font-bold text-slate-300" style={{ borderColor: border }}>
               생체 상태 추이
               <div className="flex gap-1">
                 <button className="px-2 py-0.5 text-white text-[10px] rounded" style={{ background: primary }}>1시간</button>
                 <button className="px-2 py-0.5 text-slate-400 hover:text-slate-200 text-[10px]">6시간</button>
                 <button className="px-2 py-0.5 text-slate-400 hover:text-slate-200 text-[10px]">24시간</button>
               </div>
            </div>
            <div className="p-3 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={30} />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={30} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                  <Line yAxisId="left" type="monotone" dataKey="spo2" name={"SpO2 (%)"} stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }} />
                  <Line yAxisId="right" type="monotone" dataKey="heartRate" name={"심박수 (bpm)"} stroke="#ef4444" strokeWidth={1.5} dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Location / Zone */}
          <div className="rounded-xl flex flex-col w-full xl:w-1/3 p-4 border" style={{ background: surface, borderColor: border }}>
             <div className="text-sm font-bold text-slate-300 mb-4">위치/구역 정보</div>
             <div className="flex-1 flex flex-col gap-4">
                <div className="p-3 rounded-lg flex justify-between items-center border" style={{ background: bg, borderColor: border }}>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">현재 구역</div>
                    <div className="text-base font-bold text-slate-200">보일러동 B-102</div>
                  </div>
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/30">위험 구역</span>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">주변 구역 상태</div>
                  <div className="grid grid-cols-3 gap-2">
                     <div className="border border-emerald-500/30 bg-emerald-500/10 p-2 rounded text-center">
                        <div className="text-[11px] text-slate-300">B-101</div>
                        <div className="text-[10px] text-emerald-400">정상</div>
                     </div>
                     <div className="border border-red-500/30 bg-red-500/10 p-2 rounded text-center">
                        <div className="text-[11px] text-slate-300">B-102</div>
                        <div className="text-[10px] text-red-400">위험</div>
                     </div>
                     <div className="border border-yellow-500/30 bg-yellow-500/10 p-2 rounded text-center">
                        <div className="text-[11px] text-slate-300">B-103</div>
                        <div className="text-[10px] text-yellow-400">주의</div>
                     </div>
                     <div className="border border-emerald-500/30 bg-emerald-500/10 p-2 rounded text-center">
                        <div className="text-[11px] text-slate-300">B-201</div>
                        <div className="text-[10px] text-emerald-400">정상</div>
                     </div>
                     <div className="border border-emerald-500/30 bg-emerald-500/10 p-2 rounded text-center">
                        <div className="text-[11px] text-slate-300">B-202</div>
                        <div className="text-[10px] text-emerald-400">정상</div>
                     </div>
                     <div className="border border-emerald-500/30 bg-emerald-500/10 p-2 rounded text-center">
                        <div className="text-[11px] text-slate-300">B-203</div>
                        <div className="text-[10px] text-emerald-400">정상</div>
                     </div>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center text-[11px] text-slate-500 border-t pt-2" style={{ borderColor: border }}>
                  <span>최종 위치 업데이트</span>
                  <span>2024-05-21 10:23:50</span>
                </div>
             </div>
          </div>

          {/* History */}
          <div className="rounded-xl flex flex-col w-full xl:w-1/3 border" style={{ background: surface, borderColor: border }}>
             <div className="px-4 py-3 border-b text-sm font-bold text-slate-300" style={{ borderColor: border }}>
               안전 알림 이력
             </div>
             <div className="p-3 flex-1" style={{ background: bg }}>
                <table className="w-full text-left whitespace-nowrap">
                   <thead className="text-[10px] text-slate-500 border-b" style={{ borderColor: border }}>
                     <tr>
                        <th className="pb-2 font-medium">발생 시간</th>
                        <th className="pb-2 font-medium">작업자명</th>
                        <th className="pb-2 font-medium">이상 유형</th>
                        <th className="pb-2 font-medium">측정값</th>
                        <th className="pb-2 font-medium text-center">위험 등급</th>
                        <th className="pb-2 font-medium text-center">조치 상태</th>
                     </tr>
                   </thead>
                   <tbody className="text-[11px] text-slate-300">
                      {mockHistory.map(row => (
                        <tr key={row.id} className="border-b border-[#1f2937]/50">
                           <td className="py-2 text-slate-400">{row.date.split(' ')[1]}</td>
                           <td className="py-2">{row.name}</td>
                           <td className="py-2">{row.issue}</td>
                           <td className="py-2">{row.value}</td>
                           <td className="py-2 text-center">
                             <span className={`px-1.5 py-0.5 rounded border ${getStatusColor(row.level)} text-[9px]`}>{row.level}</span>
                           </td>
                           <td className="py-2 text-center">
                              <span className={`text-[10px] border px-1.5 py-0.5 rounded-sm ${getActionStatusColor(row.status)}`}>{row.status}</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                <div className="mt-3 text-center">
                   <button className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto">
                     더보기 <ChevronRight size={12} />
                   </button>
                </div>
             </div>
          </div>

        </div>

        </>
        )}
      </div>
    </div>
  );
}
