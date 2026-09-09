import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService, User } from './auth.service';

export interface UsersResponse {
  success: boolean;
  message: string;
  users: User[];
  count: number;
}

export interface UserResponse {
  success: boolean;
  message: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly url = `${environment.apiUrl}/users.php`;

  constructor(private auth: AuthService) {}

  private headers() {
    const token = this.auth.token();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getAll(): Observable<UsersResponse> {
    return from(axios.get<UsersResponse>(this.url, { headers: this.headers() }).then(r => r.data));
  }

  getById(id: number): Observable<UserResponse> {
    return from(axios.get<UserResponse>(`${this.url}?id=${id}`, { headers: this.headers() }).then(r => r.data));
  }

  create(data: { username: string; email: string; password: string }): Observable<UserResponse> {
    return from(axios.post<UserResponse>(this.url, data).then(r => r.data));
  }

  update(id: number, data: Partial<{ username: string; email: string; password: string; role: string; status: string }>): Observable<UserResponse> {
    return from(axios.patch<UserResponse>(`${this.url}?id=${id}`, data, { headers: this.headers() }).then(r => r.data));
  }

  replace(id: number, data: { username: string; email: string; password?: string }): Observable<UserResponse> {
    return from(axios.put<UserResponse>(`${this.url}?id=${id}`, data, { headers: this.headers() }).then(r => r.data));
  }

  delete(id: number): Observable<{ success: boolean; message: string }> {
    return from(axios.delete<{ success: boolean; message: string }>(`${this.url}?id=${id}`, { headers: this.headers() }).then(r => r.data));
  }
}
