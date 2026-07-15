import { expect, test } from "@playwright/test";
import { resolveMonitoringGrid, type MonitoringGridItem } from "@/lib/monitoringLayoutEngine";

function item(id: string, x: number, y: number, w: number, h: number): MonitoringGridItem {
  return { id, source: "custom", x, y, w, h };
}

test.describe("AIM Monitoring layout compaction", () => {
  test("pulls lower widgets into an empty vertical slot after removal", () => {
    const resolved = resolveMonitoringGrid(
      [
        item("top", 0, 0, 4, 3),
        item("bottom", 0, 8, 4, 3),
      ],
      { columns: 12, mode: "compact" }
    );

    expect(resolved.find((entry) => entry.id === "top")?.y).toBe(0);
    expect(resolved.find((entry) => entry.id === "bottom")?.y).toBe(3);
  });

  test("keeps the dropped widget anchored while compacting surrounding widgets", () => {
    const resolved = resolveMonitoringGrid(
      [
        item("moved", 4, 8, 4, 3),
        item("below", 0, 8, 4, 3),
      ],
      { columns: 12, mode: "compact", priorityId: "moved" }
    );

    expect(resolved.find((entry) => entry.id === "moved")?.y).toBe(8);
    expect(resolved.find((entry) => entry.id === "below")?.y).toBe(0);
  });

  test("push mode preserves drag-time collision behavior", () => {
    const resolved = resolveMonitoringGrid(
      [
        item("anchor", 0, 0, 4, 3),
        item("colliding", 0, 0, 4, 3),
      ],
      { columns: 12, mode: "push", priorityId: "anchor" }
    );

    expect(resolved.find((entry) => entry.id === "anchor")?.y).toBe(0);
    expect(resolved.find((entry) => entry.id === "colliding")?.y).toBe(3);
  });
});
