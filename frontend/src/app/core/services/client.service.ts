import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientUpdateRequest } from '../models/client.model';
import { LoginResponse } from '../models/auth.model';
import { API_BASE_URL } from '../api-url';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly apiUrl = inject(API_BASE_URL);
  private http = inject(HttpClient);

  getAll(page = 0, size = 20, paysId?: number): Observable<Page<Client>> {
    const params: Record<string, string | number> = { page, size };
    if (paysId) params['paysId'] = paysId;
    return this.http.get<Page<Client>>(`${this.apiUrl}/clients`, { params });
  }

  getMe(): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/me`);
  }

  update(id: number, request: ClientUpdateRequest): Observable<Client> {
    return this.http.patch<Client>(`${this.apiUrl}/clients/${id}`, request);
  }

  updateMe(request: ClientUpdateRequest): Observable<LoginResponse> {
    return this.http.patch<LoginResponse>(`${this.apiUrl}/clients/me`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`);
  }
}
