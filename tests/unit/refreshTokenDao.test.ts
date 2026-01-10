import Database from "better-sqlite3";
import {
  RefreshTokenDAO,
  CreateRefreshTokenDTO,
  RefreshToken,
} from "../../src/dao/refreshTokenDAO";
import { createTestDatabase } from "../../src/utils/database";

describe("RefreshTokenDAO", () => {
  let db: Database.Database;
  let tokenDAO: RefreshTokenDAO;

  beforeEach(() => {
    db = createTestDatabase();
    tokenDAO = new RefreshTokenDAO(db);

    db.prepare(
      `
      INSERT INTO users (email, password, role, first_name, last_name)
      VALUES ('test@example.com', 'hashed', 'user', 'John', 'Doe')
    `
    ).run();
  });

  afterEach(() => {
    db.close();
  });

  describe("create", () => {
    it("should create a new refresh token", () => {
      const data: CreateRefreshTokenDTO = {
        token: "token123",
        user_id: 1,
        expires_at: new Date(Date.now() + 3600_000).toISOString(),
        device_info: "iPhone 13",
      };

      const created = tokenDAO.create(data);

      expect(created).toHaveProperty("id");
      expect(created.token).toBe(data.token);
      expect(created.user_id).toBe(data.user_id);
      expect(created.device_info).toBe(data.device_info);
      expect(Boolean(created.revoked)).toBe(false);
    });
  });

  describe("findById", () => {
    it("should return the token if it exists", () => {
      const created = tokenDAO.create({
        token: "token456",
        user_id: 1,
        expires_at: new Date(Date.now() + 3600_000).toISOString(),
        device_info: "Android Phone",
      });

      const found = tokenDAO.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.token).toBe("token456");
    });

    it("should return null if token does not exist", () => {
      const found = tokenDAO.findById(999);
      expect(found).toBeNull();
    });
  });

  describe("findByToken", () => {
    it("should return the token if it exists", () => {
      const created = tokenDAO.create({
        token: "abc123",
        user_id: 1,
        expires_at: new Date(Date.now() + 3600_000).toISOString(),
        device_info: "iPad",
      });

      const found = tokenDAO.findByToken("abc123");
      expect(found).not.toBeNull();
      expect(found?.user_id).toBe(1);
    });

    it("should return null if token does not exist", () => {
      const found = tokenDAO.findByToken("nonexistent");
      expect(found).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return all tokens for a user", () => {
      tokenDAO.create({
        token: "t1",
        user_id: 1,
        expires_at: new Date(Date.now() + 1000).toISOString(),
        device_info: "device1",
      });
      tokenDAO.create({
        token: "t2",
        user_id: 1,
        expires_at: new Date(Date.now() + 1000).toISOString(),
        device_info: "device2",
      });
      tokenDAO.create({
        token: "t3",
        user_id: 1,
        expires_at: new Date(Date.now() + 1000).toISOString(),
        device_info: "device3",
      });

      const tokens = tokenDAO.findByUserId(1);
      expect(tokens).toHaveLength(3);
      const tokenValues = tokens.map((t) => t.token);
      expect(tokenValues).toContain("t1");
      expect(tokenValues).toContain("t2");
      expect(tokenValues).toContain("t3");
    });

    it("should return empty array if user has no tokens", () => {
      const tokens = tokenDAO.findByUserId(999);
      expect(tokens).toHaveLength(0);
    });
  });

  describe("revoke", () => {
    it("should mark a token as revoked", () => {
      const token = tokenDAO.create({
        token: "revoke-me",
        user_id: 1,
        expires_at: new Date(Date.now() + 1000).toISOString(),
        device_info: "deviceX",
      });
      const revoked = tokenDAO.revoke(token.id);
      expect(revoked).toBe(true);

      const updated = tokenDAO.findById(token.id);
      expect(Boolean(updated?.revoked)).toBe(true);
    });

    it("should return false if token does not exist", () => {
      const revoked = tokenDAO.revoke(999);
      expect(revoked).toBe(false);
    });
  });

  describe("delete", () => {
    it("should delete a token", () => {
      const token = tokenDAO.create({
        token: "delete-me",
        user_id: 1,
        expires_at: new Date(Date.now() + 1000).toISOString(),
        device_info: "deviceY",
      });
      const deleted = tokenDAO.delete(token.id);
      expect(deleted).toBe(true);

      const found = tokenDAO.findById(token.id);
      expect(found).toBeNull();
    });

    it("should return false if token does not exist", () => {
      const deleted = tokenDAO.delete(999);
      expect(deleted).toBe(false);
    });
  });

  describe("deleteExpired", () => {
    it("should delete only expired tokens", () => {
      const past = new Date(Date.now() - 3600_000).toISOString();
      const future = new Date(Date.now() + 3600_000).toISOString();

      tokenDAO.create({
        token: "expired",
        user_id: 1,
        expires_at: past,
        device_info: "old-device",
      });
      tokenDAO.create({
        token: "valid",
        user_id: 1,
        expires_at: future,
        device_info: "new-device",
      });

      const removed = tokenDAO.deleteExpired();
      expect(removed).toBe(1);

      const remaining = tokenDAO.findByUserId(1);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].token).toBe("valid");
    });
  });
});
