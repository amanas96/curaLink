// src/routes/researcher.ts

import express from "express";
import { PrismaClient } from "@prisma/client";
// Import our new researcher-only middleware
import { researcherAuthMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// --- GET /api/researcher/me ---
// (Optional, but good to have)
router.get("/me", researcherAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        researcherProfile: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: "Researcher profile not found" });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- PUT /api/researcher/me/profile ---
// This is the main endpoint for updating their profile
router.put(
  "/me/profile",
  researcherAuthMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { specialties, researchInterests, availableForMeeting } = req.body;
      const userId = req.user?.userId;

      // Validate input (can be more detailed)
      if (!specialties || !researchInterests) {
        return res
          .status(400)
          .json({ message: "Specialties and research interests are required" });
      }

      // Find the researcher's profile ID
      const researcherProfile = await prisma.researcherProfile.findUnique({
        where: { userId: userId },
        select: { id: true },
      });

      if (!researcherProfile) {
        return res
          .status(404)
          .json({ message: "Researcher profile not found" });
      }

      // Update the profile
      const updatedProfile = await prisma.researcherProfile.update({
        where: { id: researcherProfile.id },
        data: {
          specialties: Array.isArray(specialties) ? specialties : [specialties],
          researchInterests: Array.isArray(researchInterests)
            ? researchInterests
            : [researchInterests],
          availableForMeeting: availableForMeeting === true, // Ensure it's a boolean
        },
      });

      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Update researcher profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
