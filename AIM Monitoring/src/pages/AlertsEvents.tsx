import { useState } from 'react';
import { Search, Calendar, Bell, AlertTriangle, AlertOctagon, CheckCircle2, ChevronRight } from 'lucide-react';

interface Alert {
  id: string;
  time: string;
  level: '위험' | '경고' | '주의' | '정보';
  type: '설비' | '환경' | '작업자' | '시스템';
  target: string;
  location: string;
  content: string;
  actionStatus: '미조치' | '확인 중' | '조치 중' | '완료';
  manager: string;
  details?: Record<string, string>;
}

const mockAlerts: Alert[] = [
  { id: 'ALM-001', time: '2024-05-21 10:22:14', level: '위험', type: '설비', target: '보일러 순환펌프 B-102', location: '발전소 1층', content: '진동 수치 35.2mm/s 초과', actionStatus: '미조치', manager: '-', details: { sensor: '진동 센서 (CH-3)', currentValue: '35.2 mm/s (RMS)', warningLimit: '30.0 mm/s (RMS)', dangerLimit: '40.0 mm/s (RMS)', duration: '3분 12초' } },
  { id: 'ALM-002', time: '2024-05-21 10:18:57', level: '경고', type: '환경', target: '황산 배출가스 측정기', location: '환경설비동', content: 'SO2 농도 25ppm 초과', actionStatus: '미조치', manager: '-' },
  { id: 'ALM-003', time: '2024-05-21 10:15:33', level: '경고', type: '작업자', target: '김철수 (정비팀)', location: '보일러 1층', content: '보호구 미착용 감지', actionStatus: '확인 중', manager: '이영수' },
  { id: 'ALM-004', time: '2024-05-21 10:10:08', level: '주의', type: '설비', target: '터빈 베어링 온도', location: '터빈동 2층', content: '베어링 온도 78°C 도달', actionStatus: '조치 중', manager: '박민수' },
  { id: 'ALM-005', time: '2024-05-21 10:05:21', level: '주의', type: '환경', target: '복수기 출구 온도', location: '발전소 3층', content: '복수기 출구 온도 34.6°C', actionStatus: '완료', manager: '정현우' },
  { id: 'ALM-006', time: '2024-05-21 09:58:44', level: '정보', type: '시스템', target: '데이터 수집 서버', location: '전산실', content: 'CPU 사용률 85%', actionStatus: '완료', manager: '최지훈' },
  { id: 'ALM-007', time: '2024-05-21 09:52:10', level: '주의', type: '설비', target: '급수펌프 A-01', location: '발전소 1층', content: '베어링 온도 72°C 도달', actionStatus: '완료', manager: '박민수' },
  { id: 'ALM-008', time: '2024-05-21 09:45:07', level: '정보', type: '작업자', target: '이지연 (운전팀)', location: '제어실', content: '출입 통제 구역 출입 감지', actionStatus: '완료', manager: '김도현' },
];

export default function AlertsEvents() {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(mockAlerts[0]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case '위험': return 'text-red-500 border-red-500/30 font-medium';
      case '경고': return 'text-orange-500 border-orange-500/30 font-medium';
      case '주의': return 'text-yellow-500 border-yellow-500/30 font-medium';
      case '정보': return 'text-blue-500 border-blue-500/30 font-medium';
      default: return 'text-slate-500 border-slate-500/30';
    }
  };

  const getActionColor = (status: string) => {
    switch (status) {
      case '미조치': return 'text-red-400 border-red-500/30';
      case '확인 중': return 'text-orange-400 border-orange-500/30';
      case '조치 중': return 'text-yellow-400 border-yellow-500/30';
      case '완료': return 'text-emerald-400 border-emerald-500/30 text-[11px] px-2 py-0.5 rounded-sm bg-blue-500/10 font-medium';
      default: return 'text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
       <div className="shrink-0 mb-4 lg:mb-6">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            알림/이벤트
          </h2>
       </div>

      <div className="flex flex-col gap-4 lg:gap-6 flex-1 overflow-auto pb-[20px] pr-2 custom-scrollbar">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
               <Bell size={24} className="text-blue-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">오늘 전체 알림</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">86 <span className="text-sm font-normal text-slate-500">건</span></div>
            </div>
            <div className="absolute top-4 right-4 text-xs text-blue-400">전일 대비 ▼ 12.2%</div>
          </div>
          
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
               <AlertTriangle size={24} className="text-orange-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">위험/경고 알림</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">18 <span className="text-sm font-normal text-slate-500">건</span></div>
            </div>
            <div className="absolute top-4 right-4 text-xs text-red-400">전일 대비 ▲ 5.9%</div>
          </div>

          <div className="bg-[#111827] border border-red-500/30 rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
               <AlertOctagon size={24} className="text-red-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-red-400 text-sm font-bold">미조치 알림</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">11 <span className="text-sm font-normal text-slate-500">건</span></div>
            </div>
            <div className="absolute top-4 right-4 text-xs text-slate-500">전체의 12.8%</div>
          </div>

          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
               <CheckCircle2 size={24} className="text-emerald-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">조치 완료 알림</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">75 <span className="text-sm font-normal text-slate-500">건</span></div>
            </div>
            <div className="absolute top-4 right-4 text-xs text-emerald-400">전일 대비 ▼ 16.3%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex flex-col w-[200px]">
             <span className="text-[10px] text-slate-500 mb-1">키워드 검색</span>
             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
               <input type="text" placeholder="알림 내용, 대상명 검색" className="bg-[#111827] border border-[#1f2937] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none w-full" />
             </div>
          </div>
          
          <div className="flex flex-col">
             <span className="text-[10px] text-slate-500 mb-1">기간 선택</span>
             <div className="relative">
               <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
               <input type="text" value="2024-05-21 00:00 ~ 2024-05-21 23:59" readOnly className="bg-[#111827] border border-[#1f2937] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 outline-none w-[240px] cursor-pointer" />
             </div>
          </div>

          <div className="flex flex-col">
             <span className="text-[10px] text-slate-500 mb-1">유형</span>
             <div className="flex items-center bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 h-[30px]">
                {['전체', '설비', '환경', '작업자', '시스템'].map(s => (
                   <button key={s} className={`px-3 py-1 text-xs rounded ${s === '전체' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                     {s}
                   </button>
                ))}
             </div>
          </div>

          <div className="flex flex-col">
             <span className="text-[10px] text-slate-500 mb-1">등급</span>
             <div className="flex items-center bg-[#111827] border border-[#1f2937] rounded-lg p-0.5 h-[30px]">
                {['전체', '정보', '주의', '경고', '위험'].map(s => (
                   <button key={s} className={`px-2.5 py-1 text-xs flex items-center gap-1 rounded ${s === '전체' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                     {(s !== '전체') && <div className={`w-1.5 h-1.5 rounded-full ${s === '정보' ? 'bg-blue-500' : s === '주의' ? 'bg-yellow-500' : s === '경고' ? 'bg-orange-500' : 'bg-red-500'}`} />}
                     {s}
                   </button>
                ))}
             </div>
          </div>
          
          <div className="flex flex-col ml-auto">
             <span className="text-[10px] text-slate-500 mb-1">조치 상태</span>
             <select className="bg-[#111827] border border-[#1f2937] rounded-lg px-2 py-1 text-xs text-slate-300 outline-none h-[30px] min-w-[100px]">
                <option>전체</option>
                <option>미조치</option>
                <option>확인 중</option>
                <option>조치 중</option>
                <option>완료</option>
             </select>
          </div>
          
          <div className="flex flex-col">
             <span className="text-[10px] text-slate-500 mb-1">위치</span>
             <select className="bg-[#111827] border border-[#1f2937] rounded-lg px-2 py-1 text-xs text-slate-300 outline-none h-[30px] min-w-[100px]">
                <option>전체</option>
             </select>
          </div>
        </div>

        {/* Main Split View */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 shrink-0 lg:h-[480px]">
           {/* List */}
           <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col w-full lg:w-[65%] overflow-hidden h-full">
              <div className="px-4 py-3 border-b border-[#1f2937] flex items-center gap-2 text-sm font-bold text-slate-300">
                 알림 목록 <span className="bg-[#1e293b] text-slate-400 px-2 py-0.5 rounded text-[10px] font-normal">총 86건</span>
              </div>
              <div className="overflow-x-auto flex-1 bg-[#0b1120]/30 min-h-[300px]">
                 <table className="w-full text-left whitespace-nowrap">
                   <thead className="text-[11px] text-slate-400 border-b border-[#1f2937] bg-[#1e293b]/50">
                     <tr>
                        <th className="px-4 py-3 font-medium cursor-pointer flex items-center gap-1">발생 시간 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></th>
                        <th className="px-3 py-3 font-medium text-center">등급</th>
                        <th className="px-3 py-3 font-medium text-center">유형</th>
                        <th className="px-4 py-3 font-medium">대상명</th>
                        <th className="px-4 py-3 font-medium">위치</th>
                        <th className="px-4 py-3 font-medium">알림 내용</th>
                        <th className="px-3 py-3 font-medium text-center">조치 상태</th>
                        <th className="px-3 py-3 font-medium text-center">담당자</th>
                        <th className="px-3 py-3 font-medium text-center">상세</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#1f2937] text-[12px]">
                      {mockAlerts.map(alert => (
                        <tr 
                          key={alert.id}
                          onClick={() => setSelectedAlert(alert)}
                          className={`cursor-pointer transition-colors ${selectedAlert?.id === alert.id ? 'bg-[#1e293b]' : 'hover:bg-[#1e293b]/50'}`}
                        >
                           <td className="px-4 py-3 text-slate-300">{alert.time}</td>
                           <td className="px-3 py-3 text-center">
                              <span className={`px-1.5 py-0.5 border rounded-sm text-[10px] ${getLevelColor(alert.level)}`}>{alert.level}</span>
                           </td>
                           <td className="px-3 py-3 text-center text-slate-400">{alert.type}</td>
                           <td className="px-4 py-3 font-medium text-slate-200">{alert.target}</td>
                           <td className="px-4 py-3 text-slate-400">{alert.location}</td>
                           <td className="px-4 py-3 text-slate-300 truncate max-w-[200px]" title={alert.content}>{alert.content}</td>
                           <td className="px-3 py-3 text-center">
                              {alert.actionStatus === '완료' ? (
                                <span className={getActionColor(alert.actionStatus)}>{alert.actionStatus}</span>
                              ) : (
                                <span className={`text-[10px] border px-1.5 py-0.5 rounded-sm ${getActionColor(alert.actionStatus)}`}>{alert.actionStatus}</span>
                              )}
                           </td>
                           <td className="px-3 py-3 text-center text-slate-400">{alert.manager}</td>
                           <td className="px-3 py-3 text-center text-slate-500"><ChevronRight size={14} className="mx-auto"/></td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
              </div>
              <div className="px-4 py-2 border-t border-[#1f2937] flex items-center justify-center text-xs text-slate-500 bg-[#111827]">
                 <div className="flex gap-1 items-center">
                   <button className="px-2 py-1 hover:bg-[#1f2937] rounded text-slate-400">&lt;&lt;</button>
                   <button className="px-2 py-1 hover:bg-[#1f2937] rounded text-slate-400">&lt;</button>
                   <button className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">1</button>
                   <button className="px-2 py-1 hover:bg-[#1f2937] rounded">2</button>
                   <button className="px-2 py-1 hover:bg-[#1f2937] rounded">3</button>
                   <button className="px-2 py-1 hover:bg-[#1f2937] rounded">4</button>
                   <button className="px-2 py-1 hover:bg-[#1f2937] rounded">5</button>
                   <button className="px-2 py-1 hover:bg-[#1f2937] rounded text-slate-400">&gt;</button>
                   <button className="px-2 py-1 hover:bg-[#1f2937] rounded text-slate-400">&gt;&gt;</button>
                   <select className="bg-transparent border border-[#334155] rounded outline-none ml-2 text-slate-400 py-1">
                      <option>10 / 페이지</option>
                   </select>
                 </div>
              </div>
           </div>
           
           {/* Detail Panel */}
           {selectedAlert && (
             <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col w-full lg:w-[35%] overflow-hidden h-full animate-in slide-in-from-right-4 fade-in duration-200">
                <div className="px-4 py-3 border-b border-[#1f2937] flex items-center gap-2 text-sm font-bold text-slate-300">
                  알림 상세
                  <span className="text-[10px] bg-[#1e293b] text-slate-400 font-normal px-2 py-0.5 rounded">선택된 알림</span>
                </div>
                <div className="p-4 flex flex-col gap-6 bg-[#0b1120] flex-1 overflow-y-auto custom-scrollbar">
                  
                  {/* Grid Info */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                     <div>
                        <div className="text-slate-500 mb-0.5">알림 ID</div>
                        <div className="text-slate-200 font-medium">{selectedAlert.id}</div>
                     </div>
                     <div>
                        <div className="text-slate-500 mb-0.5">위치</div>
                        <div className="text-slate-200">{selectedAlert.location}</div>
                     </div>
                     <div>
                        <div className="text-slate-500 mb-0.5">발생 시간</div>
                        <div className="text-slate-200">{selectedAlert.time}</div>
                     </div>
                     <div>
                        <div className="text-slate-500 mb-0.5">현재 상태</div>
                        <div>
                          {selectedAlert.actionStatus === '완료' ? (
                            <span className={getActionColor(selectedAlert.actionStatus)}>{selectedAlert.actionStatus}</span>
                          ) : (
                            <span className={`text-[10px] border px-1.5 py-0.5 rounded-sm ${getActionColor(selectedAlert.actionStatus)}`}>{selectedAlert.actionStatus}</span>
                          )}
                        </div>
                     </div>
                     <div>
                        <div className="text-slate-500 mb-0.5">유형</div>
                        <div className="text-slate-200">{selectedAlert.type}</div>
                     </div>
                     <div className="col-span-2">
                        <div className="text-slate-500 mb-0.5">등급</div>
                        <div><span className={`px-1.5 py-0.5 border rounded-sm text-[10px] ${getLevelColor(selectedAlert.level)}`}>{selectedAlert.level}</span></div>
                     </div>
                     <div className="col-span-2 mt-1">
                        <div className="text-slate-500 mb-0.5">대상명</div>
                        <div className="text-slate-200 font-bold">{selectedAlert.target}</div>
                     </div>
                  </div>

                  {/* Body Content */}
                  <div className="border border-[#1f2937] rounded-lg bg-[#111827] overflow-hidden">
                    <div className="px-3 py-2 border-b border-[#1f2937] bg-[#1e293b]/30">
                       <h4 className="text-xs font-bold text-slate-300">상세 내용</h4>
                    </div>
                    <div className="p-3 text-xs text-slate-400">
                       <p className="mb-4">{selectedAlert.content}가 발생했습니다. 담당자 확인이 필요합니다.</p>
                       
                       {selectedAlert.details && (
                         <table className="w-full text-left">
                           <thead className="border-b border-[#334155] text-slate-500">
                             <tr>
                               <th className="pb-1 font-normal w-1/4">관련 센서</th>
                               <th className="pb-1 font-normal">현재 값</th>
                               <th className="pb-1 font-normal">경고 기준</th>
                               <th className="pb-1 font-normal text-red-500/80">위험 기준</th>
                               <th className="pb-1 font-normal text-right">지속 시간</th>
                             </tr>
                           </thead>
                           <tbody className="text-slate-200">
                             <tr>
                               <td className="pt-2">{selectedAlert.details.sensor}</td>
                               <td className="pt-2">{selectedAlert.details.currentValue}</td>
                               <td className="pt-2 text-slate-400">{selectedAlert.details.warningLimit}</td>
                               <td className="pt-2 text-red-400">{selectedAlert.details.dangerLimit}</td>
                               <td className="pt-2 text-right">{selectedAlert.details.duration}</td>
                             </tr>
                           </tbody>
                         </table>
                       )}
                    </div>
                  </div>

                  {/* Action Area */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 mb-3">조치 정보</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                       <div>
                         <label className="text-[10px] text-slate-500 block mb-1">담당자</label>
                         <select className="bg-[#111827] border border-[#334155] rounded-md px-2 py-1.5 text-xs text-slate-300 outline-none w-full">
                           <option>선택하세요</option>
                           <option>홍길동 (안전팀)</option>
                         </select>
                       </div>
                       <div>
                         <label className="text-[10px] text-slate-500 block mb-1">조치 상태</label>
                         <select className="bg-[#111827] border border-[#334155] rounded-md px-2 py-1.5 text-xs text-slate-300 outline-none w-full">
                           <option>미조치</option>
                           <option>확인 중</option>
                           <option>조치 중</option>
                           <option>완료</option>
                         </select>
                       </div>
                       <div className="col-span-2">
                         <label className="text-[10px] text-slate-500 block mb-1">조치 내용</label>
                         <textarea 
                           className="bg-[#111827] border border-[#334155] rounded-md px-3 py-2 text-xs text-slate-300 outline-none w-full h-[60px] resize-none"
                           placeholder="조치 내용을 입력하세요."
                         />
                         <div className="text-right text-[10px] text-slate-500 mt-1">0 / 500</div>
                       </div>
                    </div>
                    <div className="flex justify-end">
                       <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors shadow-lg shadow-blue-900/20">
                          조치 등록
                       </button>
                    </div>
                  </div>

                </div>
             </div>
           )}
        </div>

        {/* Bottom Stats / Logs Layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 shrink-0 mt-2">
           {/* Event Log */}
           <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col flex-1 lg:w-1/2 p-4">
              <div className="text-sm font-bold text-slate-300 mb-4">이벤트 처리 로그</div>
              <div className="relative flex-1">
                 {/* Line */}
                 <div className="absolute left-[5px] top-[4px] bottom-[4px] w-0.5 bg-[#334155] z-0" />
                 
                 <div className="flex flex-col gap-4 relative z-10 text-xs">
                    <div className="flex items-start gap-4">
                       <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-[#111827] mt-0.5 shrink-0" />
                       <div className="w-[60px] text-slate-400">10:22:14</div>
                       <div className="w-[60px] font-medium text-slate-300">알림 발생</div>
                       <div className="flex-1 text-slate-400">보일러 순환펌프 B-102 진동 수치 35.2mm/s 초과</div>
                       <div className="w-[50px] text-right text-slate-500">시스템</div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                       <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-[#111827] mt-0.5 shrink-0" />
                       <div className="w-[60px] text-slate-400">10:23:05</div>
                       <div className="w-[60px] font-medium text-slate-300">담당자 확인</div>
                       <div className="flex-1 text-slate-400">홍길동 (발전운영팀)님이 알림을 확인했습니다.</div>
                       <div className="w-[50px] text-right text-slate-500">홍길동</div>
                    </div>

                    <div className="flex items-start gap-4">
                       <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-[#111827] mt-0.5 shrink-0" />
                       <div className="w-[60px] text-slate-400">10:23:48</div>
                       <div className="w-[60px] font-medium text-slate-300">조치 시작</div>
                       <div className="flex-1 text-slate-400">현장 확인 후 설비 점검을 시작했습니다.</div>
                       <div className="w-[50px] text-right text-slate-500">홍길동</div>
                    </div>
                    
                    <div className="flex items-start gap-4 opacity-50">
                       <div className="w-3 h-3 rounded-full bg-slate-500 border-2 border-[#111827] mt-0.5 shrink-0" />
                       <div className="w-[60px] text-slate-500">-</div>
                       <div className="w-[60px] font-medium text-slate-500">조치 완료</div>
                       <div className="flex-1 text-slate-500">조치가 완료되지 않았습니다.</div>
                       <div className="w-[50px] text-right text-slate-500">-</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Stats Table */}
           <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col flex-1 lg:w-1/2 p-4">
              <div className="text-sm font-bold text-slate-300 mb-4">알림 통계 (오늘)</div>
              <table className="w-full text-center text-xs">
                 <thead className="text-slate-500 border-b border-[#334155] border-dashed">
                   <tr>
                     <th className="pb-2 font-normal text-left">유형</th>
                     <th className="pb-2 font-normal">전체</th>
                     <th className="pb-2 font-normal text-red-500">위험</th>
                     <th className="pb-2 font-normal text-orange-500">경고</th>
                     <th className="pb-2 font-normal text-yellow-500">주의</th>
                     <th className="pb-2 font-normal text-blue-500">정보</th>
                     <th className="pb-2 font-normal text-red-400">미조치</th>
                     <th className="pb-2 font-normal text-emerald-400">완료</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#1f2937]/50 text-slate-300">
                   <tr>
                     <td className="py-2 text-left">설비</td>
                     <td className="py-2">32</td>
                     <td className="py-2 text-red-400">6</td>
                     <td className="py-2 text-orange-400">8</td>
                     <td className="py-2 text-yellow-400">10</td>
                     <td className="py-2 text-blue-400">8</td>
                     <td className="py-2 text-red-400">6</td>
                     <td className="py-2">26</td>
                   </tr>
                   <tr>
                     <td className="py-2 text-left">환경</td>
                     <td className="py-2">20</td>
                     <td className="py-2 text-red-400">4</td>
                     <td className="py-2 text-orange-400">6</td>
                     <td className="py-2 text-yellow-400">6</td>
                     <td className="py-2 text-blue-400">4</td>
                     <td className="py-2 text-red-400">3</td>
                     <td className="py-2">17</td>
                   </tr>
                   <tr>
                     <td className="py-2 text-left">작업자</td>
                     <td className="py-2">16</td>
                     <td className="py-2 text-red-400">2</td>
                     <td className="py-2 text-orange-400">3</td>
                     <td className="py-2 text-yellow-400">6</td>
                     <td className="py-2 text-blue-400">5</td>
                     <td className="py-2 text-red-400">2</td>
                     <td className="py-2">14</td>
                   </tr>
                   <tr>
                     <td className="py-2 text-left">시스템</td>
                     <td className="py-2">18</td>
                     <td className="py-2 text-red-400">0</td>
                     <td className="py-2 text-orange-400">1</td>
                     <td className="py-2 text-yellow-400">2</td>
                     <td className="py-2 text-blue-400">15</td>
                     <td className="py-2 text-red-400">0</td>
                     <td className="py-2">18</td>
                   </tr>
                 </tbody>
                 <tfoot className="border-t border-[#1f2937] text-slate-200">
                   <tr>
                     <td className="py-2 text-left font-bold">합계</td>
                     <td className="py-2 font-bold">86</td>
                     <td className="py-2 font-bold text-red-400">12</td>
                     <td className="py-2 font-bold text-orange-400">18</td>
                     <td className="py-2 font-bold text-yellow-400">24</td>
                     <td className="py-2 font-bold text-blue-400">32</td>
                     <td className="py-2 font-bold text-red-400">11</td>
                     <td className="py-2 font-bold">75</td>
                   </tr>
                 </tfoot>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
}
