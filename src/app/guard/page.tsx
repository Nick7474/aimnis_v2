import fs from "fs";
import path from "path";
import GuardDashboard from "@/components/guard/GuardDashboard";

function loadGuardData() {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "src/data/aimguard.json"),
    "utf-8"
  );
  return JSON.parse(raw);
}

export default function GuardPage() {
  const data = loadGuardData();
  return <GuardDashboard data={data} />;
}
