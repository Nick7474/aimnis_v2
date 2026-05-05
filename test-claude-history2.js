const req = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'claude-haiku',
    solution: 'guard',
    messages: [
      { role: 'user', content: 'KPI 카드 추가' },
      { role: 'assistant', content: '저는 Claude(Anthropic) 기반의 AIMNIS 에이전트입니다. KPI 카드를 생성하겠습니다.' },
      { role: 'user', content: '라인 차트 추가' }
    ]
  })
});
const text = await req.text();
console.log("CLAUDE HISTORY TEST 2:", text);
