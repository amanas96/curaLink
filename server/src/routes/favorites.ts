import express from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import type { AuthRequest } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// --- POST /api/favorites ---
// Saves a trial (or expert, etc.) as a favorite
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { entityId, entityType, title, summary, url } = req.body;

    if (!entityId || !entityType || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if it's already a favorite
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        entityId: entityId,
      },
    });

    if (existingFavorite) {
      return res.status(409).json({ message: "Already in favorites" });
    }

    // Create the new favorite
    const newFavorite = await prisma.favorite.create({
      data: {
        userId: userId!,
        entityId,
        entityType,
        title,
        summary: summary || null,
        url: url || null,
      },
    });

    res.status(201).json(newFavorite);
  } catch (error) {
    console.error("Save favorite error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- GET /api/favorites ---
// Gets all of a user's favorites
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc", // Show the most recent first
      },
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
