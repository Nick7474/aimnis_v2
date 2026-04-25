/**
 * SmartGridEngine
 *
 * AIM GUARD Monitor의 고정 레이아웃 상수를 기반으로
 * 추가 위젯의 최적 배치 좌표를 계산한다.
 *
 * Monitor 레이아웃:
 *   Header    : 44px (top)
 *   Sidebar   : 200px (left)
 *   Right panel: 300px (right) — alarm + floor-status
 *   Footer    : 24px (bottom)
 *
 * 위젯 주입 가능 영역 (Inject Zone):
 *   x : sidebar(200) + gap(12) ~ canvas_w - right(300) - gap(12)
 *   y : header(44) + gap(12) ~ canvas_h - footer(24) - gap(12)
 *
 * 배치 전략:
 *   - 가로 행(Row) 기반 패킹, 행이 다 차면 다음 행
 *   - 행은 위에서 아래로 쌓임 (상단 우선)
 *   - 기존 위젯과 겹치지 않도록 occupied zone 체크
 */

// ── Monitor 레이아웃 상수 ─────────────────────────────────────

const HEADER_H = 44;
const FOOTER_H = 24;
const SIDEBAR_W = 200;
const RIGHT_PANEL_W = 300;
const GAP = 12;
// 맵 상단 GIS 컨트롤(줌버튼 등) 공간 확보
const MAP_TOP_BUFFER = 52;

// ── 위젯 기본 크기 ────────────────────────────────────────────

export const WIDGET_SIZES: Record<string, { w: number; h: number }> = {
  kpi:           { w: 210, h: 130 },
  "chart-line":  { w: 310, h: 210 },
  "chart-bar":   { w: 310, h: 210 },
  "chart-donut": { w: 240, h: 220 },
  gauge:         { w: 190, h: 190 },
  "alert-panel": { w: 290, h: 230 },
  table:         { w: 340, h: 220 },
  map:           { w: 320, h: 240 },
};

export function getWidgetSize(type: string): { w: number; h: number } {
  return WIDGET_SIZES[type] ?? { w: 220, h: 150 };
}

// ── 배치 계산 ─────────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w + GAP &&
    a.x + a.w + GAP > b.x &&
    a.y < b.y + b.h + GAP &&
    a.y + a.h + GAP > b.y
  );
}

/**
 * 다음 위젯 배치 좌표 계산
 * @param canvasW  캔버스 전체 너비(px)
 * @param canvasH  캔버스 전체 높이(px)
 * @param existing 이미 배치된 위젯 목록
 * @param newType  추가할 위젯 타입
 */
export function computeNextPosition(
  canvasW: number,
  canvasH: number,
  existing: Rect[],
  newType: string
): { x: number; y: number } {
  const { w, h } = getWidgetSize(newType);

  const zoneX0 = SIDEBAR_W + GAP;
  const zoneX1 = canvasW - RIGHT_PANEL_W - GAP;
  // MAP_TOP_BUFFER: 맵 상단 GIS 줌/팬 컨트롤 영역 회피
  const zoneY0 = HEADER_H + MAP_TOP_BUFFER;
  const zoneY1 = canvasH - FOOTER_H - GAP;

  // 가로 행 스캔: y를 행 단위로 내려가며 빈 x 찾기
  let tryY = zoneY0;
  while (tryY + h <= zoneY1) {
    let tryX = zoneX0;
    while (tryX + w <= zoneX1) {
      const candidate: Rect = { x: tryX, y: tryY, w, h };
      const blocked = existing.some((e) => overlaps(candidate, e));
      if (!blocked) return { x: tryX, y: tryY };
      tryX += w + GAP;
    }
    tryY += h + GAP;
  }

  // 공간 부족 시 우하단에 쌓기 (fallback)
  return {
    x: zoneX0 + (existing.length % 3) * (w + GAP),
    y: HEADER_H + MAP_TOP_BUFFER + Math.floor(existing.length / 3) * (h + GAP),
  };
}
