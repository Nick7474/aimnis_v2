import { Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showStatusBadges?: boolean;
  showTimestamp?: boolean;
  timestampLabel?: string;
  operatorName?: string;
  operatorRole?: string;
  logoUrl?: string | null;
  logoSize?: number;
  sidebarWidth?: number;
  brand?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    successColor: string;
    warningColor: string;
    dangerColor: string;
    backgroundColor: string;
    surfaceColor: string;
    borderColor: string;
    textStrongColor: string;
    textColor: string;
    textSoftColor: string;
  };
}

export default function Header({
  title = 'AIoT 복합 계측 모니터링',
  showStatusBadges = true,
  showTimestamp = true,
  timestampLabel = '2026.05.30 (토) 08:24:36',
  operatorName = '홍길동',
  operatorRole = '관리자',
  logoUrl,
  logoSize = 32,
  sidebarWidth = 220,
  brand,
}: HeaderProps) {
  const colors = brand ?? {
    primaryColor: '#2563EB',
    secondaryColor: '#00C8FF',
    accentColor: '#3B82F6',
    successColor: '#10B981',
    warningColor: '#EAB308',
    dangerColor: '#EF4444',
    backgroundColor: '#0b1120',
    surfaceColor: '#111827',
    borderColor: '#1f2937',
    textStrongColor: '#f8fafc',
    textColor: '#cbd5e1',
    textSoftColor: '#94a3b8',
  };

  const clampedLogoSize = Math.max(20, Math.min(44, logoSize ?? 32));
  const logoMaxWidth = Math.min(160, sidebarWidth - 24);
  const isAimLogo = typeof logoUrl === "string" && logoUrl.includes("Mornitering");

  return (
    <header
      className="flex h-14 shrink-0 items-center border-b"
      style={{ backgroundColor: colors.surfaceColor, borderColor: colors.borderColor }}
    >
      {/* Logo area — same width as sidebar, centered */}
      <div
        className="flex h-full shrink-0 items-center justify-center transition-all duration-300"
        style={{ width: sidebarWidth }}
      >
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo"
            className="block object-contain"
            style={isAimLogo
              ? { width: 160, height: "auto" }
              : { height: clampedLogoSize, maxWidth: logoMaxWidth }
            }
          />
        )}
      </div>

      {/* 1×18px divider */}
      <div className="shrink-0" style={{ width: 1, height: 18, backgroundColor: colors.borderColor }} />

      {/* Main content: Title + Badges | Right controls */}
      <div className="flex flex-1 items-center justify-between px-4">
        {/* Left: Title + Status Badges */}
        <div className="flex items-center gap-4">
          <h1
            className="hidden text-base font-bold tracking-wide sm:block"
            style={{ color: colors.textStrongColor }}
          >
            {title}
          </h1>

          {showStatusBadges && (
            <div
              className="hidden items-center gap-4 rounded-full border px-4 py-1.5 text-xs font-medium lg:flex"
              style={{ backgroundColor: colors.surfaceColor, borderColor: colors.borderColor }}
            >
              <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.primaryColor }} />
                <span>전체 설비 정상</span>
                <span className="ml-1 font-bold" style={{ color: colors.accentColor }}>128</span>
              </div>
              <div className="h-3 w-px" style={{ backgroundColor: colors.borderColor }} />
              <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.warningColor }} />
                <span>주의</span>
                <span className="ml-1 font-bold" style={{ color: colors.warningColor }}>6</span>
              </div>
              <div className="h-3 w-px" style={{ backgroundColor: colors.borderColor }} />
              <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.dangerColor }} />
                <span>위험</span>
                <span className="ml-1 font-bold" style={{ color: colors.dangerColor }}>2</span>
              </div>
              <div className="h-3 w-px" style={{ backgroundColor: colors.borderColor }} />
              <div className="flex items-center gap-1.5" style={{ color: colors.textColor }}>
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.secondaryColor }} />
                <span>알림</span>
                <span className="ml-1 font-bold" style={{ color: colors.secondaryColor }}>26</span>
              </div>
              <div className="h-3 w-px" style={{ backgroundColor: colors.borderColor }} />
              <div className="flex items-center gap-1.5" style={{ color: colors.successColor }}>
                <span>가동률</span>
                <span className="font-bold">89.4%</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Timestamp + Bell + User */}
        <div className="flex items-center gap-4">
          {showTimestamp && (
            <div className="hidden text-sm font-medium md:block" style={{ color: colors.textColor }}>
              {timestampLabel}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              className="relative rounded-full p-2 transition-colors"
              style={{ color: colors.textSoftColor }}
            >
              <Bell size={18} />
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border"
                style={{ backgroundColor: colors.dangerColor, borderColor: colors.backgroundColor }}
              />
            </button>
          </div>

          <div className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition-colors">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold"
              style={{ backgroundColor: colors.surfaceColor, borderColor: colors.borderColor, color: colors.textColor }}
            >
              {operatorName.slice(0, 1)}
            </div>
            <div className="hidden text-sm sm:block">
              <div className="font-medium" style={{ color: colors.textStrongColor }}>{operatorName}</div>
              <div className="text-xs" style={{ color: colors.textSoftColor }}>{operatorRole}</div>
            </div>
            <ChevronDown size={14} className="hidden sm:block" style={{ color: colors.textSoftColor }} />
          </div>
        </div>
      </div>
    </header>
  );
}
