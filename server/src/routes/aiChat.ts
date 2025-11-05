import express from "express";
import { geminiModelPromise } from "../utils/gemini";

const router = express.Router();

type Message = {
  sender: "user" | "ai";
  text: string;
};

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body as {
      message: string;
      history: Message[];
    };

    console.log("📩 Received message:", message);
    console.log("📜 History:", history);

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    console.log("⏳ Waiting for Gemini model...");
    const geminiModel = await geminiModelPromise;
    console.log("✅ Got Gemini model");

    const prompt = `
      You are CuraLink AI, a helpful assistant on the landing page.
      A user is asking a question. Keep your answer concise (2-3 sentences).
      
      Here is the chat history so far:
      ${(history || []).map((msg: Message) => `${msg.sender === "user" ? "User" : "AI"}: ${msg.text}`).join("\n")}
      
      New User Message: ${message}
      AI:
    `;

    console.log("🤖 Generating response...");
    const result = await geminiModel.generateContent(prompt);
    const reply = result.response.text();
    console.log("✅ Generated reply:", reply);

    res.status(200).json({ reply });
  } catch (error) {
    console.error("🔴 AI Chat error:", error);
    // Log more details
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
