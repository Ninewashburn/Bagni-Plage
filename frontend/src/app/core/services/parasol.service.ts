import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilePlageDetail, ParasolDetail } from '../models/parasol.model';

@Injectable({ providedIn: 'root' })
export class ParasolService {
  private readonly apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  getFiles(): Observable<FilePlageDetail[]> {
    return this.http.get<FilePlageDetail[]>(`${this.apiUrl}/parasols/files`);
  }

  getDisponibles(dateDebut: string, dateFin: string): Observable<ParasolDetail[]> {
    return this.http.get<ParasolDetail[]>(`${this.apiUrl}/parasols/disponibles`, {
      params: { dateDebut, dateFin },
    });
  }
}
