import express from "express";
import { geminiModelPromise } from "../utils/gemini.js"; // ✅ ensure .js extension if using ESM

const router = express.Router();

type Message = {
  sender: "user" | "ai";
  text: string;
};

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body as {
      message: string;
      history?: Message[];
    };

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    console.log("📩 Incoming AI Chat Message:", message);

    // Wait for Gemini model
    const geminiModel = await geminiModelPromise.catch((err) => {
      console.error("❌ Failed to load Gemini model:", err);
      return null;
    });

    // ✅ Graceful fallback if model not available (quota issue or error)
    if (!geminiModel) {
      console.log("⚠️ Gemini unavailable — using fallback response");
      return res.status(200).json({
        reply:
          "Hi there! 👋 I'm CuraLink AI. Currently, I'm experiencing high load, but you can still explore our platform to find health experts and ongoing clinical trials!",
      });
    }

    // Build the prompt dynamically
    const chatHistory =
      (history || [])
        .map((msg) => `${msg.sender === "user" ? "User" : "AI"}: ${msg.text}`)
        .join("\n") || "No previous messages.";

    const prompt = `
You are **CuraLink AI**, a friendly assistant helping users learn about clinical trials, research, and health experts.
Keep your tone warm, concise, and empathetic. Answer in 2-3 sentences max.

Conversation so far:
${chatHistory}

New User Message: "${message}"
CuraLink AI:
`;

    console.log("🤖 Generating AI reply...");

    // Use timeout to avoid hanging forever
    const result = await Promise.race([
      geminiModel.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Gemini response too slow")),
          10000
        )
      ),
    ]);

    const reply = (result as any)?.response?.text?.() || "";

    if (!reply.trim()) {
      console.warn("⚠️ Empty AI reply, using fallback");
      return res.status(200).json({
        reply:
          "I'm here to help! Could you please rephrase your question or ask about a specific trial or expert?",
      });
    }

    console.log("✅ AI Reply Generated:", reply);
    res.status(200).json({ reply });
  } catch (error: any) {
    console.error("🔴 AI Chat Error:", error.message || error);
    res.status(200).json({
      reply:
        "I'm having some trouble connecting right now. Please try again shortly.",
    });
  }
});

export default router;
