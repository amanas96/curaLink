import { Router, type Request, type Response } from "express";

const router = Router();

let GoogleGenerativeAI: any = null;
let model: any = null;

async function initGemini() {
  if (!GoogleGenerativeAI) {
    const module = await import("@google/generative-ai");
    GoogleGenerativeAI = module.GoogleGenerativeAI;
  }
  if (!model && process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try multiple model names in order of preference
    const modelNames = [
      "gemini-pro", // Old stable version
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`🔍 Trying model: ${modelName}`);
        const testModel = genAI.getGenerativeModel({ model: modelName });
        // Test with a simple prompt
        await testModel.generateContent("test");
        model = testModel;
        console.log(`✅ Using model: ${modelName}`);
        break;
      } catch (error) {
        console.log(`❌ ${modelName} not available`);
      }
    }

    if (!model) {
      console.error("❌ No Gemini models available");
    }
  }
  return model;
}

router.post("/parse-condition", async (req: Request, res: Response) => {
  try {
    const geminiModel = await initGemini();

    if (!geminiModel) {
      return res.status(503).json({ message: "Gemini AI not configured" });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const prompt = `
      Extract the medical conditions and location from this text.
      Return *only* a valid JSON object in this exact format:
      { "conditions": ["condition1", "condition2"], "location": "city, country" }
      
      Text: "${text}"
    `;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    const jsonResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    res.status(200).json(JSON.parse(jsonResponse));
  } catch (error) {
    console.error("🔴 AI Parse Error:", error);
    res.status(500).json({
      message: "AI parsing failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/summarize", async (req: Request, res: Response) => {
  try {
    const geminiModel = await initGemini();

    if (!geminiModel) {
      console.log("⚠️ Gemini quota expired, using mock summary");
      return res.status(200).json({
        summary:
          "This clinical trial focuses on testing a new therapy. Participants with relevant conditions may benefit. Please consult your doctor before joining.",
      });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const prompt = `
      You are an expert medical summarizer for patients.
      Summarize the following clinical trial information in 3 simple bullet points.
      Focus on what the trial is for and who can participate.
      Use plain, easy-to-understand language.

      Text: "${text}"
    `;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({ summary: responseText });
  } catch (error) {
    console.error("🔴 AI Summary Error:", error);
    res.status(500).json({
      message: "AI summarization failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
