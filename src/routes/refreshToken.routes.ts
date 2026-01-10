import { Router } from "express";

export function refreshTokenRoutes() {
  const router = Router();

  router.post("/", (req, res) => {
    res.status(501).json({ error: "Not implemented yet" });
  });
  return router;
}
