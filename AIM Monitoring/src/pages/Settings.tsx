import { useState } from 'react';
import { Users, FileText, Map, Share2, Search, Plus, Lock, CheckSquare, Edit, Square } from 'lucide-react';

const mockUsers = [
  { id: 'U-01', name: '홍길동', email: 'honggd@cwp.co.kr', dept: '발전운영처', role: '시스템 관리자', permission: '전체 관리자', status: '활성', lastLogin: '2024-05-21 09:15', checked: true },
  { id: 'U-02', name: '김민수', email: 'kimms@cwp.co.kr', dept: '통합관제센터', role: '관제 운영자', permission: '운영자', status: '활성', lastLogin: '2024-05-21 08:47', checked: false },
  { id: 'U-03', name: '박지현', email: 'parkjh@cwp.co.kr', dept: '발전운영처', role: '현장 담당자', permission: '현장', status: '활성', lastLogin: '2024-05-21 07:58', checked: false },
  { id: 'U-04', name: '이영수', email: 'leeys@cwp.co.kr', dept: '설비기술처', role: '현장 담당자', permission: '현장', status: '비활성', lastLogin: '2024-05-19 18:22', checked: false },
  { id: 'U-05', name: '최지훈', email: 'choijh@cwp.co.kr', dept: '안전보건실', role: '안전 관리자', permission: '안전 관리자', status: '활성', lastLogin: '2024-05-21 09:02', checked: false },
  { id: 'U-06', name: '정수연', email: 'jungsy@cwp.co.kr', dept: '정보통신처', role: '시스템 관리자', permission: '시스템 관리자', status: '활성', lastLogin: '2024-05-21 08:11', checked: false },
  { id: 'U-07', name: '한상우', email: 'hansw@cwp.co.kr', dept: '발전운영처', role: '조회 전용', permission: '조회 전용', status: '활성', lastLogin: '2024-05-20 16:35', checked: false },
  { id: 'U-08', name: '강민규', email: 'kangmg@cwp.co.kr', dept: '외주 협력사', role: '조회 전용', permission: '조회 전용', status: '잠금', lastLogin: '2024-05-18 11:05', checked: false },
];

const mockHistory = [
  { id: 1, time: '2024-05-21 09:10:14', targetUser: '정수연 (정보통신처)', item: '권한', beforeAfter: '운영자 → 시스템 관리자', requestor: '홍길동 (시스템 관리자)' },
  { id: 2, time: '2024-05-20 17:32:05', targetUser: '강민규 (외주 협력사)', item: '계정 상태', beforeAfter: '활성 → 잠금', requestor: '홍길동 (시스템 관리자)' },
  { id: 3, time: '2024-05-19 14:25:33', targetUser: '이영수 (설비기술처)', item: '역할', beforeAfter: '현장 담당자 → 조회 전용', requestor: '정수연 (시스템 관리자)' },
  { id: 4, time: '2024-05-18 10:05:12', targetUser: '한상우 (발전운영처)', item: '권한', beforeAfter: '운영자 → 조회 전용', requestor: '홍길동 (시스템 관리자)' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('사용자/권한');
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 mb-4 lg:mb-6 flex flex-col justify-end">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4 mt-2">
          설정
        </h2>
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-[#1f2937] shrink-0 w-full mb-1">
           {['사용자/권한', '설비/구역 관리', '알림 기준', '데이터 연동', '화면 설정'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                 activeTab === tab 
                   ? 'text-blue-400 border-blue-500' 
                   : 'text-slate-400 border-transparent hover:text-slate-300'
               }`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6 flex-1 overflow-auto pb-[20px] pr-2 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
               <Users size={24} className="text-blue-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">등록 사용자 수</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">24 <span className="text-sm font-normal text-slate-500">명</span></div>
            </div>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
               <FileText size={24} className="text-emerald-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">등록 설비 수</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">156 <span className="text-sm font-normal text-slate-500">개소</span></div>
            </div>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
               <Map size={24} className="text-purple-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">등록 구역 수</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">48 <span className="text-sm font-normal text-slate-500">구역</span></div>
            </div>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl px-5 py-4 flex gap-4 items-center h-[100px] shrink-0">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
               <Share2 size={24} className="text-cyan-500" />
            </div>
            <div className="flex flex-col flex-1">
               <div className="text-slate-400 text-sm font-medium">연동 장치 수</div>
               <div className="text-3xl font-bold text-slate-100 mt-0.5">63 <span className="text-sm font-normal text-slate-500">대</span></div>
            </div>
          </div>
        </div>

        {/* Tab Content (User Management) */}
        {activeTab === '사용자/권한' && (
          <div className="flex flex-col gap-4 lg:gap-6 flex-1 min-h-0">
             
             {/* Filter Bar */}
             <div className="flex flex-wrap items-end gap-4 shrink-0">
               <div className="flex flex-col w-[200px]">
                 <span className="text-[10px] text-slate-500 mb-1 ml-1">사용자명 검색</span>
                 <div className="relative">
                   <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input type="text" placeholder="사용자명 입력" className="bg-[#111827] border border-[#1f2937] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none w-full" />
                 </div>
               </div>
               
               <div className="flex flex-col">
                 <span className="text-[10px] text-slate-500 mb-1 ml-1">소속</span>
                 <select className="bg-[#111827] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none w-[120px]">
                   <option>전체</option>
                 </select>
               </div>
               
               <div className="flex flex-col">
                 <span className="text-[10px] text-slate-500 mb-1 ml-1">권한</span>
                 <select className="bg-[#111827] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none w-[120px]">
                   <option>전체</option>
                 </select>
               </div>
               
               <div className="flex flex-col">
                 <span className="text-[10px] text-slate-500 mb-1 ml-1">계정 상태</span>
                 <select className="bg-[#111827] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none w-[120px]">
                   <option>전체</option>
                 </select>
               </div>

               <div className="ml-auto flex items-center gap-2">
                 <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                   <Plus size={14} /> 사용자 추가
                 </button>
                 <button className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-slate-300 text-xs px-4 py-1.5 rounded-lg transition-colors">
                   <Lock size={14} /> 권한 저장
                 </button>
               </div>
             </div>

             {/* Split View */}
             <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 shrink-0 lg:h-[400px]">
               {/* User List */}
               <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col w-full lg:w-[60%] overflow-hidden h-full">
                 <div className="px-4 py-3 border-b border-[#1f2937] flex items-center gap-2 text-sm font-bold text-slate-300 bg-[#111827]">
                    사용자 목록
                 </div>
                 <div className="overflow-x-auto bg-[#0b1120]/50 flex-1 custom-scrollbar">
                    <table className="w-full text-left whitespace-nowrap text-xs">
                      <thead className="text-slate-400 border-b border-[#1f2937] bg-[#1e293b]/50">
                        <tr>
                          <th className="pl-4 py-3 font-normal w-10"><Square size={14} className="text-slate-500" /></th>
                          <th className="px-2 py-3 font-normal text-slate-300">이름</th>
                          <th className="px-2 py-3 font-normal">소속</th>
                          <th className="px-2 py-3 font-normal">역할</th>
                          <th className="px-2 py-3 font-normal">권한</th>
                          <th className="px-2 py-3 font-normal text-center">계정 상태</th>
                          <th className="px-2 py-3 font-normal text-right">최근 로그인</th>
                          <th className="pr-4 py-3 font-normal text-center w-14">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f2937]">
                        {mockUsers.map((user, i) => (
                           <tr key={user.id} className={`transition-colors cursor-pointer ${i === 0 ? 'bg-[#1e293b]' : 'hover:bg-[#1e293b]/30'}`}>
                             <td className="pl-4 py-2.5">
                                {user.checked ? (
                                  <CheckSquare size={14} className="text-blue-500" />
                                ) : (
                                  <Square size={14} className="text-slate-500" />
                                )}
                             </td>
                             <td className="px-2 py-2.5 font-medium text-slate-200">{user.name}</td>
                             <td className="px-2 py-2.5 text-slate-400">{user.dept}</td>
                             <td className="px-2 py-2.5 text-slate-400">{user.role}</td>
                             <td className="px-2 py-2.5 text-slate-300">{user.permission}</td>
                             <td className="px-2 py-2.5 text-center">
                                <span className={`px-1.5 py-0.5 border rounded-sm text-[10px] ${
                                  user.status === '활성' ? 'border-emerald-500/30 text-emerald-400' :
                                  user.status === '비활성' ? 'border-slate-500/30 text-slate-400' :
                                  'border-red-500/30 bg-red-500/10 text-red-400'
                                }`}>{user.status}</span>
                             </td>
                             <td className="px-2 py-2.5 text-slate-500 text-right">{user.lastLogin}</td>
                             <td className="pr-4 py-2.5 text-center text-slate-400">
                                <Edit size={14} className="mx-auto hover:text-blue-400 transition-colors" />
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
                 <div className="px-3 py-2 border-t border-[#1f2937] flex justify-center items-center bg-[#111827]">
                  <div className="flex gap-1 items-center">
                     <button className="px-2 py-1 text-slate-500 hover:bg-[#1f2937] rounded flex items-center">&lt;&lt;</button>
                     <button className="px-2 py-1 text-slate-500 hover:bg-[#1f2937] rounded flex items-center">&lt;</button>
                     <button className="px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-medium">1</button>
                     <button className="px-2.5 py-1 text-slate-400 hover:bg-[#1f2937] rounded text-xs">2</button>
                     <button className="px-2.5 py-1 text-slate-400 hover:bg-[#1f2937] rounded text-xs">3</button>
                     <button className="px-2 py-1 text-slate-500 hover:bg-[#1f2937] rounded flex items-center">&gt;</button>
                     <button className="px-2 py-1 text-slate-500 hover:bg-[#1f2937] rounded flex items-center">&gt;&gt;</button>
                     
                     <select className="ml-2 bg-transparent border border-[#334155] rounded text-slate-400 text-xs px-2 outline-none">
                        <option>10 / 페이지</option>
                     </select>
                  </div>
                 </div>
               </div>

               {/* Detail View */}
               <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col w-full lg:w-[40%] overflow-hidden h-full">
                 <div className="px-4 py-3 border-b border-[#1f2937] flex items-center gap-2 text-sm font-bold text-slate-300 bg-[#111827]">
                    사용자 상세
                 </div>
                 <div className="p-4 flex flex-col gap-5 bg-[#0b1120] overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex gap-4 items-center mb-2">
                       <div className="w-14 h-14 rounded-full bg-blue-900/40 border-2 border-blue-800/50 flex items-center justify-center shrink-0">
                          <Users size={24} className="text-blue-400" />
                       </div>
                       <div className="flex flex-col">
                          <div className="text-xl font-bold text-slate-100">{mockUsers[0].name}</div>
                          <div className="text-xs text-slate-400 mb-0.5">{mockUsers[0].email}</div>
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 활성
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-5 gap-y-3 gap-x-2 text-xs items-center">
                       <div className="col-span-1 text-slate-400">이름</div>
                       <div className="col-span-4"><input type="text" value={mockUsers[0].name} readOnly className="w-full bg-[#111827] border border-[#334155] rounded p-1.5 text-slate-300 outline-none" /></div>

                       <div className="col-span-1 text-slate-400">소속</div>
                       <div className="col-span-4">
                         <select className="w-full bg-[#111827] border border-[#334155] rounded p-1.5 text-slate-300 outline-none">
                           <option>{mockUsers[0].dept}</option>
                         </select>
                       </div>

                       <div className="col-span-1 text-slate-400">역할</div>
                       <div className="col-span-4">
                         <select className="w-full bg-[#111827] border border-[#334155] rounded p-1.5 text-slate-300 outline-none">
                           <option>{mockUsers[0].role}</option>
                         </select>
                       </div>

                       <div className="col-span-1 text-slate-400">권한</div>
                       <div className="col-span-4">
                         <select className="w-full bg-[#111827] border border-[#334155] rounded p-1.5 text-slate-300 outline-none">
                           <option>{mockUsers[0].permission}</option>
                         </select>
                       </div>

                       <div className="col-span-1 text-slate-400">계정 상태</div>
                       <div className="col-span-4">
                         <select className="w-full bg-[#111827] border border-[#334155] rounded p-1.5 text-emerald-400 outline-none font-medium">
                           <option>{mockUsers[0].status}</option>
                         </select>
                       </div>

                       <div className="col-span-1 text-slate-400">연락처</div>
                       <div className="col-span-4"><input type="text" value="010-1234-5678" readOnly className="w-full bg-[#111827] border border-[#334155] rounded p-1.5 text-slate-400 outline-none" /></div>

                       <div className="col-span-1 text-slate-400 mt-2">최근 로그인</div>
                       <div className="col-span-4 text-slate-400 mt-2">2024-05-21 09:15:22</div>
                    </div>

                    <div className="mt-2 text-xs">
                       <div className="text-slate-400 font-bold mb-3 border-b border-[#1f2937] pb-1">접근 가능 메뉴</div>
                       <div className="grid grid-cols-2 gap-y-2">
                          {['통합 대시보드', '설비 진단', '환경 진단', '작업자 안전', '알림/이벤트', '리포트', '설정'].map(menu => (
                             <div key={menu} className="flex items-center gap-2 text-slate-300">
                                <CheckSquare size={14} className="text-blue-500" /> {menu}
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="flex gap-2 mt-auto pt-4">
                       <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">저장</button>
                       <button className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium py-2 px-4 rounded-lg transition-colors">비활성화</button>
                    </div>
                 </div>
               </div>
             </div>

             {/* Change History */}
             <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col shrink-0">
               <div className="px-4 py-3 border-b border-[#1f2937] text-sm font-bold text-slate-300 bg-[#111827] flex justify-between items-center">
                  권한 변경 이력
                  <a href="#" className="text-xs text-slate-400 font-normal hover:text-slate-200">전체 이력 보기 →</a>
               </div>
               <div className="overflow-x-auto bg-[#0b1120]">
                  <table className="w-full text-left whitespace-nowrap text-xs">
                    <thead className="text-slate-500 border-b border-[#1f2937]">
                       <tr>
                          <th className="px-4 py-3 font-normal">변경 시간</th>
                          <th className="px-4 py-3 font-normal">사용자</th>
                          <th className="px-4 py-3 font-normal">변경 항목</th>
                          <th className="px-4 py-3 font-normal">변경 내용</th>
                          <th className="px-4 py-3 font-normal">처리자</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f2937]/50 text-slate-300">
                       {mockHistory.map(h => (
                         <tr key={h.id} className="hover:bg-[#1e293b]/30">
                           <td className="px-4 py-2.5 text-slate-400">{h.time}</td>
                           <td className="px-4 py-2.5 font-medium">{h.targetUser}</td>
                           <td className="px-4 py-2.5 text-slate-400">{h.item}</td>
                           <td className="px-4 py-2.5 text-slate-400">{h.beforeAfter}</td>
                           <td className="px-4 py-2.5 text-slate-500">{h.requestor}</td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
             </div>
             
          </div>
        )}

        {/* Equipment/Area Content */}
        {activeTab === '설비/구역 관리' && (
           <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
             <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col w-full lg:w-[30%] overflow-hidden">
               <div className="px-4 py-3 border-b border-[#1f2937] flex items-center justify-between text-sm font-bold text-slate-300 bg-[#111827]">
                  구역 구조도
                  <button className="text-blue-400 hover:text-blue-300 text-xs"><Plus size={14} /></button>
               </div>
               <div className="p-4 bg-[#0b1120] flex-1 overflow-y-auto text-sm text-slate-300 custom-scrollbar">
                  <div className="flex items-center gap-2 mb-2 font-bold"><Map size={16} className="text-slate-500" /> A-1 구역 (가스 취급)</div>
                  <div className="pl-6 flex items-center gap-2 mb-1.5 text-slate-400"><Square size={10} className="text-slate-600" /> 순환 펌프 #1</div>
                  <div className="pl-6 flex items-center gap-2 mb-1.5 text-slate-400"><Square size={10} className="text-slate-600" /> 순환 펌프 #2</div>
                  <div className="pl-6 flex items-center gap-2 mb-4 text-blue-400 font-medium"><Square size={10} className="text-blue-500" /> 압축기 #A</div>
                  
                  <div className="flex items-center gap-2 mb-2 font-bold"><Map size={16} className="text-slate-500" /> B-2 구역 (고전압)</div>
                  <div className="pl-6 flex items-center gap-2 mb-1.5 text-slate-400"><Square size={10} className="text-slate-600" /> 메인 변압기</div>
                  <div className="pl-6 flex items-center gap-2 mb-1.5 text-slate-400"><Square size={10} className="text-slate-600" /> 차단기 패널</div>
               </div>
             </div>
             
             <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col w-full lg:w-[70%] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#1f2937] flex items-center gap-2 text-sm font-bold text-slate-300 bg-[#111827]">
                  상세 정보 (압축기 #A)
                </div>
                <div className="p-6 bg-[#0b1120] flex-1 flex flex-col gap-6">
                   <div className="grid grid-cols-4 gap-4 items-center text-sm">
                      <div className="text-slate-400">설비 ID</div>
                      <div className="col-span-3"><input type="text" value="EQ-A-001" className="w-full bg-[#111827] border border-[#334155] rounded p-2 text-slate-300 outline-none" readOnly/></div>
                      
                      <div className="text-slate-400">설비명</div>
                      <div className="col-span-3"><input type="text" defaultValue="압축기 #A" className="w-full bg-[#111827] border border-[#334155] rounded p-2 text-slate-300 outline-none" /></div>

                      <div className="text-slate-400">소속 구역</div>
                      <div className="col-span-3">
                        <select className="w-full bg-[#111827] border border-[#334155] rounded p-2 text-slate-300 outline-none">
                           <option>A-1 구역</option>
                           <option>B-2 구역</option>
                        </select>
                      </div>

                      <div className="text-slate-400">상태</div>
                      <div className="col-span-3 text-emerald-400 font-medium">가동 중</div>

                      <div className="text-slate-400">점검 주기</div>
                      <div className="col-span-3 flex items-center gap-2">
                         <input type="number" defaultValue="30" className="w-24 bg-[#111827] border border-[#334155] rounded p-2 text-slate-300 outline-none" /> 일
                      </div>
                   </div>
                   <div className="mt-auto flex justify-end gap-2 border-t border-[#1f2937] pt-4">
                      <button className="px-5 py-2 text-sm font-medium text-slate-300 hover:bg-[#1e293b] rounded-lg border border-[#334155] transition-colors">취소</button>
                      <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">저장</button>
                   </div>
                </div>
             </div>
           </div>
        )}

        {/* Alert Criteria Content */}
        {activeTab === '알림 기준' && (
           <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col h-full overflow-hidden">
             <div className="px-4 py-3 border-b border-[#1f2937] text-sm font-bold text-slate-300 bg-[#111827]">
                센서별 임계치 설정
             </div>
             <div className="p-4 bg-[#0b1120] flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left whitespace-nowrap text-sm">
                   <thead className="text-slate-500 border-b border-[#1f2937]">
                     <tr>
                        <th className="pb-3 font-normal font-medium">센서 유형</th>
                        <th className="pb-3 font-normal font-medium">단위</th>
                        <th className="pb-3 font-normal font-medium text-center">정상 범위</th>
                        <th className="pb-3 font-normal font-medium text-center text-yellow-500">주의 임계치 (이상)</th>
                        <th className="pb-3 font-normal font-medium text-center text-red-500">위험 임계치 (이상)</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-[#1f2937]/50 text-slate-300">
                      {[
                        { type: '온도 (설비)', unit: '°C', normal: '< 60', warn: '60', danger: '80' },
                        { type: '진동 (설비)', unit: 'mm/s', normal: '< 4.5', warn: '4.5', danger: '7.1' },
                        { type: 'CO 가스 (환경)', unit: 'ppm', normal: '< 30', warn: '30', danger: '50' },
                        { type: 'H2S 가스 (환경)', unit: 'ppm', normal: '< 10', warn: '10', danger: '15' },
                        { type: '심박동 (작업자)', unit: 'bpm', normal: '< 110', warn: '110', danger: '130' }
                      ].map(s => (
                         <tr key={s.type} className="hover:bg-[#1e293b]/30">
                            <td className="py-3 pl-2 font-medium">{s.type}</td>
                            <td className="py-3 text-slate-500">{s.unit}</td>
                            <td className="py-3 text-center text-emerald-400">{s.normal}</td>
                            <td className="py-3 text-center">
                               <input type="number" defaultValue={s.warn} className="w-16 bg-[#111827] border border-yellow-500/30 text-center rounded p-1 text-slate-300 outline-none focus:border-yellow-500" />
                            </td>
                            <td className="py-3 text-center">
                               <input type="number" defaultValue={s.danger} className="w-16 bg-[#111827] border border-red-500/30 text-center rounded p-1 text-slate-300 outline-none focus:border-red-500" />
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
                <div className="mt-8 flex justify-end">
                   <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">임계치 일괄 저장</button>
                </div>
             </div>
           </div>
        )}

        {/* Data Integration */}
        {activeTab === '데이터 연동' && (
           <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col h-full overflow-hidden">
             <div className="px-4 py-3 border-b border-[#1f2937] flex justify-between items-center text-sm font-bold text-slate-300 bg-[#111827]">
                외부 시스템 및 디바이스 연동
                <button className="hidden text-xs bg-[#1e293b] py-1 px-3 border border-[#334155] rounded-md text-slate-300 hover:bg-[#334155] md:block transition-colors">새로운 연동 추가</button>
             </div>
             <div className="p-4 sm:p-6 bg-[#0b1120] flex-1 overflow-auto">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                   {[
                     { name: 'MES 생산관리 시스템', type: 'API 연동', status: '정상 연결됨', lastSync: '1분 전', icon: Share2 },
                     { name: 'ERP 자원관리 시스템', type: 'Database (JDBC)', status: '정상 연결됨', lastSync: '10분 전', icon: Search },
                     { name: 'LoRa 게이트웨이 #1', type: 'Edge Device (MQTT)', status: '연결 지연', lastSync: '3시간 전', icon: Map, err: true },
                     { name: '스마트 안전모 게이트웨이', type: 'Edge Device (TCP/IP)', status: '정상 연결됨', lastSync: '방금 전', icon: Users }
                   ].map(item => (
                      <div key={item.name} className="bg-[#111827] border border-[#1f2937] p-5 rounded-lg flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.err ? 'bg-yellow-500/10' : 'bg-emerald-500/10'}`}>
                               <item.icon size={24} className={item.err ? 'text-yellow-500' : 'text-emerald-500'} />
                            </div>
                            <div>
                               <div className="text-slate-200 font-bold mb-0.5">{item.name}</div>
                               <div className="text-xs text-slate-500">{item.type}</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className={`text-sm font-bold mb-0.5 flex items-center justify-end gap-1.5 ${item.err ? 'text-yellow-500' : 'text-emerald-500'}`}>
                               <div className={`w-2 h-2 rounded-full ${item.err ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                               {item.status}
                            </div>
                            <div className="text-xs text-slate-500">마지막 동기화: {item.lastSync}</div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           </div>
        )}

        {/* Display Settings */}
        {activeTab === '화면 설정' && (
           <div className="bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col h-full overflow-hidden">
             <div className="px-4 py-3 border-b border-[#1f2937] text-sm font-bold text-slate-300 bg-[#111827]">
                개인화 화면 설정
             </div>
             <div className="p-6 bg-[#0b1120] flex-1">
                <div className="max-w-2xl flex flex-col gap-8">
                   
                   <div className="flex flex-col gap-2">
                     <label className="text-slate-300 font-bold text-sm">대시보드 테마</label>
                     <div className="flex items-center gap-4">
                        <button className="flex-1 p-4 border-2 border-blue-500 bg-[#0b1120] rounded-lg text-slate-200 flex flex-col items-center gap-2">
                           <div className="w-full h-20 bg-[#111827] rounded-md border border-[#1f2937] flex items-center justify-center shadow-lg shadow-black/80">
                              <Square size={20} className="text-blue-500" />
                           </div>
                           <span className="text-sm font-medium">다크 모드 (기본)</span>
                        </button>
                        <button className="flex-1 p-4 border-2 border-[#334155] bg-white rounded-lg text-slate-800 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
                           <div className="w-full h-20 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center">
                              <Square size={20} className="text-slate-400" />
                           </div>
                           <span className="text-sm font-medium">라이트 모드 (준비중)</span>
                        </button>
                     </div>
                   </div>

                   <hr className="border-[#1f2937]"/>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="flex flex-col gap-2">
                         <label className="text-slate-300 font-bold text-sm">자동 새로고침 주기</label>
                         <select className="bg-[#111827] border border-[#334155] rounded-lg p-2 text-slate-300 outline-none w-full">
                           <option>10초</option>
                           <option selected>30초 (권장)</option>
                           <option>1분</option>
                           <option>수동 새로고침만</option>
                         </select>
                         <span className="text-xs text-slate-500">대시보드 KPI 및 리스트 데이터의 갱신 주기입니다.</span>
                      </div>

                      <div className="flex flex-col gap-2">
                         <label className="text-slate-300 font-bold text-sm">기본 페이지</label>
                         <select className="bg-[#111827] border border-[#334155] rounded-lg p-2 text-slate-300 outline-none w-full">
                           <option>홈</option>
                           <option selected>통합 대시보드</option>
                           <option>설비 진단</option>
                         </select>
                         <span className="text-xs text-slate-500">로그인 시 처음으로 표시될 페이지를 설정합니다.</span>
                      </div>
                   </div>

                   <div className="mt-8 flex justify-end">
                      <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">설정 저장</button>
                   </div>
                </div>
             </div>
           </div>
        )}

      </div>
    </div>
  );
}
