// src/routes/ai.ts
import { Router, type Request, type Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

let model: any = null;
let modelInitialized = false;
let modelError: string | null = null;

// Initialize model once at startup
async function initGemini() {
  // Return cached model if already initialized
  if (modelInitialized) return model;

  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found in environment");
      modelError = "API key not configured";
      modelInitialized = true;
      return null;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelNames = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-pro",
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`🔍 Trying model: ${modelName}`);
        const testModel = genAI.getGenerativeModel({ model: modelName });

        // Test with a minimal prompt
        await testModel.generateContent("test");

        model = testModel;
        modelInitialized = true;
        console.log(`✅ Using model: ${modelName}`);
        return model;
      } catch (err: any) {
        console.log(
          `❌ ${modelName} not available: ${err.message || err.status}`
        );
      }
    }

    console.error("❌ No Gemini models available");
    modelError = "No models available";
    modelInitialized = true;
    return null;
  } catch (error: any) {
    console.error("❌ Failed to initialize Gemini:", error);
    modelError = error.message || "Initialization failed";
    modelInitialized = true;
    return null;
  }
}

// Initialize on module load
initGemini().catch((err) => console.error("Startup init error:", err));

/* ---------------------- PARSE CONDITION ---------------------- */
router.post("/parse-condition", async (req: Request, res: Response) => {
  console.log("📩 Parse condition request received:", req.body);

  try {
    const { text } = req.body;

    if (!text) {
      console.log("❌ No text provided");
      return res.status(400).json({ message: "Text is required" });
    }

    console.log("📝 Text to parse:", text);

    // Try to get the model
    const geminiModel = await initGemini();

    // If no model available, return mock data immediately
    if (!geminiModel) {
      console.log("⚠️ Gemini unavailable — using mock condition data");
      return res.status(200).json({
        conditions: ["General Health Condition"],
        location: "Not specified",
      });
    }

    const prompt = `
      Extract the medical conditions and location from this text.
      Return *only* a valid JSON object in this exact format:
      { "conditions": ["condition1", "condition2"], "location": "city, country" }

      Text: "${text}"
    `;

    console.log("🤖 Calling Gemini API...");

    // Try generating AI response with timeout
    let aiResponseText = "";
    try {
      const result = await Promise.race([
        geminiModel.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 10000)
        ),
      ]);

      aiResponseText = (result as any).response.text();
      console.log("✅ Gemini response:", aiResponseText);
    } catch (apiError: any) {
      console.log("⚠️ Gemini API failed:", apiError.message);
      return res.status(200).json({
        conditions: ["Unknown Condition"],
        location: "Unknown Location",
      });
    }

    // Try parsing AI JSON safely
    try {
      const cleanText = aiResponseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleanText);
      console.log("✅ Parsed successfully:", parsed);
      return res.status(200).json(parsed);
    } catch (parseError) {
      console.log("⚠️ Invalid AI response, using fallback");
      return res.status(200).json({
        conditions: ["General Health Condition"],
        location: "Not specified",
      });
    }
  } catch (error: any) {
    console.error("🔴 AI Parse Error:", error);
    console.error("Error stack:", error.stack);

    // Always return 200 with fallback data
    return res.status(200).json({
      conditions: ["Fallback Condition"],
      location: "Fallback City",
    });
  }
});

/* ---------------------- SUMMARIZE ---------------------- */
router.post("/summarize", async (req: Request, res: Response) => {
  console.log("📩 Summarize request received");

  try {
    const { text } = req.body;

    if (!text) {
      console.log("❌ No text provided");
      return res.status(400).json({ message: "Text is required" });
    }

    const geminiModel = await initGemini();

    if (!geminiModel) {
      console.log("⚠️ Gemini quota expired, using mock summary");
      return res.status(200).json({
        summary:
          "This clinical trial focuses on testing a new therapy. Participants with relevant conditions may benefit. Please consult your doctor before joining.",
      });
    }

    const prompt = `
      You are an expert medical summarizer for patients.
      Summarize the following clinical trial information in 3 simple bullet points.
      Focus on what the trial is for and who can participate.
      Use plain, easy-to-understand language.

      Text: "${text}"
    `;

    console.log("🤖 Calling Gemini for summary...");

    let aiSummary = "";
    try {
      const result = await Promise.race([
        geminiModel.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 10000)
        ),
      ]);

      aiSummary = (result as any).response.text();
      console.log("✅ Summary generated");
    } catch (error: any) {
      console.log("⚠️ Gemini summary failed:", error.message);
      aiSummary =
        "This trial investigates a new therapy. Eligible patients may benefit under medical supervision.";
    }

    return res.status(200).json({ summary: aiSummary });
  } catch (error: any) {
    console.error("🔴 AI Summary Error:", error);
    console.error("Error stack:", error.stack);

    return res.status(200).json({
      summary:
        "This clinical trial aims to test new treatments for patients under safe conditions.",
    });
  }
});

export default router;
