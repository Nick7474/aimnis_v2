/**
 * 솔루션 로더 유틸리티 (서버 사이드 전용)
 * marketplace.json 기반으로 동적 솔루션 로딩 — 하드코딩 없음
 * Next.js App Router Server Components / API Routes에서 사용
 */

import fs from "fs";
import path from "path";

// ─── 타입 정의 ───────────────────────────────────────────────

export interface SolutionPricing {
  monthly: number;
  currency: string;
}

export interface SolutionManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  route: string;
  status: "available" | "coming-soon" | "deprecated";
  pricing: SolutionPricing;
  features: string[];
  defaultTemplate: string;
  widgetRegistry: string;
  harnessSchema: string;
  dataConnectors: string[];
}

export interface MarketplaceEntry {
  id: string;
  manifestPath: string;
  status: "available" | "coming-soon";
  order: number;
}

export interface Marketplace {
  version: string;
  description: string;
  solutions: MarketplaceEntry[];
}

export interface AnalysisStep {
  step: number;
  label: string;
  duration: number;
}

export interface HarnessSchema {
  solution: string;
  version: string;
  analysisSteps: AnalysisStep[];
}

export interface SolutionWidget {
  id: string;
  name: string;
  type: string;
  description: string;
  defaultSize: { w: number; h: number };
  dataSource?: string;
}

export interface SolutionWidgetRegistry {
  version: string;
  solutionId: string;
  widgets: SolutionWidget[];
}

export interface TemplateNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface TemplateEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface SolutionTemplate {
  solution: string;
  templateId: string;
  name: string;
  description: string;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

// ─── 내부 헬퍼 ───────────────────────────────────────────────

const SRC_ROOT = path.join(process.cwd(), "src");

function readJson<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function getMarketplace(): Marketplace | null {
  return readJson<Marketplace>(path.join(SRC_ROOT, "data", "marketplace.json"));
}

// ─── 공개 로더 함수 ──────────────────────────────────────────

/**
 * marketplace.json에서 전체 솔루션 매니페스트 목록 반환
 */
export function loadAllSolutions(): SolutionManifest[] {
  const marketplace = getMarketplace();
  if (!marketplace) return [];

  return marketplace.solutions
    .map((entry) =>
      readJson<SolutionManifest>(
        path.join(SRC_ROOT, "solutions", entry.id, "manifest.json")
      )
    )
    .filter(Boolean) as SolutionManifest[];
}

/**
 * 특정 솔루션의 manifest 반환
 */
export function loadSolution(id: string): SolutionManifest | null {
  return readJson<SolutionManifest>(
    path.join(SRC_ROOT, "solutions", id, "manifest.json")
  );
}

/**
 * 특정 솔루션의 위젯 목록 반환
 */
export function loadSolutionWidgets(id: string): SolutionWidget[] {
  const registry = readJson<SolutionWidgetRegistry>(
    path.join(SRC_ROOT, "solutions", id, "widgets", "index.json")
  );
  return registry?.widgets ?? [];
}

/**
 * 특정 솔루션의 기본 레이아웃 템플릿 반환
 */
export function loadSolutionTemplate(id: string): SolutionTemplate | null {
  return readJson<SolutionTemplate>(
    path.join(SRC_ROOT, "solutions", id, "templates", "default.json")
  );
}

/**
 * 특정 솔루션의 harness schema 반환
 */
export function loadHarnessSchema(id: string): HarnessSchema | null {
  return readJson<HarnessSchema>(
    path.join(SRC_ROOT, "solutions", id, "harness-schema.json")
  );
}

/**
 * marketplace에 등록된 솔루션 ID 목록만 반환 (경량)
 */
export function getSolutionIds(): string[] {
  const marketplace = getMarketplace();
  return marketplace?.solutions.map((s) => s.id) ?? [];
}
