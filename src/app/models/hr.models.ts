export type UserRole = 'admin' | 'moderator' | 'user';
export type UserStatus = 'active' | 'inactive' | 'blocked';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  preferred_name?: string | null;
  phone?: string | null;
  position?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  position?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface AuthResponse extends ApiResponse {
  token?: string;
  user?: User;
}

export interface UsersResponse extends ApiResponse {
  users: User[];
  count: number;
}

export interface UserResponse extends ApiResponse {
  user: User;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
  preferred_name?: string;
  phone?: string;
  position?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface EmployeeRequest {
  id: number;
  user_id?: number;
  username: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  message?: string | null;
  status: RequestStatus;
  created_at?: string | null;
}

export interface RequestsResponse extends ApiResponse {
  requests: EmployeeRequest[];
  count: number;
}