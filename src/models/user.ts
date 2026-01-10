import { UserRole } from "./types";

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  role?: UserRole;
  first_name: string;
  last_name: string;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  role?: UserRole;
  first_name?: string;
  last_name?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}
