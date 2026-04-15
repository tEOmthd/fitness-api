import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { db, initDatabase } from "./utils/database";
import { UserDAO } from "./dao/userDAO";
import { RefreshTokenDAO } from "./dao/refreshTokenDAO";
import { ExerciseDAO } from "./dao/ExerciseDAO";
import { WorkoutDAO } from "./dao/WorkoutDAO";
import { WorkoutExerciseDAO } from "./dao/WorkoutExerciseDAO";

import { AuthService } from "./services/authService";

import { usersRoutes } from "./routes/users.routes";
import { authRoutes } from "./routes/auth.routes";
import { exerciseRoutes } from "./routes/exercise.routes";
import { workoutRoutes } from "./routes/workout.routes";
import { workoutExerciseRoutes } from "./routes/workoutExercise.routes";

const app = express();
app.use(express.json());

// Init DB
initDatabase();

// DAOs
const userDAO = new UserDAO(db);
const tokenDAO = new RefreshTokenDAO(db);
const exerciseDAO = new ExerciseDAO(db);
const workoutDAO = new WorkoutDAO(db);
const workoutExerciseDAO = new WorkoutExerciseDAO(db);

// Services
const authService = new AuthService(userDAO, tokenDAO);

// Routes
app.use("/auth", authRoutes(authService));
app.use("/users", usersRoutes(userDAO));
app.use("/exercises", exerciseRoutes(exerciseDAO));
app.use("/workouts", workoutRoutes(workoutDAO));
app.use(
  "/workout-exercises",
  workoutExerciseRoutes(workoutExerciseDAO, workoutDAO)
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running sur http://localhost:${PORT}`);
});
