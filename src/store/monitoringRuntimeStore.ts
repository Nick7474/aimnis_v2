import { create } from "zustand";
import type { SolutionWidget } from "@/lib/solutionLoader";

type WidgetOptionValue = string | number | boolean;

export interface RuntimeWidgetInstance {
  instanceId: string;
  widgetId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  options: Record<string, WidgetOptionValue>;
}

interface MonitoringRuntimeState {
  items: RuntimeWidgetInstance[];
  widgetMeta: Record<string, SolutionWidget>;
  setRuntime: (items: RuntimeWidgetInstance[], widgetMeta: Record<string, SolutionWidget>) => void;
  clearRuntime: () => void;
}

export const useMonitoringRuntimeStore = create<MonitoringRuntimeState>((set) => ({
  items: [],
  widgetMeta: {},
  setRuntime: (items, widgetMeta) => set({ items, widgetMeta }),
  clearRuntime: () => set({ items: [], widgetMeta: {} }),
}));
