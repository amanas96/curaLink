import express from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

import { authMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";
// --- 1. CHANGE THIS IMPORT ---
// Import the promise, not the old function
import { geminiModelPromise } from "../utils/gemini.js";

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to add delay between AI calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retry with exponential backoff
async function summarizeWithRetry(
  model: any, // This will be the resolved model
  prompt: string,
  retries = 3
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      // This line (25) will now work because 'model' is the correct object
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      if (error.status === 429 && i < retries - 1) {
        const waitTime = Math.pow(2, i + 1) * 1000;
        console.log(
          `⏳ Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`
        );
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

// --- GET /api/trials ---
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    // 1. Get the logged-in patient's profile
    const userId = req.user?.userId;
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId },
      select: { conditions: true },
    });

    if (!patientProfile || patientProfile.conditions.length === 0) {
      return res
        .status(400)
        .json({ message: "Profile setup incomplete. Please add conditions." });
    }

    // 2. Search ClinicalTrials.gov API
    const mainCondition = patientProfile.conditions[0];

    const trialsApiUrl = `https://clinicaltrials.gov/api/v2/studies?query.cond=${encodeURIComponent(
      mainCondition
    )}&filter.overallStatus=RECRUITING&pageSize=10`; // Using 10 for full cache demo

    const apiResponse = await axios.get(trialsApiUrl);
    const studies = apiResponse.data.studies || [];

    // --- 3. THIS IS THE FIX ---
    // Await the promise *once* before the loop starts
    const geminiModel = await geminiModelPromise;
    // -------------------------

    // 4. Summarize each trial with caching
    const summarizedTrials = [];

    for (let i = 0; i < studies.length; i++) {
      const study = studies[i];
      const trial = study.protocolSection;

      const nctId = trial.identificationModule.nctId;
      const description =
        trial.descriptionModule?.briefSummary || "No summary available.";

      let aiSummary: string;

      try {
        // 🔥 CHECK CACHE FIRST 🔥
        const cached = await prisma.trialSummary.findUnique({
          where: { nctId: nctId },
        });

        if (cached) {
          console.log(`✅ Using cached summary for ${nctId}`);
          aiSummary = cached.aiSummary;
        } else {
          console.log(`🤖 Generating new summary for ${nctId}`);
          // Call AI with retry logic
          const prompt = `Summarize this clinical trial in 3 simple bullet points: "${description}"`;

          // Now this passes the resolved model
          aiSummary = await summarizeWithRetry(geminiModel, prompt);

          // 🔥 SAVE TO CACHE 🔥
          await prisma.trialSummary.create({
            data: {
              nctId: nctId,
              aiSummary: aiSummary,
            },
          });

          // Add delay only when making actual AI calls
          if (i < studies.length - 1) {
            await delay(1500);
          }
        }

        summarizedTrials.push({
          nctId: nctId,
          title: trial.identificationModule.briefTitle,
          status: trial.statusModule.overallStatus,
          location:
            trial.contactsLocationsModule?.locations?.[0]?.city || "N/A",
          url: `https://clinicaltrials.gov/study/${nctId}`,
          summary: description,
          aiSummary: aiSummary,
        });
      } catch (error) {
        console.error(`⚠️ Failed to summarize trial ${nctId}:`, error);
        // Add trial without AI summary if everything fails
        summarizedTrials.push({
          nctId: nctId,
          title: trial.identificationModule.briefTitle,
          status: trial.statusModule.overallStatus,
          location:
            trial.contactsLocationsModule?.locations?.[0]?.city || "N/A",
          url: `https://clinicaltrials.gov/study/${nctId}`,
          summary: description,
          aiSummary: "Summary unavailable. Please try again later.",
        });
      }
    }

    // 5. Send the personalized & summarized data
    res.status(200).json(summarizedTrials);
  } catch (error) {
    console.error("🔴 Trial Search Error:", error);
    res.status(500).json({
      message: "Failed to fetch clinical trials",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
