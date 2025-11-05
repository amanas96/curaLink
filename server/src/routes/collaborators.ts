// src/routes/collaborators.ts

import express from "express";
import { PrismaClient } from "@prisma/client";
// We'll use the researcher-only middleware
import { researcherAuthMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// --- GET /api/collaborators ---
// Fetches all researchers, with an optional search query
router.get("/", researcherAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get the search query from the URL (e.g., /api/collaborators?q=oncology)
    const { q } = req.query;

    let whereClause = {};

    if (q && typeof q === "string") {
      // Build a search query to check against specialties OR research interests
      whereClause = {
        OR: [
          {
            researcherProfile: {
              specialties: {
                has: q, // 'has' works for array fields
              },
            },
          },
          {
            researcherProfile: {
              researchInterests: {
                has: q,
              },
            },
          },
        ],
      };
    }

    // 1. Find all users who are 'RESEARCHER'
    // 2. Apply the search filter (if it exists)
    // 3. Include their profile
    // 4. Select *only* the data we want to send to the client
    const researchers = await prisma.user.findMany({
      where: {
        role: "RESEARCHER",
        ...whereClause,
      },

      select: {
        id: true,
        email: true,
        researcherProfile: {
          select: {
            specialties: true,
            researchInterests: true,
            availableForMeeting: true,
          },
        },
      },
    });

    res.status(200).json(researchers);
  } catch (error) {
    console.error("Get collaborators error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
