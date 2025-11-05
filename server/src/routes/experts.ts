import express from "express";
import { PrismaClient } from "@prisma/client";
// --- Use the new patientAuthMiddleware ---
import { patientAuthMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// --- GET /api/experts ---
// This is a copy of the collaborators logic, but for patients
router.get("/", patientAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;

    let whereClause = {};

    if (q && typeof q === "string") {
      whereClause = {
        OR: [
          { researcherProfile: { specialties: { has: q } } },
          { researcherProfile: { researchInterests: { has: q } } },
        ],
      };
    }

    // Find all users who are 'RESEARCHER'
    const experts = await prisma.user.findMany({
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

    res.status(200).json(experts);
  } catch (error) {
    console.error("Get experts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
