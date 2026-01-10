export interface Workout {
  id: number;
  user_id: number;
  name: string;
  date: string;
  duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkoutDTO {
  user_id: number;
  name: string;
  date: string;
  duration_minutes?: number;
  notes?: string;
}

export interface UpdateWorkoutDTO {
  name?: string;
  date?: string;
  duration_minutes?: number;
  notes?: string;
}
