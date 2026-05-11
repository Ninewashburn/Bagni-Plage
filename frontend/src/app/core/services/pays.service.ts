import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pays } from '../models/pays.model';
import { API_BASE_URL } from '../api-url';

@Injectable({ providedIn: 'root' })
export class PaysService {
  private readonly apiUrl = inject(API_BASE_URL);
  private http = inject(HttpClient);

  getAll(): Observable<Pays[]> {
    return this.http.get<Pays[]>(`${this.apiUrl}/pays`);
  }
}
