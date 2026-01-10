import { ExerciseCategory, ExerciseDifficulty, MuscleGroup } from "./types";

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  category: ExerciseCategory;
  muscle_group?: MuscleGroup;
  difficulty?: ExerciseDifficulty;
  created_by?: number;
  created_at: string;
}

export interface CreateExerciseDTO {
  name: string;
  description?: string;
  category: ExerciseCategory;
  muscle_group?: MuscleGroup;
  difficulty?: ExerciseDifficulty;
  created_by?: number;
}

export interface UpdateExerciseDTO {
  name?: string;
  description?: string;
  category?: ExerciseCategory;
  muscle_group?: MuscleGroup;
  difficulty?: ExerciseDifficulty;
}
