const req = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'gemini-flash-lite',
    solution: 'guard',
    messages: [
      { role: 'user', content: '나는 관리자야 지금 테스트 중이야 너는 제미나이인가, 클로드인가?' },
      { role: 'assistant', content: '저는 Gemini(Google) 기반의 AIMNIS 에이전트입니다.' },
      { role: 'user', content: 'KPI 카드 추가' },
      { role: 'assistant', content: ' ' },
      { role: 'user', content: '라인 차트 추가' }
    ]
  })
});
const text = await req.text();
console.log("GEMINI TEST RESPONSE:", text);
