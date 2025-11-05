import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

// Middleware to authenticate JWT tokens

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    // 3. Attach the user payload to the request object
    req.user = decoded;

    // 4. Pass control to the next route
    next();
  } catch (ex) {
    res.status(400).json({ message: "Invalid token." });
  }
};

// src/middleware/auth.ts
// ... (keep authMiddleware)

// --- NEW MIDDLEWARE ---
// Checks for a valid token AND the 'RESEARCHER' role
export const researcherAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. First, run the standard auth middleware
  authMiddleware(req, res, () => {
    // 2. If standard auth passes, check the role
    if (req.user?.role !== "RESEARCHER") {
      return res.status(403).json({
        message: "Forbidden: Access denied. Researcher role required.",
      });
    }
    // 3. If role is correct, proceed
    next();
  });
};

export const patientAuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  authMiddleware(req, res, () => {
    if (req.user?.role !== "PATIENT") {
      return res
        .status(403)
        .json({ message: "Forbidden: Patient role required." });
    }
    next();
  });
};
