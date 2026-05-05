import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const modelsToTest = [
  "claude-3-haiku-20240307",
  "claude-3-5-haiku-20241022",
  "claude-3-5-sonnet-20241022",
  "claude-3-sonnet-20240229",
  "claude-3-opus-20240229",
];

async function testModels() {
  for (const model of modelsToTest) {
    try {
      console.log(`Testing ${model}...`);
      await anthropic.messages.create({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hello' }]
      });
      console.log(`✅ ${model} works!`);
      break;
    } catch (e) {
      console.log(`❌ ${model} failed: ${e.status} ${e.error?.type || e.message}`);
    }
  }
}
testModels();
