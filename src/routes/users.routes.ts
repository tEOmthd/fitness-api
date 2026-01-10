import { Router } from "express";
import { UserDAO } from "../dao/userDAO"; // userDAO tout attaché
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../middlewares/authenticateToken";
import { authorizeRole } from "../middlewares/authorizeRole";
import bcrypt from "bcryptjs";

export function usersRoutes(userDAO: UserDAO) {
  const router = Router();

  // POST /users - Créer un user
  router.post("/", (req, res) => {
    try {
      const { email, password, role, first_name, last_name } = req.body;
      const hashed = bcrypt.hashSync(password, 10);
      const user = userDAO.create({
        email,
        password: hashed,
        role,
        first_name,
        last_name,
      });
      res.status(201).json(user);
    } catch (err: any) {
      console.error("POST /users error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /users/:id - Voir un profil
  router.get("/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const id = Number(req.params.id);

      if (req.user!.role !== "admin" && req.user!.id !== id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const user = userDAO.findById(id);
      if (!user) return res.status(404).json({ error: "Not found" });

      res.json(user);
    } catch (err: any) {
      console.error("GET /users/:id error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /users/:id - Supprimer un user (admin only)
  router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    (req, res) => {
      try {
        const deleted = userDAO.delete(Number(req.params.id));
        if (!deleted) return res.status(404).json({ error: "Not found" });
        res.status(204).send();
      } catch (err: any) {
        console.error("DELETE /users/:id error:", err.message);
        res.status(500).json({ error: err.message });
      }
    }
  );

  return router;
}
