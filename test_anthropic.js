const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function main() {
  const messages = [
    { role: 'user', content: '최근 7일간의 에너지 사용량 추이를 보여주는 라인 차트를 추가해줘.' }
  ];

  const system = `당신은 AIMNIS 에이전트입니다. 
- [절대 규칙] 위젯 생성, 차트 추가 등 시각적인 패널을 요구하는 요청에는 무슨 일이 있어도 대답 마지막에 "__WIDGET_JSON__" 구분자를 적고, 그 아래에 지정된 JSON 구조를 출력해야 합니다.
- [초강력 경고] 가장 마지막(최신) 메시지에서 요청한 "새로운 위젯"만 출력하세요!! 이전 대화 기록에서 사용자가 요청했던 위젯들은 이미 시스템에 완벽하게 렌더링되었으니, 절대로 다시 배열에 포함시키지 마세요. 중복 생성하면 심각한 에러가 발생합니다.

[위젯 생성 요청 시 출력 형식]
질문하거나 되묻지 말고, 곧바로 아래 형식에 맞춰 위젯을 생성하세요. 여러 개의 위젯을 한 번에 생성하려면 배열에 담아 응답하세요.
__WIDGET_JSON__
{"action":"add_widgets","widgets":[{"widgetId":"w-001","type":"kpi","title":"위젯제목","data":{"value":"수치","unit":"단위","trend":"증감","trendUp":true,"color":"#hex"}}]}
`;

  const resp = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: system,
    messages: messages,
  });

  console.log(resp.content[0].text);
}
main();
