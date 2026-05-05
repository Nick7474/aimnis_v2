const req = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'claude-haiku',
    solution: 'guard',
    messages: [
      { role: 'user', content: 'KPI 카드 추가' },
      { role: 'assistant', content: '저는 Claude(Anthropic) 기반의 AIMNIS 에이전트입니다. KPI 카드를 생성하겠습니다.\n__WIDGET_JSON__\n{"action":"add_widget","widget":{"widgetId":"w-001","type":"kpi","title":"제목","data":{"value":"99","unit":"%","trend":"+1%","trendUp":true,"color":"#14b8a6"}}}' },
      { role: 'user', content: '라인 차트 추가' }
    ]
  })
});
const text = await req.text();
console.log("CLAUDE HISTORY TEST 4:", text);
