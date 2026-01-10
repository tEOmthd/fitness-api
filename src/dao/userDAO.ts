import Database from "better-sqlite3";
import { User, CreateUserDTO, UpdateUserDTO } from "../models/user";

export class UserDAO {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // CREATE
  create(data: CreateUserDTO): User {
    const stmt = this.db.prepare(`
      INSERT INTO users (email, password, role, first_name, last_name)
      VALUES (@email, @password, @role, @first_name, @last_name)
    `);

    const result = stmt.run({
      ...data,
      role: data.role ?? "user",
    });

    const user = this.findById(result.lastInsertRowid as number);
    if (!user) {
      throw new Error("User creation failed");
    }

    return user;
  }

  // READ - tous les users
  findAll(): User[] {
    const stmt = this.db.prepare(`SELECT * FROM users ORDER BY id`);
    return stmt.all() as User[];
  }

  // READ - un user par ID
  findById(id: number): User | null {
    const stmt = this.db.prepare(`SELECT * FROM users WHERE id = ?`);
    return (stmt.get(id) as User) ?? null;
  }

  // READ - un user par email
  findByEmail(email: string): User | null {
    const stmt = this.db.prepare(`SELECT * FROM users WHERE email = ?`);
    return (stmt.get(email) as User) ?? null;
  }

  // UPDATE
  update(id: number, data: UpdateUserDTO): User | null {
    const existing = this.findById(id);
    if (!existing) {
      return null;
    }

    const stmt = this.db.prepare(`
      UPDATE users
      SET
        email = @email,
        password = @password,
        role = @role,
        first_name = @first_name,
        last_name = @last_name,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    stmt.run({
      id,
      email: data.email ?? existing.email,
      password: data.password ?? existing.password,
      role: data.role ?? existing.role,
      first_name: data.first_name ?? existing.first_name,
      last_name: data.last_name ?? existing.last_name,
    });

    return this.findById(id);
  }

  // DELETE
  delete(userId: number) {
    const stmt = this.db.prepare("DELETE FROM users WHERE id = ?");
    const info = stmt.run(userId);
    return info.changes > 0;
  }

  // Utilitaire
  emailExists(email: string): boolean {
    const stmt = this.db.prepare(
      `SELECT COUNT(*) as count FROM users WHERE email = ?`
    );
    const row = stmt.get(email) as { count: number };
    return row.count > 0;
  }
}
