import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

export function createTestDB(): Database.Database {
  const testDb = new Database(":memory:");
  testDb.pragma("foreign_keys = ON");

  const schemaPath = path.join(__dirname, "../../database/schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  testDb.exec(schema);

  return testDb;
}

export function seedTestDB(db: Database.Database) {
  const hashedPassword = bcrypt.hashSync("password123", 10);

  // User 1 : Admin
  db.prepare(
    `
    INSERT INTO users (email, password, role, first_name, last_name)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run("admin@test.com", hashedPassword, "admin", "Admin", "Test");

  // User 2 : User normal
  db.prepare(
    `
    INSERT INTO users (email, password, role, first_name, last_name)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run("user@test.com", hashedPassword, "user", "User", "Test");

  // User 3 : Autre user
  db.prepare(
    `
    INSERT INTO users (email, password, role, first_name, last_name)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run("user2@test.com", hashedPassword, "user", "User2", "Test");

  // Exercice de test
  db.prepare(
    `
    INSERT INTO exercises (name, category, difficulty)
    VALUES (?, ?, ?)
  `
  ).run("Squat", "force", "debutant");
}

export function cleanupTestDB(db: Database.Database) {
  db.exec("DELETE FROM workout_exercises");
  db.exec("DELETE FROM workouts");
  db.exec("DELETE FROM refresh_tokens");
  db.exec("DELETE FROM exercises");
  db.exec("DELETE FROM users");

  db.exec("DELETE FROM sqlite_sequence WHERE name='users'");
  db.exec("DELETE FROM sqlite_sequence WHERE name='exercises'");
  db.exec("DELETE FROM sqlite_sequence WHERE name='workouts'");
  db.exec("DELETE FROM sqlite_sequence WHERE name='workout_exercises'");
}
