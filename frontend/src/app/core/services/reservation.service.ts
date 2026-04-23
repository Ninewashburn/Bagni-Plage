import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest } from '../models/reservation.model';
import { Page } from './client.service';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  getAll(page = 0, size = 20): Observable<Page<Reservation>> {
    return this.http.get<Page<Reservation>>(`${this.apiUrl}/reservations`, {
      params: { page, size },
    });
  }

  getPending(page = 0, size = 20): Observable<Page<Reservation>> {
    return this.http.get<Page<Reservation>>(`${this.apiUrl}/reservations/pending`, {
      params: { page, size },
    });
  }

  getMy(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/my`);
  }

  create(request: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, request);
  }

  validate(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/${id}/validate`, {});
  }

  refuse(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/${id}/refuse`, {});
  }

  getPlanning(from: string, to: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/planning`, { params: { from, to } });
  }
}
