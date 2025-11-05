// src/routes/patient.ts
import express from "express";
import { PrismaClient } from "@prisma/client";

import { authMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// --- GET /api/patient/me ---
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/me/profile", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { conditions, location } = req.body;
    const userId = req.user?.userId;

    if (!conditions || !location) {
      return res
        .status(400)
        .json({ message: "Conditions and location are required" });
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!patientProfile) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const updatedProfile = await prisma.patientProfile.update({
      where: { id: patientProfile.id },
      data: {
        conditions: Array.isArray(conditions) ? conditions : [conditions],
        location,
      },
    });

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
