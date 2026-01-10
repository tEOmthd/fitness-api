import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserDAO } from "../dao/userDAO";
import { RefreshTokenDAO, CreateRefreshTokenDTO } from "../dao/refreshTokenDAO";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 3600 * 1000;

export class AuthService {
  constructor(private userDAO: UserDAO, private tokenDAO: RefreshTokenDAO) {}

  async login(email: string, password: string, device_info: string) {
    const user = this.userDAO.findByEmail(email);
    if (!user) throw new Error("User not found");

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) throw new Error("Invalid password");

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshDTO: CreateRefreshTokenDTO = {
      token: jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET),
      user_id: user.id,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
      device_info,
    };

    const refreshToken = this.tokenDAO.create(refreshDTO).token;

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    const stored = this.tokenDAO.findByToken(token);
    if (!stored || stored.revoked) throw new Error("Invalid refresh token");

    const user = this.userDAO.findById(stored.user_id);
    if (!user) throw new Error("User not found");

    this.tokenDAO.revoke(stored.id);
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshDTO: CreateRefreshTokenDTO = {
      token: jwt.sign(
        { userId: user.id, rand: Math.random() },
        REFRESH_TOKEN_SECRET
      ),
      user_id: user.id,
      expires_at: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
      device_info: stored.device_info ?? "unknown",
    };

    const refreshToken = this.tokenDAO.create(refreshDTO).token;

    return { accessToken, refreshToken };
  }

  async logout(token: string) {
    const stored = this.tokenDAO.findByToken(token);
    if (!stored) return false;
    return this.tokenDAO.revoke(stored.id);
  }
}
