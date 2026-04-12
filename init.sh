#!/bin/bash
# AIMNIS Demo v3 — 초기화 스크립트

echo "=== AIMNIS Demo v3 환경 확인 ==="
echo "[1] 디렉토리: $(pwd)"
echo "[2] Node.js: $(node --version 2>/dev/null || echo '미설치')"

if [ -d "node_modules" ]; then
  echo "[3] node_modules: 존재"
else
  echo "[3] node_modules: 없음 → npm install 실행 필요"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "[4] 개발 서버: 실행 중"
else
  echo "[4] 개발 서버: 중단 → npm run dev 필요"
fi

echo ""
echo "=== 솔루션 플러그인 상태 ==="
node -e "
const fs = require('fs');
try {
  const mp = JSON.parse(fs.readFileSync('src/data/marketplace.json','utf8'));
  mp.solutions.forEach(s => {
    const m = JSON.parse(fs.readFileSync('src/'+s.manifestPath,'utf8'));
    console.log('['+s.status+'] '+m.name+' ('+m.id+')');
  });
} catch(e) { console.log('marketplace.json 파싱 실패:', e.message); }
" 2>/dev/null || echo "Node.js 실행 필요"

echo ""
echo "=== 미완료 Feature ==="
node -e "
const fs = require('fs');
const f = JSON.parse(fs.readFileSync('feature_list.json','utf8'));
const p = f.filter(x=>!x.passes);
p.slice(0,5).forEach(x=>console.log('[P'+x.priority+'] '+x.id+': '+x.description));
console.log('\n총 미완료: '+p.length+'/'+f.length);
" 2>/dev/null || echo "feature_list.json 직접 확인 필요"

echo ""
echo "=== 최근 진행 ==="
tail -5 claude-progress.txt 2>/dev/null
git log --oneline -3 2>/dev/null

echo ""
echo "준비 완료. 위 미완료 항목 중 최저 priority 하나부터 시작하세요."
