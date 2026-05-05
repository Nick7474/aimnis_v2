const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyCKuStDgwF5i2q24n9n-_8m5dghDsaOXrY");
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("hello");
    console.log("Success:", result.response.text());
  } catch(e) {
    console.error("Error 1.5-flash:", e.message);
  }
}
run();
