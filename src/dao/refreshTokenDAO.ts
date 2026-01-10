import Database from "better-sqlite3";

export interface RefreshToken {
  id: number;
  token: string;
  user_id: number;
  expires_at: string;
  revoked: number;
  device_info?: string | null;
  created_at: string;
}

export interface CreateRefreshTokenDTO {
  token: string;
  user_id: number;
  expires_at: string;
  device_info?: string;
}

export class RefreshTokenDAO {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  // CREATE
  create(data: CreateRefreshTokenDTO): RefreshToken {
    const stmt = this.db.prepare(`
      INSERT INTO refresh_tokens (token, user_id, expires_at, device_info)
      VALUES (@token, @user_id, @expires_at, @device_info)
    `);

    const result = stmt.run(data);

    const token = this.findById(result.lastInsertRowid as number);
    if (!token) throw new Error("Refresh token creation failed");
    return token;
  }

  // READ - par ID
  findById(id: number): RefreshToken | null {
    const stmt = this.db.prepare(`SELECT * FROM refresh_tokens WHERE id = ?`);
    return (stmt.get(id) as RefreshToken) ?? null;
  }

  // READ - par valeur du token
  findByToken(token: string): RefreshToken | null {
    const stmt = this.db.prepare(
      `SELECT * FROM refresh_tokens WHERE token = ?`
    );
    return (stmt.get(token) as RefreshToken) ?? null;
  }

  // READ - tous les tokens d’un utilisateur
  findByUserId(userId: number): RefreshToken[] {
    const stmt = this.db.prepare(
      `SELECT * FROM refresh_tokens WHERE user_id = ?`
    );
    return stmt.all(userId) as RefreshToken[];
  }

  // REVOKE
  revoke(id: number): boolean {
    const stmt = this.db.prepare(
      `UPDATE refresh_tokens SET revoked = 1 WHERE id = ?`
    );
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // DELETE - supprimer un token précis
  delete(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM refresh_tokens WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // DELETE - supprimer tous les tokens expirés
  deleteExpired(): number {
    const stmt = this.db.prepare(`
    DELETE FROM refresh_tokens 
    WHERE datetime(expires_at) <= CURRENT_TIMESTAMP
  `);
    const result = stmt.run();
    return result.changes;
  }
}
