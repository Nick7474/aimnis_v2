const req = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'gemini-flash-lite',
    solution: 'guard',
    messages: [{ role: 'user', content: 'KPI 카드 추가' }]
  })
});
const reader = req.body.getReader();
const decoder = new TextDecoder();
let full = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  full += decoder.decode(value);
}
console.log("GEMINI RESPONSE:");
console.log(full);

const req2 = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'claude-haiku',
    solution: 'guard',
    messages: [{ role: 'user', content: 'KPI 카드 추가' }]
  })
});
const reader2 = req2.body.getReader();
const decoder2 = new TextDecoder();
let full2 = '';
while (true) {
  const { done, value } = await reader2.read();
  if (done) break;
  full2 += decoder2.decode(value);
}
console.log("\nCLAUDE RESPONSE:");
console.log(full2);
