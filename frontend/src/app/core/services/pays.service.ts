import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pays } from '../models/pays.model';

@Injectable({ providedIn: 'root' })
export class PaysService {
  private readonly apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  getAll(): Observable<Pays[]> {
    return this.http.get<Pays[]>(`${this.apiUrl}/pays`);
  }
}
