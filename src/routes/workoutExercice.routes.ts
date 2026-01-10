import { Router } from "express";
import { WorkoutExerciseDAO } from "../dao/WorkoutExerciseDAO";
import { WorkoutDAO } from "../dao/WorkoutDAO";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../middlewares/authenticateToken";

export function workoutExerciseRoutes(
  workoutExerciseDAO: WorkoutExerciseDAO,
  workoutDAO: WorkoutDAO
) {
  const router = Router();

  // GET /workout-exercises/workout/:workoutId - Tous les exercices d'un workout
  router.get(
    "/workout/:workoutId",
    authenticateToken,
    (req: AuthenticatedRequest, res) => {
      const workout = workoutDAO.findById(Number(req.params.workoutId));
      if (!workout) return res.status(404).json({ error: "Workout not found" });

      if (req.user!.role !== "admin" && workout.user_id !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const exercises = workoutExerciseDAO.findByWorkoutId(
        Number(req.params.workoutId)
      );
      res.json(exercises);
    }
  );

  // POST /workout-exercises - Ajouter un exercice à un workout
  router.post("/", authenticateToken, (req: AuthenticatedRequest, res) => {
    const workout = workoutDAO.findById(req.body.workout_id);
    if (!workout) return res.status(404).json({ error: "Workout not found" });

    if (req.user!.role !== "admin" && workout.user_id !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const workoutExercise = workoutExerciseDAO.create(req.body);
    res.status(201).json(workoutExercise);
  });

  // PUT /workout-exercises/:id - Modifier un exercice dans un workout
  router.put("/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    const existing = workoutExerciseDAO.findById(Number(req.params.id));
    if (!existing)
      return res.status(404).json({ error: "WorkoutExercise not found" });

    const workout = workoutDAO.findById(existing.workout_id);
    if (!workout) return res.status(404).json({ error: "Workout not found" });

    if (req.user!.role !== "admin" && workout.user_id !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updated = workoutExerciseDAO.update(Number(req.params.id), req.body);
    res.json(updated);
  });

  // DELETE /workout-exercises/:id - Retirer un exercice d'un workout
  router.delete("/:id", authenticateToken, (req: AuthenticatedRequest, res) => {
    const existing = workoutExerciseDAO.findById(Number(req.params.id));
    if (!existing)
      return res.status(404).json({ error: "WorkoutExercise not found" });

    const workout = workoutDAO.findById(existing.workout_id);
    if (!workout) return res.status(404).json({ error: "Workout not found" });

    if (req.user!.role !== "admin" && workout.user_id !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    workoutExerciseDAO.delete(Number(req.params.id));
    res.status(204).send();
  });

  return router;
}
