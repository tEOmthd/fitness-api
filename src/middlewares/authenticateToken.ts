import dotenv from "dotenv";
dotenv.config();

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export interface AuthenticatedRequest extends Request {
  user?: { id: number; role: string };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      userId: number;
      role: string;
    };
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
