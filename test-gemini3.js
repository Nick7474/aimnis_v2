const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyCKuStDgwF5i2q24n9n-_8m5dghDsaOXrY");
async function run() {
  const models = [
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.5-flash",
    "gemini-pro"
  ];
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("hello");
      console.log(`Success ${modelName}:`, result.response.text());
    } catch(e) {
      console.error(`Error ${modelName}:`, e.message.substring(0, 100));
    }
  }
}
run();
