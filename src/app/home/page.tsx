import Navbar from "@/components/layout/Navbar";
import HomeWorkspace from "@/components/home/HomeWorkspace";
import { loadAllSolutions, loadHarnessSchema } from "@/lib/solutionLoader";

export default function HomePage() {
  const solutions = loadAllSolutions();
  const analysisStepsMap = Object.fromEntries(
    solutions.map((s) => [s.id, loadHarnessSchema(s.id)?.analysisSteps ?? []])
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Aurora 배경 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/3 h-[600px] w-[600px] rounded-full bg-violet-600/8 blur-[140px]" />
        <div className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-purple-600/6 blur-[100px]" />
      </div>

      <Navbar />
      <HomeWorkspace solutions={solutions} analysisStepsMap={analysisStepsMap} />
    </main>
  );
}
