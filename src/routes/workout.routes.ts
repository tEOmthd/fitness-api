import { Router } from "express";
import { WorkoutDAO } from "../dao/WorkoutDAO";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../middlewares/authenticateToken";

export function workoutRoutes(workoutDAO: WorkoutDAO) {
  const router = Router();

  // GET /workouts
  router.get("/", authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      if (req.user!.role === "admin") {
        const workouts = workoutDAO.findAll();
        res.json(workouts);
      } else {
        const workouts = workoutDAO.findByUserId(req.user!.id);
        res.json(workouts);
      }
    } catch (err: any) {
      console.error("GET /workouts error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /workouts/:id
  router.get("/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const workout = workoutDAO.findById(Number(req.params.id));
      if (!workout) return res.status(404).json({ error: "Workout not found" });

      // Vérifier propriété
      if (req.user!.role !== "admin" && workout.user_id !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json(workout);
    } catch (err: any) {
      console.error("GET /workouts/:id error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /workouts
  router.post("/", authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const workout = workoutDAO.create({
        ...req.body,
        user_id: req.user!.id,
      });
      res.status(201).json(workout);
    } catch (err: any) {
      console.error("POST /workouts error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /workouts/:id
  router.put("/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const existing = workoutDAO.findById(Number(req.params.id));
      if (!existing)
        return res.status(404).json({ error: "Workout not found" });

      if (req.user!.role !== "admin" && existing.user_id !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const workout = workoutDAO.update(Number(req.params.id), req.body);
      res.json(workout);
    } catch (err: any) {
      console.error("PUT /workouts/:id error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /workouts/:id
  router.delete("/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    try {
      const existing = workoutDAO.findById(Number(req.params.id));
      if (!existing)
        return res.status(404).json({ error: "Workout not found" });

      if (req.user!.role !== "admin" && existing.user_id !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      workoutDAO.delete(Number(req.params.id));
      res.status(204).send();
    } catch (err: any) {
      console.error("DELETE /workouts/:id error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
