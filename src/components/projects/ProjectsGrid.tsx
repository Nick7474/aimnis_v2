"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit2, Trash2, Copy, ExternalLink, Plus,
  Shield, AlertTriangle, CheckCircle2, Clock, X, Play
} from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { cn } from "@/lib/utils";

interface ProjectStats {
  alerts: number;
  uptime: string;
  sensors: number;
}

interface Project {
  id: string;
  name: string;
  solution: string;
  status: "active" | "draft";
  client: string;
  industry: string;
  updatedAt: string;
  description: string;
  harnessFile: string | null;
  tags: string[];
  stats: ProjectStats;
}

interface ProjectsGridProps {
  initialProjects: Project[];
}

const SOLUTION_COLORS: Record<string, string> = {
  guard: "#14b8a6",
  eco: "#22c55e",
};

export default function ProjectsGrid({ initialProjects }: ProjectsGridProps) {
  const router = useRouter();
  const { projects: publishedProjects, remove: removePublished } = useProjectStore();

  // 정적 JSON + 동적 store 병합 (store 프로젝트 우선 표시)
  const [staticProjects, setStaticProjects] = useState(initialProjects);
  const projects = [
    ...publishedProjects.map(p => ({ ...p, createdAt: p.publishedAt, thumbnail: null })),
    ...staticProjects,
  ] as Project[];

  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = (project: Project) => {
    setDeleteTarget(project);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    // store 프로젝트인지 static인지 구분해서 삭제
    if (publishedProjects.some(p => p.id === deleteTarget.id)) {
      removePublished(deleteTarget.id);
    } else {
      setStaticProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const handleCopyUrl = (project: Project) => {
    const url = `https://${project.solution}.aimnis.ai/${project.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">프로젝트</h1>
          <p className="mt-1 text-sm text-white/40">{projects.length}개 프로젝트</p>
        </div>
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition-all"
        >
          <Plus className="h-4 w-4" />
          새 프로젝트
        </button>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {projects.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              copiedId={copiedId}
              onEdit={() => router.push(`/editor?solution=${project.solution}&project=${project.id}`)}
              onDelete={() => handleDelete(project)}
              onCopyUrl={() => handleCopyUrl(project)}
              onOpen={() => router.push(`/${project.solution}?project=${project.id}`)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-sm p-6 mx-4"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">프로젝트 삭제</p>
                  <p className="text-xs text-white/40">이 작업은 되돌릴 수 없습니다</p>
                </div>
                <button onClick={() => setDeleteTarget(null)} className="ml-auto text-white/30 hover:text-white/60">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-5 text-sm text-white/60">
                <span className="font-medium text-white">{deleteTarget.name}</span>을 삭제하시겠습니까?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-lg bg-red-500/80 py-2 text-sm text-white hover:bg-red-500 transition-colors"
                >
                  삭제
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── 프로젝트 카드 ────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  index: number;
  copiedId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onCopyUrl: () => void;
  onOpen: () => void;
}

function ProjectCard({ project, index, copiedId, onEdit, onDelete, onCopyUrl, onOpen }: ProjectCardProps) {
  const color = SOLUTION_COLORS[project.solution] ?? "#7c3aed";
  const isActive = project.status === "active";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.06 }}
      className="group relative glass-card overflow-hidden"
    >
      {/* 상단 컬러 바 */}
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      <div className="p-5">
        {/* 헤더 */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color }}>
                AIM {project.solution.toUpperCase()}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug truncate" title={project.name}>
              {project.name}
            </h3>
            <p className="text-[11px] text-white/40 mt-0.5">{project.client} · {project.industry}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* 설명 */}
        <p className="mb-3 text-xs text-white/50 leading-relaxed line-clamp-2">{project.description}</p>

        {/* 태그 */}
        <div className="mb-4 flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30">
              {tag}
            </span>
          ))}
        </div>

        {/* KPI 통계 */}
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <Stat label="알람" value={String(project.stats.alerts)} alert={project.stats.alerts > 0} />
          <Stat label="가동률" value={project.stats.uptime} />
          <Stat label="센서" value={String(project.stats.sensors)} />
        </div>

        {/* 수정일 */}
        <p className="mb-3 text-[10px] text-white/25">
          <Clock className="inline h-3 w-3 mr-1 align-middle" />
          {project.updatedAt} 수정
        </p>

        {/* 호버 액션 버튼 */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-white/60 hover:text-white/90 hover:border-purple-500/30 transition-all"
          >
            <Edit2 className="h-3 w-3" /> 에디터 편집
          </button>
          <button
            onClick={onOpen}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600/80 to-cyan-600/80 py-1.5 text-xs text-white hover:from-teal-500 hover:to-cyan-500 transition-all"
          >
            <Play className="h-3 w-3" /> AIM GUARD 실행
          </button>
          <button
            onClick={onCopyUrl}
            className={cn(
              "flex items-center justify-center rounded-lg border px-2.5 py-1.5 text-xs transition-all",
              copiedId === project.id
                ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                : "border-white/10 bg-white/5 text-white/60 hover:text-white/90"
            )}
          >
            {copiedId === project.id ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/40 hover:border-red-500/30 hover:text-red-400 transition-all"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "flex-shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
      status === "active"
        ? "bg-emerald-500/15 text-emerald-400"
        : "bg-white/5 text-white/30"
    )}>
      {status === "active"
        ? <><CheckCircle2 className="h-2.5 w-2.5" /> 운영중</>
        : <><AlertTriangle className="h-2.5 w-2.5" /> 초안</>
      }
    </span>
  );
}

function Stat({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="text-center">
      <p className={cn("text-sm font-bold", alert ? "text-red-400" : "text-white")}>{value}</p>
      <p className="text-[9px] text-white/30 mt-0.5">{label}</p>
    </div>
  );
}
