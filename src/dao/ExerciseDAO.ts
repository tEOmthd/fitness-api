import Database from "better-sqlite3";
import {
  Exercise,
  CreateExerciseDTO,
  UpdateExerciseDTO,
} from "../models/Exercise";

export class ExerciseDAO {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // CREATE
  create(data: CreateExerciseDTO): Exercise {
    const stmt = this.db.prepare(`
    INSERT INTO exercises (name, description, category, muscle_group, difficulty, created_by)
    VALUES (@name, @description, @category, @muscle_group, @difficulty, @created_by)
  `);

    const result = stmt.run({
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      muscle_group: data.muscle_group ?? null,
      difficulty: data.difficulty ?? null,
      created_by: data.created_by ?? null,
    });

    const exercise = this.findById(result.lastInsertRowid as number);
    if (!exercise) throw new Error("Exercise creation failed");
    return exercise;
  }

  // READ - tous les exercises
  findAll(): Exercise[] {
    const stmt = this.db.prepare(`SELECT * FROM exercises ORDER BY id`);
    return stmt.all() as Exercise[];
  }

  // READ - par ID
  findById(id: number): Exercise | null {
    const stmt = this.db.prepare(`SELECT * FROM exercises WHERE id = ?`);
    return (stmt.get(id) as Exercise) ?? null;
  }

  // READ - par catégorie
  findByCategory(category: string): Exercise[] {
    const stmt = this.db.prepare(`SELECT * FROM exercises WHERE category = ?`);
    return stmt.all(category) as Exercise[];
  }

  // READ - par muscle group
  findByMuscleGroup(muscleGroup: string): Exercise[] {
    const stmt = this.db.prepare(
      `SELECT * FROM exercises WHERE muscle_group = ?`
    );
    return stmt.all(muscleGroup) as Exercise[];
  }

  // UPDATE
  update(id: number, data: UpdateExerciseDTO): Exercise | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const stmt = this.db.prepare(`
      UPDATE exercises
      SET name = @name,
          description = @description,
          category = @category,
          muscle_group = @muscle_group,
          difficulty = @difficulty
      WHERE id = @id
    `);

    stmt.run({
      id,
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      category: data.category ?? existing.category,
      muscle_group: data.muscle_group ?? existing.muscle_group,
      difficulty: data.difficulty ?? existing.difficulty,
    });

    return this.findById(id);
  }

  // DELETE
  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM exercises WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
