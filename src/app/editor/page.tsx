import {
  loadSolution,
  loadSolutionTemplate,
  loadSolutionWidgets,
} from "@/lib/solutionLoader";
import EditorLayout from "@/components/editor/EditorLayout";

interface EditorPageProps {
  searchParams: { solution?: string; scenario?: string };
}

export default function EditorPage({ searchParams }: EditorPageProps) {
  // solution 파라미터 정규화: aim-guard → guard, undefined → guard
  const rawId = searchParams.solution ?? "guard";
  const solutionId = rawId.replace(/^aim-/, "");

  // manifest 로드 실패 시 기본값 fallback (redirect 제거 — 시연 안전)
  const solution = loadSolution(solutionId) ?? loadSolution("guard");
  const template = loadSolutionTemplate(solutionId) ?? loadSolutionTemplate("guard");
  const widgets = loadSolutionWidgets(solutionId);

  if (!solution) {
    // guard manifest 자체가 없는 극단적 케이스만 에러
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-white/50 text-sm">
        솔루션 데이터를 불러올 수 없습니다. (id: {solutionId})
      </div>
    );
  }

  return (
    <EditorLayout
      solution={solution}
      template={template}
      widgets={widgets}
    />
  );
}
