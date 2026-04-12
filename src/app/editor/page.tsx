import { redirect } from "next/navigation";
import {
  loadSolution,
  loadSolutionTemplate,
  loadSolutionWidgets,
} from "@/lib/solutionLoader";
import EditorLayout from "@/components/editor/EditorLayout";

interface EditorPageProps {
  searchParams: { solution?: string };
}

export default function EditorPage({ searchParams }: EditorPageProps) {
  const solutionId = searchParams.solution ?? "guard";
  const solution = loadSolution(solutionId);

  // 잘못된 솔루션 ID → 홈으로
  if (!solution || solution.status !== "available") {
    redirect("/home");
  }

  const template = loadSolutionTemplate(solutionId);
  const widgets = loadSolutionWidgets(solutionId);

  return (
    <EditorLayout
      solution={solution}
      template={template}
      widgets={widgets}
    />
  );
}
