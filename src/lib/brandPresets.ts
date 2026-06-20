export type LogoMode = "symbol" | "wordmark" | "combined";
export type BrandRadius = "sharp" | "soft" | "rounded";
export type BrandDensity = "compact" | "standard" | "spacious";
export type BrandMapTone = "deep" | "blueprint" | "satellite" | "mono";

export interface BrandSettings {
  tenantName: string;
  serviceName: string;
  productName: string;
  logoUrl: string | null;
  logoMode: LogoMode;
  logoSize: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  textStrongColor?: string;
  textColor?: string;
  textSoftColor?: string;
  textFaintColor?: string;
  sidebarColor?: string;
  fontFamily: string;
  radius: BrandRadius;
  density: BrandDensity;
  mapTone: BrandMapTone;
}

export interface BrandPreset extends BrandSettings {
  id: string;
  label: string;
  description: string;
}

export const DEFAULT_BRAND: BrandSettings = {
  tenantName: "AIMWID",
  serviceName: "통합 보안 모니터링 시스템",
  productName: "AIM GUARD",
  logoUrl: null,
  logoMode: "combined",
  logoSize: 32,
  primaryColor: "#2563EB",
  secondaryColor: "#00C8FF",
  accentColor: "#60A5FA",
  successColor: "#16A34A",
  warningColor: "#EA580C",
  dangerColor: "#DC2626",
  backgroundColor: "#070F24",
  surfaceColor: "#0C1733",
  borderColor: "#1E3A5F",
  fontFamily: "Noto Sans KR",
  radius: "soft",
  density: "standard",
  mapTone: "deep",
};

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: "aim-guard-default",
    label: "AIM GUARD Default",
    description: "기본 납품 데모용 다크 네이비 관제 톤",
    ...DEFAULT_BRAND,
  },
  {
    id: "posco-smart-safety",
    label: "POSCO Smart Safety",
    description: "제조 현장 안전 관제용 스틸 블루",
    tenantName: "POSCO Smart Factory",
    serviceName: "Smart Safety Command Center",
    productName: "Safety Guard",
    logoUrl: null,
    logoMode: "combined",
    logoSize: 32,
    primaryColor: "#0F766E",
    secondaryColor: "#38BDF8",
    accentColor: "#22D3EE",
    successColor: "#22C55E",
    warningColor: "#F59E0B",
    dangerColor: "#EF4444",
    backgroundColor: "#06161E",
    surfaceColor: "#0B2430",
    borderColor: "#1E4D5F",
    fontFamily: "Noto Sans KR",
    radius: "soft",
    density: "compact",
    mapTone: "blueprint",
  },
  {
    id: "samsung-digital-campus",
    label: "Samsung Digital Campus",
    description: "반도체/캠퍼스 관제용 딥 블루",
    tenantName: "Samsung Digital Campus",
    serviceName: "Integrated Security Operations",
    productName: "Campus Guard",
    logoUrl: null,
    logoMode: "combined",
    logoSize: 32,
    primaryColor: "#1428A0",
    secondaryColor: "#00A6FF",
    accentColor: "#7DD3FC",
    successColor: "#22C55E",
    warningColor: "#F59E0B",
    dangerColor: "#EF4444",
    backgroundColor: "#050B1D",
    surfaceColor: "#0A1633",
    borderColor: "#1F3A75",
    fontFamily: "Noto Sans KR",
    radius: "soft",
    density: "standard",
    mapTone: "deep",
  },
  {
    id: "hyundai-mobility-guard",
    label: "Hyundai Mobility Guard",
    description: "모빌리티/공장 관제용 네이비 시안",
    tenantName: "Hyundai Mobility",
    serviceName: "Mobility Safety Control",
    productName: "Mobility Guard",
    logoUrl: null,
    logoMode: "combined",
    logoSize: 32,
    primaryColor: "#002C5F",
    secondaryColor: "#00AAD2",
    accentColor: "#38BDF8",
    successColor: "#22C55E",
    warningColor: "#F97316",
    dangerColor: "#EF4444",
    backgroundColor: "#06111F",
    surfaceColor: "#0B1D33",
    borderColor: "#24415F",
    fontFamily: "Noto Sans KR",
    radius: "soft",
    density: "standard",
    mapTone: "blueprint",
  },
  {
    id: "kepco-energy-control",
    label: "KEPCO Energy Control",
    description: "화이트 기반 엔터프라이즈 관제 톤",
    tenantName: "KEPCO Energy",
    serviceName: "Clean Energy Control Center",
    productName: "Energy Guard",
    logoUrl: null,
    logoMode: "combined",
    logoSize: 32,
    primaryColor: "#0C8AE5",
    secondaryColor: "#38BDF8",
    accentColor: "#0C8AE5",
    successColor: "#22C55E",
    warningColor: "#F59E0B",
    dangerColor: "#EF4444",
    backgroundColor: "#F8F9FD",
    surfaceColor: "#FFFFFF",
    borderColor: "#E0E6F0",
    textStrongColor: "#1E2124",
    textColor: "#3A4552",
    textSoftColor: "#6D7882",
    sidebarColor: "#003481",
    fontFamily: "Noto Sans KR",
    radius: "soft",
    density: "spacious",
    mapTone: "mono",
  },
  {
    id: "twinx-industrial-gray",
    label: "TWIN-X Industrial Gray",
    description: "그레이 베이스에 오렌지 포인트를 둔 설비 관제 톤",
    tenantName: "Industrial Twin-X",
    serviceName: "Facility Event Control",
    productName: "Twin Guard",
    logoUrl: null,
    logoMode: "combined",
    logoSize: 32,
    primaryColor: "#F97316",
    secondaryColor: "#A3A3A3",
    accentColor: "#F59E0B",
    successColor: "#22C55E",
    warningColor: "#FB923C",
    dangerColor: "#EF4444",
    backgroundColor: "#2F3030",
    surfaceColor: "#3B3B3D",
    borderColor: "#55565A",
    fontFamily: "Noto Sans KR",
    radius: "sharp",
    density: "compact",
    mapTone: "mono",
  },
  {
    id: "public-neutral",
    label: "Public Institution Neutral",
    description: "공공기관 납품용 절제된 중립 톤",
    tenantName: "Public Institution",
    serviceName: "Integrated Safety Operations",
    productName: "Public Guard",
    logoUrl: null,
    logoMode: "combined",
    logoSize: 32,
    primaryColor: "#475569",
    secondaryColor: "#0EA5E9",
    accentColor: "#94A3B8",
    successColor: "#16A34A",
    warningColor: "#D97706",
    dangerColor: "#DC2626",
    backgroundColor: "#0A0F1A",
    surfaceColor: "#111827",
    borderColor: "#334155",
    fontFamily: "Noto Sans KR",
    radius: "soft",
    density: "spacious",
    mapTone: "mono",
  },
];

const RADIUS_VALUE: Record<BrandRadius, string> = {
  sharp: "4px",
  soft: "7px",
  rounded: "12px",
};

const DENSITY_SCALE: Record<BrandDensity, string> = {
  compact: "0.88",
  standard: "1",
  spacious: "1.12",
};

export function brandToCssVars(brand: BrandSettings): Record<string, string> {
  const lightSurface = isLightColor(brand.backgroundColor);
  const textDefaults = getBrandTextDefaults(brand);
  const textStrong = brand.textStrongColor ?? textDefaults.textStrongColor;
  const text = brand.textColor ?? textDefaults.textColor;
  const textSoft = brand.textSoftColor ?? textDefaults.textSoftColor;
  const textFaint = brand.textFaintColor ?? textDefaults.textFaintColor;
  return {
    "--guard-color-primary": brand.primaryColor,
    "--guard-color-secondary": brand.secondaryColor,
    "--guard-color-accent": brand.accentColor,
    "--guard-color-success": brand.successColor,
    "--guard-color-warning": brand.warningColor,
    "--guard-color-danger": brand.dangerColor,
    "--guard-color-bg": brand.backgroundColor,
    "--guard-color-surface": brand.surfaceColor,
    "--guard-color-surface-strong": lightSurface
      ? mixWithBlack(brand.surfaceColor, 0.05)
      : mixWithBlack(brand.surfaceColor, 0.22),
    "--guard-color-border": brand.borderColor,
    "--guard-color-muted": textSoft,
    "--guard-color-text-strong": textStrong,
    "--guard-color-text": text,
    "--guard-color-text-soft": textSoft,
    "--guard-color-text-faint": textFaint,
    "--guard-color-overlay": lightSurface
      ? "rgba(255,255,255,0.86)"
      : "rgba(7,15,36,0.84)",
    "--guard-color-elevated": lightSurface
      ? mixWithBlack(brand.surfaceColor, 0.03)
      : mixWithWhite(brand.surfaceColor, 0.04),
    "--guard-map-bg": lightSurface ? mixWithBlack(brand.backgroundColor, 0.04) : brand.backgroundColor,
    "--guard-map-filter": mapToneFilter(brand.mapTone, lightSurface),
    "--guard-font-family": brandFontStack(brand.fontFamily),
    "--guard-logo-size": `${brand.logoSize}px`,
    "--guard-radius": RADIUS_VALUE[brand.radius],
    "--guard-density": DENSITY_SCALE[brand.density],
  };
}

export function brandToAntToken(brand: BrandSettings) {
  const textDefaults = getBrandTextDefaults(brand);
  const textStrong = brand.textStrongColor ?? textDefaults.textStrongColor;
  const textSoft = brand.textSoftColor ?? textDefaults.textSoftColor;
  return {
    colorPrimary: brand.primaryColor,
    colorBgBase: brand.backgroundColor,
    colorBgContainer: brand.surfaceColor,
    colorBgElevated: mixWithWhite(brand.surfaceColor, 0.08),
    colorBorder: brand.borderColor,
    colorText: textStrong,
    colorTextSecondary: textSoft,
    borderRadius: Number.parseInt(RADIUS_VALUE[brand.radius], 10),
    fontFamily: brandFontStack(brand.fontFamily),
  };
}

export function getBrandTextDefaults(brand: Pick<BrandSettings, "backgroundColor">) {
  const lightSurface = isLightColor(brand.backgroundColor);
  return {
    textStrongColor: lightSurface ? "#111827" : "#E2E8F0",
    textColor: lightSurface ? "#334155" : "#CBD5E1",
    textSoftColor: lightSurface ? "#64748B" : "#94A3B8",
    textFaintColor: lightSurface ? "#94A3B8" : "#64748B",
  };
}

function brandFontStack(fontFamily: string) {
  const base = fontFamily.trim() || "Noto Sans KR";
  if (base.includes(",")) return base;
  return `${base}, var(--font), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif`;
}

function mapToneFilter(mapTone: BrandMapTone, lightSurface: boolean) {
  if (mapTone === "satellite") return "brightness(0.94) contrast(1.08) saturate(1.04)";
  if (mapTone === "mono") return lightSurface ? "brightness(1.02) contrast(0.96) saturate(0.68)" : "brightness(0.82) contrast(1.05) saturate(0.46)";
  if (mapTone === "blueprint") return "brightness(0.78) contrast(1.12) saturate(0.72) hue-rotate(150deg)";
  return "brightness(0.88) contrast(1.05)";
}

function mixWithWhite(hex: string, amount: number) {
  return mix(hex, "#ffffff", amount);
}

function mixWithBlack(hex: string, amount: number) {
  return mix(hex, "#000000", amount);
}

function mix(hexA: string, hexB: string, amount: number) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  if (!a || !b) return hexA;
  const ratio = Math.max(0, Math.min(1, amount));
  const next = a.map((channel, index) => Math.round(channel * (1 - ratio) + b[index] * ratio));
  return `#${next.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function parseHex(hex: string) {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(clean)) return null;
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}

function isLightColor(hex: string) {
  const rgb = parseHex(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.72;
}
