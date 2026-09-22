import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { EmployeeRequest, RequestStatus, RequestsResponse } from '../models/hr.models';

export type { EmployeeRequest } from '../models/hr.models';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private readonly url = `${environment.apiUrl}/requests.php`;

  constructor(private auth: AuthService) {}

  private headers() {
    const token = this.auth.token();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  getAll(status = 'pending'): Observable<RequestsResponse> {
    return from(
      axios.get<RequestsResponse>(`${this.url}?status=${encodeURIComponent(status)}`, {
        headers: this.headers()
      }).then(r => r.data)
    );
  }

  updateStatus(id: number, status: Exclude<RequestStatus, 'pending'>): Observable<{ success: boolean; message: string }> {
    return from(
      axios.patch<{ success: boolean; message: string }>(
        `${this.url}?id=${id}`,
        { status },
        { headers: this.headers() }
      ).then(r => r.data)
    );
  }
}
