import request from "supertest";
import express from "express";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import { UserDAO } from "../../src/dao/userDAO";
import { usersRoutes } from "../../src/routes/users.routes";
import { createTestDB, seedTestDB, cleanupTestDB } from "./setup";

describe("Users Integration Tests", () => {
  let app: express.Application;
  let db: Database.Database;
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    db = createTestDB();

    app = express();
    app.use(express.json());

    const userDAO = new UserDAO(db);
    app.use("/users", usersRoutes(userDAO));

    // Générer les tokens
    const secret = process.env.ACCESS_TOKEN_SECRET || "test-secret";
    adminToken = jwt.sign({ userId: 1, role: "admin" }, secret, {
      expiresIn: "1h",
    });
    userToken = jwt.sign({ userId: 2, role: "user" }, secret, {
      expiresIn: "1h",
    });
  });

  beforeEach(() => {
    cleanupTestDB(db);
    seedTestDB(db);
  });

  afterAll(() => {
    db.close();
  });

  describe("POST /users", () => {
    it("should create a new user", async () => {
      const response = await request(app).post("/users").send({
        email: "newuser@test.com",
        password: "password123",
        first_name: "New",
        last_name: "User",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("newuser@test.com");
    });

    it("should not create user with duplicate email", async () => {
      await request(app).post("/users").send({
        email: "duplicate@test.com",
        password: "password123",
        first_name: "First",
        last_name: "User",
      });
      const response = await request(app).post("/users").send({
        email: "duplicate@test.com",
        password: "password456",
        first_name: "Second",
        last_name: "User",
      });

      expect(response.status).toBe(500);
    });
  });

  describe("GET /users/:id", () => {
    it("should allow user to get their own profile", async () => {
      const response = await request(app)
        .get("/users/2")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", 2);
    });

    it("should forbid user from getting another user profile", async () => {
      const response = await request(app)
        .get("/users/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it("should allow admin to get any user profile", async () => {
      const response = await request(app)
        .get("/users/2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app)
        .get("/users/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should allow admin to delete a user", async () => {
      const response = await request(app)
        .delete("/users/2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it("should forbid non-admin from deleting a user", async () => {
      const response = await request(app)
        .delete("/users/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
