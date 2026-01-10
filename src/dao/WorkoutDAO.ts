import Database from "better-sqlite3";
import { Workout, CreateWorkoutDTO, UpdateWorkoutDTO } from "../models/workout";

export class WorkoutDAO {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // CREATE
  create(data: CreateWorkoutDTO): Workout {
    const stmt = this.db.prepare(`
      INSERT INTO workouts (user_id, name, date, duration_minutes, notes)
      VALUES (@user_id, @name, @date, @duration_minutes, @notes)
    `);

    // ✅ CORRIGÉ - Gérer les undefined
    const result = stmt.run({
      user_id: data.user_id,
      name: data.name,
      date: data.date,
      duration_minutes: data.duration_minutes ?? null,
      notes: data.notes ?? null,
    });

    const workout = this.findById(result.lastInsertRowid as number);
    if (!workout) throw new Error("Workout creation failed");
    return workout;
  }

  // READ - tous les workouts
  findAll(): Workout[] {
    const stmt = this.db.prepare(`SELECT * FROM workouts ORDER BY date DESC`);
    return stmt.all() as Workout[];
  }

  // READ - par ID
  findById(id: number): Workout | null {
    const stmt = this.db.prepare(`SELECT * FROM workouts WHERE id = ?`);
    return (stmt.get(id) as Workout) ?? null;
  }

  // READ - tous les workouts d'un user
  findByUserId(userId: number): Workout[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workouts 
      WHERE user_id = ? 
      ORDER BY date DESC
    `);
    return stmt.all(userId) as Workout[];
  }

  // UPDATE
  update(id: number, data: UpdateWorkoutDTO): Workout | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const stmt = this.db.prepare(`
      UPDATE workouts
      SET name = @name,
          date = @date,
          duration_minutes = @duration_minutes,
          notes = @notes,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    stmt.run({
      id,
      name: data.name ?? existing.name,
      date: data.date ?? existing.date,
      duration_minutes: data.duration_minutes ?? existing.duration_minutes,
      notes: data.notes ?? existing.notes,
    });

    return this.findById(id);
  }

  // DELETE
  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM workouts WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
