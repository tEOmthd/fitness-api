export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  notes?: string;
  order_index: number;
}

export interface CreateWorkoutExerciseDTO {
  workout_id: number;
  exercise_id: number;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  notes?: string;
  order_index?: number;
}

export interface UpdateWorkoutExerciseDTO {
  sets?: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  notes?: string;
  order_index?: number;
}
