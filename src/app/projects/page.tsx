import fs from "fs";
import path from "path";
import Navbar from "@/components/layout/Navbar";
import ProjectsGrid from "@/components/projects/ProjectsGrid";

function loadProjects() {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "src/data/projects.json"),
    "utf-8"
  );
  return JSON.parse(raw).projects;
}

export default function ProjectsPage() {
  const projects = loadProjects();

  return (
    <main className="relative min-h-screen bg-[#0a0a0f]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute -right-40 top-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>
      <Navbar />
      <div className="mx-auto max-w-[1280px] px-6 pt-24 pb-16">
        <ProjectsGrid initialProjects={projects} />
      </div>
    </main>
  );
}
