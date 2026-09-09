import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'inactive' | 'blocked';
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
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  login(data: LoginRequest): Observable<AuthResponse> {
    return from(
      axios.post<AuthResponse>(`${this.apiUrl}/login.php`, data).then(r => {
        if (r.data.success && r.data.token && r.data.user) {
          localStorage.setItem('token', r.data.token);
          localStorage.setItem('auth_user', JSON.stringify(r.data.user));
        }
        return r.data;
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return from(
      axios.post<AuthResponse>(`${this.apiUrl}/register.php`, data).then(r => r.data)
    );
  }

  getUser(): User | null {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  }

  token(): string | null {
    return localStorage.getItem('token');
  }

  logout(): Observable<{ success: boolean; message: string }> {
    const token = this.token();
    return from(
      axios.post<{ success: boolean; message: string }>(
        `${this.apiUrl}/logout.php`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      ).catch(() => ({ data: { success: true, message: 'Logout completed locally.' } }))
       .then(r => r.data)
    );
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
  }
}
