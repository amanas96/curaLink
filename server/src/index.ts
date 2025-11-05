import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import aiRoutes from "./routes/ai.js";
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patient.js";
import trialsRoutes from "./routes/trials.js";
import favoritesRoutes from "./routes/favorites.js";
import researcherRoutes from "./routes/researcher.js";
import collaboratorsRoutes from "./routes/collaborators.js";
import trailManagementRoutes from "./routes/trailmanagement.js";
import aiChatRoutes from "./routes/aiChat.js";
import experts from "./routes/experts.js";
import publicationsRoutes from "./routes/publications.js";

// --- 1. Initialization ---
const app: Express = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

// --- 2. Middleware ---

app.use(
  cors({
    origin: [
      "http://localhost:3000", // local frontend
      "https://cura-link-lovat.vercel.app", // main Vercel domain
      /\.vercel\.app$/, // ✅ allows all preview deployments like cura-link-git-main-...
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
//app.options("*", cors());
app.use(express.json());

// --- 3. A simple test route ---
app.get("/", (req: Request, res: Response) => {
  res.send("CuraLink API is running! 🚀");
});

// --- 4. API Routes (We will build these next) ---
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/trials", trialsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/researcher", researcherRoutes);
app.use("/api/collaborators", collaboratorsRoutes);
app.use("/api/trials-management", trailManagementRoutes);
app.use("/api/ai/chat", aiChatRoutes);
app.use("/api/experts", experts);
app.use("/api/publications", publicationsRoutes);

// --- 5. Start the server ---
app.listen(PORT, () => {
  console.log(`🔥 Server is running on http://localhost:${PORT}`);
});
