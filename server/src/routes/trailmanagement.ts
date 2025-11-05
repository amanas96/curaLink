import express from "express";
import { PrismaClient } from "@prisma/client";
import { researcherAuthMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", researcherAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { nctId, title, description, status, phase, eligibility } = req.body;
    const ownerId = req.user?.userId;

    if (!nctId || !title || !description || !status || !phase || !eligibility) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if this NCT ID is already in use
    const existingTrial = await prisma.clinicalTrial.findUnique({
      where: { nctId },
    });
    if (existingTrial) {
      return res
        .status(409)
        .json({ message: "A trial with this NCT ID already exists" });
    }

    const newTrial = await prisma.clinicalTrial.create({
      data: {
        nctId,
        title,
        description,
        status,
        phase,
        eligibility,
        ownerId: ownerId!,
      },
    });

    res.status(201).json(newTrial);
  } catch (error) {
    console.error("Create trial error:", error);
    res.status(500).json({ message: "Failed to create trial" });
  }
});

// --- GET /api/trials-management ---
// Get all trials *owned* by the logged-in researcher
router.get("/", researcherAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const ownerId = req.user?.userId;

    const trials = await prisma.clinicalTrial.findMany({
      where: {
        ownerId: ownerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(trials);
  } catch (error) {
    console.error("Get owned trials error:", error);
    res.status(500).json({ message: "Failed to get trials" });
  }
});

// --- PUT /api/trials-management/:id ---
// Update a specific trial
router.put("/:id", researcherAuthMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { nctId, title, description, status, phase, eligibility } = req.body;
    const ownerId = req.user?.userId;

    // Find the trial first to ensure the logged-in user owns it
    const trial = await prisma.clinicalTrial.findUnique({
      where: { id },
    });

    if (!trial) {
      return res.status(404).json({ message: "Trial not found" });
    }

    if (trial.ownerId !== ownerId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this trial" });
    }

    // Now update it
    const updatedTrial = await prisma.clinicalTrial.update({
      where: { id },
      data: {
        nctId,
        title,
        description,
        status,
        phase,
        eligibility,
      },
    });

    res.status(200).json(updatedTrial);
  } catch (error) {
    console.error("Update trial error:", error);
    res.status(500).json({ message: "Failed to update trial" });
  }
});

// --- DELETE /api/trials-management/:id ---
// Delete a specific trial
router.delete(
  "/:id",
  researcherAuthMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId;

      // Find the trial to ensure ownership
      const trial = await prisma.clinicalTrial.findUnique({
        where: { id },
      });

      if (!trial) {
        return res.status(404).json({ message: "Trial not found" });
      }

      if (trial.ownerId !== ownerId) {
        return res
          .status(403)
          .json({ message: "Forbidden: You do not own this trial" });
      }

      // Now delete it
      await prisma.clinicalTrial.delete({
        where: { id },
      });

      res.status(204).send(); // 204 No Content is standard for delete
    } catch (error) {
      console.error("Delete trial error:", error);
      res.status(500).json({ message: "Failed to delete trial" });
    }
  }
);

export default router;
