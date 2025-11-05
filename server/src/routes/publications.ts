import express from "express";
import axios from "axios";
import { authMiddleware } from "../middleware/auth.js"; // Base auth, for both roles
import type { AuthRequest } from "../middleware/auth.js";
import { geminiModelPromise } from "../utils/gemini.js"; // For AI summaries
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient(); // For caching, just like trials

// Helper function to add delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// PubMed API base URL
const PUBMED_API_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";

// Helper to retry AI calls
async function summarizeWithRetry(
  model: any,
  prompt: string,
  retries = 3
): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
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

// --- GET /api/publications ---
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query; // The search term, e.g., "glioma"

    if (!q || typeof q !== "string") {
      return res
        .status(400)
        .json({ message: 'A search query "q" is required.' });
    }

    // 1. Search PubMed for publication IDs (PMIDs)
    const searchUrl = `${PUBMED_API_URL}esearch.fcgi?db=pubmed&term=${encodeURIComponent(
      q
    )}&retmax=10&sort=relevance&retmode=json`;

    const searchResponse = await axios.get(searchUrl);
    const pmids = searchResponse.data.esearchresult?.idlist;

    if (!pmids || pmids.length === 0) {
      return res.status(200).json([]); // Return empty if no results
    }

    // 2. Get summaries for those PMIDs
    const summaryUrl = `${PUBMED_API_URL}esummary.fcgi?db=pubmed&id=${pmids.join(
      ","
    )}&retmode=json`;

    const summaryResponse = await axios.get(summaryUrl);
    const results = summaryResponse.data.result;

    // Get the AI model
    const geminiModel = await geminiModelPromise;
    const summarizedPublications = [];

    // 3. Summarize each publication
    for (const pmid of pmids) {
      const pub = results[pmid];
      if (!pub) continue;

      const title = pub.title || "No title available";
      const pmidStr = pub.uid || pmid;
      const pubUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmidStr}/`;

      // We will use the title as the text-to-summarize for speed.
      // Summarizing full abstracts would be very slow and expensive.
      // For the hackathon, summarizing the *title* is a clever shortcut.
      const textToSummarize = title;

      let aiSummary: string;

      // Check cache first (we can reuse the TrialSummary model!)
      const cached = await prisma.trialSummary.findUnique({
        where: { nctId: pmidStr }, // Using nctId field to store pmid
      });

      if (cached) {
        console.log(`✅ Using cached summary for PubMed ID ${pmidStr}`);
        aiSummary = cached.aiSummary;
      } else {
        console.log(`🤖 Generating new summary for PubMed ID ${pmidStr}`);
        const prompt = `You are a medical expert. Explain what this research paper is about in one simple sentence for a patient: "${textToSummarize}"`;
        aiSummary = await summarizeWithRetry(geminiModel, prompt);

        // Save to cache
        await prisma.trialSummary.create({
          data: {
            nctId: pmidStr, // Storing PMID in nctId field
            aiSummary: aiSummary,
          },
        });

        await delay(1000); // Avoid rate limits
      }

      summarizedPublications.push({
        id: pmidStr,
        title: title,
        authors:
          pub.authors?.map((a: { name: string }) => a.name).join(", ") || "N/A",
        journal: pub.fulljournalname || "N/A",
        pubDate: pub.pubdate || "N/A",
        url: pubUrl,
        aiSummary: aiSummary,
      });
    }

    res.status(200).json(summarizedPublications);
  } catch (error) {
    console.error("🔴 Publication search error:", error);
    res.status(500).json({ message: "Failed to fetch publications" });
  }
});

export default router;
