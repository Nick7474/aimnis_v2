import {
  Home,
  LayoutDashboard,
  Activity,
  Wind,
  ShieldCheck,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export default function Sidebar({ isOpen, toggleSidebar, currentPage, setCurrentPage }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isOpen || isHovered;

  const menuItems = [
    { name: '홈', icon: Home },
    { name: '통합 대시보드', icon: LayoutDashboard },
    { name: '설비 진단', icon: Activity },
    { name: '환경 진단', icon: Wind },
    { name: '작업자 안전', icon: ShieldCheck },
    { name: '알림/이벤트', icon: Bell },
    { name: '리포트', icon: FileText },
    { name: '설정', icon: Settings },
  ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex flex-col bg-[#111827] border-r border-[#1f2937] transition-all duration-300 relative shrink-0 z-50",
        isExpanded ? "w-[260px]" : "w-[72px]"
      )}
    >
      {/* Logo Area */}
      <div 
        className="h-[72px] flex items-center justify-center shrink-0 transition-all duration-300"
      >
        <div 
          className={cn(
            "overflow-hidden transition-[width] duration-300 ease-in-out",
            isExpanded ? "w-[158px]" : "w-[54px]"
          )}
        >
          <img 
              src="https://cdn.imweb.me/upload/S20220215d5bc0d1f16d2a/d3e5b407f8f08.png" 
              alt="Logo"
              className="h-[29px] w-[158px] max-w-none object-left object-cover block"
          />
        </div>
      </div>

      {/* Menu Area */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden space-y-2 px-3 custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentPage(item.name)}
            className={cn(
              "flex flex-row items-center rounded-xl whitespace-nowrap transition-colors w-full",
              isExpanded ? "px-4 py-3 gap-3" : "justify-center h-12",
              currentPage === item.name || (currentPage === '홈' && item.name === '통합 대시보드' && 0)
                ? "bg-[#2563eb] text-white"
                : "text-slate-400 hover:bg-[#1f2937] hover:text-slate-100"
            )}
            title={!isExpanded ? item.name : undefined}
          >
            <item.icon size={22} className="shrink-0" />
            {isExpanded && <span className="font-medium">{item.name}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1f2937] hover:text-slate-100 transition-colors"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          {isExpanded && <span className="text-sm">{isOpen ? '메뉴 접기' : '메뉴 고정'}</span>}
        </button>
      </div>

      {/* Footer */}
      {isExpanded && (
        <div className="px-4 py-4 text-xs text-slate-600 whitespace-nowrap">
          <p>© 2026 KOWEPO.</p>
          <p>All rights reserved.</p>
        </div>
      )}
    </aside>
  );
}
