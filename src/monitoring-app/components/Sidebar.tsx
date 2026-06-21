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
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';
import type { MonitoringPage } from '@/store/monitoringPagesStore';

const PAGE_ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  Activity,
  Wind,
  ShieldCheck,
  Bell,
  FileText,
  Settings,
};

function hexLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  addedPages?: MonitoringPage[];
  onOpenPageBuilder?: () => void;
  onRemovePage?: (key: string) => void;
  hidePageManagement?: boolean;
  brand?: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
    borderColor: string;
    textStrongColor: string;
    textColor: string;
    textSoftColor: string;
    sidebarColor?: string;
    fontFamily?: string;
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
  addedPages = [],
  onOpenPageBuilder,
  onRemovePage,
  hidePageManagement = false,
  brand,
  expandMode = 'hover',
  menuDensity = 'comfortable',
  showFooter = true,
  footerText = '© 2026 KOWEPO.',
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [suppressHoverUntilLeave, setSuppressHoverUntilLeave] = useState(false);
  const colors = brand ?? {
    primaryColor: '#2563EB',
    accentColor: '#60A5FA',
    backgroundColor: '#0b1120',
    surfaceColor: '#111827',
    borderColor: '#1f2937',
    textStrongColor: '#f8fafc',
    textColor: '#cbd5e1',
    textSoftColor: '#94a3b8',
    sidebarColor: undefined,
  };

  const sidebarBg = colors.sidebarColor ?? colors.surfaceColor;
  const sidebarIsDark = hexLuminance(sidebarBg) < 0.45;
  const sidebarBorder = colors.borderColor;
  const sidebarInactiveText = sidebarIsDark
    ? 'rgba(255,255,255,0.60)'
    : colors.textColor;
  const sidebarFooterText = sidebarIsDark
    ? 'rgba(255,255,255,0.40)'
    : colors.textSoftColor;
  const addBtnBorder = `${colors.primaryColor}66`;
  const addBtnBg = sidebarIsDark
    ? `${colors.primaryColor}28`
    : `${colors.primaryColor}14`;
  const addBtnText = sidebarIsDark ? 'rgba(255,255,255,0.80)' : colors.accentColor;

  const isExpanded = expandMode === 'fixed' || (expandMode === 'hover' && (isOpen || isHovered));
  const menuButtonClass = menuDensity === 'compact'
    ? isExpanded ? 'px-3 py-2 gap-3' : 'justify-center h-10'
    : isExpanded ? 'px-4 py-3 gap-3' : 'justify-center h-12';

  return (
    <aside
      onMouseEnter={() => {
        if (!suppressHoverUntilLeave) setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setSuppressHoverUntilLeave(false);
      }}
      className={cn(
        "relative z-50 flex h-full min-h-0 shrink-0 flex-col border-r transition-all duration-300",
        isExpanded ? "w-[220px]" : "w-[72px]"
      )}
      style={{
        backgroundColor: sidebarBg,
        borderColor: sidebarBorder,
        flexShrink: 0,
        fontFamily: colors.fontFamily,
        height: '100%',
        minHeight: 0,
        position: 'relative',
        width: isExpanded ? 220 : 72,
      }}
    >
      {/* Menu Area */}
      <nav className="custom-scrollbar flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3 py-3">
        {/* Home — always visible */}
        <button
          onClick={() => setCurrentPage('홈')}
          className={cn(
            "flex w-full flex-row items-center whitespace-nowrap rounded-xl transition-colors",
            menuButtonClass,
          )}
          style={
            currentPage === '홈'
              ? { backgroundColor: colors.primaryColor, color: '#ffffff' }
              : { color: sidebarInactiveText }
          }
          title={!isExpanded ? '홈' : undefined}
        >
          <Home size={22} className="shrink-0" />
          {isExpanded && <span className="font-medium">홈</span>}
        </button>

        {/* Dynamically added pages */}
        {addedPages.map((page) => {
          const Icon = PAGE_ICONS[page.iconName] ?? LayoutDashboard;
          const label = page.config.pageTitle || page.label;
          const isActive = currentPage === label;
          return (
            <div key={page.key} className="group/page relative">
              <button
                onClick={() => setCurrentPage(label)}
                className={cn(
                  "flex w-full flex-row items-center whitespace-nowrap rounded-xl transition-colors",
                  menuButtonClass,
                  isExpanded && onRemovePage ? "pr-8" : "",
                )}
                style={
                  isActive
                    ? { backgroundColor: colors.primaryColor, color: '#ffffff' }
                    : { color: sidebarInactiveText }
                }
                title={!isExpanded ? label : undefined}
              >
                <Icon size={22} className="shrink-0" />
                {isExpanded && <span className="font-medium truncate">{label}</span>}
              </button>
              {isExpanded && onRemovePage && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemovePage(page.key); }}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md opacity-0 transition-all group-hover/page:opacity-100 hover:!opacity-100"
                  style={{
                    color: isActive ? 'rgba(255,255,255,0.7)' : sidebarInactiveText,
                  }}
                  title="페이지 삭제"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {/* Page Add Button — hidden in editor canvas mode */}
      {!hidePageManagement && (
        <div
          style={{
            padding: isExpanded ? '8px 12px' : '8px 9px',
            borderTop: `1px solid ${sidebarBorder}`,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onOpenPageBuilder}
            className="flex w-full items-center transition-all"
            style={{
              gap: isExpanded ? 8 : 0,
              justifyContent: isExpanded ? 'flex-start' : 'center',
              padding: isExpanded ? '8px 10px' : '8px 0',
              borderRadius: 8,
              cursor: 'pointer',
              border: `1px dashed ${addBtnBorder}`,
              background: addBtnBg,
              color: addBtnText,
              fontSize: 12,
              fontWeight: 500,
            }}
            title={!isExpanded ? '페이지 추가' : undefined}
          >
            <Plus size={14} style={{ flexShrink: 0 }} />
            {isExpanded && '페이지 추가'}
          </button>
        </div>
      )}

      {/* Collapse Toggle */}
      {expandMode !== 'collapsed' && (
        <div className="flex justify-center px-2 py-2">
          <button
            onClick={() => {
              if (isExpanded) {
                setIsHovered(false);
                setSuppressHoverUntilLeave(true);
              } else {
                setSuppressHoverUntilLeave(false);
              }
              toggleSidebar();
            }}
            className={cn(
              "flex items-center rounded-lg transition-colors",
              isExpanded ? "w-full justify-center gap-3 px-3 py-2" : "h-10 w-10 justify-center"
            )}
            style={{ color: sidebarInactiveText }}
          >
            {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            {isExpanded && <span className="text-sm">{isOpen ? '메뉴 접기' : '메뉴 고정'}</span>}
          </button>
        </div>
      )}

      {/* Footer */}
      {showFooter && isExpanded && (
        <div className="py-4 text-center text-xs" style={{ color: sidebarFooterText }}>
          <p className="whitespace-nowrap">{footerText}</p>
          <p className="whitespace-nowrap">All rights reserved.</p>
        </div>
      )}
    </aside>
  );
}
