// src/utils/jwt.ts
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "supersecretkey";
const ACCESS_TOKEN_EXPIRES_IN = "15m";

export interface JwtPayload {
  userId: number;
  role: string;
}

// Générer un access token
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

// Vérifier un access token
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return decoded as JwtPayload;
  } catch (err) {
    return null;
  }
}
