import request from "supertest";
import express from "express";
import Database from "better-sqlite3";
import { UserDAO } from "../../src/dao/userDAO";
import { RefreshTokenDAO } from "../../src/dao/refreshTokenDAO";
import { AuthService } from "../../src/services/authService";
import { authRoutes } from "../../src/routes/auth.routes";
import { createTestDB, seedTestDB } from "./setup";

describe("Auth Integration Tests", () => {
  let app: express.Application;
  let db: Database.Database;

  beforeAll(() => {
    db = createTestDB();

    app = express();
    app.use(express.json());

    const userDAO = new UserDAO(db);
    const tokenDAO = new RefreshTokenDAO(db);
    const authService = new AuthService(userDAO, tokenDAO);

    app.use("/auth", authRoutes(authService));
  });

  beforeEach(() => {
    db.exec("DELETE FROM workout_exercises");
    db.exec("DELETE FROM workouts");
    db.exec("DELETE FROM refresh_tokens");
    db.exec("DELETE FROM exercises");
    db.exec("DELETE FROM users");

    seedTestDB(db);
  });

  afterAll(() => {
    db.close();
  });

  describe("POST /auth/login", () => {
    it("should return tokens for valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "user@test.com",
        password: "password123",
        device_info: "test-device",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should return 401 for invalid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "user@test.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
    });

    it("should return 401 for non-existent user", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "ghost@test.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should return new tokens with valid refresh token", async () => {
      // 1. Login pour obtenir un refresh token
      const loginResponse = await request(app).post("/auth/login").send({
        email: "user@test.com",
        password: "password123",
      });

      const { refreshToken } = loginResponse.body;

      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty("accessToken");
      expect(refreshResponse.body).toHaveProperty("refreshToken");

      expect(refreshResponse.body.refreshToken).not.toBe(refreshToken);
    });

    it("should return 401 for invalid refresh token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: "invalid-token" });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("should revoke refresh token", async () => {
      const loginResponse = await request(app).post("/auth/login").send({
        email: "user@test.com",
        password: "password123",
      });

      const { refreshToken } = loginResponse.body;

      const logoutResponse = await request(app)
        .post("/auth/logout")
        .send({ refreshToken });

      expect(logoutResponse.status).toBe(200);

      const refreshResponse = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(401);
    });
  });

  describe("GET /auth/me", () => {
    it("should return user info with valid token", async () => {
      // 1. Login
      const loginResponse = await request(app).post("/auth/login").send({
        email: "user@test.com",
        password: "password123",
      });

      const { accessToken } = loginResponse.body;

      const meResponse = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body).toHaveProperty("id");
      expect(meResponse.body).toHaveProperty("role", "user");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/auth/me");
      expect(response.status).toBe(401);
    });
  });
});
