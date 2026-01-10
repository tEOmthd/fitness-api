import { Router } from "express";
import { AuthService } from "../services/authService";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../middlewares/authenticateToken";

export function authRoutes(authService: AuthService) {
  const router = Router();

  // Login
  router.post("/login", async (req, res) => {
    try {
      const { email, password, device_info } = req.body;
      const tokens = await authService.login(
        email,
        password,
        device_info || "unknown"
      );
      res.json(tokens);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  });

  // Refresh
  router.post("/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  });

  // Logout
  router.post("/logout", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      res.json({ message: "Logged out" });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Me
  router.get("/me", authenticateToken, (req: AuthenticatedRequest, res) => {
    res.json(req.user);
  });

  return router;
}
