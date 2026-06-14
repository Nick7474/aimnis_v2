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
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  brand?: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    borderColor: string;
    textStrongColor: string;
    textColor: string;
    textSoftColor: string;
  };
  expandMode?: 'hover' | 'fixed' | 'collapsed';
  menuDensity?: 'comfortable' | 'compact';
  showFooter?: boolean;
  footerText?: string;
}

export default function Sidebar({
  isOpen,
  toggleSidebar,
  currentPage,
  setCurrentPage,
  brand,
  expandMode = 'hover',
  menuDensity = 'comfortable',
  showFooter = true,
  footerText = '© 2026 KOWEPO.',
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = brand ?? {
    primaryColor: '#2563EB',
    accentColor: '#60A5FA',
    backgroundColor: '#0b1120',
    surfaceColor: '#111827',
    borderColor: '#1f2937',
    textStrongColor: '#f8fafc',
    textColor: '#cbd5e1',
    textSoftColor: '#94a3b8',
  };
  const isExpanded = expandMode === 'fixed' || (expandMode === 'hover' && (isOpen || isHovered));
  const menuButtonClass = menuDensity === 'compact'
    ? isExpanded ? 'px-3 py-2 gap-3' : 'justify-center h-10'
    : isExpanded ? 'px-4 py-3 gap-3' : 'justify-center h-12';

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
        "relative z-50 flex h-full min-h-0 shrink-0 flex-col border-r transition-all duration-300",
        isExpanded ? "w-[220px]" : "w-[72px]"
      )}
      style={{
        backgroundColor: colors.surfaceColor,
        borderColor: colors.borderColor,
        flexShrink: 0,
        height: '100%',
        minHeight: 0,
        position: 'relative',
        width: isExpanded ? 220 : 72,
      }}
    >
      {/* Menu Area — starts from top (logo moved to header) */}
      <nav className="custom-scrollbar flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3 py-3">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentPage(item.name)}
            className={cn(
              "flex w-full flex-row items-center whitespace-nowrap rounded-xl transition-colors",
              menuButtonClass,
            )}
            style={
              currentPage === item.name
                ? { backgroundColor: colors.primaryColor, color: '#ffffff' }
                : { color: colors.textSoftColor }
            }
            title={!isExpanded ? item.name : undefined}
          >
            <item.icon size={22} className="shrink-0" />
            {isExpanded && <span className="font-medium">{item.name}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      {expandMode !== 'collapsed' && (
        <div className="p-2">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors"
            style={{ color: colors.textSoftColor }}
          >
            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            {isExpanded && <span className="text-sm">{isOpen ? '메뉴 접기' : '메뉴 고정'}</span>}
          </button>
        </div>
      )}

      {/* Footer */}
      {showFooter && isExpanded && (
        <div className="whitespace-nowrap px-4 py-4 text-xs" style={{ color: colors.textSoftColor }}>
          <p>{footerText}</p>
          <p>All rights reserved.</p>
        </div>
      )}
    </aside>
  );
}
