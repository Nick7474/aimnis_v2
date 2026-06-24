export type MonitoringLayoutMode = "push" | "compact";

export interface MonitoringGridItem {
  id: string;
  source: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ResolveMonitoringGridOptions {
  columns: number;
  mode?: MonitoringLayoutMode;
  priorityId?: string | null;
  sourceOrder?: Record<string, number>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function monitoringGridItemsIntersect(
  a: Pick<MonitoringGridItem, "x" | "y" | "w" | "h">,
  b: Pick<MonitoringGridItem, "x" | "y" | "w" | "h">
) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function normalizeItem<T extends MonitoringGridItem>(item: T, columns: number): T {
  const w = clamp(Math.max(1, item.w), 1, columns);
  return {
    ...item,
    x: clamp(item.x, 0, columns - w),
    y: Math.max(0, item.y),
    w,
    h: Math.max(1, item.h),
  };
}

function sortByCanvasOrder<T extends MonitoringGridItem>(
  a: T,
  b: T,
  sourceOrder: Record<string, number> = {}
) {
  if (a.y !== b.y) return a.y - b.y;
  if (a.x !== b.x) return a.x - b.x;
  if (a.source !== b.source) {
    const aRank = sourceOrder[a.source] ?? Number.MAX_SAFE_INTEGER;
    const bRank = sourceOrder[b.source] ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.source.localeCompare(b.source);
  }
  return a.id.localeCompare(b.id);
}

export function resolveMonitoringGrid<T extends MonitoringGridItem>(
  items: T[],
  options: ResolveMonitoringGridOptions
) {
  const { columns, mode = "push", priorityId = null, sourceOrder = {} } = options;
  const normalized = items.map((item) => normalizeItem(item, columns));
  const priorityItem = priorityId ? normalized.find((item) => item.id === priorityId) ?? null : null;
  const sorted = normalized
    .filter((item) => item.id !== priorityId)
    .sort((a, b) => sortByCanvasOrder(a, b, sourceOrder));
  const placed: T[] = [];

  if (priorityItem) {
    placed.push(priorityItem);
  }

  sorted.forEach((item) => {
    const next = { ...item };

    if (mode === "compact") {
      while (placed.some((placedItem) => monitoringGridItemsIntersect(next, placedItem))) {
        next.y += 1;
      }
      while (
        next.y > 0 &&
        !placed.some((placedItem) => monitoringGridItemsIntersect({ ...next, y: next.y - 1 }, placedItem))
      ) {
        next.y -= 1;
      }
    } else {
      while (placed.some((placedItem) => monitoringGridItemsIntersect(next, placedItem))) {
        next.y += 1;
      }
    }

    placed.push(next);
  });

  return placed.sort((a, b) => sortByCanvasOrder(a, b, sourceOrder));
}
