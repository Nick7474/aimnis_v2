import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BrandSettings, BrandPreset } from "@/lib/brandPresets";
import type { SectionStyleKey, SectionStyleOverrides } from "@/store/editorStore";

export interface PublishedProject {
  id: string;
  name: string;
  solution: string;         // "guard" | "monitoring" | "eco"
  status: "active" | "draft";
  client: string;
  description: string;
  version: string;          // "v1.0", "v1.1" 등
  versionNote: string;
  publishedAt: string;      // ISO 날짜
  updatedAt: string;
  tags: string[];
  stats: { alerts: number; uptime: string; sensors: number };
  harnessFile: string | null;
  industry: string;
  // 브랜드 스냅샷 — publish 시점의 에디터 설정 보존
  brandSnapshot?: Partial<BrandSettings & BrandPreset>;
  sectionStylesSnapshot?: Partial<Record<SectionStyleKey, SectionStyleOverrides>>;
  systemTitle?: string;
  monitoringSnapshot?: unknown;
}

interface ProjectState {
  projects: PublishedProject[];
  publish: (p: Omit<PublishedProject, "id" | "publishedAt" | "updatedAt" | "version">) => PublishedProject;
  remove: (id: string) => void;
}

function nextVersion(existing: PublishedProject[], solution: string): string {
  const same = existing.filter(p => p.solution === solution);
  if (same.length === 0) return "v1.0";
  const nums = same.map(p => parseFloat(p.version.replace("v", "")) || 0);
  return `v${(Math.max(...nums) + 0.1).toFixed(1)}`;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],

      publish: (data) => {
        const version = nextVersion(get().projects, data.solution);
        const now = new Date().toISOString().split("T")[0];
        const project: PublishedProject = {
          ...data,
          id: `proj-${Date.now()}`,
          version,
          publishedAt: now,
          updatedAt: now,
        };
        set(s => ({ projects: [project, ...s.projects] }));
        return project;
      },

      remove: (id) =>
        set(s => ({ projects: s.projects.filter(p => p.id !== id) })),
    }),
    { name: "aimnis-projects" }
  )
);
