import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

const dbPath = process.env.DB_PATH || "./database/fitness.db";
const schemaPath = path.join(__dirname, "../../database/schema.sql");

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Créer la connexion
export const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

export function initDatabase(): void {
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);
  console.log("✅ Database initialized");
}

export function createTestDatabase(): Database.Database {
  const testDb = new Database(":memory:");
  testDb.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(schemaPath, "utf-8");
  testDb.exec(schema);

  return testDb;
}

export function closeDatabase(): void {
  db.close();
}
