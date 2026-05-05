const req = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'claude-haiku',
    solution: 'guard',
    messages: [
      { role: 'user', content: 'KPI 카드 추가' },
      { role: 'assistant', content: '' },
      { role: 'user', content: '라인 차트 추가' }
    ]
  })
});
const text = await req.text();
console.log("CLAUDE ERROR TEST:", text);
