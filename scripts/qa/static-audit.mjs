import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];
const requiredPackageFiles = [
  "manifest.json",
  "harness-schema.json",
  "templates/default.json",
  "widgets/index.json",
];
const requiredManifestFields = [
  "id",
  "name",
  "version",
  "description",
  "category",
  "icon",
  "color",
  "route",
  "status",
  "pricing",
  "features",
  "defaultTemplate",
  "widgetRegistry",
  "harnessSchema",
  "dataConnectors",
];

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    failures.push(`${relativePath}: JSON 파싱 실패 (${error.message})`);
    return null;
  }
}

const marketplace = readJson("src/data/marketplace.json");
const entries = marketplace?.solutions ?? [];
const ids = new Set();

for (const entry of entries) {
  if (ids.has(entry.id)) failures.push(`marketplace: 중복 솔루션 id ${entry.id}`);
  ids.add(entry.id);

  const solutionRoot = path.join("src", "solutions", entry.id);
  for (const relativeFile of requiredPackageFiles) {
    const candidate = path.join(solutionRoot, relativeFile);
    if (!fs.existsSync(path.join(root, candidate))) {
      failures.push(`${candidate}: 필수 패키지 파일 누락`);
    }
  }

  const manifest = readJson(path.join(solutionRoot, "manifest.json"));
  if (!manifest) continue;
  for (const field of requiredManifestFields) {
    if (!(field in manifest)) failures.push(`${entry.id}/manifest.json: ${field} 필드 누락`);
  }
  if (manifest.id !== entry.id) {
    failures.push(`${entry.id}/manifest.json: manifest id(${manifest.id})와 marketplace id 불일치`);
  }

  const registry = readJson(path.join(solutionRoot, "widgets/index.json"));
  if (registry && registry.solutionId !== entry.id) {
    failures.push(`${entry.id}/widgets/index.json: solutionId 불일치`);
  }
}

for (const route of ["", "home", "editor", "projects", "guard", "monitoring"]) {
  const routeFile = route
    ? path.join(root, "src", "app", route, "page.tsx")
    : path.join(root, "src", "app", "page.tsx");
  if (!fs.existsSync(routeFile)) failures.push(`/${route}: page.tsx 누락`);
}

const sourceFiles = [];
function collectSourceFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSourceFiles(absolute);
    else if (/\.tsx?$/.test(entry.name)) sourceFiles.push(absolute);
  }
}
collectSourceFiles(path.join(root, "src"));

const oversized = sourceFiles
  .map((file) => ({ file: path.relative(root, file), lines: fs.readFileSync(file, "utf8").split("\n").length }))
  .filter(({ lines }) => lines > 500)
  .sort((a, b) => b.lines - a.lines);
if (oversized.length) {
  warnings.push(`${oversized.length}개 파일이 500줄 초과: ${oversized.slice(0, 5).map(({ file, lines }) => `${file}(${lines})`).join(", ")}`);
}

console.log(`[QA] 솔루션 패키지 ${entries.length}개, TypeScript 파일 ${sourceFiles.length}개 검사`);
for (const warning of warnings) console.warn(`[QA][WARN] ${warning}`);
if (failures.length) {
  for (const failure of failures) console.error(`[QA][FAIL] ${failure}`);
  process.exit(1);
}
console.log("[QA][PASS] 정적 구조·스키마 검사 통과");
