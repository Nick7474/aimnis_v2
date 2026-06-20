import { Search, Sun, Moon, Bell, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Header() {
  return (
    <header className="h-16 shrink-0 bg-[#0b1120] border-b border-[#1f2937] flex items-center justify-between px-4 md:px-6">
      {/* Title & Status Badges */}
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold text-white tracking-wide hidden sm:block">
          AIoT 복합 계측 모니터링
        </h1>
        
        <div className="hidden lg:flex items-center bg-[#111827] border border-[#1f2937] rounded-full px-4 py-1.5 text-xs font-medium gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>전체 설비 정상</span>
            <span className="text-blue-400 font-bold ml-1">128</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>주의</span>
            <span className="text-yellow-400 font-bold ml-1">6</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>위험</span>
            <span className="text-red-400 font-bold ml-1">2</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            <span>알림</span>
            <span className="text-cyan-400 font-bold ml-1">26</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span>가동률</span>
            <span className="font-bold">89.4%</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-slate-300 hidden md:block">
          2026.05.30 (토) 08:24:36
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:bg-[#1f2937] rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0b1120]"></span>
          </button>
        </div>

        <div className="flex items-center gap-2 cursor-pointer hover:bg-[#1f2937] p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300 border border-slate-600">
            홍
          </div>
          <div className="hidden sm:block text-sm">
            <div className="font-medium text-slate-200">홍길동</div>
            <div className="text-xs text-slate-500">관리자</div>
          </div>
          <ChevronDown size={16} className="text-slate-500 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
