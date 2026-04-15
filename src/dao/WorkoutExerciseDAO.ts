import Database from "better-sqlite3";
import {
  WorkoutExercise,
  CreateWorkoutExerciseDTO,
  UpdateWorkoutExerciseDTO,
} from "../models/workoutExercise";

export class WorkoutExerciseDAO {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // CREATE
  create(data: CreateWorkoutExerciseDTO): WorkoutExercise {
    const stmt = this.db.prepare(`
      INSERT INTO workout_exercises (
        workout_id, exercise_id, sets, reps, weight_kg, 
        duration_seconds, distance_meters, notes, order_index
      )
      VALUES (
        @workout_id, @exercise_id, @sets, @reps, @weight_kg, 
        @duration_seconds, @distance_meters, @notes, @order_index
      )
    `);

    const result = stmt.run({
      ...data,
      order_index: data.order_index ?? 0,
    });

    const workoutExercise = this.findById(result.lastInsertRowid as number);
    if (!workoutExercise) throw new Error("WorkoutExercise creation failed");
    return workoutExercise;
  }

  // READ - par ID
  findById(id: number): WorkoutExercise | null {
    const stmt = this.db.prepare(
      `SELECT * FROM workout_exercises WHERE id = ?`
    );
    return (stmt.get(id) as WorkoutExercise) ?? null;
  }

  // READ - tous les exercices d'un workout
  findByWorkoutId(workoutId: number): WorkoutExercise[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workout_exercises 
      WHERE workout_id = ? 
      ORDER BY order_index
    `);
    return stmt.all(workoutId) as WorkoutExercise[];
  }

  // UPDATE
  update(id: number, data: UpdateWorkoutExerciseDTO): WorkoutExercise | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const stmt = this.db.prepare(`
      UPDATE workout_exercises
      SET sets = @sets,
          reps = @reps,
          weight_kg = @weight_kg,
          duration_seconds = @duration_seconds,
          distance_meters = @distance_meters,
          notes = @notes,
          order_index = @order_index
      WHERE id = @id
    `);

    stmt.run({
      id,
      sets: data.sets ?? existing.sets,
      reps: data.reps ?? existing.reps,
      weight_kg: data.weight_kg ?? existing.weight_kg,
      duration_seconds: data.duration_seconds ?? existing.duration_seconds,
      distance_meters: data.distance_meters ?? existing.distance_meters,
      notes: data.notes ?? existing.notes,
      order_index: data.order_index ?? existing.order_index,
    });

    return this.findById(id);
  }

  // DELETE
  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM workout_exercises WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // DELETE - tous les exercices d'un workout
  deleteByWorkoutId(workoutId: number): number {
    const stmt = this.db.prepare(
      `DELETE FROM workout_exercises WHERE workout_id = ?`
    );
    const result = stmt.run(workoutId);
    return result.changes;
  }
}
