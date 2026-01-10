import request from "supertest";
import express from "express";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import { ExerciseDAO } from "../../src/dao/ExerciseDAO";
import { exerciseRoutes } from "../../src/routes/exercice.routes";
import { createTestDB, seedTestDB, cleanupTestDB } from "./setup";

describe("Exercises Integration Tests", () => {
  let app: express.Application;
  let db: Database.Database;
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    db = createTestDB();

    app = express();
    app.use(express.json());

    const exerciseDAO = new ExerciseDAO(db);
    app.use("/exercises", exerciseRoutes(exerciseDAO));

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

  describe("GET /exercises", () => {
    it("should return all exercises for authenticated user", async () => {
      const response = await request(app)
        .get("/exercises")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/exercises");
      expect(response.status).toBe(401);
    });
  });

  describe("POST /exercises", () => {
    it("should allow admin to create exercise", async () => {
      const response = await request(app)
        .post("/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Burpees",
          description: "Full body exercise",
          category: "cardio",
          difficulty: "intermediaire",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("Burpees");
    });

    it("should forbid non-admin from creating exercise", async () => {
      const response = await request(app)
        .post("/exercises")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Burpees",
          category: "cardio",
        });

      expect(response.status).toBe(403);
    });
  });

  describe("PUT /exercises/:id", () => {
    it("should allow admin to update exercise", async () => {
      const response = await request(app)
        .put("/exercises/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Squat Modifié",
          difficulty: "avance",
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Squat Modifié");
    });

    it("should forbid non-admin from updating exercise", async () => {
      const response = await request(app)
        .put("/exercises/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Hacked" });

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /exercises/:id", () => {
    it("should allow admin to delete exercise", async () => {
      const response = await request(app)
        .delete("/exercises/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it("should forbid non-admin from deleting exercise", async () => {
      const response = await request(app)
        .delete("/exercises/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
});
