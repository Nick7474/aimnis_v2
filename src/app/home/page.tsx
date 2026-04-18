import Navbar from "@/components/layout/Navbar";
import HomePhase2 from "@/components/home/HomePhase2";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Aurora 배경 */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-600/12 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-violet-600/8 blur-[80px]" />
      </div>

      <Navbar />
      <HomePhase2 />
    </main>
  );
}
