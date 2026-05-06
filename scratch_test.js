import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are a helpful assistant.",
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Respond with a simple JSON object: {\"ok\": true}" }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 100,
      },
    });

    console.log("Success!");
    console.log(result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
