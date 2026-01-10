import request from "supertest";
import express from "express";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import { WorkoutDAO } from "../../src/dao/WorkoutDAO";
import { workoutRoutes } from "../../src/routes/workout.routes";
import { createTestDB, seedTestDB, cleanupTestDB } from "./setup";

describe("Workouts Integration Tests", () => {
  let app: express.Application;
  let db: Database.Database;
  let adminToken: string;
  let userToken: string;
  let user2Token: string;

  beforeAll(() => {
    db = createTestDB();

    app = express();
    app.use(express.json());

    const workoutDAO = new WorkoutDAO(db);
    app.use("/workouts", workoutRoutes(workoutDAO));

    const secret = process.env.ACCESS_TOKEN_SECRET || "test-secret";
    adminToken = jwt.sign({ userId: 1, role: "admin" }, secret, {
      expiresIn: "1h",
    });
    userToken = jwt.sign({ userId: 2, role: "user" }, secret, {
      expiresIn: "1h",
    });
    user2Token = jwt.sign({ userId: 3, role: "user" }, secret, {
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

  describe("POST /workouts", () => {
    it("should create workout for authenticated user", async () => {
      const response = await request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Morning Workout",
          date: "2026-01-07",
          duration_minutes: 45,
          notes: "Felt strong today",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.user_id).toBe(2);
    });
  });

  describe("GET /workouts", () => {
    it("should return only user workouts for non-admin", async () => {
      await request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "User 2 Workout",
          date: "2026-01-07",
        });

      const response = await request(app)
        .get("/workouts")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((workout: any) => {
        expect(workout.user_id).toBe(2);
      });
    });

    it("should return all workouts for admin", async () => {
      const response = await request(app)
        .get("/workouts")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /workouts/:id", () => {
    it("should allow user to get their own workout", async () => {
      const createResponse = await request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Test Workout",
          date: "2026-01-07",
        });

      const workoutId = createResponse.body.id;

      const response = await request(app)
        .get(`/workouts/${workoutId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(workoutId);
    });

    it("should forbid user from getting another user workout", async () => {
      const createResponse = await request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "User 2 Workout",
          date: "2026-01-07",
        });

      const workoutId = createResponse.body.id;

      const response = await request(app)
        .get(`/workouts/${workoutId}`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /workouts/:id", () => {
    it("should allow user to delete their own workout", async () => {
      const createResponse = await request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "To Delete",
          date: "2026-01-07",
        });

      const workoutId = createResponse.body.id;

      const response = await request(app)
        .delete(`/workouts/${workoutId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(204);
    });

    it("should forbid user from deleting another user workout", async () => {
      const createResponse = await request(app)
        .post("/workouts")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "User 2 Workout",
          date: "2026-01-07",
        });

      const workoutId = createResponse.body.id;

      const response = await request(app)
        .delete(`/workouts/${workoutId}`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
    });
  });
});
