import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle2, RotateCcw, Calendar, Download, FileText, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import type { BrandSettings } from '@/lib/brandPresets';

const mockBarData = [
  { name: '설비', 위험: 12, 경고: 18, 주의: 9, 정보: 6 },
  { name: '환경', 위험: 5, 경고: 8, 주의: 7, 정보: 4 },
  { name: '작업자', 위험: 4, 경고: 6, 주의: 4, 정보: 3 },
  { name: '시스템', 위험: 0, 경고: 2, 주의: 2, 정보: 2 },
];

const mockPieData = [
  { name: '미조치', value: 11, color: '#ef4444' }, // red-500
  { name: '확인 중', value: 15, color: '#f97316' }, // orange-500
  { name: '조치 중', value: 20, color: '#eab308' }, // yellow-500
  { name: '완료', value: 40, color: '#10b981' }, // emerald-500
];

const mockIssues = [
  { id: 1, type: '설비', target: '보일러 순환펌프 P-102', location: '1호기 / 보일러동 B-102', count: 18, level: '위험', rate: '72.2%', time: '2024-05-21 10:22' },
  { id: 2, type: '작업자', target: '김민수 (정비팀)', location: '2호기 / 터빈동', count: 12, level: '경고', rate: '83.3%', time: '2024-05-21 09:47' },
  { id: 3, type: '환경', target: '보일러동 B-102 온도', location: '1호기 / 보일러동 B-102', count: 9, level: '경고', rate: '77.8%', time: '2024-05-21 08:52' },
  { id: 4, type: '설비', target: '냉각수 펌프 P-301', location: '1호기 / 냉각수계', count: 8, level: '경고', rate: '75.0%', time: '2024-05-20 16:18' },
  { id: 5, type: '작업자', target: '박선영 (운전팀)', location: '공통 / 제어실', count: 7, level: '주의', rate: '85.7%', time: '2024-05-20 15:05' },
  { id: 6, type: '설비', target: '터빈 베어링 온도', location: '2호기 / 터빈동', count: 6, level: '경고', rate: '66.7%', time: '2024-05-20 14:11' },
];

const mockHistory = [
  { id: 1, name: '주간 운영 리포트 (설비 중심)', period: '2024-05-13 ~ 2024-05-19', time: '2024-05-20 09:15', status: '완료' },
  { id: 2, name: '위험 알림 상세 리포트', period: '2024-05-13 ~ 2024-05-19', time: '2024-05-20 09:10', status: '완료' },
  { id: 3, name: '작업자 안전 리포트', period: '2024-05-13 ~ 2024-05-19', time: '2024-05-20 08:45', status: '완료' },
  { id: 4, name: '설비 상태 종합 리포트', period: '2024-05-01 ~ 2024-05-19', time: '2024-05-20 07:30', status: '생성 중' },
  { id: 5, name: '월간 운영 리포트 (종합)', period: '2024-04-01 ~ 2024-04-30', time: '2024-05-01 09:05', status: '완료' },
];

interface ReportProps {
  brand?: BrandSettings;
}

export default function Report({ brand }: ReportProps) {
  const bg      = brand?.backgroundColor ?? '#0b1120';
  const surface = brand?.surfaceColor     ?? '#111827';
  const border  = brand?.borderColor      ?? '#1f2937';
  const primary = brand?.primaryColor     ?? '#2563EB';
  const textStrong = brand?.textStrongColor ?? '#F8FAFC';
  const textMuted  = brand?.textSoftColor   ?? '#94A3B8';

  function hexLum(hex: string) {
    const h = hex.replace('#', '');
    return (0.299 * parseInt(h.slice(0, 2), 16) + 0.587 * parseInt(h.slice(2, 4), 16) + 0.114 * parseInt(h.slice(4, 6), 16)) / 255;
  }
  const isLight = hexLum(bg) > 0.5;
  const th = {
    rowDivider:  border,
    chartGrid:   isLight ? 'rgba(0,0,0,.08)' : '#1f2937',
    tooltipBg:   surface,
    tooltipBd:   border,
  };

  const [activeTab, setActiveTab] = useState('일일 리포트');

  const getLevelColor = (level: string) => {
    switch (level) {
      case '위험': return 'text-red-500 border-red-500/30';
      case '경고': return 'text-orange-500 border-orange-500/30';
      case '주의': return 'text-yellow-500 border-yellow-500/30';
      case '정보': return 'text-blue-500 border-blue-500/30';
      default: return 'text-slate-500 border-slate-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '설비': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case '환경': return 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
      case '작업자': return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      case '시스템': return 'bg-slate-600/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header & Tabs */}
      <div className="shrink-0 mb-4 lg:mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4" style={{ color: textStrong }}>
          리포트
        </h2>
        <div className="flex items-center gap-6 border-b" style={{ borderColor: border }}>
          {['일일 리포트', '설비 리포트', '환경 리포트', '작업자 리포트'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-3 text-sm font-medium border-b-2 transition-colors"
              style={
                activeTab === tab
                  ? { color: primary, borderColor: primary }
                  : { color: textMuted, borderColor: 'transparent' }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6 flex-1 overflow-auto pb-[20px] pr-2 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 border" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: `${primary}1A` }}>
               <Bell size={24} style={{ color: primary }} />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-sm font-medium" style={{ color: textMuted }}>전체 알림 건수</div>
               <div className="text-3xl font-bold mt-0.5" style={{ color: textStrong }}>86 <span className="text-sm font-normal" style={{ color: textMuted }}>건</span></div>
            </div>
          </div>
          <div className="rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 border" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
               <AlertTriangle size={24} className="text-orange-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-sm font-medium" style={{ color: textMuted }}>위험/경고 건수</div>
               <div className="text-3xl font-bold mt-0.5" style={{ color: textStrong }}>30 <span className="text-sm font-normal" style={{ color: textMuted }}>건</span></div>
            </div>
          </div>
          <div className="rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 border" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
               <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-sm font-medium" style={{ color: textMuted }}>조치 완료율</div>
               <div className="text-3xl font-bold mt-0.5" style={{ color: textStrong }}>87.2 <span className="text-sm font-normal" style={{ color: textMuted }}>%</span></div>
            </div>
          </div>
          <div className="rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 border" style={{ background: surface, borderColor: border }}>
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
               <RotateCcw size={24} className="text-purple-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-sm font-medium" style={{ color: textMuted }}>반복 발생 대상</div>
               <div className="text-3xl font-bold mt-0.5" style={{ color: textStrong }}>7 <span className="text-sm font-normal" style={{ color: textMuted }}>건</span></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 shrink-0 border p-3 rounded-xl" style={{ background: surface, borderColor: border }}>
           <div className="flex flex-col">
             <span className="text-[10px] mb-1 ml-1" style={{ color: textMuted }}>기간 선택</span>
             <div className="flex items-center rounded-lg p-0.5 h-[32px]" style={{ background: bg }}>
               {['오늘', '최근 7일', '최근 30일'].map(s => (
                 <button key={s} className={`px-3 py-1 text-xs rounded`}
                   style={s === '최근 7일' ? { backgroundColor: primary, color: '#fff' } : { color: textMuted }}>
                   {s}
                 </button>
               ))}
               <button className="px-3 py-1 text-xs rounded flex items-center gap-1 border-l ml-1 pl-3" style={{ color: textMuted, borderColor: border }}>
                 직접 선택 <Calendar size={12} />
               </button>
             </div>
           </div>

           <div className="flex flex-col">
             <span className="text-[10px] mb-1 ml-1" style={{ color: textMuted }}>리포트 유형</span>
             <div className="flex items-center rounded-lg p-0.5 h-[32px]" style={{ background: bg }}>
               {['전체', '설비', '환경', '작업자', '조치'].map(s => (
                 <button key={s} className={`px-3 py-1 text-xs rounded`}
                   style={s === '전체' ? { backgroundColor: primary, color: '#fff' } : { color: textMuted }}>
                   {s}
                 </button>
               ))}
             </div>
           </div>

           <div className="flex flex-col">
             <span className="text-[10px] mb-1 ml-1" style={{ color: textMuted }}>위험 등급</span>
             <select className="border-none rounded-lg px-3 text-xs outline-none h-[32px] min-w-[100px]" style={{ background: bg, color: textStrong }}>
               <option>전체</option>
             </select>
           </div>

           <div className="flex flex-col">
             <span className="text-[10px] mb-1 ml-1" style={{ color: textMuted }}>위치</span>
             <select className="border-none rounded-lg px-3 text-xs outline-none h-[32px] min-w-[100px]" style={{ background: bg, color: textStrong }}>
               <option>전체</option>
             </select>
           </div>

           <div className="flex flex-col">
             <span className="text-[10px] mb-1 ml-1" style={{ color: textMuted }}>조치 상태</span>
             <select className="border-none rounded-lg px-3 text-xs outline-none h-[32px] min-w-[100px]" style={{ background: bg, color: textStrong }}>
               <option>전체</option>
             </select>
           </div>

           <div className="ml-auto flex items-center gap-2 mt-4">
               <button className="flex items-center gap-1.5 border text-xs px-3 py-1.5 rounded-lg transition-colors" style={{ background: bg, borderColor: border, color: textStrong }}>
                 <FileText size={14} /> PDF 다운로드
               </button>
               <button className="flex items-center gap-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-xs px-3 py-1.5 rounded-lg transition-colors">
                 <Download size={14} /> Excel 다운로드
               </button>
           </div>
        </div>

        {/* AI Summary */}
        <div className="rounded-xl p-4 flex gap-4 items-start shrink-0 border" style={{ background: `${primary}1A`, borderColor: `${primary}4D` }}>
           <div className="p-2 rounded-lg shrink-0 mt-0.5" style={{ background: `${primary}33` }}>
             <FileText size={18} style={{ color: primary }} />
           </div>
           <p className="text-sm leading-relaxed" style={{ color: textStrong }}>
             선택 기간(<span className="font-bold" style={{ color: textStrong }}>최근 7일</span>) 동안 전체 알림은 <span className="font-bold" style={{ color: primary }}>86건</span>이며, 위험/경고 알림은 <span className="font-bold" style={{ color: primary }}>30건</span>(34.9%) 발생했습니다.<br/>
             조치 완료율은 <span className="font-bold text-emerald-400">87.2%</span>로 양호한 수준이며, 보일러 순환펌프 P-102 등 <span className="font-bold text-emerald-400">7개</span> 대상이 반복 발생하고 있습니다.
           </p>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 shrink-0 h-[300px]">
           <div className="rounded-xl flex flex-col p-4 lg:col-span-3 border" style={{ background: surface, borderColor: border }}>
              <div className="text-sm font-bold mb-4" style={{ color: textStrong }}>알림 유형별 통계</div>
              <div className="flex-1 min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={mockBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke={th.chartGrid} vertical={false} />
                     <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                     <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                     <Tooltip
                       contentStyle={{ backgroundColor: th.tooltipBg, borderColor: th.tooltipBd, borderRadius: '8px', fontSize: '12px' }}
                       itemStyle={{ color: '#fff' }}
                       cursor={{ fill: isLight ? 'rgba(0,0,0,.04)' : '#1e293b', opacity: 0.4 }}
                     />
                     <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} iconType="circle" />
                     <Bar dataKey="위험" stackId="a" fill="#ef4444" barSize={40} />
                     <Bar dataKey="경고" stackId="a" fill="#f97316" />
                     <Bar dataKey="주의" stackId="a" fill="#eab308" />
                     <Bar dataKey="정보" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="rounded-xl flex flex-col p-4 lg:col-span-2 border" style={{ background: surface, borderColor: border }}>
              <div className="text-sm font-bold mb-4" style={{ color: textStrong }}>조치 상태별 통계</div>
              <div className="flex flex-1 items-center">
                 <div className="w-[140px] h-[140px] shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockPieData}
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {mockPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: th.tooltipBg, borderColor: th.tooltipBd, fontSize: '11px' }} itemStyle={{ color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[10px] mb-0.5" style={{ color: textMuted }}>총 86건</span>
                       <span className="text-lg font-bold" style={{ color: textStrong }}>15</span>
                    </div>
                 </div>
                 <div className="flex-1 ml-4 text-[11px]">
                    <div className="flex items-center justify-between font-bold mb-2 border-b pb-1" style={{ borderColor: border, color: textMuted }}>
                       <span>상태</span>
                       <span className="w-10 text-right">건수</span>
                       <span className="w-12 text-right">비율</span>
                    </div>
                    {mockPieData.map(item => (
                      <div key={item.name} className="flex items-center justify-between py-1.5" style={{ color: textStrong }}>
                         <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}
                         </div>
                         <div className="w-10 text-right">{item.value}</div>
                         <div className="w-12 text-right" style={{ color: textMuted }}>{(item.value / 86 * 100).toFixed(1)}%</div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between font-bold mt-2 border-t pt-2" style={{ borderColor: border, color: textStrong }}>
                       <span>합계</span>
                       <span className="w-10 text-right">86</span>
                       <span className="w-12 text-right">100%</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 shrink-0 min-h-[300px]">

           <div className="rounded-xl flex flex-col overflow-hidden lg:col-span-3 h-full border" style={{ background: surface, borderColor: border }}>
              <div className="px-4 py-3 border-b text-sm font-bold" style={{ background: surface, borderColor: border, color: textStrong }}>
                주요 이슈 목록
              </div>
              <div className="overflow-x-auto flex-1" style={{ background: bg }}>
                 <table className="w-full text-left whitespace-nowrap text-xs">
                    <thead className="border-b" style={{ borderColor: border, color: textMuted }}>
                      <tr>
                        <th className="px-4 py-3 font-normal text-center">순위</th>
                        <th className="px-3 py-3 font-normal text-center">구분</th>
                        <th className="px-3 py-3 font-normal">대상명</th>
                        <th className="px-3 py-3 font-normal">위치</th>
                        <th className="px-3 py-3 font-normal text-center">발생 건수</th>
                        <th className="px-3 py-3 font-normal text-center">최고 위험 등급</th>
                        <th className="px-3 py-3 font-normal text-center">조치 완료율</th>
                        <th className="px-3 py-3 font-normal text-center">최근 발생 시간</th>
                        <th className="px-3 py-3 font-normal text-center">상세</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: textStrong }}>
                      {mockIssues.filter(i => activeTab === '일일 리포트' || activeTab === '조치 이력 리포트' || i.type === activeTab.replace(' 리포트', '')).map(issue => (
                        <tr key={issue.id} style={{ borderBottom: `1px solid ${th.rowDivider}` }}>
                           <td className="px-4 py-2.5 text-center" style={{ color: textMuted }}>{issue.id}</td>
                           <td className="px-3 py-2.5 text-center">
                             <span className={`px-2 py-0.5 border rounded-sm text-[10px] ${getTypeColor(issue.type)}`}>{issue.type}</span>
                           </td>
                           <td className="px-3 py-2.5 font-medium">{issue.target}</td>
                           <td className="px-3 py-2.5" style={{ color: textMuted }}>{issue.location}</td>
                           <td className="px-3 py-2.5 text-center font-bold" style={{ color: textStrong }}>{issue.count}</td>
                           <td className="px-3 py-2.5 text-center">
                              <span className={`px-1.5 py-0.5 border rounded-sm text-[10px] font-medium ${getLevelColor(issue.level)}`}>{issue.level}</span>
                           </td>
                           <td className="px-3 py-2.5 text-center">{issue.rate}</td>
                           <td className="px-3 py-2.5 text-center" style={{ color: textMuted }}>{issue.time}</td>
                           <td className="px-3 py-2.5 text-center" style={{ color: textMuted }}><ChevronRight size={14} className="mx-auto" /></td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
              <div className="px-3 py-2 border-t flex justify-center" style={{ background: surface, borderColor: border }}>
                  <div className="flex gap-1">
                     <button className="px-2 py-1 rounded flex items-center" style={{ color: textMuted }}>&lt;</button>
                     <button className="px-2.5 py-1 rounded text-xs font-medium" style={{ background: `${primary}33`, color: primary }}>1</button>
                     <button className="px-2.5 py-1 rounded text-xs" style={{ color: textMuted }}>2</button>
                     <button className="px-2 py-1 rounded flex items-center" style={{ color: textMuted }}>&gt;</button>
                     <select className="ml-2 border rounded text-xs px-2 outline-none" style={{ borderColor: border, color: textMuted, background: 'transparent' }}>
                        <option>10 / 페이지</option>
                     </select>
                  </div>
              </div>
           </div>

           <div className="rounded-xl flex flex-col overflow-hidden lg:col-span-2 h-full border" style={{ background: surface, borderColor: border }}>
              <div className="px-4 py-3 border-b text-sm font-bold flex justify-between items-center" style={{ background: surface, borderColor: border, color: textStrong }}>
                리포트 저장 이력
                <a href="#" className="text-xs font-normal hover:underline" style={{ color: primary }}>더보기</a>
              </div>
              <div className="overflow-x-auto flex-1" style={{ background: bg }}>
                 <table className="w-full text-left whitespace-nowrap text-xs">
                    <thead className="border-b" style={{ borderColor: border, color: textMuted }}>
                      <tr>
                        <th className="px-4 py-3 font-normal">리포트명</th>
                        <th className="px-4 py-3 font-normal">기간</th>
                        <th className="px-4 py-3 font-normal">생성 시간</th>
                        <th className="px-3 py-3 font-normal text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody style={{ color: textStrong }}>
                      {mockHistory.map(item => (
                        <tr key={item.id} style={{ borderBottom: `1px solid ${th.rowDivider}` }}>
                           <td className="px-4 py-2.5 font-medium">{item.name}</td>
                           <td className="px-4 py-2.5" style={{ color: textMuted }}>{item.period}</td>
                           <td className="px-4 py-2.5" style={{ color: textMuted }}>{item.time}</td>
                           <td className="px-3 py-2.5 text-center">
                              {item.status === '완료' ? (
                                <span className="text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[10px]">완료</span>
                              ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] border" style={{ color: primary, borderColor: `${primary}4D`, background: `${primary}1A` }}>생성 중</span>
                              )}
                           </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
              <div className="px-3 py-2 border-t flex justify-center" style={{ background: surface, borderColor: border }}>
                  <div className="flex gap-1">
                     <button className="px-2 py-1 rounded flex items-center" style={{ color: textMuted }}>&lt;</button>
                     <button className="px-2.5 py-1 rounded text-xs font-medium" style={{ background: `${primary}33`, color: primary }}>1</button>
                     <button className="px-2.5 py-1 rounded text-xs" style={{ color: textMuted }}>2</button>
                     <button className="px-2 py-1 rounded flex items-center" style={{ color: textMuted }}>&gt;</button>
                  </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
