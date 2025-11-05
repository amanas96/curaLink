// import { GoogleGenerativeAI } from "@google/generative-ai";

// let geminiModel: any = null;

// export function getGeminiModel() {
//   if (!geminiModel) {
//     if (!process.env.GEMINI_API_KEY) {
//       throw new Error("GEMINI_API_KEY not configured");
//     }
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//     // Use the model that works with your API key
//     geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
//   }
//   return geminiModel;
// }

// export default getGeminiModel;

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.error(" Missing GEMINI_API_KEY in .env file. Shutting down.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function getModel() {
  const modelNames = [
    "gemini-1.5-flash",
    "gemini-pro",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro",
  ];

  for (const name of modelNames) {
    console.log(` [Gemini] Trying model: ${name}`);
    try {
      const model = genAI.getGenerativeModel({ model: name });
      await model.generateContent("test");
      console.log(` [Gemini] Using model: ${name}`);
      return model;
    } catch (e: any) {
      console.log(` [Gemini] ${name} not available: ${e.status}`);
    }
  }

  // If all models fail, throw an error
  throw new Error(
    "No available Gemini models found. Please check your API key and quota."
  );
}

export const geminiModelPromise = getModel();

export const getGeminiModel = getModel;
export default getModel;
