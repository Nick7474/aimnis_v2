import { spawnSync } from 'child_process';
import { renameSync, readFileSync, writeFileSync, existsSync } from 'fs';

try {
  if (existsSync('src/components/Dashboard.tsx')) {
    renameSync('src/components/Dashboard.tsx', 'src/pages/IntegratedDashboard.tsx');
  }
  if (existsSync('src/components/SummaryCards.tsx')) {
    renameSync('src/components/SummaryCards.tsx', 'src/components/IntegratedSummaryCards.tsx');
  }

  console.log('Restoring from git...');
  const out = spawnSync('git', ['checkout', 'HEAD', '--', 'src/components/Dashboard.tsx', 'src/components/SummaryCards.tsx'], { encoding: 'utf-8' });
  console.log(out.stdout, out.stderr);

  if (existsSync('src/pages/IntegratedDashboard.tsx')) {
    let idFile = readFileSync('src/pages/IntegratedDashboard.tsx', 'utf-8');
    idFile = idFile.replace(/from '\.\//g, "from '../components/");
    idFile = idFile.replace("import SummaryCards from '../components/SummaryCards';", "import IntegratedSummaryCards from '../components/IntegratedSummaryCards';");
    idFile = idFile.replace(/<SummaryCards/g, "<IntegratedSummaryCards");
    writeFileSync('src/pages/IntegratedDashboard.tsx', idFile);
  }
  console.log('Script completed!');
} catch(e) {
  console.error(e);
}
