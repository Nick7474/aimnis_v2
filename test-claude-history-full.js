const req = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'claude-haiku',
    solution: 'guard',
    messages: [
      { role: 'user', content: '나는 관리자야 지금 테스트 중이야 너는 제미나이인가, 클로드인가?' },
      { role: 'assistant', content: '안녕하세요. 저는 Claude(Anthropic) 기반의 AIMNIS 에이전트입니다. 현재 guard 솔루션에서 맵 기반 모니터링을 지원하고 있습니다.' },
      { role: 'user', content: 'KPI 카드 추가' },
      { role: 'assistant', content: '저는 Claude(Anthropic) 기반의 AIMNIS 에이전트입니다. KPI 카드를 생성하겠습니다.\n__WIDGET_JSON__\n{"action":"add_widget","widget":{"widgetId":"w-123","type":"kpi","title":"총 전력","data":{"value":"99"}}}' },
      { role: 'user', content: '라인 차트 추가' }
    ]
  })
});
const text = await req.text();
console.log("CLAUDE HISTORY FULL TEST:", text);
