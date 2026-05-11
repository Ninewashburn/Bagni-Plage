import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest, Statut } from '../models/reservation.model';
import { Page } from './client.service';
import { API_BASE_URL } from '../api-url';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = inject(API_BASE_URL);
  private http = inject(HttpClient);

  getAll(page = 0, size = 20, statut?: Statut): Observable<Page<Reservation>> {
    return this.http.get<Page<Reservation>>(`${this.apiUrl}/reservations`, {
      params: statut ? { page, size, statut } : { page, size },
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

  downloadInvoice(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reservations/${id}/invoice`, {
      responseType: 'blob',
    });
  }

  validate(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/${id}/validate`, {});
  }

  refuse(id: number, motif?: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/${id}/refuse`, {
      motif: motif ?? null,
    });
  }

  getPlanning(from: string, to: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/planning`, { params: { from, to } });
  }
}
