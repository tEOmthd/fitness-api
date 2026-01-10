import { Router } from "express";
import { ExerciseDAO } from "../dao/ExerciseDAO"; // ✅ CORRIGÉ
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../middlewares/authenticateToken";
import { authorizeRole } from "../middlewares/authorizeRole";

export function exerciseRoutes(exerciseDAO: ExerciseDAO) {
  const router = Router();

  // GET /exercises - Liste tous les exercices (tous les users)
  router.get("/", authenticateToken, (req, res) => {
    try {
      const exercises = exerciseDAO.findAll();
      res.json(exercises);
    } catch (err: any) {
      console.error("GET /exercises error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /exercises/:id - Détails d'un exercice
  router.get("/:id", authenticateToken, (req, res) => {
    try {
      const exercise = exerciseDAO.findById(Number(req.params.id));
      if (!exercise)
        return res.status(404).json({ error: "Exercise not found" });
      res.json(exercise);
    } catch (err: any) {
      console.error("GET /exercises/:id error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /exercises - Créer un exercice (admin seulement)
  router.post("/", authenticateToken, authorizeRole("admin"), (req, res) => {
    try {
      const currentUser = (req as AuthenticatedRequest).user!;
      const exercise = exerciseDAO.create({
        ...req.body,
        created_by: currentUser.id,
      });
      res.status(201).json(exercise);
    } catch (err: any) {
      console.error("POST /exercises error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /exercises/:id - Modifier un exercice (admin seulement)
  router.put("/:id", authenticateToken, authorizeRole("admin"), (req, res) => {
    try {
      const exercise = exerciseDAO.update(Number(req.params.id), req.body);
      if (!exercise)
        return res.status(404).json({ error: "Exercise not found" });
      res.json(exercise);
    } catch (err: any) {
      console.error("PUT /exercises/:id error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /exercises/:id - Supprimer un exercice (admin seulement)
  router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    (req, res) => {
      try {
        const deleted = exerciseDAO.delete(Number(req.params.id));
        if (!deleted)
          return res.status(404).json({ error: "Exercise not found" });
        res.status(204).send();
      } catch (err: any) {
        console.error("DELETE /exercises/:id error:", err.message);
        res.status(500).json({ error: err.message });
      }
    }
  );

  return router;
}
