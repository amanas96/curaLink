import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient, UserRole } from "@prisma/client";
import crypto from "crypto";
import { sendEmail } from "../utils/mail.js";

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    /// Validate Input
    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //  Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    /// create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role === "RESEARCHER" ? UserRole.RESEARCHER : UserRole.PATIENT,
      },
    });
    if (user.role === UserRole.PATIENT) {
      await prisma.patientProfile.create({
        data: { userId: user.id },
      });
    } else if (user.role === UserRole.RESEARCHER) {
      await prisma.researcherProfile.create({
        data: { userId: user.id },
      });
    }
    //// token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });
    // Response
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// src/routes/auth.ts
// ... (imports and /register route are above this) ...

// --- POST /api/auth/login ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // 3. Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // 4. Create a JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // 5. Send the response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// src/routes/auth.ts

// --- POST /api/auth/forgot-password ---
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Security: Don't reveal if an email exists.
      // Send a 200 OK response in both cases.
      return res
        .status(200)
        .json({
          message:
            "If an account with this email exists, a reset link has been sent.",
        });
    }

    // 1. Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 2. Store a HASHED version of the token in the DB
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });

    // 3. Send the email with the *unhashed* token
    // Your frontend will live at a URL like "http://localhost:3000"
    // This link will point to your frontend's reset page.
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    sendEmail({
      to: user.email,
      subject: "CuraLink Password Reset Request",
      html: `<h1>You requested a password reset</h1>
             <p>Click this link to reset your password (link expires in 1 hour):</p>
             <a href="${resetUrl}" target="_blank">${resetUrl}</a>`,
    });

    res
      .status(200)
      .json({
        message:
          "If an account with this email exists, a reset link has been sent.",
      });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --- POST /api/auth/reset-password ---
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // 1. Hash the token from the user's URL
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. Find user with this *hashed* token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken,
        resetPasswordExpires: { gte: new Date() }, // gte = greater than or equal (is it expired?)
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired password reset token" });
    }

    // 3. Update the password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
